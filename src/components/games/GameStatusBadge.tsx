// components/games/GameStatusBadge.tsx — Premium Status Badge

import type { GameStatus } from '../../types';
import { Gamepad2, Clock, Trophy, Star, XCircle } from 'lucide-react';

interface GameStatusBadgeProps {
  status: GameStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<GameStatus, { label: string; bg: string; border: string; text: string; icon: typeof Gamepad2 }> = {
  Backlog:   { label: 'Backlog',     bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.30)', text: '#a5b4fc', icon: Clock },
  Playing:   { label: 'Playing',     bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.30)', text: '#fcd34d', icon: Gamepad2 },
  Completed: { label: 'Completed',   bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.30)', text: '#6ee7b7', icon: Trophy },
  Wishlist:  { label: 'Wishlist',    bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.30)', text: '#d8b4fe', icon: Star },
  Dropped:   { label: 'Dropped',     bg: 'rgba(244, 63, 94, 0.15)',  border: 'rgba(244, 63, 94, 0.30)',  text: '#fca5a5', icon: XCircle },
};

export function GameStatusBadge({ status, size = 'sm' }: GameStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-medium border"
      style={{
        background: config.bg,
        borderColor: config.border,
        color: config.text,
        padding: isSmall ? '3px 8px' : '5px 12px',
        fontSize: isSmall ? '0.75rem' : '0.875rem',
      }}
    >
      <Icon size={isSmall ? 11 : 14} />
      {config.label}
    </span>
  );
}
