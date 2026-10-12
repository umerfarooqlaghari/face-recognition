import uuid
from datetime import date, datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_db
from app.models.models import User, AttendanceRecord, UserDevice
from app.api.deps import get_current_user
from app.services.geo_engine import is_within_geofence
from app.services.work_mode_service import resolve_effective_work_mode
from app.services.attendance_service import verify_probe_face
from app.schemas.attendance import (
    AttendanceCheckInResponse,
    AttendanceRecordItem,
    AttendanceTodayStatus
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

    if not record:
        return AttendanceTodayStatus(has_checked_in=False, has_checked_out=False, record=None)

    return AttendanceTodayStatus(
        has_checked_in=True,
        has_checked_out=record.check_out_time is not None,
        record=AttendanceRecordItem.model_validate(record)
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
