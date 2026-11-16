/**
 * Animation registry. Every celebratory or feedback animation in the kit is keyed by a registry id so
 * customers can retune timing or replace the visual with an uploaded Lottie / Rive asset per theme
 * without touching engine code. Ids mirror docs/ANIMATION_REFERENCE.md section 4.
 */

export interface AnimationDefinition {
  id: string;
  category: 'streak' | 'xp' | 'achievement' | 'reward' | 'quest' | 'game' | 'feedback' | 'currency' | 'leaderboard';
  trigger: string;
  /** Optional default asset url (Lottie JSON or Rive file). Native rendering is used when absent. */
  asset?: string;
  /** Base duration in ms before the theme speed multiplier. */
  duration: number;
  sound?: SoundId;
  haptic?: boolean;
  /** Description of what reduced-motion users see instead. */
  reducedMotionFallback?: string;
}

export type SoundId = 'coin' | 'whoosh' | 'success' | 'error' | 'tick' | 'levelup' | 'ignite';

/** Motion tokens derived from the reference recordings (section 2). */
export const motionTokens = {
  dur: { micro: 120, fast: 200, base: 320, reveal: 450, celebrate: 2200 },
  stagger: { tiles: 450, list: 50, particles: 80 },
  ease: {
    /** Strong ease-out for anything entering, exiting or giving feedback. */
    out: [0.23, 1, 0.32, 1] as [number, number, number, number],
    /** Strong ease-in-out for elements moving across the screen. */
    inOut: [0.77, 0, 0.175, 1] as [number, number, number, number],
    /** iOS-like drawer curve for sheets. */
    drawer: [0.32, 0.72, 0, 1] as [number, number, number, number],
    /** @deprecated ease-in delays the moment users watch; kept only for API compatibility. */
    in: [0.77, 0, 0.175, 1] as [number, number, number, number],
  },
  spring: {
    pop: { type: 'spring' as const, stiffness: 520, damping: 22 },
    sheet: { type: 'spring' as const, stiffness: 380, damping: 34 },
    counter: { type: 'spring' as const, stiffness: 180, damping: 26 },
  },
} as const;

const defs: AnimationDefinition[] = [
  { id: 'checkin.claim', category: 'reward', trigger: 'daily check-in claimed', duration: 320, sound: 'tick', haptic: true, reducedMotionFallback: 'sheet fades in place' },
  { id: 'reward.burst', category: 'reward', trigger: 'currency reward granted', duration: 450, sound: 'coin', haptic: true, reducedMotionFallback: 'coin fades in, no sunburst rotation' },
  { id: 'currency.fly', category: 'currency', trigger: 'currency earned', duration: 700, sound: 'coin', haptic: true, reducedMotionFallback: 'counter updates without flight' },
  { id: 'points.toast', category: 'xp', trigger: 'small points gain', duration: 4500, sound: 'tick', reducedMotionFallback: 'toast fades without slide' },
  { id: 'streak.progressSheet', category: 'streak', trigger: 'points earned with streak progress', duration: 320, sound: 'success', haptic: true },
  { id: 'rewards.milestones', category: 'reward', trigger: 'milestone rail renders', duration: 900 },
  { id: 'xp.fill', category: 'xp', trigger: 'xp bar progress', duration: 600, reducedMotionFallback: 'bar width set instantly' },
  { id: 'xp.combo', category: 'xp', trigger: 'combo multiplier increased', duration: 450, sound: 'tick', haptic: true },
  { id: 'feedback.success', category: 'feedback', trigger: 'correct action', duration: 200, sound: 'success', haptic: true },
  { id: 'feedback.error', category: 'feedback', trigger: 'wrong action', duration: 300, sound: 'error', haptic: true, reducedMotionFallback: 'red banner without shake' },
  { id: 'xp.statTiles', category: 'xp', trigger: 'session complete summary', duration: 450, sound: 'tick' },
  { id: 'streak.ignite', category: 'streak', trigger: 'first activity of the period', duration: 2400, sound: 'ignite', haptic: true, reducedMotionFallback: 'number and week strip fade in' },
  { id: 'streak.milestone', category: 'streak', trigger: 'streak milestone reached', duration: 2600, sound: 'levelup', haptic: true },
  { id: 'streak.flame', category: 'streak', trigger: 'flame idle', duration: 1600 },
  { id: 'streak.lost', category: 'streak', trigger: 'streak broken', duration: 900, sound: 'error' },
  { id: 'streak.freeze', category: 'streak', trigger: 'freeze consumed', duration: 900, sound: 'whoosh' },
  { id: 'streak.repair', category: 'streak', trigger: 'streak repaired', duration: 1100, sound: 'success', haptic: true },
  { id: 'collectible.reveal', category: 'reward', trigger: 'collectible card earned', duration: 1800, sound: 'whoosh', haptic: true },
  { id: 'quest.progress', category: 'quest', trigger: 'quest step progress', duration: 600 },
  { id: 'quest.complete', category: 'quest', trigger: 'quest completed', duration: 1200, sound: 'success', haptic: true },
  { id: 'quest.node', category: 'quest', trigger: 'path node focus', duration: 200 },
  { id: 'game.mysteryBox', category: 'game', trigger: 'mystery box opened', duration: 1400, sound: 'whoosh', haptic: true },
  { id: 'xp.doubleXp', category: 'xp', trigger: 'boost activated', duration: 1200, sound: 'levelup', haptic: true },
  { id: 'game.spinWheel', category: 'game', trigger: 'wheel spun', duration: 5200, sound: 'tick', haptic: true, reducedMotionFallback: 'wheel rotates once quickly to the prize' },
  { id: 'game.scratchCard', category: 'game', trigger: 'scratch card revealed', duration: 600, sound: 'coin', haptic: true },
  { id: 'achievement.unlock', category: 'achievement', trigger: 'achievement unlocked', duration: 2400, sound: 'levelup', haptic: true },
  { id: 'xp.levelUp', category: 'xp', trigger: 'level increased', duration: 2400, sound: 'levelup', haptic: true },
  { id: 'leaderboard.rankChange', category: 'leaderboard', trigger: 'rank changed', duration: 500 },
];

export const animationRegistry: Map<string, AnimationDefinition> = new Map(defs.map((d) => [d.id, d]));

/** Register or override an animation definition at runtime (for customer specific variants). */
export function registerAnimation(def: AnimationDefinition): void {
  animationRegistry.set(def.id, def);
}

export const intensityScale = { subtle: 0.4, standard: 1, epic: 1.8 } as const;
