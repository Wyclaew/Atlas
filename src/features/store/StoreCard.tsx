import { useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { CoverImage } from '../../components/ui/CoverImage';
import { formatPrice } from '../../lib/format';
import { useT } from '../../i18n';
import type { StoreListing } from '../../types';

export function StoreCard({ listing, onOpen }: { listing: StoreListing; onOpen: (l: StoreListing) => void }) {
  const [accent, setAccent] = useState('var(--color-accent)');
  const t = useT();
  const covers = [listing.cover_url, listing.header_url].filter(Boolean) as string[];
  const discount = listing.discount_pct ?? 0;
  const hasDiscount = discount > 0;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }} style={{ '--g': accent } as CSSProperties}>
      <button
        onClick={() => onOpen(listing)}
        className="ring-game group block w-full cursor-pointer overflow-hidden rounded-xl bg-surface-2 text-left"
      >
        <div className="relative aspect-[2/3]">
          <CoverImage candidates={covers} alt={listing.title} className="h-full w-full" onAccent={setAccent} />
          {hasDiscount && (
            <span className="absolute left-2 top-2 rounded-md bg-[var(--color-st-playing)] px-1.5 py-0.5 text-[11px] font-bold text-black">
              -{discount}%
            </span>
          )}
        </div>
        <div className="p-2.5">
          <p className="truncate text-[13px] font-semibold text-text" title={listing.title}>
            {listing.title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[12px]">
            {listing.is_free ? (
              <span className="font-semibold text-[var(--color-st-playing)]">{t('common.free')}</span>
            ) : listing.final_cents != null ? (
              <>
                {hasDiscount && listing.initial_cents != null && (
                  <span className="text-faint line-through">{formatPrice(listing.initial_cents, listing.currency)}</span>
                )}
                <span className="font-semibold text-text">{formatPrice(listing.final_cents, listing.currency)}</span>
              </>
            ) : (
              <span className="text-faint">—</span>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}
