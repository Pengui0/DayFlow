from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

class EmployeeBase(BaseModel):
    email: EmailStr
    full_name: str
    employee_id: str
    role: Literal["admin", "employee"] = "employee"
    job_title: Optional[str] = "Staff"
    phone: Optional[str] = None
    address: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    password: str

class EmployeeUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture_url: Optional[str] = None
    full_name: Optional[str] = None
    job_title: Optional[str] = None

class EmployeeOut(EmployeeBase):
    id: str
    profile_picture_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        