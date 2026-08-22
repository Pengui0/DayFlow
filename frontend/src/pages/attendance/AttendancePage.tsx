import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAttendance } from '../../hooks/useAttendance';
import { useAppDataStore } from '../../store/dataStore';
import { LivePunchClock } from '../../components/attendance/LivePunchClock';
import { AttendanceTable } from '../../components/attendance/AttendanceTable';
import { Card } from '../../components/ui/Card';
import {
  Clock,
  UserCheck,
  Percent,
  CalendarCheck,
} from 'lucide-react';

export default function AttendancePage() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [searchParams, setSearchParams] = useSearchParams();
  const employeeFilter = searchParams.get('employeeId') || '';

  const { records, totalWorkHoursThisMonth } = useAttendance();
  const { employees } = useAppDataStore();

  const displayedRecords = employeeFilter
    ? records.filter((r) => r.employeeId === employeeFilter)
    : records;

  const handleEmployeeChange = (empId: string) => {
    if (empId) {
      setSearchParams({ employeeId: empId });
    } else {
      setSearchParams({});
    }
  };

  const presentCount = displayedRecords.filter((r) => r.status === 'present').length;
  const halfDayCount = displayedRecords.filter((r) => r.status === 'half-day').length;
  const attendanceRate = displayedRecords.length > 0
    ? Math.min(100, Math.round(((presentCount + halfDayCount * 0.5) / displayedRecords.length) * 100))
    : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Shift Records
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-[10px] font-medium text-zinc-400">Live Timestamping</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Attendance Logs
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg">
            {isAdmin
              ? 'Monitor live punch logs, timestamps, and compliance across all registered team members.'
              : 'Track your daily shift timestamps, recorded hours, and overall attendance percentage.'}
          </p>
        </div>
      </div>

      {/* Punch In / Out Button for Employee */}
      {!isAdmin && <LivePunchClock />}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Total Logged Shifts
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900">
              {displayedRecords.length}
            </span>
            <span className="text-[10px] text-zinc-400">shifts recorded</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Recorded Hours (Month)
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900">
              {totalWorkHoursThisMonth}
            </span>
            <span className="text-[10px] text-zinc-400">billable hours</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Attendance Health
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">
              {attendanceRate}%
            </span>
            <span className="text-[10px] text-zinc-400">punctuality index</span>
          </div>
        </Card>
      </div>

      {/* Attendance Table */}
      <AttendanceTable
        records={displayedRecords}
        isAdmin={isAdmin}
        selectedEmployeeId={employeeFilter}
        onEmployeeChange={handleEmployeeChange}
        employeesList={employees.map((e) => ({ id: e.id, fullName: e.fullName }))}
      />
    </div>
  );
}
