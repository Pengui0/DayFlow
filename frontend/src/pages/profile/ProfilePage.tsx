import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEmployees } from '../../hooks/useEmployees';
import { usePayroll } from '../../hooks/usePayroll';
import { ProfileView } from '../../components/profile/ProfileView';
import { ProfileEditForm } from '../../components/profile/ProfileEditForm';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, UserCheck } from 'lucide-react';

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetEmployeeId = searchParams.get('employeeId');

  const { employeeProfile: currentUser, role: userRole } = useAuth();
  const { employees } = useEmployees();
  const [isEditing, setIsEditing] = useState(false);

  // If admin is viewing a specific employee, load that employee
  const viewingEmployee = targetEmployeeId
    ? employees.find((e) => e.id === targetEmployeeId || e.employeeId === targetEmployeeId) || currentUser
    : currentUser;

  const isAdmin = userRole === 'admin';
  const isViewingSelf = viewingEmployee?.id === currentUser?.id;
  const canEdit = isViewingSelf || isAdmin;

  // Retrieve salary structure for profile display
  const { records: payrollRecords } = usePayroll();
  const empSalary = payrollRecords.find((p) => p.employeeId === viewingEmployee?.id) || {
    basicSalary: 11000,
    allowances: 2800,
    deductions: 2400,
    netSalary: 11400,
  };

  if (!viewingEmployee) {
    return (
      <div className="p-12 text-center text-slate-400">
        Profile could not be located.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button if viewing another employee as Admin */}
      {targetEmployeeId && targetEmployeeId !== currentUser?.id && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchParams({})}
            className="text-xs gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Return to My Profile
          </Button>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
            Admin Inspect Mode: {viewingEmployee.fullName}
          </span>
        </div>
      )}

      {isEditing ? (
        <ProfileEditForm
          employee={viewingEmployee}
          userRole={userRole}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      ) : (
        <ProfileView
          employee={viewingEmployee}
          canEdit={canEdit}
          isAdmin={isAdmin}
          onEditClick={() => setIsEditing(true)}
          salaryInfo={isViewingSelf || isAdmin ? empSalary : undefined}
        />
      )}
    </div>
  );
}
