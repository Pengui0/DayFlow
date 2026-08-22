import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, icon, rightElement, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              'w-full bg-white border text-zinc-900 placeholder:text-zinc-400 rounded-2xl py-2.5 text-xs sm:text-sm transition-all duration-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900',
              icon ? 'pl-10' : 'pl-3.5',
              rightElement ? 'pr-11' : 'pr-3.5',
              error
                ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-zinc-200 hover:border-zinc-300',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-zinc-400">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] text-rose-600 font-medium pl-1">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-zinc-500 pl-1">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            'w-full bg-white border text-zinc-900 placeholder:text-zinc-400 rounded-2xl p-3.5 text-xs sm:text-sm transition-all duration-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 min-h-[90px]',
            error
              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-zinc-200 hover:border-zinc-300',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-[11px] text-rose-600 font-medium pl-1">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-zinc-500 pl-1">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
