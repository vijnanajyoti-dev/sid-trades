import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TradeResult, TradeStatus, TradeCategory } from '../types/trade';
import { FieldVisibilityLevel, UserRole } from '../backend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, decimals = 2): string {
  if (price === 0) return '—';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getResultColor(result: TradeResult): string {
  switch (result) {
    case 'Profit': return 'text-emerald';
    case 'Loss': return 'text-destructive';
    case 'Breakeven': return 'text-gold-muted';
  }
}

export function getResultBadgeClass(result: TradeResult): string {
  switch (result) {
    case 'Profit': return 'bg-emerald/10 text-emerald border-emerald/20';
    case 'Loss': return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'Breakeven': return 'bg-warning/10 text-warning border-warning/20';
  }
}

export function getStatusBadgeClass(status: TradeStatus): string {
  switch (status) {
    case 'Open': return 'bg-primary/10 text-primary border-primary/20';
    case 'Closed': return 'bg-muted text-muted-foreground border-border';
  }
}

export function getCategoryBadgeClass(category: TradeCategory): string {
  switch (category) {
    case 'Equity': return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
    case 'Options': return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
    case 'Futures': return 'bg-chart-5/10 text-chart-5 border-chart-5/20';
    case 'Forex': return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
  }
}

export function calculatePnL(entry: number, exit: number, category: string): string {
  if (exit === 0) return '—';
  const diff = exit - entry;
  const pct = ((diff / entry) * 100).toFixed(2);
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${pct}%`;
}

/**
 * Determines whether a field should be shown to a caller based on their role
 * and the field visibility configuration.
 */
export function shouldShowField(
  fieldName: string,
  callerRole: UserRole | undefined,
  visibilityConfig: Array<[string, FieldVisibilityLevel]>
): boolean {
  // Admins and premium users (role = 'user') see everything
  if (callerRole === UserRole.admin || callerRole === UserRole.user) {
    return true;
  }

  // Find the field in the config
  const entry = visibilityConfig.find(([name]) => name === fieldName);

  // If not in config or explicitly public, show it
  if (!entry || entry[1] === FieldVisibilityLevel.publicField) {
    return true;
  }

  // Field is premiumOnly and caller is guest/undefined
  return false;
}
