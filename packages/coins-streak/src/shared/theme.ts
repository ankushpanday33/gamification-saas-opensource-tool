import { z } from 'zod';

const color = z
  .string()
  .max(64)
  .regex(
    /^(#[0-9a-fA-F]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\))$/,
    'colour must be HEX, RGB(A) or HSL(A)',
  );

export const themeTokensSchema = z.object({
  primary: color,
  secondary: color,
  accent: color,
  background: color,
  card: color,
  text: color,
  mutedText: color,
  border: color,
  success: color,
  error: color,
  warning: color,
  gradientFrom: color,
  gradientTo: color,
  radius: z.number().min(0).max(40),
  fontFamily: z.string().max(200),
  shadow: z.enum(['none', 'soft', 'medium', 'bold']),
  spacing: z.enum(['compact', 'comfortable', 'roomy']),
  buttonStyle: z.enum(['flat', 'tactile', 'pill']),
  mode: z.enum(['light', 'dark']),
});
export type ThemeTokens = z.infer<typeof themeTokensSchema>;

export const animationSettingsSchema = z.object({
  /** Multiplier applied to every duration (0.5 = twice as fast). */
  speed: z.number().min(0.25).max(3),
  /** Particle counts and celebration scale. */
  intensity: z.enum(['subtle', 'standard', 'epic']),
  sound: z.boolean(),
  haptics: z.boolean(),
  /** Streak ceremony: users swipe or tap to ignite the flame, or it ignites on its own. */
  streakIgnite: z.enum(['swipe', 'auto']).default('swipe'),
  /** Registry id to uploaded asset override. */
  overrides: z
    .record(
      z.object({
        kind: z.enum(['lottie', 'rive', 'image']),
        url: z.string().url().max(1000),
        stateMachine: z.string().max(100).optional(),
      }),
    )
    .default({}),
  visibility: z.record(z.boolean()).default({}),
  icons: z
    .object({
      xp: z.string().max(1000).optional(),
      coin: z.string().max(1000).optional(),
      flame: z.string().max(1000).optional(),
      logo: z.string().max(1000).optional(),
    })
    .default({}),
});
export type AnimationSettings = z.infer<typeof animationSettingsSchema>;

/** Hungama brand defaults: orange primary, Arial, no blue accents. */
export const defaultThemeTokens: ThemeTokens = {
  primary: '#FF6623',
  secondary: '#FF9900',
  accent: '#FFC233',
  background: '#FFFFFF',
  card: '#FFF7F2',
  text: '#333333',
  mutedText: '#7A6F69',
  border: '#F1E2D8',
  success: '#2DB24A',
  error: '#E5383B',
  warning: '#F5A524',
  gradientFrom: '#FF9900',
  gradientTo: '#FF6623',
  radius: 16,
  fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
  shadow: 'soft',
  spacing: 'comfortable',
  buttonStyle: 'tactile',
  mode: 'light',
};

export const defaultAnimationSettings: AnimationSettings = {
  speed: 1,
  intensity: 'standard',
  sound: false,
  haptics: true,
  streakIgnite: 'swipe',
  overrides: {},
  visibility: {},
  icons: {},
};

export interface PublishedTheme {
  id: string;
  version: number;
  tokens: ThemeTokens;
  animation: AnimationSettings;
}
