export type UserRole = 'admin' | 'employee';

export interface Employee {
  id: string;
  employeeId: string;
  employee_id?: string;
  email: string;
  fullName: string;
  full_name?: string;
  role: UserRole;
  phone: string;
  address: string;
  jobTitle: string;
  job_title?: string;
  department?: string;
  profilePictureUrl?: string;
  profile_picture_url?: string;
  createdAt: string;
  created_at?: string;
  joiningDate?: string;
  status?: 'active' | 'on_leave' | 'inactive';
}
