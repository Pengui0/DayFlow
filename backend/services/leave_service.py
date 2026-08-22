from config.supabase_client import supabase
from models.leave_request import LeaveRequestCreate, LeaveApproval

class LeaveService:
    @staticmethod
    def apply(employee_id: str, payload: LeaveRequestCreate):
        data = payload.model_dump()
        data["start_date"] = data["start_date"].isoformat()
        data["end_date"] = data["end_date"].isoformat()
        data["employee_id"] = employee_id
        data["status"] = "pending"
        return supabase.table("leave_requests").insert(data).execute().data

    @staticmethod
    def get_requests(employee_id: str = None):
        query = supabase.table("leave_requests").select("*, employees(full_name, employee_id, job_title)")
        if employee_id:
            query = query.eq("employee_id", employee_id)
        return query.order("created_at", desc=True).execute().data

    @staticmethod
    def review(request_id: str, payload: LeaveApproval):
        return supabase.table("leave_requests").update({
            "status": payload.status,
            "admin_comment": payload.admin_comment
        }).eq("id", request_id).execute().data