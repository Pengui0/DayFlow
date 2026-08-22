export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employee_id?: string;
  employeeName?: string;
  employeeAvatar?: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // ISO timestamp or HH:mm
  check_in?: string | null;
  checkOut: string | null; // ISO timestamp or HH:mm
  check_out?: string | null;
  status: AttendanceStatus;
  workHours?: number;
  location?: string;
  notes?: string;
}
