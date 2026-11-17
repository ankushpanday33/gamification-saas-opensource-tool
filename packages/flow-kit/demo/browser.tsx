// Onboarding tour ("nudge") demo built on react-native-flow-kit, running in the browser through
// react-native-web. Bundled by `npm run build:flowkit` into public/sdk/flow-kit.js, which exposes
// window.GamifyFlowKit.render(mountEl, widget, ctx) for the `nudge_tour` widget type.
// public/sdk/widgets.js loads it on demand.
import { useEffect, useRef, useState } from 'react';
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

const STEPS = ['wallet', 'streak', 'games', 'claim'] as const;
const DEFAULT_COPY: Record<(typeof STEPS)[number], { title: string; body: string }> = {
  wallet: { title: 'Your coin wallet', body: 'Every reward you win lands here. Tap it any time to see your history.' },
  streak: { title: 'Keep your streak alive', body: 'Come back daily to grow the flame and unlock bigger rewards.' },
  games: { title: 'Play to earn', body: 'Spin, scratch and hit the jackpot for coins and coupons.' },
  claim: { title: 'Claim your daily reward', body: 'Tap here once a day to collect free coins.' },
};

function copyFor(c: Config, step: (typeof STEPS)[number], i: number) {
  return {
    title: c[`step${i + 1}Title`] || DEFAULT_COPY[step].title,
    body: c[`step${i + 1}Body`] || DEFAULT_COPY[step].body,
  };
}

function TourTooltip({ step, index, accent, c }: { step: (typeof STEPS)[number]; index: number; accent: string; c: Config }) {
  const { next, back, finish } = useFlow();
  const last = index === STEPS.length - 1;
  const { title, body } = copyFor(c, step, index);
  return (
    <View style={styles.tip}>
      <Text style={[styles.tipCount, { color: accent }]}>{`${index + 1} of ${STEPS.length}`}</Text>
      <Text style={styles.tipTitle}>{title}</Text>
      <Text style={styles.tipBody}>{body}</Text>
      <View style={styles.tipRow}>
        <Pressable onPress={() => finish()} accessibilityRole="button">
          <Text style={styles.tipSkip}>Skip</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {index > 0 && (
            <Pressable onPress={back} style={[styles.tipBtn, styles.tipBtnGhost]} accessibilityRole="button">
              <Text style={[styles.tipBtnText, { color: '#3B2A55' }]}>Back</Text>
            </Pressable>
          )}
          <Pressable onPress={last ? () => finish() : next} style={[styles.tipBtn, { backgroundColor: accent }]} accessibilityRole="button">
            <Text style={styles.tipBtnText}>{last ? 'Got it' : 'Next'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function AppScreen({ c, coins, accent, opacity }: { c: Config; coins: number; accent: string; opacity: number }) {
  const { start, reset, next, status } = useFlow();
  const spot = { inset: 8, color: '#0B0618', opacity };
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
  const refs = {
    wallet: useRef<any>(null),
    streak: useRef<any>(null),
    games: useRef<any>(null),
    claim: useRef<any>(null),
  };
  const reveal = (step: keyof typeof refs) => () => {
    const el = refs[step].current;
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'center', inline: 'nearest' });
  };
  // flow-kit centres tooltips on the target and does not clamp them to the screen, so targets near an
  // edge (the wallet chip, top right) align the tooltip to their own edge instead.
  const tip = (step: (typeof STEPS)[number], i: number, side?: 'top' | 'bottom', align?: 'start' | 'center' | 'end') => ({
    component: <TourTooltip step={step} index={i} accent={accent} c={c} />,
    side,
    align,
    offset: 14,
  });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>{c.greeting || 'Welcome back'}</Text>
          <Text style={styles.title}>{c.appTitle || 'Rewards'}</Text>
        </View>
        <Flow.Target step="wallet" spotlight={spot} tooltip={tip('wallet', 0, 'bottom', 'end')} onOverlayPress={next} onActive={reveal('wallet')}>
          <View ref={refs.wallet} style={styles.wallet}>
            <View style={styles.coin}><Text style={styles.coinText}>C</Text></View>
            <Text style={styles.walletText}>{coins.toLocaleString('en-US')}</Text>
          </View>
        </Flow.Target>
      </View>

      <Flow.Gate showWhenIdle showWhenActive={false}>
        <View style={[styles.banner, { borderColor: accent }]}>
          <Text style={styles.bannerTitle}>{c.tourTitle || 'New here? Take a 20 second tour'}</Text>
          <Pressable onPress={start} style={[styles.bannerBtn, { backgroundColor: accent }]} accessibilityRole="button">
            <Text style={styles.bannerBtnText}>Start tour</Text>
          </Pressable>
        </View>
      </Flow.Gate>
      <Flow.Gate showWhenFinished showWhenActive={false}>
        <View style={[styles.banner, { borderColor: '#2DB24A' }]}>
          <Text style={styles.bannerTitle}>{`You're all set! +${Number(c.completionReward ?? 50)} coins added`}</Text>
          <Pressable onPress={() => { reset(); setReplayPending(true); }} style={[styles.bannerBtn, { backgroundColor: '#2DB24A' }]} accessibilityRole="button">
            <Text style={styles.bannerBtnText}>Replay tour</Text>
          </Pressable>
        </View>
      </Flow.Gate>

      <Flow.Target step="streak" spotlight={spot} tooltip={tip('streak', 1, 'bottom')} onOverlayPress={next} onActive={reveal('streak')}>
        <View ref={refs.streak} style={styles.card}>
          <Text style={styles.cardLabel}>Daily streak</Text>
          <Text style={styles.cardBig}>6 days</Text>
          <View style={styles.dots}>
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <View key={d} style={[styles.dot, { backgroundColor: d < 6 ? '#FF8A1F' : '#E7DDF5' }]} />
            ))}
          </View>
        </View>
      </Flow.Target>

      <Flow.Target step="games" spotlight={spot} tooltip={tip('games', 2)} onOverlayPress={next} onActive={reveal('games')}>
        <View ref={refs.games} style={styles.games}>
          {[
            ['Spin & Win', '#7426DB'],
            ['Scratch', '#C8102E'],
            ['Jackpot', '#F2A007'],
          ].map(([label, color]) => (
            <View key={label} style={[styles.game, { backgroundColor: color }]}>
              <Text style={styles.gameText}>{label}</Text>
            </View>
          ))}
        </View>
      </Flow.Target>

      <View style={{ flex: 1 }} />

      <Flow.Target step="claim" spotlight={spot} tooltip={tip('claim', 3, 'top')} onOverlayPress={() => {}} onActive={reveal('claim')}>
        <View ref={refs.claim} style={[styles.claim, { backgroundColor: accent }]}>
          <Text style={styles.claimText}>{c.claimText || "Claim today's reward"}</Text>
        </View>
      </Flow.Target>
    </View>
  );
}

