import uuid
from datetime import date, datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_db
from app.models.models import User, AttendanceRecord, UserDevice, Leave, AttendanceRequest, Office
from app.api.deps import get_current_user, require_admin
from app.services.geo_engine import is_within_geofence
from app.services.work_mode_service import resolve_effective_work_mode
from app.services.attendance_service import verify_probe_face
from app.schemas.attendance import (
    AttendanceCheckInResponse,
    AttendanceRecordItem,
    AttendanceTodayStatus,
    AttendanceRegularizationCreate,
    AttendanceRegularizationReview,
    AttendanceRegularizationResponse,
    TimesheetItemResponse
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/check-in", response_model=AttendanceCheckInResponse)
async def mark_attendance_check_in(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    device_id: Optional[str] = Form(None),
    is_mocked: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Anti-Cheat: Reject simulated/mocked GPS
    if is_mocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Mock GPS coordinates detected. Attendance verification rejected."
        )

    today = date.today()
    now_utc = datetime.now(timezone.utc)

    # 2. Check if already marked attendance today
    existing_res = await db.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.user_id == current_user.id,
            AttendanceRecord.date == today
        )
    )
    existing_rec = existing_res.scalar_one_or_none()
    if existing_rec:
        return AttendanceCheckInResponse(
            id=existing_rec.id,
            user_id=existing_rec.user_id,
            date=existing_rec.date,
            check_in_time=existing_rec.check_in_time,
            check_out_time=existing_rec.check_out_time,
            status=existing_rec.status,
            verification_type=existing_rec.verification_type,
            similarity_score=existing_rec.similarity_score,
            liveness_score=existing_rec.liveness_score,
            distance_from_office_meters=existing_rec.distance_from_office_meters,
            message="Already checked in for today."
        )

    # 3. Resolve Work Mode for Today (Calendar overrides take precedence)
    eff_mode, override_reason, office = await resolve_effective_work_mode(db, current_user.id, today)

    distance_to_office: Optional[float] = None
    verification_type = "face_remote"

    if eff_mode == "on_site":
        verification_type = "face_geo"
        if office:
            within_bounds, distance_to_office = is_within_geofence(
                latitude,
                longitude,
                office.latitude,
                office.longitude,
                office.radius_meters
            )
            if not within_bounds:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Out of office bounds ({distance_to_office:.1f}m away). Must be within {office.radius_meters}m of {office.name}."
                )
        else:
            # Multi-office organization: check if employee is at ANY of the company's offices
            off_res = await db.execute(
                select(Office).where(Office.tenant_id == current_user.tenant_id)
            )
            all_offices = off_res.scalars().all()
            if all_offices:
                min_distance = float('inf')
                closest_office = all_offices[0]
                matched_office = None
                for off in all_offices:
                    within, dist = is_within_geofence(latitude, longitude, off.latitude, off.longitude, off.radius_meters)
                    if within:
                        matched_office = off
                        distance_to_office = dist
                        break
                    if dist < min_distance:
                        min_distance = dist
                        closest_office = off

                if not matched_office:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Out of bounds ({min_distance:.1f}m away from closest office {closest_office.name})."
                    )

    # 4. Probe Face Verification & pgvector Matching
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty camera snapshot data received")

    is_match, similarity_score, liveness_score, verify_msg = await verify_probe_face(
        db,
        current_user.id,
        image_bytes
    )

    if not is_match:
        if "Liveness check failed" in verify_msg:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=verify_msg)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=verify_msg)

    # 5. Link Device hardware record if provided
    device_uuid = None
    if device_id:
        dev_res = await db.execute(
            select(UserDevice.id).where(
                UserDevice.user_id == current_user.id,
                UserDevice.device_id == device_id
            )
        )
        device_uuid = dev_res.scalar_one_or_none()

    # 6. Create Attendance Record
    new_record = AttendanceRecord(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        date=today,
        check_in_time=now_utc,
        verification_type=verification_type,
        status="present",
        similarity_score=similarity_score,
        liveness_score=liveness_score,
        device_id=device_uuid,
        check_in_latitude=latitude,
        check_in_longitude=longitude,
        distance_from_office_meters=distance_to_office
    )
    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)

    return AttendanceCheckInResponse(
        id=new_record.id,
        user_id=new_record.user_id,
        date=new_record.date,
        check_in_time=new_record.check_in_time,
        check_out_time=new_record.check_out_time,
        status=new_record.status,
        verification_type=new_record.verification_type,
        similarity_score=new_record.similarity_score,
        liveness_score=new_record.liveness_score,
        distance_from_office_meters=new_record.distance_from_office_meters,
        message=f"Attendance check-in marked successfully! ({verification_type}, similarity: {similarity_score:.1%})"
    )

