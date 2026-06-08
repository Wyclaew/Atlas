import { PLATFORM_META, STATUS_META } from '../../lib/meta';
import type { GameStatus, PlatformKey } from '../../types';

export function StatusBadge({ status, subtle = false }: { status: GameStatus; subtle?: boolean }) {
  const m = STATUS_META[status];
  const Icon = m.Icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight"
      style={{
        color: m.color,
        backgroundColor: subtle ? 'transparent' : `color-mix(in srgb, ${m.color} 14%, transparent)`,
      }}
    >
      <Icon size={11} strokeWidth={2.4} />
      {m.label}
    </span>
  );
}

export function PlatformBadge({
  platform,
  showName = true,
  className = '',
}: {
  platform: PlatformKey;
  showName?: boolean;
  className?: string;
}) {
  const m = PLATFORM_META[platform];
  const Icon = m.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium tracking-tight ${className}`}
      style={{ color: m.color }}
    >
      <Icon size={12} strokeWidth={2.2} />
      {showName && <span className="text-text/90">{m.name}</span>}
    </span>
  );
}
