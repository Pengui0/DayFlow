import { format, parseISO, isValid } from 'date-fns';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateString(dateStr?: string | null, formatPattern: string = 'MMM dd, yyyy'): string {
  if (!dateStr) return 'N/A';
  try {
    const d = typeof dateStr === 'string' && dateStr.length === 10 ? new Date(dateStr + 'T00:00:00') : parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, formatPattern);
  } catch {
    return dateStr;
  }
}

export function formatTimeString(timeStr?: string | null): string {
  if (!timeStr) return '--:--';
  if (timeStr.includes(':') && timeStr.length <= 8) {
    return timeStr.slice(0, 5);
  }
  try {
    const d = parseISO(timeStr);
    if (!isValid(d)) return timeStr;
    return format(d, 'hh:mm a');
  } catch {
    return timeStr;
  }
}

export function getInitials(name: string): string {
  if (!name) return 'DF';
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
