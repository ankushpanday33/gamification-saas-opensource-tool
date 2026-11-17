const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 4000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

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

function loadDB() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (parsed && Array.isArray(parsed.widgets) && parsed.widgets.length >= 7) {
        // Add any default widgets introduced after this DB was created, keeping saved ones as they are.
        const have = new Set(parsed.widgets.map(w => w.id));
        const missing = getDefaultWidgets().filter(w => !have.has(w.id));
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
    widgets: getDefaultWidgets(),
    events: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2));
  return fresh;
}

function saveDB(db) {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); } catch (_) { }
}

const DB = loadDB();

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

const server = http.createServer(async (req, res) => {
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
      const def = getDefaultWidgets().find(w => w.id === resetMatch[1]);
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
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, userId: body.userId, identifiedAt: new Date().toISOString() }));
      return;
    }

    if (pathname === '/api/v1/events' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const ev = { id: 'evt_' + Date.now(), ...body, timestamp: new Date().toISOString() };
      DB.events.push(ev);
      if (DB.events.length > 200) DB.events.shift();

      if (body.metadata && body.metadata.widgetId) {
        const w = DB.widgets.find(item => item.id === body.metadata.widgetId);
        if (w) {
          w.stats.claims += 1;
          w.stats.conversionRate = ((w.stats.claims / w.stats.impressions) * 100).toFixed(1) + '%';
        }
      }
      saveDB(DB);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, event: ev }));
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
          avgConversion: ((totalClaims / totalImpressions) * 100).toFixed(1) + '%',
          recentEvents: DB.events.slice(-15)
        }
      }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ success: false, error: 'API endpoint not found' }));
    return;
  }

  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '/dashboard') reqPath = '/index.html';
  if (reqPath === '/live' || reqPath === '/showcase' || reqPath === '/app') reqPath = '/live.html';
  if (reqPath === '/demo') reqPath = '/embed-demo.html';

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
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Gamify SaaS Platform running at http://localhost:${PORT}`);
  console.log(`   - Studio Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`   - Embeddable SDK:   http://localhost:${PORT}/sdk/gamify.js`);
  console.log(`   - REST API:         http://localhost:${PORT}/api/v1/widgets`);
});