@router.post("/check-out", response_model=AttendanceCheckInResponse)
async def mark_attendance_check_out(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    rec_res = await db.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.user_id == current_user.id,
            AttendanceRecord.date == today
        )
    )
    record = rec_res.scalar_one_or_none()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot check out without checking in first today."
        )

    now_utc = datetime.now(timezone.utc)
    record.check_out_time = now_utc
    await db.commit()
    await db.refresh(record)

    return AttendanceCheckInResponse(
        id=record.id,
        user_id=record.user_id,
        date=record.date,
        check_in_time=record.check_in_time,
        check_out_time=record.check_out_time,
        status=record.status,
        verification_type=record.verification_type,
        similarity_score=record.similarity_score,
        liveness_score=record.liveness_score,
        distance_from_office_meters=record.distance_from_office_meters,
        message="Checked out successfully!"
    )

@router.get("/today/{user_id}", response_model=AttendanceTodayStatus)
async def get_today_attendance_status(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    today = date.today()
    rec_res = await db.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.user_id == user_id,
            AttendanceRecord.date == today
        )
    )
    record = rec_res.scalar_one_or_none()

    # Check for approved leave covering today
    leave_res = await db.execute(
        select(Leave).where(
            Leave.user_id == user_id,
            Leave.status == "approved",
            Leave.start_date <= today,
            Leave.end_date >= today
        )
    )
    approved_leave = leave_res.scalar_one_or_none()

    if not record:
        return AttendanceTodayStatus(
            has_checked_in=False,
            has_checked_out=False,
            record=None,
            is_on_leave=approved_leave is not None,
            leave_status="approved" if approved_leave else None,
            leave_reason=approved_leave.reason if approved_leave else None
        )

    return AttendanceTodayStatus(
        has_checked_in=True,
        has_checked_out=record.check_out_time is not None,
        record=AttendanceRecordItem.model_validate(record),
        is_on_leave=approved_leave is not None,
        leave_status="approved" if approved_leave else None,
        leave_reason=approved_leave.reason if approved_leave else None
    )

@router.get("/history/{user_id}", response_model=List[AttendanceRecordItem])
async def get_attendance_history(
    user_id: uuid.UUID,
    limit: int = 30,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AttendanceRecord)
        .where(AttendanceRecord.user_id == user_id)
        .order_by(desc(AttendanceRecord.date))
        .limit(limit)
    )
    records = res.scalars().all()
    return [AttendanceRecordItem.model_validate(r) for r in records]

