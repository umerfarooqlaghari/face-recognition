import uuid
import secrets
import string
from datetime import datetime, timezone, timedelta, date
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db.session import get_db
from app.models.models import User, Office, Tenant, FaceScanInvite, AttendanceRecord, BiometricProfile, WorkModeOverride
from app.core.security import hash_password
from app.api.deps import get_current_user, require_admin
from app.schemas.auth import UserResponse
from app.schemas.tenant import (
    TenantResponse,
    OfficeResponse,
    OfficeCreateRequest,
    EmployeeCreateRequest,
    EmployeeUpdateRequest,
    EmployeeCreateResponse,
    TenantStatsResponse
)
from app.services.email_service import send_employee_welcome_email
from app.services.stripe_service import sync_subscription_seats

router = APIRouter(prefix="/management", tags=["Multi-Tenant Management"])

def generate_secure_password(length: int = 12) -> str:
    """Generate a high-entropy temporary password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%&*"
    # Ensure at least one upper, one lower, one digit, one special
    pwd = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice("!@#$%&*")
    ]
    pwd += [secrets.choice(alphabet) for _ in range(length - 4)]
    secrets.SystemRandom().shuffle(pwd)
    return "".join(pwd)

@router.get("/tenant", response_model=TenantStatsResponse)
async def get_tenant_dashboard(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get tenant overview and statistical breakdown for executive management.
    Data is isolated strictly to the authenticated administrator's tenant.
    """
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_admin.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant organization not found")

    # Total employees in tenant
    emp_res = await db.execute(
        select(User).where(User.tenant_id == current_admin.tenant_id, User.is_active == True)
    )
    all_employees = emp_res.scalars().all()
    total_employees = len(all_employees)

    on_site_count = sum(1 for e in all_employees if e.default_work_mode == "on_site")
    remote_count = sum(1 for e in all_employees if e.default_work_mode == "remote")

    # Today's check-ins
    today = date.today()
    checkin_res = await db.execute(
        select(func.count(AttendanceRecord.id)).where(
            AttendanceRecord.tenant_id == current_admin.tenant_id,
            AttendanceRecord.date == today
        )
    )
    today_checkins = checkin_res.scalar() or 0
    attendance_rate = (today_checkins / total_employees * 100) if total_employees > 0 else 0.0

    return TenantStatsResponse(
        tenant=TenantResponse.model_validate(tenant),
        admin_user=UserResponse.model_validate(current_admin),
        total_employees=total_employees,
        on_site_employees=on_site_count,
        remote_employees=remote_count,
        today_checkins=today_checkins,
        attendance_rate=round(attendance_rate, 1)
    )

