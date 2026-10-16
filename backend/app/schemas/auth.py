import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class DeviceTelemetry(BaseModel):
    device_id: str
    device_model: Optional[str] = "Unknown"
    os_name: Optional[str] = "Unknown"
    os_version: Optional[str] = "Unknown"
    app_version: Optional[str] = "1.0.0"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    device: Optional[DeviceTelemetry] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str
    device_id: str

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    employee_code: str
    role: Optional[str] = "employee"
    default_work_mode: Optional[str] = "on_site"
    office_id: Optional[uuid.UUID] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    email: str
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    employee_code: str
    role: str
    default_work_mode: str
    office_id: Optional[uuid.UUID] = None
    manager_id: Optional[uuid.UUID] = None
    is_active: bool

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
