from config.supabase_client import supabase
from models.employee import EmployeeCreate

class AuthService:
    @staticmethod
    def sign_up(user_in: EmployeeCreate):
        res = supabase.auth.sign_up({
            "email": user_in.email,
            "password": user_in.password,
            "options": {
                "data": {
                    "full_name": user_in.full_name,
                    "employee_id": user_in.employee_id,
                    "role": user_in.role
                }
            }
        })
        return res

    @staticmethod
    def sign_in(email: str, password: str):
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return res

    @staticmethod
    def sign_out(token: str):
        return supabase.auth.sign_out()
    