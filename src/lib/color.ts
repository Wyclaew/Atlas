// Extract a vibrant dominant color from a game's cover so the UI can borrow
// the artwork's identity (hero glow, card focus, detail accent). Pure client
// side via a tiny canvas; degrades to null if the image taints the canvas.

const cache = new Map<string, string | null>();

const DEFAULT = '#c8ff4d';

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

/** Lift very dark picks so they read as an accent on a near-black canvas. */
function brighten(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  if (max === 0) return [r, g, b];
  const target = 200; // desired peak channel
  if (max >= target) return [r, g, b];
  const k = target / max;
  return [r * k, g * k, b * k];
}

export async function extractAccent(url: string): Promise<string | null> {
  if (cache.has(url)) return cache.get(url)!;

  const result = await new Promise<string | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';

    img.onload = () => {
      try {
        const w = 50;
        const h = Math.max(1, Math.round((50 * img.naturalHeight) / Math.max(1, img.naturalWidth)));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);

        type Bucket = { r: number; g: number; b: number; n: number; sat: number };
        const buckets = new Map<string, Bucket>();

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 200) continue;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const lum = (max + min) / 2 / 255;
          if (lum < 0.12 || lum > 0.93) continue; // skip near-black / near-white
          const sat = max === 0 ? 0 : (max - min) / max;
          const key = `${r >> 4},${g >> 4},${b >> 4}`;
          const e = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, sat: 0 };
          e.r += r; e.g += g; e.b += b; e.n += 1; e.sat += sat;
          buckets.set(key, e);
        }

        let best: Bucket | null = null;
        let bestScore = -1;
        for (const e of buckets.values()) {
          const avgSat = e.sat / e.n;
          const score = avgSat * Math.log(e.n + 1); // vibrant AND common
          if (score > bestScore) { bestScore = score; best = e; }
        }
        if (!best) return resolve(null);

        let [r, g, b] = brighten(best.r / best.n, best.g / best.n, best.b / best.n);
        resolve(rgbToHex(Math.round(r), Math.round(g), Math.round(b)));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

  cache.set(url, result);
  return result;
}

export { DEFAULT as DEFAULT_ACCENT };
