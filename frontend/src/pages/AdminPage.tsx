import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListTrades, useCreateTrade, useUpdateTrade, useDeleteTrade } from '../hooks/useQueries';
import { Trade, TradeFormData } from '../types/trade';
import { TradeForm } from '../components/TradeForm';
import { TradeBadge } from '../components/TradeBadge';
import { formatPrice, formatDate } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Pencil, Trash2, LayoutDashboard, BookOpen, ChevronDown, Eye, Users, Shield, Loader2 } from 'lucide-react';
import { useGetFieldVisibilityConfig, useSetFieldVisibility } from '../hooks/useFieldVisibility';
import { useListUsers, useSetUserRole } from '../hooks/useUserRoles';
import { FieldVisibilityLevel, UserRole } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

const ADMIN_PRINCIPAL = import.meta.env.VITE_ADMIN_PRINCIPAL || '';

// All trade fields that can have visibility settings
const TRADE_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'key', label: 'Trade Key / Script' },
  { key: 'currentPrice', label: 'Current Price' },
  { key: 'duration', label: 'Duration' },
  { key: 'shares', label: 'Shares' },
  { key: 'ratedPerTrade', label: 'Rated Per Trade' },
  { key: 'tradeType', label: 'Trade Type' },
  { key: 'riskPerTrade', label: 'Risk Per Trade' },
  { key: 'contractNotes', label: 'Contract Notes' },
  { key: 'exit', label: 'Exit' },
  { key: 'entry', label: 'Entry' },
  { key: 'position', label: 'Position' },
  { key: 'potential', label: 'Potential %' },
];

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.admin: return 'Admin';
    case UserRole.user: return 'Premium User';
    case UserRole.guest: return 'Free User';
    default: return 'Free User';
  }
}

