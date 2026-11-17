// Three arcade games from @play-kit/games (vendored in ../src, MIT): Gift Rain, Smash the Egg and
// the Claw Machine (play-kit's DollMachine). Bundled by `npm run build:playkit` into
// public/sdk/play-kit.js + play-kit.css, exposing window.GamifyPlayKit.render(mountEl, widget, ctx)
// for widget types gift_rain, smash_egg and claw_machine. public/sdk/widgets.js loads it on demand.
// All text is English (play-kit's `en` dictionary) and can be overridden from the Studio.
import { useCallback, useMemo, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import '../src/styles.css';
import { pickPrize } from '../src/core/use-prize';
import type { GameState, Prize } from '../src/core/types';
import { PlayKitProvider, en } from '../src/i18n';
import type { ThemeName } from '../src/theme/tokens';
import { GiftRain } from '../src/games/gift-rain';
import { SmashEgg } from '../src/games/smash-egg';
import { DollMachine } from '../src/games/doll-machine';

type Config = Record<string, any>;
interface Widget { id: string; type: string; config: Config }
interface Ctx { emit?: (event: string, meta: Record<string, unknown>) => void }

const str = (v: unknown, d: string) => (typeof v === 'string' && v.trim() !== '' ? v : d);
const num = (v: unknown, d: number, min = -Infinity, max = Infinity) => {
  const n = Number(v);
  return v === '' || v == null || !Number.isFinite(n) ? d : Math.min(Math.max(n, min), max);
};
const THEMES: ThemeName[] = ['nocturne', 'light', 'neon', 'holo'];

// ---- English text overrides -------------------------------------------------------------------
// play-kit reads labels from its shared `en` dictionary when it renders, so each widget writes its
// overrides into that dictionary before rendering (restoring the originals for anything it does not
// override). If two play-kit widgets are on one page at once, the last one rendered sets the text.
const EN = en as unknown as Record<string, string>;
const EN_DEFAULTS: Record<string, string> = { ...EN };
const COMMON_TEXT: Record<string, string> = {
  startText: 'action.start',
  claimText: 'action.claim',
  tryAgainText: 'action.tryAgain',
  wonText: 'common.congrats',
  loseText: 'common.soClose',
  claimedText: 'state.claimed',
  playsLeftText: 'common.remaining',
};
function applyTexts(c: Config, own: Record<string, string>) {
  Object.keys(EN_DEFAULTS).forEach((k) => { EN[k] = EN_DEFAULTS[k]; });
  Object.entries({ ...COMMON_TEXT, ...own }).forEach(([cfgKey, enKey]) => {
    if (typeof c[cfgKey] === 'string' && c[cfgKey].trim() !== '') EN[enKey] = c[cfgKey];
  });
}

// Prize lists from flat Studio keys: prize1Label, prize1Win, prize1Weight ... (empty label = unused).
function prizesFrom(c: Config, prefix: string, max: number, defaults: { label: string; win: boolean; weight: number }[]): Prize[] {
  const list: Prize[] = [];
  for (let i = 1; i <= max; i++) {
    const d = defaults[i - 1];
    const label = typeof c[`${prefix}${i}Label`] === 'string' ? c[`${prefix}${i}Label`] : d?.label ?? '';
    if (!label.trim()) continue;
    list.push({
      id: `${prefix}${i}`,
      label,
      win: typeof c[`${prefix}${i}Win`] === 'boolean' ? c[`${prefix}${i}Win`] : d?.win ?? true,
      weight: num(c[`${prefix}${i}Weight`], d?.weight ?? 1, 0, 100),
    });
  }
  return list.length ? list : defaults.slice(0, 1).map((d, i) => ({ id: `${prefix}${i + 1}`, ...d }));
}

// Shared frame: theme, colour overrides through play-kit's --pk-* variables, and our phone frame.
function Frame({ c, children }: { c: Config; children: ReactNode }) {
  const theme = (THEMES as string[]).includes(c.theme) ? (c.theme as ThemeName) : 'nocturne';
  const vars: Record<string, string> = {};
  if (str(c.accentColor, '')) vars['--pk-accent'] = c.accentColor;
  if (str(c.accentColor2, '')) vars['--pk-accent-2'] = c.accentColor2;
  if (str(c.backgroundColor, '')) { vars['--pk-bg-0'] = c.backgroundColor; vars['--pk-bg-1'] = c.backgroundColor; }
  if (str(c.textColor, '')) vars['--pk-fg-0'] = c.textColor;
  const style = {
    width: 340,
    maxWidth: '100%',
    minHeight: 540,
    borderRadius: num(c.cornerRadius, 20, 0, 40),
    overflow: 'hidden',
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: 'var(--pk-bg-0)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    ...vars,
  } as CSSProperties;
  return (
    <PlayKitProvider lang="en" theme={theme} style={style}>
      {children}
    </PlayKitProvider>
  );
}

// ---- Gift Rain -------------------------------------------------------------------------------
function GiftRainKit({ widget, ctx }: { widget: Widget; ctx: Ctx }) {
  const c = widget.config;
  applyTexts(c, { title: 'giftRain.title', intro: 'giftRain.intro' });
  const gold = num(c.goldChance, 12, 0, 100) / 100;
  const bomb = Math.min(num(c.bombChance, 16, 0, 100) / 100, 1 - gold);
  const emit = (e: string, meta: Record<string, unknown> = {}) => ctx.emit?.(e, { widgetId: widget.id, ...meta });
  return (
    <Frame c={c}>
      <GiftRain
        durationSec={num(c.durationSec, 10, 3, 60)}
        scoreToWin={num(c.scoreToWin, 8, 1, 200)}
        spawnIntervalMs={num(c.spawnIntervalMs, 380, 120, 2000)}
        kindProbabilities={{ gold, bomb, red: Math.max(0, 1 - gold - bomb) }}
        scoreByKind={{ red: num(c.redScore, 1, -10, 10), gold: num(c.goldScore, 3, -10, 20), bomb: num(c.bombScore, -2, -20, 10) }}
        onStart={() => emit('gift_rain_started')}
        onWin={(score) => emit('gift_rain_won', { score })}
        onLose={(score) => emit('gift_rain_lost', { score })}
        onClaim={(score) => emit('gift_rain_claimed', { score, reward: str(c.rewardLabel, '') })}
      />
    </Frame>
  );
}

// ---- Smash the Egg ---------------------------------------------------------------------------
const EGG_DEFAULTS = [
  { label: '₹50 Cashback', win: true, weight: 2 },
  { label: '100 Coins', win: true, weight: 3 },
  { label: 'Better luck next time', win: false, weight: 4 },
  { label: '', win: true, weight: 1 },
  { label: '', win: true, weight: 1 },
];
function SmashEggKit({ widget, ctx }: { widget: Widget; ctx: Ctx }) {
  const c = widget.config;
  applyTexts(c, { title: 'smashEgg.title' });
  const pool = useMemo(() => prizesFrom(c, 'prize', 5, EGG_DEFAULTS), [c]);
  const eggCount = num(c.eggCount, 3, 2, 5);
  // play-kit gives each egg a fixed prize, so deal the prize pool into the eggs by weight and deal
  // again for every new round.
  const deal = useCallback(
    () => Array.from({ length: eggCount }, (_, i) => ({ ...pool[pickPrize(pool)], id: `egg${i}` })),
    [pool, eggCount],
  );
  const [eggs, setEggs] = useState<Prize[]>(deal);
  const [played, setPlayed] = useState(false);
  const emit = (e: string, meta: Record<string, unknown> = {}) => ctx.emit?.(e, { widgetId: widget.id, ...meta });
  const label = (p: Prize) => (typeof p.label === 'string' ? p.label : '');
  return (
    <Frame c={c}>
      <SmashEgg
        eggs={eggs}
        hammerDelayMs={num(c.hammerDelayMs, 700, 0, 3000)}
        revealDelayMs={num(c.revealDelayMs, 700, 0, 3000)}
        onStateChange={(s: GameState) => {
          if (s === 'playing') setPlayed(true);
          if (s === 'idle' && played) { setEggs(deal()); setPlayed(false); }
        }}
        onStart={() => emit('smash_egg_started')}
        onWin={(p) => emit('smash_egg_won', { prize: label(p) })}
        onLose={(p) => emit('smash_egg_lost', { prize: label(p) })}
        onClaim={(p) => emit('smash_egg_claimed', { prize: label(p) })}
      />
    </Frame>
  );
}

// ---- Claw Machine (play-kit DollMachine) -----------------------------------------------------
const CLAW_DEFAULTS = [
  { label: 'Teddy Bear', win: true, weight: 2 },
  { label: '₹100 Voucher', win: true, weight: 2 },
  { label: 'Wireless Earbuds', win: true, weight: 1 },
  { label: '', win: true, weight: 1 },
];
function ClawKit({ widget, ctx }: { widget: Widget; ctx: Ctx }) {
  const c = widget.config;
  applyTexts(c, { title: 'dollMachine.title', brand: 'dollMachine.brand' });
  if (!str(c.title, '')) EN['dollMachine.title'] = 'Claw Machine';
  const prizes = useMemo(() => prizesFrom(c, 'prize', 4, CLAW_DEFAULTS), [c]);
  const emit = (e: string, meta: Record<string, unknown> = {}) => ctx.emit?.(e, { widgetId: widget.id, ...meta });
  const label = (p: Prize | null) => (p && typeof p.label === 'string' ? p.label : '');
  return (
    <Frame c={c}>
      <DollMachine
        prizes={prizes}
        winRate={num(c.winRatePercent, 30, 0, 100) / 100}
        targetX={num(c.targetX, 70, 5, 95)}
        tolerance={num(c.tolerance, 12, 1, 50)}
        sliderSpeed={num(c.clawSpeed, 0.55, 0.1, 3)}
        grabDurationMs={num(c.grabDurationMs, 1600, 400, 5000)}
        maxPlays={num(c.maxPlays, 3, 1, 20)}
        onStart={() => emit('claw_machine_started')}
        onWin={(p) => emit('claw_machine_won', { prize: label(p) })}
        onLose={() => emit('claw_machine_lost')}
        onClaim={(p) => emit('claw_machine_claimed', { prize: label(p) })}
      />
    </Frame>
  );
}

const VIEWS: Record<string, (p: { widget: Widget; ctx: Ctx }) => ReactElement> = {
  gift_rain: GiftRainKit,
  smash_egg: SmashEggKit,
  claw_machine: ClawKit,
};

const roots = new Map<Element, { root: Root; container: HTMLElement }>();

function unmount(mountEl: Element) {
  const entry = roots.get(mountEl);
  if (entry) {
    entry.root.unmount();
    roots.delete(mountEl);
  }
}

function render(mountEl: Element, widget: Widget, ctx: Ctx = {}) {
  const View = VIEWS[widget.type];
  if (!View) return false;
  let entry = roots.get(mountEl);
  if (entry && !mountEl.contains(entry.container)) {
    unmount(mountEl);
    entry = undefined;
  }
  if (!entry) {
    mountEl.innerHTML = '';
    const container = document.createElement('div');
    mountEl.appendChild(container);
    entry = { root: createRoot(container), container };
    roots.set(mountEl, entry);
  }
  // Keyed on the config so every Studio edit restarts the game with the new settings.
  entry.root.render(<View key={widget.id + JSON.stringify(widget.config)} widget={widget} ctx={ctx} />);
  return true;
}

(window as any).GamifyPlayKit = { render, unmount, types: Object.keys(VIEWS) };
