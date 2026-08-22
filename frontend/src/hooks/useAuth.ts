import { useAuthStore } from '../store/authStore';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAppDataStore } from '../store/dataStore';
import { UserRole, Employee } from '../types/employee';

export function useAuth() {
  const { user, role, employeeProfile, session, loading, clearSession, switchUser, updateEmployeeProfile } = useAuthStore();
  const { addEmployee, employees } = useAppDataStore();

  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const demoUsers: Record<string, { role: UserRole; fullName: string; jobTitle: string; department: string }> = {
      'admin@dayflow.io': {
        role: 'admin',
        fullName: 'Admin Officer',
        jobTitle: 'HR Administrator',
        department: 'People & Ops',
      },
      'employee@dayflow.io': {
        role: 'employee',
        fullName: 'Team Associate',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
      },
    };

    const demoUser = demoUsers[normalizedEmail];
    if (demoUser) {
      const existing = employees.find((e) => e.email.toLowerCase() === normalizedEmail);
      const profile: Employee = existing || {
        id: demoUser.role === 'admin' ? 'emp-admin-1' : 'emp-staff-1',
        employeeId: demoUser.role === 'admin' ? 'EMP-1001' : 'EMP-2001',
        email: normalizedEmail,
        fullName: demoUser.fullName,
        role: demoUser.role,
        phone: demoUser.role === 'admin' ? '+1 (555) 010-1001' : '+1 (555) 010-2001',
        address: 'HQ, San Francisco',
        jobTitle: demoUser.jobTitle,
        department: demoUser.department,
        profilePictureUrl: '',
        createdAt: new Date().toISOString(),
        status: 'active',
      };

      addEmployee(profile);
      useAuthStore.getState().setSession({ access_token: `token-${profile.id}`, user: profile }, profile);
      return { success: true, role: demoUser.role };
    }

    // If Supabase is configured, use Supabase Auth strictly and do not auto-create users.
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'Password123!',
        });

        if (error) {
          return { success: false, error: error.message || 'Invalid email or password' };
        }

        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (empError) {
          return { success: false, error: empError.message || 'Your account profile could not be loaded.' };
        }

        if (!empData) {
          return { success: false, error: 'No matching employee account was found for this email.' };
        }

        const userRole = empData.role || data.user.user_metadata?.role || 'employee';
        useAuthStore.getState().setSession(data.session, {
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
        });

        return { success: true, role: userRole };
      } catch (err: any) {
        return { success: false, error: err.message || 'Authentication failed' };
      }
    }

    // Local demo mode only when Supabase is intentionally not configured.
    const matched = employees.find(e => e.email.toLowerCase() === normalizedEmail);

    if (matched) {
      useAuthStore.getState().setSession({ access_token: `token-${matched.id}`, user: matched }, matched);
      return { success: true, role: matched.role };
    }

    return { success: false, error: 'No local demo account was found for this email.' };
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
