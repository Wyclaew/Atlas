import { useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, ExternalLink, TrendingDown, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CoverImage } from '../../components/ui/CoverImage';
import { Button } from '../../components/ui/Button';
import { coverCandidates } from '../../lib/steamArt';
import { formatPrice } from '../../lib/format';
import { openExternal } from '../../lib/tauri';
import { useT } from '../../i18n';
import type { WishlistItem } from '../../types';

function Row({ item }: { item: WishlistItem }) {
  const removeWishlist = useStore((s) => s.removeWishlist);
  const t = useT();
  const [accent, setAccent] = useState('var(--color-accent)');

  const covers = useMemo(
    () => coverCandidates({ platform_key: item.platform_key, external_id: item.external_id, cover_url: item.cover_url }),
    [item.platform_key, item.external_id, item.cover_url]
  );
  const dropped =
    item.prev_price_cents != null && item.last_price_cents != null && item.last_price_cents < item.prev_price_cents;
  const discount = item.discount_pct ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ '--g': accent } as CSSProperties}
      className="ring-game flex items-center gap-4 rounded-xl border border-line bg-surface p-3"
    >
      <CoverImage candidates={covers} alt={item.title} className="h-16 w-11 shrink-0" rounded="rounded-md" onAccent={setAccent} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text">{item.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px]">
          {discount > 0 && (
            <span className="rounded-md bg-[var(--color-st-playing)]/15 px-1.5 py-0.5 font-semibold text-[var(--color-st-playing)]">
              -{discount}%
            </span>
          )}
          {dropped && (
            <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--color-st-playing)' }}>
              <TrendingDown size={12} /> {t('wishlist.priceDropped')}
            </span>
          )}
          {item.lowest_cents != null && (
            <span className="text-faint">
              {t('common.allTimeLow')} {formatPrice(item.lowest_cents, item.currency)}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        {item.last_price_cents != null ? (
          <>
            <p className="text-sm font-bold tabular-nums text-text">{formatPrice(item.last_price_cents, item.currency)}</p>
            {item.best_store && <p className="text-[11px] text-faint">{item.best_store}</p>}
          </>
        ) : (
          <p className="text-sm text-faint">—</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {item.store_url && (
          <button
            onClick={() => void openExternal(item.store_url!)}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-line text-dim transition-colors hover:text-text"
            aria-label={t('common.buy')}
            title={t('common.buy')}
          >
            <ExternalLink size={15} />
          </button>
        )}
        <button
          onClick={() => void removeWishlist(item.platform_key, item.external_id)}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-line text-faint transition-colors hover:text-rose-300"
          aria-label={t('common.remove')}
          title={t('common.remove')}
        >
          <X size={15} />
        </button>
      </div>
    </motion.div>
  );
}

export function WishlistView() {
  const wishlist = useStore((s) => s.wishlist);
  const setNav = useStore((s) => s.setNav);
  const t = useT();

  if (wishlist.length === 0) {
    return (
      <div className="dot-grid grid h-full place-items-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex max-w-sm flex-col items-center text-center"
        >
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-line bg-surface-2">
            <Bookmark size={26} className="text-dim" />
          </div>
          <h3 className="font-display text-xl font-bold tracking-tight text-text">{t('wishlist.emptyTitle')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-dim">{t('wishlist.emptyBody')}</p>
          <Button variant="primary" icon={Bookmark} className="mt-6" onClick={() => setNav('store')}>
            {t('nav.store')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <div className="mx-auto max-w-3xl space-y-2.5">
        {wishlist.map((w) => (
          <Row key={w.id} item={w} />
        ))}
      </div>
    </div>
  );
}
