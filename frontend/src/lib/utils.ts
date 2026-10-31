import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function getUrgencyBadgeClasses(urgency: string): string {
  switch (urgency) {
    case 'CRITICAL':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    case 'HIGH':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'MEDIUM':
      return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    case 'LOW':
    default:
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }
}

export function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'DISPATCHED':
    case 'IN_TRANSIT':
      return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    case 'PENDING_APPROVAL':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'DELIVERED':
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    case 'DRAFT':
    default:
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
}
