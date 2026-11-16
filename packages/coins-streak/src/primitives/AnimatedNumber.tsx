import { useEffect, useRef, type CSSProperties } from 'react';
import { animate } from 'motion/react';
import { useGamifyTheme } from '../theme/ThemeProvider';

export interface AnimatedNumberProps {
  /** Target value. Changing it tweens from the currently displayed value, never jumps. */
  value: number;
  /** Starting value for the first render (default: value, i.e. no initial tween). */
  from?: number;
  /** Tween duration in ms before the theme speed multiplier. */
  duration?: number;
  /** Delay before counting starts, in ms. */
  delay?: number;
  /** Formatter, default Indian locale grouping. */
  format?: (n: number) => string;
  /** When true the counter snaps to `value` immediately (used by skip/interrupt). */
  skip?: boolean;
  /** Pad to this many digits, like the reference "05" lesson XP tile. */
  pad?: number;
  onDone?: () => void;
  className?: string;
  style?: CSSProperties;
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString('en-IN');

/**
 * Count-up number. Updates text content directly in an animation frame callback so a counting number
 * never re-renders the React tree. Under reduced motion or `skip` it sets the final value at once.
 */
export function AnimatedNumber({
  value,
  from,
  duration = 900,
  delay = 0,
  format = defaultFormat,
  skip = false,
  pad,
  onDone,
  className,
  style,
}: AnimatedNumberProps) {
  const { reducedMotion, animation } = useGamifyTheme();
  const ref = useRef<HTMLSpanElement | null>(null);
  const current = useRef<number>(from ?? value);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const render = (n: number) => {
    const s = format(n);
    const out = pad ? s.padStart(pad, '0') : s;
    if (ref.current) ref.current.textContent = out;
  };

  useEffect(() => {
    const start = current.current;
    if (reducedMotion || skip || start === value) {
      current.current = value;
      render(value);
      doneRef.current?.();
      return;
    }
    const controls = animate(start, value, {
      duration: (duration * animation.speed) / 1000,
      delay: (delay * animation.speed) / 1000,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        current.current = v;
        render(v);
      },
      onComplete: () => {
        current.current = value;
        render(value);
        doneRef.current?.();
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, skip, reducedMotion]);

  const initial = format(current.current);
  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums', ...style }}
      data-value={value}
    >
      {pad ? initial.padStart(pad, '0') : initial}
    </span>
  );
}
