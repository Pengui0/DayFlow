import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAttendance } from '../../hooks/useAttendance';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';
import { usePayroll } from '../../hooks/usePayroll';
import { LivePunchClock } from '../../components/attendance/LivePunchClock';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDateString, formatCurrency } from '../../lib/utils';
import {
  UserCheck,
  CalendarCheck,
  CalendarDays,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { employeeProfile } = useAuth();
  const navigate = useNavigate();
  const { records: attendanceRecords, isCheckedIn, todayRecord } = useAttendance();
  const { requests: leaveRequests, leaveBalance } = useLeaveRequests();
  const { userPayrollRecord } = usePayroll();

  const approvedLeaves = leaveRequests.filter((r) => r.status === 'approved');
  const pendingLeaves = leaveRequests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Staff Portal
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-[10px] font-mono text-zinc-400">ID: {employeeProfile?.employeeId || 'EMP-100'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Welcome, {employeeProfile?.fullName?.split(' ')[0] || 'Team Member'}
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg">
            {employeeProfile?.jobTitle || 'Associate'} • {employeeProfile?.department || 'Operations'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            onClick={() => navigate('/leave')}
            variant="outline"
            size="md"
            className="flex-1 sm:flex-initial text-xs"
          >
            <CalendarDays className="w-4 h-4 mr-1.5" />
            Apply for Leave
          </Button>
          <Button
            onClick={() => navigate('/payroll')}
            variant="primary"
            size="md"
            className="flex-1 sm:flex-initial text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            View Payslip
          </Button>
        </div>
      </div>

      {/* Live Punch In/Out Apple Widget */}
      <LivePunchClock />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card onClick={() => navigate('/attendance')} className="p-4 sm:p-5 cursor-pointer hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Today's Shift
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-zinc-900">
              {isCheckedIn ? 'Active Shift' : todayRecord?.checkOut ? 'Completed' : 'Not Clocked In'}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            {isCheckedIn ? `Punched in at ${todayRecord?.checkIn?.slice(11, 16) || 'Morning'}` : 'Tap Clock In widget'}
          </span>
        </Card>

        <Card onClick={() => navigate('/leave')} className="p-4 sm:p-5 cursor-pointer hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Leave Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-zinc-900">
              {leaveBalance.annual ?? 18}
            </span>
            <span className="text-[10px] text-zinc-400">days available</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            {pendingLeaves.length} pending approval
          </span>
        </Card>

        <Card onClick={() => navigate('/attendance')} className="p-4 sm:p-5 cursor-pointer hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Total Logged Days
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-zinc-900">
              {attendanceRecords.length}
            </span>
            <span className="text-[10px] text-zinc-400">sessions recorded</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            View attendance history →
          </span>
        </Card>

        <Card onClick={() => navigate('/payroll')} className="p-4 sm:p-5 cursor-pointer hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Latest Salary
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-zinc-900">
              {userPayrollRecord ? formatCurrency(userPayrollRecord.netSalary) : '$6,500'}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            {userPayrollRecord ? `Status: ${userPayrollRecord.status}` : 'Direct deposit active'}
          </span>
        </Card>
      </div>

      {/* Two Column Layout: Recent Attendance & Leave History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Attendance Sessions */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Attendance History</CardTitle>
              <p className="text-xs text-zinc-500">Your recent punch-in sessions</p>
            </div>
            <Button
              onClick={() => navigate('/attendance')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Full Log
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {attendanceRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                No attendance sessions recorded yet. Use the punch clock above to log today's shift!
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {attendanceRecords.slice(0, 4).map((record) => (
                  <div key={record.id} className="p-3.5 px-5 flex items-center justify-between hover:bg-zinc-50/80 transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">{formatDateString(record.date)}</p>
                      <p className="text-[10px] text-zinc-400">
                        {record.checkIn ? `${record.checkIn.slice(11, 16)}` : 'N/A'} {record.checkOut ? `→ ${record.checkOut.slice(11, 16)}` : '(Active)'} • {record.location || 'Office'}
                      </p>
                    </div>
                    <Badge variant={record.status === 'present' ? 'success' : 'warning'} size="sm">
                      {record.status} ({record.workHours || 8}h)
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Leave Requests */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>My Leave Requests</CardTitle>
              <p className="text-xs text-zinc-500">Time-off applications and status</p>
            </div>
            <Button
              onClick={() => navigate('/leave')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Apply New
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {leaveRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                <CalendarDays className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                You haven't submitted any leave requests yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {leaveRequests.slice(0, 4).map((req) => (
                  <div key={req.id} className="p-3.5 px-5 flex items-center justify-between hover:bg-zinc-50/80 transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-zinc-900 capitalize">{req.leaveType} Leave</p>
                      <p className="text-[10px] text-zinc-400">
                        {formatDateString(req.startDate)} to {formatDateString(req.endDate)} ({req.daysCount || 1} days)
                      </p>
                    </div>
                    <Badge
                      variant={
                        req.status === 'approved'
                          ? 'success'
                          : req.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
