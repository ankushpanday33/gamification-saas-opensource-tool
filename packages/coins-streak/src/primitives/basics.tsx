import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useGameReducedMotion, useGamifyTheme } from '../theme/ThemeProvider';
import { useFeedback } from '../feedback/useFeedback';

export type ButtonVariant = 'primary' | 'success' | 'danger' | 'ghost' | 'light';

const variantColor: Record<ButtonVariant, string> = {
  primary: 'var(--game-primary)',
  success: 'var(--game-success)',
  danger: 'var(--game-error)',
  ghost: 'transparent',
  light: '#FFFFFF',
};

export interface TactileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Stretch to container width, like the full-width CONTINUE buttons. */
  block?: boolean;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  /** Fire a short haptic tick on press (default true). */
  haptic?: boolean;
}

/**
 * Button with a 3D bottom edge that compresses on press (reference videos C and D). The edge colour is
 * derived from the variant colour with color-mix so it follows the theme.
 */
export const TactileButton = forwardRef<HTMLButtonElement, TactileButtonProps>(function TactileButton(
  { variant = 'primary', block, size = 'md', loading, haptic = true, disabled, children, style, onClick, className, ...rest },
  ref,
) {
  const { tokens } = useGamifyTheme();
  const fb = useFeedback();
  const bg = variantColor[variant];
  const isGhost = variant === 'ghost';
  const isLight = variant === 'light';
  const pad = size === 'sm' ? '8px 14px' : size === 'lg' ? '16px 24px' : '12px 20px';
  const radius = tokens.buttonStyle === 'pill' ? 999 : `var(--game-radius)`;
  const edge = tokens.buttonStyle === 'tactile' && !isGhost ? 4 : 0;
  const off = disabled || loading;
  return (
    <button
      ref={ref}
      type="button"
      disabled={off}
      aria-busy={loading || undefined}
      className={['gmf-btn', className].filter(Boolean).join(' ')}
      data-variant={variant}
      onClick={(e) => {
        if (haptic) fb.haptic('tick');
        onClick?.(e);
      }}
      style={
        {
          '--gmf-btn-edge': `${edge}px`,
          '--gmf-btn-edge-color': isGhost
            ? 'transparent'
            : isLight
              ? 'var(--game-border)'
              : `color-mix(in srgb, ${bg} 72%, #000)`,
          width: block ? '100%' : undefined,
          padding: pad,
          borderRadius: radius,
          background: off && !isGhost ? 'color-mix(in srgb, var(--game-muted) 30%, var(--game-background))' : bg,
          color: isGhost ? 'var(--game-primary)' : isLight ? 'var(--game-text)' : '#FFFFFF',
          border: isGhost ? '2px solid var(--game-border)' : isLight ? '2px solid var(--game-border)' : 'none',
          fontFamily: 'var(--game-font)',
          fontWeight: 700,
          fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          cursor: off ? 'not-allowed' : 'pointer',
          boxShadow: off ? 'none' : `0 var(--gmf-btn-edge) 0 var(--gmf-btn-edge-color)`,
          transform: 'translateY(0)',
          transition: 'transform 120ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 120ms cubic-bezier(0.23, 1, 0.32, 1), filter 150ms ease',
          opacity: off ? 0.75 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {loading ? <Spinner size={16} /> : children}
    </button>
  );
});

export function Spinner({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className="gmf-spin"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${Math.max(2, size / 8)}px solid color-mix(in srgb, ${color} 25%, transparent)`,
        borderTopColor: color,
        display: 'inline-block',
      }}
    />
  );
}

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
}

/** Shimmering placeholder in the shape of the component it stands in for. */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className="gmf-skeleton"
      style={{
        display: 'block',
        width,
        height,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, color-mix(in srgb, var(--game-border) 70%, transparent) 25%, color-mix(in srgb, var(--game-border) 30%, transparent) 50%, color-mix(in srgb, var(--game-border) 70%, transparent) 75%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  );
}

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  height?: number;
  color?: string;
  track?: string;
  label?: ReactNode;
  /** Accessible name. */
  ariaLabel?: string;
  /** Show a moving gloss highlight on the fill. */
  gloss?: boolean;
  delay?: number;
}

/** Rounded progress bar with spring fill and gloss stripe (reference video C top bar). */
export function ProgressBar({
  value,
  height = 14,
  color = 'var(--game-primary)',
  track = 'color-mix(in srgb, var(--game-border) 80%, var(--game-background))',
  label,
  ariaLabel,
  gloss = true,
  delay = 0,
}: ProgressBarProps) {
  const reduced = useGameReducedMotion();
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      aria-label={ariaLabel}
      style={{ position: 'relative', height, borderRadius: height, background: track, overflow: 'hidden' }}
    >
      <motion.div
        initial={false}
        animate={{ scaleX: v }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20, delay: delay / 1000 }}
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '0% 50%',
          background: color,
          borderRadius: height,
        }}
      >
        {gloss && (
          <span
            style={{
              position: 'absolute',
              left: 8,
              right: 8,
              top: Math.max(2, height * 0.2),
              height: Math.max(2, height * 0.22),
              borderRadius: height,
              background: 'rgba(255,255,255,0.35)',
            }}
          />
        )}
      </motion.div>
      {label != null && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: Math.max(10, height * 0.7),
            fontWeight: 700,
            color: 'var(--game-text)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export interface StateFrameProps {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyText?: ReactNode;
  /** Skeleton rendered while loading. */
  skeleton?: ReactNode;
  children?: ReactNode;
}

/** Shared loading / error / empty wrapper used by data-driven widgets. */
export function StateFrame({ loading, error, onRetry, empty, emptyText = 'Nothing here yet', skeleton, children }: StateFrameProps) {
  if (loading) {
    return (
      <div aria-busy="true" data-state="loading">
        {skeleton ?? (
          <div style={{ display: 'grid', gap: 10 }}>
            <Skeleton height={20} width="60%" />
            <Skeleton height={14} />
            <Skeleton height={14} width="80%" />
          </div>
        )}
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" data-state="error" className="gmf-shake-once" style={{ display: 'grid', gap: 10, justifyItems: 'start', padding: 12, borderRadius: 'var(--game-radius)', background: 'color-mix(in srgb, var(--game-error) 10%, var(--game-background))', color: 'var(--game-error)' }}>
        <strong style={{ fontSize: 14 }}>{error}</strong>
        {onRetry && (
          <TactileButton variant="danger" size="sm" onClick={onRetry}>
            Try again
          </TactileButton>
        )}
      </div>
    );
  }
  if (empty) {
    return (
      <div data-state="empty" style={{ padding: 16, textAlign: 'center', color: 'var(--game-muted)', fontSize: 14 }}>
        <div style={{ fontSize: 28, marginBottom: 6 }} aria-hidden="true">
          ✦
        </div>
        {emptyText}
      </div>
    );
  }
  return <>{children}</>;
}

export function Card({ children, style, padding = 16 }: { children?: ReactNode; style?: CSSProperties; padding?: number }) {
  const { tokens } = useGamifyTheme();
  const shadow = { none: 'none', soft: '0 2px 10px rgba(0,0,0,0.06)', medium: '0 6px 20px rgba(0,0,0,0.10)', bold: '0 12px 32px rgba(0,0,0,0.18)' }[tokens.shadow];
  return (
    <div
      style={{
        background: 'var(--game-card)',
        border: '1px solid var(--game-border)',
        borderRadius: 'var(--game-radius)',
        boxShadow: shadow,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
