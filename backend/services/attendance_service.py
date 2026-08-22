from datetime import datetime, date
from config.supabase_client import supabase

class AttendanceService:
    @staticmethod
    def check_in(employee_id: str):
        today = date.today().isoformat()
        now = datetime.utcnow().isoformat()
        return supabase.table("attendance").insert({
            "employee_id": employee_id,
            "date": today,
            "check_in": now,
            "status": "present"
        }).execute().data

    @staticmethod
    def check_out(employee_id: str):
        today = date.today().isoformat()
        now = datetime.utcnow().isoformat()
        return supabase.table("attendance").update({
            "check_out": now
        }).eq("employee_id", employee_id).eq("date", today).execute().data

    @staticmethod
    def get_attendance(employee_id: str = None):
        query = supabase.table("attendance").select("*, employees(full_name, employee_id)")
        if employee_id:
            query = query.eq("employee_id", employee_id)
        return query.order("date", desc=True).execute().data
    