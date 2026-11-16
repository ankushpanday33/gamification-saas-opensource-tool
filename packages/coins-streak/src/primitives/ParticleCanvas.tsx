import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type CSSProperties } from 'react';
import { useGameReducedMotion } from '../theme/ThemeProvider';

export type ParticleKind = 'confetti' | 'sparkle' | 'ember' | 'coin' | 'star';

export interface BurstOptions {
  /** Origin in px relative to the canvas, or 0..1 fractions when `relative` is true. */
  x: number;
  y: number;
  relative?: boolean;
  count?: number;
  kind?: ParticleKind | ParticleKind[];
  /** Spread angle in degrees around `angle` (default 360). */
  spread?: number;
  /** Direction in degrees, 0 = right, -90 = up. */
  angle?: number;
  speed?: number;
  gravity?: number;
  /** Explicit colours; defaults read from --game-* CSS variables. */
  colors?: string[];
  size?: number;
  life?: number;
}

export interface ParticleCanvasHandle {
  burst: (opts: BurstOptions) => void;
  clear: () => void;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  life: number;
  max: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  kind: ParticleKind;
}

export interface ParticleCanvasProps {
  /** Cover the whole viewport (position fixed) instead of the parent box. */
  fullscreen?: boolean;
  /** Multiplier on particle counts, usually from useAnimation().particleScale. */
  scale?: number;
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
}

/** True when a real 2D canvas is available (false in SSR and jsdom). */
export function canUseCanvas(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return false;
  return typeof HTMLCanvasElement !== 'undefined';
}

const MAX_PARTICLES = 600;

function readColors(el: HTMLElement): string[] {
  const cs = getComputedStyle(el);
  const pick = (v: string, fb: string) => cs.getPropertyValue(v).trim() || fb;
  return [
    pick('--game-primary', '#FF6623'),
    pick('--game-secondary', '#FF9900'),
    pick('--game-accent', '#FFC233'),
    pick('--game-success', '#2DB24A'),
    '#FFFFFF',
  ];
}

function drawStar(c: CanvasRenderingContext2D, r: number, points = 4, inner = 0.38) {
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  c.closePath();
  c.fill();
}

/**
 * Pooled canvas particle system used for confetti, sparkles, embers and coins.
 * It only runs a requestAnimationFrame loop while particles are alive.
 */
