// Procedural UI sound effects via the Web Audio API.
// No bundled assets — every sound is a tiny synthesized blip, so it's light on
// CPU and disk. Subtle by design; gated by user prefs (enabled + volume).

type OscType = 'sine' | 'triangle' | 'square' | 'sawtooth';

interface Tone {
  freq: number;
  type?: OscType;
  dur: number;
  gain?: number;
  slideTo?: number;
  delay?: number;
}

let ctx: AudioContext | null = null;
let enabled = true;
let volume = 0.4; // 0..1 master

const LS_ENABLED = 'atlas.sound.enabled';
const LS_VOLUME = 'atlas.sound.volume';

// Hydrate from localStorage immediately (before the store loads).
try {
  const e = localStorage.getItem(LS_ENABLED);
  const v = localStorage.getItem(LS_VOLUME);
  if (e !== null) enabled = e === '1';
  if (v !== null) volume = Math.max(0, Math.min(1, parseFloat(v)));
} catch {
  /* ignore */
}

export function getSoundPrefs(): { enabled: boolean; volume: number } {
  return { enabled, volume };
}

export function setSoundEnabled(v: boolean): void {
  enabled = v;
  try {
    localStorage.setItem(LS_ENABLED, v ? '1' : '0');
  } catch {
    /* ignore */
  }
  if (v) void playSfx('toggle');
}

export function setSoundVolume(v: number): void {
  volume = Math.max(0, Math.min(1, v));
  try {
    localStorage.setItem(LS_VOLUME, String(volume));
  } catch {
    /* ignore */
  }
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function play(tones: Tone[]): void {
  if (!enabled || volume <= 0) return;
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime;

  for (const tone of tones) {
    const start = t0 + (tone.delay ?? 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.setValueAtTime(tone.freq, start);
    if (tone.slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, tone.slideTo), start + tone.dur);
    }
    const peak = Math.max(0.0001, (tone.gain ?? 0.18) * volume);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + tone.dur);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(start);
    osc.stop(start + tone.dur + 0.03);
  }
}

const PRESETS = {
  hover: (): void => play([{ freq: 2100, type: 'sine', dur: 0.025, gain: 0.03 }]),
  tap: (): void =>
    play([
      { freq: 520, type: 'triangle', dur: 0.06, gain: 0.11 },
      { freq: 900, type: 'sine', dur: 0.05, gain: 0.05, delay: 0.004 },
    ]),
  nav: (): void => play([{ freq: 440, type: 'sine', dur: 0.09, gain: 0.09, slideTo: 680 }]),
  toggle: (): void => play([{ freq: 760, type: 'square', dur: 0.045, gain: 0.05 }]),
  success: (): void =>
    play([
      { freq: 660, type: 'sine', dur: 0.1, gain: 0.1 },
      { freq: 990, type: 'sine', dur: 0.16, gain: 0.1, delay: 0.085 },
    ]),
  error: (): void => play([{ freq: 200, type: 'sawtooth', dur: 0.2, gain: 0.1, slideTo: 110 }]),
  launch: (): void => play([{ freq: 300, type: 'sawtooth', dur: 0.5, gain: 0.09, slideTo: 1300 }]),
};

export type SfxName = keyof typeof PRESETS;

export function playSfx(name: SfxName): void {
  try {
    PRESETS[name]?.();
  } catch {
    /* never let audio break the UI */
  }
}
