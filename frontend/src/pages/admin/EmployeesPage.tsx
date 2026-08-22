import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../../hooks/useEmployees';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { toast } from '../../components/ui/Toast';
import { getInitials } from '../../lib/utils';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  Eye,
  Plus,
} from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export default function EmployeesPage() {
  const { employees, createEmployee, isCreating } = useEmployees();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New employee form state
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'employee' | 'admin'>('employee');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newPhone, setNewPhone] = useState('+1 (555) 000-0000');
  const [newAddress, setNewAddress] = useState('San Francisco, CA');

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newJobTitle) {
      toast('Required Fields', 'Please complete name, email and job title.', 'error');
      return;
    }

    try {
      await createEmployee({
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: newFullName,
        email: newEmail,
        role: newRole,
        jobTitle: newJobTitle,
        department: newDepartment,
        phone: newPhone,
        address: newAddress,
        profilePictureUrl: '',
        createdAt: new Date().toISOString(),
        status: 'active',
      });

      toast('Employee Created', `${newFullName} has been added to the directory.`, 'success');
      setIsAddModalOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewJobTitle('');
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not add employee', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Staff Management
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-[10px] font-medium text-zinc-400">Total {employees.length} Members</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Personnel Directory
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg">
            Browse company staff profiles, assign permissions, and onboard team members into Dayflow.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Team Member
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-white border border-black/[0.05] shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-500 font-medium">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="all">All Departments ({employees.length})</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="People & Ops">People & Ops</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </div>

      {/* Employees Grid */}
      {employees.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/[0.05] p-10 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
          <EmptyState
            icon={Users}
            title="No staff members registered yet"
            description="Add your first team member or invite staff to access Dayflow."
            actionLabel="Add Team Member"
            onAction={() => setIsAddModalOpen(true)}
            actionIcon={Plus}
          />
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/[0.05] p-10 text-center text-xs text-zinc-400">
          No personnel matched your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => (
            <Card key={emp.id} className="p-5 relative group overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-base font-bold shrink-0 shadow-2xs">
                  {emp.profilePictureUrl ? (
                    <img
                      src={emp.profilePictureUrl}
                      alt={emp.fullName}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    getInitials(emp.fullName)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-zinc-900 truncate">
                      {emp.fullName}
                    </h4>
                    <Badge variant={emp.role === 'admin' ? 'default' : 'neutral'} size="sm">
                      {emp.role === 'admin' ? 'Admin' : 'Staff'}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-zinc-800 mt-0.5 truncate">
                    {emp.jobTitle}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">{emp.department || 'Operations'}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-3.5 mt-3.5 border-t border-zinc-100 text-xs text-zinc-500">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{emp.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 truncate font-mono text-[11px]">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>ID: {emp.employeeId}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-zinc-100">
                <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/profile?employeeId=${emp.id}`)}
                  className="text-xs gap-1 py-1 px-3"
                >
                  <Eye className="w-3.5 h-3.5" /> View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard Team Member"
        description="Add a staff profile to the organization directory."
        maxWidth="md"
      >
        <form onSubmit={handleAddEmployee} className="space-y-3.5 pt-1">
          <Input
            label="Full Name"
            placeholder="e.g. Jordan Miller"
            value={newFullName}
            onChange={(e) => setNewFullName(e.target.value)}
            required
          />

          <Input
            label="Work Email Address"
            type="email"
            placeholder="jordan@company.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Job Title"
              placeholder="Software Engineer"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
              required
            />

            <Select
              label="Department"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
            >
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="People & Ops">People & Ops</option>
              <option value="Operations">Operations</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Role Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
            >
              <option value="employee">Standard Employee</option>
              <option value="admin">HR Administrator</option>
            </Select>

            <Input
              label="Phone Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </div>

          <Input
            label="Office / Address"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isCreating}>
              Add to Directory
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
