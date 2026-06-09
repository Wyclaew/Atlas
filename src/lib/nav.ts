import type { AppView, NavId } from '../types';
import type { TKey } from '../i18n/locales';

export function navToView(nav: NavId): AppView {
  if (nav === 'dashboard') return 'dashboard';
  if (nav === 'accounts') return 'accounts';
  if (nav === 'store') return 'store';
  if (nav === 'wishlist') return 'wishlist';
  return 'library';
}

/** Translation key for a nav title (platform navs are resolved separately). */
export function navTitleKey(nav: NavId): TKey {
  switch (nav) {
    case 'dashboard':
      return 'nav.dashboard';
    case 'all':
      return 'nav.allGames';
    case 'favorites':
      return 'nav.favorites';
    case 'playing':
      return 'nav.playing';
    case 'completed':
      return 'nav.completed';
    case 'hidden':
      return 'nav.hidden';
    case 'store':
      return 'nav.store';
    case 'wishlist':
      return 'nav.wishlist';
    case 'accounts':
      return 'nav.settings';
    default:
      return 'nav.allGames';
  }
}
