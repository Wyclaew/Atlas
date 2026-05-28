// components/games/GameStatusBadge.tsx — Oyun Durumu Rozeti
// Oyun kartlarında ve detay panelinde durum bilgisini gösterir

import type { GameStatus } from '../../types';
import { Gamepad2, Clock, Trophy, Star, XCircle } from 'lucide-react';

interface GameStatusBadgeProps {
  status: GameStatus;
  size?: 'sm' | 'md';
}

// Her durum için renk ve ikon eşlemesi
const statusConfig: Record<GameStatus, { label: string; bg: string; text: string; icon: typeof Gamepad2 }> = {
  Backlog:   { label: 'Beklemede',    bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', icon: Clock },
  Playing:   { label: 'Oynuyor',      bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', icon: Gamepad2 },
  Completed: { label: 'Tamamlandı',   bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', icon: Trophy },
  Wishlist:  { label: 'İstek Listesi', bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', icon: Star },
  Dropped:   { label: 'Bırakıldı',    bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', icon: XCircle },
};

export function GameStatusBadge({ status, size = 'sm' }: GameStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-medium"
      style={{
        background: config.bg,
        color: config.text,
        padding: isSmall ? '2px 8px' : '4px 12px',
        fontSize: isSmall ? '0.7rem' : '0.8rem',
      }}
    >
      <Icon size={isSmall ? 10 : 14} />
      {config.label}
    </span>
  );
}
