// components/common/LoadingSpinner.tsx — Yükleme Animasyonu
// Senkronizasyon ve veri yükleme sırasında gösterilir

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
  const sizeMap = { sm: 20, md: 32, lg: 48 };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2
        size={sizeMap[size]}
        className="animate-spin"
        style={{ color: 'var(--color-accent-indigo)' }}
      />
      {message && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {message}
        </p>
      )}
    </div>
  );
}
