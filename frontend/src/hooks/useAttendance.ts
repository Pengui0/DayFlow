import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { AttendanceRecord } from '../types/attendance';
import { format } from 'date-fns';

export function useAttendance(employeeIdFilter?: string) {
  const queryClient = useQueryClient();
  const currentEmployee = useAuthStore((s) => s.employeeProfile);
  const currentRole = useAuthStore((s) => s.role);
  const { attendance, checkIn: localCheckIn, checkOut: localCheckOut } = useAppDataStore();

  const targetEmpId = currentRole === 'admin' ? employeeIdFilter : currentEmployee?.id;

  const attendanceQuery = useQuery({
    queryKey: ['attendance', targetEmpId],
    queryFn: async (): Promise<AttendanceRecord[]> => {
      if (isSupabaseConfigured) {
        try {
          let query = supabase.from('attendance').select('*, employees(full_name, profile_picture_url)');
          if (targetEmpId) {
            query = query.eq('employee_id', targetEmpId);
          }
          const { data, error } = await query.order('date', { ascending: false });
          if (!error && data) {
            return data.map((item: any) => ({
              id: item.id,
              employeeId: item.employee_id,
              employeeName: item.employees?.full_name || 'Staff Member',
              employeeAvatar: item.employees?.profile_picture_url,
              date: item.date,
              checkIn: item.check_in,
              checkOut: item.check_out,
              status: item.status,
              workHours: item.work_hours || (item.check_in && item.check_out ? 8 : undefined),
            }));
          }
        } catch (e) {
          console.warn('Supabase query failed, using local store:', e);
        }
      }

      // Fallback local store query
      let records = attendance;
      if (targetEmpId) {
        records = records.filter((r) => r.employeeId === targetEmpId);
      }
      return records;
    },
  });

  // Today's attendance for current user
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayRecord = attendance.find(
    (r) => r.employeeId === currentEmployee?.id && r.date === todayStr
  );

  const isCheckedIn = Boolean(todayRecord?.checkIn && !todayRecord?.checkOut);
  const isCheckedOut = Boolean(todayRecord?.checkIn && todayRecord?.checkOut);

  // Total work hours this month
  const totalWorkHoursThisMonth = (attendanceQuery.data || attendance)
    .filter((r) => !targetEmpId || r.employeeId === targetEmpId)
    .reduce((acc, curr) => acc + (curr.workHours || (curr.status === 'present' ? 8 : curr.status === 'half-day' ? 4 : 0)), 0);

  // Mutations
  const checkInMutation = useMutation({
    mutationFn: async (location?: string) => {
      if (!currentEmployee?.id) throw new Error('Not logged in');

      if (isSupabaseConfigured) {
        try {
          const nowIso = new Date().toISOString();
          await supabase.from('attendance').insert({
            employee_id: currentEmployee.id,
            date: todayStr,
            check_in: nowIso,
            status: 'present',
          });
        } catch (e) {
          console.warn('Supabase checkin error, applying locally:', e);
        }
      }

      return localCheckIn(currentEmployee.id, location || 'Remote / Office');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      if (!currentEmployee?.id) throw new Error('Not logged in');

      if (isSupabaseConfigured) {
        try {
          const nowIso = new Date().toISOString();
          await supabase
            .from('attendance')
            .update({
              check_out: nowIso,
            })
            .eq('employee_id', currentEmployee.id)
            .eq('date', todayStr);
        } catch (e) {
          console.warn('Supabase checkout error, applying locally:', e);
        }
      }

      return localCheckOut(currentEmployee.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  return {
    records: attendanceQuery.data || attendance,
    isLoading: attendanceQuery.isLoading,
    refetch: attendanceQuery.refetch,
    todayRecord,
    isCheckedIn,
    isCheckedOut,
    totalWorkHoursThisMonth,
    checkIn: (location?: string) => checkInMutation.mutateAsync(location),
    checkOut: () => checkOutMutation.mutateAsync(),
    isCheckInLoading: checkInMutation.isPending,
    isCheckOutLoading: checkOutMutation.isPending,
  };
}
