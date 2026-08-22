export type LeaveType = 'paid' | 'sick' | 'unpaid' | 'annual' | 'casual';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee_id?: string;
  employeeName?: string;
  employeeAvatar?: string;
  jobTitle?: string;
  department?: string;
  leaveType: LeaveType;
  leave_type?: LeaveType;
  startDate: string; // YYYY-MM-DD
  start_date?: string;
  endDate: string; // YYYY-MM-DD
  end_date?: string;
  daysCount?: number;
  remarks: string;
  reason?: string;
  status: LeaveStatus;
  adminComment?: string | null;
  admin_comment?: string | null;
  createdAt: string;
  created_at?: string;
}

export interface LeaveBalance {
  annual?: number;
  sick?: number | { total: number; used: number; remaining: number };
  casual?: number;
  paid?: number | { total: number; used: number; remaining: number };
  unpaid?: number | { total: number; used: number; remaining: number };
}