function getRoleBadgeClass(role: UserRole): string {
  switch (role) {
    case UserRole.admin: return 'bg-primary/10 text-primary border-primary/20';
    case UserRole.user: return 'bg-emerald/10 text-emerald border-emerald/20';
    case UserRole.guest: return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

function truncatePrincipal(p: Principal): string {
  const str = p.toString();
  if (str.length <= 16) return str;
  return `${str.slice(0, 8)}…${str.slice(-6)}`;
}

// ── Field Visibility Panel ────────────────────────────────────────────────────

function FieldVisibilityPanel() {
  const [open, setOpen] = useState(false);
  const { data: config = [], isLoading } = useGetFieldVisibilityConfig();
  const setFieldVisibility = useSetFieldVisibility();

  const getLevel = (fieldKey: string): FieldVisibilityLevel => {
    const entry = config.find(([k]) => k === fieldKey);
    return entry ? entry[1] : FieldVisibilityLevel.publicField;
  };

  const handleToggle = (fieldKey: string, checked: boolean) => {
    const level = checked ? FieldVisibilityLevel.premiumOnly : FieldVisibilityLevel.publicField;
    setFieldVisibility.mutate({ field: fieldKey, level });
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-3 border-b border-border flex items-center gap-2 hover:bg-accent/20 transition-colors">
            <Eye className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-semibold text-foreground">Field Visibility</h2>
            <span className="ml-auto text-xs text-muted-foreground mr-2">
              {config.filter(([, v]) => v === FieldVisibilityLevel.premiumOnly).length} premium-only
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading visibility config…</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2 items-center mb-3 pb-2 border-b border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Field</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Public</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Premium Only</span>
                </div>
                {TRADE_FIELDS.map(({ key, label }) => {
                  const isPremium = getLevel(key) === FieldVisibilityLevel.premiumOnly;
                  const isPending = setFieldVisibility.isPending && setFieldVisibility.variables?.field === key;
                  return (
                    <div key={key} className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center py-1.5 px-2 rounded hover:bg-accent/10 transition-colors">
                      <span className="text-sm text-foreground">{label}</span>
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          !isPremium ? 'bg-emerald/10 text-emerald border-emerald/20' : 'bg-muted/30 text-muted-foreground border-border/50'
                        }`}>
                          {!isPremium ? 'Public' : '—'}
                        </span>
                      </div>
                      <div className="flex justify-center items-center gap-2">
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Switch
                            checked={isPremium}
                            onCheckedChange={(checked) => handleToggle(key, checked)}
                            className="data-[state=checked]:bg-primary"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ── User Role Management Panel ────────────────────────────────────────────────

function UserRoleManagementPanel() {
  const [open, setOpen] = useState(false);
  const { data: users = [], isLoading } = useListUsers();
  const setUserRole = useSetUserRole();

  const handleRoleChange = (user: Principal, role: string) => {
    const roleValue = role as UserRole;
    setUserRole.mutate({ user, role: roleValue });
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-3 border-b border-border flex items-center gap-2 hover:bg-accent/20 transition-colors">
            <Users className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-semibold text-foreground">User Roles</h2>
            <span className="ml-auto text-xs text-muted-foreground mr-2">
              {users.length} registered user{users.length !== 1 ? 's' : ''}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading users…</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No registered users yet.
              </div>
            ) : (
              <TooltipProvider>
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_auto] gap-4 items-center pb-2 border-b border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Principal</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</span>
                  </div>
                  {users.map(([principal, role]) => {
                    const principalStr = principal.toString();
                    const isPending = setUserRole.isPending && setUserRole.variables?.user.toString() === principalStr;
                    return (
                      <div key={principalStr} className="grid grid-cols-[1fr_auto] gap-4 items-center py-1.5 px-2 rounded hover:bg-accent/10 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <Shield className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm font-mono text-foreground truncate cursor-default">
                                {truncatePrincipal(principal)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="font-mono text-xs max-w-xs break-all">
                              {principalStr}
                            </TooltipContent>
                          </Tooltip>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${getRoleBadgeClass(role)}`}>
                            {getRoleLabel(role)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Select
                              value={role}
                              onValueChange={(v) => handleRoleChange(principal, v)}
                            >
                              <SelectTrigger className="bg-input border-border h-8 text-xs w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={UserRole.guest}>Free User</SelectItem>
                                <SelectItem value={UserRole.user}>Premium User</SelectItem>
                                <SelectItem value={UserRole.admin}>Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TooltipProvider>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export function AdminPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: trades = [] } = useListTrades();
  const createTrade = useCreateTrade();
  const updateTrade = useUpdateTrade();
  const deleteTrade = useDeleteTrade();

  const [formOpen, setFormOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const principal = identity?.getPrincipal().toString();
  const isAdmin = !!principal && (principal === ADMIN_PRINCIPAL || ADMIN_PRINCIPAL === '');

  if (!identity || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <LayoutDashboard className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold text-foreground">Admin Access Required</h1>
        <p className="text-muted-foreground text-sm">Please log in with your admin account to access this page.</p>
        <Button onClick={() => navigate({ to: '/' })} variant="outline">
          Go to Trade Journal
        </Button>
      </div>
    );
  }

  const stats = {
    total: trades.length,
    open: trades.filter((t: Trade) => t.status === 'Open').length,
    profits: trades.filter((t: Trade) => t.result === 'Profit').length,
    losses: trades.filter((t: Trade) => t.result === 'Loss').length,
  };

  const handleCreate = (data: TradeFormData) => {
    createTrade.mutate(data, { onSuccess: () => setFormOpen(false) });
  };

  const handleUpdate = (data: TradeFormData) => {
    if (!editTrade) return;
    updateTrade.mutate({ id: editTrade.id, data }, { onSuccess: () => setEditTrade(null) });
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    deleteTrade.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-gold" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage trade journal entries</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Trade
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Trades', value: stats.total, color: 'text-foreground' },
          { label: 'Open Trades', value: stats.open, color: 'text-primary' },
          { label: 'Profits', value: stats.profits, color: 'text-emerald' },
          { label: 'Losses', value: stats.losses, color: 'text-destructive' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-3 shadow-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Trades Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gold" />
          <h2 className="text-sm font-semibold text-foreground">All Trades</h2>
          <span className="ml-auto text-xs text-muted-foreground">{trades.length} entries</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Script</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Entry</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Exit</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Result</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade: Trade, idx: number) => (
                <tr key={trade.id} className={`border-b border-border/50 hover:bg-accent/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{formatDate(trade.date)}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{trade.scriptName}</td>
                  <td className="px-4 py-3"><TradeBadge type="category" value={trade.category} /></td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{formatPrice(trade.entryPrice)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">{formatPrice(trade.exitPrice)}</td>
                  <td className="px-4 py-3 text-center"><TradeBadge type="result" value={trade.result} /></td>
                  <td className="px-4 py-3 text-center"><TradeBadge type="status" value={trade.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-primary"
                        onClick={() => setEditTrade(trade)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(trade.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border/50">
          {trades.map((trade: Trade) => (
            <div key={trade.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{trade.scriptName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{formatDate(trade.date)}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => setEditTrade(trade)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(trade.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <TradeBadge type="category" value={trade.category} />
                <TradeBadge type="result" value={trade.result} />
                <TradeBadge type="status" value={trade.status} />
              </div>
              <div className="flex gap-4 text-xs font-mono text-muted-foreground">
                <span>Entry: {formatPrice(trade.entryPrice)}</span>
                <span>Exit: {formatPrice(trade.exitPrice)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Field Visibility Panel */}
      <FieldVisibilityPanel />

      {/* User Role Management Panel */}
      <UserRoleManagementPanel />

      {/* Add Trade Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Trade</DialogTitle>
          </DialogHeader>
          <TradeForm
            onSubmit={handleCreate}
            onCancel={() => setFormOpen(false)}
            isPending={createTrade.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Trade Dialog */}
      <Dialog open={!!editTrade} onOpenChange={(open) => !open && setEditTrade(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Trade — {editTrade?.scriptName}</DialogTitle>
          </DialogHeader>
          {editTrade && (
            <TradeForm
              initialData={editTrade}
              onSubmit={handleUpdate}
              onCancel={() => setEditTrade(null)}
              isPending={updateTrade.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Trade</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
