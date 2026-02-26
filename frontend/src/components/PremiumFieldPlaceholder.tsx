import { Lock } from 'lucide-react';
import { cn } from '../lib/utils';

interface PremiumFieldPlaceholderProps {
  size?: 'sm' | 'default';
  className?: string;
}

export function PremiumFieldPlaceholder({ size = 'default', className }: PremiumFieldPlaceholderProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border font-medium',
        size === 'sm'
          ? 'px-1.5 py-0.5 text-xs'
          : 'px-2 py-0.5 text-xs',
        'bg-primary/10 text-primary border-primary/20',
        className
      )}
    >
      <Lock className={cn(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
      Premium Only
    </span>
  );
}
