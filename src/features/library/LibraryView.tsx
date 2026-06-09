import { useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Library, Plug, SearchX } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { filterAndSort } from '../../lib/select';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useT } from '../../i18n';
import { GameGrid } from './GameGrid';

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof Library;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="dot-grid grid h-full place-items-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex max-w-sm flex-col items-center text-center"
      >
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-line bg-surface-2">
          <Icon size={26} className="text-dim" />
        </div>
        <h3 className="font-display text-xl font-bold tracking-tight text-text">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-dim">{body}</p>
        {action && <div className="mt-6">{action}</div>}
      </motion.div>
    </div>
  );
}

export function LibraryView() {
  const games = useStore((s) => s.games);
  const nav = useStore((s) => s.activeNav);
  const search = useStore((s) => s.search);
  const sort = useStore((s) => s.sort);
  const isLoading = useStore((s) => s.isLoading);
  const setNav = useStore((s) => s.setNav);
  const t = useT();

  const filtered = useMemo(() => filterAndSort(games, nav, search, sort), [games, nav, search, sort]);

  if (isLoading && games.length === 0) {
    return (
      <div className="grid h-full place-items-center">
        <Spinner size={26} />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <EmptyState
        icon={Plug}
        title={t('lib.emptyTitle')}
        body={t('lib.emptyBody')}
        action={
          <Button variant="primary" icon={Plug} onClick={() => setNav('accounts')}>
            {t('lib.connect')}
          </Button>
        }
      />
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={search ? SearchX : Library}
        title={search ? t('lib.noMatchTitle') : t('lib.nothingTitle')}
        body={search ? t('lib.noMatchBody') : t('lib.nothingBody')}
      />
    );
  }

  return <GameGrid games={filtered} />;
}
