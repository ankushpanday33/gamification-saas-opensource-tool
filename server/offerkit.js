// OfferKit gateway: Gamify's real backend for coupons, loyalty, referrals, customers and insights.
// Every call degrades gracefully: if OfferKit is down or not configured, callers get
// { ok: false, offline: true } and the widgets keep working with their local behaviour.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OK_DIR = path.join(ROOT, 'offerkit');
// On Vercel the repo is read-only: the id cache goes to /tmp (it is rebuilt from OfferKit when missing).
const MAP_FILE = process.env.VERCEL ? path.join(require('os').tmpdir(), 'gamify-offerkit-map.json') : path.join(ROOT, 'data', 'offerkit-map.json');

function readEnvFile() {
  const o = {};
  try {
    for (const l of fs.readFileSync(path.join(OK_DIR, '.env'), 'utf8').split(/\r?\n/)) {
      const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) o[m[1]] = m[2];
    }
  } catch (_) {}
  return o;
}
function readSeed() {
  // Hosted: ids come from env vars. Local: offerkit/seed.json written by npm run offerkit:setup.
  if (process.env.OFFERKIT_LOYALTY_PROGRAM_ID) {
    return {
      loyaltyProgramId: process.env.OFFERKIT_LOYALTY_PROGRAM_ID,
      referralProgramId: process.env.OFFERKIT_REFERRAL_PROGRAM_ID,
      couponCampaignId: process.env.OFFERKIT_COUPON_CAMPAIGN_ID,
    };
  }
  try { return JSON.parse(fs.readFileSync(path.join(OK_DIR, 'seed.json'), 'utf8')); } catch (_) { return {}; }
}

const fileEnv = readEnvFile();
const BASE = process.env.OFFERKIT_URL || 'http://127.0.0.1:3100';
const KEY = process.env.OFFERKIT_API_KEY || fileEnv.OFFERKIT_API_KEY || '';
const SEED = readSeed();
const TIMEOUT_MS = 4000;

// userId -> { customerId, memberId, referralCode }
let MAP = {};
try { MAP = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')); } catch (_) {}
let mapTimer = null;
function persistMap() {
  clearTimeout(mapTimer);
  mapTimer = setTimeout(() => { try { fs.writeFileSync(MAP_FILE, JSON.stringify(MAP)); } catch (_) {} }, 400);
}

const configured = () => !!(KEY && SEED.loyaltyProgramId);

async function call(method, p, body) {
  if (!configured()) return { ok: false, offline: true, error: 'OfferKit not configured. Run: npm run offerkit:setup' };
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(BASE + '/api/v1' + p, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctl.signal,
    });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    if (!r.ok) return { ok: false, status: r.status, error: (data && data.message) || text.slice(0, 200) };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, offline: true, error: e.name === 'AbortError' ? 'OfferKit timed out' : 'OfferKit unreachable' };
  } finally { clearTimeout(t); }
}

async function status() {
  if (!configured()) return { configured: false, online: false };
  try {
    const r = await fetch(BASE + '/api/v1/ready', { signal: AbortSignal.timeout(2500) });
    const j = await r.json().catch(() => ({}));
    return { configured: true, online: r.ok, checks: j.checks || {}, url: BASE, programs: SEED };
  } catch (_) { return { configured: true, online: false, url: BASE }; }
}

async function ensureCustomer(userId, traits = {}) {
  if (!userId || userId === 'anonymous') return { ok: false, error: 'no user' };
  const cur = MAP[userId] || (MAP[userId] = {});
  if (cur.customerId && !traits.name && !traits.email) return { ok: true, customerId: cur.customerId };
  const body = { externalId: String(userId) };
  if (traits.email) body.email = String(traits.email);
  if (traits.name) body.name = String(traits.name);
  body.metadata = Object.fromEntries(Object.entries(traits).filter(([k, v]) => !['email', 'name'].includes(k) && ['string', 'number', 'boolean'].includes(typeof v)));
  const r = await call('PUT', '/customers/by-external-id', body);
  if (!r.ok) return r;
  cur.customerId = (r.data.customer || r.data).id;
  persistMap();
  return { ok: true, customerId: cur.customerId };
}

