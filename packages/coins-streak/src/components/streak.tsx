import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import type { UserStreakDTO } from '../shared';
import { FlameArt, CheckArt, type FlameState } from '../art/art';
import { useAnimation } from '../animation/useAnimation';
import { OverrideAsset } from '../animation/OverrideAsset';
import { useFeedback } from '../feedback/useFeedback';
import { AnimatedNumber } from '../primitives/AnimatedNumber';
import { Card, Skeleton, StateFrame, TactileButton } from '../primitives/basics';
import { LiveAnnouncer, Overlay, useSkip } from '../primitives/overlay';
import { ParticleCanvas, useParticles } from '../primitives/ParticleCanvas';
import { motionTokens } from '../animation/registry';

/** Streak tiers from the brief: the flame grows at 1, 7, 30, 100 and 365. */
export function flameTier(streak: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (streak >= 365) return 5;
  if (streak >= 100) return 4;
  if (streak >= 30) return 3;
  if (streak >= 7) return 2;
  if (streak >= 1) return 1;
  return 0;
}

export interface StreakFlameProps {
  streak: number;
  state?: FlameState;
  /** Base size in px for tier 1; higher tiers scale up. */
  size?: number;
  /** Show glow halo (on by default from tier 2). */
  glow?: boolean;
}

/** Animated flame that grows with the streak tier and visualises active / at risk / frozen / lost / repaired. */
export function StreakFlame({ streak, state = 'active', size = 48, glow }: StreakFlameProps) {
  const anim = useAnimation(state === 'lost' ? 'streak.lost' : state === 'frozen' ? 'streak.freeze' : state === 'repaired' ? 'streak.repair' : 'streak.flame');
  const tier = flameTier(streak);
  const scale = [0.85, 1, 1.12, 1.25, 1.38, 1.5][tier];
  const showGlow = (glow ?? tier >= 2) && (state === 'active' || state === 'repaired');
  const flicker = !anim.reduced && (state === 'active' || state === 'repaired' || state === 'at_risk');
  return (
    <span
      role="img"
      aria-label={`${streak} ${streak === 1 ? 'day' : 'days'} streak, ${state.replace('_', ' ')}`}
      style={{ position: 'relative', display: 'inline-flex', width: size * scale, height: size * scale * 1.2, alignItems: 'flex-end', justifyContent: 'center' }}
      data-state={state}
      data-tier={tier}
    >
      {showGlow && (
        <span
          aria-hidden="true"
          className={anim.reduced ? undefined : 'gmf-pulse'}
          style={{
            position: 'absolute',
            inset: '-25%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--game-accent) 55%, transparent) 0%, transparent 65%)',
          }}
        />
      )}
      <motion.span
        style={{ display: 'inline-flex', transformOrigin: '50% 100%', position: 'relative' }}
        animate={
          state === 'lost'
            ? { scaleY: 0.82, rotate: -6, opacity: 0.85 }
            : state === 'repaired'
              ? { scale: [0.6, 1.2, 1], rotate: 0, opacity: 1 }
              : flicker
                ? { scaleY: [1, 1.06, 0.97, 1.03, 1], scaleX: [1, 0.97, 1.02, 0.99, 1], rotate: [0, -1.5, 1, -0.5, 0] }
                : { scale: 1 }
        }
        transition={
          state === 'lost' || state === 'repaired'
            ? { duration: anim.seconds || 0.01, ease: motionTokens.ease.out }
            : { duration: 1.6 * (anim.seconds ? anim.seconds / 1.6 : 1), repeat: flicker ? Infinity : 0, ease: 'easeInOut' }
        }
      >
        <span className={state === 'at_risk' && !anim.reduced ? 'gmf-at-risk' : undefined} style={{ display: 'inline-flex' }}>
          <OverrideAsset id="streak.flame" loop fallback={<FlameArt size={size * scale} state={state} />} width={size * scale} height={size * scale * 1.2} />
        </span>
      </motion.span>
    </span>
  );
}

export interface WeekStripProps {
  /** Last 7 periods, oldest first. */
  days: { label: string; state: 'done' | 'frozen' | 'missed' | 'pending'; today?: boolean }[];
  /** Animate today's check in with a burst. */
  celebrateToday?: boolean;
  delay?: number;
}

