import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  defaultAnimationSettings,
  defaultThemeTokens,
  type AnimationSettings,
  type ThemeTokens,
} from '../shared';

export interface GamifyThemeValue {
  tokens: ThemeTokens;
  animation: AnimationSettings;
  /** True when the user (or the provider prop) asked for reduced motion. */
  reducedMotion: boolean;
}

const ThemeContext = createContext<GamifyThemeValue>({
  tokens: defaultThemeTokens,
  animation: defaultAnimationSettings,
  reducedMotion: false,
});

export interface GamifyThemeProviderProps {
  tokens?: Partial<ThemeTokens>;
  animation?: Partial<AnimationSettings>;
  /** 'user' follows the OS setting (default), 'always' forces reduced motion, 'never' ignores it. */
  reducedMotion?: 'user' | 'always' | 'never';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Converts theme tokens into the scoped CSS custom properties consumed by every component. */
export function themeToCssVars(tokens: ThemeTokens): Record<string, string> {
  return {
    '--game-primary': tokens.primary,
    '--game-secondary': tokens.secondary,
    '--game-accent': tokens.accent,
    '--game-background': tokens.background,
    '--game-card': tokens.card,
    '--game-text': tokens.text,
    '--game-muted': tokens.mutedText,
    '--game-border': tokens.border,
    '--game-success': tokens.success,
    '--game-error': tokens.error,
    '--game-warning': tokens.warning,
    '--game-gradient-from': tokens.gradientFrom,
    '--game-gradient-to': tokens.gradientTo,
    '--game-radius': `${tokens.radius}px`,
    '--game-font': tokens.fontFamily,
  };
}

/**
 * Scopes a theme to its subtree. Variables are written on a wrapper element (never :root) so several
 * differently branded widgets can live on one page, e.g. the dashboard live preview.
 */
export function GamifyThemeProvider({
  tokens,
  animation,
  reducedMotion = 'user',
  className,
  style,
  children,
}: GamifyThemeProviderProps) {
  const osReduced = useReducedMotion() ?? false;
  const value = useMemo<GamifyThemeValue>(() => {
    const t = { ...defaultThemeTokens, ...tokens };
    const a = {
      ...defaultAnimationSettings,
      ...animation,
      overrides: { ...defaultAnimationSettings.overrides, ...animation?.overrides },
      visibility: { ...defaultAnimationSettings.visibility, ...animation?.visibility },
      icons: { ...defaultAnimationSettings.icons, ...animation?.icons },
    };
    const rm = reducedMotion === 'always' ? true : reducedMotion === 'never' ? false : osReduced;
    return { tokens: t, animation: a, reducedMotion: rm };
  }, [tokens, animation, reducedMotion, osReduced]);

  const vars = themeToCssVars(value.tokens);
  return (
    <ThemeContext.Provider value={value}>
      <div
        className={['gmf-root', className].filter(Boolean).join(' ')}
        data-gmf-mode={value.tokens.mode}
        data-gmf-shadow={value.tokens.shadow}
        data-gmf-spacing={value.tokens.spacing}
        data-gmf-button={value.tokens.buttonStyle}
        data-gmf-reduced={value.reducedMotion ? 'true' : 'false'}
        style={{
          ...(vars as CSSProperties),
          fontFamily: 'var(--game-font)',
          color: 'var(--game-text)',
          ...style,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useGamifyTheme(): GamifyThemeValue {
  return useContext(ThemeContext);
}

/** Reduced motion that respects both the OS and the provider override. */
export function useGameReducedMotion(): boolean {
  return useContext(ThemeContext).reducedMotion;
}

export const spacingScale = { compact: 0.8, comfortable: 1, roomy: 1.25 } as const;
export const shadowScale = {
  none: 'none',
  soft: '0 2px 10px rgba(0,0,0,0.06)',
  medium: '0 6px 20px rgba(0,0,0,0.10)',
  bold: '0 12px 32px rgba(0,0,0,0.18)',
} as const;

/** Spacing helper: returns px scaled by the theme spacing token. */
export function useSpace(): (n: number) => number {
  const { tokens } = useGamifyTheme();
  const k = spacingScale[tokens.spacing];
  return (n: number) => Math.round(n * k);
}
