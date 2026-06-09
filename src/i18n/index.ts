// Tiny i18n: t(locale, key) with English fallback + a reactive useT() hook.

import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { dicts, en, LANGUAGES, type TKey } from './locales';
import type { Locale } from '../types';

export { LANGUAGES };
export type { TKey };

const LS_KEY = 'atlas.locale';

export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(LS_KEY) as Locale | null;
    if (stored && stored in dicts) return stored;
  } catch {
    /* ignore */
  }
  const lang = (typeof navigator !== 'undefined' ? navigator.language : 'en').slice(0, 2).toLowerCase();
  return (lang in dicts ? lang : 'en') as Locale;
}

export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(LS_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function translate(locale: Locale, key: TKey, vars?: Record<string, string | number>): string {
  let s: string = dicts[locale]?.[key] ?? en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

/** Reactive translator — re-renders when the locale changes. */
export function useT(): (key: TKey, vars?: Record<string, string | number>) => string {
  const locale = useStore((s) => s.locale);
  return useCallback((key: TKey, vars?: Record<string, string | number>) => translate(locale, key, vars), [locale]);
}
