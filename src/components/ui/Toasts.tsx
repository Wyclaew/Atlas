import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Toast } from '../../types';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

const COLORS: Record<Toast['type'], string> = {
  success: 'var(--color-st-playing)',
  error: '#ff6b6b',
  info: 'var(--color-accent)',
};

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex w-[min(380px,calc(100vw-3rem))] flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="glass pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl shadow-black/50"
            >
              <Icon size={18} style={{ color: COLORS[t.type] }} strokeWidth={2.2} />
              <span className="flex-1 text-[13px] font-medium leading-snug text-text">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="text-faint transition-colors hover:text-text"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
