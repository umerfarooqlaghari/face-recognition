import uuid
from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class OfficeCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    radius_meters: int = Field(default=200, ge=10, le=5000)
    address: Optional[str] = None

class OfficeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    latitude: float
    longitude: float
    radius_meters: int
    address: Optional[str] = None

class WorkModeOverrideCreate(BaseModel):
    user_id: uuid.UUID
    effective_date: date
    assigned_mode: str = Field(pattern="^(on_site|remote)$")
    reason: Optional[str] = None

class WorkModeOverrideResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    effective_date: date
    assigned_mode: str
    reason: Optional[str] = None

class WorkModeStatusResponse(BaseModel):
    user_id: uuid.UUID
    date: date
    effective_work_mode: str
    is_override: bool
    override_reason: Optional[str] = None
    office: Optional[OfficeResponse] = None
    requires_geofence: bool
    radius_meters: int

class GeofenceValidateRequest(BaseModel):
    user_id: uuid.UUID
    latitude: float
    longitude: float
    target_date: Optional[date] = None
    is_mocked: Optional[bool] = False

class GeofenceValidateResponse(BaseModel):
    allowed: bool
    work_mode: str
    distance_meters: Optional[float] = None
    radius_limit_meters: int = 200
    is_within_geofence: bool
    message: str
