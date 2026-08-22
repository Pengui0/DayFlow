import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee } from '../types/employee';
import { AttendanceRecord } from '../types/attendance';
import { LeaveRequest } from '../types/leave';
import { PayrollRecord } from '../types/payroll';
import { format } from 'date-fns';

const seedEmployees: Employee[] = [
  {
    id: 'emp-admin-1',
    employeeId: 'EMP-1001',
    email: 'admin@dayflow.io',
    fullName: 'Admin Officer',
    role: 'admin',
    phone: '+1 (555) 010-1001',
    address: 'HQ, San Francisco',
    jobTitle: 'HR Administrator',
    department: 'People & Ops',
    profilePictureUrl: '',
    createdAt: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'emp-staff-1',
    employeeId: 'EMP-2001',
    email: 'employee@dayflow.io',
    fullName: 'Team Associate',
    role: 'employee',
    phone: '+1 (555) 010-2001',
    address: 'HQ, San Francisco',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    profilePictureUrl: '',
    createdAt: new Date().toISOString(),
    status: 'active',
  },
];

interface AppDataState {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  payroll: PayrollRecord[];

  // Employee Actions
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  addEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;

  // Attendance Actions
  checkIn: (employeeId: string, location?: string) => AttendanceRecord;
  checkOut: (employeeId: string) => AttendanceRecord | null;
  addAttendanceRecord: (record: AttendanceRecord) => void;

  // Leave Actions
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'createdAt' | 'status' | 'adminComment'>) => LeaveRequest;
  updateLeaveStatus: (leaveId: string, status: 'approved' | 'rejected', adminComment?: string) => void;

  // Payroll Actions
  updatePayrollRecord: (id: string, updates: Partial<PayrollRecord>) => void;
  createPayrollRecord: (record: PayrollRecord) => void;
  generateMonthlyPayroll: (month: number, year: number) => void;
}