export const ParticleCanvas = forwardRef<ParticleCanvasHandle, ParticleCanvasProps>(function ParticleCanvas(
  { fullscreen = false, scale = 1, className, style, zIndex = 50 },
  ref,
) {
  const reduced = useGameReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pool = useRef<Particle[]>([]);
  const raf = useRef<number | null>(null);
  const size = useRef({ w: 0, h: 0, dpr: 1 });

  const resize = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size.current = { w: rect.width, h: rect.height, dpr };
    cv.width = Math.max(1, Math.round(rect.width * dpr));
    cv.height = Math.max(1, Math.round(rect.height * dpr));
  }, []);

  useEffect(() => {
    if (!canUseCanvas()) return;
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro && canvasRef.current) ro.observe(canvasRef.current);
    window.addEventListener('resize', resize);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', resize);
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [resize]);

  const loop = useCallback(() => {
    const cv = canvasRef.current;
    const c = cv?.getContext('2d');
    if (!cv || !c) {
      raf.current = null;
      return;
    }
    const { w, h, dpr } = size.current;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    let alive = 0;
    for (const p of pool.current) {
      if (!p.active) continue;
      p.life += 1;
      if (p.life >= p.max || p.y > h + 40) {
        p.active = false;
        continue;
      }
      alive++;
      p.vy += p.g;
      p.vx *= 0.985;
      p.vy *= p.kind === 'confetti' ? 0.985 : 0.97;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      const t = p.life / p.max;
      const alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      c.save();
      c.globalAlpha = Math.max(0, alpha);
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = p.color;
      switch (p.kind) {
        case 'confetti': {
          const flip = Math.cos(p.rot * 3);
          c.fillRect((-p.size / 2) * flip, -p.size / 4, p.size * flip, p.size / 2);
          break;
        }
        case 'sparkle': {
          const s = p.size * (0.6 + 0.4 * Math.sin(t * Math.PI));
          drawStar(c, s, 4, 0.3);
          break;
        }
        case 'star':
          drawStar(c, p.size, 5, 0.45);
          break;
        case 'ember': {
          const g = c.createRadialGradient(0, 0, 0, 0, 0, p.size);
          g.addColorStop(0, '#FFFFFF');
          g.addColorStop(0.35, p.color);
          g.addColorStop(1, 'rgba(255,255,255,0)');
          c.fillStyle = g;
          c.beginPath();
          c.arc(0, 0, p.size, 0, Math.PI * 2);
          c.fill();
          break;
        }
        case 'coin': {
          const wScale = Math.abs(Math.cos(p.rot * 2)) * 0.8 + 0.2;
          c.beginPath();
          c.ellipse(0, 0, p.size * wScale, p.size, 0, 0, Math.PI * 2);
          c.fill();
          c.globalAlpha *= 0.5;
          c.fillStyle = '#FFFFFF';
          c.beginPath();
          c.ellipse(-p.size * 0.25 * wScale, -p.size * 0.3, p.size * 0.25 * wScale, p.size * 0.3, 0, 0, Math.PI * 2);
          c.fill();
          break;
        }
      }
      c.restore();
    }
    raf.current = alive > 0 ? requestAnimationFrame(loop) : null;
    if (alive === 0) c.clearRect(0, 0, w, h);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      burst(o: BurstOptions) {
        if (reduced || scale <= 0 || !canUseCanvas()) return;
        const cv = canvasRef.current;
        if (!cv) return;
        if (size.current.w === 0) resize();
        const { w, h } = size.current;
        const x = o.relative ? o.x * w : o.x;
        const y = o.relative ? o.y * h : o.y;
        const count = Math.round((o.count ?? 40) * scale);
        const kinds = Array.isArray(o.kind) ? o.kind : [o.kind ?? 'confetti'];
        const colors = o.colors ?? readColors(cv);
        const spread = ((o.spread ?? 360) * Math.PI) / 180;
        const dir = ((o.angle ?? -90) * Math.PI) / 180;
        for (let i = 0; i < count; i++) {
          let p = pool.current.find((q) => !q.active);
          if (!p) {
            if (pool.current.length >= MAX_PARTICLES) break;
            p = {} as Particle;
            pool.current.push(p);
          }
          const kind = kinds[i % kinds.length];
          const a = dir + (Math.random() - 0.5) * spread;
          const sp = (o.speed ?? 7) * (0.45 + Math.random() * 0.75);
          Object.assign(p, {
            active: true,
            x,
            y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            g: o.gravity ?? (kind === 'ember' ? -0.04 : kind === 'sparkle' ? 0.02 : 0.18),
            life: 0,
            max: (o.life ?? 70) * (0.7 + Math.random() * 0.6),
            size: (o.size ?? (kind === 'confetti' ? 10 : kind === 'coin' ? 7 : 6)) * (0.7 + Math.random() * 0.6),
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            kind,
          });
        }
        if (!raf.current) raf.current = requestAnimationFrame(loop);
      },
      clear() {
        pool.current.forEach((p) => (p.active = false));
      },
    }),
    [reduced, scale, loop, resize],
  );

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: fullscreen ? 'fixed' : 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex,
        ...style,
      }}
    />
  );
});

/** Convenience hook: `const { ref, burst } = useParticles(); <ParticleCanvas ref={ref} />`. */
export function useParticles() {
  const ref = useRef<ParticleCanvasHandle | null>(null);
  const burst = useCallback((o: BurstOptions) => ref.current?.burst(o), []);
  return { ref, burst };
}
