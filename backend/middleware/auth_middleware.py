from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config.supabase_client import supabase
from models.employee import EmployeeOut

# Enables the 🔒 "Authorize" button in Swagger UI (/docs)
security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> EmployeeOut:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials

    try:
        # Validate JWT token with Supabase Auth
        user_res = supabase.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token"
            )
        
        user_id = user_res.user.id

        # Fetch employee record & role
        emp_res = supabase.table("employees").select("*").eq("id", user_id).single().execute()
        
        if not emp_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee profile not found in database"
            )
        
        return EmployeeOut(**emp_res.data)

    except HTTPException:
        # Re-raise explicit HTTP exceptions (e.g. 404) without converting to 401
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )