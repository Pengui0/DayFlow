import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Employee } from '../types/employee';

export function useEmployees(selectedEmployeeId?: string) {
  const queryClient = useQueryClient();
  const { employees, updateEmployee: localUpdateEmployee, addEmployee: localAddEmployee } = useAppDataStore();
  const { updateEmployeeProfile } = useAuthStore();

  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: async (): Promise<Employee[]> => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from('employees').select('*').order('full_name');
          if (!error && data) {
            return data.map((item: any) => ({
              id: item.id,
              employeeId: item.employee_id,
              email: item.email,
              fullName: item.full_name,
              role: item.role,
              phone: item.phone,
              address: item.address,
              jobTitle: item.job_title,
              department: item.department || 'General',
              profilePictureUrl: item.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
              createdAt: item.created_at,
              status: item.status || 'active',
            }));
          }
        } catch (e) {
          console.warn('Supabase employees query error:', e);
        }
      }

      return employees;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Employee>;
    }) => {
      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('employees')
            .update({
              full_name: data.fullName,
              phone: data.phone,
              address: data.address,
              job_title: data.jobTitle,
              profile_picture_url: data.profilePictureUrl,
            })
            .eq('id', id);
        } catch (e) {
          console.warn('Supabase employee update error:', e);
        }
      }

      localUpdateEmployee(id, data);
      updateEmployeeProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (newEmpData: Omit<Employee, 'id'>) => {
      const generatedId = `emp-${Date.now()}`;
      const newEmp: Employee = {
        ...newEmpData,
        id: generatedId,
        employeeId: newEmpData.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        status: newEmpData.status || 'active',
      };

      if (isSupabaseConfigured) {
        try {
          await supabase.from('employees').insert({
            employee_id: newEmp.employeeId,
            email: newEmp.email,
            full_name: newEmp.fullName,
            role: newEmp.role,
            phone: newEmp.phone,
            address: newEmp.address,
            job_title: newEmp.jobTitle,
            department: newEmp.department,
            profile_picture_url: newEmp.profilePictureUrl,
            created_at: newEmp.createdAt,
            status: newEmp.status,
          });
        } catch (e) {
          console.warn('Supabase employee insert error:', e);
        }
      }

      localAddEmployee(newEmp);
      return newEmp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const uploadProfilePicture = async (file: File): Promise<string> => {
    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage.from('profile-pictures').getPublicUrl(filePath);
          if (data?.publicUrl) return data.publicUrl;
        }
      } catch (e) {
        console.warn('Storage upload failed, falling back to local object URL:', e);
      }
    }

    // Fallback URL
    return URL.createObjectURL(file);
  };

  const selectedEmployee = selectedEmployeeId
    ? employees.find((e) => e.id === selectedEmployeeId || e.employeeId === selectedEmployeeId)
    : null;

  return {
    employees: employeesQuery.data || employees,
    isLoading: employeesQuery.isLoading,
    selectedEmployee,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    createEmployee: createEmployeeMutation.mutateAsync,
    isCreating: createEmployeeMutation.isPending,
    uploadProfilePicture,
  };
}
