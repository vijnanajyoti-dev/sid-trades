import { useParams, Link } from '@tanstack/react-router';
import { useGetTrade } from '../hooks/useQueries';
import { TradeBadge } from '../components/TradeBadge';
import { PremiumFieldPlaceholder } from '../components/PremiumFieldPlaceholder';
import { formatPrice, formatDate, calculatePnL, shouldShowField } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag, DollarSign, Target, BookOpen, Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useGetCallerUserRole } from '../hooks/useUserRoles';
import { useGetPublicFieldVisibility } from '../hooks/useFieldVisibility';

function DetailField({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
        <span className="text-gold">{icon}</span>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function TradeDetailPage() {
  const { id } = useParams({ from: '/trade/$id' });
  const { data: trade } = useGetTrade(Number(id));
  const { data: callerRole } = useGetCallerUserRole();
  const { data: visibilityConfig = [] } = useGetPublicFieldVisibility();

  const canSeeField = (fieldName: string) =>
    shouldShowField(fieldName, callerRole, visibilityConfig);

  if (!trade) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">Trade not found.</p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Button>
        </Link>
      </div>
    );
  }

  const pnl = calculatePnL(trade.entryPrice, trade.exitPrice, trade.category);
  const pnlColor = trade.result === 'Profit' ? 'text-emerald' : trade.result === 'Loss' ? 'text-destructive' : 'text-gold-muted';
  const PnLIcon = trade.result === 'Profit' ? TrendingUp : trade.result === 'Loss' ? TrendingDown : Minus;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div>
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground mb-3 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{trade.scriptName}</h1>
            <p className="text-sm text-muted-foreground font-mono mt-0.5">{formatDate(trade.date)}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <TradeBadge type="category" value={trade.category} />
            <TradeBadge type="result" value={trade.result} />
            <TradeBadge type="status" value={trade.status} />
            {canSeeField('potential') && pnl !== '—' && (
              <span className={`flex items-center gap-1 text-sm font-bold font-mono ${pnlColor}`}>
                <PnLIcon className="w-4 h-4" />
                {pnl}
              </span>
            )}
            {!canSeeField('potential') && <PremiumFieldPlaceholder />}
          </div>
        </div>
      </div>

      {/* Trade Info */}
      <SectionCard title="Trade Info" icon={<Tag className="w-4 h-4" />}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <DetailField label="Date" value={formatDate(trade.date)} />
          <DetailField label="Script" value={trade.scriptName} />
          <DetailField label="Category" value={<TradeBadge type="category" value={trade.category} />} />
          <DetailField label="Sector" value={trade.sector} />
          <DetailField label="Market Cap" value={trade.marketCap} />
          <DetailField label="Time Frame" value={trade.timeFrame} />
        </div>
      </SectionCard>

      {/* Pricing */}
      <SectionCard title="Pricing" icon={<DollarSign className="w-4 h-4" />}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <DetailField
            label="Entry Price"
            value={canSeeField('entry') ? formatPrice(trade.entryPrice) : <PremiumFieldPlaceholder />}
            mono={canSeeField('entry')}
          />
          <DetailField
            label="Exit Price"
            value={canSeeField('exit') ? formatPrice(trade.exitPrice) : <PremiumFieldPlaceholder />}
            mono={canSeeField('exit')}
          />
          <DetailField
            label="Stop Loss"
            value={canSeeField('riskPerTrade') ? formatPrice(trade.stopLoss) : <PremiumFieldPlaceholder />}
            mono={canSeeField('riskPerTrade')}
          />
        </div>
      </SectionCard>

      {/* Outcome */}
      <SectionCard title="Outcome" icon={<Target className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label="Result" value={<TradeBadge type="result" value={trade.result} />} />
          <DetailField label="Status" value={<TradeBadge type="status" value={trade.status} />} />
        </div>
      </SectionCard>

      {/* Learnings */}
      <SectionCard title="Learnings" icon={<Lightbulb className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Notes
            </p>
            {canSeeField('contractNotes') ? (
              <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded p-3 border border-border/50">
                {trade.notes || <span className="text-muted-foreground italic">No notes recorded</span>}
              </p>
            ) : (
              <div className="bg-muted/30 rounded p-3 border border-border/50 flex items-center gap-2">
                <PremiumFieldPlaceholder />
                <span className="text-xs text-muted-foreground">Upgrade to Premium to view notes</span>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Learning / Mistakes
            </p>
            <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded p-3 border border-border/50">
              {trade.learningMistakes || <span className="text-muted-foreground italic">No learnings recorded</span>}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
