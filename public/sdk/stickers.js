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
    // default unlocked sample stickers for fun onboarding
    const initial = {
      kids_zone: { unlockedAt: Date.now() - 86400000 * 2, count: 1 },
      binge_watcher: { unlockedAt: Date.now() - 3600000 * 5, count: 1 }
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(initial)); } catch(e) {}
    return initial;
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
     * Unlock a sticker reward with celebration modal
     */
    unlock(stickerId, opts = {}) {
      injectStickerStyles();
      const sticker = this.get(stickerId);
      const store = getStorage();

      const isFirstTime = !store[sticker.id];
      store[sticker.id] = {
        unlockedAt: Date.now(),
        count: (store[sticker.id]?.count || 0) + 1
      };
      saveStorage(store);

      const tier = TIER_CONFIG[sticker.tier] || TIER_CONFIG.common;
      const baseUrl = opts.baseUrl || '';
      const iconPath = `${baseUrl}/assets/stickers/${sticker.icon}`;

      playCelebrationSound(opts.sound);

      // Create modal overlay
      const backdrop = document.createElement('div');
      backdrop.className = 'gmf-sticker-modal-backdrop';

      backdrop.innerHTML = `
        <div class="gmf-sticker-card-wrap">
          <div class="gmf-rays-bg"></div>

          <div class="gmf-sticker-tier-badge" style="background:${tier.bg}; border:1px solid ${tier.color}; color:${tier.color}; box-shadow:${tier.glow};">
            <span>✨ ${tier.label} STICKER</span>
          </div>

          <div class="gmf-sticker-img-box" id="gmfStickerCard">
            <img src="${iconPath}" alt="${sticker.title}" />
          </div>

          <h2 class="gmf-sticker-title">${sticker.title}</h2>
          <div class="gmf-sticker-tagline">${sticker.tagline}</div>

          <div class="gmf-sticker-rewards-row">
            <div class="gmf-sticker-pill">
              <span style="color:#F59E0B;">⚡</span> +${sticker.xp} XP
            </div>
            <div class="gmf-sticker-pill">
              <span style="color:#10B981;">🪙</span> +${sticker.coins} Coins
            </div>
          </div>

          <div class="gmf-sticker-trigger-box">
            🎯 <strong>Unlocked via:</strong> ${sticker.trigger}
          </div>

          <button class="gmf-sticker-btn-primary" id="gmfCollectBtn">
            🎉 Collect & Add to Album
          </button>
          <button class="gmf-sticker-btn-secondary" id="gmfAlbumBtn">
            📖 View Sticker Album (${Object.keys(store).length}/15)
          </button>
        </div>
      `;

      document.body.appendChild(backdrop);
      const cardWrap = backdrop.querySelector('.gmf-sticker-card-wrap');
      createConfettiBurst(cardWrap);

      // Dynamic tilt on mouse move
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
        GamifyStickers.openAlbum(opts);
      };

      backdrop.onclick = (e) => {
        if (e.target === backdrop) {
          backdrop.remove();
        }
      };

      return sticker;
    },

    /**
     * Open full Sticker Collector Album Drawer
     */
    openAlbum(opts = {}) {
      injectStickerStyles();
      const store = getStorage();
      const stickers = this.getAll();
      const baseUrl = opts.baseUrl || '';

      const unlockedCount = Object.keys(store).length;
      const totalXp = stickers.reduce((acc, s) => acc + (store[s.id] ? s.xp : 0), 0);
      const percent = Math.round((unlockedCount / stickers.length) * 100);

      const backdrop = document.createElement('div');
      backdrop.className = 'gmf-sticker-modal-backdrop';

      backdrop.innerHTML = `
        <div class="gmf-album-modal">
          <div class="gmf-album-header">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
              <div>
                <h2 style="margin:0; font-size:22px; font-weight:800; display:flex; align-items:center; gap:8px;">
                  <span>📖</span> Sticker Collector Album
                </h2>
                <div style="color:#94A3B8; font-size:13px; margin-top:3px;">
                  Complete milestones, daily streaks, spins and referrals to unlock all 15 stickers!
                </div>
              </div>
              <button id="gmfCloseAlbum" style="background:rgba(255,255,255,0.08); border:none; color:#CBD5E1; width:34px; height:34px; border-radius:50%; font-size:18px; cursor:pointer;">✕</button>
            </div>

            <!-- Stats Bar -->
            <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:12px 18px; display:flex; align-items:center; justify-content:space-between;">
              <div>
                <div style="font-size:11px; color:#94A3B8; text-transform:uppercase; font-weight:700;">Album Progress</div>
                <div style="font-size:18px; font-weight:900; color:#F8FAFC;">${unlockedCount} / ${stickers.length} <span style="font-size:13px; color:#F59E0B;">(${percent}%)</span></div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:11px; color:#94A3B8; text-transform:uppercase; font-weight:700;">Earned Sticker XP</div>
                <div style="font-size:18px; font-weight:900; color:#10B981;">+${totalXp} XP</div>
              </div>
            </div>

            <!-- Progress line -->
            <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:3px; margin-top:12px; overflow:hidden;">
              <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, #F59E0B, #EC4899); border-radius:3px; transition:width 0.4s ease;"></div>
            </div>
          </div>

          <div class="gmf-album-body" id="gmfAlbumGrid">
            ${stickers.map(s => {
              const unlocked = !!store[s.id];
              const tier = TIER_CONFIG[s.tier] || TIER_CONFIG.common;
              const iconPath = `${baseUrl}/assets/stickers/${s.icon}`;

              return `
                <div class="gmf-album-item ${unlocked ? 'unlocked' : 'locked'}" data-id="${s.id}" style="${unlocked ? `border-color:${tier.color};` : ''}">
                  <div class="gmf-album-thumb">
                    <img src="${iconPath}" alt="${s.title}" style="${unlocked ? '' : 'filter: grayscale(1) brightness(0.25);'}" />
                  </div>
                  <div class="gmf-album-item-name">${s.title}</div>
                  <div class="gmf-album-item-xp" style="color:${tier.color};">
                    ${unlocked ? `✓ Unlocked` : `🔒 ${tier.label}`}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="padding:14px 28px; border-top:1px solid rgba(255,255,255,0.08); background:#0F172A; display:flex; align-items:center; justify-content:space-between;">
            <div style="font-size:12px; color:#94A3B8;">Click any sticker to inspect unlock criteria & rewards</div>
            <button id="gmfTestUnlockBtn" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#F8FAFC; padding:6px 14px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer;">
              ⚡ Unlock Random Sticker
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);

      backdrop.querySelector('#gmfCloseAlbum').onclick = () => backdrop.remove();
      backdrop.onclick = (e) => {
        if (e.target === backdrop) backdrop.remove();
      };

      // Test unlock random
      backdrop.querySelector('#gmfTestUnlockBtn').onclick = () => {
        backdrop.remove();
        const rand = stickers[Math.floor(Math.random() * stickers.length)];
        GamifyStickers.unlock(rand.id, opts);
      };

      // Click sticker item to inspect
      backdrop.querySelectorAll('.gmf-album-item').forEach(el => {
        el.onclick = () => {
          const sid = el.getAttribute('data-id');
          backdrop.remove();
          GamifyStickers.unlock(sid, opts);
        };
      });
    }
  };

  // Attach to window
  window.GamifyStickers = GamifyStickers;
})(window, document);
