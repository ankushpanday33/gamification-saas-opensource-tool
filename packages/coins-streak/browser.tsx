// Browser entry for the gamify-saas widget renderer.
// Bundled by `npm run build:coins` into public/sdk/coins-streak.js, which exposes
// window.GamifyCoinsStreak.render(mountEl, widget, ctx) for the widget types
// `fire_streak` and `coin_wallet`. public/sdk/widgets.js loads it on demand.
import { useRef, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import css from './src/styles.css';
import {
  GamifyThemeProvider,
  StreakFlame,
  StreakWidget,
  StreakCelebration,
  CurrencyCounter,
  FlyToCounter,
  RewardBurstModal,
  TactileButton,
  type CurrencyCounterHandle,
  type FlameState,
  type UserStreakDTO,
} from './src';

type Config = Record<string, any>;
interface Widget { id: string; type: string; config: Config }
interface Ctx { emit?: (event: string, meta: Record<string, unknown>) => void }

const roots = new Map<Element, { root: Root; container: HTMLElement }>();

function injectCss() {
  if (document.getElementById('gmf-coins-streak-css')) return;
  const style = document.createElement('style');
  style.id = 'gmf-coins-streak-css';
  style.textContent = css;
  document.head.appendChild(style);
}

const iso = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  // Local calendar date (toISOString would give the UTC date, which is yesterday before 05:30 IST).
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const num = (v: unknown, fallback: number) => (Number.isFinite(Number(v)) && v !== '' ? Number(v) : fallback);

function Frame({ config, children }: { config: Config; children: ReactNode }) {
  return (
    <GamifyThemeProvider
      tokens={{ primary: config.primaryColor || '#FF6623', secondary: config.accentColor || '#FF9900' }}
      animation={{ sound: config.soundEnabled !== false }}
    >
      <div
        style={{
          position: 'relative',
          width: 360,
          maxWidth: '100%',
          minHeight: 600,
          overflow: 'hidden',
          borderRadius: 24,
          background: '#FFFFFF',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        }}
      >
        {children}
      </div>
    </GamifyThemeProvider>
  );
}

function FireStreak({ widget, ctx }: { widget: Widget; ctx: Ctx }) {
  const c = widget.config;
  const [count, setCount] = useState(num(c.streakCount, 6));
  const [celebrate, setCelebrate] = useState(false);
  const state = (c.flameState || 'active') as FlameState;
  const freezes = num(c.freezesAvailable, 1);
  const goal = num(c.nextMilestone, 7);

  const streak: UserStreakDTO = {
    key: 'daily',
    name: c.title || 'Daily streak',
    frequency: 'DAILY',
    current: count,
    longest: Math.max(num(c.longestStreak, 12), count),
    status: state === 'lost' ? 'BROKEN' : state === 'at_risk' ? 'AT_RISK' : state === 'unlit' ? 'NONE' : 'ACTIVE',
    freezesAvailable: freezes,
    lastActivePeriod: iso(0),
    currentPeriod: iso(0),
    recent: [6, 5, 4, 3, 2, 1, 0].map((o) => ({
      period: iso(o),
      state: o === 0 ? 'pending' : state === 'frozen' && o === 1 ? 'frozen' : o < count ? 'done' : 'missed',
    })),
    nextMilestone: goal > count ? goal : null,
  };

  // Last 7 days ending today, labelled with real weekdays.
  const weekDays = [6, 5, 4, 3, 2, 1, 0].map((o) => {
    const d = new Date();
    d.setDate(d.getDate() - o);
    return {
      label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()],
      state: (o === 0 ? 'pending' : 'done') as 'done' | 'pending',
      today: o === 0,
    };
  });

  // Emit after the ceremony closes so follow-up rewards (sticker unlock) don't cover the ignite moment.
  const pendingEmit = useRef<number | null>(null);
  const extend = () => {
    const next = count + 1;
    setCount(next);
    setCelebrate(true);
    pendingEmit.current = next;
  };
  const closeCelebration = () => {
    setCelebrate(false);
    if (pendingEmit.current != null) {
      ctx.emit?.('fire_streak_extended', { widgetId: widget.id, streak: pendingEmit.current });
      pendingEmit.current = null;
    }
  };

  return (
    <Frame config={c}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--game-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
          {c.eyebrow || 'Keep the fire going'}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{c.title || 'Daily streak'}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
        <StreakFlame streak={count} state={state} size={72} />
      </div>

      <StreakWidget streak={streak} onClick={() => setCelebrate(true)} />

      {c.showTiers !== false && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--game-muted)', marginBottom: 8 }}>Flame tiers</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'end', justifyContent: 'space-between' }}>
            {[1, 7, 30, 100, 365].map((d) => (
              <div key={d} style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
                <StreakFlame streak={d} size={26} />
                <span style={{ fontSize: 11, color: 'var(--game-muted)' }}>{d}d</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <TactileButton block size="lg" onClick={extend}>
          {c.ctaText || 'Complete today'}
        </TactileButton>
      </div>

      <StreakCelebration
        open={celebrate}
        streak={count}
        days={weekDays}
        message={c.celebrationMessage || "You're on fire! Keep it going."}
        requireIgnite={c.requireIgnite !== false}
        milestone={count === goal}
        contained
        onClose={closeCelebration}
      />
    </Frame>
  );
}

function CoinWallet({ widget, ctx }: { widget: Widget; ctx: Ctx }) {
  const c = widget.config;
  const [coins, setCoins] = useState(num(c.startingCoins, 155));
  const [rewardOpen, setRewardOpen] = useState(false);
  const [flight, setFlight] = useState<{ key: number; from: { x: number; y: number } } | null>(null);
  const wallet = useRef<CurrencyCounterHandle>(null);
  const earn = num(c.earnAmount, 10);
  const reward = num(c.rewardAmount, 50);

  return (
    <Frame config={c}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{c.title || 'Rewards'}</div>
        <CurrencyCounter ref={wallet} value={coins} icon="coin" label={c.walletLabel || 'Wallet'} />
      </div>

      <div
        style={{
          borderRadius: 20,
          padding: 20,
          color: '#FFFFFF',
          background: 'linear-gradient(135deg, var(--game-gradient-from), var(--game-gradient-to))',
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.9 }}>{c.taskLabel || 'Daily task'}</div>
        <div style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 14px' }}>{c.taskTitle || 'Watch one episode today'}</div>
        <TactileButton
          variant="light"
          block
          style={{ color: 'var(--game-primary)' }}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setFlight({ key: Date.now(), from: { x: r.left + r.width / 2, y: r.top } });
          }}
        >
          Earn {earn} coins
        </TactileButton>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <TactileButton block size="lg" onClick={() => setRewardOpen(true)}>
          {c.ctaText || 'Claim bonus reward'}
        </TactileButton>
      </div>

      <FlyToCounter
        trigger={flight?.key ?? null}
        from={flight?.from ?? null}
        to={() => wallet.current?.target ?? null}
        count={Math.min(num(c.flyCount, 8), 20)}
        icon="coin"
        onArrive={() => wallet.current?.bump()}
        onDone={() => {
          setCoins((v) => v + earn);
          ctx.emit?.('coin_wallet_earned', { widgetId: widget.id, amount: earn });
        }}
      />

      <RewardBurstModal
        open={rewardOpen}
        amount={reward}
        prefix="+"
        title={c.rewardTitle || 'You earned coins!'}
        message={c.rewardMessage || undefined}
        icon="coin"
        contained
        onClose={() => {
          setRewardOpen(false);
          setCoins((v) => v + reward);
          ctx.emit?.('coin_reward_claimed', { widgetId: widget.id, amount: reward });
        }}
      />
    </Frame>
  );
}

const views: Record<string, (p: { widget: Widget; ctx: Ctx }) => JSX.Element> = {
  fire_streak: FireStreak,
  coin_wallet: CoinWallet,
};

function unmount(mountEl: Element) {
  const entry = roots.get(mountEl);
  if (entry) {
    entry.root.unmount();
    roots.delete(mountEl);
  }
}

function render(mountEl: Element, widget: Widget, ctx: Ctx = {}) {
  const View = views[widget.type];
  if (!View) return false;
  injectCss();
  // React owns a child container, not the mount itself: host pages (live.html, gamify.js) write
  // loading text into the mount with innerHTML, which would otherwise rip out React's nodes.
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
  const root = entry.root;
  // Keyed on the config so edits in the Studio restart the demo with the new values.
  root.render(<View key={widget.id + JSON.stringify(widget.config)} widget={widget} ctx={ctx} />);
  return true;
}

(window as any).GamifyCoinsStreak = { render, unmount, types: Object.keys(views) };
