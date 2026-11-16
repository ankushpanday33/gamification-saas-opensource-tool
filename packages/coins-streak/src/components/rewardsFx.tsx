import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, animate, motion } from 'motion/react';
import { CoinArt, GemArt, StarArt, Sunburst, CheckArt } from '../art/art';
import { useAnimation } from '../animation/useAnimation';
import { OverrideAsset } from '../animation/OverrideAsset';
import { motionTokens } from '../animation/registry';
import { useFeedback } from '../feedback/useFeedback';
import { AnimatedNumber } from '../primitives/AnimatedNumber';
import { TactileButton } from '../primitives/basics';
import { LiveAnnouncer, Overlay, useSkip } from '../primitives/overlay';
import { ParticleCanvas, useParticles } from '../primitives/ParticleCanvas';
import { useGameReducedMotion } from '../theme/ThemeProvider';

export type RewardIcon = 'coin' | 'gem' | 'star' | ReactNode;

function renderIcon(icon: RewardIcon, size: number) {
  if (icon === 'coin') return <CoinArt size={size} />;
  if (icon === 'gem') return <GemArt size={size} />;
  if (icon === 'star') return <StarArt size={size} />;
  return icon;
}

export interface RewardBurstModalProps {
  open: boolean;
  /** Amount earned; counts up from 0. */
  amount: number;
  /** Prefix shown before the amount, e.g. "₹" or "+". */
  prefix?: string;
  suffix?: string;
  title?: string;
  message?: string;
  ctaLabel?: string;
  icon?: RewardIcon;
  onClose: () => void;
  contained?: boolean;
}

