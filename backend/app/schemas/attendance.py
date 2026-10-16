import uuid
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class AttendanceCheckInResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    status: str
    verification_type: str
    similarity_score: float
    liveness_score: float
    distance_from_office_meters: Optional[float] = None
    message: str

class AttendanceRecordItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    date: date
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    status: str
    verification_type: str
    similarity_score: float
    distance_from_office_meters: Optional[float] = None

class AttendanceTodayStatus(BaseModel):
    has_checked_in: bool
    has_checked_out: bool
    record: Optional[AttendanceRecordItem] = None
    is_on_leave: bool = False
    leave_status: Optional[str] = None
    leave_reason: Optional[str] = None

class AttendanceRegularizationCreate(BaseModel):
    date: date
    check_in_time: str # e.g. "09:00" or ISO string
    check_out_time: Optional[str] = None # e.g. "17:30" or ISO string
    reason: str
    user_id: Optional[uuid.UUID] = None # optional, for manager submitting for employee

class AttendanceRegularizationReview(BaseModel):
    status: str # "approved" or "rejected"
    reviewer_note: Optional[str] = None

class AttendanceRegularizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID
    employee_name: str
    employee_code: str
    date: date
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    reason: str
    status: str
    reviewed_by: Optional[uuid.UUID] = None
    reviewer_note: Optional[str] = None
    created_at: Optional[datetime] = None

class TimesheetItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    employee_name: str
    employee_code: str
    date: date
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    duration_hours: Optional[float] = None
    status: str
    verification_type: str
    similarity_score: float
    distance_from_office_meters: Optional[float] = None
    office_name: Optional[str] = None

