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
