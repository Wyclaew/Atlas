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
}

export function SidebarButton({
  isActive,
  onClick,
  icon: Icon,
  label,
  count
}: SidebarButtonProps) {
  const { isSidebarOpen } = useGameStore();

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg select-none cursor-pointer group transition-all duration-200 overflow-hidden relative ${
        isActive 
          ? 'bg-gradient-to-r from-accent-ember-start/5 to-transparent' 
          : 'bg-transparent hover:bg-bg-hover active:bg-bg-hover/80'
      }`}
    >
      {/* Sol kenarda yer alan 3px dikey keskin indikatör */}
      {isActive && (
        <motion.div
          layoutId="sidebarActiveBar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-gradient-to-b from-orange-500 to-rose-600"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      {/* İkon & Metin Container */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <Icon
          size={20}
          className={`flex-shrink-0 transition-colors duration-200 ${
            isActive ? 'text-text-bright' : 'text-text-secondary group-hover:text-text-bright'
          }`}
        />

        {/* Metin Etiketi */}
        <AnimatePresence>
          {isSidebarOpen && label && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className={`text-sm transition-colors duration-200 whitespace-nowrap overflow-hidden ${
                isActive ? 'text-text-bright font-semibold' : 'text-text-secondary font-medium group-hover:text-text-bright'
              }`}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Dinamik Oyun Sayaç Pill */}
      <AnimatePresence>
        {isSidebarOpen && count !== undefined && count > 0 && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-xs font-mono px-2 py-0.5 rounded-md transition-colors duration-200 flex-shrink-0 ${
               isActive 
                ? 'bg-bg-elevated text-text-muted' 
                : 'bg-bg-hover text-text-secondary group-hover:bg-bg-elevated group-hover:text-text-muted'
            }`}
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
