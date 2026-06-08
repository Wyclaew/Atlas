import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

interface ActionButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'accent';
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function ActionButton({
  variant = 'primary',
  icon: Icon,
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}: ActionButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-white text-black font-semibold hover:bg-neutral-100 active:scale-95 border border-transparent shadow-sm hover:shadow-md';
      case 'secondary':
        return 'bg-white/[0.05] text-white font-medium border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] active:scale-95';
      case 'accent':
        return 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold hover:from-indigo-600 hover:to-violet-700 active:scale-95 border border-indigo-400/30 shadow-md hover:shadow-lg';
      case 'danger':
        return 'bg-white/[0.04] hover:bg-red-500/10 text-red-400 font-medium border border-white/[0.05] hover:border-red-500/30 active:scale-95';
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ease-out cursor-pointer outline-none ${getVariantStyles()} ${
        (loading || disabled) ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon size={16} />
      ) : null}

      <span>{children}</span>
    </motion.button>
  );
}
