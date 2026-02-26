import { useState } from 'react';
import { Trade, TradeFormData, TradeCategory, TradeTimeFrame, TradeMarketCap, TradeResult, TradeStatus } from '../types/trade';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface TradeFormProps {
  initialData?: Trade;
  onSubmit: (data: TradeFormData) => void;
  onCancel: () => void;
  isPending?: boolean;
}

const CATEGORIES: TradeCategory[] = ['Equity', 'Options', 'Futures', 'Forex'];
const TIMEFRAMES: TradeTimeFrame[] = ['Intraday', 'Swing', 'LongTerm'];
const MARKET_CAPS: TradeMarketCap[] = ['Small', 'Mid', 'Large'];
const RESULTS: TradeResult[] = ['Profit', 'Loss', 'Breakeven'];
const STATUSES: TradeStatus[] = ['Open', 'Closed'];

const defaultForm: TradeFormData = {
  date: new Date().toISOString().split('T')[0],
  scriptName: '',
  category: 'Equity',
  entryPrice: 0,
  exitPrice: 0,
  stopLoss: 0,
  timeFrame: 'Swing',
  marketCap: 'Large',
  sector: '',
  result: 'Profit',
  status: 'Open',
  notes: '',
  learningMistakes: '',
};

export function TradeForm({ initialData, onSubmit, onCancel, isPending }: TradeFormProps) {
  const [form, setForm] = useState<TradeFormData>(
    initialData ? { ...initialData } : defaultForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof TradeFormData, string>>>({});

  const set = <K extends keyof TradeFormData>(key: K, value: TradeFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof TradeFormData, string>> = {};
    if (!form.date) errs.date = 'Date is required';
    if (!form.scriptName.trim()) errs.scriptName = 'Script name is required';
    if (form.entryPrice <= 0) errs.entryPrice = 'Entry price must be > 0';
    if (!form.sector.trim()) errs.sector = 'Sector is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Row 1: Date + Script */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-xs text-muted-foreground uppercase tracking-wide">Date *</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className="bg-input border-border"
          />
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scriptName" className="text-xs text-muted-foreground uppercase tracking-wide">Script Name *</Label>
          <Input
            id="scriptName"
            value={form.scriptName}
            onChange={(e) => set('scriptName', e.target.value)}
            placeholder="e.g. RELIANCE, NIFTY CE"
            className="bg-input border-border"
          />
          {errors.scriptName && <p className="text-xs text-destructive">{errors.scriptName}</p>}
        </div>
      </div>

      {/* Row 2: Category + Sector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Category</Label>
          <Select value={form.category} onValueChange={(v) => set('category', v as TradeCategory)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sector" className="text-xs text-muted-foreground uppercase tracking-wide">Sector *</Label>
          <Input
            id="sector"
            value={form.sector}
            onChange={(e) => set('sector', e.target.value)}
            placeholder="e.g. Energy, Finance"
            className="bg-input border-border"
          />
          {errors.sector && <p className="text-xs text-destructive">{errors.sector}</p>}
        </div>
      </div>

      {/* Row 3: TimeFrame + MarketCap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Time Frame</Label>
          <Select value={form.timeFrame} onValueChange={(v) => set('timeFrame', v as TradeTimeFrame)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Market Cap</Label>
          <Select value={form.marketCap} onValueChange={(v) => set('marketCap', v as TradeMarketCap)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MARKET_CAPS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 4: Prices */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="entryPrice" className="text-xs text-muted-foreground uppercase tracking-wide">Entry Price *</Label>
          <Input
            id="entryPrice"
            type="number"
            step="0.01"
            value={form.entryPrice || ''}
            onChange={(e) => set('entryPrice', parseFloat(e.target.value) || 0)}
            className="bg-input border-border font-mono"
          />
          {errors.entryPrice && <p className="text-xs text-destructive">{errors.entryPrice}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exitPrice" className="text-xs text-muted-foreground uppercase tracking-wide">Exit Price</Label>
          <Input
            id="exitPrice"
            type="number"
            step="0.01"
            value={form.exitPrice || ''}
            onChange={(e) => set('exitPrice', parseFloat(e.target.value) || 0)}
            className="bg-input border-border font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stopLoss" className="text-xs text-muted-foreground uppercase tracking-wide">Stop Loss</Label>
          <Input
            id="stopLoss"
            type="number"
            step="0.01"
            value={form.stopLoss || ''}
            onChange={(e) => set('stopLoss', parseFloat(e.target.value) || 0)}
            className="bg-input border-border font-mono"
          />
        </div>
      </div>

      {/* Row 5: Result + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Result</Label>
          <Select value={form.result} onValueChange={(v) => set('result', v as TradeResult)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESULTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
          <Select value={form.status} onValueChange={(v) => set('status', v as TradeStatus)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs text-muted-foreground uppercase tracking-wide">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Trade rationale, observations..."
          rows={3}
          className="bg-input border-border resize-none"
        />
      </div>

      {/* Learning/Mistakes */}
      <div className="space-y-1.5">
        <Label htmlFor="learningMistakes" className="text-xs text-muted-foreground uppercase tracking-wide">Learning / Mistakes</Label>
        <Textarea
          id="learningMistakes"
          value={form.learningMistakes}
          onChange={(e) => set('learningMistakes', e.target.value)}
          placeholder="What did you learn? What mistakes were made?"
          rows={3}
          className="bg-input border-border resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : initialData ? 'Update Trade' : 'Add Trade'}
        </Button>
      </div>
    </form>
  );
}
