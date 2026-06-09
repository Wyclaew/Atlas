import { motion } from 'framer-motion';
import { playSfx } from '../../lib/sfx';

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        playSfx('toggle');
        onChange(!checked);
      }}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? 'bg-[var(--color-accent)]' : 'bg-white/15'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 34 }}
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  );
}
