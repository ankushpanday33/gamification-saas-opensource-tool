const http = require('http');
const fs = require('fs');
const path = require('path');
const offerkit = require('./offerkit');
const analytics = require('./analytics');

const os = require('os');

const PORT = Number(process.env.PORT) || 4000;
const IS_VERCEL = !!process.env.VERCEL;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
// The repo filesystem is read-only on Vercel, so the working copy of the DB lives in /tmp there and is seeded
// from the bundled data/db.json. Durable storage on Vercel is the optional Redis below.
const BUNDLED_DB = path.join(__dirname, '..', 'data', 'db.json');
const DATA_DIR = IS_VERCEL ? path.join(os.tmpdir(), 'gamify') : path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Optional durable storage: any Upstash Redis REST endpoint (Vercel Marketplace "Upstash Redis" sets KV_REST_API_*).
const KV_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const KV_KEY = 'gamify:db';

function getDefaultWidgets() {
  return [
    {
      id: 'zepto_scratch_01',
      type: 'zepto_scratch',
      name: 'Zepto Purple Scratch Card',
      appSource: 'Zepto (ScreenRecording 11-09)',
      status: 'active',
      config: {
        headerEyebrow: 'Congratulations',
        headerTitle: 'Get Your Reward Inside!',
        foilTopColor: '#DF7DFF',
        foilBottomColor: '#7E35C6',
        brandWatermark: 'zepto',
        brandBadge: 'uni•',
        rewardTitle: 'Lifetime Free Rupay Card',
        rewardSubtitle: '5% back on Zepto + 1% back on UPI!',
        rewardFootnote: 'No minimum spends',
        couponCode: 'NO CODE NEEDED',
        ctaColor: '#F93262',
        ctaText: 'Claim now',
        scratchThresholdPercent: 45,
        soundEnabled: true
      },
      stats: { impressions: 5420, claims: 4310, conversionRate: '79.5%' }
    },
    {
      id: 'mynaksh_checkin_02',
      type: 'mynaksh_checkin',
      name: 'MyNaksh Daily Check-in & Sunburst',
      appSource: 'MyNaksh (ScreenRecording 11-05 11:20)',
      status: 'active',
      config: {
        initialView: 'modal',
        title: 'Daily check-in',
        subtitle: 'Collect your daily rewards here',
        currencySymbol: '₹',
        dayRewards: [5, 7, 9, 11, 13, 15, 17],
        activeDay: 2,
        highlightColor: '#F59E0B',
        ctaColor: '#FF6623',
        ctaText: 'Claim Now',
        soundEnabled: true
      },
      stats: { impressions: 3290, claims: 2480, conversionRate: '75.4%' }
    },
    {
      id: 'instaastro_points_03',
      type: 'instaastro_points',
      name: 'InstaAstro Points & 7-Day Stepper',
      appSource: 'InstaAstro (ScreenRecording 11-05 11:21)',
      status: 'active',
      config: {
        initialView: 'hub',
        startingPoints: 150,
        streakBonusPoints: 70,
        accentColor: '#FFC700',
        progressColor: '#22C55E',
        soundEnabled: true
      },
      stats: { impressions: 4180, claims: 3120, conversionRate: '74.6%' }
    },
    {
      id: 'paytm_chest_04',
      type: 'paytm_chest_scratch',
      name: 'Paytm Royal Scratch Card',
      appSource: 'Paytm Cashback (ScreenRecording 11-10 pt1)',
      status: 'active',
      config: {
        brandName: 'Your Brand',
        offerBrand: 'Skullcandy',
        offerTitle: '80% OFF',
        offerSubtitle: 'on headphones & earbuds',
        couponCode: 'SKULL80',
        footerText: 'Tap to Scratch & Win Rewards',
        scratchThresholdPercent: 45,
        soundEnabled: true
      },
      stats: { impressions: 6890, claims: 5940, conversionRate: '86.2%' }
    },
    {
      id: 'paytm_spin_05',
      type: 'paytm_spin_win',
      name: 'Paytm Spin & Win + Starburst',
      appSource: 'Paytm Cashback (ScreenRecording 11-10 pt2)',
      status: 'active',
      config: {
        title: 'Spin and Win',
        spinsLeft: 3,
        tabs: ['Top Deals', 'Steal Deals', 'Electronics'],
        // Clockwise from the top pointer. Icons: music, gift, headphones, perfume, coin.
        slices: [
          { label: '30 Days Free Pro', color: '#2160F0', icon: 'music' },
          { label: 'Flat ₹5 Cashback', color: '#D81B6A', icon: 'gift' },
          { label: '₹100 Off Deal', color: '#0FA9AE', icon: 'headphones' },
          { label: 'At Rs.549', color: '#7426DB', icon: 'perfume' }
        ],
        soundEnabled: true
      },
      stats: { impressions: 7450, claims: 6320, conversionRate: '84.8%' }
    },
    {
      id: 'duolingo_flow_06',
      type: 'duolingo_flow',
      name: 'Duolingo Lesson → Streak → Rare Chest',
      appSource: 'Duolingo (ScreenRecording 11-05 11:25)',
      status: 'active',
      config: {
        startStep: 1,
        themeColor: '#58CC02',
        xpEarned: 12,
        accuracy: 78,
        durationText: '0:49',
        streakCount: 1,
        lottieTier: 'gold',
        soundEnabled: true
      },
      stats: { impressions: 9120, claims: 8140, conversionRate: '89.3%' }
    },
    {
      id: 'cred_wheel_07',
      type: 'cred_wheel',
      name: 'CRED Obsidian Spin Wheel',
      appSource: 'CRED Luxury Kit',
      status: 'active',
      config: {
        titleScript: 'Spin',
        titleSerif: 'The Wheel',
        partnerName: 'MEGA REWARDS',
        couponCode: 'CRED899',
        coins: 560052,
        cashback: 77,
        tickets: 4,
        spinCostCoins: 1000,
        // Clockwise from the top pointer. icon: headphones | gift | coin | cashback | coupon | phone |
        // music | perfume | trimmer, or image: a product image URL.
        segments: [
          { label: 'Headphones at ₹999', color: '#1D6BF2', icon: 'headphones' },
          { label: 'Flat ₹100 Cashback', color: '#B321E8', icon: 'cashback' },
          { label: 'Mystery Gift Box', color: '#F26A0C', icon: 'gift' },
          { label: '500 Bonus Coins', color: '#5DB817', icon: 'coin' }
        ],
        soundEnabled: true
      },
      stats: { impressions: 4500, claims: 3910, conversionRate: '86.8%' }
    },
    {
      id: 'fire_streak_10',
      type: 'fire_streak',
      name: 'Fire Streak & Celebration',
      appSource: 'gamify-coins-streak (React)',
      status: 'active',
      config: {
        eyebrow: 'Keep the fire going',
        title: 'Daily streak',
        streakCount: 6,
        longestStreak: 12,
        freezesAvailable: 1,
        nextMilestone: 7,
        flameState: 'active',
        celebrationMessage: "You're on fire! Keep it going.",
        requireIgnite: true,
        showTiers: true,
        ctaText: 'Complete today',
        primaryColor: '#FF6623',
        accentColor: '#FF9900',
        soundEnabled: true
      },
      stats: { impressions: 1000, claims: 0, conversionRate: '0.0%' }
    },
    {
      id: 'coin_wallet_11',
      type: 'coin_wallet',
      name: 'Coin Wallet & Reward Burst',
      appSource: 'gamify-coins-streak (React)',
      status: 'active',
      config: {
        title: 'Rewards',
        walletLabel: 'Wallet',
        startingCoins: 155,
        taskLabel: 'Daily task',
        taskTitle: 'Watch one episode today',
        earnAmount: 10,
        flyCount: 8,
        rewardAmount: 50,
        rewardTitle: 'You earned coins!',
        rewardMessage: '',
        ctaText: 'Claim bonus reward',
        primaryColor: '#FF6623',
        accentColor: '#FF9900',
        soundEnabled: true
      },
      stats: { impressions: 1000, claims: 0, conversionRate: '0.0%' }
    },
    {
      id: 'nudge_tour_12',
      type: 'nudge_tour',
      name: 'Onboarding Tour (Spotlight Nudges)',
      appSource: 'react-native-flow-kit (React Native Web)',
      status: 'active',
      config: {
        tourTitle: 'New here? Take a 20 second tour',
        accentColor: '#FF6623',
        overlayOpacity: 0.72,
        completionReward: 50,
        startingCoins: 1250,
        autoStart: false,
        soundEnabled: true
      },
      stats: { impressions: 1000, claims: 0, conversionRate: '0.0%' }
    },
    // Arcade games from @play-kit/games (packages/play-kit). Text is English and editable.
    {
      id: 'gift_rain_13',
      type: 'gift_rain',
      name: 'Gift Rain (Catch the Drops)',
      appSource: '@play-kit/games',
      status: 'active',
      config: { theme: 'nocturne', durationSec: 10, scoreToWin: 8, spawnIntervalMs: 380, goldChance: 12, bombChance: 16, redScore: 1, goldScore: 3, bombScore: -2, rewardLabel: '50 Coins', soundEnabled: true },
      stats: { impressions: 1000, claims: 0, conversionRate: '0.0%' }
    },
    {
      id: 'smash_egg_14',
      type: 'smash_egg',
      name: 'Smash the Golden Egg',
      appSource: '@play-kit/games',
      status: 'active',
      config: {
        theme: 'nocturne', eggCount: 3,
        prize1Label: '₹50 Cashback', prize1Win: true, prize1Weight: 2,
        prize2Label: '100 Coins', prize2Win: true, prize2Weight: 3,
        prize3Label: 'Better luck next time', prize3Win: false, prize3Weight: 4,
        soundEnabled: true
      },
      stats: { impressions: 1000, claims: 0, conversionRate: '0.0%' }
    },
    {
      id: 'claw_machine_15',
      type: 'claw_machine',
      name: 'Claw Machine',
      appSource: '@play-kit/games',
      status: 'active',
      config: {
        theme: 'nocturne', title: 'Claw Machine', brand: 'CLAW', maxPlays: 3, winRatePercent: 30, targetX: 70, tolerance: 12, clawSpeed: 0.55,
        prize1Label: 'Teddy Bear', prize1Win: true, prize1Weight: 2,
        prize2Label: '₹100 Voucher', prize2Win: true, prize2Weight: 2,
        prize3Label: 'Wireless Earbuds', prize3Win: true, prize3Weight: 1,
        soundEnabled: true
      },
      stats: { impressions: 1000, claims: 0, conversionRate: '0.0%' }
    }
  ];
}

