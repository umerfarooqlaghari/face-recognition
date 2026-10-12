import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class CreateInviteRequest(BaseModel):
    user_id: uuid.UUID
    expires_hours: Optional[int] = 48

class InviteResponse(BaseModel):
    invite_token: str
    user_id: uuid.UUID
    employee_name: str
    employee_code: str
    expires_at: datetime
    invite_url: str

class VerifyInviteResponse(BaseModel):
    valid: bool
    user_id: uuid.UUID
    full_name: str
    employee_code: str
    expires_at: datetime

class EnrollmentResponse(BaseModel):
    success: bool
    message: str
    user_id: uuid.UUID
    enrolled_at: datetime
    is_verified: bool

class BiometricProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    is_verified: bool
    enrolled_at: datetime
