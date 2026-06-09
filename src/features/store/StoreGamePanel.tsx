import { useEffect, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, ExternalLink, TrendingDown, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { CoverImage } from '../../components/ui/CoverImage';
import { api, errorMessage, openExternal } from '../../lib/tauri';
import { formatPrice } from '../../lib/format';
import { extractAccent } from '../../lib/color';
import { useT } from '../../i18n';
import type { PriceComparison, StoreApp, StoreListing } from '../../types';

export function StoreGamePanel({ listing, onClose }: { listing: StoreListing | null; onClose: () => void }) {
  const region = useStore((s) => s.region);
  const itadKey = useStore((s) => s.itadKey);
  const addWishlist = useStore((s) => s.addWishlist);
  const removeWishlist = useStore((s) => s.removeWishlist);
  const wishlist = useStore((s) => s.wishlist);
  const toast = useStore((s) => s.toast);
  const t = useT();

  const [app, setApp] = useState<StoreApp | null>(null);
  const [prices, setPrices] = useState<PriceComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [accent, setAccent] = useState('var(--color-accent)');

  const appid = listing?.external_id;
  const wished = !!appid && wishlist.some((w) => w.platform_key === 'steam' && w.external_id === appid);

  useEffect(() => {
    if (!listing) return;
    setApp(null);
    setPrices(null);
    setAccent('var(--color-accent)');
    setLoading(true);
    let cancelled = false;

    (async () => {
      try {
        const a = await api.storeAppDetails(listing.external_id, region);
        if (cancelled) return;
        setApp(a);
        if (a.cover_url) void extractAccent(a.cover_url).then((c) => !cancelled && c && setAccent(c));
      } catch (e) {
        if (!cancelled) toast(errorMessage(e), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
      try {
        const p = await api.itadPrices(itadKey, listing.external_id, region.toUpperCase());
        if (!cancelled) setPrices(p);
      } catch {
        /* prices are best-effort */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appid, region, itadKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (listing) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [listing, onClose]);

  const storeUrl = appid ? `https://store.steampowered.com/app/${appid}` : '';
  const bestUrl = prices?.deals[0]?.url ?? storeUrl;

  const toggleWishlist = () => {
    if (!listing) return;
    if (wished) void removeWishlist('steam', listing.external_id);
    else
      void addWishlist({
        platform_key: 'steam',
        external_id: listing.external_id,
        title: listing.title,
        cover_url: listing.cover_url,
        store_url: storeUrl,
      });
  };

  return (
    <AnimatePresence>
      {listing && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[3px]"
          />
          <motion.aside
            style={{ '--g': accent } as CSSProperties}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-screen w-[600px] max-w-full flex-col border-l border-line bg-surface"
          >
            <div className="relative h-56 shrink-0">
              <CoverImage
                candidates={[app?.header_url, app?.screenshots[0], listing.header_url].filter(Boolean) as string[]}
                alt={listing.title}
                className="absolute inset-0 h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-black/30" />
              <button
                onClick={onClose}
                className="absolute right-4 top-4 grid h-9 w-9 cursor-pointer place-items-center rounded-lg bg-black/50 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/70"
                aria-label="Close"
              >
                <X size={17} />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white">{listing.title}</h2>
                {app && (app.genres.length > 0 || app.release_date) && (
                  <p className="mt-1.5 text-[12px] text-white/70">
                    {[app.release_date, app.genres.slice(0, 3).join(', ')].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <Button variant="game" icon={ExternalLink} onClick={() => void openExternal(bestUrl)}>
                  {t('common.buy')}
                </Button>
                <Button
                  variant={wished ? 'soft' : 'outline'}
                  icon={wished ? BookmarkCheck : Bookmark}
                  onClick={toggleWishlist}
                >
                  {wished ? t('common.inWishlist') : t('common.addWishlist')}
                </Button>
              </div>

              {app?.description && <p className="text-[13.5px] leading-relaxed text-dim">{app.description}</p>}

              {app && app.screenshots.length > 0 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                  {app.screenshots.slice(0, 6).map((s) => (
                    <img key={s} src={s} alt="" loading="lazy" className="h-28 rounded-lg border border-line" />
                  ))}
                </div>
              )}

              {/* Price comparison */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">{t('store.priceComparison')}</p>
                  {prices?.lowest_cents != null && (
                    <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color: 'var(--color-st-playing)' }}>
                      <TrendingDown size={13} /> {t('common.allTimeLow')} {formatPrice(prices.lowest_cents, prices.lowest_currency)}
                    </span>
                  )}
                </div>

                {loading && !prices ? (
                  <div className="grid place-items-center py-6">
                    <Spinner />
                  </div>
                ) : prices && prices.deals.length > 0 ? (
                  <div className="space-y-2">
                    {prices.deals.map((d, i) => (
                      <button
                        key={`${d.shop}-${i}`}
                        onClick={() => void openExternal(d.url)}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-line-strong ${
                          i === 0 ? 'border-[var(--color-accent)]/40 bg-white/[0.03]' : 'border-line bg-surface-2'
                        }`}
                      >
                        <span className="flex-1 truncate text-sm font-medium text-text">{d.shop}</span>
                        {d.cut > 0 && (
                          <span className="rounded-md bg-[var(--color-st-playing)]/15 px-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-st-playing)]">
                            -{d.cut}%
                          </span>
                        )}
                        <span className="text-sm font-semibold tabular-nums text-text">
                          {formatPrice(d.price_cents, d.currency)}
                        </span>
                        <ExternalLink size={14} className="text-faint" />
                      </button>
                    ))}
                  </div>
                ) : app && (app.final_cents != null || app.is_free) ? (
                  <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
                    <span className="flex-1 text-sm font-medium text-text">{t('store.onSteam')}</span>
                    <span className="text-sm font-semibold text-text">
                      {app.is_free ? t('common.free') : formatPrice(app.final_cents, app.currency)}
                    </span>
                  </div>
                ) : (
                  <p className="text-[13px] text-faint">—</p>
                )}

                {!itadKey && (
                  <p className="mt-2.5 text-[12px] leading-relaxed text-faint">{t('store.noKeyHint')}</p>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
