import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2';

    const variants = {
      primary:
        'bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs rounded-2xl',
      secondary:
        'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 rounded-2xl',
      outline:
        'border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 rounded-2xl shadow-2xs',
      ghost:
        'hover:bg-zinc-100/80 text-zinc-600 hover:text-zinc-900 rounded-xl',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-xs rounded-2xl',
      glass:
        'bg-white/80 hover:bg-white text-zinc-900 backdrop-blur-xl border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.03)] rounded-2xl',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
      md: 'text-xs sm:text-sm px-4 py-2.5 gap-2 font-medium',
      lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 font-semibold',
      icon: 'p-2.5 aspect-square rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
