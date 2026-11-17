// Onboarding tour ("nudge") demo built on react-native-flow-kit, running in the browser through
// react-native-web. Bundled by `npm run build:flowkit` into public/sdk/flow-kit.js, which exposes
// window.GamifyFlowKit.render(mountEl, widget, ctx) for the `nudge_tour` widget type.
// public/sdk/widgets.js loads it on demand. Every visible part reads from widget.config through
// resolveConfig() below, so the Studio can customise the whole tour.
import { useEffect, useRef, useState, type MutableRefObject, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { Flow, useFlow } from '../src';

// react-native-web's measure() adds up offsetParents and only subtracts their scroll, so it drifts
// when the element sits in a scrolling panel that is not an offsetParent (like the Studio preview).
// flow-kit draws its spotlight in a fixed, full-window Modal, so the viewport coordinates from
// getBoundingClientRect are exactly what it needs. This only affects this bundle.
(UIManager as any).measure = (node: HTMLElement, callback: (...v: number[]) => void) => {
  setTimeout(() => {
    if (!node || !node.isConnected) return;
    const r = node.getBoundingClientRect();
    const p = node.parentElement ? node.parentElement.getBoundingClientRect() : r;
    callback(r.left - p.left, r.top - p.top, r.width, r.height, r.left, r.top);
  }, 0);
};

type Config = Record<string, any>;
interface Widget { id: string; type: string; config: Config }
interface Ctx { emit?: (event: string, meta: Record<string, unknown>) => void }

type StepId = 'wallet' | 'streak' | 'games' | 'claim';
type Side = 'top' | 'bottom' | 'left' | 'right' | undefined;
type Align = 'start' | 'center' | 'end' | undefined;
const ALL_STEPS: StepId[] = ['wallet', 'streak', 'games', 'claim'];
// Older configs used step1..step4 keys in this order.
const LEGACY_INDEX: Record<StepId, number> = { wallet: 1, streak: 2, games: 3, claim: 4 };
const STEP_DEFAULTS: Record<StepId, { title: string; body: string; side: string; align: string }> = {
  wallet: { title: 'Your coin wallet', body: 'Every reward you win lands here. Tap it any time to see your history.', side: 'bottom', align: 'end' },
  streak: { title: 'Keep your streak alive', body: 'Come back daily to grow the flame and unlock bigger rewards.', side: 'bottom', align: 'center' },
  games: { title: 'Play to earn', body: 'Spin, scratch and hit the jackpot for coins and coupons.', side: 'auto', align: 'center' },
  claim: { title: 'Claim your daily reward', body: 'Tap here once a day to collect free coins.', side: 'top', align: 'center' },
};

const FONTS: Record<string, string> = {
  arial: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SFMono-Regular", Consolas, monospace',
};

const str = (v: unknown, d: string) => (typeof v === 'string' && v.trim() !== '' ? v : d);
const num = (v: unknown, d: number, min = -Infinity, max = Infinity) => {
  const n = Number(v);
  return v === '' || v == null || !Number.isFinite(n) ? d : Math.min(Math.max(n, min), max);
};
const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);

