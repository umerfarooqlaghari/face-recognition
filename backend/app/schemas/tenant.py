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
    default_timezone: str = "UTC"
    default_work_start_time: str = "09:00"
    default_work_end_time: str = "18:00"
    default_grace_period_minutes: int = 15
    created_at: datetime

class TenantTimingsUpdateRequest(BaseModel):
    default_timezone: Optional[str] = None
    default_work_start_time: Optional[str] = None
    default_work_end_time: Optional[str] = None
    default_grace_period_minutes: Optional[int] = None

class OfficeCreateRequest(BaseModel):
    name: str
    latitude: float
    longitude: float
    radius_meters: Optional[int] = 200
    address: Optional[str] = None
    timezone: Optional[str] = "UTC"
    work_start_time: Optional[str] = "09:00"
    work_end_time: Optional[str] = "18:00"
    grace_period_minutes: Optional[int] = 15

class OfficeTimingsUpdateRequest(BaseModel):
    timezone: Optional[str] = None
    work_start_time: Optional[str] = None
    work_end_time: Optional[str] = None
    grace_period_minutes: Optional[int] = None

class OfficeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    latitude: float
    longitude: float
    radius_meters: int
    address: Optional[str] = None
    timezone: str = "UTC"
    work_start_time: str = "09:00"
    work_end_time: str = "18:00"
    grace_period_minutes: int = 15

class EmployeeShiftUpdateRequest(BaseModel):
    custom_work_start_time: Optional[str] = None
    custom_work_end_time: Optional[str] = None
    custom_grace_period_minutes: Optional[int] = None
    shift_name: Optional[str] = None
    custom_timezone: Optional[str] = None
    clear_custom_shift: Optional[bool] = False

    # Aliases for client compatibility
    work_start_time: Optional[str] = None
    work_end_time: Optional[str] = None
    grace_period_minutes: Optional[int] = None
    timezone: Optional[str] = None

class EmployeeCreateRequest(BaseModel):
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    email: EmailStr
    employee_code: Optional[str] = None
    default_work_mode: Optional[str] = "on_site" # on_site, remote
    office_id: Optional[uuid.UUID] = None
    manager_id: Optional[uuid.UUID] = None
    role: Optional[str] = "employee"
    custom_work_start_time: Optional[str] = None
    custom_work_end_time: Optional[str] = None
    custom_grace_period_minutes: Optional[int] = None
    shift_name: Optional[str] = None
    custom_timezone: Optional[str] = None


class EmployeeUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[str] = None
    default_work_mode: Optional[str] = None
    office_id: Optional[uuid.UUID] = None
    manager_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None

class EmployeeCreateResponse(BaseModel):
    user: UserResponse
    auto_generated_password: str
    invite_token: str
    invite_url: Optional[str] = None
    email_dispatch: Dict[str, Any]

class TenantStatsResponse(BaseModel):
    tenant: TenantResponse
    admin_user: UserResponse
    total_employees: int
    on_site_employees: int
    remote_employees: int
    today_checkins: int
    attendance_rate: float

class EmployeeImportPreviewRow(BaseModel):
    row: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    employee_code: Optional[str] = None
    department: Optional[str] = "General"
    designation: Optional[str] = "Team Member"
    phone_number: Optional[str] = None
    default_work_mode: Optional[str] = "on_site"
    is_duplicate: bool = False
    errors: List[str] = []
    valid: bool = True

class EmployeeImportPreviewResponse(BaseModel):
    total_rows: int
    valid_rows: int
    invalid_rows: int
    duplicate_rows: int
    preview: List[EmployeeImportPreviewRow]

class EmployeeImportCreatedItem(BaseModel):
    row: int
    id: uuid.UUID
    employee_code: str
    email: str
    full_name: str
    temporary_password: str

class EmployeeImportSkippedItem(BaseModel):
    row: int
    email: Optional[str] = None
    name: Optional[str] = None
    reason: str

class EmployeeImportCommitResponse(BaseModel):
    total_rows: int
    created: int
    skipped: int
    created_records: List[EmployeeImportCreatedItem]
    skipped_records: List[EmployeeImportSkippedItem]
