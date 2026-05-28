// components/ui/SidebarButton.tsx — Cyber-Minimalist Obsidian Sidebar Düğmesi

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/useGameStore';

interface SidebarButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  label: string;
  count?: number;
  badge?: React.ReactNode;
}

export function SidebarButton({
  isActive,
  onClick,
  icon: Icon,
  label,
  count,
  badge
}: SidebarButtonProps) {
  const { isSidebarOpen } = useGameStore();

  return (
    <button
      onClick={onClick}
      className={`flex items-center ${isSidebarOpen ? 'w-full justify-start px-4 py-3 gap-3.5' : 'w-12 h-12 justify-center mx-auto'} rounded-xl transition-all duration-300 group relative cursor-pointer outline-none select-none text-left ${isActive ? 'bg-bg-hover border-border-subtle' : 'bg-transparent border-transparent hover:bg-[rgba(128,128,128,0.05)]'}`}
      style={{
        borderWidth: '1px'
      }}
    >
      {/* Sol kenarda yer alan Ember gradyan aktiflik çubuğu */}
      {isActive && (
        <motion.div
          layoutId="sidebarActiveBar"
          className="absolute left-0 top-3 bottom-3 w-[2.5px] rounded-r-full bg-gradient-to-b from-orange-500 to-rose-600 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      {/* Arka plandaki yumuşak Ember glow ışıltısı */}
      {isActive && (
        <motion.div
          layoutId="sidebarActiveGlow"
          className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-rose-600/5 rounded-xl -z-10 blur-sm"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      {/* İkon */}
      <Icon
        size={isSidebarOpen ? 16 : 20}
        className="flex-shrink-0 transition-all duration-300"
        style={{
          color: isActive 
            ? 'var(--color-text-bright)' 
            : 'var(--color-text-secondary)',
          filter: isActive ? 'drop-shadow(0 0 6px rgba(249,115,22,0.3))' : 'none'
        }}
      />

      {/* Metin Etiketi */}
      <AnimatePresence>
        {isSidebarOpen && label && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="text-[12.5px] font-bold transition-colors duration-300 truncate"
            style={{
              color: isActive ? 'var(--color-text-bright)' : 'var(--color-text-secondary)',
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Sayaç */}
      <AnimatePresence>
        {isSidebarOpen && count !== undefined && count > 0 && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary border border-border-subtle group-hover:text-text-bright transition-colors duration-300"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>

      {badge && (
        <div className="absolute top-2 right-2">
          {badge}
        </div>
      )}
    </button>
  );
}