/** All settings with their defaults. The Studio form in public/index.html shows the same defaults. */
function resolveConfig(c: Config) {
  const order = str(c.stepOrder, ALL_STEPS.join(','))
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s, i, a): s is StepId => (ALL_STEPS as string[]).includes(s) && a.indexOf(s) === i)
    .filter((s) => bool(c[`${s}Enabled`], true));

  const step = (s: StepId) => {
    const legacy = LEGACY_INDEX[s];
    const d = STEP_DEFAULTS[s];
    const side = str(c[`${s}Side`], d.side);
    const align = str(c[`${s}Align`], d.align);
    return {
      title: str(c[`${s}Title`], str(c[`step${legacy}Title`], d.title)),
      body: str(c[`${s}Body`], str(c[`step${legacy}Body`], d.body)),
      side: (side === 'auto' ? undefined : side) as Side,
      align: align as Align,
    };
  };

  const accent = str(c.accentColor, '#FF6623');
  return {
    steps: order,
    step,
    behaviour: {
      autoStart: bool(c.autoStart, false),
      tapOverlayToAdvance: bool(c.tapOverlayToAdvance, true),
      completionReward: num(c.completionReward, 50, 0),
      rewardOnSkip: bool(c.rewardOnSkip, false),
    },
    spotlight: {
      color: str(c.overlayColor, '#0B0618'),
      opacity: num(c.overlayOpacity, 0.72, 0.1, 0.95),
      inset: num(c.spotlightPadding, 8, 0, 40),
    },
    tooltip: {
      bg: str(c.tooltipBg, '#FFFFFF'),
      title: str(c.tooltipTitleColor, '#22123A'),
      text: str(c.tooltipTextColor, '#4A3D5E'),
      button: str(c.tooltipButtonColor, accent),
      buttonText: str(c.tooltipButtonTextColor, '#FFFFFF'),
      width: num(c.tooltipWidth, 260, 180, 360),
      radius: num(c.tooltipRadius, 16, 0, 32),
      offset: num(c.tooltipOffset, 14, -20, 60),
      showCounter: bool(c.showCounter, true),
      counterText: str(c.counterText, '{n} of {total}'),
      showSkip: bool(c.showSkip, true),
      showBack: bool(c.showBack, true),
      nextText: str(c.nextText, 'Next'),
      backText: str(c.backText, 'Back'),
      skipText: str(c.skipText, 'Skip'),
      doneText: str(c.doneText, 'Got it'),
    },
    invite: {
      show: bool(c.showInvite, true),
      text: str(c.tourTitle, 'New here? Take a 20 second tour'),
      button: str(c.startButtonText, 'Start tour'),
      showFinish: bool(c.showFinishBanner, true),
      finishText: str(c.finishMessage, "You're all set! +{reward} coins added"),
      showReplay: bool(c.showReplay, true),
      replayText: str(c.replayText, 'Replay tour'),
      finishColor: str(c.finishColor, '#2DB24A'),
    },
    screen: {
      greeting: str(c.greeting, 'Welcome back'),
      title: str(c.appTitle, 'Rewards'),
      coins: num(c.startingCoins, 1250, 0),
      coinSymbol: str(c.coinSymbol, 'C'),
      coinColor: str(c.coinColor, '#F7BE1A'),
      streakLabel: str(c.streakLabel, 'Daily streak'),
      streakDays: num(c.streakDays, 6, 0, 30),
      streakGoal: num(c.streakGoal, 7, 1, 14),
      streakUnit: str(c.streakUnit, 'days'),
      streakColor: str(c.streakColor, '#FF8A1F'),
      games: [1, 2, 3]
        .map((i) => ({
          label: typeof c[`game${i}Label`] === 'string' ? c[`game${i}Label`] : ['Spin & Win', 'Scratch', 'Jackpot'][i - 1],
          color: str(c[`game${i}Color`], ['#7426DB', '#C8102E', '#F2A007'][i - 1]),
        }))
        .filter((g) => g.label.trim() !== ''),
      claimText: str(c.claimText, "Claim today's reward"),
      bg: str(c.screenBg, '#F7F2FF'),
      card: str(c.cardBg, '#FFFFFF'),
      border: str(c.cardBorder, '#EADFF8'),
      text: str(c.textColor, '#22123A'),
      muted: str(c.mutedColor, '#7A6A92'),
      accent,
      font: FONTS[str(c.fontFamily, 'arial')] || FONTS.arial,
      radius: num(c.cornerRadius, 18, 0, 32),
    },
  };
}
type Resolved = ReturnType<typeof resolveConfig>;

