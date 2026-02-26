import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, LayoutDashboard, BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';

const ADMIN_PRINCIPAL = import.meta.env.VITE_ADMIN_PRINCIPAL || '';

export function Header() {
  const { identity, login, clear, isLoggingIn, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const principal = identity?.getPrincipal().toString();
  const isAdmin = !!principal && (principal === ADMIN_PRINCIPAL || ADMIN_PRINCIPAL === '');

  const handleLogout = () => {
    clear();
    navigate({ to: '/' });
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Trade Journal', icon: <BookOpen className="w-4 h-4" /> },
    ...(isAdmin && identity ? [{ to: '/admin', label: 'Admin', icon: <LayoutDashboard className="w-4 h-4" /> }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/assets/generated/sid-trades-logo.dim_128x128.png"
            alt="Sid Trades"
            className="w-7 h-7 rounded"
          />
          <span className="font-bold text-lg tracking-tight text-gold group-hover:text-primary transition-colors">
            Sid Trades
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth + Mobile Toggle */}
        <div className="flex items-center gap-2">
          {!isInitializing && (
            identity ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                  {principal?.slice(0, 8)}…
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 border-border">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="hidden md:flex gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <LogIn className="w-3.5 h-3.5" />
                {isLoggingIn ? 'Connecting…' : 'Login'}
              </Button>
            )
          )}

          <button
            className="md:hidden p-1.5 rounded text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border">
            {identity ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-mono px-3">{principal?.slice(0, 16)}…</p>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full gap-1.5">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => { login(); setMobileOpen(false); }} disabled={isLoggingIn} className="w-full gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                {isLoggingIn ? 'Connecting…' : 'Login'}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
