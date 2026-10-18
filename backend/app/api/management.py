import uuid
import secrets
import string
import csv
import io
import re
from datetime import datetime, timezone, timedelta, date
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db.session import get_db
from app.models.models import User, Office, Tenant, FaceScanInvite, AttendanceRecord, BiometricProfile, WorkModeOverride
from app.core.security import hash_password
from app.api.deps import get_current_user, require_admin
from app.schemas.auth import UserResponse
from app.schemas.tenant import (
    TenantResponse,
    TenantTimingsUpdateRequest,
    OfficeResponse,
    OfficeCreateRequest,
    OfficeTimingsUpdateRequest,
    EmployeeCreateRequest,
    EmployeeUpdateRequest,
    EmployeeShiftUpdateRequest,
    EmployeeCreateResponse,
    TenantStatsResponse,
    EmployeeImportPreviewRow,
    EmployeeImportPreviewResponse,
    EmployeeImportCommitResponse,
    EmployeeImportCreatedItem,
    EmployeeImportSkippedItem,
)
from app.services.email_service import send_employee_welcome_email
from app.services.stripe_service import sync_subscription_seats
from app.services.timing_service import resolve_employee_shift_config

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

@router.put("/tenant/timings")
async def update_tenant_timings(
    req: TenantTimingsUpdateRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update organization default office timings, timezone, and grace period."""
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_admin.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant organization not found")

    if req.default_timezone is not None:
        tenant.default_timezone = req.default_timezone.strip()
    if req.default_work_start_time is not None:
        tenant.default_work_start_time = req.default_work_start_time.strip()
    if req.default_work_end_time is not None:
        tenant.default_work_end_time = req.default_work_end_time.strip()
    if req.default_grace_period_minutes is not None:
        tenant.default_grace_period_minutes = max(0, req.default_grace_period_minutes)

    await db.commit()
    await db.refresh(tenant)
    return {
        "status": "success",
        "message": "Organization default working hours and timezone updated",
        "tenant": {
            "default_timezone": tenant.default_timezone,
            "default_work_start_time": tenant.default_work_start_time,
            "default_work_end_time": tenant.default_work_end_time,
            "default_grace_period_minutes": tenant.default_grace_period_minutes
        }
    }

@router.get("/employees")
async def list_employees(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    List all employees scoped strictly to the current tenant.
    Includes biometric enrollment status, shift timing, and custom shift overrides.
    """
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_admin.tenant_id))
    tenant = tenant_res.scalar_one_or_none()

    res = await db.execute(
        select(User).where(User.tenant_id == current_admin.tenant_id).order_by(User.created_at.desc())
    )
    employees = res.scalars().all()

    # Get biometric status for all users in tenant (scalable join)
    bio_res = await db.execute(
        select(BiometricProfile.user_id)
        .join(User, BiometricProfile.user_id == User.id)
        .where(User.tenant_id == current_admin.tenant_id)
    )
    enrolled_user_ids = set(bio_res.scalars().all())

    # Get office map
    office_res = await db.execute(select(Office).where(Office.tenant_id == current_admin.tenant_id))
    all_offices = office_res.scalars().all()
    offices = {o.id: o.name for o in all_offices}
    offices_obj_map = {o.id: o for o in all_offices}

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
        emp_office = offices_obj_map.get(emp.office_id)
        shift_cfg = resolve_employee_shift_config(emp, emp_office, tenant)

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
            "shift_config": {
                "is_custom": shift_cfg["is_custom_shift"],
                "shift_name": shift_cfg["shift_name"],
                "work_start_time": shift_cfg["work_start_time"],
                "work_end_time": shift_cfg["work_end_time"],
                "grace_period_minutes": shift_cfg["grace_period_minutes"],
                "timezone": shift_cfg["timezone"]
            },
            "shift_name": shift_cfg["shift_name"],
            "work_start_time": shift_cfg["work_start_time"],
            "work_end_time": shift_cfg["work_end_time"],
            "grace_period_minutes": shift_cfg["grace_period_minutes"],
            "timezone": shift_cfg["timezone"],
            "is_custom_shift": shift_cfg["is_custom_shift"],
            "custom_work_start_time": emp.custom_work_start_time,
            "custom_work_end_time": emp.custom_work_end_time,
            "custom_grace_period_minutes": emp.custom_grace_period_minutes,
            "custom_timezone": emp.custom_timezone,
            "created_at": emp.created_at.isoformat() if emp.created_at else None
        })

    return output

