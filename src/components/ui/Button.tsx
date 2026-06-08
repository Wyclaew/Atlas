import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ComponentType, ReactNode } from 'react';

type Variant = 'primary' | 'game' | 'soft' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  icon?: ComponentType<{ size?: number; strokeWidth?: number }>;
  iconRight?: ComponentType<{ size?: number; strokeWidth?: number }>;
  loading?: boolean;
  children?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-text text-bg hover:bg-white',
  game: 'bg-[var(--g)] text-black hover:brightness-110 font-semibold',
  soft: 'bg-white/[0.06] text-text border border-line hover:bg-white/[0.10]',
  ghost: 'text-dim hover:text-text hover:bg-white/[0.05]',
  outline: 'border border-line-strong text-text hover:bg-white/[0.05]',
  danger: 'text-rose-300 border border-line hover:bg-rose-500/10 hover:border-rose-500/30',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-xl',
};

const ICON: Record<Size, number> = { sm: 15, md: 17, lg: 18 };

export function Button({
  variant = 'soft',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium tracking-tight select-none cursor-pointer
        transition-[background,color,box-shadow,filter] duration-200 outline-none whitespace-nowrap
        disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="inline-block rounded-full border-2 border-current/30 border-t-current animate-spin"
          style={{ width: ICON[size], height: ICON[size] }}
        />
      ) : (
        Icon && <Icon size={ICON[size]} strokeWidth={2.1} />
      )}
      {children}
      {IconRight && !loading && <IconRight size={ICON[size]} strokeWidth={2.1} />}
    </motion.button>
  );
}
