import React from 'react';
import { LeaveStatus } from '../../types/leave';
import { Badge } from '../ui/Badge';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  switch (status) {
    case 'approved':
      return (
        <Badge variant="success">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="danger">
          <XCircle className="w-3 h-3" /> Rejected
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge variant="warning">
          <Clock className="w-3 h-3" /> Pending Review
        </Badge>
      );
  }
}