function TourTooltip({ id, index, r, onSkip }: { id: StepId; index: number; r: Resolved; onSkip: () => void }) {
  const { next, back, finish } = useFlow();
  const t = r.tooltip;
  const total = r.steps.length;
  const last = index === total - 1;
  const { title, body } = r.step(id);
  return (
    <View style={[styles.tip, { width: t.width, borderRadius: t.radius, backgroundColor: t.bg }]}>
      {t.showCounter && (
        <Text style={[styles.tipCount, { color: t.button, fontFamily: r.screen.font }]}>
          {t.counterText.replace('{n}', String(index + 1)).replace('{total}', String(total))}
        </Text>
      )}
      <Text style={[styles.tipTitle, { color: t.title, fontFamily: r.screen.font }]}>{title}</Text>
      <Text style={[styles.tipBody, { color: t.text, fontFamily: r.screen.font }]}>{body}</Text>
      <View style={styles.tipRow}>
        {t.showSkip && !last ? (
          <Pressable onPress={() => { onSkip(); finish(); }} accessibilityRole="button">
            <Text style={[styles.tipSkip, { color: t.text, fontFamily: r.screen.font }]}>{t.skipText}</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {t.showBack && index > 0 && (
            <Pressable onPress={back} style={[styles.tipBtn, { borderRadius: Math.min(t.radius, 14), backgroundColor: 'rgba(120,100,160,0.14)' }]} accessibilityRole="button">
              <Text style={[styles.tipBtnText, { color: t.title, fontFamily: r.screen.font }]}>{t.backText}</Text>
            </Pressable>
          )}
          <Pressable onPress={last ? () => finish() : next} style={[styles.tipBtn, { borderRadius: Math.min(t.radius, 14), backgroundColor: t.button }]} accessibilityRole="button">
            <Text style={[styles.tipBtnText, { color: t.buttonText, fontFamily: r.screen.font }]}>{last ? t.doneText : t.nextText}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function AppScreen({ r, coins, onSkip }: { r: Resolved; coins: number; onSkip: () => void }) {
  const { start, reset, next, status } = useFlow();
  const s = r.screen;
  const spot = { inset: r.spotlight.inset, color: r.spotlight.color, opacity: r.spotlight.opacity };
  const hasTour = r.steps.length > 0;

  // Replay: reset() first, then start() once the flow is back to idle (start() ignores calls
  // unless the status it sees is 'idle').
  const [replayPending, setReplayPending] = useState(false);
  useEffect(() => {
    if (replayPending && status === 'idle') {
      setReplayPending(false);
      start();
    }
  }, [replayPending, status, start]);

  // On the web the page itself scrolls, so bring each step's element into view before flow-kit
  // measures it (it measures two animation frames after onActive). On react-native-web a View ref
  // is the DOM element.
  const refs: Record<StepId, MutableRefObject<any>> = {
    wallet: useRef<any>(null),
    streak: useRef<any>(null),
    games: useRef<any>(null),
    claim: useRef<any>(null),
  };
  const reveal = (id: StepId) => () => {
    const el = refs[id].current;
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'center', inline: 'nearest' });
  };

  // Wraps an element in a Flow.Target when that step is part of the tour; otherwise renders it plain.
  const target = (id: StepId, child: ReactElement) => {
    const index = r.steps.indexOf(id);
    if (index === -1) return child;
    const cfg = r.step(id);
    const last = index === r.steps.length - 1;
    return (
      <Flow.Target
        step={id}
        spotlight={spot}
        tooltip={{ component: <TourTooltip id={id} index={index} r={r} onSkip={onSkip} />, side: cfg.side, align: cfg.align, offset: r.tooltip.offset }}
        onOverlayPress={r.behaviour.tapOverlayToAdvance && !last ? next : undefined}
        onActive={reveal(id)}
      >
        {child}
      </Flow.Target>
    );
  };

  const card = { backgroundColor: s.card, borderColor: s.border, borderRadius: s.radius };
  const font = { fontFamily: s.font };

  return (
    <View style={[styles.screen, { backgroundColor: s.bg, borderRadius: Math.min(s.radius, 24) }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.hello, font, { color: s.muted }]}>{s.greeting}</Text>
          <Text style={[styles.title, font, { color: s.text }]}>{s.title}</Text>
        </View>
        {target('wallet',
          <View ref={refs.wallet} style={[styles.wallet, { backgroundColor: s.card, borderColor: s.border }]}>
            <View style={[styles.coin, { backgroundColor: s.coinColor }]}><Text style={[styles.coinText, font]}>{s.coinSymbol}</Text></View>
            <Text style={[styles.walletText, font, { color: s.text }]}>{coins.toLocaleString('en-US')}</Text>
          </View>,
        )}
      </View>

      {hasTour && r.invite.show && (
        <Flow.Gate showWhenIdle showWhenActive={false}>
          <View style={[styles.banner, card, { borderColor: s.accent }]}>
            <Text style={[styles.bannerTitle, font, { color: s.text }]}>{r.invite.text}</Text>
            <Pressable onPress={start} style={[styles.bannerBtn, { backgroundColor: s.accent }]} accessibilityRole="button">
              <Text style={[styles.bannerBtnText, font]}>{r.invite.button}</Text>
            </Pressable>
          </View>
        </Flow.Gate>
      )}
      {hasTour && r.invite.showFinish && (
        <Flow.Gate showWhenFinished showWhenActive={false}>
          <View style={[styles.banner, card, { borderColor: r.invite.finishColor }]}>
            <Text style={[styles.bannerTitle, font, { color: s.text }]}>{r.invite.finishText.replace('{reward}', String(r.behaviour.completionReward))}</Text>
            {r.invite.showReplay && (
              <Pressable onPress={() => { reset(); setReplayPending(true); }} style={[styles.bannerBtn, { backgroundColor: r.invite.finishColor }]} accessibilityRole="button">
                <Text style={[styles.bannerBtnText, font]}>{r.invite.replayText}</Text>
              </Pressable>
            )}
          </View>
        </Flow.Gate>
      )}

      {target('streak',
        <View ref={refs.streak} style={[styles.card, card]}>
          <Text style={[styles.cardLabel, font, { color: s.muted }]}>{s.streakLabel}</Text>
          <Text style={[styles.cardBig, font, { color: s.text }]}>{`${s.streakDays} ${s.streakUnit}`}</Text>
          <View style={styles.dots}>
            {Array.from({ length: s.streakGoal }, (_, d) => (
              <View key={d} style={[styles.dot, { backgroundColor: d < s.streakDays ? s.streakColor : s.border }]} />
            ))}
          </View>
        </View>,
      )}

      {s.games.length > 0 && target('games',
        <View ref={refs.games} style={styles.games}>
          {s.games.map((g, i) => (
            <View key={i} style={[styles.game, { backgroundColor: g.color, borderRadius: s.radius }]}>
              <Text style={[styles.gameText, font]}>{g.label}</Text>
            </View>
          ))}
        </View>,
      )}

      <View style={{ flex: 1 }} />

      {target('claim',
        <View ref={refs.claim} style={[styles.claim, { backgroundColor: s.accent, borderRadius: Math.max(s.radius, 12) + 8 }]}>
          <Text style={[styles.claimText, font]}>{s.claimText}</Text>
        </View>,
      )}
    </View>
  );
}

function TourDemo({ widget, ctx }: { widget: Widget; ctx: Ctx }) {
  const r = resolveConfig(widget.config || {});
  const [coins, setCoins] = useState(r.screen.coins);
  const skipped = useRef(false);
  const steps = r.steps.length ? r.steps : (['wallet'] as StepId[]);
  const autoStart = r.behaviour.autoStart && r.steps.length > 0;
  // flow-kit begins an autoStart flow already 'active', so its onStart callback never fires.
  // Report the start ourselves in that case.
  useEffect(() => {
    if (autoStart) ctx.emit?.('nudge_tour_started', { widgetId: widget.id, steps: r.steps.length, auto: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    // No provider id: each widget mount is its own React tree, so the default flow context is already
    // scoped to this widget.
    <Flow.Provider
      steps={steps}
      autoStart={autoStart}
      onStart={() => {
        skipped.current = false;
        ctx.emit?.('nudge_tour_started', { widgetId: widget.id, steps: r.steps.length });
      }}
      onStepChange={(_from, to) => ctx.emit?.('nudge_tour_step', { widgetId: widget.id, step: to.id, index: to.index })}
      onFinish={() => {
        const wasSkipped = skipped.current;
        if (!wasSkipped || r.behaviour.rewardOnSkip) setCoins((v) => v + r.behaviour.completionReward);
        ctx.emit?.(wasSkipped ? 'nudge_tour_skipped' : 'nudge_tour_completed', { widgetId: widget.id });
      }}
    >
      <AppScreen r={r} coins={coins} onSkip={() => { skipped.current = true; }} />
    </Flow.Provider>
  );
}

const styles = StyleSheet.create({
  screen: { width: 340, minHeight: 560, padding: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  hello: { fontSize: 13, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '900' },
  wallet: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1 },
  coin: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  coinText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  walletText: { fontSize: 15, fontWeight: '900' },
  banner: { borderWidth: 1.5, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerTitle: { flex: 1, fontSize: 13.5, fontWeight: '800' },
  bannerBtn: { borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12 },
  bannerBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  card: { padding: 16, marginBottom: 14, borderWidth: 1 },
  cardLabel: { fontSize: 12.5, fontWeight: '700' },
  cardBig: { fontSize: 26, fontWeight: '900', marginVertical: 6 },
  dots: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dot: { width: 28, height: 8, borderRadius: 4 },
  games: { flexDirection: 'row', gap: 10 },
  game: { flex: 1, height: 92, justifyContent: 'flex-end', padding: 10 },
  gameText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  claim: { paddingVertical: 16, alignItems: 'center', marginTop: 18 },
  claimText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  tip: { padding: 14, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  tipCount: { fontSize: 11.5, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  tipTitle: { fontSize: 16, fontWeight: '900', marginBottom: 4 },
  tipBody: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  tipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tipSkip: { fontWeight: '700', fontSize: 13, opacity: 0.8 },
  tipBtn: { paddingVertical: 8, paddingHorizontal: 14 },
  tipBtnText: { fontWeight: '900', fontSize: 13 },
});

const roots = new Map<Element, { root: Root; container: HTMLElement }>();

function unmount(mountEl: Element) {
  const entry = roots.get(mountEl);
  if (entry) {
    entry.root.unmount();
    roots.delete(mountEl);
  }
}

function render(mountEl: Element, widget: Widget, ctx: Ctx = {}) {
  if (widget.type !== 'nudge_tour') return false;
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
  // Keyed on the config so every Studio edit restarts the demo with the new settings.
  entry.root.render(<TourDemo key={widget.id + JSON.stringify(widget.config)} widget={widget} ctx={ctx} />);
  return true;
}

(window as any).GamifyFlowKit = { render, unmount, types: ['nudge_tour'] };