/** Seven day strip with today's check badge (reference video D streak screen). */
export function WeekStrip({ days, celebrateToday, delay = 0 }: WeekStripProps) {
  const anim = useAnimation('streak.milestone');
  const { ref, burst } = useParticles();
  const todayRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (!celebrateToday || anim.reduced) return;
    const t = setTimeout(() => {
      const el = todayRef.current;
      const parent = el?.parentElement?.parentElement;
      if (!el || !parent) return;
      const r = el.getBoundingClientRect();
      const p = parent.getBoundingClientRect();
      burst({ x: r.left - p.left + r.width / 2, y: r.top - p.top + r.height / 2, count: 18, kind: ['sparkle', 'confetti'], speed: 4, life: 45 });
    }, delay + 250);
    return () => clearTimeout(t);
  }, [celebrateToday, delay, anim.reduced, burst]);
  return (
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: 6 }}>
      <ParticleCanvas ref={ref} scale={anim.particleScale} />
      {days.map((d, i) => {
        const done = d.state === 'done';
        const frozen = d.state === 'frozen';
        const bg = done ? 'var(--game-primary)' : frozen ? '#C9D6DD' : 'color-mix(in srgb, var(--game-border) 90%, var(--game-background))';
        return (
          <div key={i} style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: d.today ? 'var(--game-primary)' : 'var(--game-muted)' }}>{d.label}</span>
            <motion.span
              ref={d.today ? todayRef : undefined}
              initial={d.today && celebrateToday && !anim.reduced ? { scale: 0.4 } : false}
              animate={{ scale: 1 }}
              transition={{ ...motionTokens.spring.pop, delay: (delay + 200) / 1000 }}
              style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', background: bg }}
              aria-label={`${d.label}: ${d.state}`}
            >
              {(done || frozen) && <CheckArt size={16} color={frozen ? '#5E7380' : '#fff'} />}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}

export interface StreakWidgetProps {
  streak?: UserStreakDTO | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Optional click handler, e.g. to open the streak celebration or history. */
  onClick?: () => void;
  compact?: boolean;
}

const weekdayLabel = (period: string) => {
  const d = new Date(`${period}T00:00:00`);
  return Number.isNaN(d.getTime()) ? period.slice(-2) : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()];
};

function flameStateFor(s: UserStreakDTO): FlameState {
  if (s.status === 'BROKEN') return 'lost';
  if (s.status === 'AT_RISK') return 'at_risk';
  if (s.status === 'NONE') return 'unlit';
  return 'active';
}

/** Compact streak card: flame, counter, freezes and the last 7 periods. */
export function StreakWidget({ streak, loading, error, onRetry, onClick, compact }: StreakWidgetProps) {
  return (
    <Card>
      <StateFrame
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={!streak}
        emptyText="Complete an activity to start your streak"
        skeleton={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Skeleton width={48} height={56} radius={24} />
            <div style={{ flex: 1, display: 'grid', gap: 8 }}>
              <Skeleton height={22} width="40%" />
              <Skeleton height={28} />
            </div>
          </div>
        }
      >
        {streak && (
          <div
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
            style={{ display: 'grid', gap: 12, cursor: onClick ? 'pointer' : undefined }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StreakFlame streak={streak.current} state={flameStateFor(streak)} size={compact ? 32 : 44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: compact ? 22 : 30, fontWeight: 800, lineHeight: 1, color: streak.current > 0 ? 'var(--game-primary)' : 'var(--game-muted)' }}>
                  <AnimatedNumber value={streak.current} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--game-muted)', fontWeight: 600 }}>
                  {streak.frequency === 'DAILY' ? 'day' : streak.frequency === 'WEEKLY' ? 'week' : 'month'} streak · best {streak.longest}
                </div>
              </div>
              {streak.freezesAvailable > 0 && (
                <span title="Streak freezes" style={{ fontSize: 12, fontWeight: 700, padding: '4px 8px', borderRadius: 999, background: 'color-mix(in srgb, #C9D6DD 50%, var(--game-background))', color: '#4F6470' }}>
                  ❄ {streak.freezesAvailable}
                </span>
              )}
            </div>
            {!compact && streak.recent.length > 0 && (
              <WeekStrip
                days={streak.recent.map((r) => ({
                  label: streak.frequency === 'DAILY' ? weekdayLabel(r.period) : r.period.slice(-3),
                  state: r.state,
                  today: r.period === streak.currentPeriod,
                }))}
              />
            )}
            {streak.status === 'AT_RISK' && (
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--game-warning)' }}>Your streak ends at midnight. Do one activity to keep it!</div>
            )}
            {streak.nextMilestone && !compact && (
              <div style={{ fontSize: 12, color: 'var(--game-muted)' }}>
                {streak.nextMilestone - streak.current} more to your {streak.nextMilestone} {streak.frequency === 'DAILY' ? 'day' : 'period'} milestone
              </div>
            )}
          </div>
        )}
      </StateFrame>
    </Card>
  );
}

