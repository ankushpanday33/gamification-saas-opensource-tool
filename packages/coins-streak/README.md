# Gamify: Coins and Fire Streak components

Animated React components for a coin wallet and a fire streak, taken from the
`@gamify/ui` package of the gamify-platform repo. All art is original inline SVG
(no images to host), with canvas particles, sounds generated in the browser and
haptics.

## What's inside

| Component | What it does |
|---|---|
| `StreakFlame` | Fire icon that grows with the streak (tiers at 1, 7, 30, 100 and 365 days). States: `active`, `at_risk`, `frozen`, `lost`, `repaired`, `unlit` |
| `StreakWidget` | Streak card: flame, day count, freezes left and the last 7 days |
| `StreakCelebration` | Full screen ceremony: swipe up or tap to light the flame, number pops, week strip checks today |
| `StreakProgressSheet`, `WeekStrip`, `ChevronTrack` | Streak history and milestone progress |
| `CurrencyCounter` | Header coin chip. Counts up, bumps and floats "+N" when the balance rises |
| `FlyToCounter` | Coins fly on curved paths from a button into the wallet chip |
| `RewardBurstModal` | Big coin reward popup with sunburst and sparkles |
| `DailyCheckIn`, `CheckInStrip`, `GameToast` | Daily check-in reward calendar and toast |

Supporting code: `art/` (SVG flame, coin, gem, star), `animation/` (motion tokens
and registry), `feedback/` (sound and haptics), `primitives/` (particles,
animated number, overlay, buttons), `theme/` (colors, reduced motion).

## Setup

Copy `src/` into your React 18+ project (Next.js, Vite, CRA all work), then:

```bash
npm install motion@12.23.12 zod@3
```

`lottie-web` and `@rive-app/canvas` are only loaded if you supply your own
Lottie/Rive override animations. Install them only if you need that.

Import the stylesheet once (for example in your root layout):

```ts
import './gamify/styles.css';
```

Wrap the area that uses the components in the theme provider:

```tsx
import { GamifyThemeProvider, StreakFlame, CurrencyCounter } from './gamify';

<GamifyThemeProvider>
  <CurrencyCounter value={155} icon="coin" label="Wallet" />
  <StreakFlame streak={7} />
</GamifyThemeProvider>
```

See `example/Example.tsx` for a full working demo: flame tiers, the streak
card, coins flying into the wallet, the coin reward popup and the streak
celebration.

## Customising

Pass `tokens` to `GamifyThemeProvider` to change colors, for example
`<GamifyThemeProvider tokens={{ primary: '#FF6623', accent: '#FF9900' }}>`.
Set `reducedMotion="always"` to turn off animation. Users with the OS
"reduce motion" setting get static versions automatically.

## Notes

- In Next.js App Router, use these components from a `'use client'` file.
- `zod` is used only for the theme schema in `src/shared/theme.ts`.
- Type-checked with TypeScript 5.9 and React 19 types.
