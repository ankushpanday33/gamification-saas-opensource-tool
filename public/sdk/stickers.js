/**
 * Gamify Sticker Reward & Collector Engine v1.0.0
 * 15 Handcrafted Achievement Stickers with Audio Fanfare, 3D Foil Hologram & Collector Album
 */
(function (window, document) {
  'use strict';

  const STICKER_DATA = [
    {
      id: 'horror_queen',
      title: 'Horror Queen',
      tagline: 'Fearless Midnight Binger',
      category: 'Entertainment',
      tier: 'rare',
      xp: 250,
      coins: 50,
      trigger: 'Watch 5 horror/late-night titles or active after 11 PM',
      icon: 'horror_queen.png'
    },
    {
      id: 'action_hero',
      title: 'Action Hero',
      tagline: 'High Octane Super Fan',
      category: 'Action & Adventure',
      tier: 'epic',
      xp: 350,
      coins: 75,
      trigger: 'Win 3 rounds in Spin Wheel or Slot Machine',
      icon: 'action_hero.png'
    },
    {
      id: 'romance_pro',
      title: 'Romance Pro',
      tagline: 'Hopeless Romantic Lover',
      category: 'Social & Romance',
      tier: 'common',
      xp: 150,
      coins: 30,
      trigger: 'Refer 1 friend and complete double-rewards',
      icon: 'romance_pro.png'
    },
    {
      id: 'comedy_king',
      title: 'Comedy King',
      tagline: 'Master of Laughter & Memes',
      category: 'Humor & Fun',
      tier: 'rare',
      xp: 200,
      coins: 45,
      trigger: 'Claim daily reward 3 days in a row',
      icon: 'comedy_king.png'
    },
    {
      id: 'drama_llama',
      title: 'Drama Llama',
      tagline: 'All The Gossip, Zero Regrets',
      category: 'Entertainment',
      tier: 'common',
      xp: 180,
      coins: 35,
      trigger: 'Share any badge to WhatsApp or Twitter',
      icon: 'drama_llama.png'
    },
    {
      id: 'drama_llamaa',
      title: 'Drama Queen Llama',
      tagline: 'Tears, Shades & Maximum Glam',
      category: 'Emotions & Fun',
      tier: 'rare',
      xp: 220,
      coins: 50,
      trigger: 'Complete 10 scratch cards in Zepto widget',
      icon: 'drama_llamaa.png'
    },
    {
      id: 'binge_watcher',
      title: 'Binge Watcher',
      tagline: 'Just One More Episode Master',
      category: 'Streaks & Milestones',
      tier: 'legendary',
      xp: 500,
      coins: 100,
      trigger: 'Hit a 7-day streak in MyNaksh or Duolingo',
      icon: 'binge_watcher.png'
    },
    {
      id: 'sci_fi_geek',
      title: 'Sci-Fi Geek',
      tagline: 'Living in the Year 3000',
      category: 'Tech & Gaming',
      tier: 'epic',
      xp: 400,
      coins: 80,
      trigger: 'Interact with all 9 gamification widgets',
      icon: 'sci_fi_geek.png'
    },
    {
      id: 'thriller_junkie',
      title: 'Thriller Junkie',
      tagline: 'Detective on the Trail',
      category: 'Mystery & Thriller',
      tier: 'rare',
      xp: 280,
      coins: 60,
      trigger: 'Reach Top 10 in the Global Leaderboard',
      icon: 'thriller_junkie.png'
    },
    {
      id: 'music_buff',
      title: 'Music Buff',
      tagline: 'Rhythms, Beats & Headphones On',
      category: 'Music & Audio',
      tier: 'common',
      xp: 160,
      coins: 30,
      trigger: 'Listen to ambient sounds for 5 minutes',
      icon: 'music_buff.png'
    },
    {
      id: 'rock_star',
      title: 'Rock Star',
      tagline: 'Shredding Solos & Crowd Surfing',
      category: 'Music & Audio',
      tier: 'legendary',
      xp: 450,
      coins: 90,
      trigger: 'Claim total 1,000 XP in Rewards Studio',
      icon: 'rock_star.png'
    },
    {
      id: 'kids_zone',
      title: 'Kids Zone',
      tagline: 'Pure Joy & Elephant Hugs',
      category: 'Family & Casual',
      tier: 'common',
      xp: 120,
      coins: 25,
      trigger: 'Complete onboarding walkthrough',
      icon: 'kids_zone.png'
    },
    {
      id: 'wildlife_explorer',
      title: 'Wildlife Explorer',
      tagline: 'King of the Urban Safari',
      category: 'Adventure & Nature',
      tier: 'rare',
      xp: 300,
      coins: 65,
      trigger: 'Unlock 5 different mystery chests',
      icon: 'wildlife_explorer.png'
    },
    {
      id: 'documentary_expert',
      title: 'Documentary Expert',
      tagline: 'Knowledge Hunter & Observer',
      category: 'Learning & Knowledge',
      tier: 'epic',
      xp: 380,
      coins: 75,
      trigger: 'Complete 3 learning quizzes with 100% score',
      icon: 'documentary_expert.png'
    },
    {
      id: 'award_winner',
      title: 'Award Winner',
      tagline: 'Golden Trophy Hall of Famer',
      category: 'Grand Achievement',
      tier: 'mythic',
      xp: 1000,
      coins: 250,
      trigger: 'Rank #1 on Leaderboard or collect all 14 stickers',
      icon: 'award_winner.png'
    }
  ];

  const TIER_CONFIG = {
    mythic: {
      label: 'MYTHIC',
      color: '#D65B62',
      bg: 'rgba(214,91,98,0.12)',
      badgeClass: 'tier-mythic'
    },
    legendary: {
      label: 'LEGENDARY',
      color: '#D99A35',
      bg: 'rgba(217,154,53,0.12)',
      badgeClass: 'tier-legendary'
    },
    epic: {
      label: 'EPIC',
      color: '#7C6ADB',
      bg: 'rgba(124,106,219,0.12)',
      badgeClass: 'tier-epic'
    },
    rare: {
      label: 'RARE',
      color: '#4F83CC',
      bg: 'rgba(79,131,204,0.12)',
      badgeClass: 'tier-rare'
    },
    common: {
      label: 'COMMON',
      color: '#22A06B',
      bg: 'rgba(34,160,107,0.12)',
      badgeClass: 'tier-common'
    }
  };

  const STORAGE_KEY = 'gamify_user_stickers_v1';

  function getStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // New players start with an empty passport; stamps are only added by earning them.
    return {};
  }

  function saveStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function injectStickerStyles() {
    if (document.getElementById('gamify-sticker-styles')) return;
    const style = document.createElement('style');
    style.id = 'gamify-sticker-styles';
    style.textContent = `
      @keyframes gmfStickerPop {
        0% { transform: scale(0.4) rotate(-10deg); opacity: 0; }
        60% { transform: scale(1.12) rotate(4deg); opacity: 1; }
        80% { transform: scale(0.96) rotate(-2deg); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      @keyframes gmfStickerFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-4px); }
      }
      @keyframes gmfConfettiFall {
        0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
      }

      .gmf-sticker-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(15, 17, 23, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
        font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #F1F3F5;
      }

      .gmf-sticker-card-wrap {
        position: relative;
        max-width: 440px;
        width: 100%;
        background: #1C2230;
        border: 1px solid #2B3240;
        border-radius: 12px;
        padding: 36px 28px 28px;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        animation: gmfStickerPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        overflow: hidden;
      }

      .gmf-sticker-img-box {
        position: relative;
        width: 190px;
        height: 180px;
        margin: 0 auto 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: gmfStickerFloat 3.5s ease-in-out infinite;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
        transition: transform 0.2s ease-out;
      }

      .gmf-sticker-img-box img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        transform: scale(1.05);
      }

      .gmf-sticker-tier-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-bottom: 12px;
      }

      .gmf-sticker-title {
        font-size: 24px;
        font-weight: 600;
        letter-spacing: -0.3px;
        margin: 0 0 6px;
        color: #F1F3F5;
      }

      .gmf-sticker-tagline {
        font-size: 14px;
        color: #9AA4B2;
        margin: 0 0 18px;
        font-weight: 400;
      }

      .gmf-sticker-rewards-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 22px;
      }

      .gmf-sticker-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #171B24;
        border: 1px solid #2B3240;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        color: #F1F3F5;
      }

      .gmf-sticker-trigger-box {
        background: #141820;
        border: 1px solid #2B3240;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 12px;
        color: #9AA4B2;
        margin-bottom: 22px;
        line-height: 1.4;
      }

      .gmf-sticker-btn-primary {
        width: 100%;
        padding: 10px 16px;
        border-radius: 6px;
        background: #4F83CC;
        border: none;
        color: #FFFFFF;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .gmf-sticker-btn-primary:hover {
        background: #6396D8;
      }
      .gmf-sticker-btn-primary:active {
        transform: translateY(1px);
      }

      .gmf-sticker-btn-secondary {
        width: 100%;
        margin-top: 10px;
        padding: 9px 16px;
        background: transparent;
        border: 1px solid #2B3240;
        border-radius: 6px;
        color: #9AA4B2;
        font-weight: 500;
        font-size: 13px;
        cursor: pointer;
        transition: border-color 0.15s ease, color 0.15s ease;
      }
      .gmf-sticker-btn-secondary:hover {
        border-color: #4F83CC;
        color: #F1F3F5;
      }

      /* Sticker Album Drawer */
      .gmf-album-modal {
        position: relative;
        max-width: 780px;
        width: 100%;
        max-height: 90vh;
        background: #0F1117;
        border: 1px solid #2B3240;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .gmf-album-header {
        padding: 24px 28px 18px;
        border-bottom: 1px solid #222836;
        background: #171B24;
      }

      .gmf-album-body {
        padding: 24px 28px;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 16px;
      }

      .gmf-album-item {
        position: relative;
        background: #171B24;
        border: 1px solid #222836;
        border-radius: 8px;
        padding: 14px 10px;
        text-align: center;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s;
      }
      .gmf-album-item:hover {
        transform: translateY(-2px);
        border-color: #2B3240;
      }

      .gmf-album-item.unlocked {
        border-color: #2B3240;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }
      .gmf-album-item.unlocked:hover {
        border-color: #4F83CC;
      }

      .gmf-album-item.locked {
        opacity: 0.55;
        filter: grayscale(0.85);
      }
      .gmf-album-item.locked:hover {
        opacity: 0.8;
      }

      .gmf-album-thumb {
        width: 84px;
        height: 84px;
        margin: 0 auto 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .gmf-album-thumb img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .gmf-album-item-name {
        font-size: 12px;
        font-weight: 500;
        color: #F1F3F5;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .gmf-album-item-xp {
        font-size: 10px;
        font-weight: 500;
        color: #9AA4B2;
        margin-top: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  function playCelebrationSound(soundEngine) {
    if (soundEngine && typeof soundEngine.playCredSlotWin === 'function') {
      soundEngine.playCredSlotWin();
      return;
    }
    // Web Audio synthesizer fallback for fanfare
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.45);
      });
    } catch (e) {}
  }

  function createConfettiBurst(parentEl) {
    const colors = ['#FFD700', '#FF3E6C', '#00E5FF', '#10B981', '#A855F7', '#FF7A00'];
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('div');
      p.style.position = 'absolute';
      p.style.top = '40%';
      p.style.left = '50%';
      p.style.width = `${Math.floor(Math.random() * 8 + 6)}px`;
      p.style.height = `${Math.floor(Math.random() * 12 + 6)}px`;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
      p.style.pointerEvents = 'none';
      p.style.zIndex = '10';

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 220 + 80;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance;

      p.animate([
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) scale(0.6) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], {
        duration: Math.random() * 800 + 800,
        easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
        fill: 'forwards'
      });

      parentEl.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    }
  }

  const GamifyStickers = {
    getAll() {
      return [...STICKER_DATA];
    },

    get(stickerId) {
      return STICKER_DATA.find(s => s.id === stickerId) || STICKER_DATA[0];
    },

    getUserStickers() {
      return getStorage();
    },

    isUnlocked(stickerId) {
      const store = getStorage();
      return !!store[stickerId];
    },

    /**
     * Stamp a sticker into the passport. Each sticker is earned once: if it is already stamped
     * nothing is shown and { isNew: false } is returned. A new stamp shows the celebration
     * (unless opts.silent) and returns { isNew: true }.
     */
    stamp(stickerId, opts = {}) {
      const sticker = STICKER_DATA.find(s => s.id === stickerId);
      if (!sticker) return { sticker: null, isNew: false };
      const store = getStorage();
      if (store[sticker.id]) return { sticker, isNew: false };
      store[sticker.id] = { unlockedAt: Date.now(), count: 1 };
      saveStorage(store);
      if (!opts.silent) showStampModal(sticker, store, opts);
      if (typeof opts.onStamp === 'function') opts.onStamp(sticker);
      return { sticker, isNew: true };
    },

    /** Kept for older callers: same as stamp(), returns the sticker. */
    unlock(stickerId, opts = {}) {
      return this.stamp(stickerId, opts).sticker;
    },

    /** Kept for older callers: opens the passport. */
    openAlbum(opts = {}) {
      return this.openPassport(opts);
    },

    /**
     * Sticker Passport: a booklet with holder details on the left page and a stamp page on the
     * right. Earned stickers appear as inked stamps with the date; others are empty slots that
     * show how to earn them. Clicking a stamp only shows its details.
     */
    openPassport(opts = {}) {
      injectStickerStyles();
      injectPassportStyles();
      const store = getStorage();
      const stickers = this.getAll();
      const baseUrl = opts.baseUrl || '';
      const earned = stickers.filter(s => store[s.id]);
      const totalXp = earned.reduce((acc, s) => acc + s.xp, 0);
      const totalCoins = earned.reduce((acc, s) => acc + s.coins, 0);
      const percent = Math.round((earned.length / stickers.length) * 100);
      const firstStamp = earned.length ? Math.min(...earned.map(s => store[s.id].unlockedAt)) : null;
      const fmt = (ts) => {
        const d = new Date(ts);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      };
      const stampDate = (ts) => {
        const d = new Date(ts);
        return `${String(d.getDate()).padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
      };
      const tilt = (i) => [-9, 6, -4, 10, -12, 3, 8, -6, 12, -2, 5, -10, 7, -7, 2][i % 15];

      const backdrop = document.createElement('div');
      backdrop.className = 'gmf-sticker-modal-backdrop';
      backdrop.innerHTML = `
        <div class="gmf-passport" role="dialog" aria-label="Sticker Passport">
          <button class="gmf-pp-close" id="gmfClosePassport" aria-label="Close passport">✕</button>
          <div class="gmf-pp-page gmf-pp-left">
            <div class="gmf-pp-kicker">Rewards Passport</div>
            <div class="gmf-pp-emblem">
              <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#B8862B" stroke-width="2.5"/><circle cx="32" cy="32" r="23" fill="none" stroke="#B8862B" stroke-width="1" stroke-dasharray="2 3"/><path d="M32 14l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#C9962F"/></svg>
            </div>
            <div class="gmf-pp-fields">
              <div><span>Holder</span><b>${opts.holderName || 'Gamify Player'}</b></div>
              <div><span>Stamps</span><b>${earned.length} / ${stickers.length}</b></div>
              <div><span>XP from stamps</span><b>+${totalXp}</b></div>
              <div><span>Coins from stamps</span><b>+${totalCoins}</b></div>
              <div><span>First stamp</span><b>${firstStamp ? fmt(firstStamp) : 'Not yet'}</b></div>
            </div>
            <div class="gmf-pp-progress"><div style="width:${percent}%"></div></div>
            <div class="gmf-pp-note">${percent}% complete. Win games, keep streaks and claim rewards to earn new stamps. Each stamp is earned once.</div>
            <div class="gmf-pp-detail" id="gmfPassportDetail">
              <div class="gmf-pp-detail-empty">Tap a stamp to see its details.</div>
            </div>
          </div>
          <div class="gmf-pp-page gmf-pp-right">
            <div class="gmf-pp-kicker">Stamps</div>
            <div class="gmf-pp-grid">
              ${stickers.map((s, i) => {
                const tier = TIER_CONFIG[s.tier] || TIER_CONFIG.common;
                const got = store[s.id];
                return got ? `
                  <button class="gmf-pp-stamp" data-id="${s.id}" style="--ink:${tier.color}; transform:rotate(${tilt(i)}deg);" aria-label="${s.title} stamp, earned ${fmt(got.unlockedAt)}">
                    <img src="${baseUrl}/assets/stickers/${s.icon}" alt="" />
                    <span class="gmf-pp-stamp-title">${s.title}</span>
                    <span class="gmf-pp-stamp-date">${stampDate(got.unlockedAt)}</span>
                  </button>` : `
                  <button class="gmf-pp-slot" data-id="${s.id}" aria-label="${s.title}, not earned yet">
                    <span class="gmf-pp-slot-q">?</span>
                    <span class="gmf-pp-stamp-title">${s.title}</span>
                  </button>`;
              }).join('')}
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);

      const close = () => backdrop.remove();
      backdrop.querySelector('#gmfClosePassport').onclick = close;
      backdrop.onclick = (e) => { if (e.target === backdrop) close(); };
      const detail = backdrop.querySelector('#gmfPassportDetail');
      backdrop.querySelectorAll('.gmf-pp-stamp, .gmf-pp-slot').forEach(el => {
        el.onclick = () => {
          const s = STICKER_DATA.find(x => x.id === el.getAttribute('data-id'));
          const got = store[s.id];
          const tier = TIER_CONFIG[s.tier] || TIER_CONFIG.common;
          detail.innerHTML = `
            <div class="gmf-pp-detail-title" style="color:${tier.color}">${s.title} <small>${tier.label}</small></div>
            <div class="gmf-pp-detail-tag">${s.tagline}</div>
            <div class="gmf-pp-detail-row">${got ? `Stamped on ${fmt(got.unlockedAt)}` : `How to earn: ${s.trigger}`}</div>
            <div class="gmf-pp-detail-row">Reward: +${s.xp} XP, +${s.coins} coins</div>`;
        };
      });
    }
  };

  // New-stamp celebration (shown once per sticker).
  function showStampModal(sticker, store, opts) {
    injectStickerStyles();
    const tier = TIER_CONFIG[sticker.tier] || TIER_CONFIG.common;
    const baseUrl = opts.baseUrl || '';
    playCelebrationSound(opts.sound);
    const backdrop = document.createElement('div');
    backdrop.className = 'gmf-sticker-modal-backdrop';
    backdrop.innerHTML = `
      <div class="gmf-sticker-card-wrap">
        <div class="gmf-rays-bg"></div>
        <div class="gmf-sticker-tier-badge" style="background:${tier.bg}; border:1px solid ${tier.color}; color:${tier.color}; box-shadow:${tier.glow};">
          <span>NEW PASSPORT STAMP · ${tier.label}</span>
        </div>
        <div class="gmf-sticker-img-box" id="gmfStickerCard">
          <img src="${baseUrl}/assets/stickers/${sticker.icon}" alt="${sticker.title}" />
        </div>
        <h2 class="gmf-sticker-title">${sticker.title}</h2>
        <div class="gmf-sticker-tagline">${sticker.tagline}</div>
        <div class="gmf-sticker-rewards-row">
          <div class="gmf-sticker-pill"><span style="color:#F59E0B;">⚡</span> +${sticker.xp} XP</div>
          <div class="gmf-sticker-pill"><span style="color:#10B981;">🪙</span> +${sticker.coins} Coins</div>
        </div>
        <div class="gmf-sticker-trigger-box">🎯 <strong>Earned by:</strong> ${sticker.trigger}</div>
        <button class="gmf-sticker-btn-primary" id="gmfCollectBtn">Stamp It</button>
        <button class="gmf-sticker-btn-secondary" id="gmfAlbumBtn">Open Passport (${Object.keys(store).length}/${STICKER_DATA.length})</button>
      </div>
    `;
    document.body.appendChild(backdrop);
    const cardWrap = backdrop.querySelector('.gmf-sticker-card-wrap');
    createConfettiBurst(cardWrap);
    const cardBox = backdrop.querySelector('#gmfStickerCard');
    backdrop.addEventListener('mousemove', (e) => {
      const rect = cardWrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cardBox.style.transform = `perspective(600px) rotateY(${x * 24}deg) rotateX(${-y * 24}deg) scale(1.08)`;
    });
    backdrop.querySelector('#gmfCollectBtn').onclick = () => {
      backdrop.style.opacity = '0';
      backdrop.style.transition = 'opacity 0.2s';
      setTimeout(() => backdrop.remove(), 200);
      if (typeof opts.onCollect === 'function') opts.onCollect(sticker);
    };
    backdrop.querySelector('#gmfAlbumBtn').onclick = () => {
      backdrop.remove();
      GamifyStickers.openPassport(opts);
    };
    backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };
  }

  function injectPassportStyles() {
    if (document.getElementById('gmf-passport-styles')) return;
    const st = document.createElement('style');
    st.id = 'gmf-passport-styles';
    st.textContent = `
      .gmf-passport { position:relative; width:min(760px, calc(100vw - 32px)); max-height:calc(100vh - 40px); display:grid; grid-template-columns: 1fr 1.25fr; border-radius:18px; overflow:hidden; background:#5A1424; padding:10px; box-shadow:0 30px 70px rgba(0,0,0,.55); font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color:#3A2A14; }
      .gmf-pp-page { position:relative; overflow:auto; padding:22px 20px; background-color:#F6EFD9; background-image: repeating-radial-gradient(circle at 30% 20%, rgba(184,134,43,.06) 0 2px, transparent 2px 9px), repeating-linear-gradient(45deg, rgba(90,20,36,.035) 0 1px, transparent 1px 7px); }
      .gmf-pp-left { border-radius:10px 2px 2px 10px; box-shadow: inset -14px 0 18px -14px rgba(0,0,0,.35); }
      .gmf-pp-right { border-radius:2px 10px 10px 2px; box-shadow: inset 14px 0 18px -14px rgba(0,0,0,.35); }
      .gmf-pp-close { position:absolute; top:16px; right:18px; z-index:3; width:30px; height:30px; border-radius:50%; border:none; background:rgba(90,20,36,.12); color:#5A1424; font-size:15px; cursor:pointer; }
      .gmf-pp-kicker { font-size:11px; font-weight:800; letter-spacing:2.5px; text-transform:uppercase; color:#8C2A3E; margin-bottom:12px; }
      .gmf-pp-emblem { width:72px; height:72px; margin:4px auto 12px; }
      .gmf-pp-fields { display:grid; gap:7px; font-size:12.5px; }
      .gmf-pp-fields div { display:flex; justify-content:space-between; border-bottom:1px dashed rgba(90,20,36,.25); padding-bottom:5px; }
      .gmf-pp-fields span { color:#7A6A50; text-transform:uppercase; font-size:10.5px; letter-spacing:1px; font-weight:700; }
      .gmf-pp-fields b { color:#3A2A14; }
      .gmf-pp-progress { height:7px; border-radius:4px; background:rgba(90,20,36,.12); margin:14px 0 8px; overflow:hidden; }
      .gmf-pp-progress div { height:100%; background:linear-gradient(90deg,#C9962F,#8C2A3E); border-radius:4px; }
      .gmf-pp-note { font-size:11.5px; line-height:1.45; color:#6A5A40; }
      .gmf-pp-detail { margin-top:14px; padding:12px; border-radius:10px; background:rgba(255,255,255,.55); border:1px solid rgba(90,20,36,.15); min-height:64px; font-size:12px; line-height:1.45; }
      .gmf-pp-detail-empty { color:#8A7A60; }
      .gmf-pp-detail-title { font-weight:900; font-size:14px; }
      .gmf-pp-detail-title small { font-size:9.5px; letter-spacing:1px; margin-left:4px; opacity:.8; }
      .gmf-pp-detail-tag { color:#6A5A40; margin:2px 0 6px; }
      .gmf-pp-detail-row { color:#3A2A14; }
      .gmf-pp-grid { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:16px 12px; padding:6px 4px; }
      .gmf-pp-right { overflow-x:hidden; }
      .gmf-pp-stamp, .gmf-pp-slot { position:relative; min-width:0; overflow:hidden; aspect-ratio: 1 / 1.08; border-radius:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer; font-family:inherit; padding:6px; background:transparent; }
      .gmf-pp-stamp { border:3px double var(--ink); color:var(--ink); background: radial-gradient(circle, rgba(255,255,255,.35), transparent 70%); mix-blend-mode:multiply; opacity:.95; animation: gmfStampIn .35s ease both; }
      .gmf-pp-stamp::after { content:''; position:absolute; inset:5px; border:1.2px solid var(--ink); border-radius:10px; opacity:.55; pointer-events:none; }
      .gmf-pp-stamp img { width:58%; height:auto; filter: saturate(1.1) contrast(1.05); }
      .gmf-pp-stamp-title { font-size:9px; font-weight:900; letter-spacing:.4px; text-transform:uppercase; text-align:center; line-height:1.15; max-width:100%; overflow-wrap:anywhere; }
      .gmf-pp-stamp-date { font-size:8.5px; font-weight:800; letter-spacing:1px; padding:1px 5px; border:1px solid var(--ink); border-radius:4px; }
      .gmf-pp-slot { border:2px dashed rgba(90,20,36,.22); color:rgba(90,20,36,.38); }
      .gmf-pp-slot-q { font-size:28px; font-weight:900; font-family: Georgia, serif; }
      .gmf-pp-stamp:focus-visible, .gmf-pp-slot:focus-visible { outline:2px solid #8C2A3E; outline-offset:3px; }
      @keyframes gmfStampIn { from { transform: scale(1.3); opacity:0; } }
      @media (max-width: 640px) { .gmf-passport { grid-template-columns: 1fr; overflow:auto; } .gmf-pp-left, .gmf-pp-right { border-radius:10px; box-shadow:none; } .gmf-pp-right { margin-top:8px; } }
      @media (prefers-reduced-motion: reduce) { .gmf-pp-stamp { animation:none; } }
    `;
    document.head.appendChild(st);
  }

  // Attach to window
  window.GamifyStickers = GamifyStickers;
})(window, document);
