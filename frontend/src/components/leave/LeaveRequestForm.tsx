import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { toast } from '../ui/Toast';
import { Calendar, FileText, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { format, addDays } from 'date-fns';

const leaveSchema = z
  .object({
    leaveType: z.enum(['annual', 'sick', 'casual', 'unpaid']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    remarks: z
      .string()
      .min(3, 'Please provide a brief reason (min 3 chars)')
      .max(300, 'Remarks cannot exceed 300 characters'),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveRequestFormProps {
  onSuccess?: () => void;
}

export function LeaveRequestForm({ onSuccess }: LeaveRequestFormProps) {
  const { submitLeave, isSubmitting, leaveBalance } = useLeaveRequests();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const nextDayStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leaveType: 'annual',
      startDate: todayStr,
      endDate: nextDayStr,
      remarks: '',
    },
  });

  const selectedType = watch('leaveType');

  const onSubmit = async (data: LeaveFormData) => {
    try {
      await submitLeave({
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        remarks: data.remarks,
      });

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      toast('Application Submitted', 'Your leave request has been sent for approval.', 'success');
      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast('Submission Error', err.message || 'Failed to submit leave request', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Leave Quota Pills Indicator */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className={`p-3 rounded-2xl border text-center transition-all ${
            selectedType === 'annual'
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-zinc-50 border-zinc-200/80 text-zinc-700'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold block ${selectedType === 'annual' ? 'text-zinc-300' : 'text-zinc-500'}`}>
            Annual
          </span>
          <span className="text-sm font-bold">
            {leaveBalance.annual} days left
          </span>
        </div>

        <div
          className={`p-3 rounded-2xl border text-center transition-all ${
            selectedType === 'sick'
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-zinc-50 border-zinc-200/80 text-zinc-700'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold block ${selectedType === 'sick' ? 'text-zinc-300' : 'text-zinc-500'}`}>
            Sick / Medical
          </span>
          <span className="text-sm font-bold">
            {leaveBalance.sick} days left
          </span>
        </div>

        <div
          className={`p-3 rounded-2xl border text-center transition-all ${
            selectedType === 'casual'
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-zinc-50 border-zinc-200/80 text-zinc-700'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold block ${selectedType === 'casual' ? 'text-zinc-300' : 'text-zinc-500'}`}>
            Casual
          </span>
          <span className="text-sm font-bold">
            {leaveBalance.casual} days left
          </span>
        </div>
      </div>

      <Select
        label="Leave Category"
        error={errors.leaveType?.message}
        {...register('leaveType')}
      >
        <option value="annual">Annual / Paid Vacation</option>
        <option value="sick">Sick Leave / Doctor Appointment</option>
        <option value="casual">Casual / Emergency</option>
        <option value="unpaid">Unpaid Leave</option>
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="date"
          icon={<Calendar className="w-4 h-4" />}
          error={errors.startDate?.message}
          {...register('startDate')}
        />

        <Input
          label="End Date"
          type="date"
          icon={<Calendar className="w-4 h-4" />}
          error={errors.endDate?.message}
          {...register('endDate')}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
          Reason & Notes
        </label>
        <textarea
          rows={3}
          placeholder="Please describe the context of your leave request..."
          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300"
          {...register('remarks')}
        />
        {errors.remarks && (
          <p className="mt-1 text-[11px] text-rose-600 font-medium">
            {errors.remarks.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-2 gap-2"
        isLoading={isSubmitting}
      >
        <Send className="w-4 h-4" />
        Submit Leave Request
      </Button>
    </form>
  );
}
