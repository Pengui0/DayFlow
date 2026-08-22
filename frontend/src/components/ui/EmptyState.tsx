import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-white/70 backdrop-blur-xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.02)] ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-100/90 text-zinc-600 flex items-center justify-center mb-4 ring-8 ring-zinc-50 transition-transform duration-300 hover:scale-105">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>

      <h3 className="text-base font-semibold text-zinc-900 tracking-tight">
        {title}
      </h3>

      <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          size="md"
          className="gap-2 shadow-xs"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