function TourDemo({ widget, ctx }: { widget: Widget; ctx: Ctx }) {
  const c = widget.config;
  const accent = c.accentColor || '#FF6623';
  const opacity = Math.min(Math.max(Number(c.overlayOpacity ?? 0.72), 0.2), 0.95);
  const [coins, setCoins] = useState(Number(c.startingCoins ?? 1250));
  return (
    // No provider id: each widget mount is its own React tree, so the default flow context is already
    // scoped to this widget.
    <Flow.Provider
      steps={[...STEPS]}
      autoStart={!!c.autoStart}
      onStart={() => ctx.emit?.('nudge_tour_started', { widgetId: widget.id })}
      onStepChange={(_from, to) => ctx.emit?.('nudge_tour_step', { widgetId: widget.id, step: to.id })}
      onFinish={() => {
        setCoins((v) => v + Number(c.completionReward ?? 50));
        ctx.emit?.('nudge_tour_completed', { widgetId: widget.id });
      }}
    >
      <AppScreen c={c} coins={coins} accent={accent} opacity={opacity} />
    </Flow.Provider>
  );
}

const styles = StyleSheet.create({
  screen: { width: 340, minHeight: 560, borderRadius: 16, padding: 18, backgroundColor: '#F7F2FF', fontFamily: 'Arial, "Helvetica Neue", sans-serif' as any },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  hello: { fontSize: 13, color: '#7A6A92', fontWeight: '600' },
  title: { fontSize: 24, color: '#22123A', fontWeight: '900' },
  wallet: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 18, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: '#EADFF8' },
  coin: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#F7BE1A', alignItems: 'center', justifyContent: 'center' },
  coinText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  walletText: { fontSize: 15, fontWeight: '900', color: '#22123A' },
  banner: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerTitle: { flex: 1, fontSize: 13.5, fontWeight: '800', color: '#22123A' },
  bannerBtn: { borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12 },
  bannerBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#EADFF8' },
  cardLabel: { fontSize: 12.5, color: '#7A6A92', fontWeight: '700' },
  cardBig: { fontSize: 26, color: '#22123A', fontWeight: '900', marginVertical: 6 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 28, height: 8, borderRadius: 4 },
  games: { flexDirection: 'row', gap: 10 },
  game: { flex: 1, height: 92, borderRadius: 16, justifyContent: 'flex-end', padding: 10 },
  gameText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  claim: { borderRadius: 26, paddingVertical: 16, alignItems: 'center', marginTop: 18 },
  claimText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  tip: { width: 260, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  tipCount: { fontSize: 11.5, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  tipTitle: { fontSize: 16, fontWeight: '900', color: '#22123A', marginBottom: 4 },
  tipBody: { fontSize: 13, lineHeight: 18, color: '#4A3D5E', marginBottom: 12 },
  tipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tipSkip: { color: '#7A6A92', fontWeight: '700', fontSize: 13 },
  tipBtn: { borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14 },
  tipBtnGhost: { backgroundColor: '#EFE7FA' },
  tipBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
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
  entry.root.render(<TourDemo key={widget.id + JSON.stringify(widget.config)} widget={widget} ctx={ctx} />);
  return true;
}

(window as any).GamifyFlowKit = { render, unmount, types: ['nudge_tour'] };
