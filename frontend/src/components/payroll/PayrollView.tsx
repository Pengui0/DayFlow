import React, { useState } from 'react';
import { PayrollRecord } from '../../types/payroll';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { PayrollEditForm } from './PayrollEditForm';
import { formatCurrency, getInitials } from '../../lib/utils';
import {
  Download,
  FileSpreadsheet,
  DollarSign,
  Edit3,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from '../ui/Toast';
import { EmptyState } from '../ui/EmptyState';

interface PayrollViewProps {
  records: PayrollRecord[];
  isAdmin: boolean;
  onUpdatePayroll?: (id: string, updates: Partial<PayrollRecord>) => Promise<void>;
}

export function PayrollView({ records, isAdmin, onUpdatePayroll }: PayrollViewProps) {
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);

  const generatePDFSlip = (record: PayrollRecord) => {
    try {
      const doc = new jsPDF();

      // Clean Monochromatic Header
      doc.setFillColor(24, 24, 27); // Zinc 900
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Dayflow HRMS', 14, 22);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Monthly Salary Pay Slip', 14, 30);
      doc.text(`Statement Period: ${record.month}/${record.year}`, 145, 22);

      // Employee Information
      doc.setTextColor(24, 24, 27);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Employee Information', 14, 52);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Full Name: ${record.employeeName || 'Staff Member'}`, 14, 60);
      doc.text(`Designation: ${record.jobTitle || 'Team Member'}`, 14, 67);
      doc.text(`Department: ${record.department || 'Operations'}`, 14, 74);
      doc.text(`Email: ${record.email || 'employee@dayflow.io'}`, 110, 60);
      doc.text(`Slip Ref: PAY-${record.id.slice(-6).toUpperCase()}`, 110, 67);
      doc.text(`Status: PAID (Direct Deposit)`, 110, 74);

      // Divider
      doc.setDrawColor(228, 228, 231);
      doc.line(14, 82, 196, 82);

      // Earnings & Deductions Table Header
      doc.setFillColor(244, 244, 245);
      doc.rect(14, 88, 182, 9, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('EARNINGS & ALLOWANCES', 18, 94);
      doc.text('AMOUNT', 85, 94);
      doc.text('DEDUCTIONS & TAXES', 115, 94);
      doc.text('AMOUNT', 170, 94);

      // Table Rows
      doc.setFont('helvetica', 'normal');
      doc.text('Basic Salary Component', 18, 106);
      doc.text(formatCurrency(record.basicSalary), 85, 106);

      doc.text('Income Tax (Withheld)', 115, 106);
      doc.text(formatCurrency(Math.round(record.deductions * 0.6)), 170, 106);

      doc.text('Housing & Utilities', 18, 116);
      doc.text(formatCurrency(Math.round(record.allowances * 0.6)), 85, 116);

      doc.text('Social Security / 401(k)', 115, 116);
      doc.text(formatCurrency(Math.round(record.deductions * 0.3)), 170, 116);

      doc.text('Transport Allowance', 18, 126);
      doc.text(formatCurrency(Math.round(record.allowances * 0.4)), 85, 126);

      doc.text('Health Insurance Premium', 115, 126);
      doc.text(formatCurrency(Math.round(record.deductions * 0.1)), 170, 126);

      // Totals Box
      doc.setFillColor(244, 244, 245);
      doc.rect(14, 138, 182, 16, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`TOTAL GROSS: ${formatCurrency(record.basicSalary + record.allowances)}`, 18, 148);
      doc.text(`NET PAYABLE SALARY: ${formatCurrency(record.netSalary)}`, 115, 148);

      // Save
      doc.save(`Dayflow_Payslip_${(record.employeeName || 'Staff').replace(/\s+/g, '_')}_${record.month}_${record.year}.pdf`);
      toast('Payslip Downloaded', 'Official PDF statement exported.', 'success');
    } catch (err: any) {
      toast('Export Error', err.message || 'Failed to generate PDF', 'error');
    }
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-black/[0.05] p-10 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
        <EmptyState
          icon={FileSpreadsheet}
          title="No payroll records for this period"
          description={
            isAdmin
              ? 'Click "Generate Cycle" above to generate payroll entries for this month.'
              : 'Payroll records for this cycle will appear here once processed by HR.'
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-4">Cycle</th>
                <th className="py-3.5 px-4">Basic Pay</th>
                <th className="py-3.5 px-4">Allowances</th>
                <th className="py-3.5 px-4">Deductions</th>
                <th className="py-3.5 px-4">Net Salary</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-zinc-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(r.employeeName || 'Staff')}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">{r.employeeName || 'Staff Member'}</p>
                        <p className="text-[10px] text-zinc-400">{r.jobTitle || 'Team Member'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-700 font-medium">
                    {r.month}/{r.year}
                  </td>

                  <td className="py-3.5 px-4 text-zinc-800 font-semibold">
                    {formatCurrency(r.basicSalary)}
                  </td>

                  <td className="py-3.5 px-4 text-emerald-700 font-medium">
                    +{formatCurrency(r.allowances)}
                  </td>

                  <td className="py-3.5 px-4 text-zinc-600 font-medium">
                    -{formatCurrency(r.deductions)}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-zinc-900 text-sm">
                    {formatCurrency(r.netSalary)}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={r.status === 'paid' ? 'success' : 'warning'} size="sm">
                      {r.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isAdmin && (
                        <button
                          onClick={() => setEditingRecord(r)}
                          className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                          title="Adjust salary components"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      <Button
                        onClick={() => generatePDFSlip(r)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Slip PDF
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Payroll Modal */}
      {editingRecord && (
        <Modal
          isOpen={Boolean(editingRecord)}
          onClose={() => setEditingRecord(null)}
          title={`Adjust Payroll • ${editingRecord.employeeName}`}
          description="Update basic compensation, bonus allowances, and statutory deductions."
        >
          <PayrollEditForm
            record={editingRecord}
            onSave={async (updates) => {
              if (onUpdatePayroll) {
                await onUpdatePayroll(editingRecord.id, updates);
              }
              setEditingRecord(null);
            }}
            onCancel={() => setEditingRecord(null)}
          />
        </Modal>
      )}
    </div>
  );
}
