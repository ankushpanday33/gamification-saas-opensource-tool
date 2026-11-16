// Demo of the fire streak and coin components. Drop into any React 18+ app.
import { useRef, useState } from 'react';
import '../src/styles.css';
import {
  GamifyThemeProvider,
  StreakFlame,
  StreakWidget,
  StreakCelebration,
  CurrencyCounter,
  FlyToCounter,
  RewardBurstModal,
  type CurrencyCounterHandle,
  type UserStreakDTO,
} from '../src';

const today = new Date();
const iso = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

export default function Example() {
  const [streakCount, setStreakCount] = useState(6);
  const [coins, setCoins] = useState(155);
  const [celebrate, setCelebrate] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [flight, setFlight] = useState<{ key: number; from: { x: number; y: number } } | null>(null);
  const wallet = useRef<CurrencyCounterHandle>(null);

  const streak: UserStreakDTO = {
    key: 'daily',
    name: 'Daily streak',
    frequency: 'DAILY',
    current: streakCount,
    longest: Math.max(12, streakCount),
    status: 'ACTIVE',
    freezesAvailable: 1,
    lastActivePeriod: iso(0),
    currentPeriod: iso(0),
    recent: [6, 5, 4, 3, 2, 1, 0].map((o) => ({ period: iso(o), state: o === 0 ? 'pending' : 'done' })),
    nextMilestone: 7,
  };

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((label, i) => ({
    label,
    state: (i < 6 ? 'done' : 'pending') as 'done' | 'pending',
    today: i === 6,
  }));

  return (
    <GamifyThemeProvider>
      <div style={{ display: 'grid', gap: 24, padding: 24, maxWidth: 420, fontFamily: 'Arial, "Helvetica Neue", sans-serif' }}>
        {/* Coin wallet chip: tweens, bumps and floats "+N" when the value rises */}
        <CurrencyCounter ref={wallet} value={coins} icon="coin" label="Wallet" />

        {/* Fire streak: flame grows with the streak tier */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
          <StreakFlame streak={1} />
          <StreakFlame streak={7} />
          <StreakFlame streak={30} />
          <StreakFlame streak={5} state="frozen" />
          <StreakFlame streak={5} state="at_risk" />
        </div>

        {/* Streak card with week history */}
        <StreakWidget streak={streak} onClick={() => setCelebrate(true)} />

        <button
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setFlight({ key: Date.now(), from: { x: r.left + r.width / 2, y: r.top } });
          }}
        >
          Earn 10 coins (fly to wallet)
        </button>
        <button onClick={() => setRewardOpen(true)}>Show coin reward modal</button>
        <button
          onClick={() => {
            setStreakCount((s) => s + 1);
            setCelebrate(true);
          }}
        >
          Extend streak (full screen fire celebration)
        </button>
      </div>

      <FlyToCounter
        trigger={flight?.key ?? null}
        from={flight?.from ?? null}
        to={() => wallet.current?.target ?? null}
        count={8}
        icon="coin"
        onArrive={() => wallet.current?.bump()}
        onDone={() => setCoins((c) => c + 10)}
      />

      <RewardBurstModal
        open={rewardOpen}
        amount={50}
        prefix="+"
        title="You earned coins!"
        icon="coin"
        onClose={() => {
          setRewardOpen(false);
          setCoins((c) => c + 50);
        }}
      />

      <StreakCelebration
        open={celebrate}
        streak={streakCount}
        days={weekDays}
        message="You're on fire! Keep it going."
        requireIgnite
        onClose={() => setCelebrate(false)}
      />
    </GamifyThemeProvider>
  );
}
