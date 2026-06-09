interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  'aria-label'?: string;
}

export function Slider({ value, onChange, min = 0, max = 1, step = 0.05, className = '', ...rest }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`h-1.5 cursor-pointer appearance-none rounded-full bg-white/15 outline-none ${className}`}
      style={{ accentColor: 'var(--color-accent)' }}
      {...rest}
    />
  );
}
