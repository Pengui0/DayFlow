import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppDataStore } from '../../store/dataStore';
import {
  Bell,
  Search,
  Clock,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Calendar,
  UserPlus,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { cn, getInitials } from '../../lib/utils';

interface TopbarProps {
  isCollapsed: boolean;
}

export function Topbar({ isCollapsed }: TopbarProps) {
  const { employeeProfile, role, switchUser, signOut } = useAuth();
  const { employees, leaveRequests } = useAppDataStore();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingLeaves = leaveRequests.filter((r) => r.status === 'pending');
  const filteredMatches = searchQuery.trim()
    ? employees.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-2xl border-b border-zinc-200/70 px-4 sm:px-8 flex items-center justify-between transition-all duration-300',
        isCollapsed ? 'md:ml-20' : 'md:ml-64'
      )}
    >
      {/* Left: Search & Live Clock */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
        <div className="relative w-full max-w-xs hidden sm:block">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records, staff..."
            className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-9 pr-3.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300"
          />

          {searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              {filteredMatches.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-zinc-500">No matching employee found.</div>
              ) : (
                filteredMatches.slice(0, 5).map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      navigate(`/employees`);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[9px] flex items-center justify-center font-bold">
                      {getInitials(emp.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-zinc-900 truncate">{emp.fullName}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{emp.jobTitle}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Live clock pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <Clock className="w-3 h-3 text-zinc-600 animate-pulse" />
          <span className="text-[11px] font-semibold text-zinc-900">
            {format(time, 'hh:mm:ss a')}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium pl-1.5 border-l border-zinc-200">
            {format(time, 'EEE, MMM d')}
          </span>
        </div>
      </div>

      {/* Right: Notification Pill, User Profile & Quick Switch */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 rounded-2xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingLeaves.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white backdrop-blur-2xl border border-zinc-200/90 rounded-3xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between">
                <p className="text-xs font-bold text-zinc-900">Activity & Alerts</p>
                <span className="text-[10px] text-zinc-400">
                  {pendingLeaves.length} pending
                </span>
              </div>

              <div className="py-2 max-h-60 overflow-y-auto space-y-1.5">
                {pendingLeaves.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-400">
                    No pending alerts right now
                  </div>
                ) : (
                  pendingLeaves.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/leave');
                      }}
                      className="p-2.5 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60 cursor-pointer transition-all flex items-start gap-2.5"
                    >
                      <div className="p-1.5 rounded-xl bg-amber-50 text-amber-700 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-900 truncate">
                          {req.employeeName}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          Applied for {req.leaveType} leave ({req.daysCount} days)
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-zinc-100">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/leave');
                  }}
                  className="w-full text-center text-[11px] font-semibold text-zinc-700 hover:text-zinc-900 py-1"
                >
                  View all leave requests →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1 pl-2 sm:pr-3 rounded-2xl hover:bg-zinc-100 border border-zinc-200/80 transition-all cursor-pointer bg-white shadow-2xs"
          >
            <div className="w-7 h-7 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-2xs">
              {employeeProfile?.profilePictureUrl ? (
                <img
                  src={employeeProfile.profilePictureUrl}
                  alt={employeeProfile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(employeeProfile?.fullName || 'User')
              )}
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-900 leading-tight truncate max-w-[110px]">
                {employeeProfile?.fullName || 'My Account'}
              </span>
              <span className="text-[9px] font-medium text-zinc-400 capitalize">
                {role === 'admin' ? 'HR Admin' : 'Staff'}
              </span>
            </div>

            <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:block" />
          </button>

          {/* User Profile Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white backdrop-blur-2xl border border-zinc-200/90 rounded-3xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
                    {getInitials(employeeProfile?.fullName || 'User')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {employeeProfile?.fullName || 'Logged In User'}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">
                      {employeeProfile?.email || 'user@dayflow.io'}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5">
                  <Badge variant={role === 'admin' ? 'default' : 'neutral'} size="sm">
                    {role === 'admin' ? 'HR Administrator' : 'Staff Member'}
                  </Badge>
                </div>
              </div>

              {/* Account actions */}
              <div className="py-2 space-y-0.5">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  View & Edit Profile
                </button>

                {role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/employees');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Manage Staff Directory
                  </button>
                )}
              </div>

              {/* If other accounts exist in store, allow fast switching */}
              {employees.length > 1 && (
                <div className="pt-2 border-t border-zinc-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-3 pb-1.5">
                    Switch Active Account
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {employees.map((emp) => {
                      const isCurrent = emp.id === employeeProfile?.id;
                      return (
                        <button
                          key={emp.id}
                          onClick={() => {
                            switchUser(emp.id);
                            setIsProfileOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-1.5 rounded-2xl text-left text-xs transition-colors',
                            isCurrent
                              ? 'bg-zinc-100 text-zinc-900 font-semibold'
                              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                          )}
                        >
                          <div className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-[9px] font-bold">
                            {getInitials(emp.fullName)}
                          </div>
                          <span className="truncate flex-1">{emp.fullName}</span>
                          <span className="text-[9px] text-zinc-400 capitalize">{emp.role}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sign out */}
              <div className="pt-2 border-t border-zinc-100 mt-1">
                <button
                  onClick={async () => {
                    setIsProfileOpen(false);
                    await signOut();
                    navigate('/auth');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
