import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, IdCard, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const signUpSchema = z
  .object({
    employeeId: z
      .string()
      .min(3, 'Employee ID must be at least 3 characters')
      .regex(/^[A-Za-z0-9-_]+$/, 'Only letters, numbers, and hyphens allowed'),
    fullName: z.string().min(2, 'Please enter your full name'),
    email: z.string().email('Please enter a valid email address'),
    department: z.string().min(2, 'Department is required'),
    role: z.enum(['employee', 'admin']),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onFlipToSignIn: () => void;
}

export function SignUpForm({ onFlipToSignIn }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'admin',
      fullName: '',
      email: '',
      department: 'Engineering',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await signUp({
        employeeId: data.employeeId,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
        department: data.department,
      });

      if (!res.success) {
        setAuthError(res.error || 'Registration failed');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setAuthError('An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
          Create Account
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Set up your profile to enter Dayflow
        </p>
      </div>

      {authError && (
        <div className="mb-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-600 text-center animate-in fade-in">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Employee ID"
            placeholder="EMP-1001"
            icon={<IdCard className="w-4 h-4" />}
            error={errors.employeeId?.message}
            {...register('employeeId')}
          />

          <Select
            label="Role Designation"
            error={errors.role?.message}
            {...register('role')}
          >
            <option value="admin">HR Admin</option>
            <option value="employee">Staff Member</option>
          </Select>
        </div>

        <Input
          label="Full Name"
          placeholder="Jordan Miller"
          icon={<User className="w-4 h-4" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Company Email"
            type="email"
            placeholder="jordan@company.com"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Department"
            placeholder="Engineering"
            error={errors.department?.message}
            {...register('department')}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-zinc-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            }
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Complete Setup
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onFlipToSignIn}
            className="font-semibold text-zinc-900 hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer"
          >
            ← Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
}
