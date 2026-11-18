#!/usr/bin/env node
// One-time (idempotent) setup of the OfferKit backend for Gamify:
//  - signs in as the seeded admin from offerkit/.env
//  - mints a scoped API key into offerkit/.env (OFFERKIT_API_KEY), never printed
//  - seeds campaigns, vouchers, loyalty program and referral program
//  - writes ids to offerkit/seed.json
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'offerkit');
const envFile = path.join(dir, '.env');
const seedFile = path.join(dir, 'seed.json');
const BASE = process.env.OFFERKIT_URL || 'http://127.0.0.1:3100';

function readEnv() {
  const o = {};
  for (const l of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) o[m[1]] = m[2];
  }
  return o;
}

const env = readEnv();
let cookie = '';
let apiKey = env.OFFERKIT_API_KEY || '';

async function call(method, p, body, useKey) {
  const headers = { 'Content-Type': 'application/json', Origin: 'http://localhost:3100' };
  if (useKey && apiKey) headers.Authorization = 'Bearer ' + apiKey;
  else if (cookie) headers.Cookie = cookie;
  const r = await fetch(BASE + p, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  if (!r.ok) throw new Error(method + ' ' + p + ' -> ' + r.status + ' ' + text.slice(0, 300));
  return json;
}

async function signIn() {
  const r = await fetch(BASE + '/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3100' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!r.ok) throw new Error('sign-in failed: ' + r.status);
  cookie = (r.headers.getSetCookie ? r.headers.getSetCookie() : []).map((c) => c.split(';')[0]).join('; ');
}

const find = (list, pred) => (list.data || list).find(pred);

async function ensureCampaign(def) {
  const list = await call('GET', '/api/v1/campaigns?limit=100');
  let c = find(list, (x) => x.name === def.name);
  if (!c) c = await call('POST', '/api/v1/campaigns', def);
  if (c.status !== 'active') c = await call('PATCH', '/api/v1/campaigns/' + c.id, { patch: { status: 'active' } });
  return c;
}

async function main() {
  await signIn();

  // Rotate the server key whenever its scopes differ from what the integration needs.
  const SCOPES = ['customers:read', 'customers:write', 'vouchers:read', 'vouchers:write', 'vouchers:validate',
    'vouchers:redeem', 'loyalty:read', 'loyalty:write', 'loyalty:redeem', 'referrals:read', 'referrals:write',
    'insights:read'];
  const keys = await call('GET', '/api/v1/api-keys');
  const existing = (keys.data || keys).filter((k) => k.name === 'gamify-server' && !k.disabledAt);
  const upToDate = existing.find((k) => SCOPES.every((s) => k.scopes.includes(s)));
  if (!apiKey || !upToDate) {
    for (const k of existing) await call('DELETE', '/api/v1/api-keys/' + k.id);
    const k = await call('POST', '/api/v1/api-keys', { name: 'gamify-server', scopes: SCOPES });
    apiKey = k.token;
    const kept = fs.readFileSync(envFile, 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('OFFERKIT_API_KEY='));
    fs.writeFileSync(envFile, kept.join('\n') + '\nOFFERKIT_API_KEY=' + apiKey + '\n');
    console.log('API key minted and stored in offerkit/.env');
  }

  const seed = {};

  // Coupons
  const coupons = await ensureCampaign({ name: 'Gamify Rewards Coupons', type: 'DISCOUNT', currency: 'INR', perUserRedemptionLimit: 5 });
  seed.couponCampaignId = coupons.id;
  const wanted = [
    { code: 'SKULL80', discount: { type: 'PERCENTAGE', percent: 8000, maxDiscountAmount: 500000 } },
    { code: 'WELCOME10', discount: { type: 'PERCENTAGE', percent: 1000 } },
    { code: 'SPIN20', discount: { type: 'PERCENTAGE', percent: 2000 } },
    { code: 'FLAT100', discount: { type: 'AMOUNT', amount: 10000 } },
    { code: 'CRED899', discount: { type: 'AMOUNT', amount: 89900 } },
    { code: 'UBER30', discount: { type: 'PERCENTAGE', percent: 3000 } },
    { code: 'SCRATCH50', discount: { type: 'PERCENTAGE', percent: 5000, maxDiscountAmount: 200000 } },
  ];
  const have = await call('GET', '/api/v1/vouchers?limit=100');
  for (const v of wanted) {
    const cur = find(have, (x) => x.code === v.code);
    if (!cur) await call('POST', '/api/v1/vouchers', { ...v, type: 'DISCOUNT', campaignId: coupons.id });
    else if (JSON.stringify(cur.discount) !== JSON.stringify(v.discount)) await call('PATCH', '/api/v1/vouchers/' + v.code, { patch: { discount: v.discount } });
  }
  seed.voucherCodes = wanted.map((v) => v.code);

  // Loyalty
  const lc = await ensureCampaign({ name: 'Gamify Loyalty', type: 'LOYALTY_PROGRAM', currency: 'INR' });
  const progs = await call('GET', '/api/v1/loyalty/programs?limit=100');
  let prog = find(progs, (p) => p.campaignId === lc.id);
  if (!prog) {
    prog = await call('POST', '/api/v1/loyalty/programs', { campaignId: lc.id });
    for (const [i, t] of [['Bronze', 0], ['Silver', 500], ['Gold', 2000]].entries()) {
      await call('POST', '/api/v1/loyalty/tiers', { programId: prog.id, name: t[0], threshold: t[1], earnMultiplier: 1 + i, sortOrder: i });
    }
    const rules = [
      ['Daily check-in', 'streak.checkin', 10], ['Spin played', 'spin.played', 5],
      ['Scratch card', 'scratch.revealed', 5], ['Game played', 'game.played', 8],
      ['Level up', 'level.up', 50], ['Referral conversion', 'referral.converted', 100],
    ];
    for (const [name, event, value] of rules) {
      await call('POST', '/api/v1/loyalty/earning-rules', { programId: prog.id, name, event, formula: { kind: 'fixed', value } });
    }
    await call('POST', '/api/v1/loyalty/rewards', { programId: prog.id, name: '10% off coupon', cost: 100, payload: { kind: 'discount', discount: { type: 'PERCENTAGE', percent: 1000 } } });
    await call('POST', '/api/v1/loyalty/rewards', { programId: prog.id, name: 'Rs 100 off', cost: 250, payload: { kind: 'discount', discount: { type: 'AMOUNT', amount: 10000 } } });
  }
  seed.loyaltyProgramId = prog.id;

  // Referrals
  const rc = await ensureCampaign({ name: 'Gamify Referrals', type: 'REFERRAL_PROGRAM', currency: 'INR' });
  const rps = await call('GET', '/api/v1/referral-programs?limit=100');
  let rp = find(rps, (p) => p.campaignId === rc.id);
  if (!rp) {
    rp = await call('POST', '/api/v1/referral-programs', {
      campaignId: rc.id,
      referrerReward: { kind: 'loyalty_points', loyaltyProgramId: prog.id, loyaltyPoints: 100 },
      refereeReward: { kind: 'discount', discount: { type: 'PERCENTAGE', percent: 1500 } },
      codeLength: 8,
    });
  }
  seed.referralProgramId = rp.id;

  // Re-apply discount values (OfferKit percentages are basis points: 1000 = 10%).
  const rewards = await call('GET', `/api/v1/loyalty/programs/${prog.id}/rewards`);
  for (const r of rewards.data || []) {
    if (r.payload && r.payload.discount && r.payload.discount.type === 'PERCENTAGE' && r.payload.discount.percent < 100) {
      await call('PATCH', '/api/v1/loyalty/rewards/' + r.id, { patch: { payload: { ...r.payload, discount: { ...r.payload.discount, percent: r.payload.discount.percent * 100 } } } });
    }
  }
  const ref = rp.refereeReward;
  if (ref && ref.discount && ref.discount.type === 'PERCENTAGE' && ref.discount.percent < 100) {
    await call('PATCH', '/api/v1/referral-programs/' + rp.id, { patch: { refereeReward: { ...ref, discount: { ...ref.discount, percent: ref.discount.percent * 100 } } } });
  }

  fs.writeFileSync(seedFile, JSON.stringify(seed, null, 2));
  console.log('Seeded:', JSON.stringify(seed));
}

main().catch((e) => { console.error(e.message); process.exit(1); });
