import { useEffect, useMemo, useState } from 'react';
import { Search, Tag } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { api, errorMessage } from '../../lib/tauri';
import { Spinner } from '../../components/ui/Spinner';
import { useT } from '../../i18n';
import { StoreCard } from './StoreCard';
import { StoreGamePanel } from './StoreGamePanel';
import type { FeaturedStore, StoreListing } from '../../types';

function Grid({ items, onOpen }: { items: StoreListing[]; onOpen: (l: StoreListing) => void }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(158px,1fr))] gap-4">
      {items.map((l) => (
        <StoreCard key={l.external_id} listing={l} onOpen={onOpen} />
      ))}
    </div>
  );
}

function Rail({ title, items, onOpen }: { title: string; items: StoreListing[]; onOpen: (l: StoreListing) => void }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="mb-3 font-display text-[15px] font-semibold tracking-tight text-text">{title}</h3>
      <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
        {items.map((l) => (
          <div key={l.external_id} className="w-[158px] shrink-0">
            <StoreCard listing={l} onOpen={onOpen} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function StoreView() {
  const region = useStore((s) => s.region);
  const toast = useStore((s) => s.toast);
  const t = useT();

  const [featured, setFeatured] = useState<FeaturedStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<StoreListing[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<StoreListing | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .storeFeatured(region)
      .then((f) => !cancelled && setFeatured(f))
      .catch((e) => !cancelled && toast(errorMessage(e), 'error'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [region, toast]);

  useEffect(() => {
    const q = term.trim();
    if (!q) {
      setResults(null);
      return;
    }
    setSearching(true);
    const id = setTimeout(async () => {
      try {
        setResults(await api.storeSearch(q, region));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [term, region]);

  const dealCount = useMemo(() => featured?.specials.length ?? 0, [featured]);

  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <div className="relative mb-7 max-w-xl">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t('common.search')}
          className="h-12 w-full rounded-xl border border-line bg-surface-2 pl-11 pr-4 text-sm text-text placeholder:text-faint transition-colors focus:border-line-strong focus:outline-none"
        />
      </div>

      {results !== null ? (
        <section>
          <h3 className="mb-3 font-display text-[15px] font-semibold tracking-tight text-text">
            {t('store.searchResults')}
          </h3>
          {searching && !results.length ? (
            <div className="grid place-items-center py-10">
              <Spinner />
            </div>
          ) : results.length ? (
            <Grid items={results} onOpen={setSelected} />
          ) : (
            <p className="py-10 text-center text-sm text-faint">{t('lib.noMatchBody')}</p>
          )}
        </section>
      ) : loading ? (
        <div className="grid h-[60vh] place-items-center">
          <Spinner size={26} />
        </div>
      ) : (
        <div className="space-y-9">
          {dealCount > 0 && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight text-text">
                <Tag size={15} style={{ color: 'var(--color-st-playing)' }} /> {t('store.deals')}
              </h3>
              <Grid items={featured!.specials} onOpen={setSelected} />
            </section>
          )}
          <Rail title={t('store.newReleases')} items={featured?.new_releases ?? []} onOpen={setSelected} />
          <Rail title={t('store.topSellers')} items={featured?.top_sellers ?? []} onOpen={setSelected} />
        </div>
      )}

      <StoreGamePanel listing={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
