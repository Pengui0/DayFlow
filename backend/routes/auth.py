from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from models.employee import EmployeeCreate
from services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignInSchema(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: EmployeeCreate):
    try:
        res = AuthService.sign_up(payload)
        return {"message": "User registered successfully", "data": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/signin")
def signin(payload: SignInSchema):
    try:
        res = AuthService.sign_in(payload.email, payload.password)
        return {
            "access_token": res.session.access_token,
            "user": res.user,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid credentials: {str(e)}")

@router.post("/signout")
def signout():
    try:
        AuthService.sign_out("")
        return {"message": "Signed out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    