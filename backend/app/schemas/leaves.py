from datetime import date, datetime
from typing import Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field, model_validator

from typing import Optional, List

class LeaveApplyRequest(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    dates: Optional[List[date]] = None
    reason: str = Field(..., min_length=3, max_length=500)
    leave_type: Optional[str] = "Annual Leave"
    user_id: Optional[uuid.UUID] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.dates and len(self.dates) > 0:
            sorted_dates = sorted(self.dates)
            if not self.start_date:
                self.start_date = sorted_dates[0]
            if not self.end_date:
                self.end_date = sorted_dates[-1]
        elif not self.start_date or not self.end_date:
            raise ValueError("Please provide either a list of dates or start_date and end_date")
        elif self.end_date < self.start_date:
            raise ValueError("End date must be greater than or equal to start date")
        return self

class LeaveReviewRequest(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected|bypass)$")
    review_note: Optional[str] = None
    bypass: Optional[bool] = False

class LeaveResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    manager_name: Optional[str] = None
    start_date: date
    end_date: date
    reason: str
    leave_type: Optional[str] = "Annual Leave"
    status: str # pending_manager, pending_admin, approved, rejected
    approved_by: Optional[uuid.UUID] = None
    level1_approved_by: Optional[uuid.UUID] = None
    level1_approver_name: Optional[str] = None
    level1_approved_at: Optional[datetime] = None
    level2_approved_by: Optional[uuid.UUID] = None
    level2_approver_name: Optional[str] = None
    level2_approved_at: Optional[datetime] = None
    admin_bypassed: bool = False
    rejection_reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
