import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { LeaveRequest, LeaveBalance, LeaveType } from '../types/leave';

export function useLeaveRequests(employeeIdFilter?: string) {
  const queryClient = useQueryClient();
  const currentEmployee = useAuthStore((s) => s.employeeProfile);
  const currentRole = useAuthStore((s) => s.role);
  const { leaveRequests, submitLeaveRequest: localSubmit, updateLeaveStatus: localUpdateStatus } = useAppDataStore();

  const targetEmpId = currentRole === 'admin' ? employeeIdFilter : currentEmployee?.id;

  const leaveQuery = useQuery({
    queryKey: ['leaveRequests', targetEmpId],
    queryFn: async (): Promise<LeaveRequest[]> => {
      if (isSupabaseConfigured) {
        try {
          let query = supabase.from('leave_requests').select('*, employees(full_name, profile_picture_url, job_title)');
          if (targetEmpId) {
            query = query.eq('employee_id', targetEmpId);
          }
          const { data, error } = await query.order('created_at', { ascending: false });
          if (!error && data) {
            return data.map((item: any) => ({
              id: item.id,
              employeeId: item.employee_id,
              employeeName: item.employees?.full_name || 'Staff Member',
              employeeAvatar: item.employees?.profile_picture_url,
              jobTitle: item.employees?.job_title,
              leaveType: item.leave_type,
              startDate: item.start_date,
              endDate: item.end_date,
              remarks: item.remarks,
              reason: item.remarks,
              status: item.status,
              adminComment: item.admin_comment,
              createdAt: item.created_at,
            }));
          }
        } catch (e) {
          console.warn('Supabase leave query failed, using local store:', e);
        }
      }

      let list = leaveRequests;
      if (targetEmpId) {
        list = list.filter((r) => r.employeeId === targetEmpId);
      }
      return list;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: {
      leaveType: LeaveType;
      startDate: string;
      endDate: string;
      remarks: string;
      reason?: string;
    }) => {
      if (!currentEmployee?.id) throw new Error('Not authenticated');

      if (isSupabaseConfigured) {
        try {
          await supabase.from('leave_requests').insert({
            employee_id: currentEmployee.id,
            leave_type: data.leaveType,
            start_date: data.startDate,
            end_date: data.endDate,
            remarks: data.remarks || data.reason || '',
            status: 'pending',
          });
        } catch (e) {
          console.warn('Supabase leave insert failed:', e);
        }
      }

      return localSubmit({
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.fullName,
        employeeAvatar: currentEmployee.profilePictureUrl,
        jobTitle: currentEmployee.jobTitle,
        department: currentEmployee.department,
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        remarks: data.remarks || data.reason || '',
        reason: data.remarks || data.reason || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      leaveId,
      status,
      adminComment,
    }: {
      leaveId: string;
      status: 'approved' | 'rejected';
      adminComment?: string;
    }) => {
      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('leave_requests')
            .update({
              status,
              admin_comment: adminComment,
            })
            .eq('id', leaveId);
        } catch (e) {
          console.warn('Supabase leave status update error:', e);
        }
      }

      localUpdateStatus(leaveId, status, adminComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });

  // Calculate balance for current employee
  const currentEmpLeaves = leaveRequests.filter((r) => r.employeeId === (currentEmployee?.id || 'emp-002'));
  const approvedAnnualDays = currentEmpLeaves
    .filter((r) => (r.leaveType === 'annual' || r.leaveType === 'paid') && r.status === 'approved')
    .reduce((acc, r) => acc + (r.daysCount || 1), 0);
  const approvedSickDays = currentEmpLeaves
    .filter((r) => r.leaveType === 'sick' && r.status === 'approved')
    .reduce((acc, r) => acc + (r.daysCount || 1), 0);
  const approvedCasualDays = currentEmpLeaves
    .filter((r) => (r.leaveType === 'casual' || r.leaveType === 'unpaid') && r.status === 'approved')
    .reduce((acc, r) => acc + (r.daysCount || 1), 0);

  const leaveBalance: LeaveBalance & { annual: number; sick: number; casual: number; paid: number; unpaid: number } = {
    annual: Math.max(0, 18 - approvedAnnualDays),
    sick: Math.max(0, 12 - approvedSickDays),
    casual: Math.max(0, 10 - approvedCasualDays),
    paid: Math.max(0, 18 - approvedAnnualDays),
    unpaid: Math.max(0, 30 - approvedCasualDays),
  };

  return {
    requests: leaveQuery.data || leaveRequests,
    isLoading: leaveQuery.isLoading,
    refetch: leaveQuery.refetch,
    leaveBalance,
    submitLeave: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
