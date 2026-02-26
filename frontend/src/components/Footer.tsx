import { Heart } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'sid-trades');

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>© {year} Sid Trades. Personal trading journal.</span>
        <span className="flex items-center gap-1">
          Built with <Heart className="w-3 h-3 text-destructive fill-destructive" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            caffeine.ai
          </a>
        </span>
      </div>
    </footer>
  );
}