// GH-Arcade classics: one widget per game, generated from the built registry (public/arcade/registry.json).
function arcadeWidgets() {
  try {
    const reg = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'arcade', 'registry.json'), 'utf8'));
    return reg.map((g) => ({
      id: 'arcade_' + g.slug,
      type: 'arcade_game',
      name: g.title + ' (Arcade)',
      appSource: 'GH-Arcade (MIT)',
      status: 'active',
      config: { slug: g.slug, title: g.title, controls: g.controls, accentColor: g.accent, showHeader: true, maxWidth: 560, cornerRadius: 16 },
      stats: { impressions: 0, claims: 0, conversionRate: '0.0%' }
    }));
  } catch (_) { return []; }
}

function getAllDefaultWidgets() { return getDefaultWidgets().concat(arcadeWidgets()); }

function loadDB() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const source = fs.existsSync(DB_FILE) ? DB_FILE : (IS_VERCEL && fs.existsSync(BUNDLED_DB) ? BUNDLED_DB : null);
  if (source) {
    try {
      const parsed = JSON.parse(fs.readFileSync(source, 'utf8'));
      if (parsed && Array.isArray(parsed.widgets) && parsed.widgets.length >= 7) {
        // Add any default widgets introduced after this DB was created, keeping saved ones as they are.
        const have = new Set(parsed.widgets.map(w => w.id));
        const missing = getAllDefaultWidgets().filter(w => !have.has(w.id));
        if (missing.length) {
          parsed.widgets.push(...missing);
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
        }
        return parsed;
      }
    } catch (_) { }
  }
  const fresh = {
    projects: [{ id: 'proj_default', name: 'Default Workspace', apiKey: 'pk_live_duo_9821', createdAt: new Date().toISOString() }],
    widgets: getAllDefaultWidgets(),
    events: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2));
  return fresh;
}