export const useAppDataStore = create<AppDataState>()(
  persist(
    (set, get) => ({
      employees: seedEmployees,
      attendance: [],
      leaveRequests: [],
      payroll: [],

      updateEmployee: (id: string, updates: Partial<Employee>) => {
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, ...updates } : emp
          ),
        }));
      },

      addEmployee: (emp: Employee) => {
        set((state) => {
          // Avoid duplicate employee ids
          const exists = state.employees.some((e) => e.id === emp.id || e.email.toLowerCase() === emp.email.toLowerCase());
          if (exists) {
            return {
              employees: state.employees.map((e) =>
                e.id === emp.id || e.email.toLowerCase() === emp.email.toLowerCase()
                  ? { ...e, ...emp }
                  : e
              ),
            };
          }
          return {
            employees: [emp, ...state.employees],
          };
        });
      },

      deleteEmployee: (id: string) => {
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== id),
          attendance: state.attendance.filter((att) => att.employeeId !== id),
          leaveRequests: state.leaveRequests.filter((l) => l.employeeId !== id),
          payroll: state.payroll.filter((p) => p.employeeId !== id),
        }));
      },

      checkIn: (employeeId: string, location = 'Office') => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const nowIso = new Date().toISOString();
        const employee = get().employees.find((e) => e.id === employeeId);

        const existingIndex = get().attendance.findIndex(
          (a) => a.employeeId === employeeId && a.date === todayStr
        );

        if (existingIndex >= 0) {
          const existing = get().attendance[existingIndex];
          const updated = {
            ...existing,
            checkIn: existing.checkIn || nowIso,
            status: 'present' as const,
            location: existing.location || location,
          };
          set((state) => {
            const copy = [...state.attendance];
            copy[existingIndex] = updated;
            return { attendance: copy };
          });
          return updated;
        }

        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          employeeId,
          employeeName: employee?.fullName || 'Staff Member',
          date: todayStr,
          checkIn: nowIso,
          checkOut: null,
          status: 'present',
          workHours: 0,
          location,
        };

        set((state) => ({
          attendance: [newRecord, ...state.attendance],
        }));
        return newRecord;
      },

      checkOut: (employeeId: string) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const nowIso = new Date().toISOString();
        const existingIndex = get().attendance.findIndex(
          (a) => a.employeeId === employeeId && a.date === todayStr
        );

        if (existingIndex < 0) return null;

        const existing = get().attendance[existingIndex];
        let calculatedHours = 8;
        if (existing.checkIn) {
          const diffMs = new Date().getTime() - new Date(existing.checkIn).getTime();
          calculatedHours = Math.max(0.5, Number((diffMs / (1000 * 60 * 60)).toFixed(1)));
        }

        const updated: AttendanceRecord = {
          ...existing,
          checkOut: nowIso,
          workHours: calculatedHours,
          status: calculatedHours < 4 ? 'half-day' : 'present',
        };

        set((state) => {
          const copy = [...state.attendance];
          copy[existingIndex] = updated;
          return { attendance: copy };
        });

        return updated;
      },

      addAttendanceRecord: (record: AttendanceRecord) => {
        set((state) => ({
          attendance: [record, ...state.attendance],
        }));
      },

      submitLeaveRequest: (reqData) => {
        const employee = get().employees.find((e) => e.id === reqData.employeeId);
        
        // Calculate days count
        const start = new Date(reqData.startDate);
        const end = new Date(reqData.endDate);
        const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

        const newReq: LeaveRequest = {
          id: `leave-${Date.now()}`,
          ...reqData,
          employeeName: employee?.fullName || reqData.employeeName || 'Staff Member',
          employeeAvatar: employee?.profilePictureUrl,
          jobTitle: employee?.jobTitle || 'Team Member',
          department: employee?.department || 'General',
          daysCount: diffDays,
          status: 'pending',
          adminComment: null,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          leaveRequests: [newReq, ...state.leaveRequests],
        }));

        return newReq;
      },

      updateLeaveStatus: (leaveId: string, status: 'approved' | 'rejected', adminComment = '') => {
        set((state) => ({
          leaveRequests: state.leaveRequests.map((req) =>
            req.id === leaveId
              ? {
                  ...req,
                  status,
                  adminComment: adminComment || req.adminComment,
                }
              : req
          ),
        }));
      },

      updatePayrollRecord: (id: string, updates: Partial<PayrollRecord>) => {
        set((state) => ({
          payroll: state.payroll.map((pay) => {
            if (pay.id === id) {
              const basic = updates.basicSalary ?? pay.basicSalary;
              const allowances = updates.allowances ?? pay.allowances;
              const deductions = updates.deductions ?? pay.deductions;
              const net = basic + allowances - deductions;

              return {
                ...pay,
                ...updates,
                basicSalary: basic,
                allowances,
                deductions,
                netSalary: net,
              };
            }
            return pay;
          }),
        }));
      },

      createPayrollRecord: (record: PayrollRecord) => {
        set((state) => ({
          payroll: [record, ...state.payroll],
        }));
      },

      generateMonthlyPayroll: (month: number, year: number) => {
        const { employees, payroll } = get();
        const newRecords: PayrollRecord[] = [];

        employees.forEach((emp) => {
          const exists = payroll.some(
            (p) => p.employeeId === emp.id && p.month === month && p.year === year
          );
          if (!exists) {
            const baseSalary = emp.role === 'admin' ? 8500 : 6500;
            const allowances = 500;
            const deductions = 300;
            newRecords.push({
              id: `pay-${emp.id}-${month}-${year}`,
              employeeId: emp.id,
              employeeName: emp.fullName,
              jobTitle: emp.jobTitle,
              month,
              year,
              basicSalary: baseSalary,
              allowances,
              deductions,
              netSalary: baseSalary + allowances - deductions,
              status: 'paid',
              paymentDate: `${year}-${String(month).padStart(2, '0')}-28`,
            });
          }
        });

        if (newRecords.length > 0) {
          set((state) => ({
            payroll: [...newRecords, ...state.payroll],
          }));
        }
      },
    }),
    {
      name: 'dayflow-app-data',
    }
  )
);
