import { useCallback } from 'react';
import { useGamifyTheme } from '../theme/ThemeProvider';
import type { SoundId } from '../animation/registry';

export type HapticPattern = 'tick' | 'success' | 'error' | 'celebrate' | number | number[];

const patterns: Record<string, number | number[]> = {
  tick: 12,
  success: [30, 60, 30],
  error: [40, 30, 40],
  celebrate: [30, 60, 30, 60, 80],
};

let gestureSeen = false;
let ctx: AudioContext | null = null;

function trackGesture() {
  if (typeof window === 'undefined' || gestureSeen) return;
  const mark = () => {
    gestureSeen = true;
    window.removeEventListener('pointerdown', mark, true);
    window.removeEventListener('keydown', mark, true);
  };
  window.addEventListener('pointerdown', mark, true);
  window.addEventListener('keydown', mark, true);
}
trackGesture();

function hasUserGesture(): boolean {
  if (gestureSeen) return true;
  const ua = (typeof navigator !== 'undefined' ? (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation : undefined);
  return Boolean(ua?.hasBeenActive);
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(ac: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, gain = 0.12, endFreq?: number) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, ac.currentTime + start + dur);
  g.gain.setValueAtTime(0.0001, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.02);
}

function noiseWhoosh(ac: AudioContext) {
  const len = Math.floor(ac.sampleRate * 0.35);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, ac.currentTime);
  filter.frequency.exponentialRampToValueAtTime(2400, ac.currentTime + 0.3);
  const g = ac.createGain();
  g.gain.value = 0.15;
  src.connect(filter).connect(g).connect(ac.destination);
  src.start();
}

/** Synthesised sound effects so the kit ships with zero audio files. */
export function playSynth(id: SoundId): void {
  const ac = audio();
  if (!ac) return;
  switch (id) {
    case 'coin':
      tone(ac, 988, 0, 0.08, 'square', 0.06);
      tone(ac, 1319, 0.07, 0.25, 'square', 0.06);
      break;
    case 'tick':
      tone(ac, 1600, 0, 0.04, 'triangle', 0.05);
      break;
    case 'success':
      [523, 659, 784].forEach((f, i) => tone(ac, f, i * 0.06, 0.3, 'triangle', 0.08));
      break;
    case 'levelup':
      [523, 659, 784, 1047].forEach((f, i) => tone(ac, f, i * 0.09, 0.35, 'triangle', 0.09));
      break;
    case 'error':
      tone(ac, 220, 0, 0.18, 'sawtooth', 0.05, 160);
      break;
    case 'ignite':
      noiseWhoosh(ac);
      tone(ac, 200, 0.05, 0.5, 'sine', 0.1, 800);
      break;
    case 'whoosh':
    default:
      noiseWhoosh(ac);
  }
}

export interface Feedback {
  haptic: (pattern?: HapticPattern) => void;
  sound: (id: SoundId) => void;
}

/** Haptics and sounds gated by theme settings, reduced motion and browser support. */
export function useFeedback(): Feedback {
  const { animation, reducedMotion } = useGamifyTheme();
  const haptic = useCallback(
    (pattern: HapticPattern = 'tick') => {
      if (!animation.haptics || reducedMotion) return;
      if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
      if (!hasUserGesture()) return;
      const p = typeof pattern === 'string' ? patterns[pattern] : pattern;
      try {
        navigator.vibrate(p as number | number[]);
      } catch {
        /* vibration can throw inside cross-origin iframes; ignore */
      }
    },
    [animation.haptics, reducedMotion],
  );
  const sound = useCallback(
    (id: SoundId) => {
      if (!animation.sound || !hasUserGesture()) return;
      try {
        playSynth(id);
      } catch {
        /* audio unavailable */
      }
    },
    [animation.sound],
  );
  return { haptic, sound };
}