@router.get("/employees")
async def list_employees(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    List all employees scoped strictly to the current tenant.
    Includes biometric enrollment status.
    """
    res = await db.execute(
        select(User).where(User.tenant_id == current_admin.tenant_id).order_by(User.created_at.desc())
    )
    employees = res.scalars().all()

    # Get biometric status for all users in tenant
    user_ids = [e.id for e in employees]
    bio_res = await db.execute(
        select(BiometricProfile.user_id).where(BiometricProfile.user_id.in_(user_ids))
    )
    enrolled_user_ids = set(bio_res.scalars().all())

    # Get office map
    office_res = await db.execute(select(Office).where(Office.tenant_id == current_admin.tenant_id))
    offices = {o.id: o.name for o in office_res.scalars().all()}

    # Get active/upcoming overrides
    today = date.today()
    overrides_res = await db.execute(
        select(WorkModeOverride).where(
            WorkModeOverride.tenant_id == current_admin.tenant_id,
            WorkModeOverride.effective_date >= today
        )
    )
    overrides_map = {
        ov.user_id: f"{ov.assigned_mode.upper()} on {ov.effective_date}"
        for ov in overrides_res.scalars().all()
    }

    managers_map = {emp.id: emp.full_name for emp in employees}

    output = []
    for emp in employees:
        output.append({
            "id": str(emp.id),
            "tenant_id": str(emp.tenant_id),
            "email": emp.email,
            "full_name": emp.full_name,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "department": emp.department or "General",
            "designation": emp.designation or "Team Member",
            "phone_number": emp.phone_number,
            "employee_code": emp.employee_code,
            "role": emp.role,
            "default_work_mode": emp.default_work_mode,
            "office_id": str(emp.office_id) if emp.office_id else None,
            "office_name": offices.get(emp.office_id, "Remote / Unassigned") if emp.default_work_mode == "on_site" else "Remote (No Office)",
            "manager_id": str(emp.manager_id) if emp.manager_id else None,
            "manager_name": managers_map.get(emp.manager_id, "Direct to Admin") if emp.manager_id else None,
            "is_active": emp.is_active,
            "face_enrolled": emp.id in enrolled_user_ids,
            "date_override": overrides_map.get(emp.id),
            "created_at": emp.created_at.isoformat() if emp.created_at else None
        })

    return output

@router.post("/employees", response_model=EmployeeCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    req: EmployeeCreateRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Management creates an Employee:
    1. Tenant isolation check: checks uniqueness within this tenant.
    2. Secure auto-generated password is created.
    3. Employee account is stored with tenant_id.
    4. 48-hour biometric enrollment token is generated.
    5. AWS SES welcome email with credentials is dispatched.
    """
    clean_email = req.email.strip().lower()

    # Tenant-scoped uniqueness check for email
    existing_email = await db.execute(
        select(User).where(User.tenant_id == current_admin.tenant_id, User.email == clean_email)
    )
    if existing_email.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Employee with this email already exists in your organization")

    # Employee Code generation or validation
    emp_code = req.employee_code.strip() if req.employee_code else None
    if not emp_code:
        # Auto-generate unique code e.g. EMP-7291
        while True:
            candidate = f"EMP-{secrets.randbelow(9000) + 1000}"
            check = await db.execute(
                select(User).where(User.tenant_id == current_admin.tenant_id, User.employee_code == candidate)
            )
            if not check.scalar_one_or_none():
                emp_code = candidate
                break
    else:
        existing_code = await db.execute(
            select(User).where(User.tenant_id == current_admin.tenant_id, User.employee_code == emp_code)
        )
        if existing_code.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Employee code already in use in your organization")

    # Auto-generate secure password
    temp_password = generate_secure_password(12)

    work_mode = req.default_work_mode or "on_site"
    office_id = req.office_id

    # Single location or Remote enforcement:
    if work_mode == "remote":
        office_id = None
    elif work_mode == "on_site":
        if not office_id:
            first_office = await db.execute(
                select(Office).where(Office.tenant_id == current_admin.tenant_id).limit(1)
            )
            found_office = first_office.scalar_one_or_none()
            if found_office:
                office_id = found_office.id
            else:
                raise HTTPException(status_code=400, detail="Cannot assign on-site mode without an existing office campus. Please create an office location first.")

    # Name resolution
    first_name = (req.first_name or "").strip()
    last_name = (req.last_name or "").strip()
    full_name = (req.full_name or "").strip()
    if not full_name:
        full_name = f"{first_name} {last_name}".strip() or clean_email.split("@")[0]
    if not first_name and full_name:
        parts = full_name.split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

    # Create User
    new_user = User(
        tenant_id=current_admin.tenant_id,
        email=clean_email,
        password_hash=hash_password(temp_password),
        full_name=full_name,
        first_name=first_name,
        last_name=last_name,
        department=req.department.strip() if req.department else "General",
        designation=req.designation.strip() if req.designation else "Team Member",
        phone_number=req.phone_number.strip() if req.phone_number else None,
        employee_code=emp_code,
        role=req.role or "employee",
        default_work_mode=work_mode,
        office_id=office_id,
        manager_id=req.manager_id,
        is_active=True
    )
    db.add(new_user)
    await db.flush()

    # Generate 48-Hour Face Scan Invite Token
    invite_token = f"inv_{secrets.token_urlsafe(24)}"
    now_utc = datetime.now(timezone.utc)
    expires_at = now_utc + timedelta(hours=48)

    face_invite = FaceScanInvite(
        tenant_id=current_admin.tenant_id,
        user_id=new_user.id,
        invite_token=invite_token,
        expires_at=expires_at
    )
    db.add(face_invite)
    await db.commit()
    await db.refresh(new_user)

    # Get Tenant Name & Sync Subscription Seats
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_admin.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    company_name = tenant.name if tenant else "Attendance Platform"

    if tenant and tenant.stripe_subscription_id:
        try:
            await sync_subscription_seats(tenant, db)
        except Exception:
            pass

    # Dispatch Welcome Email via AWS SES
    email_dispatch = await send_employee_welcome_email(
        to_email=new_user.email,
        employee_name=new_user.full_name,
        employee_code=new_user.employee_code,
        temporary_password=temp_password,
        company_name=company_name,
        invite_token=invite_token
    )

    return EmployeeCreateResponse(
        user=UserResponse.model_validate(new_user),
        auto_generated_password=temp_password,
        invite_token=invite_token,
        email_dispatch=email_dispatch
    )

@router.post("/employees/{employee_id}/resend-invite")
async def resend_employee_invite(
    employee_id: uuid.UUID,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Regenerates a face scan invite token and sends credentials reminder via AWS SES.
    """
    res = await db.execute(
        select(User).where(User.id == employee_id, User.tenant_id == current_admin.tenant_id)
    )
    employee = res.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found in your organization")

    # Generate new temporary password
    new_temp_pwd = generate_secure_password(12)
    employee.password_hash = hash_password(new_temp_pwd)

    # New invite token
    invite_token = f"inv_{secrets.token_urlsafe(24)}"
    now_utc = datetime.now(timezone.utc)
    face_invite = FaceScanInvite(
        tenant_id=current_admin.tenant_id,
        user_id=employee.id,
        invite_token=invite_token,
        expires_at=now_utc + timedelta(hours=48)
    )
    db.add(face_invite)
    await db.commit()

    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_admin.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    company_name = tenant.name if tenant else "Attendance Platform"

    dispatch = await send_employee_welcome_email(
        to_email=employee.email,
        employee_name=employee.full_name,
        employee_code=employee.employee_code,
        temporary_password=new_temp_pwd,
        company_name=company_name,
        invite_token=invite_token
    )

    return {
        "status": "success",
        "temporary_password": new_temp_pwd,
        "invite_token": invite_token,
        "email_dispatch": dispatch
    }

@router.get("/offices", response_model=List[OfficeResponse])
async def list_offices(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all corporate locations / geofences for this tenant."""
    res = await db.execute(
        select(Office).where(Office.tenant_id == current_admin.tenant_id).order_by(Office.created_at.desc())
    )
    return res.scalars().all()

@router.post("/offices", response_model=OfficeResponse, status_code=status.HTTP_201_CREATED)
async def create_office(
    req: OfficeCreateRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Add a new office with geofence radius for this tenant."""
    new_office = Office(
        tenant_id=current_admin.tenant_id,
        name=req.name.strip(),
        latitude=req.latitude,
        longitude=req.longitude,
        radius_meters=req.radius_meters or 200,
        address=req.address
    )
    db.add(new_office)
    await db.commit()
    await db.refresh(new_office)
    return new_office

@router.get("/attendance/today")
async def get_tenant_today_attendance(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Live tenant attendance feed for the current day.
    Includes verification confidence, liveness, and distance.
    """
    today = date.today()
    res = await db.execute(
        select(AttendanceRecord, User)
        .join(User, AttendanceRecord.user_id == User.id)
        .where(
            AttendanceRecord.tenant_id == current_admin.tenant_id,
            AttendanceRecord.date == today
        )
        .order_by(AttendanceRecord.check_in_time.desc())
    )
    records = res.all()

    output = []
    for att, user in records:
        output.append({
            "id": str(att.id),
            "user_id": str(user.id),
            "employee_name": user.full_name,
            "employee_code": user.employee_code,
            "check_in_time": att.check_in_time.isoformat() if att.check_in_time else None,
            "check_out_time": att.check_out_time.isoformat() if att.check_out_time else None,
            "verification_type": att.verification_type,
            "similarity_score": round(att.similarity_score * 100, 1),
            "liveness_score": round(att.liveness_score * 100, 1),
            "distance_meters": round(att.distance_from_office_meters, 1) if att.distance_from_office_meters is not None else None,
            "status": att.status,
            "snapshot_url": att.snapshot_url
        })
    return output

@router.delete("/employees/{employee_id}")
async def delete_employee(
    employee_id: uuid.UUID,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Delete an employee and cascade their records within this tenant."""
    if employee_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own administrator account")
    res = await db.execute(
        select(User).where(User.id == employee_id, User.tenant_id == current_admin.tenant_id)
    )
    emp = res.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    await db.delete(emp)
    await db.commit()

    # Sync seats with Stripe subscription
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_admin.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    if tenant and tenant.stripe_subscription_id:
        try:
            await sync_subscription_seats(tenant, db)
        except Exception:
            pass

    return {"status": "success", "message": f"Employee {emp.full_name} deleted successfully"}

@router.put("/employees/{employee_id}")
async def update_employee(
    employee_id: uuid.UUID,
    req: EmployeeUpdateRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update employee metadata such as assigned manager, office, work mode, and role."""
    res = await db.execute(
        select(User).where(User.id == employee_id, User.tenant_id == current_admin.tenant_id)
    )
    emp = res.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    if req.first_name is not None:
        emp.first_name = req.first_name.strip()
    if req.last_name is not None:
        emp.last_name = req.last_name.strip()
    if req.department is not None:
        emp.department = req.department.strip()
    if req.designation is not None:
        emp.designation = req.designation.strip()
    if req.phone_number is not None:
        emp.phone_number = req.phone_number.strip()
    if req.full_name is not None:
        emp.full_name = req.full_name.strip()
    elif req.first_name is not None or req.last_name is not None:
        emp.full_name = f"{emp.first_name or ''} {emp.last_name or ''}".strip()

    # Self-demotion protection: prevent super_admin from accidentally demoting themselves to employee
    if req.role is not None:
        if emp.id == current_admin.id and emp.role == "super_admin" and req.role != "super_admin":
            # preserve super_admin role
            pass
        else:
            emp.role = req.role

    if req.default_work_mode is not None:
        emp.default_work_mode = req.default_work_mode
        if emp.default_work_mode == "remote":
            emp.office_id = None

    if "office_id" in req.model_fields_set:
        if emp.default_work_mode == "remote":
            emp.office_id = None
        else:
            emp.office_id = req.office_id

    if "manager_id" in req.model_fields_set:
        if req.manager_id == emp.id:
            raise HTTPException(status_code=400, detail="An employee cannot be their own manager")
        emp.manager_id = req.manager_id
    if req.is_active is not None:
        emp.is_active = req.is_active

    await db.commit()
    await db.refresh(emp)
    return {
        "status": "success",
        "message": f"Employee {emp.full_name} updated successfully",
        "user": {
            "id": str(emp.id),
            "full_name": emp.full_name,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "department": emp.department,
            "designation": emp.designation,
            "phone_number": emp.phone_number,
            "role": emp.role,
            "office_id": str(emp.office_id) if emp.office_id else None,
            "manager_id": str(emp.manager_id) if emp.manager_id else None,
            "default_work_mode": emp.default_work_mode
        }
    }


