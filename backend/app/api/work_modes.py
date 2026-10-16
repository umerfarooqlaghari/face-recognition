from datetime import date
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import Office, User, WorkModeOverride
from app.api.deps import get_current_user
from app.services.geo_engine import calculate_haversine_distance, is_within_geofence
from app.services.work_mode_service import resolve_effective_work_mode
from app.schemas.work_modes import (
    OfficeCreate,
    OfficeUpdate,
    OfficeResponse,
    WorkModeOverrideCreate,
    WorkModeOverrideResponse,
    WorkModeStatusResponse,
    GeofenceValidateRequest,
    GeofenceValidateResponse
)

router = APIRouter(prefix="/work-modes", tags=["Work Modes & Geofencing"])

# --- Office Management ---

@router.post("/offices", response_model=OfficeResponse, status_code=status.HTTP_201_CREATED)
async def create_office(
    req: OfficeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["manager", "super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Only managers or administrators can create offices")

    new_office = Office(
        tenant_id=current_user.tenant_id,
        name=req.name,
        latitude=req.latitude,
        longitude=req.longitude,
        radius_meters=req.radius_meters or 200,
        address=req.address
    )
    db.add(new_office)
    await db.commit()
    await db.refresh(new_office)
    return new_office

@router.get("/offices", response_model=List[OfficeResponse])
async def list_offices(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Office)
        .where(Office.tenant_id == current_user.tenant_id)
        .order_by(Office.name.asc())
    )
    return res.scalars().all()

