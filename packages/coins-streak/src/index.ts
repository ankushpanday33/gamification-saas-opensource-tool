// Theme
export { GamifyThemeProvider, useGamifyTheme, useGameReducedMotion, themeToCssVars, useSpace } from './theme/ThemeProvider';
export type { GamifyThemeProviderProps, GamifyThemeValue } from './theme/ThemeProvider';

// Animation system
export { animationRegistry, registerAnimation, motionTokens, intensityScale } from './animation/registry';
export type { AnimationDefinition, SoundId } from './animation/registry';
export { useAnimation, resolveAnimation, useTiming } from './animation/useAnimation';
export type { ResolvedAnimation } from './animation/useAnimation';
export { OverrideAsset } from './animation/OverrideAsset';
export type { OverrideAssetProps } from './animation/OverrideAsset';
export { useFeedback, playSynth } from './feedback/useFeedback';
export type { Feedback, HapticPattern } from './feedback/useFeedback';

// Primitives
export { ParticleCanvas, useParticles, canUseCanvas } from './primitives/ParticleCanvas';
export type { ParticleCanvasHandle, ParticleCanvasProps, BurstOptions, ParticleKind } from './primitives/ParticleCanvas';
export { AnimatedNumber } from './primitives/AnimatedNumber';
export type { AnimatedNumberProps } from './primitives/AnimatedNumber';
export { TactileButton, Skeleton, ProgressBar, StateFrame, Spinner, Card } from './primitives/basics';
export type { TactileButtonProps, ButtonVariant, SkeletonProps, ProgressBarProps, StateFrameProps } from './primitives/basics';
export { Overlay, LiveAnnouncer, useSkip, useEscape } from './primitives/overlay';
export type { OverlayProps } from './primitives/overlay';

// Art
export { FlameArt, CoinArt, GemArt, StarArt, BoltArt, CheckArt, GiftArt, ChestArt, PotionArt, BadgeArt, Sunburst, rarityColor } from './art/art';
export type { FlameState, Rarity } from './art/art';

// Components
export { StreakFlame, StreakWidget, StreakCelebration, StreakProgressSheet, ChevronTrack, WeekStrip, flameTier } from './components/streak';
export type { StreakFlameProps, StreakWidgetProps, StreakCelebrationProps, StreakProgressSheetProps, WeekStripProps } from './components/streak';
export { RewardBurstModal, DailyCheckIn, CheckInStrip, GameToast, CurrencyCounter, FlyToCounter } from './components/rewardsFx';
export type {
  RewardBurstModalProps,
  DailyCheckInProps,
  CheckInDay,
  CheckInStripProps,
  GameToastProps,
  CurrencyCounterProps,
  CurrencyCounterHandle,
  FlyToCounterProps,
  RewardIcon,
} from './components/rewardsFx';

// Shared types
export * from './shared';