let kvDirty = false;
function saveDB(db) {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); } catch (_) { }
  if (KV_URL) kvDirty = true;
}

async function kvCommand(cmd) {
  const r = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KV_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
    signal: AbortSignal.timeout(4000),
  });
  if (!r.ok) throw new Error('kv ' + r.status);
  return (await r.json()).result;
}

// Pull the shared DB from Redis (every API request, so parallel serverless instances stay in step).
async function kvHydrate() {
  if (!KV_URL) return;
  try {
    const raw = await kvCommand(['GET', KV_KEY]);
    if (!raw) return;
    const remote = JSON.parse(raw);
    if (!remote || !Array.isArray(remote.widgets)) return;
    const have = new Set(remote.widgets.map((w) => w.id));
    remote.widgets.push(...getAllDefaultWidgets().filter((w) => !have.has(w.id)));
    Object.keys(DB).forEach((k) => delete DB[k]);
    Object.assign(DB, remote);
  } catch (_) { /* keep the local copy */ }
}

async function kvFlush() {
  if (!KV_URL || !kvDirty) return;
  kvDirty = false;
  try { await kvCommand(['SET', KV_KEY, JSON.stringify(DB)]); } catch (_) { kvDirty = true; }
}

const DB = loadDB();

// One-time migration: the seeded demo numbers were placeholders. Real analytics start from zero.
if (!DB.statsZeroed) {
  DB.widgets.forEach((w) => { w.stats = { impressions: 0, claims: 0, conversionRate: '0.0%' }; });
  DB.events = [];
  DB.statsZeroed = true;
  saveDB(DB);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon',
};

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (err) { reject(err); }
    });
  });
}

