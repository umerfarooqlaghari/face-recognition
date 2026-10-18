import uuid
import calendar
from datetime import date, datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_db
from app.models.models import User, AttendanceRecord, UserDevice, Leave, AttendanceRequest, Office, Tenant
from app.api.deps import get_current_user, require_admin
from app.services.geo_engine import is_within_geofence
from app.services.work_mode_service import resolve_effective_work_mode
from app.services.attendance_service import verify_probe_face
from app.services.timing_service import (
    resolve_employee_shift_config,
    calculate_lateness,
    format_time_local,
    format_hours_worked,
    get_safe_zoneinfo
)
from app.services.email_service import (
    send_late_employee_email,
    send_late_digest_email
)
from app.schemas.attendance import (
    AttendanceCheckInResponse,
    AttendanceRecordItem,
    AttendanceTodayStatus,
    AttendanceCalendarResponse,
    CalendarDayItem,
    AttendanceCalendarSummary,
    LateDigestRequest,
    LateDigestResponse,
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
            is_late=existing_rec.is_late,
            minutes_late=existing_rec.minutes_late,
            hours_worked=existing_rec.hours_worked,
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

    # 6. Evaluate Shift Timing & Lateness in Employee's Region Timezone
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
    tenant = tenant_res.scalar_one_or_none()

    shift_cfg = resolve_employee_shift_config(current_user, office, tenant)
    lateness = calculate_lateness(now_utc, shift_cfg)

    is_late = lateness["is_late"]
    minutes_late = lateness["minutes_late"]
    status_val = "late" if is_late else "present"

    # 7. Create Attendance Record
    new_record = AttendanceRecord(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        date=today,
        check_in_time=now_utc,
        verification_type=verification_type,
        status=status_val,
        is_late=is_late,
        minutes_late=minutes_late,
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

    # 8. Automated Late Notification Email to Employee
    if is_late:
        try:
            company_name = tenant.name if tenant else "Attendance Platform"
            await send_late_employee_email(
                to_email=current_user.email,
                employee_name=current_user.full_name,
                employee_code=current_user.employee_code,
                check_in_time_str=lateness["local_check_in_str"],
                scheduled_start_str=lateness["scheduled_start_str"],
                grace_period_minutes=shift_cfg["grace_period_minutes"],
                minutes_late=minutes_late,
                company_name=company_name,
                shift_name=shift_cfg["shift_name"]
            )
            new_record.late_notified_at = now_utc
            await db.commit()
        except Exception:
            pass

    msg = f"Check-in verified ({verification_type}, similarity: {similarity_score:.1%})."
    if is_late:
        msg += f" Note: Marked as LATE by {minutes_late} minutes (Scheduled start: {lateness['scheduled_start_str']})."
    else:
        msg += f" On-time arrival ({lateness['local_check_in_str']})."

    return AttendanceCheckInResponse(
        id=new_record.id,
        user_id=new_record.user_id,
        date=new_record.date,
        check_in_time=new_record.check_in_time,
        check_out_time=new_record.check_out_time,
        status=new_record.status,
        is_late=new_record.is_late,
        minutes_late=new_record.minutes_late,
        hours_worked=new_record.hours_worked,
        verification_type=new_record.verification_type,
        similarity_score=new_record.similarity_score,
        liveness_score=new_record.liveness_score,
        distance_from_office_meters=new_record.distance_from_office_meters,
        message=msg
    )

@router.post("/check-out", response_model=AttendanceCheckInResponse)
async def mark_attendance_check_out(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Handle JSON bodies, Form data, or query params seamlessly across web, mobile, and cURL
    content_type = request.headers.get("content-type", "").lower()
    if "application/json" in content_type:
        try:
            body = await request.json()
            if isinstance(body, dict):
                latitude = body.get("latitude")
                longitude = body.get("longitude")
        except Exception:
            pass
    elif "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        try:
            form = await request.form()
            lat_val = form.get("latitude")
            lng_val = form.get("longitude")
            if lat_val is not None and str(lat_val).strip() != "":
                latitude = float(lat_val)
            if lng_val is not None and str(lng_val).strip() != "":
                longitude = float(lng_val)
        except Exception:
            pass

    if latitude is None and "latitude" in request.query_params:
        try:
            latitude = float(request.query_params["latitude"])
        except (ValueError, TypeError):
            pass
    if longitude is None and "longitude" in request.query_params:
        try:
            longitude = float(request.query_params["longitude"])
        except (ValueError, TypeError):
            pass

    if latitude is not None:
        try:
            latitude = float(latitude)
        except (ValueError, TypeError):
            latitude = None
    if longitude is not None:
        try:
            longitude = float(longitude)
        except (ValueError, TypeError):
            longitude = None

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

    # 1. Tenant & Office lookup for local timezone representation
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    office = None
    if current_user.office_id:
        off_res = await db.execute(select(Office).where(Office.id == current_user.office_id))
        office = off_res.scalar_one_or_none()
    shift_cfg = resolve_employee_shift_config(current_user, office, tenant)

    # 2. Check if already checked out today
    if record.check_out_time is not None:
        local_checkout = format_time_local(record.check_out_time, shift_cfg["timezone"])
        duration_fmt = format_hours_worked(record.hours_worked)
        return AttendanceCheckInResponse(
            id=record.id,
            user_id=record.user_id,
            date=record.date,
            check_in_time=record.check_in_time,
            check_out_time=record.check_out_time,
            status=record.status,
            is_late=record.is_late,
            minutes_late=record.minutes_late,
            hours_worked=record.hours_worked,
            verification_type=record.verification_type,
            similarity_score=record.similarity_score,
            liveness_score=record.liveness_score,
            distance_from_office_meters=record.distance_from_office_meters,
            message=f"Already checked out today at {local_checkout}. Total duration: {duration_fmt} ({record.hours_worked}h)."
        )

    # 3. Record Check-Out & Compute Worked Hours
    now_utc = datetime.now(timezone.utc)
    check_in_utc = record.check_in_time.replace(tzinfo=timezone.utc) if record.check_in_time.tzinfo is None else record.check_in_time
    delta_seconds = max(0.0, (now_utc - check_in_utc).total_seconds())
    hours_worked = round(delta_seconds / 3600.0, 2)


    record.check_out_time = now_utc
    record.hours_worked = hours_worked
    if latitude is not None:
        record.check_out_latitude = latitude
    if longitude is not None:
        record.check_out_longitude = longitude

    await db.commit()
    await db.refresh(record)

    duration_fmt = format_hours_worked(hours_worked)
    local_checkout = format_time_local(now_utc, shift_cfg["timezone"])

    return AttendanceCheckInResponse(
        id=record.id,
        user_id=record.user_id,
        date=record.date,
        check_in_time=record.check_in_time,
        check_out_time=record.check_out_time,
        status=record.status,
        is_late=record.is_late,
        minutes_late=record.minutes_late,
        hours_worked=record.hours_worked,
        verification_type=record.verification_type,
        similarity_score=record.similarity_score,
        liveness_score=record.liveness_score,
        distance_from_office_meters=record.distance_from_office_meters,
        message=f"Checked out successfully at {local_checkout}! Total worked: {duration_fmt} ({hours_worked} hours)."
    )


@router.get("/today/{user_id}", response_model=AttendanceTodayStatus)
async def get_today_attendance_status(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Authorization check
    if current_user.id != user_id:
        if current_user.role not in ["manager", "admin", "super_admin"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        target_check = await db.execute(
            select(User).where(User.id == user_id, User.tenant_id == current_user.tenant_id)
        )
        if not target_check.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Employee not found in your organization")

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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Authorization check
    if current_user.id != user_id:
        if current_user.role not in ["manager", "admin", "super_admin"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        target_check = await db.execute(
            select(User).where(User.id == user_id, User.tenant_id == current_user.tenant_id)
        )
        if not target_check.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Employee not found in your organization")

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
            c_in = rec.check_in_time.replace(tzinfo=timezone.utc) if rec.check_in_time.tzinfo is None else rec.check_in_time
            c_out = rec.check_out_time.replace(tzinfo=timezone.utc) if rec.check_out_time.tzinfo is None else rec.check_out_time
            delta = max(0.0, (c_out - c_in).total_seconds())
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

@router.get("/calendar/{user_id}", response_model=AttendanceCalendarResponse)
async def get_employee_attendance_calendar(
    user_id: uuid.UUID,
    year: Optional[int] = None,
    month: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calendar View: Daily check-in & check-out times, status, worked hours, and monthly metrics.
    Admin/HR can view any employee; employees can view their own calendar.
    """
    if current_user.id != user_id:
        if current_user.role not in ["manager", "admin", "super_admin"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        target_check = await db.execute(
            select(User).where(User.id == user_id, User.tenant_id == current_user.tenant_id)
        )
        target_user = target_check.scalar_one_or_none()
        if not target_user:
            raise HTTPException(status_code=404, detail="Employee not found in organization")
    else:
        target_user = current_user

    # Fetch tenant & office for shift and timezone resolution
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == target_user.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    office = None
    if target_user.office_id:
        off_res = await db.execute(select(Office).where(Office.id == target_user.office_id))
        office = off_res.scalar_one_or_none()

    shift_cfg = resolve_employee_shift_config(target_user, office, tenant)
    user_tz = get_safe_zoneinfo(shift_cfg["timezone"])

    # Current local date in employee's timezone
    now_local = datetime.now(user_tz)
    target_year = year or now_local.year
    target_month = month or now_local.month

    if target_month < 1 or target_month > 12:
        raise HTTPException(status_code=400, detail="Invalid month. Must be between 1 and 12.")

    # Calculate days in month
    _, num_days = calendar.monthrange(target_year, target_month)
    month_start_date = date(target_year, target_month, 1)
    month_end_date = date(target_year, target_month, num_days)
    today_date = now_local.date()

    # Query attendance records for this month
    records_res = await db.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.user_id == target_user.id,
            AttendanceRecord.date >= month_start_date,
            AttendanceRecord.date <= month_end_date
        )
    )
    records_by_date = {r.date: r for r in records_res.scalars().all()}

    # Query approved leaves overlapping this month
    leaves_res = await db.execute(
        select(Leave).where(
            Leave.user_id == target_user.id,
            Leave.status == "approved",
            Leave.start_date <= month_end_date,
            Leave.end_date >= month_start_date
        )
    )
    leaves_list = leaves_res.scalars().all()

    def find_leave_reason_for_date(d: date) -> Optional[str]:
        for lv in leaves_list:
            if lv.start_date <= d <= lv.end_date:
                return lv.reason
        return None

    days_output: List[CalendarDayItem] = []
    total_hours_sum = 0.0
    present_days_count = 0
    late_days_count = 0
    leave_days_count = 0
    absent_days_count = 0
    working_days_count = 0

    for day_num in range(1, num_days + 1):
        d = date(target_year, target_month, day_num)
        weekday_num = d.weekday()  # 0=Mon ... 6=Sun
        day_of_week_str = d.strftime("%a")
        is_wknd = weekday_num in [5, 6]
        d_str = d.isoformat()

        if not is_wknd and d <= today_date:
            working_days_count += 1

        rec = records_by_date.get(d)
        leave_reason = find_leave_reason_for_date(d)

        check_in_str = None
        check_out_str = None
        check_in_iso = None
        check_out_iso = None
        hours_val = None
        hours_formatted = None
        v_type = None
        is_late_val = False
        min_late_val = 0

        if rec:
            check_in_str = format_time_local(rec.check_in_time, shift_cfg["timezone"])
            check_in_iso = rec.check_in_time.isoformat() if rec.check_in_time else None
            if rec.check_out_time:
                check_out_str = format_time_local(rec.check_out_time, shift_cfg["timezone"])
                check_out_iso = rec.check_out_time.isoformat()
            hours_val = rec.hours_worked
            hours_formatted = format_hours_worked(rec.hours_worked)
            v_type = rec.verification_type
            is_late_val = rec.is_late
            min_late_val = rec.minutes_late

            if is_late_val:
                day_status = "late"
                late_days_count += 1
                present_days_count += 1
            elif rec.check_out_time is None and d < today_date:
                day_status = "missing_checkout"
                present_days_count += 1
            elif rec.check_out_time is None and d == today_date:
                day_status = "checked_in"
                present_days_count += 1
            else:
                day_status = "present"
                present_days_count += 1

            if hours_val:
                total_hours_sum += hours_val

        elif leave_reason:
            day_status = "on_leave"
            leave_days_count += 1
        elif d > today_date:
            day_status = "upcoming"
        elif is_wknd:
            day_status = "weekend"
        elif d == today_date:
            day_status = "not_checked_in"
        else:
            day_status = "absent"
            absent_days_count += 1

        days_output.append(
            CalendarDayItem(
                date=d_str,
                day=day_num,
                day_of_week=day_of_week_str,
                is_weekend=is_wknd,
                check_in_time=check_in_str,
                check_out_time=check_out_str,
                check_in_iso=check_in_iso,
                check_out_iso=check_out_iso,
                status=day_status,
                is_late=is_late_val,
                minutes_late=min_late_val,
                hours_worked=hours_val,
                hours_worked_formatted=hours_formatted,
                verification_type=v_type,
                leave_reason=leave_reason
            )
        )

    avg_hours = round(total_hours_sum / max(1, present_days_count), 2) if present_days_count > 0 else 0.0
    on_time_pct = round(((present_days_count - late_days_count) / max(1, present_days_count)) * 100, 1) if present_days_count > 0 else 100.0

    summary = AttendanceCalendarSummary(
        total_days=num_days,
        working_days=working_days_count,
        present_days=present_days_count,
        late_days=late_days_count,
        absent_days=absent_days_count,
        leave_days=leave_days_count,
        total_hours_worked=round(total_hours_sum, 2),
        average_hours_per_day=avg_hours,
        on_time_rate_pct=on_time_pct
    )

    return AttendanceCalendarResponse(
        user_id=target_user.id,
        employee_name=target_user.full_name,
        employee_code=target_user.employee_code,
        year=target_year,
        month=target_month,
        month_name=calendar.month_name[target_month],
        timezone=shift_cfg["timezone"],
        shift_name=shift_cfg["shift_name"],
        scheduled_start_time=shift_cfg["work_start_time"],
        scheduled_end_time=shift_cfg["work_end_time"],
        grace_period_minutes=shift_cfg["grace_period_minutes"],
        days=days_output,
        summary=summary
    )

@router.post("/send-late-digest", response_model=LateDigestResponse)
async def send_daily_late_digest(
    request: Request,
    body: Optional[LateDigestRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Dispatches a batch email digest to HR/Admins with all employees who were late today (or target_date).
    """
    if current_user.role not in ["admin", "manager", "super_admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Management access required")

    target_date = None
    if body and body.target_date:
        target_date = body.target_date
    elif "target_date" in request.query_params or "date_str" in request.query_params:
        raw_d = request.query_params.get("target_date") or request.query_params.get("date_str")
        try:
            target_date = date.fromisoformat(raw_d)
        except Exception:
            pass

    if not target_date:
        target_date = date.today()

    # Query all late records for this tenant and date
    stmt = (
        select(AttendanceRecord, User, Office)
        .join(User, AttendanceRecord.user_id == User.id)
        .outerjoin(Office, User.office_id == Office.id)
        .where(
            AttendanceRecord.tenant_id == current_user.tenant_id,
            AttendanceRecord.date == target_date,
            AttendanceRecord.is_late == True
        )
        .order_by(AttendanceRecord.check_in_time.asc())
    )
    res = await db.execute(stmt)
    late_rows = res.all()

    # Query HR/Admin recipients
    hr_res = await db.execute(
        select(User.email).where(
            User.tenant_id == current_user.tenant_id,
            User.role.in_(["admin", "super_admin"]),
            User.is_active == True
        )
    )
    recipient_emails = list({e for e in hr_res.scalars().all() if e})
    if current_user.email and current_user.email not in recipient_emails:
        recipient_emails.append(current_user.email)

    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    company_name = tenant.name if tenant else "Attendance Platform"

    late_items = []
    for att, usr, off in late_rows:
        shift_cfg = resolve_employee_shift_config(usr, off, tenant)
        check_in_formatted = format_time_local(att.check_in_time, shift_cfg["timezone"])
        late_items.append({
            "name": usr.full_name,
            "code": usr.employee_code,
            "department": usr.department or "General",
            "shift_name": shift_cfg["shift_name"],
            "scheduled_start": shift_cfg["work_start_time"],
            "check_in_time": check_in_formatted,
            "minutes_late": att.minutes_late
        })

    if not late_items:
        return LateDigestResponse(
            status="no_late_records",
            target_date=target_date,
            late_count=0,
            recipients=recipient_emails,
            message=f"No late check-ins recorded for {target_date.isoformat()}."
        )

    dispatch_res = await send_late_digest_email(
        to_emails=recipient_emails,
        company_name=company_name,
        target_date_str=target_date.isoformat(),
        late_items=late_items
    )

    return LateDigestResponse(
        status="sent" if dispatch_res.get("delivered") else "error",
        target_date=target_date,
        late_count=len(late_items),
        recipients=recipient_emails,
        message=f"Late arrivals digest dispatched to {len(recipient_emails)} recipient(s) for {len(late_items)} late employee(s)."
    )


