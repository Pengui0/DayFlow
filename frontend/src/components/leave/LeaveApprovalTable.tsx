import React, { useState } from 'react';
import { LeaveRequest } from '../../types/leave';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { formatDateString, getInitials } from '../../lib/utils';
import { Check, X, Calendar, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EmptyState } from '../ui/EmptyState';

interface LeaveApprovalTableProps {
  requests: LeaveRequest[];
  onUpdateStatus: (data: {
    leaveId: string;
    status: 'approved' | 'rejected';
    adminComment?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function LeaveApprovalTable({ requests, onUpdateStatus, isLoading }: LeaveApprovalTableProps) {
  const [adminComments, setAdminComments] = useState<{ [key: string]: string }>({});
  const [activeProcessingId, setActiveProcessingId] = useState<string | null>(null);

  const handleAction = async (leaveId: string, status: 'approved' | 'rejected') => {
    setActiveProcessingId(leaveId);
    try {
      const comment = adminComments[leaveId] || (status === 'approved' ? 'Approved by HR Operations' : 'Declined per team requirements');
      await onUpdateStatus({ leaveId, status, adminComment: comment });

      if (status === 'approved') {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
        toast('Request Approved', 'The employee request has been approved.', 'success');
      } else {
        toast('Request Declined', 'Leave application marked as rejected.', 'info');
      }
    } catch (err: any) {
      toast('Update Failed', err.message || 'Could not update leave request', 'error');
    } finally {
      setActiveProcessingId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-black/[0.05] p-10 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
        <EmptyState
          icon={Calendar}
          title="No leave applications yet"
          description="When employees submit leave or PTO requests, they will appear here for review."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-5">Staff Member</th>
              <th className="py-3.5 px-4">Leave Type</th>
              <th className="py-3.5 px-4">Date Span</th>
              <th className="py-3.5 px-4">Reason</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 min-w-[200px]">Admin Note</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {requests.map((req) => {
              const isProcessing = activeProcessingId === req.id;
              const isPending = req.status === 'pending';

              return (
                <tr key={req.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-zinc-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(req.employeeName)}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">{req.employeeName || 'Staff Member'}</p>
                        <p className="text-[10px] text-zinc-400">ID: {req.employeeId}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 capitalize font-semibold text-zinc-800">
                    {req.leaveType}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-zinc-700">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>
                        {formatDateString(req.startDate)} → {formatDateString(req.endDate)}
                      </span>
                    </div>
                    {req.daysCount && (
                      <span className="text-[10px] text-zinc-400">
                        ({req.daysCount} day{req.daysCount > 1 ? 's' : ''})
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-[200px]">
                    <p className="text-zinc-600 truncate" title={req.reason || req.remarks}>
                      {req.reason || req.remarks || 'No reason provided'}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <LeaveStatusBadge status={req.status} />
                  </td>

                  <td className="py-3.5 px-4">
                    {isPending ? (
                      <input
                        type="text"
                        placeholder="Add response note..."
                        value={adminComments[req.id] || ''}
                        onChange={(e) =>
                          setAdminComments({ ...adminComments, [req.id]: e.target.value })
                        }
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                      />
                    ) : (
                      <span className="text-[11px] text-zinc-500 italic">
                        {req.adminComment || '—'}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    {isPending ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => handleAction(req.id, 'approved')}
                          variant="primary"
                          size="sm"
                          isLoading={isProcessing}
                          className="bg-emerald-600 hover:bg-emerald-700 h-8 px-2.5 text-xs gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </Button>
                        <Button
                          onClick={() => handleAction(req.id, 'rejected')}
                          variant="secondary"
                          size="sm"
                          isLoading={isProcessing}
                          className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50 gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
