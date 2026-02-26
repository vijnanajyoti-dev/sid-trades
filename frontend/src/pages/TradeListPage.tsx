import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useListTrades } from '../hooks/useQueries';
import { Trade, TradeCategory, TradeResult, TradeStatus } from '../types/trade';
import { TradeBadge } from '../components/TradeBadge';
import { PremiumFieldPlaceholder } from '../components/PremiumFieldPlaceholder';
import { formatPrice, formatDate, calculatePnL, getResultColor, shouldShowField } from '../lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { useGetCallerUserRole } from '../hooks/useUserRoles';
import { useGetPublicFieldVisibility } from '../hooks/useFieldVisibility';
import { UserRole } from '../backend';

const ALL = 'All';

export function TradeListPage() {
  const { data: trades = [] } = useListTrades();
  const { data: callerRole } = useGetCallerUserRole();
  const { data: visibilityConfig = [] } = useGetPublicFieldVisibility();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<TradeCategory | typeof ALL>(ALL);
  const [filterStatus, setFilterStatus] = useState<TradeStatus | typeof ALL>(ALL);
  const [filterResult, setFilterResult] = useState<TradeResult | typeof ALL>(ALL);

  const canSeeField = (fieldName: string) =>
    shouldShowField(fieldName, callerRole, visibilityConfig);

  const filtered = useMemo(() => {
    return trades.filter((t: Trade) => {
      const matchSearch = t.scriptName.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === ALL || t.category === filterCategory;
      const matchStatus = filterStatus === ALL || t.status === filterStatus;
      const matchResult = filterResult === ALL || t.result === filterResult;
      return matchSearch && matchCategory && matchStatus && matchResult;
    });
  }, [trades, search, filterCategory, filterStatus, filterResult]);

  const stats = useMemo(() => {
    const closed = trades.filter((t: Trade) => t.status === 'Closed');
    const profits = closed.filter((t: Trade) => t.result === 'Profit').length;
    const losses = closed.filter((t: Trade) => t.result === 'Loss').length;
    const winRate = closed.length > 0 ? ((profits / closed.length) * 100).toFixed(0) : '0';
    return { total: trades.length, profits, losses, winRate, open: trades.filter((t: Trade) => t.status === 'Open').length };
  }, [trades]);

  const resetFilters = () => {
    setSearch('');
    setFilterCategory(ALL);
    setFilterStatus(ALL);
    setFilterResult(ALL);
  };

  const hasFilters = search || filterCategory !== ALL || filterStatus !== ALL || filterResult !== ALL;

  // Role badge for current user
  const roleBadge = callerRole === UserRole.admin
    ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-primary/10 text-primary border-primary/20">Admin</span>
    : callerRole === UserRole.user
    ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-emerald/10 text-emerald border-emerald/20">Premium</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-muted text-muted-foreground border-border">Free</span>;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Trade Journal</h1>
          <p className="text-sm text-muted-foreground mt-1">Personal record of trades for learning and analysis</p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground hidden sm:inline">Access:</span>
          {roleBadge}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Trades', value: stats.total, icon: null, color: 'text-foreground' },
          { label: 'Win Rate', value: `${stats.winRate}%`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald' },
          { label: 'Profits', value: stats.profits, icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'text-emerald' },
          { label: 'Losses', value: stats.losses, icon: <TrendingDown className="w-3.5 h-3.5" />, color: 'text-destructive' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-3 shadow-card">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-xl font-bold mt-0.5 flex items-center gap-1 ${stat.color}`}>
              {stat.icon}
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search script..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-input border-border text-sm h-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as TradeCategory | typeof ALL)}>
            <SelectTrigger className="bg-input border-border h-9 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Categories</SelectItem>
              {(['Equity', 'Options', 'Futures', 'Forex'] as TradeCategory[]).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TradeStatus | typeof ALL)}>
            <SelectTrigger className="bg-input border-border h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Statuses</SelectItem>
              {(['Open', 'Closed'] as TradeStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterResult} onValueChange={(v) => setFilterResult(v as TradeResult | typeof ALL)}>
            <SelectTrigger className="bg-input border-border h-9 text-sm">
              <SelectValue placeholder="Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Results</SelectItem>
              {(['Profit', 'Loss', 'Breakeven'] as TradeResult[]).map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{filtered.length} of {trades.length} trades</span>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-7 px-2">
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Script</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Entry</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Exit</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">P&L</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Result</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No trades found.
                  </td>
                </tr>
              ) : (
                filtered.map((trade: Trade, idx: number) => {
                  const pnl = calculatePnL(trade.entryPrice, trade.exitPrice, trade.category);
                  const pnlColor = getResultColor(trade.result);
                  return (
                    <tr key={trade.id} className={`border-b border-border/50 hover:bg-accent/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{formatDate(trade.date)}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{trade.scriptName}</td>
                      <td className="px-4 py-3"><TradeBadge type="category" value={trade.category} /></td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {canSeeField('entry') ? formatPrice(trade.entryPrice) : <PremiumFieldPlaceholder size="sm" />}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                        {canSeeField('exit') ? formatPrice(trade.exitPrice) : <PremiumFieldPlaceholder size="sm" />}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-xs font-semibold ${pnlColor}`}>
                        {canSeeField('potential') ? pnl : <PremiumFieldPlaceholder size="sm" />}
                      </td>
                      <td className="px-4 py-3 text-center"><TradeBadge type="result" value={trade.result} /></td>
                      <td className="px-4 py-3 text-center"><TradeBadge type="status" value={trade.status} /></td>
                      <td className="px-4 py-3 text-center">
                        <Link to="/trade/$id" params={{ id: String(trade.id) }}>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No trades found.</div>
        ) : (
          filtered.map((trade: Trade) => {
            const pnl = calculatePnL(trade.entryPrice, trade.exitPrice, trade.category);
            const pnlColor = getResultColor(trade.result);
            return (
              <Link key={trade.id} to="/trade/$id" params={{ id: String(trade.id) }}>
                <div className="bg-card border border-border rounded-lg p-4 space-y-3 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{trade.scriptName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{formatDate(trade.date)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <TradeBadge type="result" value={trade.result} />
                      <TradeBadge type="status" value={trade.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <TradeBadge type="category" value={trade.category} />
                    {canSeeField('potential') && pnl !== '—' && (
                      <span className={`text-xs font-bold font-mono ${pnlColor}`}>{pnl}</span>
                    )}
                    {!canSeeField('potential') && <PremiumFieldPlaceholder size="sm" />}
                  </div>
                  <div className="flex gap-4 text-xs font-mono text-muted-foreground">
                    <span>Entry: {canSeeField('entry') ? formatPrice(trade.entryPrice) : '—'}</span>
                    <span>Exit: {canSeeField('exit') ? formatPrice(trade.exitPrice) : '—'}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