def _parse_time_dt(target_date: date, time_val: str) -> datetime:
    if "T" in time_val:
        dt = datetime.fromisoformat(time_val.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    parts = time_val.strip().split(":")
    h = int(parts[0])
    m = int(parts[1]) if len(parts) > 1 else 0
    s = int(parts[2]) if len(parts) > 2 else 0
    return datetime(target_date.year, target_date.month, target_date.day, h, m, s, tzinfo=timezone.utc)

@router.post("/regularize", response_model=AttendanceRegularizationResponse, status_code=status.HTTP_201_CREATED)
async def request_attendance_regularization(
    req: AttendanceRegularizationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a missed attendance regularization request.
    Employees can submit for themselves; Managers/Admins can submit for any employee in tenant.
    """
    target_user_id = current_user.id
    target_user = current_user
    if req.user_id and current_user.role in ["admin", "manager", "super_admin"]:
        user_res = await db.execute(
            select(User).where(User.id == req.user_id, User.tenant_id == current_user.tenant_id)
        )
        found = user_res.scalar_one_or_none()
        if found:
            target_user_id = found.id
            target_user = found

    check_in_dt = _parse_time_dt(req.date, req.check_in_time)
    check_out_dt = _parse_time_dt(req.date, req.check_out_time) if req.check_out_time else None

    new_req = AttendanceRequest(
        tenant_id=current_user.tenant_id,
        user_id=target_user_id,
        date=req.date,
        check_in_time=check_in_dt,
        check_out_time=check_out_dt,
        reason=req.reason.strip(),
        status="pending"
    )
    db.add(new_req)
    await db.commit()
    await db.refresh(new_req)

    return AttendanceRegularizationResponse(
        id=new_req.id,
        tenant_id=new_req.tenant_id,
        user_id=new_req.user_id,
        employee_name=target_user.full_name,
        employee_code=target_user.employee_code,
        date=new_req.date,
        check_in_time=new_req.check_in_time,
        check_out_time=new_req.check_out_time,
        reason=new_req.reason,
        status=new_req.status,
        reviewed_by=new_req.reviewed_by,
        reviewer_note=new_req.reviewer_note,
        created_at=new_req.created_at
    )

@router.get("/my-regularization-requests", response_model=List[AttendanceRegularizationResponse])
async def list_my_regularization_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AttendanceRequest)
        .where(AttendanceRequest.user_id == current_user.id)
        .order_by(desc(AttendanceRequest.created_at))
    )
    requests = res.scalars().all()
    return [
        AttendanceRegularizationResponse(
            id=r.id,
            tenant_id=r.tenant_id,
            user_id=r.user_id,
            employee_name=current_user.full_name,
            employee_code=current_user.employee_code,
            date=r.date,
            check_in_time=r.check_in_time,
            check_out_time=r.check_out_time,
            reason=r.reason,
            status=r.status,
            reviewed_by=r.reviewed_by,
            reviewer_note=r.reviewer_note,
            created_at=r.created_at
        )
        for r in requests
    ]

@router.get("/tenant-regularization-requests", response_model=List[AttendanceRegularizationResponse])
async def list_tenant_regularization_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["admin", "manager", "super_admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Management access required")

    stmt = (
        select(AttendanceRequest, User)
        .join(User, AttendanceRequest.user_id == User.id)
        .where(AttendanceRequest.tenant_id == current_user.tenant_id)
        .order_by(desc(AttendanceRequest.created_at))
    )
    res = await db.execute(stmt)
    rows = res.all()

    return [
        AttendanceRegularizationResponse(
            id=req_item.id,
            tenant_id=req_item.tenant_id,
            user_id=req_item.user_id,
            employee_name=user_item.full_name,
            employee_code=user_item.employee_code,
            date=req_item.date,
            check_in_time=req_item.check_in_time,
            check_out_time=req_item.check_out_time,
            reason=req_item.reason,
            status=req_item.status,
            reviewed_by=req_item.reviewed_by,
            reviewer_note=req_item.reviewer_note,
            created_at=req_item.created_at
        )
        for req_item, user_item in rows
    ]

@router.post("/regularization-requests/{request_id}/review", response_model=AttendanceRegularizationResponse)
async def review_regularization_request(
    request_id: uuid.UUID,
    review_data: AttendanceRegularizationReview,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["admin", "manager", "super_admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Management access required")

    res = await db.execute(
        select(AttendanceRequest, User)
        .join(User, AttendanceRequest.user_id == User.id)
        .where(
            AttendanceRequest.id == request_id,
            AttendanceRequest.tenant_id == current_user.tenant_id
        )
    )
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Regularization request not found")

    req_item, user_item = row
    normalized_status = review_data.status.strip().lower()
    if normalized_status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")

    req_item.status = normalized_status
    req_item.reviewed_by = current_user.id
    req_item.reviewed_at = datetime.now(timezone.utc)
    if review_data.reviewer_note:
        req_item.reviewer_note = review_data.reviewer_note.strip()

    # If approved, insert or update attendance record
    if normalized_status == "approved":
        existing_res = await db.execute(
            select(AttendanceRecord).where(
                AttendanceRecord.user_id == req_item.user_id,
                AttendanceRecord.date == req_item.date
            )
        )
        rec = existing_res.scalar_one_or_none()
        if rec:
            rec.check_in_time = req_item.check_in_time
            rec.check_out_time = req_item.check_out_time
            rec.status = "present"
            rec.verification_type = "regularized"
            rec.similarity_score = 1.0
            rec.liveness_score = 1.0
        else:
            rec = AttendanceRecord(
                tenant_id=req_item.tenant_id,
                user_id=req_item.user_id,
                date=req_item.date,
                check_in_time=req_item.check_in_time,
                check_out_time=req_item.check_out_time,
                verification_type="regularized",
                status="present",
                similarity_score=1.0,
                liveness_score=1.0
            )
            db.add(rec)

    await db.commit()
    await db.refresh(req_item)

    return AttendanceRegularizationResponse(
        id=req_item.id,
        tenant_id=req_item.tenant_id,
        user_id=req_item.user_id,
        employee_name=user_item.full_name,
        employee_code=user_item.employee_code,
        date=req_item.date,
        check_in_time=req_item.check_in_time,
        check_out_time=req_item.check_out_time,
        reason=req_item.reason,
        status=req_item.status,
        reviewed_by=req_item.reviewed_by,
        reviewer_note=req_item.reviewer_note,
        created_at=req_item.created_at
    )

@router.get("/timesheets", response_model=List[TimesheetItemResponse])
async def get_timesheets(
    current_user: User = Depends(get_current_user),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    employee_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get organization timesheets.
    Administrators and managers view entire tenant timesheet; employees view their own.
    """
    stmt = (
        select(AttendanceRecord, User, Office)
        .join(User, AttendanceRecord.user_id == User.id)
        .outerjoin(Office, User.office_id == Office.id)
        .where(AttendanceRecord.tenant_id == current_user.tenant_id)
        .order_by(desc(AttendanceRecord.date), desc(AttendanceRecord.check_in_time))
    )

    if current_user.role not in ["admin", "manager", "super_admin"]:
        stmt = stmt.where(AttendanceRecord.user_id == current_user.id)
    elif employee_id:
        stmt = stmt.where(AttendanceRecord.user_id == employee_id)

    if date_from:
        stmt = stmt.where(AttendanceRecord.date >= date_from)
    if date_to:
        stmt = stmt.where(AttendanceRecord.date <= date_to)

    res = await db.execute(stmt)
    rows = res.all()

    output = []
    for rec, usr, off in rows:
        duration = None
        if rec.check_out_time and rec.check_in_time:
            delta = (rec.check_out_time - rec.check_in_time).total_seconds()
            duration = round(delta / 3600.0, 2)

        output.append(
            TimesheetItemResponse(
                id=rec.id,
                user_id=usr.id,
                employee_name=usr.full_name,
                employee_code=usr.employee_code,
                date=rec.date,
                check_in_time=rec.check_in_time,
                check_out_time=rec.check_out_time,
                duration_hours=duration,
                status=rec.status,
                verification_type=rec.verification_type,
                similarity_score=rec.similarity_score,
                distance_from_office_meters=rec.distance_from_office_meters,
                office_name=off.name if off else "Headquarters"
            )
        )
    return output