async function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname.startsWith('/api/v1/')) {
    res.setHeader('Content-Type', 'application/json');
    if (KV_URL) {
      await kvHydrate();
      const realEnd = res.end.bind(res);
      res.end = (...a) => { kvFlush().finally(() => realEnd(...a)); return res; };
    }

    if (pathname === '/api/v1/widgets' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, widgets: DB.widgets }));
      return;
    }

    if (pathname === '/api/v1/stickers' && req.method === 'GET') {
      const manifestPath = path.join(PUBLIC_DIR, 'assets', 'stickers', 'stickers_manifest.json');
      let stickers = [];
      if (fs.existsSync(manifestPath)) {
        try { stickers = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch (e) {}
      }
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: stickers.length, stickers }));
      return;
    }

    if (pathname === '/api/v1/stickers/unlock' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const ev = {
        id: 'evt_stk_' + Date.now(),
        event: 'sticker_unlocked',
        userId: body.userId || 'demo_user',
        stickerId: body.stickerId,
        timestamp: new Date().toISOString()
      };
      DB.events.push(ev);
      if (DB.events.length > 200) DB.events.shift();
      saveDB(DB);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, event: ev }));
      return;
    }

    const resetMatch = pathname.match(/^\/api\/v1\/widgets\/([a-zA-Z0-9_-]+)\/reset$/);
    if (resetMatch && req.method === 'POST') {
      const def = getAllDefaultWidgets().find(w => w.id === resetMatch[1]);
      const idx = DB.widgets.findIndex(w => w.id === resetMatch[1]);
      if (def && idx !== -1) {
        DB.widgets[idx] = def;
        saveDB(DB);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, widget: DB.widgets[idx] }));
        return;
      }
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, error: 'Widget not found' }));
      return;
    }

    const widgetMatch = pathname.match(/^\/api\/v1\/widgets\/([a-zA-Z0-9_-]+)$/);
    if (widgetMatch && req.method === 'GET') {
      const widget = DB.widgets.find(w => w.id === widgetMatch[1]);
      if (widget) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, widget }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Widget not found' }));
      }
      return;
    }

    if (widgetMatch && req.method === 'PUT') {
      const widget = DB.widgets.find(w => w.id === widgetMatch[1]);
      if (!widget) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Widget not found' }));
        return;
      }
      try {
        const body = await parseJsonBody(req);
        if (body.config) widget.config = { ...widget.config, ...body.config };
        if (body.status) widget.status = body.status;
        saveDB(DB);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, widget }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
      return;
    }

    if (pathname === '/api/v1/users/identify' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      // Mirror the user into OfferKit as a customer + loyalty member (best effort).
      let offerkitCustomer = null;
      if (body.userId && body.userId !== 'studio_preview') {
        const traits = body.traits || {};
        const m = await offerkit.ensureMember(body.userId);
        if (m.ok) {
          offerkitCustomer = m.customerId;
          if (traits.name || traits.email) offerkit.ensureCustomer(body.userId, traits);
        }
      }
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, userId: body.userId, identifiedAt: new Date().toISOString(), offerkitCustomerId: offerkitCustomer }));
      return;
    }

    if (pathname === '/api/v1/events' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const ev = { id: 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), ...body, timestamp: new Date().toISOString() };
      DB.events.push(ev);
      if (DB.events.length > 200) DB.events.shift();
      analytics.record(DB, ev);

      const wid = body.metadata && body.metadata.widgetId;
      const w = wid && DB.widgets.find(item => item.id === wid);
      if (w) {
        if (body.event === 'widget_impression') w.stats.impressions += 1;
        else if (analytics.CONVERSIONS.has(body.event)) w.stats.claims += 1;
        w.stats.conversionRate = (w.stats.impressions ? (w.stats.claims / w.stats.impressions) * 100 : 0).toFixed(1) + '%';
      }
      saveDB(DB);

      // Loyalty: real users earn points in OfferKit for completing reward actions (best effort, non-blocking).
      let loyalty = null;
      const pts = analytics.EARN_POINTS[body.event];
      const real = body.userId && !['anonymous', 'studio_preview', 'demo_user'].includes(body.userId);
      if (pts && real) {
        const r = await offerkit.earn(body.userId, pts, ev.id, body.event);
        loyalty = r.ok ? { earned: pts, member: r.data } : { earned: 0, error: r.error, offline: !!r.offline };
      }
      // Coupon claims carry a code in metadata: verify it against OfferKit so analytics know it is a live voucher.
      let coupon = null;
      const code = body.metadata && typeof body.metadata.code === 'string' ? body.metadata.code.trim().toUpperCase() : '';
      if (code && /^[A-Z0-9_-]{3,40}$/.test(code)) {
        const v = await offerkit.validateCoupon(code, real ? body.userId : null, 100000);
        coupon = { code, valid: !!(v.ok && v.data && v.data.valid), reason: v.ok && v.data && !v.data.valid ? v.data.code : (v.ok ? null : v.error) };
      }
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, event: ev, loyalty, coupon }));
      return;
    }

    if (pathname === '/api/v1/stats' && req.method === 'GET') {
      const totalImpressions = DB.widgets.reduce((acc, w) => acc + w.stats.impressions, 0);
      const totalClaims = DB.widgets.reduce((acc, w) => acc + w.stats.claims, 0);
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        stats: {
          totalWidgets: DB.widgets.length,
          totalImpressions,
          totalClaims,
          avgConversion: (totalImpressions ? (totalClaims / totalImpressions) * 100 : 0).toFixed(1) + '%',
          recentEvents: DB.events.slice(-15)
        }
      }));
      return;
    }

    // ---- OfferKit-backed endpoints ----
    const reply = (code, obj) => { res.writeHead(code); res.end(JSON.stringify(obj)); };
    const fromOk = (r, extra = {}) => r.ok
      ? reply(200, { success: true, ...extra, data: r.data })
      : reply(r.offline ? 503 : (r.status || 400), { success: false, offline: !!r.offline, error: r.error });

    if (pathname === '/api/v1/offerkit/status' && req.method === 'GET') {
      return reply(200, { success: true, ...(await offerkit.status()) });
    }

    if (pathname === '/api/v1/analytics' && req.method === 'GET') {
      const days = Math.min(90, Math.max(1, parseInt(parsedUrl.searchParams.get('days') || '14', 10) || 14));
      const [st, ins, ov] = await Promise.all([offerkit.status(), offerkit.insights(), offerkit.overview()]);
      return reply(200, {
        success: true,
        gamify: analytics.summary(DB, days),
        offerkit: { status: st, insights: ins.ok ? ins.data : null, overview: ov.ok ? ov : null, error: ins.ok ? null : ins.error },
      });
    }

    if (pathname === '/api/v1/coupons/validate' && req.method === 'POST') {
      const b = await parseJsonBody(req);
      if (!b.code) return reply(400, { success: false, error: 'code is required' });
      return fromOk(await offerkit.validateCoupon(String(b.code).trim().toUpperCase(), b.userId, b.amount));
    }

    if (pathname === '/api/v1/coupons/redeem' && req.method === 'POST') {
      const b = await parseJsonBody(req);
      if (!b.code || !b.userId) return reply(400, { success: false, error: 'code and userId are required' });
      const r = await offerkit.redeemCoupon(String(b.code).trim().toUpperCase(), b.userId, b.amount, b.orderId);
      if (r.ok) {
        const ev = { id: 'evt_' + Date.now(), event: 'coupon_redeemed', userId: b.userId, metadata: { code: b.code }, timestamp: new Date().toISOString() };
        DB.events.push(ev); if (DB.events.length > 200) DB.events.shift();
        analytics.record(DB, ev); saveDB(DB);
      }
      return fromOk(r);
    }

    const loyaltyMatch = pathname.match(/^\/api\/v1\/loyalty\/([^/]+)$/);
    if (loyaltyMatch && req.method === 'GET') {
      const r = await offerkit.loyalty(decodeURIComponent(loyaltyMatch[1]));
      return r.ok ? reply(200, { success: true, ...r }) : fromOk(r);
    }

    if (pathname === '/api/v1/loyalty/redeem' && req.method === 'POST') {
      const b = await parseJsonBody(req);
      if (!b.userId || !b.rewardId) return reply(400, { success: false, error: 'userId and rewardId are required' });
      return fromOk(await offerkit.redeemReward(b.userId, b.rewardId));
    }

    if (pathname === '/api/v1/referrals/issue' && req.method === 'POST') {
      const b = await parseJsonBody(req);
      if (!b.userId) return reply(400, { success: false, error: 'userId is required' });
      const r = await offerkit.issueReferral(b.userId);
      return r.ok ? reply(200, { success: true, code: r.code }) : fromOk(r);
    }

    if (pathname === '/api/v1/referrals/convert' && req.method === 'POST') {
      const b = await parseJsonBody(req);
      if (!b.code || !b.userId) return reply(400, { success: false, error: 'code and userId are required' });
      const r = await offerkit.convertReferral(String(b.code).trim(), b.userId);
      if (r.ok) {
        const ev = { id: 'evt_' + Date.now(), event: 'referral_converted', userId: b.userId, metadata: { code: b.code }, timestamp: new Date().toISOString() };
        DB.events.push(ev); if (DB.events.length > 200) DB.events.shift();
        analytics.record(DB, ev); saveDB(DB);
      }
      return fromOk(r);
    }

    res.writeHead(404);
    res.end(JSON.stringify({ success: false, error: 'API endpoint not found' }));
    return;
  }

  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '/dashboard') reqPath = '/index.html';
  if (reqPath === '/live' || reqPath === '/showcase' || reqPath === '/app') reqPath = '/live.html';
  if (reqPath === '/demo') reqPath = '/embed-demo.html';
  // Folder URLs (e.g. /arcade/games/snake/) serve their index.html.
  if (reqPath.endsWith('/') && reqPath !== '/') reqPath += 'index.html';

  const filePath = path.join(PUBLIC_DIR, reqPath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + reqPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Gamify SaaS Platform running at http://localhost:${PORT}`);
    console.log(`   - Studio Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`   - Embeddable SDK:   http://localhost:${PORT}/sdk/gamify.js`);
    console.log(`   - REST API:         http://localhost:${PORT}/api/v1/widgets`);
  });
}

// Vercel (api/index.js) and tests import the request handler.
module.exports = handleRequest;
