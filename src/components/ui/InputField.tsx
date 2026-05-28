// components/ui/InputField.tsx — Cyber-Minimalist Obsidian Veri Giriş Alanı

import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label?: string;
  error?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ icon: Icon, label, error, className = '', style, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label className="text-[11px] font-bold tracking-wider text-text-muted uppercase px-1">
            {label}
          </label>
        )}

        <div className="relative group rounded-xl bg-[rgba(9,10,15,0.65)] border border-[rgba(255,255,255,0.05)] focus-within:border-orange-500/30 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] focus-within:shadow-[0_0_15px_rgba(249,115,22,0.1),inset_0_2px_4px_rgba(0,0,0,0.8)] overflow-hidden">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-orange-500 transition-colors duration-300 z-10 pointer-events-none">
              <Icon size={16} />
            </div>
          )}

          <input
            ref={ref}
            className={`w-full bg-transparent py-3.5 text-text-bright text-[13px] placeholder-[rgba(255,255,255,0.25)] outline-none transition-all duration-300 ${className}`}
            style={{ 
              paddingLeft: Icon ? '44px' : '16px', 
              paddingRight: '16px',
              ...style 
            }}
            {...props}
          />
        </div>

        {error && (
          <p className="text-[11px] font-semibold text-rose-500 px-1 mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