/** Hero reward modal: coin pops with overshoot over a rotating sunburst and sparkles (reference video A). */
export function RewardBurstModal({
  open,
  amount,
  prefix = '',
  suffix = '',
  title = 'Reward unlocked!',
  message,
  ctaLabel = 'OK',
  icon = 'coin',
  onClose,
  contained,
}: RewardBurstModalProps) {
  const anim = useAnimation('reward.burst');
  const fb = useFeedback();
  const { ref, burst } = useParticles();
  const { skipped } = useSkip(open);
  useEffect(() => {
    if (!open) return;
    fb.sound('coin');
    fb.haptic('celebrate');
    const t = setTimeout(() => burst({ x: 0.5, y: 0.32, relative: true, count: 50, kind: ['sparkle', 'coin', 'confetti'], speed: 8 }), anim.reduced ? 0 : 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <Overlay open={open} onClose={onClose} label={title} variant="modal" contained={contained} dim={0.6}>
      <ParticleCanvas ref={ref} scale={anim.particleScale} />
      <LiveAnnouncer message={open ? `${title} ${prefix}${amount}${suffix}` : null} />
      <div style={{ padding: '28px 22px 22px', display: 'grid', justifyItems: 'center', gap: 10, textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'relative', width: 180, height: 180, display: 'grid', placeItems: 'center' }}>
          {!anim.reduced && <Sunburst size={220} />}
          <motion.div
            initial={anim.reduced || skipped ? false : { scale: 0.4, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={motionTokens.spring.pop}
          >
            <OverrideAsset id="reward.burst" fallback={<div className={anim.reduced ? undefined : 'gmf-shimmer-y'}>{renderIcon(icon, 120)}</div>} width={140} height={140} />
          </motion.div>
        </div>
        <motion.h3 initial={anim.reduced ? false : { y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: anim.reduced ? 0 : 0.25 }} style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>
          {title}
        </motion.h3>
        <motion.div initial={anim.reduced ? false : { y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: anim.reduced ? 0 : 0.35 }} style={{ fontSize: 20, fontWeight: 800 }}>
          You earned{' '}
          <span style={{ color: 'var(--game-primary)' }}>
            {prefix}
            <AnimatedNumber value={amount} from={0} delay={400} duration={700} skip={skipped} />
            {suffix}
          </span>
        </motion.div>
        {message && <p style={{ margin: 0, color: 'var(--game-muted)', fontSize: 14 }}>{message}</p>}
        <motion.div initial={anim.reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: anim.reduced ? 0 : 0.7 }} style={{ width: '100%', marginTop: 8 }}>
          <TactileButton block onClick={onClose} autoFocus>
            {ctaLabel}
          </TactileButton>
        </motion.div>
      </div>
    </Overlay>
  );
}

export interface CheckInDay {
  day: number;
  amount: number;
  state: 'claimed' | 'today' | 'locked' | 'missed';
}

export interface DailyCheckInProps {
  open: boolean;
  days: CheckInDay[];
  title?: string;
  subtitle?: string;
  /** Currency prefix such as "₹". */
  prefix?: string;
  /** Server call that claims today's reward; never computed on the client. */
  onClaim: () => Promise<{ amount: number; streak: number }>;
  onClose: () => void;
  contained?: boolean;
  /** Fired after the burst modal is dismissed (good moment to fly coins to the wallet). */
  onCelebrated?: (result: { amount: number; streak: number }) => void;
}

function DayTile({ d, prefix, size = 'lg' }: { d: CheckInDay; prefix: string; size?: 'lg' | 'sm' }) {
  const reduced = useGameReducedMotion();
  const today = d.state === 'today';
  const claimed = d.state === 'claimed';
  const sm = size === 'sm';
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
      <span style={{ fontSize: sm ? 10 : 12, fontWeight: 700, color: today || claimed ? 'var(--game-text)' : 'var(--game-muted)' }}>Day {d.day}</span>
      <motion.div
        animate={today && !reduced ? { scale: [1, 1.06, 1] } : undefined}
        transition={today ? { repeat: Infinity, duration: 1.4 } : undefined}
        style={{
          position: 'relative',
          width: sm ? 36 : 52,
          height: sm ? 46 : 58,
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          fontWeight: 800,
          fontSize: sm ? 11 : 15,
          background: claimed ? 'color-mix(in srgb, var(--game-success) 18%, var(--game-background))' : 'color-mix(in srgb, var(--game-border) 70%, var(--game-background))',
          border: today ? '3px solid var(--game-success)' : claimed ? '2px solid var(--game-success)' : '2px solid transparent',
          opacity: d.state === 'missed' ? 0.45 : 1,
        }}
      >
        {claimed ? (
          <span style={{ width: sm ? 18 : 24, height: sm ? 18 : 24, borderRadius: '50%', background: 'var(--game-accent)', display: 'grid', placeItems: 'center' }}>
            <CheckArt size={sm ? 12 : 16} />
          </span>
        ) : (
          <>
            {prefix}
            {d.amount}
          </>
        )}
        {!claimed && (
          <span style={{ position: 'absolute', bottom: -9, filter: d.state === 'locked' ? 'grayscale(1) opacity(0.6)' : undefined }}>
            <CoinArt size={sm ? 14 : 20} />
          </span>
        )}
      </motion.div>
    </div>
  );
}

/** Daily check-in bottom sheet with the 7 day reward ladder and claim CTA (reference video A). */
export function DailyCheckIn({
  open,
  days,
  title = 'Daily check-in',
  subtitle = 'Collect your daily rewards here',
  prefix = '₹',
  onClaim,
  onClose,
  contained,
  onCelebrated,
}: DailyCheckInProps) {
  const anim = useAnimation('checkin.claim');
  const fb = useFeedback();
  const [state, setState] = useState<'idle' | 'claiming' | 'error' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ amount: number; streak: number } | null>(null);
  useEffect(() => {
    if (open) {
      setState('idle');
      setError(null);
      setResult(null);
    }
  }, [open]);
  const today = days.find((d) => d.state === 'today');
  const claim = async () => {
    setState('claiming');
    setError(null);
    try {
      const r = await onClaim();
      fb.haptic('success');
      setResult(r);
      setState('done');
    } catch (e) {
      fb.sound('error');
      fb.haptic('error');
      setError(e instanceof Error ? e.message : 'Could not claim right now');
      setState('error');
    }
  };
  const top = days.slice(0, 4);
  const bottom = days.slice(4);
  return (
    <>
      <Overlay open={open && state !== 'done'} onClose={onClose} label={title} variant="sheet" contained={contained} dismissible={state !== 'claiming'}>
        <div style={{ padding: '22px 18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <CoinArt size={40} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--game-muted)' }}>{subtitle}</div>
            </div>
          </div>
          <motion.div
            animate={state === 'error' && !anim.reduced ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'grid', gap: 18, justifyItems: 'center' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, width: '100%' }}>
              {top.map((d, i) => (
                <motion.div key={d.day} initial={anim.reduced ? false : { y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: anim.reduced ? 0 : 0.15 + i * 0.05 }}>
                  <DayTile d={d} prefix={prefix} />
                </motion.div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, bottom.length)}, 1fr)`, gap: 10, width: '75%' }}>
              {bottom.map((d, i) => (
                <motion.div key={d.day} initial={anim.reduced ? false : { y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: anim.reduced ? 0 : 0.35 + i * 0.05 }}>
                  <DayTile d={d} prefix={prefix} />
                </motion.div>
              ))}
            </div>
          </motion.div>
          {error && (
            <p role="alert" style={{ color: 'var(--game-error)', fontWeight: 700, fontSize: 13, textAlign: 'center', margin: '14px 0 0' }}>
              {error}
            </p>
          )}
          <div style={{ marginTop: 22 }}>
            <TactileButton variant="success" block size="lg" loading={state === 'claiming'} disabled={!today} onClick={claim} style={{ textTransform: 'none' }}>
              {today ? (state === 'error' ? 'Try again' : "Claim today's reward") : 'Come back tomorrow'}
            </TactileButton>
          </div>
        </div>
      </Overlay>
      <RewardBurstModal
        open={open && state === 'done' && !!result}
        amount={result?.amount ?? 0}
        prefix={prefix}
        title={result ? `${result.streak} Day Streak!` : ''}
        message="Collect your daily reward and keep your streak going."
        onClose={() => {
          if (result) onCelebrated?.(result);
          onClose();
        }}
        contained={contained}
      />
    </>
  );
}

export interface CheckInStripProps {
  days: CheckInDay[];
  prefix?: string;
  title?: string;
  /** Next reward preview, e.g. "Get ₹7 more tomorrow". */
  nextLabel?: string;
}

/** Persistent 7 day strip used on a rewards tab, with next reward preview (reference video A). */
export function CheckInStrip({ days, prefix = '₹', title = 'Keep your streak alive!', nextLabel }: CheckInStripProps) {
  return (
    <div style={{ background: 'color-mix(in srgb, var(--game-text) 92%, #000)', color: '#fff', borderRadius: 'var(--game-radius)', padding: 14, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <CoinArt size={28} />
        <strong>{title}</strong>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: 4, color: 'var(--game-text)' }}>
        {days.map((d) => (
          <div key={d.day} style={{ color: '#fff' }}>
            <DayTile d={d} prefix={prefix} size="sm" />
          </div>
        ))}
      </div>
      {nextLabel && <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, padding: 6, borderRadius: 8, background: 'rgba(255,255,255,0.12)' }}>{nextLabel}</div>}
    </div>
  );
}

export interface GameToastProps {
  open: boolean;
  amount: number;
  title?: string;
  subtitle?: string;
  /** Auto hide delay in ms (reference: ~4500). */
  duration?: number;
  onClose: () => void;
  icon?: RewardIcon;
  contained?: boolean;
}

/** Non-blocking top pill for small gains ("Congratulations! +50"). The page stays interactive. */
export function GameToast({ open, amount, title = 'Congratulations!', subtitle = 'You have earned points', duration, onClose, icon = 'star', contained }: GameToastProps) {
  const anim = useAnimation('points.toast');
  const fb = useFeedback();
  const hold = duration ?? anim.definition?.duration ?? 4500;
  useEffect(() => {
    if (!open) return;
    fb.sound('tick');
    const t = setTimeout(onClose, hold);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hold]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={anim.reduced ? { opacity: 0 } : { y: -40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={anim.reduced ? { opacity: 0 } : { y: -40, opacity: 0, transition: { duration: 0.2, ease: motionTokens.ease.out } }}
          transition={anim.reduced ? { duration: 0.15 } : motionTokens.spring.sheet}
          onClick={onClose}
          style={{
            position: contained ? 'absolute' : 'fixed',
            top: 12,
            left: 0,
            right: 0,
            margin: '0 auto',
            width: 'fit-content',
            maxWidth: 'calc(100% - 24px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 18px 10px 12px',
            borderRadius: 999,
            background: '#1C1C1E',
            color: '#fff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            cursor: 'pointer',
          }}
        >
          <motion.span initial={anim.reduced ? false : { rotate: -90, scale: 0.4 }} animate={{ rotate: 0, scale: 1 }} transition={{ ...motionTokens.spring.pop, delay: 0.1 }}>
            {renderIcon(icon, 28)}
          </motion.span>
          <span style={{ display: 'grid', lineHeight: 1.2 }}>
            <strong style={{ fontSize: 14 }}>{title}</strong>
            <span style={{ fontSize: 12, opacity: 0.8 }}>{subtitle}</span>
          </span>
          <strong style={{ fontSize: 26, marginLeft: 8 }}>
            +<AnimatedNumber value={amount} from={0} duration={600} delay={150} />
          </strong>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export interface CurrencyCounterProps {
  value: number;
  icon?: RewardIcon;
  /** Optional label like "Wallet". */
  label?: string;
  prefix?: string;
  /** Show the floating "+N" delta when value increases (default true). */
  showDelta?: boolean;
}

export interface CurrencyCounterHandle {
  /** Element that flying items should land on. */
  target: HTMLElement | null;
  /** Trigger a bump without changing value (e.g. per arriving item). */
  bump: () => void;
}

/** Header balance chip. Tweens on change, bumps on arrival and floats the delta (videos A and D). */
export const CurrencyCounter = forwardRef<CurrencyCounterHandle, CurrencyCounterProps>(function CurrencyCounter(
  { value, icon = 'coin', label, prefix = '', showDelta = true },
  ref,
) {
  const reduced = useGameReducedMotion();
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const boxRef = useRef<HTMLSpanElement | null>(null);
  const prev = useRef(value);
  const [delta, setDelta] = useState<{ n: number; k: number } | null>(null);
  const bump = useCallback(() => {
    if (reduced || !boxRef.current) return;
    animate(boxRef.current, { scale: [1, 1.18, 1] }, { duration: 0.3 });
  }, [reduced]);
  useImperativeHandle(ref, () => ({ target: iconRef.current, bump }), [bump]);
  useEffect(() => {
    const d = value - prev.current;
    prev.current = value;
    if (d > 0 && showDelta) {
      setDelta({ n: d, k: Date.now() });
      bump();
    }
  }, [value, showDelta, bump]);
  return (
    <span ref={boxRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'var(--game-card)', border: '1px solid var(--game-border)', fontWeight: 800 }} aria-label={`${label ?? 'Balance'} ${prefix}${value}`}>
      <span ref={iconRef} style={{ display: 'inline-flex' }}>
        {renderIcon(icon, 20)}
      </span>
      {label && <span style={{ fontSize: 11, color: 'var(--game-muted)', fontWeight: 600 }}>{label}</span>}
      <span>
        {prefix}
        <AnimatedNumber value={value} duration={700} />
      </span>
      <AnimatePresence>
        {delta && (
          <motion.span
            key={delta.k}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -26, opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 1.1, ease: 'easeOut' }}
            onAnimationComplete={() => setDelta(null)}
            style={{ position: 'absolute', right: 6, top: -4, fontSize: 12, fontWeight: 900, color: 'var(--game-success)', pointerEvents: 'none' }}
          >
            +{delta.n}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
});

export interface FlyToCounterProps {
  /** Change this key to launch a new flight. */
  trigger: number | string | null;
  /** Launch point in viewport coordinates. */
  from: { x: number; y: number } | null;
  /** Element to land on (e.g. CurrencyCounter handle target). */
  to: RefObject<HTMLElement | null> | (() => HTMLElement | null);
  count?: number;
  icon?: RewardIcon;
  /** Called as each item lands (use to bump the counter). */
  onArrive?: (index: number) => void;
  onDone?: () => void;
}

interface Flyer {
  id: number;
  path: { x: number[]; y: number[] };
  delay: number;
}

function bezierKeyframes(a: { x: number; y: number }, b: { x: number; y: number }, steps = 14) {
  const c = { x: (a.x + b.x) / 2 + (Math.random() - 0.5) * 140, y: Math.min(a.y, b.y) - 80 - Math.random() * 60 };
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    xs.push(u * u * a.x + 2 * u * t * c.x + t * t * b.x);
    ys.push(u * u * a.y + 2 * u * t * c.y + t * t * b.y);
  }
  return { x: xs, y: ys };
}

/**
 * Earned items fly on curved paths into a counter, staggered 80 ms (reference video D gem flight).
 * Positions are measured at launch, so it works with any layout. Under reduced motion it only fires
 * the callbacks.
 */
export function FlyToCounter({ trigger, from, to, count = 8, icon = 'coin', onArrive, onDone }: FlyToCounterProps) {
  const anim = useAnimation('currency.fly');
  const fb = useFeedback();
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const landed = useRef(0);
  useEffect(() => {
    if (trigger == null || !from) return;
    const el = typeof to === 'function' ? to() : to.current;
    if (!el) return;
    if (anim.reduced) {
      for (let i = 0; i < count; i++) onArrive?.(i);
      onDone?.();
      return;
    }
    const r = el.getBoundingClientRect();
    const target = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    landed.current = 0;
    setFlyers(
      Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        path: bezierKeyframes({ x: from.x + (Math.random() - 0.5) * 40, y: from.y + (Math.random() - 0.5) * 40 }, target),
        delay: i * 0.08,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  if (!flyers.length) return null;
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1200 }}>
      {flyers.map((f, i) => (
        <motion.span
          key={f.id}
          // One transform keyframe track runs on the compositor instead of per-frame x/y/scale updates.
          initial={{ transform: `translate(${f.path.x[0]}px, ${f.path.y[0]}px) scale(0.4)`, opacity: 0 }}
          animate={{
            transform: f.path.x.map((x, k) => {
              const s = k === 0 ? 0.4 : k === 1 ? 1.2 : k === f.path.x.length - 1 ? 0.6 : 1;
              return `translate(${x}px, ${f.path.y[k]}px) scale(${s})`;
            }),
            opacity: [0, 1, ...Array(f.path.x.length - 2).fill(1)],
          }}
          transition={{ duration: (anim.duration || 700) / 1000, delay: f.delay, ease: motionTokens.ease.inOut }}
          onAnimationComplete={() => {
            fb.haptic('tick');
            fb.sound('tick');
            onArrive?.(i);
            landed.current += 1;
            if (landed.current >= flyers.length) {
              setFlyers([]);
              onDone?.();
            }
          }}
          style={{ position: 'absolute', left: -12, top: -12, willChange: 'transform' }}
        >
          {renderIcon(icon, 24)}
        </motion.span>
      ))}
    </div>
  );
}
