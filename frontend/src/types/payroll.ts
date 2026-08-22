export interface PayrollRecord {
  id: string;
  employeeId: string;
  employee_id?: string;
  employeeName?: string;
  jobTitle?: string;
  department?: string;
  email?: string;
  basicSalary: number;
  basic_salary?: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  net_salary?: number;
  month: number; // 1 - 12
  year: number;
  status?: 'paid' | 'pending' | 'processing';
  paymentDate?: string;
  breakdown?: {
    hra?: number;
    conveyance?: number;
    specialAllowance?: number;
    taxDeduction?: number;
    providentFund?: number;
    healthInsurance?: number;
  };
}
