import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';
import { LeaveRequestForm } from '../../components/leave/LeaveRequestForm';
import { LeaveApprovalTable } from '../../components/leave/LeaveApprovalTable';
import { LeaveStatusBadge } from '../../components/leave/LeaveStatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatDateString } from '../../lib/utils';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export default function LeavePage() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const {
    requests,
    leaveBalance,
    updateStatus,
    isUpdatingStatus,
  } = useLeaveRequests();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Time Off & Absences
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-[10px] font-medium text-zinc-400">PTO Quota Tracker</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Leave Management
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg">
            {isAdmin
              ? 'Review, approve, or reject employee leave requests and monitor org-wide PTO capacity.'
              : 'Submit time-off requests, check leave balances, and track approval status.'}
          </p>
        </div>

        {!isAdmin && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsApplyModalOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Request Time Off
          </Button>
        )}
      </div>

      {/* Quota Cards for Employee or Metrics for Admin */}
      {!isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Annual Vacation Leave
              </span>
              <CalendarDays className="w-4 h-4 text-zinc-700" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {leaveBalance.annual}
              </span>
              <span className="text-xs text-zinc-400">days available</span>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Sick / Medical Leave
              </span>
              <CalendarDays className="w-4 h-4 text-zinc-700" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {leaveBalance.sick}
              </span>
              <span className="text-xs text-zinc-400">days available</span>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Casual / Emergency Leave
              </span>
              <CalendarDays className="w-4 h-4 text-zinc-700" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {leaveBalance.casual}
              </span>
              <span className="text-xs text-zinc-400">days available</span>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Pending Approval
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-700">{pendingCount}</span>
              <span className="text-xs text-zinc-400">action required</span>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Approved
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">{approvedCount}</span>
              <span className="text-xs text-zinc-400">requests granted</span>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Declined
              </span>
              <XCircle className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-700">{rejectedCount}</span>
              <span className="text-xs text-zinc-400">rejected requests</span>
            </div>
          </Card>
        </div>
      )}

      {/* Main List Section */}
      {isAdmin ? (
        <LeaveApprovalTable
          requests={requests}
          onUpdateStatus={updateStatus}
          isLoading={isUpdatingStatus}
        />
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>My Leave History</CardTitle>
              <p className="text-xs text-zinc-500">Track the status of all your submitted leave applications</p>
            </div>
            <Button
              onClick={() => setIsApplyModalOpen(true)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Application
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="p-10">
                <EmptyState
                  icon={Calendar}
                  title="No leave requests submitted yet"
                  description="Apply for vacation, sick days, or emergency time off anytime."
                  actionLabel="Apply for Time Off"
                  onAction={() => setIsApplyModalOpen(true)}
                  actionIcon={Plus}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-5">Leave Category</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Reason / Notes</th>
                      <th className="py-3 px-4">Admin Response</th>
                      <th className="py-3 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-zinc-900 capitalize">
                          {req.leaveType}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-700">
                          {formatDateString(req.startDate)} → {formatDateString(req.endDate)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-zinc-800">
                          {req.daysCount} day{req.daysCount > 1 ? 's' : ''}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 max-w-xs truncate">
                          {req.reason || req.remarks || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 italic">
                          {req.adminComment || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <LeaveStatusBadge status={req.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal for Employee to Apply for Leave */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Time Off"
        description="Select your leave category, dates, and submit your request for approval."
      >
        <LeaveRequestForm onSuccess={() => setIsApplyModalOpen(false)} />
      </Modal>
    </div>
  );
}