@router.put("/employees/{employee_id}/shift")
async def update_employee_shift(
    employee_id: uuid.UUID,
    req: EmployeeShiftUpdateRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually override shift timings for an employee (e.g. Night Shift, flexible hours)
    or revert to office/company defaults.
    """
    emp_res = await db.execute(
        select(User).where(User.id == employee_id, User.tenant_id == current_admin.tenant_id)
    )
    emp = emp_res.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found in your organization")

    start_time = req.custom_work_start_time if req.custom_work_start_time is not None else req.work_start_time
    end_time = req.custom_work_end_time if req.custom_work_end_time is not None else req.work_end_time
    grace_mins = req.custom_grace_period_minutes if req.custom_grace_period_minutes is not None else req.grace_period_minutes
    tz = req.custom_timezone if req.custom_timezone is not None else req.timezone
    name = req.shift_name

    # Clear custom shift if explicitly requested or if all fields passed as None
    is_reset = req.clear_custom_shift or (
        start_time is None and end_time is None and grace_mins is None and tz is None and name is None
    )

    if is_reset:
        emp.custom_work_start_time = None
        emp.custom_work_end_time = None
        emp.custom_grace_period_minutes = None
        emp.shift_name = None
        emp.custom_timezone = None
    else:
        if start_time is not None:
            emp.custom_work_start_time = str(start_time).strip() if str(start_time).strip() else None
        if end_time is not None:
            emp.custom_work_end_time = str(end_time).strip() if str(end_time).strip() else None
        if grace_mins is not None:
            emp.custom_grace_period_minutes = max(0, int(grace_mins))
        if name is not None:
            emp.shift_name = str(name).strip() if str(name).strip() else None
        if tz is not None:
            emp.custom_timezone = str(tz).strip() if str(tz).strip() else None

    await db.commit()
    await db.refresh(emp)

    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_admin.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    office = None
    if emp.office_id:
        off_res = await db.execute(select(Office).where(Office.id == emp.office_id))
        office = off_res.scalar_one_or_none()
    shift_cfg = resolve_employee_shift_config(emp, office, tenant)

    return {
        "status": "success",
        "message": f"Shift schedule for {emp.full_name} updated successfully",
        "effective_shift": shift_cfg
    }


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
    """Add a new office with geofence radius, regional timezone, and work timings for this tenant."""
    new_office = Office(
        tenant_id=current_admin.tenant_id,
        name=req.name.strip(),
        latitude=req.latitude,
        longitude=req.longitude,
        radius_meters=req.radius_meters or 200,
        address=req.address,
        timezone=req.timezone.strip() if req.timezone else "UTC",
        work_start_time=req.work_start_time.strip() if req.work_start_time else "09:00",
        work_end_time=req.work_end_time.strip() if req.work_end_time else "18:00",
        grace_period_minutes=req.grace_period_minutes if req.grace_period_minutes is not None else 15
    )
    db.add(new_office)
    await db.commit()
    await db.refresh(new_office)
    return new_office

@router.put("/offices/{office_id}/timings", response_model=OfficeResponse)
async def update_office_timings(
    office_id: uuid.UUID,
    req: OfficeTimingsUpdateRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update regional office work hours, grace period, and timezone."""
    off_res = await db.execute(
        select(Office).where(Office.id == office_id, Office.tenant_id == current_admin.tenant_id)
    )
    office = off_res.scalar_one_or_none()
    if not office:
        raise HTTPException(status_code=404, detail="Office location not found")

    if req.timezone is not None:
        office.timezone = req.timezone.strip()
    if req.work_start_time is not None:
        office.work_start_time = req.work_start_time.strip()
    if req.work_end_time is not None:
        office.work_end_time = req.work_end_time.strip()
    if req.grace_period_minutes is not None:
        office.grace_period_minutes = max(0, req.grace_period_minutes)

    await db.commit()
    await db.refresh(office)
    return office


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


# ─── Bulk Employee CSV Import ──────────────────────────────────────────────────

CSV_TEMPLATE_HEADER = (
    "First Name,Last Name,Email,Employee Code,Department,Designation,Phone Number,Work Mode\n"
    "Sarah,Connor,sarah.connor@acme.com,EMP-1001,Engineering,Software Engineer,+1234567890,on_site\n"
    "John,Doe,john.doe@acme.com,EMP-1002,Operations,Site Coordinator,+1987654321,remote\n"
)

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def _get_field(row: Dict[str, str], aliases: List[str]) -> Optional[str]:
    for key, val in row.items():
        clean_k = re.sub(r"[^a-z0-9]", "", str(key).lower())
        for a in aliases:
            if clean_k == a:
                v = str(val).strip() if val is not None else ""
                return v if v else None
    return None


@router.get("/employees/import/template")
async def get_employee_import_template(
    current_admin: User = Depends(require_admin),
):
    """
    Downloadable blank sample CSV template for bulk employee onboarding.
    """
    return Response(
        content=CSV_TEMPLATE_HEADER,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="employee_import_template.csv"'
        },
    )


