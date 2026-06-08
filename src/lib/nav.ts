import type { AppView, NavId } from '../types';
import { PLATFORM_META } from './meta';

export function navToView(nav: NavId): AppView {
  if (nav === 'dashboard') return 'dashboard';
  if (nav === 'accounts') return 'accounts';
  return 'library';
}

export function navTitle(nav: NavId): string {
  switch (nav) {
    case 'dashboard':
      return 'Dashboard';
    case 'all':
      return 'All Games';
    case 'favorites':
      return 'Favorites';
    case 'playing':
      return 'Playing';
    case 'completed':
      return 'Completed';
    case 'wishlist':
      return 'Wishlist';
    case 'accounts':
      return 'Accounts & Settings';
    default:
      return PLATFORM_META[nav]?.name ?? 'Library';
  }
}

export function navSubtitle(nav: NavId): string {
  switch (nav) {
    case 'favorites':
      return 'Games you starred';
    case 'playing':
      return 'Currently in rotation';
    case 'completed':
      return 'Finished and put down';
    case 'wishlist':
      return 'On your radar';
    default:
      return 'Everything in one place';
  }
}
