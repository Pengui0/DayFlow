import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PayrollRecord } from '../../types/payroll';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from '../ui/Toast';
import { DollarSign, Check } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const payrollSchema = z.object({
  basicSalary: z.coerce.number().min(0, 'Basic salary must be at least 0'),
  allowances: z.coerce.number().min(0, 'Allowances must be at least 0'),
  deductions: z.coerce.number().min(0, 'Deductions must be at least 0'),
});

type PayrollFormData = {
  basicSalary: number;
  allowances: number;
  deductions: number;
};

interface PayrollEditFormProps {
  record: PayrollRecord;
  onSave: (updates: Partial<PayrollRecord>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PayrollEditForm({ record, onSave, onCancel, isLoading }: PayrollEditFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema) as any,
    defaultValues: {
      basicSalary: record.basicSalary || 0,
      allowances: record.allowances || 0,
      deductions: record.deductions || 0,
    },
  });

  const basic = watch('basicSalary', 0);
  const allowances = watch('allowances', 0);
  const deductions = watch('deductions', 0);

  const liveNetSalary = Math.max(0, (Number(basic) || 0) + (Number(allowances) || 0) - (Number(deductions) || 0));

  const onSubmit = async (data: PayrollFormData) => {
    try {
      await onSave({
        basicSalary: Number(data.basicSalary),
        allowances: Number(data.allowances),
        deductions: Number(data.deductions),
        netSalary: liveNetSalary,
      });
      toast('Payroll Updated', `Salary record updated for ${record.employeeName || 'Staff Member'}.`, 'success');
      onCancel();
    } catch (err: any) {
      toast('Payroll Error', err.message || 'Failed to update payroll', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
        <p className="text-xs font-semibold text-zinc-900">
          Editing Payroll: {record.employeeName} ({record.jobTitle || 'Staff'})
        </p>
        <p className="text-[11px] text-zinc-500">Period: Month {record.month}/{record.year}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Basic Pay ($)"
          type="number"
          step="50"
          error={errors.basicSalary?.message}
          {...register('basicSalary')}
        />

        <Input
          label="Allowances ($)"
          type="number"
          step="50"
          error={errors.allowances?.message}
          {...register('allowances')}
        />

        <Input
          label="Deductions ($)"
          type="number"
          step="50"
          error={errors.deductions?.message}
          {...register('deductions')}
        />
      </div>

      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            Calculated Net Payout
          </span>
          <span className="text-xl font-bold text-zinc-900">
            {formatCurrency(liveNetSalary)}
          </span>
        </div>
        <span className="text-[11px] text-zinc-500">Auto-calculated</span>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
          Save Salary Adjustments
        </Button>
      </div>
    </form>
  );
}
