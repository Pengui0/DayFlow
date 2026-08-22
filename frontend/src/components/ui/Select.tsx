import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={inputId}
            className={cn(
              'w-full bg-white border text-zinc-900 rounded-2xl py-2.5 pl-3.5 pr-10 text-xs sm:text-sm transition-all duration-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 appearance-none cursor-pointer',
              error
                ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-zinc-200 hover:border-zinc-300',
              className
            )}
            ref={ref}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white text-zinc-900">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-[11px] text-rose-600 font-medium pl-1">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-zinc-500 pl-1">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