@router.post(
    "/employees/import/preview",
    response_model=EmployeeImportPreviewResponse,
)
async def preview_employee_import(
    file: Optional[UploadFile] = File(None),
    csv_file: Optional[UploadFile] = File(None, alias="csv"),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Step 2: Parses uploaded CSV and returns per-row validation and duplicate check.
    No database writes occur during preview.
    """
    upload = file or csv_file
    if not upload:
        raise HTTPException(status_code=400, detail="No CSV file provided")

    contents = await upload.read()
    try:
        decoded = contents.decode("utf-8-sig")  # Handles Excel BOM
    except Exception:
        decoded = contents.decode("latin-1", errors="ignore")

    reader = csv.DictReader(io.StringIO(decoded))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV file has no header row")

    rows = list(reader)
    if not rows:
        raise HTTPException(status_code=400, detail="CSV file contains no data rows")

    # Fetch existing emails and codes in this organization
    existing_res = await db.execute(
        select(User.email, User.employee_code).where(
            User.tenant_id == current_admin.tenant_id
        )
    )
    existing_pairs = existing_res.all()
    existing_emails = {
        p[0].lower() for p in existing_pairs if p[0]
    }
    existing_codes = {
        p[1].lower() for p in existing_pairs if p[1]
    }

    seen_batch_emails = set()
    seen_batch_codes = set()
    preview_items = []

    for idx, row in enumerate(rows):
        row_num = idx + 2
        errors = []

        first_name = _get_field(row, ["firstname", "first", "fname"])
        last_name = _get_field(row, ["lastname", "last", "lname", "surname"])
        full_name = _get_field(row, ["fullname", "name", "employeename"])

        if not full_name:
            if first_name and last_name:
                full_name = f"{first_name} {last_name}".strip()
            elif first_name:
                full_name = first_name
            elif last_name:
                full_name = last_name

        if not first_name and full_name:
            parts = full_name.split(" ", 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

        email = _get_field(row, ["email", "workemail", "emailaddress"])
        emp_code = _get_field(row, ["employeecode", "empcode", "code", "staffid", "id", "employeeid"])
        dept = _get_field(row, ["department", "dept"]) or "General"
        desig = _get_field(row, ["designation", "role", "title", "jobtitle", "position"]) or "Team Member"
        phone = _get_field(row, ["phonenumber", "phone", "mobile", "contact"])
        raw_mode = _get_field(row, ["workmode", "defaultworkmode", "mode", "locationmode"]) or "on_site"

        work_mode = "remote" if "remote" in raw_mode.lower() else "on_site"

        # Validation checks
        if not full_name:
            errors.push(f"Row {row_num}: Full Name or First Name is required") if hasattr(errors, 'push') else errors.append(f"Row {row_num}: First Name or Full Name is required")

        is_duplicate = False
        if not email:
            errors.append(f"Row {row_num}: Email address is required")
        else:
            clean_email = email.lower()
            if not EMAIL_REGEX.match(clean_email):
                errors.append(f"Row {row_num}: Invalid email format ({email})")
            elif clean_email in existing_emails:
                is_duplicate = True
                errors.append(f"Row {row_num}: Email '{email}' is already registered in your organization")
            elif clean_email in seen_batch_emails:
                is_duplicate = True
                errors.append(f"Row {row_num}: Duplicate email '{email}' appears multiple times in file")
            else:
                seen_batch_emails.add(clean_email)

        if emp_code:
            clean_code = emp_code.lower()
            if clean_code in existing_codes:
                is_duplicate = True
                errors.append(f"Row {row_num}: Employee code '{emp_code}' is already assigned in organization")
            elif clean_code in seen_batch_codes:
                is_duplicate = True
                errors.append(f"Row {row_num}: Duplicate code '{emp_code}' appears multiple times in file")
            else:
                seen_batch_codes.add(clean_code)

        preview_items.append(
            EmployeeImportPreviewRow(
                row=row_num,
                first_name=first_name,
                last_name=last_name,
                full_name=full_name,
                email=email,
                employee_code=emp_code,
                department=dept,
                designation=desig,
                phone_number=phone,
                default_work_mode=work_mode,
                is_duplicate=is_duplicate,
                errors=errors,
                valid=len(errors) == 0,
            )
        )

    valid_count = sum(1 for p in preview_items if p.valid)
    invalid_count = sum(1 for p in preview_items if not p.valid)
    duplicate_count = sum(1 for p in preview_items if p.is_duplicate)

    return EmployeeImportPreviewResponse(
        total_rows=len(preview_items),
        valid_rows=valid_count,
        invalid_rows=invalid_count,
        duplicate_rows=duplicate_count,
        preview=preview_items,
    )


@router.post(
    "/employees/import",
    response_model=EmployeeImportCommitResponse,
    status_code=status.HTTP_201_CREATED,
)
async def import_employees_csv(
    file: Optional[UploadFile] = File(None),
    csv_file: Optional[UploadFile] = File(None, alias="csv"),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Step 3: Commits valid rows to the database.
    - Creates employee User records with auto-generated secure passwords.
    - Provisions 48-hour biometric FaceScanInvite tokens.
    - Dispatches welcome onboarding emails via AWS SES.
    - Recalculates and synchronizes Stripe subscription seat counts.
    """
    upload = file or csv_file
    if not upload:
        raise HTTPException(status_code=400, detail="No CSV file provided")

    contents = await upload.read()
    try:
        decoded = contents.decode("utf-8-sig")
    except Exception:
        decoded = contents.decode("latin-1", errors="ignore")

    reader = csv.DictReader(io.StringIO(decoded))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV file has no header row")

    rows = list(reader)
    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty")

    # Fetch existing emails and codes
    existing_res = await db.execute(
        select(User.email, User.employee_code).where(
            User.tenant_id == current_admin.tenant_id
        )
    )
    existing_pairs = existing_res.all()
    existing_emails = {p[0].lower() for p in existing_pairs if p[0]}
    existing_codes = {p[1].lower() for p in existing_pairs if p[1]}

    # Office lookup for on_site assignment
    first_office_res = await db.execute(
        select(Office).where(Office.tenant_id == current_admin.tenant_id).limit(1)
    )
    default_office = first_office_res.scalar_one_or_none()
    default_office_id = default_office.id if default_office else None

    # Fetch tenant for company name & Stripe sync
    tenant_res = await db.execute(
        select(Tenant).where(Tenant.id == current_admin.tenant_id)
    )
    tenant = tenant_res.scalar_one_or_none()
    company_name = tenant.name if tenant else "Attendance Platform"

    created_records = []
    skipped_records = []

    for idx, row in enumerate(rows):
        row_num = idx + 2

        first_name = _get_field(row, ["firstname", "first", "fname"])
        last_name = _get_field(row, ["lastname", "last", "lname", "surname"])
        full_name = _get_field(row, ["fullname", "name", "employeename"])

        if not full_name:
            if first_name and last_name:
                full_name = f"{first_name} {last_name}".strip()
            elif first_name:
                full_name = first_name
            elif last_name:
                full_name = last_name

        if not first_name and full_name:
            parts = full_name.split(" ", 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

        email = _get_field(row, ["email", "workemail", "emailaddress"])
        emp_code = _get_field(row, ["employeecode", "empcode", "code", "staffid", "id", "employeeid"])
        dept = _get_field(row, ["department", "dept"]) or "General"
        desig = _get_field(row, ["designation", "role", "title", "jobtitle", "position"]) or "Team Member"
        phone = _get_field(row, ["phonenumber", "phone", "mobile", "contact"])
        raw_mode = _get_field(row, ["workmode", "defaultworkmode", "mode", "locationmode"]) or "on_site"
        work_mode = "remote" if "remote" in raw_mode.lower() else "on_site"

        # Validate
        if not full_name:
            skipped_records.append(
                EmployeeImportSkippedItem(
                    row=row_num,
                    email=email,
                    name=full_name,
                    reason="First Name or Full Name is required",
                )
            )
            continue

        if not email or not EMAIL_REGEX.match(email.lower()):
            skipped_records.append(
                EmployeeImportSkippedItem(
                    row=row_num,
                    email=email,
                    name=full_name,
                    reason=f"Invalid or missing email address: '{email}'",
                )
            )
            continue

        clean_email = email.lower()
        if clean_email in existing_emails:
            skipped_records.append(
                EmployeeImportSkippedItem(
                    row=row_num,
                    email=email,
                    name=full_name,
                    reason=f"Email '{email}' already registered in organization",
                )
            )
            continue

        # Employee Code assignment
        if not emp_code:
            while True:
                candidate = f"EMP-{secrets.randbelow(9000) + 1000}"
                if candidate.lower() not in existing_codes:
                    emp_code = candidate
                    break
        elif emp_code.lower() in existing_codes:
            skipped_records.append(
                EmployeeImportSkippedItem(
                    row=row_num,
                    email=email,
                    name=full_name,
                    reason=f"Employee code '{emp_code}' already exists",
                )
            )
            continue

        temp_password = generate_secure_password(12)
        office_id = default_office_id if work_mode == "on_site" else None

        try:
            new_user = User(
                tenant_id=current_admin.tenant_id,
                email=clean_email,
                password_hash=hash_password(temp_password),
                full_name=full_name,
                first_name=first_name,
                last_name=last_name,
                department=dept,
                designation=desig,
                phone_number=phone,
                employee_code=emp_code,
                role="employee",
                default_work_mode=work_mode,
                office_id=office_id,
                is_active=True,
            )
            db.add(new_user)
            await db.flush()

            # Create 48-hour biometric enrollment token
            invite_token = f"inv_{secrets.token_urlsafe(24)}"
            now_utc = datetime.now(timezone.utc)
            face_invite = FaceScanInvite(
                tenant_id=current_admin.tenant_id,
                user_id=new_user.id,
                invite_token=invite_token,
                expires_at=now_utc + timedelta(hours=48),
            )
            db.add(face_invite)

            # Prevent intra-batch duplicates
            existing_emails.add(clean_email)
            existing_codes.add(emp_code.lower())

            # Dispatch Welcome Email
            try:
                await send_employee_welcome_email(
                    to_email=clean_email,
                    employee_name=full_name,
                    employee_code=emp_code,
                    temporary_password=temp_password,
                    company_name=company_name,
                    invite_token=invite_token,
                )
            except Exception:
                pass

            created_records.append(
                EmployeeImportCreatedItem(
                    row=row_num,
                    id=new_user.id,
                    employee_code=emp_code,
                    email=clean_email,
                    full_name=full_name,
                    temporary_password=temp_password,
                )
            )
        except Exception as e:
            skipped_records.append(
                EmployeeImportSkippedItem(
                    row=row_num,
                    email=email,
                    name=full_name,
                    reason=f"Database error: {str(e)}",
                )
            )

    await db.commit()

    # Sync Stripe seats if tenant has active subscription
    if tenant and tenant.stripe_subscription_id:
        try:
            await sync_subscription_seats(tenant, db)
        except Exception:
            pass

    return EmployeeImportCommitResponse(
        total_rows=len(rows),
        created=len(created_records),
        skipped=len(skipped_records),
        created_records=created_records,
        skipped_records=skipped_records,
    )



