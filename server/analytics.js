// Local event analytics for Gamify (complements OfferKit insights, which cover coupons only).
// Stored inside the same JSON DB under DB.analytics so it survives restarts.

// Events that count as a conversion (user completed the reward action) and the loyalty points they earn.
const EARN_POINTS = {
  mynaksh_streak_claimed: 10, mynaksh_mantra_claimed: 5, zepto_scratch_revealed: 5, zepto_reward_claimed: 5,
  paytm_scratch_revealed: 5, paytm_spin_won: 5, paytm_spin_redeemed: 10, cred_wheel_won: 5, cred_wheel_redeemed: 10,
  cred_slot_won: 5, cred_slot_voucher_claimed: 10, duolingo_flow_completed: 50, coin_reward_claimed: 10,
  fire_streak_extended: 10, gift_rain_won: 5, smash_egg_won: 5, claw_machine_won: 5, nudge_tour_completed: 20,
  leaderboard_top3_reached: 25, instaastro_points_earned: 5,
};
const CONVERSIONS = new Set(Object.keys(EARN_POINTS));
const day = (d = new Date()) => d.toISOString().slice(0, 10);

function ensure(DB) {
  if (!DB.analytics) DB.analytics = { daily: {}, users: {}, eventTotals: {}, source: {} };
  return DB.analytics;
}

function record(DB, ev) {
  const a = ensure(DB);
  const d = day();
  const dd = a.daily[d] || (a.daily[d] = { events: 0, impressions: 0, conversions: 0, users: [] });
  dd.events += 1;
  if (ev.event === 'widget_impression') dd.impressions += 1;
  if (CONVERSIONS.has(ev.event)) dd.conversions += 1;
  if (ev.userId && !dd.users.includes(ev.userId) && dd.users.length < 5000) dd.users.push(ev.userId);
  a.eventTotals[ev.event] = (a.eventTotals[ev.event] || 0) + 1;
  const u = a.users[ev.userId] || (a.users[ev.userId] = { first: ev.timestamp, events: 0, conversions: 0 });
  u.last = ev.timestamp; u.events += 1;
  if (CONVERSIONS.has(ev.event)) u.conversions += 1;
  // keep ~90 days of daily buckets
  const keys = Object.keys(a.daily).sort();
  while (keys.length > 90) delete a.daily[keys.shift()];
  const uk = Object.keys(a.users);
  if (uk.length > 5000) delete a.users[uk[0]];
}

function summary(DB, days = 14) {
  const a = ensure(DB);
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = day(new Date(Date.now() - i * 864e5));
    const x = a.daily[d] || { events: 0, impressions: 0, conversions: 0, users: [] };
    series.push({ day: d, events: x.events, impressions: x.impressions, conversions: x.conversions, users: x.users.length });
  }
  const sum = (k) => series.reduce((n, s) => n + s[k], 0);
  const widgets = DB.widgets.map((w) => ({
    id: w.id, name: w.name, type: w.type,
    impressions: w.stats.impressions, conversions: w.stats.claims,
    rate: w.stats.impressions ? +((w.stats.claims / w.stats.impressions) * 100).toFixed(1) : 0,
  })).sort((x, y) => y.conversions - x.conversions);
  const topEvents = Object.entries(a.eventTotals).sort((x, y) => y[1] - x[1]).slice(0, 10).map(([event, total]) => ({ event, total }));
  const totalImp = DB.widgets.reduce((n, w) => n + w.stats.impressions, 0);
  const totalConv = DB.widgets.reduce((n, w) => n + w.stats.claims, 0);
  return {
    days,
    totals: {
      events: sum('events'), impressions: sum('impressions'), conversions: sum('conversions'),
      activeUsers: new Set(series.length ? Object.values(a.daily).slice(-days).flatMap((x) => x.users) : []).size,
      lifetimeImpressions: totalImp, lifetimeConversions: totalConv,
      conversionRate: totalImp ? +((totalConv / totalImp) * 100).toFixed(1) : 0,
    },
    series, widgets, topEvents,
  };
}

module.exports = { record, summary, EARN_POINTS, CONVERSIONS };
