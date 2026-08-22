import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppDataStore } from '../../store/dataStore';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LeaveStatusBadge } from '../../components/leave/LeaveStatusBadge';
import { formatDateString, formatCurrency, getInitials } from '../../lib/utils';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Clock,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronRight,
  Eye,
  Check,
  X,
  UserPlus,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from '../../components/ui/Toast';
import { EmptyState } from '../../components/ui/EmptyState';

export default function AdminDashboard() {
  const { employeeProfile } = useAuth();
  const navigate = useNavigate();
  const { employees, attendance, leaveRequests, payroll } = useAppDataStore();
  const { updateStatus } = useLeaveRequests();
  const [searchTerm, setSearchTerm] = useState('');

  // Key metrics
  const totalEmployees = employees.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const presentTodayCount = attendance.filter((a) => a.date === todayStr && a.status === 'present').length;
  const pendingRequests = leaveRequests.filter((r) => r.status === 'pending');
  const totalPayrollValue = payroll.reduce((acc, curr) => acc + curr.netSalary, 0);

  const filteredEmployees = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickApprove = async (leaveId: string) => {
    try {
      await updateStatus({
        leaveId,
        status: 'approved',
        adminComment: 'Approved via Admin Overview',
      });
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
      toast('Leave Approved', 'Request has been approved.', 'success');
    } catch (e: any) {
      toast('Error', e.message, 'error');
    }
  };

  const handleQuickReject = async (leaveId: string) => {
    try {
      await updateStatus({
        leaveId,
        status: 'rejected',
        adminComment: 'Declined by HR Admin',
      });
      toast('Leave Declined', 'Request marked as rejected.', 'info');
    } catch (e: any) {
      toast('Error', e.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              HR Administration
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-[10px] font-medium text-zinc-400">Dayflow Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Welcome back, {employeeProfile?.fullName?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg">
            Manage organization staff, verify live attendance records, approve leave requests, and process monthly payroll.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            onClick={() => navigate('/employees')}
            variant="primary"
            size="md"
            className="flex-1 sm:flex-initial"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add Staff
          </Button>
          <Button
            onClick={() => navigate('/payroll')}
            variant="outline"
            size="md"
            className="flex-1 sm:flex-initial"
          >
            Run Payroll
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Total Staff
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900">
              {totalEmployees}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">active members</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Present Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900">
              {presentTodayCount}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">punched in</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Pending Leaves
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900">
              {pendingRequests.length}
            </span>
            <span className="text-[10px] text-amber-800 font-medium">awaiting review</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Payroll Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900">
              {formatCurrency(totalPayrollValue)}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Staff Directory Overview & Pending Leave Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Staff Directory Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Staff Directory</CardTitle>
                <p className="text-xs text-zinc-500">Registered organization personnel</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-40 sm:w-52">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search staff..."
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
                <Button
                  onClick={() => navigate('/employees')}
                  variant="outline"
                  size="sm"
                  className="rounded-xl hidden sm:flex"
                >
                  View All
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {employees.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={Users}
                    title="No staff members registered yet"
                    description="Get started by onboarding your team members or adding staff records."
                    actionLabel="Add First Employee"
                    onAction={() => navigate('/employees')}
                    actionIcon={Plus}
                  />
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No staff members matched "{searchTerm}"
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-y border-zinc-100 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-5">Employee</th>
                        <th className="py-3 px-4">Role & Dept</th>
                        <th className="py-3 px-4">Emp ID</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredEmployees.slice(0, 5).map((emp) => (
                        <tr key={emp.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {getInitials(emp.fullName)}
                              </div>
                              <div>
                                <p className="font-semibold text-zinc-900">{emp.fullName}</p>
                                <p className="text-[10px] text-zinc-400">{emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-zinc-800">{emp.jobTitle}</p>
                            <p className="text-[10px] text-zinc-400">{emp.department}</p>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-600">
                            {emp.employeeId}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={emp.status === 'active' ? 'success' : 'neutral'} size="sm">
                              {emp.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <button
                              onClick={() => navigate(`/employees`)}
                              className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
                              title="View details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Pending Leaves Review Card */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Leave Requests</CardTitle>
                <p className="text-xs text-zinc-500">Pending administrative approval</p>
              </div>
              <Badge variant="warning" size="sm">
                {pendingRequests.length} Pending
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
              {pendingRequests.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  All leave requests are up to date!
                </div>
              ) : (
                pendingRequests.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60 space-y-2.5 transition-all hover:bg-zinc-100/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-zinc-900">{req.employeeName}</p>
                        <p className="text-[10px] text-zinc-500">
                          {req.leaveType} • {req.daysCount} days ({formatDateString(req.startDate)} to {formatDateString(req.endDate)})
                        </p>
                      </div>
                      <LeaveStatusBadge status={req.status} />
                    </div>

                    {req.reason && (
                      <p className="text-[11px] text-zinc-600 bg-white p-2 rounded-xl border border-zinc-200/60 italic line-clamp-2">
                        "{req.reason}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        onClick={() => handleQuickApprove(req.id)}
                        variant="primary"
                        size="sm"
                        className="flex-1 py-1 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleQuickReject(req.id)}
                        variant="secondary"
                        size="sm"
                        className="flex-1 py-1 text-xs gap-1 text-rose-600 hover:bg-rose-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {pendingRequests.length > 4 && (
                <Button
                  onClick={() => navigate('/leave')}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs"
                >
                  View All Requests ({pendingRequests.length}) →
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
