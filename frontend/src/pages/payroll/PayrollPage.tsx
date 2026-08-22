import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePayroll } from '../../hooks/usePayroll';
import { useAppDataStore } from '../../store/dataStore';
import { PayrollView } from '../../components/payroll/PayrollView';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import {
  DollarSign,
  FileSpreadsheet,
  Download,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export default function PayrollPage() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const { records, updatePayroll, isUpdating } = usePayroll();
  const { generateMonthlyPayroll, employees } = useAppDataStore();
  const [selectedMonth, setSelectedMonth] = useState('8');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Filter records by month & year
  const filteredRecords = records.filter(
    (r) => String(r.month) === selectedMonth && String(r.year) === selectedYear
  );

  const totalDisbursed = filteredRecords.reduce((acc, curr) => acc + curr.netSalary, 0);
  const totalAllowances = filteredRecords.reduce((acc, curr) => acc + curr.allowances, 0);
  const totalDeductions = filteredRecords.reduce((acc, curr) => acc + curr.deductions, 0);

  const handleGenerateCycle = () => {
    generateMonthlyPayroll(Number(selectedMonth), Number(selectedYear));
    toast('Payroll Processed', `Generated payroll statements for ${selectedMonth}/${selectedYear}`, 'success');
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Employee Name', 'Role', 'Month', 'Year', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary'];
      const rows = filteredRecords.map((r) => [
        r.employeeName || 'Employee',
        r.jobTitle || 'Staff',
        r.month,
        r.year,
        r.basicSalary,
        r.allowances,
        r.deductions,
        r.netSalary,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Dayflow_Payroll_Summary_${selectedMonth}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast('Export Complete', 'Payroll CSV summary downloaded.', 'success');
    } catch (e: any) {
      toast('Export Failed', e.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Compensation & Remuneration
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-[10px] font-medium text-zinc-400">Payroll Cycle</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Payroll Management
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg">
            {isAdmin
              ? 'Manage compensation packages, adjust allowances and deductions, and disburse verified salary slips.'
              : 'Review your monthly net earnings, compensation breakdown, and download verified salary slips.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Month / Year Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-2xs">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-zinc-800 px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="1">Jan</option>
              <option value="2">Feb</option>
              <option value="3">Mar</option>
              <option value="4">Apr</option>
              <option value="5">May</option>
              <option value="6">Jun</option>
              <option value="7">Jul</option>
              <option value="8">Aug</option>
              <option value="9">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-semibold text-zinc-800 px-2 py-1.5 focus:outline-none border-l border-zinc-200 cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          {isAdmin && (
            <Button
              onClick={handleGenerateCycle}
              variant="outline"
              size="md"
              className="text-xs gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generate Cycle
            </Button>
          )}

          {filteredRecords.length > 0 && (
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="md"
              className="text-xs gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              {isAdmin ? 'Total Payroll Disbursed' : 'Net Monthly Salary'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900">
              {formatCurrency(totalDisbursed || 6500)}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            {selectedMonth}/{selectedYear} Cycle
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Total Allowances
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">
              +{formatCurrency(totalAllowances || 1000)}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            Housing, Transport & Medical
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Tax & Withholdings
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-700">
              -{formatCurrency(totalDeductions || 500)}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            Federal Tax & Healthcare
          </span>
        </Card>
      </div>

      {/* Main Payroll View Table / Slips */}
      <PayrollView
        records={filteredRecords}
        isAdmin={isAdmin}
        onUpdatePayroll={updatePayroll}
      />
    </div>
  );
}
