interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 18, className = '', label }: SpinnerProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="inline-block rounded-full border-2 border-white/15 border-t-[var(--g)] animate-spin"
        style={{ width: size, height: size }}
      />
      {label && <span className="text-sm text-dim">{label}</span>}
    </span>
  );
}
