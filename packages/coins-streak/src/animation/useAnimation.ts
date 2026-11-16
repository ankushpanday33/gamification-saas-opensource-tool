import { useMemo } from 'react';
import { useGamifyTheme } from '../theme/ThemeProvider';
import { animationRegistry, intensityScale, type AnimationDefinition } from './registry';
import type { AnimationSettings } from '../shared';

export interface ResolvedAnimation {
  id: string;
  definition: AnimationDefinition | undefined;
  /** Duration in ms after the theme speed multiplier (0 under reduced motion). */
  duration: number;
  /** Same as duration but in seconds, convenient for motion transitions. */
  seconds: number;
  intensity: AnimationSettings['intensity'];
  /** Multiplier for particle counts (0 under reduced motion). */
  particleScale: number;
  reduced: boolean;
  /** Uploaded Lottie / Rive / image override for this id, if configured. */
  override: AnimationSettings['overrides'][string] | null;
  hasOverride: boolean;
  /** False when the customer hid this animation in the customization studio. */
  enabled: boolean;
}

/** Pure resolver, exported for testing and for non-React consumers. */
export function resolveAnimation(
  id: string,
  settings: AnimationSettings,
  reduced: boolean,
): ResolvedAnimation {
  const definition = animationRegistry.get(id);
  const base = definition?.duration ?? 300;
  const duration = reduced ? 0 : Math.round(base * settings.speed);
  const override = settings.overrides?.[id] ?? null;
  return {
    id,
    definition,
    duration,
    seconds: duration / 1000,
    intensity: settings.intensity,
    particleScale: reduced ? 0 : intensityScale[settings.intensity],
    reduced,
    override,
    hasOverride: Boolean(override),
    enabled: settings.visibility?.[id] !== false,
  };
}

export function useAnimation(id: string): ResolvedAnimation {
  const { animation, reducedMotion } = useGamifyTheme();
  return useMemo(() => resolveAnimation(id, animation, reducedMotion), [id, animation, reducedMotion]);
}

/** Scales an arbitrary ms value by the theme speed (0 under reduced motion). */
export function useTiming(): (ms: number) => number {
  const { animation, reducedMotion } = useGamifyTheme();
  return (ms: number) => (reducedMotion ? 0 : ms * animation.speed);
}
