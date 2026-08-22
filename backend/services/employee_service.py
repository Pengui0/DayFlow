from config.supabase_client import supabase
from models.employee import EmployeeUpdate

class EmployeeService:
    @staticmethod
    def get_all():
        return supabase.table("employees").select("*").order("created_at").execute().data

    @staticmethod
    def get_by_id(employee_id: str):
        return supabase.table("employees").select("*").eq("id", employee_id).single().execute().data

    @staticmethod
    def update_profile(employee_id: str, updates: EmployeeUpdate):
        update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
        return supabase.table("employees").update(update_data).eq("id", employee_id).execute().data