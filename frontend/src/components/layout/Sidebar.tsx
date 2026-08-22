import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppDataStore } from '../../store/dataStore';
import {
  LayoutDashboard,
  UserCheck,
  CalendarCheck,
  CalendarDays,
  FileSpreadsheet,
  BarChart3,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  icon: any;
  to: string;
  badge?: number | string;
}

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { role, employeeProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { leaveRequests } = useAppDataStore();

  const pendingLeavesCount = leaveRequests.filter((r) => r.status === 'pending').length;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const employeeLinks: NavItem[] = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: '/dashboard',
    },
    {
      label: 'My Profile',
      icon: UserCheck,
      to: '/profile',
    },
    {
      label: 'Attendance',
      icon: CalendarCheck,
      to: '/attendance',
    },
    {
      label: 'Leave Requests',
      icon: CalendarDays,
      to: '/leave',
    },
    {
      label: 'My Payroll',
      icon: FileSpreadsheet,
      to: '/payroll',
    },
  ];

  const adminLinks: NavItem[] = [
    {
      label: 'Overview',
      icon: LayoutDashboard,
      to: '/dashboard',
    },
    {
      label: 'Staff Directory',
      icon: Users,
      to: '/employees',
    },
    {
      label: 'Attendance',
      icon: CalendarCheck,
      to: '/attendance',
    },
    {
      label: 'Leave Approvals',
      icon: CalendarDays,
      to: '/leave',
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
    },
    {
      label: 'Payroll',
      icon: FileSpreadsheet,
      to: '/payroll',
    },
    {
      label: 'Reports & Analytics',
      icon: BarChart3,
      to: '/reports',
    },
    {
      label: 'My Profile',
      icon: UserCheck,
      to: '/profile',
    },
  ];

  const links: NavItem[] = role === 'admin' ? adminLinks : employeeLinks;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-white/85 backdrop-blur-2xl border-r border-zinc-200/70 transition-all duration-300 ease-in-out shadow-[0_0_20px_rgba(0,0,0,0.02)]',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 min-w-[2.25rem] rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-bold text-base shadow-xs">
            D
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-zinc-900 leading-tight">
                Dayflow
              </span>
              <span className="text-[10px] font-medium text-zinc-400">
                {role === 'admin' ? 'HR Console' : 'Staff Portal'}
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {!isCollapsed ? 'Menu' : '•••'}
        </div>

        {links.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-150 relative',
                isActive
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'w-4 h-4 min-w-[1rem] transition-transform group-hover:scale-105',
                  isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'
                )}
              />

              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={cn(
                    'ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-800'
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Indicator dot when collapsed */}
              {isCollapsed && item.badge !== undefined && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role Badge Banner when expanded */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-3 rounded-2xl bg-zinc-50 border border-zinc-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-700 shadow-2xs">
              {role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-900 truncate">
                {role === 'admin' ? 'Admin Access' : 'Staff Access'}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                {employeeProfile?.department || 'Dayflow'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logout button */}
      <div className="p-3 border-t border-zinc-100">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-medium text-rose-600 hover:bg-rose-50/80 transition-all duration-150 group',
            isCollapsed && 'justify-center px-0'
          )}
          title="Sign out"
        >
          <LogOut className="w-4 h-4 min-w-[1rem] group-hover:-translate-x-0.5 transition-transform" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
