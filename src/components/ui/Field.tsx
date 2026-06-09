import { forwardRef, type ComponentType, type InputHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ComponentType<{ size?: number }>;
  hint?: string;
  error?: string;
}

/** Labeled input with optional leading icon. Generous left padding so the icon
 *  never collides with the text/placeholder. */
export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, icon: Icon, hint, error, className = '', ...props }, ref) => (
    <label className="block">
      {label && <span className="mb-2 block text-[12.5px] font-medium text-dim">{label}</span>}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          {...props}
          className={`h-12 w-full rounded-xl border bg-surface-2 text-sm text-text placeholder:text-faint
            transition-colors duration-200 focus:outline-none focus:border-line-strong
            ${error ? 'border-rose-500/50' : 'border-line'} ${Icon ? 'pl-11' : 'pl-4'} pr-4 ${className}`}
        />
      </div>
      {hint && !error && <span className="mt-1.5 block text-[11.5px] leading-relaxed text-faint">{hint}</span>}
      {error && <span className="mt-1.5 block text-[11.5px] text-rose-400">{error}</span>}
    </label>
  )
);

Field.displayName = 'Field';
