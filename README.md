# 🏆 Gamify SaaS — Gamification as a Service (Trophy.so Alternative)

Production-ready Gamification-as-a-Service engine built with reverse-engineered mechanics extracted from consumer APKs (**Duolingo**, **CRED**, **Mynaksh**, **Paytm**, **InstaAstro**).

---

## ⚡ Quick Start

```bash
cd gamify-saas
npm start
```
- **Live SaaS Studio & Dashboard**: `http://localhost:4000/dashboard`
- **Client Embeddable SDK**: `http://localhost:4000/sdk/gamify.js`
- **REST Customization API**: `http://localhost:4000/api/v1/widgets`

---

## 🛠 Available Mechanics & Sources

| Component | Source App / System | Extracted Engine | Key Customizations |
|---|---|---|---|
| **Juicy Path Chest** | Duolingo (`res/layout/activity_path_chest_reward.xml`) | Lottie (`chest_open_gold.json`), Audio (`chest_open.mp3`, `applause.mp3`) | Brand theme color, 3D border lip, tier (Gold/Silver/Bronze), gems reward |
| **Flame Streak & Calendar** | Duolingo (`activity_streak_drawer.xml`) | Lottie (`friend_streak_coupled_flame.json`), Audio (`streak_classic_flame.mp3`) | Flame color, frozen days, milestone targets, active days |
| **Vedic Streak & Shimmer** | Mynaksh (`index.android.bundle` Hermes Worklet) | Worklet Shimmer (`translateX(shimmerX)`), Authentic PNGs | Streak rewards roadmap, gradient, halo glow, coin values |
| **Obsidian Spin Wheel** | CRED | Canvas Deceleration Physics (`1 - (1-p)^4`), Mechanical audio tick | Segments, wheel rim gold tone, spin coin cost, multipliers |
| **Jackpot Slot Machine** | CRED | 3-Reel Stepper, Mechanical clunk audio | Reel symbols, winning combos, lever pull animations |
| **Holographic Scratch Card** | Paytm Cashback | Canvas scratch clearing, 50% threshold auto-reveal | Metallic gradient, reward title, currency amount, bank stamp text |

---

## 🔥 Fire Streak & Coin Wallet (React)

Two kits come from the React library in `packages/coins-streak` (fire streak with celebration, coin wallet with flying coins and reward popup):

| Widget id | Type | Events |
|---|---|---|
| `fire_streak_10` | `fire_streak` | `fire_streak_extended` |
| `coin_wallet_11` | `coin_wallet` | `coin_wallet_earned`, `coin_reward_claimed` |

They are bundled into `public/sdk/coins-streak.js`, which `widgets.js` loads the first time one is shown. The built file is committed, so `npm start` needs no build step. After changing anything in `packages/coins-streak`:

```bash
npm install
npm run build:coins
```

## 👉 Nudges: Onboarding Tour

The **Nudges** section in the Studio has an Onboarding Tour widget (`nudge_tour_12`, type `nudge_tour`). It dims the screen, spotlights one element at a time and shows a tooltip with Back / Next / Skip, then rewards coins when the tour is finished.

It runs [react-native-flow-kit](https://github.com/headbranch/react-native-flow-kit) (MIT, by Hy Phan), vendored unmodified in `packages/flow-kit/src` with its `LICENSE`, on the web through `react-native-web`. The demo app screen is in `packages/flow-kit/demo/browser.tsx` and is bundled to `public/sdk/flow-kit.js`:

```bash
npm run build:flowkit
```

Events: `nudge_tour_started`, `nudge_tour_step`, `nudge_tour_completed`.

Automatic sticker rewards show at most 2 times per browser session. Change it with `maxStickersPerSession` in the `GamifyWidgets.render` options.

To run on another port: `PORT=4010 npm start` (macOS/Linux) or `$env:PORT=4010; npm start` (PowerShell).

---

## 💻 1-Line Embed Code

### Option 1: Vanilla HTML / Webflow / Shopify
```html
<script src="http://localhost:4000/sdk/gamify.js" data-api-key="pk_live_duo_9821"></script>
<script>
  const gamify = new Gamify();
  document.getElementById('rewardBtn').onclick = () => {
    gamify.recordEvent('quest_completed', { widgetId: 'duo_chest_01' });
  };
</script>
```

### Option 2: React / Next.js
```tsx
import { useEffect, useState } from 'react';

export function RewardButton() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/widgets/duo_chest_01')
      .then(res => res.json())
      .then(data => setConfig(data.widget.config));
  }, []);

  return (
    <button onClick={() => triggerGamification('duo_chest_01')}>
      Claim {config?.rewardAmount} {config?.rewardUnit}
    </button>
  );
}
```


---

## License

MIT. See [LICENSE](LICENSE).

The license covers this project's own code. Third-party names, logos, sounds and animations referenced or bundled here belong to their respective owners and are not licensed under MIT.
