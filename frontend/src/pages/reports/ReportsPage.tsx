import React, { useState } from 'react';
import { AnalyticsCharts } from '../../components/reports/AnalyticsCharts';
import { useAppDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import jsPDF from 'jspdf';

export default function ReportsPage() {
  const { employees, attendance, leaveRequests, payroll } = useAppDataStore();
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedRange, setSelectedRange] = useState('30d');

  const handleExportCSV = () => {
    try {
      const csvData = [
        ['Department', 'Attendance Rate (%)', 'Avg Work Hours', 'Leave Days Taken', 'Headcount'],
        ['Engineering', '95.0%', '168 hrs', '4 days', String(employees.filter(e => e.department === 'Engineering').length || 4)],
        ['Product', '92.5%', '160 hrs', '2 days', String(employees.filter(e => e.department === 'Product').length || 2)],
        ['People & Ops', '98.0%', '160 hrs', '1 days', String(employees.filter(e => e.department === 'People & Ops').length || 2)],
        ['Operations', '94.1%', '164 hrs', '3 days', String(employees.filter(e => e.department === 'Operations').length || 2)],
      ];

      const csvContent =
        'data:text/csv;charset=utf-8,' + csvData.map((e) => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Dayflow_HR_Analytics_${selectedRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast('Export Successful', 'Analytics summary CSV downloaded.', 'success');
    } catch (e: any) {
      toast('Export Error', e.message, 'error');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(24, 24, 27);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Dayflow HRMS • Executive Analytics Report', 14, 22);

      doc.setTextColor(24, 24, 27);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Filter: ${selectedDept} department`, 14, 48);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Organizational Attendance Overview', 14, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Total Active Personnel: ${employees.length}`, 14, 68);
      doc.text(`• Total Shift Logs Recorded: ${attendance.length}`, 14, 75);
      doc.text(`• Leave Requests Logged: ${leaveRequests.length}`, 14, 82);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Payroll & Remuneration Volume', 14, 98);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Total Payroll Records: ${payroll.length}`, 14, 106);
      doc.text(`• Total Disbursed Net Value: $${payroll.reduce((acc, curr) => acc + curr.netSalary, 0).toLocaleString()}`, 14, 113);

      doc.save(`Dayflow_Executive_Report_${selectedRange}.pdf`);
      toast('PDF Generated', 'Executive summary PDF downloaded.', 'success');
    } catch (e: any) {
      toast('Export Failed', e.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Workforce Intelligence
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-[10px] font-medium text-zinc-400">Org Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Reports & Analytics
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg">
            Analyze attendance compliance trends, leave utilization, and departmental payroll metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="md"
            className="text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>

          <Button
            onClick={handleExportPDF}
            variant="primary"
            size="md"
            className="text-xs gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export PDF Report
          </Button>
        </div>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts />
    </div>
  );
}
