from config.supabase_client import supabase
from models.payroll import PayrollCreate

class PayrollService:
    @staticmethod
    def get_by_employee(employee_id: str):
        return supabase.table("payroll").select("*").eq("employee_id", employee_id).order("year", desc=True).order("month", desc=True).execute().data

    @staticmethod
    def get_all(month: int = None, year: int = None):
        query = supabase.table("payroll").select("*, employees(full_name, employee_id, job_title)")
        if month:
            query = query.eq("month", month)
        if year:
            query = query.eq("year", year)
        return query.order("year", desc=True).order("month", desc=True).execute().data

    @staticmethod
    def upsert(payload: PayrollCreate):
        data = payload.model_dump()
        return supabase.table("payroll").upsert(data, on_conflict="employee_id,month,year").execute().data
    