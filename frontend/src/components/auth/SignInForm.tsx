import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, User, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useAppDataStore } from '../../store/dataStore';
import { useNavigate } from 'react-router-dom';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onFlipToSignUp: () => void;
}

export function SignInForm({ onFlipToSignUp }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { employees } = useAppDataStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: 'admin@dayflow.io',
      password: 'Admin123',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await signIn(data.email, data.password);
      if (!res.success) {
        setAuthError(res.error || 'Invalid email or password');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRoleStart = async (role: 'admin' | 'employee') => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const email = role === 'admin' ? 'admin@dayflow.io' : 'employee@dayflow.io';
      const fullName = role === 'admin' ? 'Admin Officer' : 'Team Associate';
      
      const res = await signUp({
        email,
        fullName,
        role,
        department: role === 'admin' ? 'People Operations' : 'Engineering',
        jobTitle: role === 'admin' ? 'HR Administrator' : 'Software Engineer',
      });

      if (res.success) {
        navigate('/dashboard');
      } else {
        setAuthError(res.error || 'Failed to start workspace');
      }
    } catch (err) {
      setAuthError('Could not start workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
          Welcome to Dayflow
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Sign in to your workplace console
        </p>
      </div>

      {authError && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-600 text-center animate-in fade-in">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Input
          label="Work Email"
          type="email"
          placeholder="name@company.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

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

        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-500 select-none">
            <input
              type="checkbox"
              defaultChecked
              className="w-3.5 h-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
            />
            Remember me
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-1.5"
          isLoading={isLoading}
        >
          Sign In
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* Quick Starter Roles for Instant Setup */}
      <div className="mt-5 pt-4 border-t border-zinc-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Quick Start Fresh Workspace
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickRoleStart('admin')}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" /> Start as HR Admin
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
              Full directory, payroll & leaves
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickRoleStart('employee')}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
              <User className="w-3.5 h-3.5 text-zinc-700" /> Start as Staff
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
              Punch in, leaves & payslip
            </div>
          </button>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-500">
          Want a custom profile?{' '}
          <button
            type="button"
            onClick={onFlipToSignUp}
            className="font-semibold text-zinc-900 hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
