from fastapi import Depends, HTTPException, status
from middleware.auth_middleware import get_current_user
from models.employee import EmployeeOut

def require_admin(current_user: EmployeeOut = Depends(get_current_user)) -> EmployeeOut:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Admins only"
        )
    return current_user

def require_employee(current_user: EmployeeOut = Depends(get_current_user)) -> EmployeeOut:
    return current_user