export interface StreakCelebrationProps {
  open: boolean;
  /** New streak value to reveal. */
  streak: number;
  /** Week strip data (oldest first); today's entry gets the check burst. */
  days?: WeekStripProps['days'];
  /** Message typed into the speech bubble, e.g. "A streak is born!". */
  message?: string;
  /** Require a swipe/tap to ignite (reference video D) instead of auto-igniting. */
  requireIgnite?: boolean;
  ctaLabel?: string;
  onClose: () => void;
  contained?: boolean;
  milestone?: boolean;
}

/**
 * Full screen streak ceremony: unlit ember on dark backdrop, swipe up (or tap / Enter) to ignite, the
 * flame shoots up as a comet, lands, the number pops, the label rises, the bubble types and the week
 * strip checks today. Escape skips straight to the final frame.
 */
export function StreakCelebration({
  open,
  streak,
  days,
  message,
  requireIgnite = true,
  ctaLabel = 'See you tomorrow',
  onClose,
  contained,
  milestone,
}: StreakCelebrationProps) {
  const anim = useAnimation(milestone ? 'streak.milestone' : 'streak.ignite');
  const fb = useFeedback();
  const { skipped, skip } = useSkip(open);
  const [phase, setPhase] = useState<'ember' | 'comet' | 'reveal'>('ember');
  const { ref, burst } = useParticles();
  const y = useMotionValue(0);
  const emberGlow = useTransform(y, [-160, 0], [1.6, 1]);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    // Both modes show the ember first; auto mode lights it by itself so the ignite moment is never lost.
    if (open) setPhase(anim.reduced ? 'reveal' : 'ember');
  }, [open, anim.reduced]);

  useEffect(() => {
    if (skipped) setPhase('reveal');
  }, [skipped]);

  const ignite = () => {
    if (phase !== 'ember') return;
    fb.sound('ignite');
    fb.haptic('celebrate');
    setPhase('comet');
    setTimeout(() => setPhase('reveal'), anim.reduced ? 0 : 420 * (anim.duration / 2400 || 1));
  };

  useEffect(() => {
    if (phase !== 'reveal' || !open) return;
    if (!anim.reduced && !skipped) burst({ x: 0.5, y: 0.3, relative: true, count: milestone ? 120 : 60, kind: ['confetti', 'sparkle'], speed: 9 });
    const full = message ?? (streak === 1 ? 'A streak is born! Practice every day to build a habit.' : `${streak} days strong. Keep the fire going!`);
    if (anim.reduced || skipped) {
      setTyped(full);
      return;
    }
    const words = full.split(' ');
    let i = 0;
    setTyped('');
    const timer = setInterval(() => {
      i++;
      setTyped(words.slice(0, i).join(' '));
      if (i >= words.length) clearInterval(timer);
    }, 60);
    return () => clearInterval(timer);
  }, [phase, open, message, streak, anim.reduced, skipped, milestone, burst]);

  useEffect(() => {
    if (!open || requireIgnite || phase !== 'ember') return;
    const t = setTimeout(ignite, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, requireIgnite, phase]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -60 || info.velocity.y < -400) ignite();
  };

  const dark = phase !== 'reveal';
  return (
    <Overlay open={open} onClose={onClose} label="Streak celebration" variant="fullscreen" contained={contained} background={dark ? '#1F2124' : 'var(--game-background)'}>
      <LiveAnnouncer message={phase === 'reveal' ? `${streak} day streak` : null} />
      <ParticleCanvas ref={ref} scale={anim.particleScale} />
      <div
        onClick={() => (phase === 'ember' ? ignite() : skip())}
        style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 24, transition: 'background 300ms', background: dark ? '#1F2124' : 'var(--game-background)' }}
      >
        <AnimatePresence mode="wait">
          {phase === 'ember' && (
            <motion.div key="ember" exit={{ opacity: 0 }} style={{ display: 'grid', justifyItems: 'center', gap: 24 }}>
              <motion.div
                drag={requireIgnite ? 'y' : false}
                dragConstraints={{ top: -200, bottom: 0 }}
                dragElastic={0.3}
                style={{ y, scale: emberGlow, cursor: 'grab', touchAction: 'none' }}
                onDragEnd={onDragEnd}
                tabIndex={0}
                role="button"
                aria-label="Ignite your streak"
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') && ignite()}
              >
                <div style={{ position: 'relative' }}>
                  <span className="gmf-pulse" style={{ position: 'absolute', inset: '-40%', borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--game-accent) 45%, transparent), transparent 60%)' }} />
                  <FlameArt size={96} state="unlit" style={{ filter: 'brightness(0.35)' }} />
                  <span style={{ position: 'absolute', left: '50%', top: '62%', width: 26, height: 26, marginLeft: -13, borderRadius: '50%', background: 'var(--game-accent)', boxShadow: '0 0 30px 10px color-mix(in srgb, var(--game-accent) 70%, transparent)' }} />
                </div>
              </motion.div>
              {requireIgnite ? (
                <motion.p animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: 0, textAlign: 'center' }}>
                  Swipe up to ignite your streak!
                </motion.p>
              ) : (
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: 0, textAlign: 'center', opacity: 0.85 }}>Lighting your streak...</p>
              )}
            </motion.div>
          )}
          {phase === 'comet' && (
            <motion.div
              key="comet"
              initial={{ y: 0, scaleY: 1, opacity: 1 }}
              animate={{ y: -320, scaleY: 3, opacity: 0.9 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: motionTokens.ease.inOut }}
              style={{ width: 28, height: 70, borderRadius: 40, background: 'linear-gradient(to top, transparent, var(--game-accent) 40%, #fff)', boxShadow: '0 0 40px 12px color-mix(in srgb, var(--game-accent) 70%, transparent)' }}
            />
          )}
          {phase === 'reveal' && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', justifyItems: 'center', gap: 14, width: '100%', maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: typed ? 1 : 0, y: 0 }} style={{ background: 'var(--game-card)', border: '2px solid var(--game-border)', borderRadius: 16, padding: '10px 14px', fontSize: 15, minHeight: 44, maxWidth: 300, position: 'relative' }}>
                {typed}
              </motion.div>
              <motion.div initial={anim.reduced || skipped ? false : { y: -260, scale: 0.6 }} animate={{ y: 0, scale: 1 }} transition={motionTokens.spring.pop}>
                <OverrideAsset id={milestone ? 'streak.milestone' : 'streak.ignite'} fallback={<StreakFlame streak={streak} size={88} glow />} width={120} height={140} />
              </motion.div>
              <motion.div initial={anim.reduced || skipped ? false : { scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...motionTokens.spring.pop, delay: anim.reduced || skipped ? 0 : 0.25 }} style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, color: 'var(--game-primary)' }}>
                <AnimatedNumber value={streak} from={Math.max(0, streak - 1)} skip={skipped} delay={300} duration={600} />
              </motion.div>
              <motion.div initial={anim.reduced || skipped ? false : { y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: anim.reduced || skipped ? 0 : 0.45 }} style={{ fontSize: 24, fontWeight: 800, color: 'var(--game-primary)' }}>
                {streak === 1 ? 'day streak' : 'day streak!'}
              </motion.div>
              {days && days.length > 0 && (
                <div style={{ width: '100%', marginTop: 8 }}>
                  <WeekStrip days={days} celebrateToday={!skipped} delay={anim.reduced ? 0 : 700} />
                </div>
              )}
              <motion.div initial={anim.reduced || skipped ? false : { y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: anim.reduced || skipped ? 0 : 1.2 }} style={{ width: '100%', marginTop: 12 }}>
                <TactileButton block onClick={onClose}>
                  {ctaLabel}
                </TactileButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Overlay>
  );
}

