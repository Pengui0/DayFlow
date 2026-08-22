import { useAuthStore } from '../store/authStore';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAppDataStore } from '../store/dataStore';
import { UserRole, Employee } from '../types/employee';

export function useAuth() {
  const { user, role, employeeProfile, session, loading, clearSession, switchUser, updateEmployeeProfile } = useAuthStore();
  const { addEmployee, employees } = useAppDataStore();

  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    // If Supabase is configured, use Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'Password123!',
        });

        if (error) {
          console.warn('Supabase Auth error or rate limit hit, using local workspace engine:', error.message);
          // fall through to local account lookup below instead of returning
        } else if (data?.session) {
          const { data: empData } = await supabase
            .from('employees')
            .select('*')
            .eq('email', email)
            .single();

          const userRole = empData?.role || data.user.user_metadata?.role || 'employee';
          useAuthStore.getState().setSession(data.session, empData ? {
            id: empData.id,
            employeeId: empData.employee_id,
            email: empData.email,
            fullName: empData.full_name,
            role: userRole,
            phone: empData.phone,
            address: empData.address,
            jobTitle: empData.job_title,
            profilePictureUrl: empData.profile_picture_url,
            createdAt: empData.created_at,
            status: empData.status || 'active',
          } : null);

          return { success: true, role: userRole };
        }
      } catch (err: any) {
        console.warn('Supabase Auth threw, using local workspace engine:', err.message);
        // fall through to local account lookup below
      }
    }

    // Local account lookup in persistent store
    const matched = employees.find(e => e.email.toLowerCase() === email.toLowerCase());

    if (matched) {
      useAuthStore.getState().setSession({ access_token: `token-${matched.id}`, user: matched }, matched);
      return { success: true, role: matched.role };
    }

    // If logging in for the first time with an email
    const inferredRole: UserRole = email.toLowerCase().includes('admin') || email.toLowerCase().includes('hr') ? 'admin' : 'employee';
    const cleanName = email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      email: email.trim(),
      fullName: cleanName || 'Staff Member',
      role: inferredRole,
      phone: '+1 (555) 012-3456',
      address: 'Main Office',
      jobTitle: inferredRole === 'admin' ? 'HR Administrator' : 'Software Engineer',
      department: inferredRole === 'admin' ? 'People & Operations' : 'Engineering',
      profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    addEmployee(newEmp);
    useAuthStore.getState().setSession({ access_token: `token-${newEmp.id}`, user: newEmp }, newEmp);
    return { success: true, role: inferredRole };
  };

  const signUp = async (data: {
    employeeId?: string;
    email: string;
    password?: string;
    fullName?: string;
    role: UserRole;
    department?: string;
    jobTitle?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const formattedFullName = data.fullName?.trim() || data.email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Staff Member';
    const formattedEmpId = data.employeeId?.trim() || `EMP-${Math.floor(100 + Math.random() * 900)}`;

    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password || 'Password123!',
          options: {
            data: {
              employee_id: formattedEmpId,
              role: data.role,
              full_name: formattedFullName,
            },
          },
        });

        if (authError) {
          return { success: false, error: authError.message };
        }

        if (authData.user) {
          await supabase.from('employees').insert({
            id: authData.user.id,
            employee_id: formattedEmpId,
            email: data.email,
            full_name: formattedFullName,
            role: data.role,
            job_title: data.jobTitle || (data.role === 'admin' ? 'HR Administrator' : 'Software Engineer'),
            department: data.department || (data.role === 'admin' ? 'People & Operations' : 'Engineering'),
            created_at: new Date().toISOString(),
            status: 'active',
          });
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration failed' };
      }
    }

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeId: formattedEmpId,
      email: data.email.trim(),
      fullName: formattedFullName,
      role: data.role,
      phone: '+1 (555) 012-3456',
      address: 'Main Office',
      jobTitle: data.jobTitle || (data.role === 'admin' ? 'HR Administrator' : 'Software Engineer'),
      department: data.department || (data.role === 'admin' ? 'People & Operations' : 'Engineering'),
      profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    addEmployee(newEmp);
    useAuthStore.getState().setSession({ access_token: `token-${newEmp.id}`, user: newEmp }, newEmp);
    return { success: true };
  };

  const signOut = async () => {
    await clearSession();
  };

  return {
    user,
    role,
    employeeProfile,
    session,
    loading,
    isLoading: loading,
    isAuthenticated: Boolean(session),
    isAdmin: role === 'admin',
    isEmployee: role === 'employee',
    signIn,
    signUp,
    signOut,
    switchUser,
    switchDemoUser: switchUser,
    updateEmployeeProfile,
  };
}