async function ensureMember(userId) {
  const c = await ensureCustomer(userId);
  if (!c.ok) return c;
  const cur = MAP[userId];
  if (cur.memberId) return { ok: true, memberId: cur.memberId, customerId: cur.customerId };
  let r = await call('POST', '/loyalty/members', { programId: SEED.loyaltyProgramId, customerId: cur.customerId });
  if (!r.ok) {
    // Already enrolled: find the existing membership.
    const list = await call('GET', `/loyalty/programs/${SEED.loyaltyProgramId}/members?limit=100`);
    const found = list.ok && (list.data.data || []).find((m) => m.customerId === cur.customerId);
    if (!found) return r;
    r = { ok: true, data: found };
  }
  cur.memberId = r.data.id;
  persistMap();
  return { ok: true, memberId: cur.memberId, customerId: cur.customerId };
}

async function loyalty(userId) {
  const m = await ensureMember(userId);
  if (!m.ok) return m;
  const r = await call('GET', '/loyalty/members/' + m.memberId);
  if (!r.ok) return r;
  const tx = await call('GET', `/loyalty/members/${m.memberId}/transactions?limit=10`);
  const prog = await call('GET', `/loyalty/programs/${SEED.loyaltyProgramId}/rewards`);
  return { ok: true, member: r.data, transactions: tx.ok ? tx.data.data || tx.data : [], rewards: prog.ok ? prog.data.data || prog.data : [] };
}

async function earn(userId, basePoints, eventId, note) {
  const m = await ensureMember(userId);
  if (!m.ok) return m;
  return call('POST', '/loyalty/members/earn', { memberId: m.memberId, basePoints, eventId, note, applyMultiplier: true });
}

async function redeemReward(userId, rewardId) {
  const m = await ensureMember(userId);
  if (!m.ok) return m;
  return call('POST', '/loyalty/members/redeem', { memberId: m.memberId, rewardId });
}

const orderOf = (amount) => ({ amount: Math.max(0, Math.round(Number(amount) || 0)), currency: 'INR', items: [] });

async function validateCoupon(code, userId, amount) {
  const body = { order: orderOf(amount) };
  if (userId && userId !== 'anonymous') body.customerExternalId = String(userId);
  return call('POST', `/vouchers/${encodeURIComponent(code)}/validate`, body);
}

async function redeemCoupon(code, userId, amount, orderId) {
  const c = await ensureCustomer(userId);
  const body = { order: orderOf(amount), idempotencyKey: `${userId}:${code}:${orderId || 'once'}`, externalOrderId: orderId || undefined };
  if (c.ok) body.customerId = c.customerId;
  return call('POST', `/vouchers/${encodeURIComponent(code)}/redemption`, body);
}

async function issueReferral(userId) {
  const cur = MAP[userId] || (MAP[userId] = {});
  const c = await ensureCustomer(userId);
  if (!c.ok) return c;
  if (cur.referralCode) return { ok: true, code: cur.referralCode };
  const r = await call('POST', '/referrals/issue', { programId: SEED.referralProgramId, referrerCustomerId: cur.customerId });
  if (!r.ok) return r;
  cur.referralCode = r.data.code || (r.data.referralCode && r.data.referralCode.code);
  persistMap();
  return { ok: true, code: cur.referralCode, raw: r.data };
}

async function convertReferral(code, refereeUserId) {
  const c = await ensureCustomer(refereeUserId);
  if (!c.ok) return c;
  return call('POST', '/referrals/convert', { code, refereeCustomerId: c.customerId, conversionEventId: `ref:${refereeUserId}` });
}

async function insights() { return call('GET', '/insights/summary'); }

// Counts of what lives in OfferKit, for the Studio Analytics page.
async function overview() {
  const [cust, vouch, members, codes, conv] = await Promise.all([
    call('GET', '/customers?limit=1'),
    call('GET', '/vouchers?limit=100'),
    call('GET', `/loyalty/programs/${SEED.loyaltyProgramId}/members?limit=100`),
    call('GET', `/referral-programs/${SEED.referralProgramId}/codes?limit=100`),
    call('GET', `/referral-programs/${SEED.referralProgramId}/conversions?limit=100`),
  ]);
  const list = (r) => (r.ok ? r.data.data || (Array.isArray(r.data) ? r.data : []) : []);
  return {
    ok: cust.ok || vouch.ok,
    vouchers: list(vouch).map((v) => ({ code: v.code, redemptions: v.redemptionCount ?? v.redemptions ?? 0, discount: v.discount, active: v.active })),
    members: list(members).map((m) => ({ id: m.id, balance: m.balance ?? 0, lifetimePoints: m.lifetimePoints ?? 0, tierId: m.currentTierId || null })),
    referralCodes: list(codes).length,
    referralConversions: list(conv).length,
  };
}

module.exports = { status, configured, ensureCustomer, ensureMember, loyalty, earn, redeemReward, validateCoupon, redeemCoupon, issueReferral, convertReferral, insights, overview, SEED };
