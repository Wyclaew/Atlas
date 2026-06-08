import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Spinner } from '../../components/ui/Spinner';
import { formatPercent, relativeTime } from '../../lib/format';
import { Trophy } from 'lucide-react';

export function AchievementList({ gameId }: { gameId: number }) {
  const items = useStore((s) => s.achievements[gameId]);
  const loading = useStore((s) => s.achievementsLoading);
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);

  if (loading && !items) {
    return (
      <div className="grid place-items-center py-10">
        <Spinner label="Loading achievements…" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface-2 py-8 text-center">
        <Trophy size={22} className="text-faint" />
        <p className="text-[13px] text-faint">No achievements for this game.</p>
      </div>
    );
  }

  const shown = onlyUnlocked ? items.filter((a) => a.unlocked) : items;

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <button
          onClick={() => setOnlyUnlocked((v) => !v)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
            onlyUnlocked ? 'bg-white/10 text-text' : 'text-faint hover:text-dim'
          }`}
        >
          {onlyUnlocked ? 'Showing unlocked' : 'Show unlocked only'}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {shown.map((a) => (
          <div
            key={a.api_name}
            className={`flex items-center gap-3 rounded-lg border border-line p-2.5 ${
              a.unlocked ? 'bg-surface-2' : 'bg-surface/50'
            }`}
          >
            {(a.unlocked ? a.icon_url : a.icon_locked_url ?? a.icon_url) ? (
              <img
                src={(a.unlocked ? a.icon_url : a.icon_locked_url ?? a.icon_url) as string}
                alt=""
                loading="lazy"
                className="h-11 w-11 shrink-0 rounded-md"
                style={a.unlocked ? undefined : { filter: 'grayscale(1) brightness(0.6)' }}
              />
            ) : (
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-surface-2">
                <Trophy size={16} className="text-faint" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className={`truncate text-[13px] font-semibold ${a.unlocked ? 'text-text' : 'text-dim'}`}>
                {a.name ?? a.api_name}
              </p>
              {a.description && <p className="truncate text-[11px] text-faint">{a.description}</p>}
            </div>
            <div className="shrink-0 text-right">
              {a.unlocked ? (
                <p className="text-[11px] font-medium" style={{ color: 'var(--color-gold)' }}>
                  {a.unlock_time ? relativeTime(a.unlock_time) : 'Unlocked'}
                </p>
              ) : (
                <p className="text-[11px] text-faint">Locked</p>
              )}
              {a.global_percent != null && (
                <p className="text-[10px] text-faint tabular-nums">{formatPercent(a.global_percent)} of players</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
