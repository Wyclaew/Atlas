import { useEffect, useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { extractAccent } from '../../lib/color';

interface CoverImageProps {
  candidates: string[];
  alt: string;
  className?: string;
  /** Called with a hex color extracted from the displayed art. */
  onAccent?: (hex: string) => void;
  rounded?: string;
}

/**
 * Displays the first cover candidate that loads, falling back through the list,
 * then to a tasteful placeholder. Accent extraction uses a separate CORS image
 * (color.ts) so display never breaks if the CDN omits CORS headers.
 */
export function CoverImage({ candidates, alt, className = '', onAccent, rounded = '' }: CoverImageProps) {
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');

  const key = candidates[0] ?? '';
  useEffect(() => {
    setIdx(0);
    setStatus(candidates.length ? 'loading' : 'failed');
  }, [key, candidates.length]);

  const src = candidates[idx];

  if (status === 'failed' || !src) {
    return (
      <div className={`flex items-center justify-center bg-surface-2 dot-grid ${rounded} ${className}`}>
        <Gamepad2 size={26} className="text-faint" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`}>
      {status === 'loading' && <div className={`absolute inset-0 skeleton ${rounded}`} />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => {
          setStatus('loaded');
          if (onAccent) void extractAccent(src).then((c) => c && onAccent(c));
        }}
        onError={() =>
          setIdx((i) => {
            if (i + 1 < candidates.length) return i + 1;
            setStatus('failed');
            return i;
          })
        }
      />
    </div>
  );
}
