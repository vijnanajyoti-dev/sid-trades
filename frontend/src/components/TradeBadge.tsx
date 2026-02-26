import { cn } from '../lib/utils';
import { TradeResult, TradeStatus, TradeCategory } from '../types/trade';
import { getResultBadgeClass, getStatusBadgeClass, getCategoryBadgeClass } from '../lib/utils';

interface TradeBadgeProps {
  type: 'result' | 'status' | 'category';
  value: TradeResult | TradeStatus | TradeCategory;
  className?: string;
}

export function TradeBadge({ type, value, className }: TradeBadgeProps) {
  let badgeClass = '';
  if (type === 'result') badgeClass = getResultBadgeClass(value as TradeResult);
  else if (type === 'status') badgeClass = getStatusBadgeClass(value as TradeStatus);
  else badgeClass = getCategoryBadgeClass(value as TradeCategory);

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
      badgeClass,
      className
    )}>
      {value}
    </span>
  );
}
