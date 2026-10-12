import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict
from app.schemas.auth import UserResponse

class TenantSignupRequest(BaseModel):
    company_name: str
    admin_name: str
    admin_email: EmailStr
    admin_password: str
    office_name: Optional[str] = "Headquarters"
    office_address: Optional[str] = "Main Office"
    office_latitude: Optional[float] = 24.8607
    office_longitude: Optional[float] = 67.0011
    office_radius_meters: Optional[int] = 200

class TenantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    domain: Optional[str] = None
    is_active: bool
    created_at: datetime

class OfficeCreateRequest(BaseModel):
    name: str
    latitude: float
    longitude: float
    radius_meters: Optional[int] = 200
    address: Optional[str] = None

class OfficeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    latitude: float
    longitude: float
    radius_meters: int
    address: Optional[str] = None

class EmployeeCreateRequest(BaseModel):
    full_name: str
    email: EmailStr
    employee_code: Optional[str] = None
    default_work_mode: Optional[str] = "on_site" # on_site, remote
    office_id: Optional[uuid.UUID] = None
    role: Optional[str] = "employee"

class EmployeeCreateResponse(BaseModel):
    user: UserResponse
    auto_generated_password: str
    invite_token: str
    email_dispatch: Dict[str, Any]

class TenantStatsResponse(BaseModel):
    tenant: TenantResponse
    admin_user: UserResponse
    total_employees: int
    on_site_employees: int
    remote_employees: int
    today_checkins: int
    attendance_rate: float
