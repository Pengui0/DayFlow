import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  key?: React.Key;
  glass?: boolean;
  glow?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function Card({
  className,
  glass = true,
  glow = false,
  children,
  onClick,
  ...props
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-3xl transition-all duration-300',
        glass
          ? 'bg-white/90 backdrop-blur-2xl border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.03)]'
          : 'bg-white border border-zinc-200/80 shadow-xs',
        glow && 'ring-1 ring-zinc-900/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('p-5 sm:p-6 pb-2 sm:pb-3 flex flex-col space-y-1.5', className)} {...props}>
      {children}
    </div>
  );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children?: React.ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('text-base sm:text-lg font-semibold tracking-tight text-zinc-900', className)} {...props}>
      {children}
    </h3>
  );
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children?: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p className={cn('text-xs text-zinc-500', className)} {...props}>
      {children}
    </p>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('p-5 sm:p-6 pt-2 sm:pt-3', className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn('p-5 sm:p-6 pt-0 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}
