import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Employee, UserRole } from '../types/employee';
import { useAppDataStore } from './dataStore';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    employee_id?: string;
    role?: UserRole;
    full_name?: string;
  };
}

interface AuthState {
  user: AuthUser | null;
  role: UserRole;
  employeeProfile: Employee | null;
  session: any | null;
  loading: boolean;
  setSession: (session: any, profile?: Employee | null) => void;
  clearSession: () => Promise<void>;
  switchUser: (employeeId: string) => void;
  updateEmployeeProfile: (updated: Partial<Employee>) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: 'employee',
      employeeProfile: null,
      session: null,
      loading: false,

      setSession: (session: any, profile?: Employee | null) => {
        if (!session) {
          set({ user: null, role: 'employee', employeeProfile: null, session: null, loading: false });
          return;
        }

        const user = session.user || session;
        const role: UserRole = profile?.role || user?.user_metadata?.role || 'employee';

        // Check if profile exists in dataStore or use provided
        const allEmployees = useAppDataStore.getState().employees;
        const found = profile || allEmployees.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase() || e.id === user?.id);

        const finalProfile: Employee = found || {
          id: user.id || `emp-${Date.now()}`,
          employeeId: user.user_metadata?.employee_id || `EMP-${Math.floor(100 + Math.random() * 900)}`,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Team Member',
          role,
          phone: '+1 (555) 000-0000',
          address: 'Main Office',
          jobTitle: role === 'admin' ? 'HR Administrator' : 'Software Engineer',
          department: role === 'admin' ? 'People & Operations' : 'Engineering',
          profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
          createdAt: new Date().toISOString(),
          status: 'active',
        };

        // Ensure user is also in dataStore
        useAppDataStore.getState().addEmployee(finalProfile);

        set({
          user: {
            id: finalProfile.id,
            email: finalProfile.email,
            user_metadata: {
              employee_id: finalProfile.employeeId,
              role: finalProfile.role,
              full_name: finalProfile.fullName,
            },
          },
          role: finalProfile.role,
          employeeProfile: finalProfile,
          session: session,
          loading: false,
        });
      },

      clearSession: async () => {
        try {
          if (isSupabaseConfigured) {
            await supabase.auth.signOut();
          }
        } catch (err) {
          console.warn('Error signing out:', err);
        }
        set({
          user: null,
          role: 'employee',
          employeeProfile: null,
          session: null,
          loading: false,
        });
      },

      switchUser: (employeeId: string) => {
        const allEmployees = useAppDataStore.getState().employees;
        const emp = allEmployees.find(e => e.id === employeeId || e.employeeId === employeeId);
        if (!emp) return;

        set({
          user: {
            id: emp.id,
            email: emp.email,
            user_metadata: {
              employee_id: emp.employeeId,
              role: emp.role,
              full_name: emp.fullName,
            },
          },
          role: emp.role,
          employeeProfile: emp,
          session: { access_token: `sess-${emp.id}`, user: emp },
          loading: false,
        });
      },

      updateEmployeeProfile: (updated: Partial<Employee>) => {
        const current = get().employeeProfile;
        if (!current) return;
        const merged = { ...current, ...updated };
        useAppDataStore.getState().updateEmployee(current.id, updated);
        set({ employeeProfile: merged });
      },

      initializeAuth: async () => {
        if (!isSupabaseConfigured) {
          return;
        }

        try {
          set({ loading: true });
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const { data: empData } = await supabase
              .from('employees')
              .select('*')
              .eq('email', session.user.email)
              .single();

            get().setSession(session, empData ? {
              id: empData.id,
              employeeId: empData.employee_id,
              email: empData.email,
              fullName: empData.full_name,
              role: empData.role,
              phone: empData.phone,
              address: empData.address,
              jobTitle: empData.job_title,
              profilePictureUrl: empData.profile_picture_url,
              createdAt: empData.created_at,
              status: empData.status || 'active',
            } : null);
          }

          supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (newSession) {
              const { data: empData } = await supabase
                .from('employees')
                .select('*')
                .eq('email', newSession.user.email)
                .single();

              get().setSession(newSession, empData ? {
                id: empData.id,
                employeeId: empData.employee_id,
                email: empData.email,
                fullName: empData.full_name,
                role: empData.role,
                phone: empData.phone,
                address: empData.address,
                jobTitle: empData.job_title,
                profilePictureUrl: empData.profile_picture_url,
                createdAt: empData.created_at,
                status: empData.status || 'active',
              } : null);
            } else {
              get().setSession(null);
            }
          });
        } catch (err) {
          console.warn('Auth init failed:', err);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'dayflow-auth-session',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        employeeProfile: state.employeeProfile,
        session: state.session,
      }),
    }
  )
);
