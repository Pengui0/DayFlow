from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date, datetime

class LeaveRequestCreate(BaseModel):
    leave_type: Literal["paid", "sick", "unpaid"]
    start_date: date
    end_date: date
    remarks: Optional[str] = None

class LeaveApproval(BaseModel):
    status: Literal["approved", "rejected"]
    admin_comment: Optional[str] = None

class LeaveRequestOut(BaseModel):
    id: str
    employee_id: str
    leave_type: str
    start_date: date
    end_date: date
    remarks: Optional[str] = None
    status: str
    admin_comment: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True