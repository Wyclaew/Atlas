import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** Lightweight right-side tooltip — used by the collapsed sidebar rail. */
export function Tooltip({ label, children, disabled = false, className = '' }: TooltipProps) {
  const [show, setShow] = useState(false);
  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && !disabled && (
          <motion.span
            initial={{ opacity: 0, x: -6, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="glass pointer-events-none absolute left-full top-1/2 z-[60] ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-text shadow-xl shadow-black/50"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
