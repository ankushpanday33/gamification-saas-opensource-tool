import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useGameReducedMotion } from '../theme/ThemeProvider';
import { motionTokens } from '../animation/registry';

export interface OverlayProps {
  open: boolean;
  onClose?: () => void;
  /** Accessible title for the dialog. */
  label: string;
  /** Position absolutely inside the nearest positioned ancestor instead of the viewport (device previews). */
  contained?: boolean;
  /** Backdrop dim opacity 0..1 (reference video A dims to ~0.45). */
  dim?: number;
  /** Disable closing via backdrop click (e.g. while a reveal is running). */
  dismissible?: boolean;
  children?: ReactNode;
  variant?: 'sheet' | 'modal' | 'fullscreen';
  /** Background for fullscreen variant. */
  background?: string;
  zIndex?: number;
}

/** Calls `fn` on Escape. Used for closing dialogs and skipping celebrations. */
export function useEscape(fn: (() => void) | undefined, active = true) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active || typeof window === 'undefined') return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') ref.current?.();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [active]);
}

/**
 * Skip controller for celebrations. `skipped` flips true on Escape or `skip()`; components then snap all
 * counters to their final values instead of leaving half-tweened numbers.
 */
export function useSkip(active = true) {
  const [skipped, setSkipped] = useState(false);
  useEscape(() => setSkipped(true), active && !skipped);
  useEffect(() => {
    if (!active) setSkipped(false);
  }, [active]);
  return { skipped, skip: () => setSkipped(true), reset: () => setSkipped(false) };
}

/**
 * Backdrop + bottom sheet / centred modal / full screen layer. Sheets rise with the `spring.sheet`
 * token; modals pop with `spring.pop`. Under reduced motion both simply fade.
 */
export function Overlay({
  open,
  onClose,
  label,
  contained,
  dim = 0.45,
  dismissible = true,
  children,
  variant = 'modal',
  background,
  zIndex = 1000,
}: OverlayProps) {
  const reduced = useGameReducedMotion();
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEscape(dismissible ? onClose : undefined, open);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => panelRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  const pos: CSSProperties['position'] = contained ? 'absolute' : 'fixed';
  // Dismissals are faster than entrances: the user already decided, the UI should get out of the way.
  const fastExit = { duration: reduced ? 0.1 : 0.18, ease: motionTokens.ease.out };
  const panelMotion =
    variant === 'sheet'
      ? { initial: { y: reduced ? 0 : '100%', opacity: reduced ? 0 : 1 }, animate: { y: 0, opacity: 1 }, exit: { y: reduced ? 0 : '100%', opacity: reduced ? 0 : 1, transition: fastExit } }
      : variant === 'modal'
        ? { initial: { scale: reduced ? 1 : 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: reduced ? 1 : 0.97, opacity: 0, transition: fastExit } }
        : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: fastExit } };
  const transition = reduced
    ? { duration: 0.15 }
    : variant === 'sheet'
      ? motionTokens.spring.sheet
      : variant === 'modal'
        ? motionTokens.spring.pop
        : { duration: 0.3 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="gmf-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: fastExit }}
          transition={{ duration: reduced ? 0.1 : 0.2, ease: motionTokens.ease.out }}
          onClick={(e) => {
            if (e.target === e.currentTarget && dismissible) onClose?.();
          }}
          style={{
            position: pos,
            inset: 0,
            zIndex,
            background: variant === 'fullscreen' ? 'transparent' : `rgba(0,0,0,${dim})`,
            display: 'flex',
            alignItems: variant === 'sheet' ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: variant === 'modal' ? 16 : 0,
            overflow: 'hidden',
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            {...panelMotion}
            transition={transition}
            style={{
              position: 'relative',
              outline: 'none',
              width: '100%',
              maxWidth: variant === 'fullscreen' ? 'none' : variant === 'sheet' ? 560 : 420,
              height: variant === 'fullscreen' ? '100%' : undefined,
              maxHeight: variant === 'fullscreen' ? 'none' : '92%',
              overflowY: variant === 'fullscreen' ? 'hidden' : 'auto',
              background: background ?? 'var(--game-background)',
              color: 'var(--game-text)',
              borderRadius:
                variant === 'sheet' ? 'calc(var(--game-radius) + 8px) calc(var(--game-radius) + 8px) 0 0' : variant === 'modal' ? 'calc(var(--game-radius) + 6px)' : 0,
              boxShadow: variant === 'fullscreen' ? 'none' : '0 -8px 40px rgba(0,0,0,0.18)',
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Polite live region so screen readers hear gains ("You earned 50 points"). */
export function LiveAnnouncer({ message }: { message: string | null }) {
  return (
    <span
      aria-live="polite"
      role="status"
      style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}
    >
      {message ?? ''}
    </span>
  );
}
