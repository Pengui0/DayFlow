import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../../types/attendance';
import { Badge } from '../ui/Badge';
import { formatDateString, formatTimeString } from '../../lib/utils';
import { Clock, MapPin, Search } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  isAdmin?: boolean;
  selectedEmployeeId?: string;
  onEmployeeChange?: (empId: string) => void;
  employeesList?: { id: string; fullName: string }[];
}

export function AttendanceTable({
  records,
  isAdmin = false,
  selectedEmployeeId,
  onEmployeeChange,
  employeesList = [],
}: AttendanceTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = records.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      r.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.date.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Badge variant="success">Present</Badge>;
      case 'half-day':
        return <Badge variant="warning">Half-Day</Badge>;
      case 'leave':
        return <Badge variant="neutral">On Leave</Badge>;
      case 'absent':
        return <Badge variant="danger">Absent</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Filters & Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-black/[0.05] shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Status Tabs */}
          <div className="flex p-1 rounded-xl bg-zinc-100 border border-zinc-200/60 text-xs">
            {['all', 'present', 'half-day', 'leave', 'absent'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                  filterStatus === st
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Admin Employee Filter Dropdown */}
          {isAdmin && employeesList.length > 0 && onEmployeeChange && (
            <select
              value={selectedEmployeeId || ''}
              onChange={(e) => onEmployeeChange(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            >
              <option value="">All Staff Members</option>
              {employeesList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search date or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.02)] overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={Clock}
              title="No attendance records found"
              description={
                searchQuery || filterStatus !== 'all'
                  ? 'Try clearing your filters or search keyword.'
                  : 'Start clocking in using the punch clock widget to build your logs.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-5">Date</th>
                  {isAdmin && <th className="py-3 px-4">Employee</th>}
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Work Hours</th>
                  <th className="py-3 px-5 text-right">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-zinc-900">
                      {formatDateString(r.date)}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 font-medium text-zinc-800">
                        {r.employeeName || 'Staff Member'}
                      </td>
                    )}
                    <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>
                    <td className="py-3.5 px-4 text-zinc-600 font-mono">
                      {formatTimeString(r.checkIn)}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 font-mono">
                      {formatTimeString(r.checkOut)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-zinc-900">
                        {r.workHours ? `${r.workHours} hrs` : r.status === 'present' ? '8 hrs' : '0 hrs'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        {r.location || 'Office'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
