from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date, datetime

class AttendanceCreate(BaseModel):
    employee_id: Optional[str] = None
    date: Optional[date] = None
    status: Literal["present", "absent", "half-day", "leave"] = "present"

class AttendanceOut(BaseModel):
    id: str
    employee_id: str
    date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True