@router.put("/offices/{office_id}", response_model=OfficeResponse)
async def update_office(
    office_id: uuid.UUID,
    req: OfficeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["manager", "super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Only managers or administrators can edit offices")

    res = await db.execute(
        select(Office).where(Office.id == office_id, Office.tenant_id == current_user.tenant_id)
    )
    off = res.scalar_one_or_none()
    if not off:
        raise HTTPException(status_code=404, detail="Office location not found")

    if req.name is not None:
        off.name = req.name.strip()
    if req.latitude is not None:
        off.latitude = req.latitude
    if req.longitude is not None:
        off.longitude = req.longitude
    if req.radius_meters is not None:
        off.radius_meters = req.radius_meters
    if req.address is not None:
        off.address = req.address.strip()

    await db.commit()
    await db.refresh(off)
    return off

@router.delete("/offices/{office_id}")
async def delete_office(
    office_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["manager", "super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Only managers or administrators can delete offices")

    res = await db.execute(
        select(Office).where(Office.id == office_id, Office.tenant_id == current_user.tenant_id)
    )
    off = res.scalar_one_or_none()
    if not off:
        raise HTTPException(status_code=404, detail="Office location not found")

    await db.delete(off)
    await db.commit()
    return {"status": "success", "message": f"Office location {off.name} removed successfully"}

# --- Work Mode Overrides ---

@router.post("/override", response_model=WorkModeOverrideResponse)
async def set_work_mode_override(
    req: WorkModeOverrideCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["manager", "super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Only managers or administrators can set work mode overrides")

    # Verify target employee within same tenant
    emp_res = await db.execute(
        select(User).where(User.id == req.user_id, User.tenant_id == current_user.tenant_id)
    )
    emp = emp_res.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found in your organization")

    # Upsert override for employee and effective_date
    existing_res = await db.execute(
        select(WorkModeOverride).where(
            WorkModeOverride.user_id == req.user_id,
            WorkModeOverride.effective_date == req.effective_date,
            WorkModeOverride.tenant_id == current_user.tenant_id
        )
    )
    override = existing_res.scalar_one_or_none()

    if override:
        override.assigned_mode = req.assigned_mode
        override.reason = req.reason
        override.created_by = current_user.id
    else:
        override = WorkModeOverride(
            tenant_id=current_user.tenant_id,
            user_id=req.user_id,
            effective_date=req.effective_date,
            assigned_mode=req.assigned_mode,
            reason=req.reason,
            created_by=current_user.id
        )
        db.add(override)

    await db.commit()
    await db.refresh(override)
    return override

@router.get("/status/{user_id}", response_model=WorkModeStatusResponse)
async def get_effective_work_mode_status(
    user_id: uuid.UUID,
    target_date: Optional[date] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    check_date = target_date or date.today()
    try:
        eff_mode, reason, office = await resolve_effective_work_mode(db, user_id, check_date)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    requires_geofence = (eff_mode == "on_site")
    radius = office.radius_meters if office else 200

    return WorkModeStatusResponse(
        user_id=user_id,
        date=check_date,
        effective_work_mode=eff_mode,
        is_override=(reason is not None),
        override_reason=reason,
        office=OfficeResponse.model_validate(office) if office else None,
        requires_geofence=requires_geofence,
        radius_meters=radius
    )

# --- Geofence Validation ---

@router.post("/validate-geofence", response_model=GeofenceValidateResponse)
async def validate_employee_geofence(
    req: GeofenceValidateRequest,
    db: AsyncSession = Depends(get_db)
):
    # Reject mock GPS locations
    if req.is_mocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Mock or simulated GPS coordinates detected. Attendance verification blocked."
        )

    check_date = req.target_date or date.today()
    try:
        eff_mode, reason, office = await resolve_effective_work_mode(db, req.user_id, check_date)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # If remote, bypass 200m constraint
    if eff_mode == "remote":
        return GeofenceValidateResponse(
            allowed=True,
            work_mode="remote",
            distance_meters=None,
            radius_limit_meters=200,
            is_within_geofence=True,
            message="Remote work mode active. Geofence constraint waived."
        )

    # On-site mode: Check office assignment
    if not office:
        # Check all tenant offices
        u_res = await db.execute(select(User).where(User.id == req.user_id))
        target_u = u_res.scalar_one_or_none()
        tenant_id = target_u.tenant_id if target_u else None

        all_offices = []
        if tenant_id:
            off_res = await db.execute(select(Office).where(Office.tenant_id == tenant_id))
            all_offices = off_res.scalars().all()

        if not all_offices:
            off_res = await db.execute(select(Office).limit(1))
            fallback_off = off_res.scalar_one_or_none()
            if fallback_off:
                all_offices = [fallback_off]

        if not all_offices:
            return GeofenceValidateResponse(
                allowed=True,
                work_mode="on_site",
                distance_meters=0.0,
                radius_limit_meters=200,
                is_within_geofence=True,
                message="No office configured; permitted by default."
            )

        min_distance = float('inf')
        closest_off = all_offices[0]
        for off in all_offices:
            within, dist = is_within_geofence(req.latitude, req.longitude, off.latitude, off.longitude, off.radius_meters)
            if within:
                return GeofenceValidateResponse(
                    allowed=True,
                    work_mode="on_site",
                    distance_meters=dist,
                    radius_limit_meters=off.radius_meters,
                    is_within_geofence=True,
                    message=f"Within geofence of {off.name}! ({dist:.1f}m away)"
                )
            if dist < min_distance:
                min_distance = dist
                closest_off = off

        return GeofenceValidateResponse(
            allowed=False,
            work_mode="on_site",
            distance_meters=min_distance,
            radius_limit_meters=closest_off.radius_meters,
            is_within_geofence=False,
            message=f"Out of office bounds. You are {min_distance:.1f}m away from closest location {closest_off.name} (Limit: {closest_off.radius_meters}m)."
        )

    within_bounds, distance = is_within_geofence(
        req.latitude,
        req.longitude,
        office.latitude,
        office.longitude,
        office.radius_meters
    )

    if not within_bounds:
        return GeofenceValidateResponse(
            allowed=False,
            work_mode="on_site",
            distance_meters=distance,
            radius_limit_meters=office.radius_meters,
            is_within_geofence=False,
            message=f"Out of office bounds. You are {distance:.1f}m away from {office.name} (Limit: {office.radius_meters}m)."
        )

    return GeofenceValidateResponse(
        allowed=True,
        work_mode="on_site",
        distance_meters=distance,
        radius_limit_meters=office.radius_meters,
        is_within_geofence=True,
        message=f"Within geofence! You are {distance:.1f}m from {office.name}."
    )
