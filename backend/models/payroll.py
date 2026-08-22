from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PayrollUpdate(BaseModel):
    basic_salary: float = Field(..., ge=0)
    allowances: float = Field(default=0.0, ge=0)
    deductions: float = Field(default=0.0, ge=0)

class PayrollCreate(PayrollUpdate):
    employee_id: str
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000)

class PayrollOut(BaseModel):
    id: str
    employee_id: str
    basic_salary: float
    allowances: float
    deductions: float
    net_salary: float
    month: int
    year: int
    created_at: datetime

    class Config:
        from_attributes = True
        