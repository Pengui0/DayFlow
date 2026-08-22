from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.employee import EmployeeOut, EmployeeUpdate
from middleware.auth_middleware import get_current_user
from utils.role_check import require_admin
from services.employee_service import EmployeeService

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("/me", response_model=EmployeeOut)
def get_my_profile(current_user: EmployeeOut = Depends(get_current_user)):
    return current_user

@router.put("/me")
def update_my_profile(updates: EmployeeUpdate, current_user: EmployeeOut = Depends(get_current_user)):
    return EmployeeService.update_profile(current_user.id, updates)

@router.get("/", response_model=List[EmployeeOut])
def get_all_employees(admin: EmployeeOut = Depends(require_admin)):
    return EmployeeService.get_all()

@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee_by_id(employee_id: str, admin: EmployeeOut = Depends(require_admin)):
    emp = EmployeeService.get_by_id(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp