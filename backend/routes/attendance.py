from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from utils.role_check import require_admin
from models.employee import EmployeeOut
from services.attendance_service import AttendanceService

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/check-in")
def check_in(current_user: EmployeeOut = Depends(get_current_user)):
    try:
        return AttendanceService.check_in(current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Check-in failed or already logged today: {str(e)}")

@router.post("/check-out")
def check_out(current_user: EmployeeOut = Depends(get_current_user)):
    try:
        return AttendanceService.check_out(current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Check-out failed: {str(e)}")

@router.get("/me")
def get_my_attendance(current_user: EmployeeOut = Depends(get_current_user)):
    return AttendanceService.get_attendance(current_user.id)

@router.get("/")
def get_all_attendance(admin: EmployeeOut = Depends(require_admin)):
    return AttendanceService.get_attendance()