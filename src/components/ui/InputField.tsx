import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label?: string;
  error?: string;
  hint?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ icon: Icon, label, error, hint, className = '', style, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-2.5 text-left">
        {label && (
          <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            {label}
          </label>
        )}

        <div className="relative group w-full">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-200 z-10 pointer-events-none">
              <Icon size={16} />
            </div>
          )}

          <input
            ref={ref}
            className={`w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.05] transition-all ${className}`}
            style={{
              paddingLeft: Icon ? '40px' : '16px',
              paddingRight: '16px',
              ...style
            }}
            {...props}
          />
        </div>

        {hint && !error && (
          <p className="text-xs text-slate-500 px-1">
            {hint}
          </p>
        )}

        {error && (
          <p className="text-xs font-semibold text-red-400 px-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
