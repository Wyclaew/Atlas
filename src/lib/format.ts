// Small, locale-aware formatting helpers.

const nf = new Intl.NumberFormat('en-US');

/** Minutes -> compact playtime, e.g. "42m", "3.4h", "1,204h". */
export function formatPlaytime(minutes: number): string {
  if (!minutes || minutes <= 0) return '—';
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  if (hours < 10) return `${(Math.round(hours * 10) / 10).toFixed(1)}h`;
  return `${nf.format(Math.round(hours))}h`;
}

/** Whole hours for stat tiles. */
export function formatHours(minutes: number): string {
  return nf.format(Math.round(minutes / 60));
}

export function formatNumber(n: number): string {
  return nf.format(n);
}

/** Unix seconds -> ISO string (used before persisting). */
export function unixToISO(seconds: number | null | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

/** ISO -> friendly relative time, e.g. "Today", "3d ago", "Mar 2024". */
export function relativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Never';
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatPercent(p: number | null | undefined): string {
  if (p == null) return '';
  if (p < 1) return `${p.toFixed(1)}%`;
  return `${Math.round(p)}%`;
}
