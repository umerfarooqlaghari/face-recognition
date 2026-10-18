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
    is_late: bool = False
    minutes_late: int = 0
    hours_worked: Optional[float] = None
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
    is_late: bool = False
    minutes_late: int = 0
    hours_worked: Optional[float] = None
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

class CalendarDayItem(BaseModel):
    date: str
    day: int
    day_of_week: str
    is_weekend: bool
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None
    check_in_iso: Optional[str] = None
    check_out_iso: Optional[str] = None
    status: str # present, late, on_leave, absent, weekend, checked_in, missing_checkout, upcoming
    is_late: bool = False
    minutes_late: int = 0
    hours_worked: Optional[float] = None
    hours_worked_formatted: Optional[str] = None
    verification_type: Optional[str] = None
    leave_reason: Optional[str] = None

class AttendanceCalendarSummary(BaseModel):
    total_days: int
    working_days: int
    present_days: int
    late_days: int
    absent_days: int
    leave_days: int
    total_hours_worked: float
    average_hours_per_day: float
    on_time_rate_pct: float

class AttendanceCalendarResponse(BaseModel):
    user_id: uuid.UUID
    employee_name: str
    employee_code: str
    year: int
    month: int
    month_name: str
    timezone: str
    shift_name: str
    scheduled_start_time: str
    scheduled_end_time: str
    grace_period_minutes: int
    days: List[CalendarDayItem]
    summary: AttendanceCalendarSummary

class LateDigestRequest(BaseModel):
    target_date: Optional[date] = None

class LateDigestResponse(BaseModel):
    status: str
    target_date: date
    late_count: int
    recipients: List[str]
    message: str

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