export interface StreakProgressSheetProps {
  open: boolean;
  onClose: () => void;
  /** Points just earned, shown in the floating badge, e.g. 70. */
  earned: number;
  title?: string;
  subtitle?: string;
  /** Steps completed out of `steps` (default 7). */
  completed: number;
  steps?: number;
  /** Bonus labels under specific step numbers (1 based), e.g. { 1: "+20 Bonus", 4: "+50 Bonus" }. */
  bonuses?: Record<number, string>;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  contained?: boolean;
}

/** Bottom sheet with floating +N badge and chevron step track (reference video B). */
export function StreakProgressSheet({
  open,
  onClose,
  earned,
  title = 'You have earned points',
  subtitle = 'Come back every day to earn bonus points',
  completed,
  steps = 7,
  bonuses = {},
  primaryLabel = 'Check points',
  onPrimary,
  secondaryLabel,
  onSecondary,
  contained,
}: StreakProgressSheetProps) {
  const anim = useAnimation('streak.progressSheet');
  const fb = useFeedback();
  useEffect(() => {
    if (open) {
      fb.sound('success');
      fb.haptic('success');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <Overlay open={open} onClose={onClose} label={title} variant="sheet" contained={contained}>
      <LiveAnnouncer message={open ? `You earned ${earned} points` : null} />
      <div style={{ padding: '44px 18px 22px', position: 'relative', overflow: 'visible' }}>
        <motion.div
          initial={anim.reduced ? false : { y: 20, scale: 0.6, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ ...motionTokens.spring.pop, delay: anim.reduced ? 0 : 0.2 }}
          style={{ position: 'absolute', top: -26, left: '50%', translateX: '-50%', background: 'var(--game-background)', borderRadius: 999, padding: '8px 16px', boxShadow: '0 6px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 24, fontWeight: 900 }}
        >
          <span style={{ color: 'var(--game-accent)' }}>★</span>
          +<AnimatedNumber value={earned} from={0} delay={350} duration={700} />
        </motion.div>
        <button aria-label="Close" onClick={onClose} style={{ position: 'absolute', right: 14, top: 12, background: 'none', border: 0, fontSize: 20, cursor: 'pointer', color: 'var(--game-text)' }}>
          ✕
        </button>
        <h3 style={{ margin: 0, textAlign: 'center', fontSize: 18 }}>{title}</h3>
        <p style={{ margin: '6px 0 18px', textAlign: 'center', fontSize: 13, color: 'var(--game-muted)' }}>{subtitle}</p>
        <ChevronTrack completed={completed} steps={steps} bonuses={bonuses} />
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          {secondaryLabel && (
            <TactileButton variant="light" block onClick={onSecondary ?? onClose} style={{ textTransform: 'none' }}>
              {secondaryLabel}
            </TactileButton>
          )}
          <TactileButton block onClick={onPrimary ?? onClose}>
            {primaryLabel}
          </TactileButton>
        </div>
      </div>
    </Overlay>
  );
}

/** Seven chevron segments; completed ones fill green in sequence and get a check. */
export function ChevronTrack({ completed, steps = 7, bonuses = {} }: { completed: number; steps?: number; bonuses?: Record<number, string> }) {
  const anim = useAnimation('streak.progressSheet');
  const seg: CSSProperties = { clipPath: 'polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%, 18% 50%)', height: 30, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps}, 1fr)`, gap: 2 }}>
        {Array.from({ length: steps }, (_, i) => {
          const done = i < completed;
          const isNew = i === completed - 1;
          return (
            <motion.div
              key={i}
              initial={isNew && !anim.reduced ? { scale: 0.6, opacity: 0.4 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: isNew ? 0.5 : 0, ...motionTokens.spring.pop }}
              style={{ ...seg, background: done ? 'var(--game-success)' : 'color-mix(in srgb, var(--game-border) 90%, var(--game-background))', color: done ? '#fff' : 'var(--game-muted)' }}
              aria-label={`Step ${i + 1} ${done ? 'complete' : 'pending'}`}
            >
              {done ? <CheckArt size={16} /> : i + 1}
            </motion.div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps}, 1fr)`, gap: 2, marginTop: 6 }}>
        {Array.from({ length: steps }, (_, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--game-muted)', fontWeight: 600 }}>
            {bonuses[i + 1] ? (
              <>
                <div style={{ color: 'var(--game-primary)' }}>🎁</div>
                {bonuses[i + 1]}
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
