from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from models.employee import EmployeeOut
from models.payroll import PayrollCreate
from middleware.auth_middleware import get_current_user
from utils.role_check import require_admin
from services.payroll_service import PayrollService

router = APIRouter(prefix="/payroll", tags=["Payroll & Salary"])

@router.get("/me")
def get_my_payroll(current_user: EmployeeOut = Depends(get_current_user)):
    return PayrollService.get_by_employee(current_user.id)

@router.get("/")
def get_all_payroll(
    month: Optional[int] = None,
    year: Optional[int] = None,
    admin: EmployeeOut = Depends(require_admin)
):
    return PayrollService.get_all(month, year)

@router.post("/")
def upsert_payroll(payload: PayrollCreate, admin: EmployeeOut = Depends(require_admin)):
    try:
        return PayrollService.upsert(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    