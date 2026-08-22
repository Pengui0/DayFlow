from fastapi import APIRouter, Depends, HTTPException, status
from models.employee import EmployeeOut
from models.leave_request import LeaveRequestCreate, LeaveApproval
from middleware.auth_middleware import get_current_user
from utils.role_check import require_admin
from services.leave_service import LeaveService

router = APIRouter(prefix="/leave-requests", tags=["Leave & Time-Off"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def apply_leave(payload: LeaveRequestCreate, current_user: EmployeeOut = Depends(get_current_user)):
    try:
        return LeaveService.apply(current_user.id, payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
def get_my_leaves(current_user: EmployeeOut = Depends(get_current_user)):
    return LeaveService.get_requests(current_user.id)

@router.get("/")
def get_all_leaves(admin: EmployeeOut = Depends(require_admin)):
    return LeaveService.get_requests()

@router.patch("/{request_id}/review")
def review_leave(request_id: str, payload: LeaveApproval, admin: EmployeeOut = Depends(require_admin)):
    try:
        return LeaveService.review(request_id, payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    