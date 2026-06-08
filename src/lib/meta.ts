// Visual metadata for platforms and statuses (label, color, icon).

import { Boxes, Gamepad, Gamepad2, Joystick, Library, Play, Trophy, Heart, CircleSlash } from 'lucide-react';
import type { GameStatus, PlatformKey } from '../types';

type IconType = typeof Gamepad2;

export const PLATFORM_META: Record<PlatformKey, { name: string; color: string; Icon: IconType }> = {
  steam: { name: 'Steam', color: '#66c0f4', Icon: Gamepad2 },
  epic: { name: 'Epic Games', color: '#cfcfcf', Icon: Joystick },
  gog: { name: 'GOG', color: '#b072e0', Icon: Boxes },
  xbox: { name: 'Xbox', color: '#5bd95b', Icon: Gamepad },
};

export const STATUS_ORDER: GameStatus[] = ['Library', 'Playing', 'Completed', 'Wishlist', 'Dropped'];

export const STATUS_META: Record<GameStatus, { label: string; color: string; Icon: IconType }> = {
  Library: { label: 'In Library', color: 'var(--color-st-library)', Icon: Library },
  Playing: { label: 'Playing', color: 'var(--color-st-playing)', Icon: Play },
  Completed: { label: 'Completed', color: 'var(--color-st-completed)', Icon: Trophy },
  Wishlist: { label: 'Wishlist', color: 'var(--color-st-wishlist)', Icon: Heart },
  Dropped: { label: 'Dropped', color: 'var(--color-st-dropped)', Icon: CircleSlash },
};
