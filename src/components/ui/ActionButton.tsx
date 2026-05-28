import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

interface ActionButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  loading?: boolean;
  children?: React.ReactNode;
}

export function ActionButton({
  variant = 'primary',
  icon: Icon,
  loading = false,
  children,
  className = '',
  ...props
}: ActionButtonProps) {
  // Varyant sınıfları
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-orange-500/20';
      case 'secondary':
        return 'bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-text-bright border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.08)]';
      case 'danger':
        return 'bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-900/30 hover:border-rose-500/50';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 cursor-pointer outline-none ${getVariantStyles()} ${
        loading ? 'opacity-70 pointer-events-none' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon size={15} />
      ) : null}
      
      {children}
    </motion.button>
  );
}
