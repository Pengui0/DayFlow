import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { PayrollRecord } from '../types/payroll';

export function usePayroll(selectedMonth = 8, selectedYear = 2026, employeeIdFilter?: string) {
  const queryClient = useQueryClient();
  const currentEmployee = useAuthStore((s) => s.employeeProfile);
  const currentRole = useAuthStore((s) => s.role);
  const { payroll, updatePayrollRecord: localUpdatePayroll, createPayrollRecord: localCreatePayroll } = useAppDataStore();

  const targetEmpId = currentRole === 'admin' ? employeeIdFilter : currentEmployee?.id;

  const payrollQuery = useQuery({
    queryKey: ['payroll', selectedMonth, selectedYear, targetEmpId],
    queryFn: async (): Promise<PayrollRecord[]> => {
      if (isSupabaseConfigured) {
        try {
          let query = supabase
            .from('payroll')
            .select('*, employees(full_name, job_title, email, department)')
            .eq('month', selectedMonth)
            .eq('year', selectedYear);

          if (targetEmpId) {
            query = query.eq('employee_id', targetEmpId);
          }

          const { data, error } = await query;
          if (!error && data) {
            return data.map((item: any) => ({
              id: item.id,
              employeeId: item.employee_id,
              employeeName: item.employees?.full_name || 'Staff Member',
              jobTitle: item.employees?.job_title,
              department: item.employees?.department,
              email: item.employees?.email,
              basicSalary: Number(item.basic_salary),
              allowances: Number(item.allowances),
              deductions: Number(item.deductions),
              netSalary: Number(item.net_salary),
              month: item.month,
              year: item.year,
              status: 'paid',
            }));
          }
        } catch (e) {
          console.warn('Supabase payroll query error:', e);
        }
      }

      let list = payroll.filter(
        (p) => p.month === selectedMonth && p.year === selectedYear
      );

      if (targetEmpId) {
        list = list.filter((p) => p.employeeId === targetEmpId);
      }

      return list;
    },
  });

  const updatePayrollMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<PayrollRecord>;
    }) => {
      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('payroll')
            .update({
              basic_salary: updates.basicSalary,
              allowances: updates.allowances,
              deductions: updates.deductions,
              net_salary: (updates.basicSalary || 0) + (updates.allowances || 0) - (updates.deductions || 0),
            })
            .eq('id', id);
        } catch (e) {
          console.warn('Supabase payroll update error:', e);
        }
      }

      localUpdatePayroll(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
  });

  // Current employee's own record for the selected month
  const userPayrollRecord = payroll.find(
    (p) => p.employeeId === currentEmployee?.id && p.month === selectedMonth && p.year === selectedYear
  ) || payroll.find((p) => p.employeeId === currentEmployee?.id) || payroll[1];

  return {
    records: payrollQuery.data || payroll,
    userPayrollRecord,
    isLoading: payrollQuery.isLoading,
    refetch: payrollQuery.refetch,
    updatePayroll: (id: string, updates: Partial<PayrollRecord>) => updatePayrollMutation.mutateAsync({ id, updates }),
    isUpdating: updatePayrollMutation.isPending,
  };
}
