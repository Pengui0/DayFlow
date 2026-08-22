import React from 'react';
import { Employee } from '../../types/employee';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatDateString, formatCurrency, getInitials } from '../../lib/utils';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Edit2,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface ProfileViewProps {
  employee: Employee;
  canEdit: boolean;
  isAdmin: boolean;
  onEditClick: () => void;
  salaryInfo?: { basicSalary: number; allowances: number; deductions: number; netSalary: number };
}

export function ProfileView({
  employee,
  canEdit,
  isAdmin,
  onEditClick,
  salaryInfo,
}: ProfileViewProps) {
  const documents = [
    { name: 'Employment Agreement (Signed).pdf', size: '2.4 MB', date: '2025-01-15' },
    { name: 'Tax Compliance & W-4 Form.pdf', size: '1.1 MB', date: '2025-01-16' },
    { name: 'Direct Deposit Verification.pdf', size: '850 KB', date: '2025-01-16' },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header Hero Card */}
      <Card className="p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-zinc-900 text-white flex items-center justify-center font-bold text-2xl shadow-md overflow-hidden">
              {employee.profilePictureUrl ? (
                <img
                  src={employee.profilePictureUrl}
                  alt={employee.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(employee.fullName)
              )}
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          {/* Details & Role */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
                    {employee.fullName}
                  </h2>
                  <Badge variant={employee.role === 'admin' ? 'default' : 'neutral'} size="sm">
                    {employee.role === 'admin' ? 'HR Administrator' : 'Staff Member'}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-zinc-700 mt-0.5">
                  {employee.jobTitle || 'Associate'} • {employee.department || 'Operations'}
                </p>
              </div>

              {canEdit && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={onEditClick}
                  className="gap-2 text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile Details
                </Button>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap text-xs text-zinc-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" /> {employee.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" /> {employee.phone || '+1 (555) 012-3456'}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" /> ID: {employee.employeeId}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2-Column Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employment & Organizational Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-zinc-700" /> Organization & Role
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Department
                </span>
                <span className="font-semibold text-zinc-900 mt-0.5 block">
                  {employee.department || 'Operations'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Job Title
                </span>
                <span className="font-semibold text-zinc-900 mt-0.5 block">
                  {employee.jobTitle || 'Team Member'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  System Role
                </span>
                <span className="font-semibold text-zinc-900 mt-0.5 block capitalize">
                  {employee.role}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Status
                </span>
                <span className="font-semibold text-emerald-700 mt-0.5 block capitalize">
                  {employee.status || 'Active'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Office / Location
              </span>
              <span className="font-medium text-zinc-800 mt-0.5 block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {employee.address || 'San Francisco Hub, CA'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Compensation & Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-zinc-700" /> Compensation Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {salaryInfo ? (
              <div className="grid grid-cols-3 gap-2.5 text-xs text-center">
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Basic Salary
                  </span>
                  <span className="font-bold text-zinc-900 mt-1 block">
                    {formatCurrency(salaryInfo.basicSalary)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Allowances
                  </span>
                  <span className="font-bold text-emerald-700 mt-1 block">
                    +{formatCurrency(salaryInfo.allowances)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Net Payout
                  </span>
                  <span className="font-bold text-zinc-900 mt-1 block">
                    {formatCurrency(salaryInfo.netSalary)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">Compensation managed by HR Administration</p>
            )}

            <div className="pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Verified Documents
              </p>
              <div className="space-y-2">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-medium text-zinc-800">{doc.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">{doc.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
