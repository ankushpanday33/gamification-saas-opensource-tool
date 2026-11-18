/**
 * GamifyWidgets — 1:1 Screen-Recording-Accurate Widget Renderer
 * Renders all extracted gamification widgets cleanly into any DOM element with full live customization.
 */
(function (window, document) {
  'use strict';

  function injectSharedStyles() {
    if (document.getElementById('gamify-widgets-css')) return;
    const style = document.createElement('style');
    style.id = 'gamify-widgets-css';
    style.textContent = `
      .gw-phone-frame {
        width: 340px;
        min-height: 540px;
        border-radius: 16px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px #2B3240;
        font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        user-select: none;
        display: flex;
        flex-direction: column;
        background: #0F1117;
      }
      .gw-btn-press:active { transform: translateY(1px); }
      @keyframes gwSunburstSpin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes gwFloatCoin {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-4px); }
      }
      @keyframes gwPointHand {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(4px, -2px); }
      }
      @keyframes gwToastSlide {
        0% { transform: translateY(-70px); opacity: 0; }
        12%, 85% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-70px); opacity: 0; }
      }
      @keyframes gwStarburstExpand {
        0% { transform: translate(-50%, -50%) scale(0.05); opacity: 1; }
        55% { transform: translate(-50%, -50%) scale(2.5); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; }
      }
      @keyframes gwCoinFly {
        0% { transform: translate(0, 0) scale(0.6); opacity: 1; }
        45% { transform: translate(var(--tx-mid), -100px) scale(1); opacity: 1; }
        100% { transform: translate(var(--tx-end), -220px) scale(0.45); opacity: 0; }
      }
      @keyframes gwPopIn {
        0% { transform: scale(0.7); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .gw-replay-chip {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 60;
        background: #171B24;
        border: 1px solid #2B3240;
        color: #9AA4B2;
        font-size: 11px;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'IBM Plex Sans', sans-serif;
      }
      .gw-replay-chip:hover {
        background: #232A36;
        color: #F1F3F5;
        border-color: #4F83CC;
      }
    `;
    document.head.appendChild(style);
  }

  function fireConfetti(colors) {
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 75,
        spread: 75,
        origin: { y: 0.55 },
        colors: colors || ['#FFC800', '#00E599', '#1CB0F6', '#FF4B4B']
      });
    }
  }

  // =========================================================================
  // 1. ZEPTO SCRATCH CARD (ScreenRecording_11-09-2026 21-26-22_1.mp4)
  // =========================================================================
  const ZS_CSS = `
    .zs-stage { background: radial-gradient(ellipse 75% 45% at 50% 58%, #5B1FA3 0%, #34106A 45%, transparent 75%), linear-gradient(180deg,#1B1036 0%,#22104A 50%,#170B2E 100%) !important; color:#fff; padding: 22px 18px 28px !important; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; }
    .zs-reset { position:absolute; top:14px; right:14px; height:34px; padding: 0 14px; border-radius:12px; border:1.5px solid rgba(190,160,255,.35); background: rgba(20,10,40,.6); color:#E8E0FF; font-family:inherit; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; cursor:pointer; z-index:5; }
    .zs-reset svg { width:16px; height:16px; }
    .zs-icon { width:58px; height:58px; margin-top:36px; border-radius:16px; background: rgba(60,30,110,.55); border:1.5px solid rgba(190,160,255,.25); display:flex; align-items:center; justify-content:center; box-shadow: 0 6px 16px rgba(0,0,0,.35); }
    .zs-icon svg { width:38px; height:38px; }
    .zs-eyebrow { margin-top:14px; font-size:19px; font-weight:700; color:#E9DEFF; }
    .zs-title { margin-top:12px; font-size:23px; font-weight:900; letter-spacing:-.2px; text-align:center; line-height:1.2; }
    .zs-title b { color:#FFC233; }
    .zs-card-wrap { position:relative; width:270px; height:270px; margin-top:30px; }
    .zs-card { position:absolute; inset:0; border-radius:28px; background:#fff; padding:18px 16px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; text-align:center; box-shadow: 0 0 0 2px rgba(226,180,255,.75), 0 0 44px rgba(150,70,255,.55), 0 20px 40px rgba(0,0,0,.45); }
    .zs-badge { background:#14141F; color:#fff; font-size:14px; font-weight:900; padding:6px 14px; border-radius:10px; letter-spacing:.3px; }
    .zs-reward { font-size:17px; font-weight:900; color:#161622; line-height:1.25; }
    .zs-sub { font-size:11.5px; color:#475569; margin-top:5px; font-weight:600; }
    .zs-foot { font-size:10.5px; color:#94A3B8; margin-top:3px; }
    .zs-code { width:100%; border:1.5px dashed #CBD5E1; background:#F8FAFC; border-radius:10px; padding:8px 10px; font-size:12px; font-weight:800; color:#334155; letter-spacing:.6px; }
    .zs-canvas { position:absolute; inset:0; width:100%; height:100%; border-radius:28px; cursor:grab; touch-action:none; z-index:3; transition: opacity .45s ease, transform .45s ease; box-shadow: 0 0 0 2px rgba(226,180,255,.75); }
    .zs-canvas.gone { opacity:0; transform: scale(1.04); pointer-events:none; }
    .zs-spark { position:absolute; width:34px; height:34px; z-index:4; pointer-events:none; }
    .zs-cta { margin-top:26px; width:270px; height:50px; border-radius:16px; border:none; color:#fff; font-family:inherit; font-size:16px; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; opacity:0; transform: translateY(10px); pointer-events:none; transition: all .3s ease; }
    .zs-cta.show { opacity:1; transform:none; pointer-events:auto; }
  `;

  // Pointing hand (index finger up) as an SVG path, drawn onto the canvas foil with Path2D.
  const ZS_HAND = 'M18 31V9a4 4 0 0 1 8 0v15v-4a3.5 3.5 0 0 1 7 0v5v-2a3.5 3.5 0 0 1 7 0v4v0a3 3 0 0 1 6 0v12c0 8-6 14-14 14h-6c-6 0-10-4-14-10l-6-9a3.5 3.5 0 0 1 6-4l6 5z';

  function renderZeptoScratch(mount, widget, ctx) {
    const c = widget.config;
    const snd = ctx.sound;
    const soundOn = c.soundEnabled !== false;
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    // Title highlight: wrap the gold word in *stars*, e.g. "Get Your *Reward* Inside!".
    const titleHtml = esc(c.headerTitle || 'Get Your *Reward* Inside!').replace(/\*([^*]+)\*/g, '<b>$1</b>');
    const ctaColor = c.ctaColor || '#F93262';

    if (!document.getElementById('zs-styles')) {
      const st = document.createElement('style');
      st.id = 'zs-styles';
      st.textContent = ZS_CSS;
      document.head.appendChild(st);
    }

    const spark = `<svg viewBox="0 0 34 34"><path d="M20 4l-2 7M8 9l6 5M4 22l8-2" stroke="#FFB61E" stroke-width="3.2" stroke-linecap="round"/></svg>`;

    mount.innerHTML = `
      <div class="gw-phone-frame zs-stage">
        <button class="zs-reset" id="zeptoResetBtn"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>Reset</button>

        <div class="zs-icon">
          <svg viewBox="0 0 48 48">
            <path d="M6 44l9-26 15 15z" fill="#FFB61E"/><path d="M6 44l9-26 4 4-8 21z" fill="#FFD25A"/><path d="M11 30l9 9M14 24l11 11" stroke="#E5487B" stroke-width="2.6"/>
            <path d="M26 20c2-5 7-6 9-11" stroke="#7C5CFF" stroke-width="2.4" fill="none" stroke-linecap="round"/>
            <path d="M29 26c5-1 9 2 14-1" stroke="#FF5C8A" stroke-width="2.4" fill="none" stroke-linecap="round"/>
            <path d="M22 13c-1-4 1-7 0-10" stroke="#2EC4B6" stroke-width="2.4" fill="none" stroke-linecap="round"/>
            <circle cx="38" cy="15" r="2" fill="#FFD25A"/><circle cx="31" cy="6" r="1.8" fill="#FF5C8A"/><circle cx="42" cy="33" r="1.8" fill="#7C5CFF"/><circle cx="17" cy="8" r="1.6" fill="#FFD25A"/><circle cx="36" cy="38" r="1.5" fill="#2EC4B6"/>
          </svg>
        </div>
        <div class="zs-eyebrow">${esc(c.headerEyebrow || 'Congratulations!')}</div>
        <div class="zs-title">${titleHtml}</div>

        <div class="zs-card-wrap">
          <svg class="zs-spark" style="left:-30px; top:-14px;" viewBox="0 0 34 34">${spark.replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
          <svg class="zs-spark" style="right:-32px; bottom:44px; transform: rotate(180deg);" viewBox="0 0 34 34">${spark.replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
          <div class="zs-card">
            <div class="zs-badge">${esc(c.brandBadge || 'uni•')}</div>
            <div>
              <div class="zs-reward">${esc(c.rewardTitle || 'Lifetime Free Rupay Card')}</div>
              <div class="zs-sub">${esc(c.rewardSubtitle || '5% back on Zepto + 1% back on UPI!')}</div>
              <div class="zs-foot">${esc(c.rewardFootnote || 'No minimum spends')}</div>
            </div>
            <div class="zs-code">${esc(c.couponCode || 'NO CODE NEEDED')}</div>
          </div>
          <canvas class="zs-canvas" id="zeptoCanvas"></canvas>
        </div>

        <button class="zs-cta" id="zeptoClaimBtn" style="background:${esc(ctaColor)}; box-shadow: 0 8px 24px ${esc(ctaColor)}66;"><i class="fa-solid fa-gift"></i> ${esc(c.ctaText || 'Claim now')}</button>
      </div>
    `;

    const canvas = mount.querySelector('#zeptoCanvas');
    const claimBtn = mount.querySelector('#zeptoClaimBtn');
    const SIZE = 270;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const zctx = canvas.getContext('2d', { willReadFrequently: true });
    zctx.scale(dpr, dpr);
    let revealed = false;
    let drawing = false;
    let last = null;
    let lastSound = 0;
    let movesSinceCheck = 0;

    function roundRect(x, y, w, h, r) {
      zctx.beginPath();
      zctx.moveTo(x + r, y);
      zctx.arcTo(x + w, y, x + w, y + h, r);
      zctx.arcTo(x + w, y + h, x, y + h, r);
      zctx.arcTo(x, y + h, x, y, r);
      zctx.arcTo(x, y, x + w, y, r);
      zctx.closePath();
    }

    function drawFoil() {
      revealed = false;
      canvas.classList.remove('gone');
      claimBtn.classList.remove('show');
      claimBtn.innerHTML = `<i class="fa-solid fa-gift"></i> ${esc(c.ctaText || 'Claim now')}`;

      zctx.save();
      zctx.globalCompositeOperation = 'source-over';
      zctx.clearRect(0, 0, SIZE, SIZE);
      roundRect(0, 0, SIZE, SIZE, 28);
      zctx.clip();

      const grad = zctx.createLinearGradient(0, 0, SIZE * 0.3, SIZE);
      grad.addColorStop(0, c.foilTopColor || '#DF7DFF');
      grad.addColorStop(0.45, '#A653F0');
      grad.addColorStop(1, c.foilBottomColor || '#7E35C6');
      zctx.fillStyle = grad;
      zctx.fillRect(0, 0, SIZE, SIZE);

      // Glossy top sheen
      const sheen = zctx.createLinearGradient(0, 0, 0, SIZE * 0.5);
      sheen.addColorStop(0, 'rgba(255,255,255,0.22)');
      sheen.addColorStop(1, 'rgba(255,255,255,0)');
      zctx.fillStyle = sheen;
      zctx.fillRect(0, 0, SIZE, SIZE * 0.5);

      // Brush-stroke texture behind the text
      [[135, 92, 122, 28, -0.42, 0.32], [150, 128, 130, 32, -0.4, 0.28], [125, 160, 128, 30, -0.45, 0.3], [145, 192, 112, 26, -0.42, 0.26], [112, 118, 92, 22, -0.5, 0.22], [168, 165, 96, 24, -0.38, 0.22]].forEach(([x, y, rx, ry, rot, a]) => {
        zctx.save();
        zctx.translate(x, y);
        zctx.rotate(rot);
        const g = zctx.createLinearGradient(-rx, 0, rx, 0);
        g.addColorStop(0, 'rgba(215,160,255,0)');
        g.addColorStop(0.25, `rgba(205,150,255,${a})`);
        g.addColorStop(0.75, `rgba(175,105,250,${a})`);
        g.addColorStop(1, 'rgba(175,105,250,0)');
        zctx.fillStyle = g;
        zctx.beginPath();
        zctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        zctx.fill();
        // fine bristle lines
        zctx.strokeStyle = `rgba(255,255,255,${a * 0.5})`;
        zctx.lineWidth = 0.8;
        for (let k = -2; k <= 2; k++) {
          zctx.beginPath();
          zctx.moveTo(-rx * 0.8, k * ry * 0.35);
          zctx.lineTo(rx * 0.8, k * ry * 0.35 + 2);
          zctx.stroke();
        }
        zctx.restore();
      });

      // "Scratch Here"
      zctx.fillStyle = '#FFFFFF';
      zctx.textAlign = 'center';
      zctx.textBaseline = 'alphabetic';
      zctx.shadowColor = 'rgba(70,10,140,0.35)';
      zctx.shadowBlur = 8;
      zctx.shadowOffsetY = 2;
      zctx.font = 'italic 900 44px Arial, "Helvetica Neue", sans-serif';
      zctx.fillText(c.foilLine1 || 'Scratch', SIZE / 2, 102);
      zctx.fillText(c.foilLine2 || 'Here', SIZE / 2, 146);
      zctx.shadowColor = 'transparent';

      // Tap hand with ripple arcs
      zctx.save();
      zctx.translate(SIZE / 2 - 24, 154);
      zctx.strokeStyle = '#FFFFFF';
      zctx.lineWidth = 3;
      zctx.lineJoin = 'round';
      zctx.lineCap = 'round';
      zctx.fillStyle = 'rgba(255,255,255,0.12)';
      const hand = new Path2D(ZS_HAND);
      zctx.fill(hand);
      zctx.stroke(hand);
      [8, 13].forEach((r) => {
        zctx.beginPath();
        zctx.arc(22, 9, r, Math.PI * 1.1, Math.PI * 1.9);
        zctx.stroke();
      });
      zctx.restore();

      // Brand wordmark
      zctx.fillStyle = '#FFFFFF';
      zctx.font = '900 25px Arial, "Helvetica Neue", sans-serif';
      zctx.fillText(c.brandWatermark || 'zepto', SIZE / 2, 244);
      zctx.restore();
    }

    function clearedFraction() {
      // Sample the foil alpha on a grid to measure how much has been scratched away.
      const data = zctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const step = Math.max(4, Math.round(8 * dpr));
      let total = 0;
      let clear = 0;
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          total++;
          if (data[(y * canvas.width + x) * 4 + 3] < 40) clear++;
        }
      }
      return clear / total;
    }

    function reveal() {
      if (revealed) return;
      revealed = true;
      drawing = false;
      canvas.classList.add('gone');
      claimBtn.classList.add('show');
      if (soundOn) snd.playRewardChime();
      fireConfetti(['#D96BFF', '#F93262', '#FFC233', '#FFFFFF']);
      ctx.emit('zepto_scratch_revealed', { widgetId: widget.id });
    }

    function scratchTo(x, y) {
      if (revealed) return;
      zctx.save();
      zctx.globalCompositeOperation = 'destination-out';
      zctx.lineWidth = 46;
      zctx.lineCap = 'round';
      zctx.beginPath();
      zctx.moveTo(last ? last.x : x, last ? last.y : y);
      zctx.lineTo(x, y);
      zctx.stroke();
      zctx.restore();
      last = { x, y };
      const now = performance.now();
      if (soundOn && now - lastSound > 90) { lastSound = now; snd.playScratchFoil(); }
      if (++movesSinceCheck >= 6) {
        movesSinceCheck = 0;
        if (clearedFraction() * 100 >= Number(c.scratchThresholdPercent || 45)) reveal();
      }
    }

    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
    };
    canvas.onpointerdown = (e) => {
      e.preventDefault();
      drawing = true;
      last = null;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      const p = pos(e);
      scratchTo(p.x, p.y);
    };
    canvas.onpointermove = (e) => { if (drawing) { const p = pos(e); scratchTo(p.x, p.y); } };
    canvas.onpointerup = canvas.onpointercancel = () => {
      drawing = false;
      last = null;
      if (!revealed && clearedFraction() * 100 >= Number(c.scratchThresholdPercent || 45)) reveal();
    };

    drawFoil();
    mount.querySelector('#zeptoResetBtn').onclick = drawFoil;
    claimBtn.onclick = () => {
      if (soundOn) snd.playToastPop();
      claimBtn.innerHTML = `<i class="fa-solid fa-check"></i> Claimed!`;
      ctx.emit('zepto_reward_claimed', { widgetId: widget.id });
    };
  }

  // =========================================================================
  // 2. MYNAKSH DAILY CHECK-IN & REWARDS HUB (1:1 with Screenshot & Recording)
  // =========================================================================
  function renderMynakshCheckin(mount, widget, ctx) {
    const c = widget.config;
    const snd = ctx.sound;
    const cur = c.currencySymbol || '₹';
    const rewards = Array.isArray(c.dayRewards) ? c.dayRewards : [5, 7, 9, 11, 13, 15, 17];
    let activeDay = Math.min(Math.max(1, Number(c.activeDay || 1)), 7);
    let walletBalance = Number(c.walletBalance || 30);
    let mantraClaimed = false;
    let viewState = c.initialView || 'rewards_hub'; // 'rewards_hub' | 'celebrate' | 'modal'

    // Claim celebration: the coin reward popup from the Coin Wallet kit (RewardBurstModal in
    // packages/coins-streak), shown over the rewards page. OK adds the amount to the wallet.
    let burstOpen = false;
    function showClaimBurst() {
      if (burstOpen) return;
      const earned = Number(rewards[activeDay - 1] ?? 5);
      const frame = mount.querySelector('.gw-phone-frame');
      const done = () => {
        burstOpen = false;
        walletBalance += earned;
        if (c.soundEnabled !== false) snd.playToastPop();
        renderView();
      };
      burstOpen = true;
      loadCoinsStreak(ctx.baseUrl)
        .then((lib) => {
          if (!frame || !frame.isConnected) { burstOpen = false; return; }
          lib.showRewardBurst(frame, {
            amount: earned,
            prefix: '+' + cur,
            title: c.claimPopupTitle || 'You earned coins!',
            ctaLabel: c.claimPopupCta || 'OK',
            primaryColor: c.claimPopupColor || '#FF6623',
            sound: false, // the claim already plays the coin cascade sound
            onClose: done
          });
        })
        .catch(done);
    }

    function renderView() {
      if (viewState === 'celebrate') {
        viewState = 'rewards_hub';
        renderView();
        showClaimBurst();
        return;
      } else if (viewState === 'modal') {
        // Daily check-in bottom sheet over the dimmed MyNaksh home screen (matches the real app):
        // cream sheet with a green glow top-left and a dotted star pattern at the bottom, day cards
        // (claimed = green with a check, today = green outline with a gold star coin, upcoming = grey
        // with a silver star coin) and a full width claim button.
        const A = '/assets/mynaksh';
        const makeDay = (idx) => {
          const dayNum = idx + 1;
          const state = dayNum < activeDay ? 'done' : dayNum === activeDay ? 'today' : 'next';
          const amt = rewards[idx] ?? 5;
          const box = {
            done: 'background: linear-gradient(180deg, #D6EED2 0%, #A8D8A2 100%);',
            today: `background: #F1F1F0; border: 2.5px solid ${c.highlightColor || '#6CBB6C'};`,
            next: 'background: linear-gradient(180deg, #F2F2F1 0%, #E3E3E2 100%);'
          }[state];
          const badge = state === 'done'
            ? '<span style="position:absolute; left:50%; bottom:-11px; transform:translateX(-50%); width:22px; height:22px; border-radius:50%; background:#1E8E2A; border:2px solid #FBFAF7; box-sizing:border-box; display:flex; align-items:center; justify-content:center; color:#FFF; font-size:12px; font-weight:900; line-height:1;">&#10003;</span>'
            : `<img src="${A}/${state === 'today' ? 'coincurrent' : 'coinupcoming'}.png" alt="" style="position:absolute; left:50%; bottom:-12px; transform:translateX(-50%); width:24px; height:auto;" />`;
          return `
            <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
              <span style="font-size:10px; font-weight:700; color:#B07F54;">Day ${dayNum}</span>
              <div style="position:relative; width:50px; height:54px; border-radius:10px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; ${box}">
                <span style="font-size:15px; font-weight:800; color:#1B1B1B; margin-top:-6px;">${cur}${amt}</span>
                ${badge}
              </div>
            </div>`;
        };
        const story = (label, bg, inner) => `
          <div style="flex:none; width:56px; text-align:center;">
            <div style="width:54px; height:70px; border-radius:27px; box-sizing:border-box; padding:3px; background:linear-gradient(180deg,#B8683F,#7A3C28);">
              <div style="width:100%; height:100%; border-radius:24px; background:${bg}; display:flex; align-items:center; justify-content:center; overflow:hidden; font-size:18px;">${inner}</div>
            </div>
            <div style="margin-top:7px; font-size:10px; color:#C9D0E8; white-space:nowrap;">${label}</div>
          </div>`;

        mount.innerHTML = `
          <div class="gw-phone-frame" style="background:#F4F2ED; height:640px; position:relative; overflow:hidden; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;">
            <!-- Home screen behind the sheet -->
            <div style="background:linear-gradient(180deg,#242D56 0%,#1B2342 100%); border-radius:0 0 16px 16px; padding:16px 14px 14px; height:250px; box-sizing:border-box; position:relative;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:22px;">
                <div style="display:flex; align-items:center; gap:9px;">
                  <div style="width:34px; height:34px; border-radius:50%; background:#8F4B3A; position:relative; overflow:hidden; border:1.5px solid rgba(255,255,255,0.15);">
                    <div style="position:absolute; left:11px; top:6px; width:12px; height:12px; border-radius:50%; background:#2B1712;"></div>
                    <div style="position:absolute; left:5px; top:19px; width:24px; height:20px; border-radius:50%; background:#2B1712;"></div>
                  </div>
                  <div>
                    <div style="font-size:12.5px; font-weight:700; color:#FFFFFF; line-height:1.25;">Namaste Ankush,</div>
                    <div style="font-size:10.5px; color:#AEB6D3; line-height:1.3;">Good Afternoon</div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.09); border-radius:10px; padding:6px 7px 6px 11px;">
                  <div style="line-height:1.15;"><div style="font-size:8.5px; color:#AEB6D3;">Wallet</div><div style="font-size:14px; font-weight:800; color:#FFFFFF;">${cur}${walletBalance}</div></div>
                  <div style="width:24px; height:24px; border-radius:7px; background:#A0482B; color:#FFF; font-size:17px; display:flex; align-items:center; justify-content:center;">+</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:14px; color:#B9A27F; font-size:9.5px; letter-spacing:2.6px; font-weight:700;">
                <span style="flex:1; height:1px; background:rgba(255,255,255,0.14);"></span>&#10022; YOUR DAILY NAKSH &#10022;<span style="flex:1; height:1px; background:rgba(255,255,255,0.14);"></span>
              </div>
              <div style="display:flex; gap:6px; overflow:hidden; margin-right:-14px;">
                ${story('Rashifal', 'radial-gradient(circle at 50% 55%, #D8D2C4 0 28%, #BDB3A0 29% 55%, #8E8573 56%)', '<span style="width:20px;height:20px;border-radius:50%;background:#8B2F8F;display:block;margin-top:14px;"></span>')}
                ${story('Panchang', '#6A5A48', '<span style="font-size:20px;">&#128209;</span>')}
                ${story('New', `url(${A}/rudraksh.png) center/cover, #3E4A33`, '')}
                ${story('Mere Dev', 'linear-gradient(180deg,#5A2E1E,#8C4A1E)', '<span style="font-size:20px;">&#128591;</span>')}
                ${story('Sadhana', '#141A2C', '')}
              </div>
            </div>
            <div style="padding:16px 14px;">
              <div style="display:flex; align-items:center; gap:9px; margin-bottom:12px;">
                <div style="width:26px; height:26px; border-radius:50%; background:#E39A3A; color:#FFF; font-size:13px; font-weight:900; display:flex; align-items:center; justify-content:center;">%</div>
                <div style="font-size:16px; font-weight:800; color:#1E1B18;">Today for you</div>
              </div>
              <div style="background:#FFF6E8; border-radius:14px; height:110px; padding:12px; display:flex; gap:12px;">
                <div style="width:70px; height:70px; border-radius:10px; background:linear-gradient(135deg,#C98B52,#8E4B2E);"></div>
                <div style="font-size:17px; font-weight:800; color:#1E1B18;">Marriage Report</div>
              </div>
            </div>

            <div style="position:absolute; inset:0; background:rgba(0,0,0,0.42);"></div>
            <button class="gw-replay-chip" id="mnSwitchHubToPage" style="z-index:12; top:auto; bottom:2px; right:8px;"><i class="fa-solid fa-mobile-screen"></i> Rewards Page</button>

            <!-- Bottom sheet -->
            <div style="position:absolute; left:14px; right:14px; bottom:26px; z-index:10; border-radius:18px; box-sizing:border-box; padding:16px 16px 16px; background: url(${A}/topglow.png) top left / 150px auto no-repeat, url(${A}/bottompattern.png) bottom center / 100% auto no-repeat, #FBFAF7; box-shadow:0 -6px 30px rgba(0,0,0,0.25); animation: gwSlideUp 0.35s ease;">
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:22px;">
                <img src="${A}/dailystreakcardicon.png" alt="" style="width:38px; height:38px; flex:none; filter: drop-shadow(0 3px 5px rgba(180,110,0,0.25));" />
                <div>
                  <div style="font-size:16.5px; font-weight:800; color:#1F1F1F; line-height:1.2;">${c.title || 'Daily check-in'}</div>
                  <div style="font-size:11px; color:#6D6D6D; margin-top:3px;">${c.subtitle || 'Collect your daily rewards here'}</div>
                </div>
              </div>

              <div style="display:flex; justify-content:center; gap:19px; margin-bottom:26px;">
                ${[0, 1, 2, 3].map(makeDay).join('')}
              </div>
              <div style="display:flex; justify-content:center; gap:22px; margin-bottom:24px;">
                ${[4, 5, 6].map(makeDay).join('')}
              </div>

              <button id="mnClaimModalBtn" class="gw-btn-press" style="width:100%; height:42px; border-radius:21px; border:none; background:${c.ctaColor || '#FF6623'}; color:#FFFFFF; font-family:inherit; font-size:14.5px; font-weight:700; cursor:pointer; box-shadow:0 5px 14px rgba(255,102,35,0.32);">
                ${c.ctaText || 'Claim Now'}
              </button>
            </div>
          </div>
        `;

        mount.querySelector('#mnClaimModalBtn').onclick = () => {
          if (c.soundEnabled !== false) snd.playCoinCascade(6);
          viewState = 'celebrate';
          renderView();
          ctx.emit('mynaksh_streak_claimed', { widgetId: widget.id, day: activeDay, amount: rewards[activeDay - 1] });
        };
        mount.querySelector('#mnSwitchHubToPage').onclick = () => { viewState = 'rewards_hub'; renderView(); };

      } else {
        // =====================================================================
        // FULL 1:1 REWARDS SCREEN (Identical to User Screenshot & Native App)
        // =====================================================================
        const nextAmt = rewards[Math.min(activeDay, 6)] ?? 7;

        // Generate 7-Day capsules exactly matching screenshot
        const dayPills = rewards.map((amt, idx) => {
          const d = idx + 1;
          const isClaimedToday = d === 1; // In screenshot Day 1 is claimed with green border
          const isDay2 = d === 2; // Next upcoming
          
          if (isClaimedToday) {
            return `
              <div class="mn-day-col" style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <span style="font-size: 10.5px; font-weight: 700; color: #FFFFFF;">Day ${d}</span>
                <div id="mnDayCard1" class="gw-btn-press" style="width: 100%; height: 70px; background: #FFFFFF; border: 2.2px solid #22C55E; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 0 12px rgba(34, 197, 94, 0.45); cursor: pointer;">
                  <!-- Gold circle with checkmark badge -->
                  <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #FBBF24, #F59E0B); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);">
                    <div style="width: 16px; height: 16px; border-radius: 50%; background: #F97316; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 10px; font-weight: 900;">✓</div>
                  </div>
                  <span style="font-size: 13px; font-weight: 800; color: #0F172A;">${cur}${amt}</span>
                </div>
              </div>
            `;
          } else if (isDay2) {
            return `
              <div class="mn-day-col" style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <span style="font-size: 10.5px; font-weight: 600; color: #94A3B8;">Day ${d}</span>
                <div id="mnDayCard2" class="gw-btn-press" style="width: 100%; height: 70px; background: rgba(255, 255, 255, 0.1); border: 1.5px solid #22C55E; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; cursor: pointer;">
                  <img src="/assets/mynaksh/coinupcoming.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 24px; height: 24px; object-fit: contain;" alt="Coin" />
                  <div style="display: none; width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); align-items: center; justify-content: center; font-size: 10px; color: #E2E8F0;">★</div>
                  <span style="font-size: 12.5px; font-weight: 700; color: #E2E8F0;">${cur}${amt}</span>
                </div>
              </div>
            `;
          } else {
            return `
              <div class="mn-day-col" style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <span style="font-size: 10.5px; font-weight: 600; color: #64748B;">Day ${d}</span>
                <div style="width: 100%; height: 70px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; opacity: 0.82;">
                  <img src="/assets/mynaksh/dailystreakunclaimed.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 22px; height: 22px; object-fit: contain; opacity: 0.6;" alt="Coin" />
                  <div style="display: none; width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); align-items: center; justify-content: center; font-size: 9px; color: #94A3B8;">★</div>
                  <span style="font-size: 12.5px; font-weight: 600; color: #94A3B8;">${cur}${amt}</span>
                </div>
              </div>
            `;
          }
        }).join('');

        mount.innerHTML = `
          <div class="gw-phone-frame" style="background: #070B16; padding: 0; display: flex; flex-direction: column; height: 680px; overflow-y: auto; overflow-x: hidden; scrollbar-width: none;">
            
            <!-- Top Controls (Switch views for demo) -->
            <div style="position: absolute; top: 8px; right: 8px; z-index: 50; display: flex; gap: 6px;">
              <button class="gw-replay-chip" id="mnTriggerCelebration" style="font-size: 10px; padding: 3px 8px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Celebrate</button>
              <button class="gw-replay-chip" id="mnTriggerModal" style="font-size: 10px; padding: 3px 8px;"><i class="fa-solid fa-layer-group"></i> Modal</button>
            </div>

            <!-- iOS Top Status Bar -->
            <div style="padding: 10px 20px 4px; display: flex; justify-content: space-between; align-items: center; color: #FFFFFF; font-size: 12px; font-weight: 600;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span>8:52</span>
                <i class="fa-solid fa-location-arrow" style="font-size: 10px; transform: rotate(-45deg);"></i>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
                <i class="fa-solid fa-signal"></i>
                <i class="fa-solid fa-wifi"></i>
                <i class="fa-solid fa-battery-full" style="font-size: 13px;"></i>
              </div>
            </div>

            <!-- Main Top Header: "Rewards" & "Wallet ₹30 +" -->
            <div style="padding: 10px 18px 16px; display: flex; justify-content: space-between; align-items: center;">
              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 800; letter-spacing: -0.6px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">Rewards</h1>
              
              <!-- Wallet Pill Badge -->
              <div id="mnWalletBadge" class="gw-btn-press" style="background: #171C28; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px; padding: 5px 6px 5px 14px; display: flex; align-items: center; gap: 10px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                  <span style="font-size: 10px; color: #94A3B8; font-weight: 600; line-height: 1;">Wallet</span>
                  <span id="mnWalletVal" style="font-size: 15px; font-weight: 800; color: #FFFFFF; line-height: 1.2;">${cur}${walletBalance}</span>
                </div>
                <div id="mnAddFundsBtn" style="width: 24px; height: 24px; border-radius: 50%; background: #D9531E; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; box-shadow: 0 2px 6px rgba(217, 83, 30, 0.45);">+</div>
              </div>
            </div>

            <!-- Dark Streak Section: "Keep Your Streak Alive!" -->
            <div style="padding: 0 16px 18px; background: #070B16;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #FDE047, #F59E0B 65%, #B45309 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4); flex-shrink: 0;">
                  <img src="/assets/mynaksh/dailystreakcardicon.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" style="width: 28px; height: 28px; object-fit: contain;" alt="Streak Icon" />
                  <span style="display: none; font-size: 18px; color: #FFF; font-weight: 900;">${cur}</span>
                </div>
                <div>
                  <div style="font-size: 15px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.2px;">Keep Your Streak Alive!</div>
                  <div style="font-size: 11.5px; color: #94A3B8; margin-top: 2px;">Collect your daily rewards here</div>
                </div>
              </div>

              <!-- 7-Day Stepper Row -->
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-bottom: 14px;">
                ${dayPills}
              </div>

              <!-- Button: "Get ₹7 more tomorrow" -->
              <button id="mnGetMoreBtn" class="gw-btn-press" style="width: 100%; height: 42px; border-radius: 21px; border: 1px solid rgba(255, 255, 255, 0.08); background: #252A36; color: #E2E8F0; font-size: 13.5px; font-weight: 600; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
                Get ${cur}${nextAmt} more tomorrow
              </button>
            </div>

            <!-- Warm Cream Page Body (Sand Tone Background) -->
            <div style="background: #EDE6DC; padding: 14px 12px 20px; display: flex; flex-direction: column; gap: 14px; flex: 1;">
              
              <!-- 1. "Refer a friend" Card -->
              <div style="background: linear-gradient(135deg, #FFE8D6 0%, #FFF5ED 50%, #FFFFFF 100%); border-radius: 20px; padding: 18px 16px; box-shadow: 0 4px 16px rgba(180, 130, 80, 0.08); position: relative; overflow: hidden;">
                <!-- Subtle decorative background dots -->
                <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 120px; background-image: radial-gradient(#F59E0B 1px, transparent 1px); background-size: 12px 12px; opacity: 0.15; pointer-events: none;"></div>

                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="z-index: 2; max-width: 60%;">
                    <div style="font-size: 16.5px; font-weight: 800; color: #1E1B18; line-height: 1.25;">Refer a friend</div>
                    <div style="font-size: 16.5px; font-weight: 800; color: #1E1B18; line-height: 1.25; display: flex; align-items: center; gap: 4px; margin-top: 3px;">
                      &amp; both earn <span style="display:inline-flex; width:16px; height:16px; border-radius:50%; background:#F59E0B; color:#FFF; font-size:9px; font-weight:900; align-items:center; justify-content:center; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">★</span> ${cur}${c.referralBonus || 50}
                    </div>
                    <div id="mnHowReferralBtn" class="gw-btn-press" style="display: inline-flex; align-items: center; gap: 4px; margin-top: 9px; padding: 4px 10px; border-radius: 12px; border: 1px solid rgba(210, 140, 90, 0.35); background: rgba(255, 255, 255, 0.7); font-size: 11px; color: #78350F; font-weight: 600; cursor: pointer;">
                      How referral works &rsaquo;
                    </div>
                  </div>

                  <!-- 3D Stack of Golden Coins & Confetti Burst -->
                  <div style="position: relative; width: 100px; height: 75px; z-index: 2; display: flex; align-items: center; justify-content: center;">
                    <img src="/assets/mynaksh/wincoin.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" style="width: 76px; height: 76px; object-fit: contain; filter: drop-shadow(0 6px 12px rgba(245, 158, 11, 0.45));" alt="Coins" />
                    <!-- Fallback SVG Stack -->
                    <div style="display: none; width: 68px; height: 68px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #FDE047, #F59E0B 60%, #B45309 100%); box-shadow: 0 6px 16px rgba(245, 158, 11, 0.45);"></div>
                  </div>
                </div>

                <!-- Action Row: Share Button + WhatsApp Button -->
                <div style="display: flex; gap: 10px; align-items: center; margin-top: 14px; z-index: 2; position: relative;">
                  <button id="mnShareBtn" class="gw-btn-press" style="width: 46px; height: 46px; border-radius: 12px; border: 1px solid #E6DDD3; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: #1E1B18; font-size: 16px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.04);" title="Share Link">
                    <i class="fa-solid fa-share-nodes"></i>
                  </button>

                  <button id="mnWhatsappBtn" class="gw-btn-press" style="flex: 1; height: 46px; border-radius: 12px; border: none; background: ${c.referralCtaColor || '#FF6623'}; color: #FFFFFF; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(255, 102, 35, 0.3);">
                    ${c.referralCtaText || 'Claim Now'}
                  </button>
                </div>

                <!-- Referral Code Row with Copy Icon -->
                <div style="text-align: center; font-size: 12px; color: #52525B; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <span>Referral Code:</span>
                  <strong style="color: #111827; letter-spacing: 0.5px; font-size: 13px;">${c.referralCode || 'R8HKBD'}</strong>
                  <button id="mnCopyBtn" style="background: none; border: none; color: #52525B; cursor: pointer; padding: 2px 4px; font-size: 13px;" title="Copy Code">
                    <i class="fa-regular fa-copy"></i>
                  </button>
                  <span id="mnCopyToast" style="display: none; font-size: 10.5px; color: #16A34A; font-weight: 700;">Copied!</span>
                </div>
              </div>

              <!-- 2. "MANTRA JAAP" Card -->
              <div style="background: #F7EFE7; border: 1px solid #EFE4D6; border-radius: 20px; padding: 16px 14px; position: relative;">
                
                <!-- Ornamental Section Divider -->
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: #78350F; font-size: 12px; font-weight: 800; letter-spacing: 1.2px;">
                  <span style="height: 1px; width: 36px; background: #D1C5B6;"></span>
                  ✦ MANTRA JAAP ✦
                  <span style="height: 1px; width: 36px; background: #D1C5B6;"></span>
                </div>

                <div style="text-align: center; font-size: 11px; color: #78716C; margin: 6px auto 10px; max-width: 270px; line-height: 1.45;">
                  Chant mantras and find peace, earn rewards as you stay consistent.
                </div>

                <!-- Claimed Indicator -->
                <div style="display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px; color: #78716C; margin-bottom: 12px;">
                  <span style="display:inline-flex; width: 14px; height: 14px; border-radius: 50%; background: #F59E0B; color: #FFF; font-size: 8px; font-weight: 900; align-items: center; justify-content: center;">★</span> Claimed:
                </div>

                <!-- Mars Mantra Inner Sub-Card -->
                <div style="background: #FFFFFF; border-radius: 16px; padding: 12px 12px; border: 1px solid #ECE3D7; display: flex; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                  
                  <!-- Left: Mars 3D Textured Sphere -->
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #F97316 0%, #C2410C 55%, #7C2D12 100%); box-shadow: 0 4px 10px rgba(194, 65, 12, 0.35); flex-shrink: 0; position: relative; overflow: hidden;">
                    <!-- Texture craters -->
                    <div style="position: absolute; top: 9px; left: 11px; width: 10px; height: 6px; border-radius: 50%; background: rgba(67, 20, 7, 0.45); filter: blur(0.5px);"></div>
                    <div style="position: absolute; bottom: 10px; right: 12px; width: 14px; height: 8px; border-radius: 50%; background: rgba(67, 20, 7, 0.5); filter: blur(0.5px);"></div>
                    <div style="position: absolute; top: 22px; left: 24px; width: 8px; height: 5px; border-radius: 50%; background: rgba(67, 20, 7, 0.35);"></div>
                  </div>

                  <!-- Center: Mantra Details -->
                  <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 800; color: #1C1917;">${c.mantraName || 'Mars Mantra'}</div>
                    <div style="font-size: 11px; color: #948B83; margin-top: 2px;">${c.mantraChant || 'Om Am Angarakaya Namah'}</div>
                  </div>

                  <!-- Right: Claim ₹1 Button -->
                  <button id="mnMantraClaimBtn" class="gw-btn-press" style="background: ${mantraClaimed ? '#DCFCE7' : '#FEF3C7'}; border: 1px solid ${mantraClaimed ? '#86EFAC' : '#FDE68A'}; border-radius: 18px; padding: 6px 12px; font-size: 11.5px; font-weight: 800; color: ${mantraClaimed ? '#15803D' : '#92400E'}; display: flex; align-items: center; gap: 4px; cursor: pointer; white-space: nowrap;">
                    <span>${mantraClaimed ? 'Claimed' : 'Claim'}</span>
                    <span style="display:inline-flex; width: 14px; height: 14px; border-radius: 50%; background: ${mantraClaimed ? '#16A34A' : '#F59E0B'}; color: #FFF; font-size: 8px; font-weight: 900; align-items: center; justify-content: center;">${mantraClaimed ? '✓' : '★'}</span>
                    ${mantraClaimed ? '' : `<span>${cur}${c.mantraReward || 1} &rsaquo;</span>`}
                  </button>
                </div>
              </div>
            </div>

            <!-- Bottom Navigation Bar (5 tabs matching native app) -->
            <div style="background: #FAF6F0; border-top: 1px solid #E7DFD5; height: 62px; display: flex; align-items: center; justify-content: space-around; padding: 0 4px; flex-shrink: 0;">
              
              <!-- Tab 1: My Life (Lotus) -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; opacity: 0.7;">
                <i class="fa-solid fa-spa" style="font-size: 18px; color: #78716C;"></i>
                <span style="font-size: 10px; color: #78716C; font-weight: 600;">My Life</span>
              </div>

              <!-- Tab 2: Chat -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; opacity: 0.7;">
                <i class="fa-regular fa-comment-dots" style="font-size: 18px; color: #78716C;"></i>
                <span style="font-size: 10px; color: #78716C; font-weight: 600;">Chat</span>
              </div>

              <!-- Tab 3: Home -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; opacity: 0.7;">
                <i class="fa-regular fa-circle-dot" style="font-size: 18px; color: #78716C;"></i>
                <span style="font-size: 10px; color: #78716C; font-weight: 600;">Home</span>
              </div>

              <!-- Tab 4: Reports (with NEW badge) -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; opacity: 0.7; position: relative;">
                <span style="position: absolute; top: -5px; right: 2px; background: #2563EB; color: #FFFFFF; font-size: 7.5px; font-weight: 900; padding: 1px 4px; border-radius: 6px;">NEW</span>
                <i class="fa-regular fa-newspaper" style="font-size: 18px; color: #78716C;"></i>
                <span style="font-size: 10px; color: #78716C; font-weight: 600;">Reports</span>
              </div>

              <!-- Tab 5: Rewards (ACTIVE TAB - Terracotta Raised Disc) -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer;">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: #7C2D12; display: flex; align-items: center; justify-content: center; color: #FFFFFF; box-shadow: 0 4px 10px rgba(124, 45, 18, 0.35);">
                  <i class="fa-solid fa-gift" style="font-size: 16px;"></i>
                </div>
                <span style="font-size: 10.5px; color: #7C2D12; font-weight: 800;">Rewards</span>
              </div>
            </div>

          </div>
        `;

        // Interactive Event Listeners
        const triggerCelebration = () => {
          if (c.soundEnabled !== false) snd.playCoinCascade(6);
          viewState = 'celebrate';
          renderView();
          ctx.emit('mynaksh_streak_claimed', { widgetId: widget.id, day: activeDay, amount: rewards[activeDay - 1] });
        };

        const day1 = mount.querySelector('#mnDayCard1');
        if (day1) day1.onclick = triggerCelebration;

        const day2 = mount.querySelector('#mnDayCard2');
        if (day2) day2.onclick = triggerCelebration;

        const getMoreBtn = mount.querySelector('#mnGetMoreBtn');
        if (getMoreBtn) getMoreBtn.onclick = triggerCelebration;

        const trigCel = mount.querySelector('#mnTriggerCelebration');
        if (trigCel) trigCel.onclick = triggerCelebration;

        const trigModal = mount.querySelector('#mnTriggerModal');
        if (trigModal) trigModal.onclick = () => { viewState = 'modal'; renderView(); };

        // Mantra Claim
        const mantraBtn = mount.querySelector('#mnMantraClaimBtn');
        if (mantraBtn) {
          mantraBtn.onclick = () => {
            if (mantraClaimed) return;
            mantraClaimed = true;
            walletBalance += Number(c.mantraReward || 1);
            if (c.soundEnabled !== false) snd.playRewardChime();
            renderView();
            fireConfetti(['#FBBF24', '#EA580C', '#FFFFFF']);
            ctx.emit('mynaksh_mantra_claimed', { widgetId: widget.id, reward: c.mantraReward || 1, newWallet: walletBalance });
          };
        }

        // Copy Referral Code
        const copyBtn = mount.querySelector('#mnCopyBtn');
        const copyToast = mount.querySelector('#mnCopyToast');
        if (copyBtn) {
          copyBtn.onclick = () => {
            const code = c.referralCode || 'R8HKBD';
            navigator.clipboard?.writeText(code).catch(() => {});
            if (c.soundEnabled !== false) snd.playToastPop();
            if (copyToast) {
              copyToast.style.display = 'inline';
              setTimeout(() => { copyToast.style.display = 'none'; }, 2000);
            }
          };
        }

        // WhatsApp Share
        const waBtn = mount.querySelector('#mnWhatsappBtn');
        if (waBtn) {
          waBtn.onclick = () => {
            if (c.soundEnabled !== false) snd.playToastPop();
            window.open(`https://wa.me/?text=Use%20my%20referral%20code%20${c.referralCode || 'R8HKBD'}%20on%20MyNaksh%20to%20get%20₹50!`, '_blank');
          };
        }

        // Wallet Add Funds
        const walletBadge = mount.querySelector('#mnWalletBadge');
        if (walletBadge) {
          walletBadge.onclick = () => {
            walletBalance += 10;
            if (c.soundEnabled !== false) snd.playRewardChime();
            renderView();
          };
        }
      }
    }

    renderView();
  }

  // =========================================================================
  // 3. INSTAASTRO POINTS & STREAK STEPPER (ScreenRecording_11-05-2026 11-20-58_1.mp4)
  // =========================================================================
  function renderInstaAstroPoints(mount, widget, ctx) {
    const c = widget.config;
    const snd = ctx.sound;
    let points = Number(c.startingPoints ?? 150);
    let showStepperModal = c.initialView === 'stepper';

    function renderView() {
      const milestones = [
        { pts: 500, label: 'Flat ₹50 Extra' },
        { pts: 1000, label: 'Flat ₹100 Extra' },
        { pts: 3000, label: 'Flat ₹300 Extra' },
        { pts: 5000, label: 'Flat ₹500 Extra' }
      ];
      const nextTarget = milestones.find(m => m.pts > points) || milestones[0];
      const pct = Math.min(100, Math.round((points / 1000) * 100));

      mount.innerHTML = `
        <div class="gw-phone-frame" style="background: #FFFFFF; color: #18181B;">
          <!-- Floating Top Dark Toast -->
          <div id="instaToast" style="display: none; position: absolute; top: 14px; left: 16px; right: 16px; z-index: 80; background: #18181B; color: #FFF; border-radius: 14px; padding: 12px 14px; align-items: center; justify-content: space-between; box-shadow: 0 12px 30px rgba(0,0,0,0.35);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px; color: ${c.accentColor || '#FFC700'};">★</span>
              <div>
                <div style="font-size: 13px; font-weight: 800;">Congratulations!</div>
                <div style="font-size: 11px; color: #A1A1AA;">You have earned points</div>
              </div>
            </div>
            <div style="font-size: 18px; font-weight: 900; color: #FFF;" id="instaToastAmt">+50</div>
          </div>

          <!-- Top Golden Gradient Banner -->
          <div style="background: linear-gradient(180deg, #FFF3CC, #FFE399); padding: 18px 16px 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <span style="font-size: 16px; font-weight: 800;">← Insta Points</span>
              <button id="instaOpenStepper" style="background: #FFFFFF; border: none; padding: 5px 10px; border-radius: 12px; font-size: 10px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">7-Day Streak</button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 32px; color: #F59E0B; filter: drop-shadow(0 2px 4px rgba(245,158,11,0.3));">★</span>
                <div>
                  <div style="font-size: 26px; font-weight: 900; line-height: 1;" id="instaPtsVal">${points}</div>
                  <div style="font-size: 10px; font-weight: 800; color: #78350F; letter-spacing: 0.6px;">POINTS</div>
                </div>
              </div>
              <div style="font-size: 11px; color: #573B00; text-align: right; max-width: 165px; font-weight: 600;">
                Earn <b>${Math.max(0, nextTarget.pts - points)} Points</b> more &amp; Win <b>${nextTarget.label}</b> Coupon
              </div>
            </div>

            <!-- Milestone Track -->
            <div style="position: relative; padding-top: 8px;">
              <div style="height: 5px; background: rgba(255,255,255,0.75); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${pct}%; background: #F59E0B; transition: width 0.4s ease;"></div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px;">
                ${milestones.map(m => `
                  <div style="text-align: center;">
                    <div style="font-size: 11px; font-weight: 800; color: #18181B;">${m.pts} <span style="color:#F59E0B;">★</span></div>
                    <div style="background: rgba(255,255,255,0.7); font-size: 9px; font-weight: 700; padding: 3px 4px; border-radius: 6px; margin-top: 3px;">${m.label}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- How to Earn Section -->
          <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 10px; background: #FFF;">
            <div style="font-size: 14px; font-weight: 800;">How to Earn?</div>

            ${[
              { pts: 50, text: 'Earn points by knowing your Horoscope of the day!', icon: '🔮' },
              { pts: 30, text: 'Earn points by checking your Daily Tarot Reading!', icon: '🃏' },
              { pts: 10, text: 'Earn points by reading your Panchang of the day!', icon: '📅' }
            ].map((task, idx) => `
              <div style="background: #FFFDF7; border: 1px solid #FDE68A; border-radius: 14px; padding: 12px; display: flex; align-items: center; gap: 10px;">
                <div style="text-align: center; min-width: 34px;">
                  <div style="font-size: 16px; color: #F59E0B;">★</div>
                  <div style="font-size: 12px; font-weight: 900;">${task.pts}</div>
                </div>
                <div style="flex: 1; font-size: 11px; font-weight: 600; color: #374151; line-height: 1.35;">${task.text}</div>
                <button class="instaEarnBtn gw-btn-press" data-pts="${task.pts}" style="background: ${c.accentColor || '#FFC700'}; border: none; border-radius: 16px; padding: 7px 12px; font-size: 11px; font-weight: 800; color: #18181B; cursor: pointer; white-space: nowrap;">
                  Earn Now
                </button>
              </div>
            `).join('')}
          </div>

          <!-- 7-Day Streak Linear Stepper Bottom Sheet -->
          ${showStepperModal ? `
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.55); z-index: 70; display: flex; align-items: flex-end;">
              <div style="background: #FFFFFF; width: 100%; border-radius: 24px 24px 0 0; padding: 18px 18px 22px; animation: gwPopIn 0.25s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 20px; font-weight: 900; color: #18181B;"><span style="color:#F59E0B;">★</span> +${c.streakBonusPoints || 70}</span>
                  <button id="instaCloseStepper" style="background: none; border: none; font-size: 20px; color: #6B7280; cursor: pointer;">&times;</button>
                </div>
                <div style="font-size: 16px; font-weight: 800; color: #18181B;">You have earned Insta Points</div>
                <div style="font-size: 11px; color: #6B7280; margin-bottom: 16px;">Check your Horoscope regularly to earn bonus points</div>

                <!-- 7-Step Linear Progress -->
                <div style="display: flex; justify-content: space-between; align-items: center; position: relative; margin-bottom: 8px;">
                  <div style="position: absolute; top: 50%; left: 10px; right: 10px; height: 3px; background: #E5E7EB; transform: translateY(-50%); z-index: 0;">
                    <div style="height: 100%; width: 32%; background: ${c.progressColor || '#22C55E'};"></div>
                  </div>
                  ${[1, 2, 3, 4, 5, 6, 7].map(d => {
                    const done = d <= 2;
                    return `<div style="position: relative; z-index: 1; width: 28px; height: 28px; border-radius: 6px; background: ${done ? (c.progressColor || '#22C55E') : '#F3F4F6'}; border: 1px solid ${done ? '#16A34A' : '#D1D5DB'}; color: ${done ? '#FFF' : '#374151'}; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center;">${done ? '✓' : d}</div>`;
                  }).join('')}
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 9px; color: #6B7280; font-weight: 700; margin-bottom: 18px; padding: 0 2px;">
                  <span></span><span></span><span>+20 Bonus</span><span></span><span>+50 Bonus</span><span></span><span>+100 Bonus</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label style="font-size: 11px; color: #6B7280; display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="checkbox"> Don't show me again!
                  </label>
                  <button id="instaCheckPtsBtn" class="gw-btn-press" style="background: ${c.accentColor || '#FFC700'}; border: none; border-radius: 10px; padding: 10px 16px; font-size: 12px; font-weight: 800; color: #18181B; cursor: pointer;">
                    Check Points
                  </button>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      `;

      mount.querySelectorAll('.instaEarnBtn').forEach(btn => {
        btn.onclick = () => {
          const add = Number(btn.getAttribute('data-pts'));
          points += add;
          if (c.soundEnabled !== false) snd.playToastPop();
          mount.querySelector('#instaPtsVal').innerText = points;
          const toast = mount.querySelector('#instaToast');
          mount.querySelector('#instaToastAmt').innerText = '+' + add;
          toast.style.display = 'flex';
          toast.style.animation = 'none';
          toast.offsetHeight;
          toast.style.animation = 'gwToastSlide 2.6s ease forwards';
          ctx.emit('instaastro_points_earned', { widgetId: widget.id, amount: add });
        };
      });

      const openStep = mount.querySelector('#instaOpenStepper');
      if (openStep) openStep.onclick = () => {
        if (c.soundEnabled !== false) snd.playToastPop();
        showStepperModal = true;
        renderView();
      };
      const closeStep = mount.querySelector('#instaCloseStepper');
      if (closeStep) closeStep.onclick = () => { showStepperModal = false; renderView(); };
      const checkBtn = mount.querySelector('#instaCheckPtsBtn');
      if (checkBtn) checkBtn.onclick = () => {
        if (c.soundEnabled !== false) snd.playRewardChime();
        showStepperModal = false;
        renderView();
      };
    }
    renderView();
  }

  // =========================================================================
  // 4. PAYTM CHEST FLIP & ODOMETER (ScreenRecording_11-10-2026 22-17-38_1.mp4 pt1)
  // =========================================================================
  // Royal scratch card: maroon card with gold frame and corner filigree, brand tab, gold
  // elephants, faint mandala, tilted gold foil ("Scratch Card", crown, laurels, peeled corner).
  // Scratching reveals a coupon (default: 80% OFF at Skullcandy) with confetti and copy-to-clipboard.
  const PCS_CSS = `
    .pcs-stage { background: radial-gradient(ellipse at 50% 40%, #182A42 0%, #0E1A2B 60%, #0A1220 100%) !important; color:#fff; padding: 20px 14px 22px !important; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; }
    .pcs-reset { position:absolute; top:12px; right:12px; height:30px; padding: 0 12px; border-radius:10px; border:1.5px solid rgba(255,210,120,.35); background: rgba(10,18,32,.7); color:#F6E3B4; font-family:inherit; font-size:12.5px; font-weight:700; display:flex; align-items:center; gap:6px; cursor:pointer; z-index:5; }
    .pcs-reset svg { width:14px; height:14px; }
    .pcs-card { position:relative; width:300px; height:418px; margin-top:16px; border-radius:30px; padding:3px; background: linear-gradient(160deg,#FFE7A0,#E2A73A 35%,#B97A1E 60%,#FFD978); box-shadow: 0 0 26px rgba(255,190,80,.35), 0 24px 50px rgba(0,0,0,.55); }
    .pcs-inner { position:relative; width:100%; height:100%; border-radius:27px; overflow:hidden; background: radial-gradient(ellipse at 50% 38%, #8A1530 0%, #64091F 55%, #4A0616 100%); }
    .pcs-frame-line { position:absolute; inset:12px; border:1.2px solid rgba(240,190,90,.75); border-radius:18px; pointer-events:none; }
    .pcs-corner { position:absolute; width:30px; height:30px; pointer-events:none; }
    .pcs-tab { position:absolute; top:-2px; left:50%; transform: translateX(-50%); width:150px; height:42px; border-radius: 0 0 18px 18px; background: linear-gradient(180deg,#3C0412,#5A0A1E); border:1.5px solid #E7B14C; border-top:none; display:flex; align-items:center; justify-content:center; gap:7px; font-size:14.5px; font-weight:800; color:#FFF3DC; z-index:3; box-shadow: 0 4px 10px rgba(0,0,0,.35); }
    .pcs-tab svg { width:16px; height:16px; }
    .pcs-elephant { position:absolute; top:34px; width:54px; height:42px; z-index:2; filter: drop-shadow(0 2px 3px rgba(0,0,0,.4)); }
    .pcs-mandala { position:absolute; left:50%; top:52px; width:250px; height:136px; transform: translateX(-50%); opacity:.7; pointer-events:none; }
    .pcs-spark { position:absolute; width:26px; height:26px; z-index:2; pointer-events:none; animation: pcsTwinkle 1.8s ease-in-out infinite; }
    @keyframes pcsTwinkle { 0%,100% { opacity:1; transform: scale(1); } 50% { opacity:.55; transform: scale(.82); } }
    .pcs-foil-wrap { position:absolute; left:22px; top:128px; width:256px; height:170px; transform: rotate(-4deg); z-index:3; }
    .pcs-foil-card { position:absolute; inset:0; border-radius:18px; padding:3px; background: linear-gradient(160deg,#FFE7A0,#D99A2B 50%,#FFD978); box-shadow: 0 14px 28px rgba(0,0,0,.45); }
    .pcs-coupon { position:absolute; inset:3px; border-radius:15px; background: linear-gradient(180deg,#FFF8E6,#FCEBC2); color:#5A0A18; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:2px; padding:10px; }
    .pcs-coupon .brand { font-size:11px; font-weight:900; letter-spacing:3px; color:#8A1530; text-transform:uppercase; }
    .pcs-coupon .off { font-family: Georgia, "Times New Roman", serif; font-size:38px; font-weight:900; line-height:1; color:#7A0F2A; }
    .pcs-coupon .sub { font-size:11.5px; font-weight:700; color:#8C5A3C; margin-bottom:6px; }
    .pcs-code { display:flex; align-items:center; gap:8px; border:1.8px dashed #C98A1E; border-radius:12px; padding:6px 12px; background:#FFFDF5; font-size:15px; font-weight:900; letter-spacing:1.5px; color:#5A0A18; cursor:pointer; }
    .pcs-code small { font-size:10.5px; letter-spacing:0; font-weight:700; color:#A0703A; }
    .pcs-canvas { position:absolute; inset:3px; width:calc(100% - 6px); height:calc(100% - 6px); border-radius:15px; touch-action:none; cursor:grab; transition: opacity .5s ease; }
    .pcs-canvas.gone { opacity:0; pointer-events:none; }
    .pcs-foot { position:absolute; left:0; right:0; bottom:58px; display:flex; align-items:center; justify-content:center; gap:8px; font-size:13.5px; font-weight:700; color:#FFF3DC; z-index:3; white-space:nowrap; }
    .pcs-foot .rule { width:24px; height:1.2px; background:#E7B14C; flex:none; }
    .pcs-foot svg { width:26px; height:26px; }
    .pcs-cta { position:absolute; left:34px; right:34px; bottom:46px; height:46px; border-radius:23px; border:2px solid #FFF0B8; cursor:pointer; font-family:inherit; font-size:15px; font-weight:900; color:#4A0616; background: linear-gradient(180deg,#FFE98A,#F5B414 55%,#D99000); box-shadow: 0 4px 0 #8A5600, 0 0 16px rgba(255,200,60,.45); z-index:4; display:none; animation: gwPopIn .3s ease; }
    .pcs-cta.show { display:block; }
  `;

  const PCS_ELEPHANT = `<svg viewBox="0 0 64 48">
    <defs><linearGradient id="pcsElGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7A0"/><stop offset=".55" stop-color="#E9AE3E"/><stop offset="1" stop-color="#B9791C"/></linearGradient></defs>
    <rect x="15" y="31" width="6" height="14" rx="2" fill="url(#pcsElGold)"/><rect x="23" y="32" width="6" height="13" rx="2" fill="url(#pcsElGold)"/>
    <rect x="34" y="32" width="6" height="13" rx="2" fill="url(#pcsElGold)"/><rect x="41" y="31" width="6" height="14" rx="2" fill="url(#pcsElGold)"/>
    <ellipse cx="30" cy="26" rx="19" ry="13" fill="url(#pcsElGold)"/>
    <circle cx="48" cy="19" r="10" fill="url(#pcsElGold)"/>
    <path d="M55 21c6 6 6 14 2 19-1.2 1.4-3 .4-2.4-1.2 2.4-5 1.6-10-3.6-14z" fill="url(#pcsElGold)"/>
    <ellipse cx="43" cy="20" rx="6" ry="8.5" fill="#D4952E"/>
    <path d="M52 27c3 3 6 3.6 8.5 2.4" stroke="#FFF8E6" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="51" cy="16.5" r="1.4" fill="#4A0616"/>
    <path d="M17 13h24v15l-12 6-12-6z" fill="#C8102E" stroke="#F2C35A" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M29 16l3 4-3 4-3-4z" fill="#F2C35A"/><circle cx="21" cy="18" r="1.3" fill="#F2C35A"/><circle cx="37" cy="18" r="1.3" fill="#F2C35A"/><circle cx="29" cy="29" r="1.3" fill="#F2C35A"/>
    <path d="M44 9c3-2 7-2 9 1l-2 3h-6z" fill="#C8102E" stroke="#F2C35A" stroke-width="1.2"/>
  </svg>`;

  const PCS_CORNER = `<svg viewBox="0 0 30 30"><path d="M2 28V8a6 6 0 0 1 6-6h20" stroke="#E7B14C" stroke-width="1.4" fill="none"/><path d="M6 24V11a5 5 0 0 1 5-5h13" stroke="#E7B14C" stroke-width="1" fill="none" opacity=".7"/><rect x="9" y="9" width="7" height="7" transform="rotate(45 12.5 12.5)" fill="none" stroke="#E7B14C" stroke-width="1.1"/></svg>`;

  const PCS_SPARK = `<svg viewBox="0 0 26 26"><path d="M13 0c1 7 6 12 13 13-7 1-12 6-13 13-1-7-6-12-13-13 7-1 12-6 13-13z" fill="#FFE8A8" style="filter: drop-shadow(0 0 5px #FFC94A)"/></svg>`;

  function renderPaytmChestScratch(mount, widget, ctx) {
    const c = widget.config;
    const snd = ctx.sound;
    const soundOn = c.soundEnabled !== false;
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const brandName = c.brandName || 'Your Brand';
    const offerBrand = c.offerBrand || 'Skullcandy';
    const offerTitle = c.offerTitle || '80% OFF';
    const offerSubtitle = c.offerSubtitle || 'on headphones & earbuds';
    const couponCode = c.couponCode || 'SKULL80';
    const threshold = Number(c.scratchThresholdPercent || 45);

    if (!document.getElementById('pcs-styles')) {
      const st = document.createElement('style');
      st.id = 'pcs-styles';
      st.textContent = PCS_CSS;
      document.head.appendChild(st);
    }

    const mandala = `<svg class="pcs-mandala" viewBox="0 0 220 120">
      <g transform="translate(110 112)" fill="none" stroke="#A0213F" stroke-width="1.4">
        ${Array.from({ length: 11 }, (_, i) => `<path d="M0 0 C-14 -30 -10 -62 0 -86 C10 -62 14 -30 0 0" transform="rotate(${-75 + i * 15})"/>`).join('')}
        ${Array.from({ length: 9 }, (_, i) => `<path d="M0 -20 C-8 -38 -6 -52 0 -60 C6 -52 8 -38 0 -20" transform="rotate(${-60 + i * 15})"/>`).join('')}
        <circle r="18"/><circle r="40" stroke-dasharray="3 5"/>
      </g>
    </svg>`;

    mount.innerHTML = `
      <div class="gw-phone-frame pcs-stage">
        <button class="pcs-reset" id="ptmChestReset"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>Reset</button>
        <div class="pcs-card">
          <div class="pcs-inner">
            ${mandala}
            <div class="pcs-frame-line"></div>
            <div class="pcs-corner" style="left:8px; top:8px">${PCS_CORNER}</div>
            <div class="pcs-corner" style="right:8px; top:8px; transform: scaleX(-1)">${PCS_CORNER}</div>
            <div class="pcs-corner" style="left:8px; bottom:8px; transform: scaleY(-1)">${PCS_CORNER}</div>
            <div class="pcs-corner" style="right:8px; bottom:8px; transform: scale(-1,-1)">${PCS_CORNER}</div>
            <div class="pcs-tab"><svg viewBox="0 0 24 24"><path d="M10 3c.8 5 3.4 7.6 8.4 8.4-5 .8-7.6 3.4-8.4 8.4-.8-5-3.4-7.6-8.4-8.4 5-.8 7.6-3.4 8.4-8.4z" fill="#FFF3DC"/><path d="M19 1c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3z" fill="#FFF3DC"/></svg>${esc(brandName)}</div>
            <div class="pcs-elephant" style="left:26px; transform: scaleX(-1)">${PCS_ELEPHANT}</div>
            <div class="pcs-elephant" style="right:26px">${PCS_ELEPHANT}</div>
            <div class="pcs-spark" style="left:18px; top:96px">${PCS_SPARK}</div>
            <div class="pcs-spark" style="right:20px; top:300px; animation-delay:.9s">${PCS_SPARK}</div>

            <div class="pcs-foil-wrap" id="pcsFoilWrap">
              <div class="pcs-foil-card">
                <div class="pcs-coupon">
                  <div class="brand">${esc(offerBrand)}</div>
                  <div class="off">${esc(offerTitle)}</div>
                  <div class="sub">${esc(offerSubtitle)}</div>
                  <div class="pcs-code" id="pcsCode"><span>${esc(couponCode)}</span><small id="pcsCodeHint">Tap to copy</small></div>
                </div>
                <canvas class="pcs-canvas" id="pcsCanvas"></canvas>
              </div>
            </div>

            <div class="pcs-foot" id="pcsFoot"><span class="rule"></span><svg viewBox="0 0 48 56"><path d="M18 31V9a4 4 0 0 1 8 0v15v-4a3.5 3.5 0 0 1 7 0v5v-2a3.5 3.5 0 0 1 7 0v4a3 3 0 0 1 6 0v12c0 8-6 14-14 14h-6c-6 0-10-4-14-10l-6-9a3.5 3.5 0 0 1 6-4l6 5z" fill="none" stroke="#FFF3DC" stroke-width="2.6" stroke-linejoin="round"/><path d="M14 9a8 8 0 0 1 16 0M10 9a12 12 0 0 1 24 0" stroke="#FFF3DC" stroke-width="2" fill="none" stroke-linecap="round"/></svg>${esc(c.footerText || 'Tap to Scratch & Win Rewards')}<span class="rule"></span></div>
            <button class="pcs-cta" id="pcsCta">Copy Code &amp; Shop ${esc(offerBrand)}</button>
          </div>
        </div>
      </div>
    `;

    const wrap = mount.querySelector('#pcsFoilWrap');
    const canvas = mount.querySelector('#pcsCanvas');
    const cta = mount.querySelector('#pcsCta');
    const foot = mount.querySelector('#pcsFoot');
    const W = 250, H = 164;
    const TILT = -4 * Math.PI / 180;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const g = canvas.getContext('2d', { willReadFrequently: true });
    g.scale(dpr, dpr);
    let revealed = false;
    let drawing = false;
    let last = null;
    let lastSound = 0;
    let moves = 0;

    // Small seeded random so the brush edge looks the same every time.
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

    function drawFoil() {
      revealed = false;
      seed = 7;
      canvas.classList.remove('gone');
      cta.classList.remove('show');
      cta.textContent = `Copy Code & Shop ${offerBrand}`;
      foot.style.display = '';
      g.save();
      g.globalCompositeOperation = 'source-over';
      g.clearRect(0, 0, W, H);

      // Maroon card base
      const base = g.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.7);
      base.addColorStop(0, '#7A1028');
      base.addColorStop(1, '#4E0618');
      g.fillStyle = base;
      g.fillRect(0, 0, W, H);

      // Gold brush-stroke foil with jagged edges
      const pts = [];
      const inset = 12;
      const jag = () => (rnd() - 0.5) * 14;
      for (let x = inset; x <= W - inset; x += 9) pts.push([x, inset + Math.abs(jag())]);
      for (let y = inset; y <= H - inset; y += 9) pts.push([W - inset - Math.abs(jag()), y]);
      for (let x = W - inset; x >= inset; x -= 9) pts.push([x, H - inset - Math.abs(jag())]);
      for (let y = H - inset; y >= inset; y -= 9) pts.push([inset + Math.abs(jag()), y]);
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      const gold = g.createRadialGradient(W * 0.48, H * 0.45, 8, W * 0.5, H * 0.5, W * 0.62);
      gold.addColorStop(0, '#FFF1BE');
      gold.addColorStop(0.45, '#F7CB62');
      gold.addColorStop(1, '#D6962A');
      g.fillStyle = gold;
      g.fill();
      // brushed texture
      g.save();
      g.clip();
      g.globalAlpha = 0.18;
      for (let i = 0; i < 70; i++) {
        g.strokeStyle = rnd() > 0.5 ? '#FFFFFF' : '#B9791C';
        g.lineWidth = 0.6 + rnd() * 1.2;
        const y = rnd() * H;
        g.beginPath();
        g.moveTo(rnd() * 40, y);
        g.lineTo(W - rnd() * 40, y + (rnd() - 0.5) * 10);
        g.stroke();
      }
      g.restore();

      // Crown
      g.fillStyle = '#5A0A18';
      g.beginPath();
      const cx = W / 2, cy = 36;
      g.moveTo(cx - 14, cy + 6); g.lineTo(cx - 15, cy - 6); g.lineTo(cx - 7, cy); g.lineTo(cx, cy - 10);
      g.lineTo(cx + 7, cy); g.lineTo(cx + 15, cy - 6); g.lineTo(cx + 14, cy + 6); g.closePath(); g.fill();
      g.fillRect(cx - 14, cy + 7, 28, 3.5);
      [[-15, -7], [0, -11], [15, -7]].forEach(([dx, dy]) => { g.beginPath(); g.arc(cx + dx, cy + dy, 2.2, 0, Math.PI * 2); g.fill(); });

      // Laurels
      const laurel = (x, flip) => {
        g.save();
        g.translate(x, H / 2 + 8);
        g.scale(flip ? -1 : 1, 1);
        g.strokeStyle = '#8A5418';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(6, 30); g.quadraticCurveTo(-8, 4, 2, -30); g.stroke();
        g.fillStyle = '#9A6020';
        for (let k = 0; k < 6; k++) {
          const t = k / 5;
          const px = 6 - 14 * Math.sin(t * Math.PI) * 0.6 + (t * -4);
          const py = 30 - t * 58;
          g.save(); g.translate(px, py); g.rotate(-0.9 + t * 0.4);
          g.beginPath(); g.ellipse(-5, 0, 6, 2.6, 0, 0, Math.PI * 2); g.fill();
          g.restore();
          g.save(); g.translate(px + 1, py - 2); g.rotate(0.5 + t * 0.3);
          g.beginPath(); g.ellipse(5, 0, 5.5, 2.4, 0, 0, Math.PI * 2); g.fill();
          g.restore();
        }
        g.restore();
      };
      laurel(42, false);
      laurel(W - 42, true);

      // "Scratch Card"
      g.fillStyle = '#5A0A18';
      g.textAlign = 'center';
      g.font = '900 34px Georgia, "Times New Roman", serif';
      g.fillText(c.foilLine1 || 'Scratch', W / 2, 88);
      g.fillText(c.foilLine2 || 'Card', W / 2, 124);

      // Peeled corner (bottom right)
      g.beginPath();
      g.moveTo(W - 46, H); g.quadraticCurveTo(W - 8, H - 6, W, H - 44); g.lineTo(W, H); g.closePath();
      g.fillStyle = '#4E0618';
      g.fill();
      const curl = g.createLinearGradient(W - 46, H - 44, W, H);
      curl.addColorStop(0, '#FFE7A0');
      curl.addColorStop(0.6, '#E2A73A');
      curl.addColorStop(1, '#9A6516');
      g.beginPath();
      g.moveTo(W - 46, H - 2); g.quadraticCurveTo(W - 40, H - 40, W - 2, H - 44); g.quadraticCurveTo(W - 22, H - 24, W - 46, H - 2);
      g.fillStyle = curl;
      g.fill();
      g.restore();
    }

    function clearedFraction() {
      const data = g.getImageData(0, 0, canvas.width, canvas.height).data;
      const step = Math.max(4, Math.round(8 * dpr));
      let total = 0, clear = 0;
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          total++;
          if (data[(y * canvas.width + x) * 4 + 3] < 40) clear++;
        }
      }
      return clear / total;
    }

    function reveal() {
      if (revealed) return;
      revealed = true;
      drawing = false;
      canvas.classList.add('gone');
      foot.style.display = 'none';
      cta.classList.add('show');
      if (soundOn) snd.playRewardChime();
      fireConfetti(['#FFD54A', '#C8102E', '#FFFFFF', '#F7CB62']);
      // A second, wider burst from both sides
      if (typeof window.confetti === 'function') {
        setTimeout(() => {
          window.confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: ['#FFD54A', '#C8102E', '#FFFFFF'] });
          window.confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: ['#FFD54A', '#C8102E', '#FFFFFF'] });
        }, 250);
      }
      ctx.emit('paytm_scratch_revealed', { widgetId: widget.id, offer: `${offerTitle} ${offerBrand}`, code: couponCode });
    }

    function scratchTo(x, y) {
      if (revealed) return;
      g.save();
      g.globalCompositeOperation = 'destination-out';
      g.lineWidth = 40;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(last ? last.x : x, last ? last.y : y);
      g.lineTo(x + 0.01, y);
      g.stroke();
      g.restore();
      last = { x, y };
      const now = performance.now();
      if (soundOn && now - lastSound > 90) { lastSound = now; snd.playScratchFoil(); }
      if (++moves >= 6) {
        moves = 0;
        if (clearedFraction() * 100 >= threshold) reveal();
      }
    }

    // Map a pointer to canvas coordinates, undoing the foil's -4deg tilt.
    const pos = (e) => {
      const r = wrap.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const ux = dx * Math.cos(-TILT) - dy * Math.sin(-TILT);
      const uy = dx * Math.sin(-TILT) + dy * Math.cos(-TILT);
      return { x: W / 2 + ux, y: H / 2 + uy };
    };
    canvas.onpointerdown = (e) => {
      e.preventDefault();
      drawing = true;
      last = null;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      const p = pos(e);
      scratchTo(p.x, p.y);
    };
    canvas.onpointermove = (e) => { if (drawing) { const p = pos(e); scratchTo(p.x, p.y); } };
    canvas.onpointerup = canvas.onpointercancel = () => {
      drawing = false;
      last = null;
      if (!revealed && clearedFraction() * 100 >= threshold) reveal();
    };

    const copyCode = () => {
      navigator.clipboard?.writeText(couponCode).catch(() => {});
      mount.querySelector('#pcsCodeHint').textContent = 'Copied!';
      if (soundOn) snd.playToastPop();
      ctx.emit('paytm_coupon_copied', { widgetId: widget.id, code: couponCode });
    };
    mount.querySelector('#pcsCode').onclick = () => { if (revealed) copyCode(); };
    cta.onclick = () => {
      copyCode();
      cta.textContent = 'Copied! Use it at checkout';
    };
    mount.querySelector('#ptmChestReset').onclick = drawFoil;

    drawFoil();
  }

  // =========================================================================
  // 5. PAYTM SPIN & WIN + YELLOW STARBURST (ScreenRecording_11-10-2026 22-17-38_1.mp4 pt2)
  // =========================================================================
  // Spin and Win wheel: purple stage, crown header, deal tabs, gold bulb rim with gem pointer,
  // four gradient slices with gold icons, star coin hub, lit pedestal and SPIN pill.
  const PSW_ICONS = {
    perfume: `<svg viewBox="0 0 48 48"><rect x="18" y="4" width="12" height="8" rx="2" fill="#D9C6F5" stroke="#9C7BD6" stroke-width="1.2"/><rect x="21" y="11" width="6" height="5" fill="#B9A0E6"/><rect x="11" y="16" width="26" height="28" rx="7" fill="url(#pswGlass)" stroke="#E9DAFF" stroke-width="1.5"/><rect x="17" y="26" width="14" height="9" rx="2" fill="#F7E6FF" opacity=".9"/><path d="M15 21v16" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/></svg>`,
    music: `<svg viewBox="0 0 48 48"><path d="M18 10l20-5v26" stroke="url(#pswGoldS)" stroke-width="4.5" fill="none" stroke-linejoin="round"/><path d="M18 10v26" stroke="url(#pswGoldS)" stroke-width="4.5"/><path d="M18 10l20-5v6l-20 5z" fill="#F2B414"/><ellipse cx="12" cy="37" rx="7.5" ry="6" fill="url(#pswGold)"/><ellipse cx="32" cy="32" rx="7.5" ry="6" fill="url(#pswGold)"/></svg>`,
    gift: `<svg viewBox="0 0 48 48"><rect x="6" y="20" width="36" height="24" rx="3" fill="url(#pswGold)"/><rect x="4" y="14" width="40" height="9" rx="2.5" fill="#FFD84A"/><rect x="21" y="14" width="6" height="30" fill="#E39A00"/><path d="M24 14c-4-8-14-10-14-4 0 4 8 4 14 4zM24 14c4-8 14-10 14-4 0 4-8 4-14 4z" fill="#FFD84A" stroke="#C98200" stroke-width="1.5"/></svg>`,
    headphones: `<svg viewBox="0 0 48 48"><path d="M8 28v-4a16 16 0 0132 0v4" stroke="url(#pswGoldS)" stroke-width="4.5" fill="none" stroke-linecap="round"/><rect x="4" y="26" width="11" height="16" rx="5" fill="url(#pswGold)"/><rect x="33" y="26" width="11" height="16" rx="5" fill="url(#pswGold)"/></svg>`,
    coin: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="url(#pswGold)"/><circle cx="24" cy="24" r="15" fill="none" stroke="#C98200" stroke-width="2"/><text x="24" y="31" text-anchor="middle" font-family="Arial" font-weight="900" font-size="20" fill="#A86400">₹</text></svg>`
  };
  // Older configs used emoji icons; map them onto the drawn icons.
  const PSW_EMOJI = { '🎁': 'gift', '🎧': 'headphones', '🎵': 'music', '🎶': 'music', '👟': 'perfume', '💰': 'coin', '🪙': 'coin' };
  const PSW_DEFAULT_SLICES = [
    { label: '30 Days Free Pro', color: '#2160F0', icon: 'music' },
    { label: 'Flat ₹5 Cashback', color: '#D81B6A', icon: 'gift' },
    { label: '₹100 Off Deal', color: '#0FA9AE', icon: 'headphones' },
    { label: 'At Rs.549', color: '#7426DB', icon: 'perfume' }
  ];

  const PSW_CSS = `
    .psw-stage { background: radial-gradient(ellipse at 50% 42%, #5A2590 0%, #3B1466 45%, #1F0838 100%) !important; color:#fff; padding: 16px 14px 18px !important; position:relative; overflow:hidden; font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; display:flex; flex-direction:column; }
    .psw-head { display:flex; align-items:center; gap:10px; position:relative; z-index:2; }
    .psw-back { font-size:20px; font-weight:700; cursor:pointer; line-height:1; }
    .psw-title { font-size:21px; font-weight:900; letter-spacing:.2px; white-space:nowrap; }
    .psw-crown { width:62px; height:44px; margin-left:auto; filter: drop-shadow(0 3px 8px rgba(255,190,40,.5)); }
    .psw-tabs { display:flex; gap:6px; margin: 12px 0 6px; position:relative; z-index:2; }
    .psw-tab { flex:1; min-width:0; height:34px; border-radius:18px; border:1.5px solid rgba(190,140,255,.55); background: rgba(40,10,70,.55); color:#fff; font-family:inherit; font-size:11.5px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:5px; cursor:pointer; white-space:nowrap; padding: 0 6px; }
    .psw-tab svg { width:15px; height:15px; flex:none; }
    .psw-tab.active { border-color:#FFF0A6; color:#3D2200; background: linear-gradient(180deg,#FFF0A0,#FFD24A 55%,#F5B312); box-shadow: 0 0 14px rgba(255,200,60,.55), 0 3px 0 #B87400; }
    .psw-wheel-wrap { position:relative; width:290px; height:290px; margin: 14px auto 0; z-index:2; }
    .psw-wheel { width:100%; height:100%; overflow:visible; filter: drop-shadow(0 0 18px rgba(255,170,40,.45)); }
    .psw-slices { transform-origin: 150px 150px; transform-box: view-box; }
    .psw-bulb { animation: pswTwinkle 1s ease-in-out infinite; }
    .psw-bulb.alt { animation-delay: .5s; }
    @keyframes pswTwinkle { 0%,100% { opacity:1; } 50% { opacity:.45; } }
    .psw-pointer { position:absolute; left:50%; top:-14px; width:36px; height:52px; transform: translateX(-50%); z-index:3; filter: drop-shadow(0 4px 6px rgba(0,0,0,.45)); transform-origin: 50% 20%; }
    .psw-pointer.tick { animation: pswTick .12s ease; }
    @keyframes pswTick { 50% { transform: translateX(-50%) rotate(-10deg); } }
    .psw-pedestal { position:relative; width:300px; height:64px; margin: -26px auto 0; z-index:1; }
    .psw-confetti { position:absolute; z-index:1; pointer-events:none; }
    .psw-gift { position:absolute; bottom:22px; width:58px; height:58px; z-index:2; animation: gwFloatCoin 2.8s ease-in-out infinite; }
    .psw-spin { position:relative; z-index:3; margin: 18px auto 0; width:236px; height:62px; border-radius:32px; border:3px solid #FFF0A6; cursor:pointer; font-family:inherit; background: linear-gradient(180deg,#FFEB7A 0%,#FFC82A 50%,#F2A007 100%); box-shadow: 0 6px 0 #A85F00, 0 0 22px rgba(255,200,40,.6), inset 0 2px 0 rgba(255,255,255,.6); display:flex; align-items:center; justify-content:center; gap:14px; color:#3A2200; font-size:28px; font-weight:900; letter-spacing:.5px; transition: transform .08s, box-shadow .08s; }
    .psw-spin:active:not(:disabled) { transform: translateY(5px); box-shadow: 0 1px 0 #A85F00, 0 0 14px rgba(255,200,40,.45), inset 0 2px 0 rgba(255,255,255,.6); }
    .psw-spin:disabled { cursor:default; filter: saturate(.55) brightness(.85); }
    .psw-count { display:flex; align-items:center; gap:6px; height:36px; padding: 0 12px 0 5px; border-radius:20px; background:#2A1406; color:#FFE27A; font-size:20px; }
    .psw-count svg { width:26px; height:26px; }
    .psw-win { position:absolute; inset:0; z-index:20; display:none; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:24px; background: rgba(20,4,36,.88); }
    .psw-win.show { display:flex; animation: gwPopIn .3s ease; }
    .psw-rays { position:absolute; left:50%; top:42%; width:420px; height:420px; transform: translate(-50%,-50%); background: repeating-conic-gradient(from 0deg, rgba(255,210,80,.22) 0deg 10deg, transparent 10deg 20deg); border-radius:50%; mask-image: radial-gradient(circle, #000 25%, transparent 70%); -webkit-mask-image: radial-gradient(circle, #000 25%, transparent 70%); animation: gwSunburstSpin 14s linear infinite; }
    .psw-win-card { position:relative; width:250px; border-radius:22px; padding:20px 16px 16px; background: linear-gradient(180deg,#4A1A7E,#2A0B4D); border:2px solid #FFD24A; box-shadow: 0 0 30px rgba(255,200,60,.45); }
    .psw-win-icon { width:84px; height:84px; margin: -58px auto 6px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 0 4px #FFD24A, 0 8px 18px rgba(0,0,0,.45); }
    .psw-win-icon svg { width:50px; height:50px; }
    .psw-win .won { font-size:12px; font-weight:800; letter-spacing:2px; color:#FFD43B; text-transform:uppercase; }
    .psw-win .prize { margin: 6px 0 14px; font-size:21px; font-weight:900; line-height:1.2; }
    .psw-win-btn { width:100%; height:44px; border-radius:22px; border:2px solid #FFF0A6; cursor:pointer; font-family:inherit; font-size:15px; font-weight:900; color:#3A2200; background: linear-gradient(180deg,#FFEB7A,#F2A007); box-shadow: 0 4px 0 #A85F00; }
    .psw-win-link { margin-top:12px; background:none; border:none; color:#E3D2FF; font-family:inherit; font-size:12.5px; font-weight:700; cursor:pointer; text-decoration: underline; }
  `;

  const PSW_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <radialGradient id="pswGold" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#FFF2A8"/><stop offset=".5" stop-color="#F7BE1A"/><stop offset="1" stop-color="#C47F00"/></radialGradient>
    <linearGradient id="pswGoldS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE98A"/><stop offset="1" stop-color="#D99000"/></linearGradient>
    <linearGradient id="pswGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3C6FF"/><stop offset="1" stop-color="#B05BE8"/></linearGradient>
    <linearGradient id="pswRim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE98A"/><stop offset=".5" stop-color="#F2AE14"/><stop offset="1" stop-color="#B86E00"/></linearGradient>
    <linearGradient id="pswCrown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE98A"/><stop offset=".6" stop-color="#F5B814"/><stop offset="1" stop-color="#C98200"/></linearGradient>
  </defs></svg>`;

  function pswShade(hex, amt) {
    // amt > 0 lightens toward white, amt < 0 darkens toward black.
    const n = parseInt(String(hex).replace('#', ''), 16);
    if (Number.isNaN(n)) return hex;
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt)));
    return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  function renderPaytmSpinWin(mount, widget, ctx) {
    const c = widget.config;
    const snd = ctx.sound;
    const soundOn = c.soundEnabled !== false;
    const initialSpins = Number(c.spinsLeft ?? 3);
    let spinsLeft = initialSpins;
    let rotation = 0;
    let isSpinning = false;
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const slices = (Array.isArray(c.slices) && c.slices.length >= 2 ? c.slices : PSW_DEFAULT_SLICES).map((s) => ({ ...s, iconKey: PSW_ICONS[s.icon] ? s.icon : PSW_EMOJI[s.icon] || null }));
    const tabs = Array.isArray(c.tabs) && c.tabs.length ? c.tabs : ['Top Deals', 'Steal Deals', 'Electronics'];
    let activeTab = 0;

    if (!document.getElementById('psw-styles')) {
      const st = document.createElement('style');
      st.id = 'psw-styles';
      st.textContent = PSW_CSS;
      document.head.appendChild(st);
    }

    const iconSvg = (s) => (s.iconKey ? PSW_ICONS[s.iconKey] : `<svg viewBox="0 0 48 48"><text x="24" y="34" text-anchor="middle" font-size="28">${esc(s.icon || '🎁')}</text></svg>`);
    const tabIcons = [
      `<svg viewBox="0 0 24 24"><path d="M3 18L2 7l6 5 4-7 4 7 6-5-1 11z" fill="currentColor"/><rect x="3" y="19" width="18" height="2.5" rx="1" fill="currentColor"/></svg>`,
      `<svg viewBox="0 0 24 24"><path d="M3 12V4h8l10 10-8 8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="7.5" cy="8.5" r="1.6" fill="currentColor"/></svg>`,
      `<svg viewBox="0 0 24 24"><rect x="2.5" y="4" width="19" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
    ];

    // Wheel geometry (viewBox 300x300, centre 150,150). Slice i spans clockwise from the top.
    const n = slices.length;
    const arc = 360 / n;
    const R = 120;
    const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [150 + r * Math.cos(a), 150 + r * Math.sin(a)]; };
    const sliceSvg = slices.map((s, i) => {
      const [x1, y1] = pt(i * arc, R);
      const [x2, y2] = pt((i + 1) * arc, R);
      const mid = (i + 0.5) * arc;
      const [lx, ly] = pt(mid, R * 0.56);
      const tilt = Math.sin(mid * Math.PI / 180) >= 0 ? 18 : -18;
      const words = String(s.label).split(' ');
      // Two lines for longer labels: pick the split with the most even line lengths (ties: shorter first line).
      let lines = [s.label];
      if (String(s.label).length > 10 && words.length > 1) {
        let best = null;
        for (let k = 1; k < words.length; k++) {
          const a = words.slice(0, k).join(' ');
          const b = words.slice(k).join(' ');
          const score = Math.max(a.length, b.length) * 100 + a.length;
          if (!best || score < best.score) best = { score, lines: [a, b] };
        }
        lines = best.lines;
      }
      return `
        <path d="M150 150 L${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${arc > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="url(#pswSlice${i})" stroke="#FFD24A" stroke-opacity=".55" stroke-width="1.2"/>
        <g transform="translate(${lx.toFixed(1)} ${ly.toFixed(1)}) rotate(${tilt})">
          <g transform="translate(-17 ${lines.length > 1 ? -46 : -40})">${iconSvg(s).replace('<svg ', '<svg width="34" height="34" ')}</g>
          <text text-anchor="middle" font-family="Arial" font-weight="900" font-size="${lines.length > 1 ? 15 : 16}" fill="#fff" stroke="rgba(30,0,40,.35)" stroke-width="2.5" paint-order="stroke">
            ${lines.map((l, k) => `<tspan x="0" dy="${k === 0 ? 8 : 17}">${esc(l)}</tspan>`).join('')}
          </text>
        </g>`;
    }).join('');
    const sliceGrads = slices.map((s, i) => `<radialGradient id="pswSlice${i}" cx="150" cy="150" r="${R}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${pswShade(s.color, 0.35)}"/><stop offset=".55" stop-color="${s.color}"/><stop offset="1" stop-color="${pswShade(s.color, -0.35)}"/></radialGradient>`).join('');
    const rimBulbs = Array.from({ length: 24 }, (_, i) => { const [x, y] = pt(i * 15 + 7.5, 136); return `<circle class="psw-bulb ${i % 2 ? 'alt' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="#FFF7D0" stroke="#FFD24A" stroke-width="1.5" style="filter: drop-shadow(0 0 4px #FFD54A)"/>`; }).join('');
    const pedBulbs = Array.from({ length: 13 }, (_, i) => { const t = (i + 0.5) / 13; const x = 22 + t * 256; const y = 40 + Math.sin(t * Math.PI) * 13; return `<circle class="psw-bulb ${i % 2 ? 'alt' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="#FFF7D0" style="filter: drop-shadow(0 0 4px #FFD54A)"/>`; }).join('');
    const confetti = [[18, 150, -30], [300, 170, 40], [26, 470, 20], [300, 470, -35], [292, 112, 10]].map(([x, y, r]) => `<svg class="psw-confetti" style="left:${x}px; top:${y}px; transform: rotate(${r}deg)" width="22" height="14" viewBox="0 0 22 14"><path d="M2 10c4-8 8 4 12-4s6-2 6-2" stroke="#FFC53A" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`).join('');
    const gift = (color, side) => `<svg class="psw-gift" style="${side}:-6px" viewBox="0 0 64 64"><rect x="8" y="28" width="48" height="30" rx="4" fill="${color}"/><rect x="5" y="20" width="54" height="11" rx="3" fill="${pswShade(color, 0.2)}"/><rect x="28" y="20" width="8" height="38" fill="#FFC82A"/><path d="M32 20c-6-10-18-12-18-4 0 5 10 5 18 4zM32 20c6-10 18-12 18-4 0 5-10 5-18 4z" fill="#FFC82A" stroke="#D99A00" stroke-width="1.5"/></svg>`;

    mount.innerHTML = `
      <div class="gw-phone-frame psw-stage">
        ${PSW_DEFS}
        ${confetti}
        <div class="psw-head">
          <span class="psw-back" id="pswBack">&larr;</span>
          <span class="psw-title">${esc(c.title || 'Spin and Win')}</span>
          <svg class="psw-crown" viewBox="0 0 90 60">
            <path d="M8 34c-4-8-2-18 4-24M82 34c4-8 2-18-4-24" stroke="#C99A2E" stroke-width="2" fill="none"/>
            ${[[9, 26, -20], [7, 18, -5], [10, 11, 15], [81, 26, 20], [83, 18, 5], [80, 11, -15]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="4.4" fill="#D9A43A" transform="rotate(${a} ${x} ${y})"/>`).join('')}
            <path d="M20 46L16 16l15 13L45 6l14 23 15-13-4 30z" fill="url(#pswCrown)" stroke="#B87400" stroke-width="1.8" stroke-linejoin="round"/>
            <rect x="19" y="44" width="52" height="8" rx="3" fill="url(#pswCrown)" stroke="#B87400" stroke-width="1.8"/>
            <circle cx="16" cy="14" r="4" fill="url(#pswCrown)"/><circle cx="45" cy="5" r="4.5" fill="url(#pswCrown)"/><circle cx="74" cy="14" r="4" fill="url(#pswCrown)"/>
          </svg>
        </div>

        <div class="psw-tabs">
          ${tabs.slice(0, 3).map((t, i) => `<button class="psw-tab ${i === activeTab ? 'active' : ''}" data-i="${i}">${tabIcons[i] || ''}<span>${esc(t)}</span></button>`).join('')}
        </div>

        <div class="psw-wheel-wrap">
          <svg class="psw-pointer" viewBox="0 0 36 52"><path d="M18 50L4 18a14 14 0 0128 0z" fill="url(#pswRim)" stroke="#9A5A00" stroke-width="1.5"/><path d="M18 42L9 19l9-9 9 9z" fill="#E0111F"/><path d="M18 10l-9 9h18z" fill="#FF6070"/><path d="M14 18l4-4" stroke="#fff" stroke-width="1.6" opacity=".8"/></svg>
          <svg class="psw-wheel" viewBox="0 0 300 300">
            <defs>${sliceGrads}</defs>
            <circle cx="150" cy="150" r="146" fill="url(#pswRim)"/>
            <circle cx="150" cy="150" r="127" fill="#5A1E00"/>
            <circle cx="150" cy="150" r="125" fill="none" stroke="#FFE98A" stroke-width="2"/>
            ${rimBulbs}
            <g class="psw-slices" id="pswSlices">${sliceSvg}</g>
            <circle cx="150" cy="150" r="27" fill="url(#pswRim)" stroke="#B86E00" stroke-width="2"/>
            <circle cx="150" cy="150" r="21" fill="url(#pswGold)" stroke="#E7A512" stroke-width="1.5"/>
            <path d="M150 136l4.4 9 9.9 1.4-7.2 7 1.7 9.8-8.8-4.6-8.8 4.6 1.7-9.8-7.2-7 9.9-1.4z" fill="#FFE57A" stroke="#C98200" stroke-width="1.4" stroke-linejoin="round"/>
          </svg>
        </div>

        <svg class="psw-pedestal" viewBox="0 0 300 64">
          <ellipse cx="150" cy="40" rx="140" ry="20" fill="#7A0F3A"/>
          <ellipse cx="150" cy="34" rx="140" ry="20" fill="url(#pswRim)"/>
          <ellipse cx="150" cy="30" rx="128" ry="15" fill="#A0164C"/>
          <ellipse cx="150" cy="27" rx="100" ry="10" fill="#C21F5C" opacity=".8"/>
          ${pedBulbs}
        </svg>

        ${gift('#8E36D8', 'left')}${gift('#E0306E', 'right')}

        <button class="psw-spin" id="pswSpin"><span id="pswSpinLabel">SPIN</span><span class="psw-count">${PSW_ICONS.coin}<span id="pswCount">${spinsLeft}</span></span></button>

        <div class="psw-win" id="pswWin">
          <div class="psw-rays"></div>
          <div class="psw-win-card">
            <div class="psw-win-icon" id="pswWinIcon"></div>
            <div class="won">You won</div>
            <div class="prize" id="pswWinPrize"></div>
            <button class="psw-win-btn" id="pswRedeem">Redeem Now</button>
            <button class="psw-win-link" id="pswAgain">Spin again</button>
          </div>
        </div>
      </div>
    `;

    const $ = (sel) => mount.querySelector(sel);
    const spinBtn = $('#pswSpin');
    const wheel = $('#pswSlices');
    const pointer = $('.psw-pointer');
    const updateSpins = () => {
      $('#pswCount').textContent = spinsLeft;
      spinBtn.disabled = spinsLeft <= 0;
      $('#pswSpinLabel').textContent = spinsLeft <= 0 ? 'NO SPINS' : 'SPIN';
    };
    updateSpins();

    mount.querySelectorAll('.psw-tab').forEach((btn) => {
      btn.onclick = () => {
        activeTab = Number(btn.dataset.i);
        mount.querySelectorAll('.psw-tab').forEach((b) => b.classList.toggle('active', b === btn));
        ctx.emit('paytm_spin_tab_switched', { widgetId: widget.id, tab: tabs[activeTab] });
      };
    });

    const DURATION = 4200;
    const easeOut = (p) => 1 - Math.pow(1 - p, 3);
    spinBtn.onclick = () => {
      if (isSpinning || spinsLeft <= 0) return;
      isSpinning = true;
      spinsLeft--;
      updateSpins();
      spinBtn.disabled = true;

      const winIdx = Math.floor(Math.random() * n);
      // Land the middle of the winning slice under the top pointer, with a little jitter.
      const jitter = (Math.random() - 0.5) * arc * 0.6;
      const targetMod = (360 - ((winIdx + 0.5) * arc + jitter) % 360) % 360;
      const current = rotation % 360;
      const delta = 360 * 6 + ((targetMod - current + 360) % 360);
      const start = rotation;
      rotation += delta;

      wheel.style.transition = `transform ${DURATION}ms cubic-bezier(.15,.62,.18,1)`;
      wheel.style.transform = `rotate(${rotation}deg)`;

      // Tick each time a slice edge passes the pointer, slowing down with the wheel.
      const edges = Math.floor((start + delta) / arc) - Math.floor(start / arc);
      for (let k = 1; k <= edges; k++) {
        const angleDone = (Math.floor(start / arc) + k) * arc - start;
        const p = 1 - Math.cbrt(1 - Math.min(angleDone / delta, 1));
        setTimeout(() => {
          pointer.classList.remove('tick'); void pointer.offsetWidth; pointer.classList.add('tick');
          if (soundOn && snd.playWheelTick) snd.playWheelTick(1.2 - p * 0.35);
        }, p * DURATION);
      }

      setTimeout(() => {
        isSpinning = false;
        updateSpins();
        const prize = slices[winIdx];
        $('#pswWinPrize').textContent = prize.label;
        $('#pswWinIcon').innerHTML = iconSvg(prize);
        $('#pswWinIcon').style.background = `radial-gradient(circle at 35% 30%, ${pswShade(prize.color, 0.3)}, ${pswShade(prize.color, -0.3)})`;
        $('#pswRedeem').textContent = 'Redeem Now';
        $('#pswWin').classList.add('show');
        if (soundOn && snd.playStarburstWin) snd.playStarburstWin();
        fireConfetti(['#FFD43B', '#B266FF', '#FF4D8D', '#2DD4BF', '#FFFFFF']);
        ctx.emit('paytm_spin_won', { widgetId: widget.id, prize: prize.label });
      }, DURATION + 150);
    };

    $('#pswRedeem').onclick = () => {
      $('#pswRedeem').textContent = 'Redeemed ✓';
      ctx.emit('paytm_spin_redeemed', { widgetId: widget.id, prize: $('#pswWinPrize').textContent });
    };
    $('#pswAgain').onclick = () => {
      $('#pswWin').classList.remove('show');
      // Demo convenience: refill spins once they run out.
      if (spinsLeft <= 0) { spinsLeft = initialSpins || 3; updateSpins(); }
    };
  }

  // =========================================================================
  // 6. DUOLINGO FULL FLOW (ScreenRecording_11-05-2026 11-25-21_1.mp4)
  // =========================================================================
  function renderDuolingoFlow(mount, widget, ctx) {
    const c = widget.config;
    const snd = ctx.sound;
    let step = Number(c.startStep || 1); // 1: Lesson Complete, 2: Ignite Streak, 3: Streak Goal, 4: Rare Chest -> x3 XP
    let streakIgnited = false;
    let selectedGoal = 7;
    let chestPhase = 'quest'; // 'quest' | 'rare_chest' | 'potion_x3'
    let gems = 593;

    function renderView() {
      const topNav = `
        <div style="display: flex; justify-content: center; gap: 4px; padding: 8px 10px; background: rgba(0,0,0,0.25); z-index: 20;">
          ${[1, 2, 3, 4].map(n => `
            <button class="duoStageBtn" data-s="${n}" style="flex:1; padding:4px 0; border-radius:8px; border:none; font-size:10px; font-weight:800; cursor:pointer; background:${step===n?'#1CB0F6':'rgba(255,255,255,0.12)'}; color:#FFF;">S${n}</button>
          `).join('')}
        </div>
      `;

      if (step === 1) {
        mount.innerHTML = `
          <div class="gw-phone-frame" style="background: #FFFFFF; color: #3C3C3C;">
            ${topNav}
            <!-- Green Striped Banner Header -->
            <div style="background: linear-gradient(135deg, ${c.themeColor || '#58CC02'}, #2EC4B6); padding: 26px 16px 20px; text-align: center;">
              <div style="font-size: 64px; animation: gwPopIn 0.45s ease;">🦉✨</div>
              <div style="font-size: 24px; font-weight: 900; color: #FFF; text-shadow: 0 2px 0 rgba(0,0,0,0.15);">Lesson complete!</div>
            </div>

            <div style="flex: 1; padding: 20px 18px; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
              <div>
                <div style="font-size: 16px; font-weight: 800; color: #4B4B4B;">Who needs an owl?</div>
                <div style="font-size: 12px; color: #777777; margin-top: 2px;">When you've got an Oscar.</div>

                <!-- 3 Sequential Stat Cards -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 22px;">
                  <div style="border: 2px solid #FFC800; border-radius: 14px; overflow: hidden; animation: gwPopIn 0.3s ease;">
                    <div style="background: #FFC800; color: #FFF; font-size: 9px; font-weight: 900; padding: 4px;">TOTAL XP</div>
                    <div style="padding: 12px 4px; font-size: 16px; font-weight: 900; color: #FF9600;">⚡ ${c.xpEarned || 12}</div>
                  </div>
                  <div style="border: 2px solid #58CC02; border-radius: 14px; overflow: hidden; animation: gwPopIn 0.55s ease;">
                    <div style="background: #58CC02; color: #FFF; font-size: 9px; font-weight: 900; padding: 4px;">GOOD</div>
                    <div style="padding: 12px 4px; font-size: 16px; font-weight: 900; color: #58CC02;">🎯 ${c.accuracy || 78}%</div>
                  </div>
                  <div style="border: 2px solid #1CB0F6; border-radius: 14px; overflow: hidden; animation: gwPopIn 0.8s ease;">
                    <div style="background: #1CB0F6; color: #FFF; font-size: 9px; font-weight: 900; padding: 4px;">BLAZING</div>
                    <div style="padding: 12px 4px; font-size: 16px; font-weight: 900; color: #1CB0F6;">⏱ ${c.durationText || '0:49'}</div>
                  </div>
                </div>
              </div>

              <button id="duoClaimXpBtn" class="gw-btn-press" style="width: 100%; height: 48px; border-radius: 16px; border: none; background: #1CB0F6; border-bottom: 4px solid #1899D6; color: #FFF; font-size: 14px; font-weight: 900; text-transform: uppercase; cursor: pointer;">
                Claim XP
              </button>
            </div>
          </div>
        `;
        if (c.soundEnabled !== false) {
          snd.playMp3('/assets/duolingo/duo_lesson_complete.mp3', 0.65);
          setTimeout(() => snd.playMp3('/assets/duolingo/se_stats_audio_1.mp3', 0.6), 300);
          setTimeout(() => snd.playMp3('/assets/duolingo/se_stats_audio_2.mp3', 0.6), 550);
          setTimeout(() => snd.playMp3('/assets/duolingo/se_stats_audio_3.mp3', 0.6), 800);
        }
        mount.querySelector('#duoClaimXpBtn').onclick = () => {
          streakIgnited = false;
          step = 2;
          renderView();
        };

      } else if (step === 2) {
        if (!streakIgnited) {
          mount.innerHTML = `
            <div class="gw-phone-frame" style="background: #1A262B; color: #FFF; justify-content: space-between; text-align: center;">
              ${topNav}
              <div id="duoIgniteZone" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 24px;">
                <div style="width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle, rgba(255,150,0,0.45), transparent 70%); display: flex; align-items: center; justify-content: center; animation: gwFloatCoin 2s ease-in-out infinite;">
                  <span style="font-size: 72px; filter: drop-shadow(0 0 18px #FF9600);">🔥</span>
                </div>
                <div style="font-size: 18px; font-weight: 900; margin-top: 20px;">Tap or Swipe to ignite your streak!</div>
              </div>
              <div style="height: 20px;"></div>
            </div>
          `;
          mount.querySelector('#duoIgniteZone').onclick = () => {
            streakIgnited = true;
            if (c.soundEnabled !== false) snd.playMp3('/assets/duolingo/streak_milestone_flame.mp3', 0.75);
            fireConfetti(['#FF9600', '#FFC800', '#FFFFFF']);
            renderView();
          };
        } else {
          mount.innerHTML = `
            <div class="gw-phone-frame" style="background: #FFFFFF; color: #4B4B4B; text-align: center;">
              ${topNav}
              <div style="flex: 1; padding: 20px 18px; display: flex; flex-direction: column; justify-content: space-between; align-items: center;">
                <div style="border: 2px solid #E5E5E5; border-radius: 16px; padding: 10px 14px; font-size: 13px; font-weight: 700;">
                  A streak is born! Practice every day to build a habit.
                </div>

                <div style="animation: gwPopIn 0.4s ease;">
                  <div id="duoLottieFlame" style="width: 120px; height: 120px; margin: 0 auto;"></div>
                  <div style="font-size: 46px; font-weight: 900; color: #FF9600; line-height: 1;">${c.streakCount || 1}</div>
                  <div style="font-size: 18px; font-weight: 900; color: #FF9600;">day streak</div>
                </div>

                <!-- 7-Day Circle Row -->
                <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 6px;">
                  ${['Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We'].map((d, i) => `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                      <span style="font-size: 11px; font-weight: 800; color: ${i===0?'#FF9600':'#AFAFAF'};">${d}</span>
                      <div style="width: 26px; height: 26px; border-radius: 50%; background: ${i===0?'#FF9600':'#E5E5E5'}; color: #FFF; font-size: 12px; font-weight: 900; display: flex; align-items: center; justify-content: center;">${i===0?'✓':''}</div>
                    </div>
                  `).join('')}
                </div>

                <button id="duoSeeTomorrow" class="gw-btn-press" style="width: 100%; height: 48px; border-radius: 16px; border: none; background: #1CB0F6; border-bottom: 4px solid #1899D6; color: #FFF; font-size: 14px; font-weight: 900; cursor: pointer;">
                  SEE YOU TOMORROW
                </button>
              </div>
            </div>
          `;
          if (typeof window.lottie === 'object') {
            window.lottie.loadAnimation({
              container: mount.querySelector('#duoLottieFlame'),
              renderer: 'svg', loop: true, autoplay: true,
              path: '/assets/duolingo/friend_streak_coupled_flame.json'
            });
          }
          mount.querySelector('#duoSeeTomorrow').onclick = () => { step = 3; renderView(); };
        }

      } else if (step === 3) {
        mount.innerHTML = `
          <div class="gw-phone-frame" style="background: #FFFFFF; color: #4B4B4B;">
            ${topNav}
            <div style="flex: 1; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; align-items: center;">
              <div style="display: flex; justify-content: flex-end; width: 100%; color: #1CB0F6; font-weight: 900; font-size: 14px;">💎 ${gems}</div>
              <div style="border: 2px solid #E5E5E5; border-radius: 16px; padding: 10px 14px; font-size: 13px; font-weight: 700; text-align: center;">
                Let's commit to learning with a Streak Goal!
              </div>
              <div style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
                ${[[7, 35], [14, 140], [30, 210], [50, 350]].map(([d, g]) => `
                  <div class="duoGoalOption" data-d="${d}" style="border: 2px solid ${selectedGoal===d?'#1CB0F6':'#E5E5E5'}; background: ${selectedGoal===d?'#EBF8FF':'#FFF'}; border-radius: 14px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                    <span style="font-weight: 800; font-size: 14px; color: ${selectedGoal===d?'#1899D6':'#4B4B4B'};">${d} days</span>
                    <span style="font-size: 12px; font-weight: 700; color: #777;">Earn ${g} gems</span>
                  </div>
                `).join('')}
              </div>
              <button id="duoCommitBtn" class="gw-btn-press" style="width: 100%; height: 48px; border-radius: 16px; border: none; background: #1CB0F6; border-bottom: 4px solid #1899D6; color: #FFF; font-size: 14px; font-weight: 900; cursor: pointer;">
                COMMIT TO MY GOAL
              </button>
            </div>
          </div>
        `;
        mount.querySelectorAll('.duoGoalOption').forEach(el => {
          el.onclick = () => { selectedGoal = Number(el.getAttribute('data-d')); renderView(); };
        });
        mount.querySelector('#duoCommitBtn').onclick = () => {
          gems += 20;
          if (c.soundEnabled !== false) snd.playMp3('/assets/duolingo/star_chime.mp3', 0.7);
          chestPhase = 'quest';
          step = 4;
          renderView();
        };

      } else {
        if (chestPhase === 'quest') {
          mount.innerHTML = `
            <div class="gw-phone-frame" style="background: #FFFFFF; color: #4B4B4B;">
              ${topNav}
              <div style="flex: 1; padding: 20px 18px; display: flex; flex-direction: column; justify-content: space-between;">
                <div style="font-size: 22px; font-weight: 900; color: #CC348D; text-align: center;">+1 Quest Point!</div>
                <div style="background: #FFF9E6; border: 2px solid #FFC800; border-radius: 16px; padding: 14px;">
                  <div style="font-weight: 800; font-size: 13px; margin-bottom: 8px;">Start a streak ✦</div>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="flex: 1; height: 14px; background: #FFC800; border-radius: 7px;"></div>
                    <span style="font-size: 22px;">🧰</span>
                  </div>
                </div>
                <button id="duoOpenQuestChest" class="gw-btn-press" style="width: 100%; height: 48px; border-radius: 16px; border: none; background: #1CB0F6; border-bottom: 4px solid #1899D6; color: #FFF; font-size: 14px; font-weight: 900; cursor: pointer;">
                  OPEN CHEST
                </button>
              </div>
            </div>
          `;
          if (c.soundEnabled !== false) snd.playMp3('/assets/duolingo/daily_quest_quest_point_v1.mp3', 0.7);
          mount.querySelector('#duoOpenQuestChest').onclick = () => { chestPhase = 'rare_chest'; renderView(); };

        } else if (chestPhase === 'rare_chest') {
          mount.innerHTML = `
            <div class="gw-phone-frame" style="background: #26B6F7; color: #FFF; text-align: center;">
              ${topNav}
              <div id="duoTapRare" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 20px;">
                <div style="font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-bottom: 12px;">RARE</div>
                <div id="duoRareLottie" style="width: 220px; height: 220px;"></div>
                <div style="font-size: 16px; font-weight: 800; margin-top: 8px;">Tap to open!</div>
              </div>
            </div>
          `;
          const anim = typeof window.lottie === 'object' ? window.lottie.loadAnimation({
            container: mount.querySelector('#duoRareLottie'),
            renderer: 'svg', loop: false, autoplay: false,
            path: `/assets/duolingo/chest_open_${c.lottieTier || 'gold'}.json`
          }) : null;
          mount.querySelector('#duoTapRare').onclick = () => {
            if (anim) anim.play();
            if (c.soundEnabled !== false) snd.playMp3('/assets/duolingo/daily_quest_chest_open_v1.mp3', 0.75);
            setTimeout(() => { chestPhase = 'potion_x3'; renderView(); }, 950);
          };

        } else {
          mount.innerHTML = `
            <div class="gw-phone-frame" style="background: #7D54E6; color: #FFF; text-align: center;">
              ${topNav}
              <div style="flex: 1; padding: 24px 18px; display: flex; flex-direction: column; justify-content: space-between; align-items: center;">
                <div style="margin-top: 30px; animation: gwPopIn 0.4s ease;">
                  <div style="font-size: 86px; filter: drop-shadow(0 8px 20px rgba(0,0,0,0.25));">🧪</div>
                  <div style="font-size: 38px; font-weight: 900; margin-top: 8px;">x3</div>
                  <div style="font-size: 15px; font-weight: 700; margin-top: 8px; max-width: 240px;">
                    Amazing work! Earn <span style="color: #FDE047;">triple XP</span> for the next 10 minutes.
                  </div>
                </div>
                <button id="duoFinishFlow" class="gw-btn-press" style="width: 100%; height: 48px; border-radius: 16px; border: none; background: #FFFFFF; border-bottom: 4px solid #E2E8F0; color: #7D54E6; font-size: 14px; font-weight: 900; cursor: pointer;">
                  CONTINUE
                </button>
              </div>
            </div>
          `;
          if (c.soundEnabled !== false) snd.playMp3('/assets/duolingo/xp_boost_overlay_3x.mp3', 0.75);
          fireConfetti(['#FDE047', '#FFFFFF', '#A855F7']);
          mount.querySelector('#duoFinishFlow').onclick = () => {
            step = 1;
            renderView();
            ctx.emit('duolingo_flow_completed', { widgetId: widget.id });
          };
        }
      }

      mount.querySelectorAll('.duoStageBtn').forEach(b => {
        b.onclick = () => {
          step = Number(b.getAttribute('data-s'));
          streakIgnited = false;
          chestPhase = 'quest';
          renderView();
        };
      });
    }
    renderView();
  }

  // =========================================================================
  // 7. CRED SPIN THE WHEEL (1:1 with ScreenRecording 11-16-2026 20-31-28)
  // =========================================================================
  // Spin The Wheel (partner deals): purple stage, wallet pills, gold italic title with gifts,
  // gold bulb rim on a glowing panel, product slices with drawn trimmers, partner hub,
  // lit pedestal, SPIN pill and Details. Win opens a voucher in the same theme.
  // Each slice: label, color, and either `icon` (a key of CRW icon set below) or `image` (a product
  // image URL). Without either, the icon is guessed from the label.
  const CRW_DEFAULT_SEGMENTS = [
    { label: 'Headphones at ₹999', color: '#1D6BF2', icon: 'headphones' },
    { label: 'Flat ₹100 Cashback', color: '#B321E8', icon: 'cashback' },
    { label: 'Mystery Gift Box', color: '#F26A0C', icon: 'gift' },
    { label: '500 Bonus Coins', color: '#5DB817', icon: 'coin' }
  ];

  const CRW_EXTRA_ICONS = {
    cashback: `<svg viewBox="0 0 48 48"><rect x="3" y="12" width="42" height="26" rx="4" fill="#2DB24A" stroke="#1E7A33" stroke-width="1.5"/><rect x="7" y="16" width="34" height="18" rx="2" fill="none" stroke="#9BE5A8" stroke-width="1.2"/><circle cx="24" cy="25" r="7.5" fill="#FFD84A"/><text x="24" y="29.5" text-anchor="middle" font-family="Arial" font-weight="900" font-size="11" fill="#7A4A00">₹</text></svg>`,
    coupon: `<svg viewBox="0 0 48 48"><path d="M4 14h40v7a4 4 0 0 0 0 8v7H4v-7a4 4 0 0 0 0-8z" fill="#FF4F8B" stroke="#C2185B" stroke-width="1.5"/><path d="M17 15v20" stroke="#FFC1D6" stroke-width="1.6" stroke-dasharray="2 2"/><text x="31" y="30" text-anchor="middle" font-family="Arial" font-weight="900" font-size="12" fill="#fff">%</text></svg>`,
    phone: `<svg viewBox="0 0 48 48"><rect x="13" y="3" width="22" height="42" rx="5" fill="#23232B" stroke="#8C949E" stroke-width="1.5"/><rect x="16" y="8" width="16" height="30" rx="2" fill="url(#pswGlass)"/><circle cx="24" cy="41.5" r="1.6" fill="#8C949E"/></svg>`
  };
  const CRW_ICON_KEYS = ['headphones', 'gift', 'coin', 'cashback', 'coupon', 'phone', 'music', 'perfume', 'trimmer'];

  // Picks a slice's icon: explicit `icon`, else a guess from the label, else a gift.
  function crwIconKey(seg) {
    if (seg.icon && CRW_ICON_KEYS.includes(seg.icon)) return seg.icon;
    const l = String(seg.label || '').toLowerCase();
    if (/trimmer|shav|razor/.test(l)) return 'trimmer';
    if (/head|ear|audio|speaker/.test(l)) return 'headphones';
    if (/cashback|cash back|upi|wallet/.test(l)) return 'cashback';
    if (/coin|point/.test(l)) return 'coin';
    if (/coupon|voucher|%|off/.test(l)) return 'coupon';
    if (/phone|mobile/.test(l)) return 'phone';
    if (/music|song|pro|premium/.test(l)) return 'music';
    if (/perfume|fragrance|scent/.test(l)) return 'perfume';
    return 'gift';
  }
  // Only http(s) or same-site paths are used as images.
  function crwImageUrl(seg) {
    const u = String(seg.image || '').trim();
    return /^(https?:\/\/|\/)/i.test(u) ? u : '';
  }
  function crwIconSvg(key, accent) {
    if (key === 'trimmer') return crwTrimmer(accent);
    return CRW_EXTRA_ICONS[key] || PSW_ICONS[key] || PSW_ICONS.gift;
  }

  const CRW_CSS = `
    .crw-stage { background: radial-gradient(ellipse at 50% 45%, #4A1B7E 0%, #2C0D52 50%, #160628 100%) !important; color:#fff; padding: 14px 14px 18px !important; position:relative; overflow:hidden; font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; display:flex; flex-direction:column; align-items:center; }
    .crw-top { width:100%; display:flex; align-items:center; gap:6px; position:relative; z-index:3; }
    .crw-round { width:32px; height:32px; flex:none; border-radius:50%; background: rgba(70,40,120,.6); border:1px solid rgba(255,255,255,.12); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:13px; }
    .crw-round svg { width:15px; height:15px; }
    .crw-pill { height:30px; border-radius:16px; padding: 0 9px 0 5px; display:flex; align-items:center; gap:5px; font-size:13px; font-weight:900; white-space:nowrap; }
    .crw-pill svg { width:20px; height:20px; flex:none; }
    .crw-pill.coins { margin-left:auto; border:1.5px solid #C9922A; background: rgba(60,35,10,.55); color:#FFE27A; }
    .crw-pill.cash { border:1.5px solid #8C5BEA; background: rgba(50,20,90,.55); }
    .crw-pill.tix { border:1.5px solid #1F9E6A; background: rgba(10,50,40,.55); }
    .crw-title { position:relative; text-align:center; margin-top:8px; z-index:2; line-height:.9; font-family: Georgia, "Times New Roman", serif; font-style:italic; font-weight:900; }
    .crw-t1 { font-size:42px; color:#FFF6EA; text-shadow: 0 3px 0 rgba(90,40,10,.6), 0 0 14px rgba(255,220,180,.35); }
    .crw-t2 { font-size:46px; letter-spacing:-.5px; background: linear-gradient(180deg,#FFF3B0 0%,#FFD23A 45%,#F29A00 100%); -webkit-background-clip:text; background-clip:text; color:transparent; filter: drop-shadow(0 3px 0 #7A3A00) drop-shadow(0 0 10px rgba(255,190,40,.4)); white-space:nowrap; }
    .crw-swoosh { position:absolute; right:-6px; top:4px; width:86px; height:40px; }
    .crw-tgift { position:absolute; top:56px; width:48px; height:48px; animation: gwFloatCoin 2.8s ease-in-out infinite; }
    .crw-spark { position:absolute; width:12px; height:12px; }
    .crw-panel { position:relative; width:300px; margin-top:10px; padding-top:6px; border-radius:30px; background: linear-gradient(180deg, rgba(110,50,190,.35), rgba(60,20,110,.25)); box-shadow: inset 0 1px 0 rgba(200,160,255,.25), 0 0 24px rgba(140,70,255,.25); }
    .crw-wheel-wrap { position:relative; width:280px; height:280px; margin: 0 auto; z-index:2; }
    .crw-wheel { width:100%; height:100%; overflow:visible; filter: drop-shadow(0 0 18px rgba(255,170,40,.45)); }
    .crw-slices { transform-origin: 150px 150px; transform-box: view-box; }
    .crw-bulb { animation: crwTwinkle 1s ease-in-out infinite; }
    .crw-bulb.alt { animation-delay: .5s; }
    @keyframes crwTwinkle { 0%,100% { opacity:1; } 50% { opacity:.45; } }
    .crw-pointer { position:absolute; left:50%; top:-12px; width:40px; height:44px; transform: translateX(-50%); z-index:3; filter: drop-shadow(0 4px 6px rgba(0,0,0,.45)); }
    .crw-pedestal { position:relative; width:300px; height:58px; margin: -30px auto 0; z-index:1; display:block; }
    .crw-spin { margin-top:16px; width:250px; height:60px; border-radius:32px; border:3px solid #FFF0A6; cursor:pointer; font-family:inherit; background: linear-gradient(180deg,#FFEB7A 0%,#FFC82A 50%,#F2A007 100%); box-shadow: 0 6px 0 #A85F00, 0 0 22px rgba(255,200,40,.6), inset 0 2px 0 rgba(255,255,255,.6); display:flex; align-items:center; justify-content:center; gap:12px; color:#3A2200; font-size:30px; font-weight:900; letter-spacing:.5px; transition: transform .08s, box-shadow .08s; position:relative; z-index:2; }
    .crw-spin:active:not(:disabled) { transform: translateY(5px); box-shadow: 0 1px 0 #A85F00, 0 0 14px rgba(255,200,40,.45), inset 0 2px 0 rgba(255,255,255,.6); }
    .crw-spin:disabled { cursor:default; filter: saturate(.55) brightness(.85); }
    .crw-spin .tri { width:0; height:0; border-top:12px solid transparent; border-bottom:12px solid transparent; border-left:18px solid #3A2200; }
    .crw-details { margin-top:16px; height:36px; padding: 0 18px 0 10px; border-radius:18px; border:1.5px solid rgba(190,150,255,.4); background: rgba(40,15,75,.6); color:#E8DEFF; font-family:inherit; font-size:14px; font-weight:700; display:flex; align-items:center; gap:8px; cursor:pointer; }
    .crw-details .i { width:20px; height:20px; border-radius:50%; background:#E8DEFF; color:#2C0D52; display:flex; align-items:center; justify-content:center; font-family: Georgia, serif; font-weight:900; font-size:13px; }
    .crw-note { position:absolute; left:14px; right:14px; bottom:62px; z-index:6; padding:10px 12px; border-radius:14px; background: rgba(20,6,40,.94); border:1px solid rgba(190,150,255,.35); font-size:11.5px; line-height:1.4; color:#E8DEFF; display:none; }
    .crw-note.show { display:block; animation: gwPopIn .2s ease; }
    .crw-vcard { width:100%; margin-top:16px; border-radius:24px; overflow:hidden; background: linear-gradient(180deg,#4A1A7E,#2A0B4D); border:2px solid #FFD24A; box-shadow: 0 0 30px rgba(255,200,60,.4); animation: gwPopIn .35s ease; }
    .crw-vhero { position:relative; height:200px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
    .crw-vhero .rays { position:absolute; left:50%; top:50%; width:420px; height:420px; transform: translate(-50%,-50%); background: repeating-conic-gradient(from 0deg, rgba(255,255,255,.14) 0deg 10deg, transparent 10deg 20deg); animation: gwSunburstSpin 16s linear infinite; }
    .crw-vhero img { width:100%; height:100%; object-fit:cover; position:relative; }
    .crw-vhero .partner { position:absolute; bottom:10px; left:0; right:0; text-align:center; font-size:12px; font-weight:900; letter-spacing:2px; text-shadow: 0 2px 6px rgba(0,0,0,.7); }
    .crw-vbody { position:relative; padding:18px 16px 18px; background: rgba(20,6,40,.55); border-top: 2px dashed rgba(255,210,80,.5); }
    .crw-vbody .won { font-size:12px; font-weight:800; letter-spacing:2px; color:#FFD43B; text-transform:uppercase; }
    .crw-vbody .prize { margin: 6px 0 12px; font-size:22px; font-weight:900; font-family: Georgia, serif; font-style:italic; }
    .crw-code { display:flex; align-items:center; justify-content:space-between; gap:8px; border:1.5px dashed rgba(255,210,80,.7); border-radius:14px; padding:10px 12px; margin-bottom:14px; font-weight:900; letter-spacing:1px; color:#FFE27A; cursor:pointer; }
    .crw-code small { color:#E8DEFF; font-weight:700; letter-spacing:0; font-size:11.5px; }
    .crw-vbtn { width:100%; height:46px; border-radius:23px; border:2px solid #FFF0A6; cursor:pointer; font-family:inherit; font-size:15px; font-weight:900; color:#3A2200; background: linear-gradient(180deg,#FFEB7A,#F2A007); box-shadow: 0 4px 0 #A85F00; }
    .crw-vlink { margin-top:14px; background:none; border:none; color:#E3D2FF; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; text-decoration: underline; }
  `;

  function crwTrimmer(accent) {
    return `<svg viewBox="0 0 40 64">
      <rect x="10" y="2" width="20" height="9" rx="2" fill="#D8DDE4" stroke="#8C949E" stroke-width="1"/>
      <path d="M14 2v6M17 2v6M20 2v6M23 2v6M26 2v6" stroke="#7A828C" stroke-width="1.1"/>
      <path d="M9 11h22l-2 44a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6z" fill="#23232B"/>
      <path d="M27 13h4l-2 42a6 6 0 0 1-3 5z" fill="${accent}"/>
      <path d="M12 15l1 34" stroke="#fff" stroke-width="1.6" opacity=".25" stroke-linecap="round"/>
      <rect x="15.5" y="26" width="7" height="12" rx="3.5" fill="${accent}" stroke="#111" stroke-width="1"/>
    </svg>`;
  }

  function renderCredWheel(mount, widget, ctx) {
    const c = widget.config;
    const snd = ctx.sound;
    const soundOn = () => c.soundEnabled !== false && !muted;
    let muted = false;
    let coins = Number(c.coins ?? 560052);
    const cashback = Number(c.cashback ?? 77);
    const tickets = Number(c.tickets ?? 4);
    const spinCost = Number(c.spinCostCoins ?? 1000);
    let rotation = 0;
    let isSpinning = false;
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const segments = Array.isArray(c.segments) && c.segments.length >= 2 && c.segments.length <= 8 ? c.segments : CRW_DEFAULT_SEGMENTS;
    const partner = c.partnerName || 'BOMBAY SHAVING COMPANY';
    const couponCode = c.couponCode || 'CRED899';

    if (!document.getElementById('crw-styles')) {
      const st = document.createElement('style');
      st.id = 'crw-styles';
      st.textContent = CRW_CSS;
      document.head.appendChild(st);
    }

    const splitLabel = (label) => {
      const raw = String(label);
      if (raw.includes('\n')) return raw.split('\n').slice(0, 2);
      const words = raw.split(' ');
      if (raw.length <= 9 || words.length < 2) return [raw];
      let best = null;
      for (let k = 1; k < words.length; k++) {
        const a = words.slice(0, k).join(' ');
        const b = words.slice(k).join(' ');
        const score = Math.max(a.length, b.length) * 100 + a.length;
        if (!best || score < best.score) best = { score, lines: [a, b] };
      }
      return best.lines;
    };

    const n = segments.length;
    const arc = 360 / n;
    const R = 118;
    const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [150 + r * Math.cos(a), 150 + r * Math.sin(a)]; };
    const grads = segments.map((s, i) => `<radialGradient id="crwSeg${i}" cx="150" cy="150" r="${R}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${pswShade(s.color, 0.3)}"/><stop offset=".55" stop-color="${s.color}"/><stop offset="1" stop-color="${pswShade(s.color, -0.3)}"/></radialGradient>`).join('');
    const sliceSvg = segments.map((s, i) => {
      const [x1, y1] = pt(i * arc, R);
      const [x2, y2] = pt((i + 1) * arc, R);
      const mid = (i + 0.5) * arc;
      // Labels sit out toward the rim (a bit further on the lower half) so they clear the partner hub;
      // the product sits just above each label, as in the reference.
      const lower = Math.cos(mid * Math.PI / 180) < 0;
      const [lx, ly] = pt(mid, R * (lower ? 0.74 : 0.7));
      const lines = splitLabel(s.label);
      return `
        <path d="M150 150 L${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${arc > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="url(#crwSeg${i})" stroke="#FFD24A" stroke-opacity=".6" stroke-width="1.4"/>
        <g transform="translate(${lx.toFixed(1)} ${ly.toFixed(1)})">
          ${(() => {
            const img = crwImageUrl(s);
            if (img) return `<image href="${esc(img)}" x="-18" y="-52" width="36" height="36" preserveAspectRatio="xMidYMid meet"/>`;
            const key = crwIconKey(s);
            if (key === 'trimmer') return `<g transform="translate(-8 -52) rotate(24 11 18)">${crwTrimmer(pswShade(s.color, 0.25)).replace('<svg ', '<svg width="22" height="36" ')}</g>`;
            return `<g transform="translate(-16 -50)">${crwIconSvg(key).replace('<svg ', '<svg width="32" height="32" ')}</g>`;
          })()}
          <text text-anchor="middle" font-family="Arial" font-weight="900" font-size="13.5" fill="#fff" stroke="rgba(20,0,30,.35)" stroke-width="2.5" paint-order="stroke">
            ${lines.map((l, k) => `<tspan x="0" dy="${k === 0 ? 2 : 16}">${esc(l)}</tspan>`).join('')}
          </text>
        </g>`;
    }).join('');
    const rimBulbs = Array.from({ length: 24 }, (_, i) => { const [x, y] = pt(i * 15 + 7.5, 135); return `<circle class="crw-bulb ${i % 2 ? 'alt' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="#FFF7D0" stroke="#FFD24A" stroke-width="1.5" style="filter: drop-shadow(0 0 4px #FFD54A)"/>`; }).join('');
    const pedBulbs = Array.from({ length: 12 }, (_, i) => { const t = (i + 0.5) / 12; const x = 24 + t * 252; const y = 36 + Math.sin(t * Math.PI) * 11; return `<circle class="crw-bulb ${i % 2 ? 'alt' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="#FFF7D0" style="filter: drop-shadow(0 0 4px #FFD54A)"/>`; }).join('');
    const partnerWords = partner.split(' ');
    const partnerLines = partnerWords.length >= 3 ? [partnerWords[0], partnerWords[1], partnerWords.slice(2).join(' ')] : partnerWords;
    const gift = (color) => `<svg viewBox="0 0 64 64"><rect x="8" y="28" width="48" height="30" rx="4" fill="${color}"/><rect x="5" y="20" width="54" height="11" rx="3" fill="${pswShade(color, 0.2)}"/><rect x="28" y="20" width="8" height="38" fill="#FFC82A"/><path d="M32 20c-6-10-18-12-18-4 0 5 10 5 18 4zM32 20c6-10 18-12 18-4 0 5-10 5-18 4z" fill="#FFC82A" stroke="#D99A00" stroke-width="1.5"/></svg>`;
    const sparkle = (x, y, s) => `<svg class="crw-spark" style="left:${x}px; top:${y}px; width:${s}px; height:${s}px" viewBox="0 0 12 12"><path d="M6 0l1.4 4.6L12 6l-4.6 1.4L6 12l-1.4-4.6L0 6l4.6-1.4z" fill="#FFE9A0"/></svg>`;
    const coinIcon = `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="url(#pswGold)"/><text x="10" y="14.2" text-anchor="middle" font-family="Arial" font-weight="900" font-size="11" fill="#fff">C</text></svg>`;

    function renderWheelScreen() {
      mount.innerHTML = `
        <div class="gw-phone-frame crw-stage">
          ${PSW_DEFS}
          ${sparkle(40, 120, 12)}${sparkle(296, 150, 10)}${sparkle(30, 560, 12)}${sparkle(300, 540, 12)}
          <div class="crw-top">
            <button class="crw-round" id="crwClose" title="Close">&#10005;</button>
            <button class="crw-round" id="crwSound" title="Sound"><svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path id="crwWaves" d="M16 9c1.2 1.6 1.2 4.4 0 6M18.5 6.5c2.6 3 2.6 8 0 11" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>
            <div class="crw-pill coins">${coinIcon}<span id="crwCoins">${coins.toLocaleString('en-US')}</span></div>
            <div class="crw-pill cash"><svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" fill="#2DB24A"/><circle cx="12" cy="12" r="3.2" fill="#FFD84A"/><rect x="4" y="8" width="3" height="8" rx="1" fill="#8BE08F"/></svg>₹${cashback}</div>
            <div class="crw-pill tix"><svg viewBox="0 0 24 24"><path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z" fill="#FF4F8B"/><path d="M9 8v8" stroke="#FFC1D6" stroke-width="1.4" stroke-dasharray="1.5 1.5"/></svg>${tickets}</div>
          </div>

          <div class="crw-title">
            <div class="crw-t1">${esc(c.titleScript || 'Spin')}</div>
            <div class="crw-t2">${esc(c.titleSerif || 'The Wheel')}</div>
            <svg class="crw-swoosh" viewBox="0 0 86 40"><path d="M2 36C24 14 52 8 74 10" stroke="#FFC233" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M76 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#FFF3B0"/></svg>
          </div>
          <div class="crw-tgift" style="left:12px">${gift('#E0306E')}</div>
          <div class="crw-tgift" style="right:12px; animation-delay:.6s">${gift('#E0306E')}</div>

          <div class="crw-panel">
            <div class="crw-wheel-wrap">
              <svg class="crw-pointer" viewBox="0 0 40 44"><path d="M3 4h34L20 42z" fill="url(#pswRim)" stroke="#9A5A00" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 8h22L20 34z" fill="#E0111F"/><path d="M9 8h22l-11 6z" fill="#FF6070"/></svg>
              <svg class="crw-wheel" viewBox="0 0 300 300">
                <defs>${grads}</defs>
                <circle cx="150" cy="150" r="146" fill="url(#pswRim)"/>
                <circle cx="150" cy="150" r="124" fill="#5A1E00"/>
                <circle cx="150" cy="150" r="122" fill="none" stroke="#FFE98A" stroke-width="2"/>
                ${rimBulbs}
                <g class="crw-slices" id="crwSlices">${sliceSvg}</g>
                <circle cx="150" cy="150" r="40" fill="url(#pswRim)" stroke="#B86E00" stroke-width="2"/>
                <circle cx="150" cy="150" r="34" fill="#FFF3DC" stroke="#E7B45A" stroke-width="2"/>
                <text text-anchor="middle" font-family="Arial" font-weight="900" font-size="9.6" fill="#111">
                  ${partnerLines.map((l, k) => `<tspan x="150" y="${150 - (partnerLines.length - 1) * 5.5 + k * 11 + 3.5}">${esc(l)}</tspan>`).join('')}
                </text>
              </svg>
            </div>
            <svg class="crw-pedestal" viewBox="0 0 300 58">
              <ellipse cx="150" cy="36" rx="138" ry="18" fill="#3C0F6E"/>
              <ellipse cx="150" cy="30" rx="138" ry="18" fill="url(#pswRim)"/>
              <ellipse cx="150" cy="27" rx="126" ry="13" fill="#5B1CA0"/>
              <ellipse cx="150" cy="25" rx="104" ry="8" fill="none" stroke="#C99BFF" stroke-width="2" opacity=".8"/>
              ${pedBulbs}
            </svg>
          </div>

          <button class="crw-spin" id="crwSpin"><span class="tri"></span><span id="crwSpinLabel">SPIN</span></button>
          <button class="crw-details" id="crwDetails"><span class="i">i</span>Details</button>
          <div class="crw-note" id="crwNote">Each spin uses ${spinCost.toLocaleString('en-IN')} coins. Every slice is a ${esc(partner)} deal; the wheel always lands on a reward. Voucher code is shown after the spin.</div>
        </div>
      `;

      const $ = (sel) => mount.querySelector(sel);
      const spinBtn = $('#crwSpin');
      const wheel = $('#crwSlices');
      if (coins < spinCost) { spinBtn.disabled = true; $('#crwSpinLabel').textContent = 'NO COINS'; }

      $('#crwSound').onclick = () => { muted = !muted; $('#crwWaves').style.display = muted ? 'none' : ''; };
      $('#crwDetails').onclick = () => $('#crwNote').classList.toggle('show');
      $('#crwClose').onclick = () => ctx.emit('cred_wheel_closed', { widgetId: widget.id });

      const DURATION = 4200;
      spinBtn.onclick = () => {
        if (isSpinning || coins < spinCost) return;
        isSpinning = true;
        spinBtn.disabled = true;
        $('#crwNote').classList.remove('show');
        if (soundOn() && snd.playCredWheelSpin) snd.playCredWheelSpin();

        coins -= spinCost;
        $('#crwCoins').textContent = coins.toLocaleString('en-US');

        const winIdx = Math.floor(Math.random() * n);
        const jitter = (Math.random() - 0.5) * arc * 0.6;
        const targetMod = (360 - ((winIdx + 0.5) * arc + jitter) % 360) % 360;
        const delta = 360 * 6 + ((targetMod - (rotation % 360) + 360) % 360);
        rotation += delta;
        wheel.style.transition = `transform ${DURATION}ms cubic-bezier(.15,.62,.18,1)`;
        wheel.style.transform = `rotate(${rotation}deg)`;

        setTimeout(() => {
          isSpinning = false;
          const prize = segments[winIdx];
          if (soundOn() && snd.playCredWheelWin) snd.playCredWheelWin();
          fireConfetti(['#FFD43B', '#B266FF', '#5DB817', '#1D6BF2', '#FFFFFF']);
          ctx.emit('cred_wheel_won', { widgetId: widget.id, prize: prize.label });
          setTimeout(() => renderVoucher(prize), 900);
        }, DURATION + 150);
      };
    }

    function renderVoucher(prize) {
      // The won slice's own image, else its icon drawn large on sunburst rays.
      const prizeImg = crwImageUrl(prize);
      const prizeKey = crwIconKey(prize);
      const hero = prizeImg
        ? `<img src="${esc(prizeImg)}" alt="${esc(prize.label)}" style="object-fit:contain; padding:18px;">`
        : prizeKey === 'trimmer'
          ? `<div class="rays"></div><div style="position:relative; width:90px; height:144px; transform: rotate(18deg); filter: drop-shadow(0 10px 16px rgba(0,0,0,.5));">${crwTrimmer(pswShade(prize.color, 0.25)).replace('<svg ', '<svg width="90" height="144" ')}</div>`
          : `<div class="rays"></div><div style="position:relative; width:120px; height:120px; filter: drop-shadow(0 10px 16px rgba(0,0,0,.5));">${crwIconSvg(prizeKey).replace('<svg ', '<svg width="120" height="120" ')}</div>`;
      mount.innerHTML = `
        <div class="gw-phone-frame crw-stage">
          ${PSW_DEFS}
          <div class="crw-top">
            <button class="crw-round" id="crwBack" title="Back">&#10005;</button>
            <div class="crw-pill coins">${coinIcon}<span>${coins.toLocaleString('en-US')}</span></div>
          </div>
          <div class="crw-vcard">
            <div class="crw-vhero" style="background: radial-gradient(circle at 50% 45%, ${pswShade(prize.color, 0.15)}, ${pswShade(prize.color, -0.45)});">
              ${hero}
              <div class="partner">${esc(partner)}</div>
            </div>
            <div class="crw-vbody">
              <div class="won">You won</div>
              <div class="prize">${esc(String(prize.label).replace('\n', ' '))}</div>
              <div class="crw-code" id="crwCode"><span>${esc(couponCode)}</span><small id="crwCodeHint">Tap to copy</small></div>
              <button class="crw-vbtn" id="crwRedeem">Redeem Now</button>
            </div>
          </div>
          <button class="crw-vlink" id="crwAgain">Spin again</button>
        </div>
      `;
      const $ = (sel) => mount.querySelector(sel);
      const copy = () => {
        navigator.clipboard?.writeText(couponCode).catch(() => {});
        $('#crwCodeHint').textContent = 'Copied!';
      };
      $('#crwCode').onclick = copy;
      $('#crwRedeem').onclick = () => {
        if (soundOn() && snd.playToastPop) snd.playToastPop();
        copy();
        $('#crwRedeem').textContent = 'Code copied. Redeem at checkout';
        ctx.emit('cred_wheel_redeemed', { widgetId: widget.id, prize: prize.label, code: couponCode });
      };
      $('#crwBack').onclick = renderWheelScreen;
      $('#crwAgain').onclick = renderWheelScreen;
    }

    renderWheelScreen();
  }

  // =========================================================================
  // 9. CRED 3D ARCADE SLOT MACHINE (1:1 with ScreenRecording 11-16-2026 20-30-09)
  // =========================================================================
  // Jackpot slot machine: purple stage, crown + marquee sign, crimson cabinet with gold trim,
  // three gold-framed reels (SVG symbols), lever, SPIN pill, spins bar and progress.
  const CSM_SYMBOLS = {
    diamond: `<svg viewBox="0 0 64 64"><path d="M18 11h28l13 15-27 31L5 26z" fill="url(#csmDia)"/><path d="M18 11L5 26h54L46 11z" fill="#9BE7FF"/><path d="M25 11l-7 15h28l-7-15z" fill="#DDF8FF"/><path d="M5 26l27 31-9-31z" fill="#3AA2F4"/><path d="M59 26L32 57l9-31z" fill="#1463D6"/><path d="M23 26h18l-9 31z" fill="#5CC6FF"/><path d="M27 15l-3 7" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/></svg>`,
    ball: `<svg viewBox="0 0 64 64"><circle cx="32" cy="33" r="25" fill="url(#csmBall)"/><ellipse cx="24" cy="22" rx="9" ry="6" fill="#fff" opacity=".55" transform="rotate(-25 24 22)"/></svg>`,
    coin: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="url(#csmGold)"/><circle cx="32" cy="32" r="20" fill="none" stroke="#C98400" stroke-width="2.5"/><path d="M20 27l12-8 12 8z" fill="#B57300"/><rect x="22" y="29" width="4" height="12" rx="1" fill="#B57300"/><rect x="30" y="29" width="4" height="12" rx="1" fill="#B57300"/><rect x="38" y="29" width="4" height="12" rx="1" fill="#B57300"/><rect x="19" y="42" width="26" height="4" rx="1.5" fill="#B57300"/><ellipse cx="22" cy="18" rx="7" ry="3.5" fill="#fff" opacity=".45" transform="rotate(-30 22 18)"/></svg>`,
    bat: `<svg viewBox="0 0 64 64"><g transform="rotate(40 32 32)"><rect x="29" y="2" width="6" height="18" rx="3" fill="#6D3BD6"/><path d="M29 6h6M29 10h6M29 14h6" stroke="#9E7BFF" stroke-width="1.4"/><path d="M26 20h12l1 34c0 4-3 6-7 6s-7-2-7-6z" fill="url(#csmBat)"/><path d="M30 24v30" stroke="#fff" stroke-width="2" opacity=".35" stroke-linecap="round"/></g><circle cx="47" cy="49" r="6.5" fill="url(#csmBall)"/><path d="M42.5 46.5c3 1.5 6 1.5 9 0" stroke="#fff" stroke-width="1.3" fill="none"/></svg>`,
    cherry: `<svg viewBox="0 0 64 64"><path d="M22 40c4-12 10-22 18-28M44 42c-1-12-2-20-4-30" stroke="#2E8B2E" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M40 12c8-6 16-5 20 1-7 4-14 4-20-1z" fill="#3FBF3F"/><circle cx="20" cy="45" r="13" fill="url(#csmBall)"/><circle cx="45" cy="46" r="13" fill="url(#csmBall)"/><ellipse cx="15" cy="40" rx="4" ry="2.6" fill="#fff" opacity=".6" transform="rotate(-30 15 40)"/><ellipse cx="40" cy="41" rx="4" ry="2.6" fill="#fff" opacity=".6" transform="rotate(-30 40 41)"/></svg>`,
    bag: `<svg viewBox="0 0 64 64"><path d="M24 14h16l-4 8h-8z" fill="url(#csmGold)"/><path d="M27 22h10c10 6 17 14 17 24 0 9-8 13-22 13S10 55 10 46c0-10 7-18 17-24z" fill="url(#csmGold)"/><rect x="25" y="20" width="14" height="4" rx="2" fill="#B57300"/><text x="32" y="50" text-anchor="middle" font-family="Arial" font-weight="900" font-size="22" fill="#B06F00">$</text><ellipse cx="20" cy="38" rx="4" ry="7" fill="#fff" opacity=".35" transform="rotate(25 20 38)"/></svg>`
  };
  const CSM_KEYS = Object.keys(CSM_SYMBOLS);

  const CSM_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="csmDia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FE3FF"/><stop offset="1" stop-color="#1E7BEA"/></linearGradient>
    <radialGradient id="csmBall" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#FF7A7A"/><stop offset=".55" stop-color="#E0111F"/><stop offset="1" stop-color="#8A0410"/></radialGradient>
    <radialGradient id="csmGold" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFF0A0"/><stop offset=".5" stop-color="#F7BE1A"/><stop offset="1" stop-color="#C47F00"/></radialGradient>
    <linearGradient id="csmBat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F6D29A"/><stop offset="1" stop-color="#D49A55"/></linearGradient>
    <linearGradient id="csmCrown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE98A"/><stop offset=".6" stop-color="#F5B814"/><stop offset="1" stop-color="#C98200"/></linearGradient>
  </defs></svg>`;

  const CSM_CSS = `
    .csm-stage { background: radial-gradient(ellipse at 50% 35%, #5B2A86 0%, #3A1660 45%, #210A3A 100%) !important; color:#fff; padding: 14px 10px 18px !important; display:flex; flex-direction:column; align-items:center; overflow:hidden; position:relative; font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; }
    .csm-machine { position:relative; width:292px; margin: 0 auto; }
    .csm-crown { position:relative; z-index:4; width:96px; height:62px; margin: 0 auto -24px; display:block; filter: drop-shadow(0 4px 10px rgba(255,190,40,.55)); animation: gwFloatCoin 3s ease-in-out infinite; }
    .csm-sign { position:relative; z-index:3; width:262px; height:106px; margin:0 auto -18px; border-radius:53px; padding:5px;
      background: linear-gradient(180deg,#FFE27A,#F2A70F 55%,#B86E00); box-shadow: 0 0 22px rgba(255,170,30,.55), 0 8px 18px rgba(0,0,0,.45); }
    .csm-sign-inner { position:relative; width:100%; height:100%; border-radius:48px; background: radial-gradient(ellipse at 50% 40%, #6E0F33 0%, #4A0722 70%, #33041A 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding: 8px 30px 0; box-shadow: inset 0 2px 8px rgba(0,0,0,.6); }
    .csm-bulb { position:absolute; width:7px; height:7px; border-radius:50%; background: radial-gradient(circle at 35% 35%, #FFFDE8, #FFD54A 60%, #E89B00); box-shadow: 0 0 6px 2px rgba(255,214,90,.85); transform: translate(-50%,-50%); animation: csmTwinkle 1.1s ease-in-out infinite; }
    .csm-bulb.alt { animation-delay: .55s; }
    @keyframes csmTwinkle { 0%,100% { opacity:1; } 50% { opacity:.45; } }
    .csm-headline { font-size:24px; font-weight:900; letter-spacing:.3px; line-height:1; white-space:nowrap; background: linear-gradient(180deg,#FFF6C8 0%,#FFD34A 50%,#F0A300 100%); -webkit-background-clip:text; background-clip:text; color:transparent; filter: drop-shadow(0 2px 0 #5A0618) drop-shadow(0 0 6px rgba(255,200,60,.35)); }
    .csm-offer { margin-top:5px; font-size:12.5px; font-weight:700; line-height:1.25; color:#FFFFFF; }
    .csm-offer b { color:#FFD43B; font-size:14.5px; font-weight:900; }
    .csm-laurel { position:absolute; top:50%; width:20px; height:40px; transform: translateY(-50%); }
    .csm-cabinet { position:relative; z-index:2; border-radius: 44px 44px 24px 24px; padding:4px; background: linear-gradient(180deg,#FFE27A,#E9A21A 40%,#B86E00); box-shadow: 0 18px 36px rgba(0,0,0,.55); }
    .csm-cabinet-inner { position:relative; border-radius: 40px 40px 20px 20px; padding: 32px 12px 14px; background: linear-gradient(180deg,#B3173F 0%,#8C0F30 45%,#650A24 100%); box-shadow: inset 0 3px 0 rgba(255,255,255,.18), inset 0 -6px 14px rgba(0,0,0,.35); }
    .csm-window { position:relative; border-radius:20px; padding:4px; background: linear-gradient(180deg,#FFE27A,#E2A01C 50%,#A86200); box-shadow: 0 0 14px rgba(255,180,40,.45); }
    .csm-window-inner { position:relative; border-radius:16px; padding: 9px 16px; background: radial-gradient(ellipse at 50% 50%, #3C1340 0%, #250A27 80%); box-shadow: inset 0 4px 14px rgba(0,0,0,.75); display:grid; grid-template-columns: repeat(3,1fr); gap:7px; }
    .csm-reel { position:relative; height:174px; border-radius:14px; overflow:hidden; border:2px solid #E7B43C; background: linear-gradient(90deg,#1E0619 0%,#3D1340 30%,#45174A 50%,#3D1340 70%,#1E0619 100%); box-shadow: inset 0 10px 14px -6px rgba(0,0,0,.85), inset 0 -10px 14px -6px rgba(0,0,0,.85); }
    .csm-strip { position:absolute; left:0; right:0; top:0; will-change: transform; }
    .csm-cell { height:58px; display:flex; align-items:center; justify-content:center; }
    .csm-cell svg { width:44px; height:44px; filter: drop-shadow(0 3px 4px rgba(0,0,0,.55)); }
    .csm-strip.spinning .csm-cell svg { filter: blur(1.6px) drop-shadow(0 3px 4px rgba(0,0,0,.55)); }
    .csm-cell.win svg { animation: csmWinPulse .6s ease-in-out 3; filter: drop-shadow(0 0 8px rgba(255,220,90,.95)); }
    @keyframes csmWinPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }
    .csm-payline { position:absolute; top:50%; width:0; height:0; border-top:9px solid transparent; border-bottom:9px solid transparent; transform: translateY(-50%); z-index:3; filter: drop-shadow(0 0 4px rgba(255,210,60,.8)); }
    .csm-payline.l { left:3px; border-left:11px solid #FFD23A; }
    .csm-payline.r { right:3px; border-right:11px solid #FFD23A; }
    .csm-side-bulb { position:absolute; width:8px; height:8px; }
    .csm-lever { position:absolute; right:-24px; top:118px; width:30px; height:150px; z-index:1; cursor:pointer; }
    .csm-lever-rod { position:absolute; left:11px; top:24px; width:8px; height:96px; border-radius:4px; background: linear-gradient(90deg,#FFE9A0,#E3A21B 55%,#A66500); transform-origin: 50% 100%; transition: transform .25s ease; }
    .csm-lever-knob { position:absolute; left:1px; top:0; width:28px; height:28px; border-radius:50%; background: radial-gradient(circle at 35% 30%, #FF8A8A, #E0111F 55%, #8A0410); box-shadow: 0 4px 8px rgba(0,0,0,.5); transition: transform .25s ease; }
    .csm-lever-base { position:absolute; left:4px; top:112px; width:22px; height:34px; border-radius: 6px 11px 11px 6px; background: linear-gradient(90deg,#B86E00,#FFD76A 45%,#C47F00); box-shadow: 0 3px 6px rgba(0,0,0,.45); }
    .csm-lever.pull .csm-lever-rod { transform: scaleY(.45); }
    .csm-lever.pull .csm-lever-knob { transform: translateY(54px); }
    .csm-controls { display:flex; align-items:center; gap:8px; margin: 14px 0 12px; }
    .csm-spin { flex:1; height:56px; border-radius:30px; border:3px solid #FFF0A6; cursor:pointer; background: linear-gradient(180deg,#FFEB7A 0%,#FFC82A 50%,#F2A007 100%); box-shadow: 0 5px 0 #A85F00, 0 0 18px rgba(255,200,40,.55), inset 0 2px 0 rgba(255,255,255,.6); display:flex; align-items:center; justify-content:center; gap:10px; color:#6B3A00; font-weight:900; font-size:25px; letter-spacing:.5px; font-family:inherit; transition: transform .08s, box-shadow .08s; }
    .csm-spin:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 1px 0 #A85F00, 0 0 12px rgba(255,200,40,.4), inset 0 2px 0 rgba(255,255,255,.6); }
    .csm-spin:disabled { cursor:default; filter: saturate(.55) brightness(.85); }
    .csm-spin .tri { width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-left:15px solid #6B3A00; }
    .csm-status { display:flex; align-items:center; border-radius:16px; padding: 9px 12px; background: rgba(28,4,22,.75); border:1px solid rgba(255,255,255,.12); font-size:12px; font-weight:700; color:#F4E9F1; }
    .csm-status .sep { width:1px; height:16px; background: rgba(255,255,255,.25); margin: 0 10px; }
    .csm-status .players { display:flex; align-items:center; gap:6px; margin-left:auto; color:#E7DAE4; }
    .csm-progress { margin-top:10px; height:12px; border-radius:8px; padding:2px; background:#1A0414; border:1px solid rgba(255,200,80,.35); }
    .csm-progress-fill { height:100%; border-radius:6px; background: linear-gradient(180deg,#9DFF7A,#3FD82F 55%,#22A81C); box-shadow: 0 0 8px rgba(80,255,70,.65); transition: width .5s ease; }
    .csm-base { width:306px; height:16px; margin: -6px auto 0; border-radius: 4px 4px 12px 12px; background: linear-gradient(180deg,#FFE27A,#E39D17 50%,#A35F00); box-shadow: 0 10px 20px rgba(0,0,0,.5); position:relative; z-index:1; }
    .csm-win { position:absolute; inset:4px; border-radius:16px; z-index:5; display:none; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:14px; background: rgba(36,6,30,.93); animation: gwPopIn .3s ease; }
    .csm-win.show { display:flex; }
    .csm-win .won { font-size:13px; font-weight:800; letter-spacing:2px; color:#FFD43B; text-transform:uppercase; }
    .csm-win .title { margin:6px 0 12px; font-size:15px; font-weight:800; line-height:1.3; color:#fff; }
    .csm-claim { border:none; cursor:pointer; border-radius:20px; padding: 8px 16px; font-family:inherit; font-size:12px; font-weight:900; color:#0B3D0B; background: linear-gradient(180deg,#9DFF7A,#3FD82F); box-shadow: 0 3px 0 #1E7A18; }
  `;

  function csmBulbsOnStadium(w, h, n, inset) {
    // Evenly spaced points along a stadium (pill) outline.
    const r = h / 2 - inset;
    const straight = w - h;
    const per = 2 * straight + 2 * Math.PI * r;
    const pts = [];
    for (let i = 0; i < n; i++) {
      let d = (i / n) * per;
      let x, y;
      if (d < straight) { x = h / 2 + d; y = inset; }
      else if ((d -= straight) < Math.PI * r) { const a = -Math.PI / 2 + d / r; x = w - h / 2 + r * Math.cos(a); y = h / 2 + r * Math.sin(a); }
      else if ((d -= Math.PI * r) < straight) { x = w - h / 2 - d; y = h - inset; }
      else { d -= straight; const a = Math.PI / 2 + d / r; x = h / 2 + r * Math.cos(a); y = h / 2 + r * Math.sin(a); }
      pts.push([x, y]);
    }
    return pts;
  }

  function renderCredSlotMachine(mount, widget, ctx) {
    const c = widget.config;
    const snd = ctx.sound;
    const soundOn = c.soundEnabled !== false;
    const maxSpins = Number(c.maxSpins) || 10;
    let spinsLeft = Math.min(Number(c.spinsLeft ?? 9), maxSpins);
    let isSpinning = false;
    const CELL = 58;
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    // Offer line: wrap the gold highlight in *stars*, e.g. "or get *30% OFF* your next ride".
    const offerHtml = esc(c.offerLine || 'or get *30% OFF* your next Uber Intercity Ride').replace(/\*([^*]+)\*/g, '<b>$1</b>');
    const rewardTitle = c.rewardTitle || '30% off your next Uber Intercity ride, up to ₹500';
    const couponCode = c.couponCode || 'UBER30';

    // Starting faces (top, middle, bottom) as in the reference design; every spin lands 3 diamonds on the payline.
    let reels = [['diamond', 'ball', 'coin'], ['ball', 'bat', 'cherry'], ['ball', 'cherry', 'bag']];
    const finals = [['ball', 'diamond', 'coin'], ['cherry', 'diamond', 'bat'], ['bag', 'diamond', 'cherry']];

    if (!document.getElementById('csm-styles')) {
      const st = document.createElement('style');
      st.id = 'csm-styles';
      st.textContent = CSM_CSS;
      document.head.appendChild(st);
    }

    const cell = (k, extra = '') => `<div class="csm-cell ${extra}">${CSM_SYMBOLS[k]}</div>`;
    const signBulbs = csmBulbsOnStadium(252, 96, 30, 2.5)
      .map(([x, y], i) => `<span class="csm-bulb ${i % 2 ? 'alt' : ''}" style="left:${x + 5}px; top:${y + 5}px;"></span>`).join('');
    const sideBulbs = [0, 1, 2, 3, 4, 5].map((i) => {
      const top = 60 + i * 42;
      return `<span class="csm-bulb ${i % 2 ? 'alt' : ''}" style="left:5px; top:${top}px;"></span><span class="csm-bulb ${i % 2 ? '' : 'alt'}" style="left:calc(100% - 5px); top:${top}px;"></span>`;
    }).join('');
    const laurel = (flip) => `<svg class="csm-laurel" style="${flip ? 'right:14px; transform: translateY(-50%) scaleX(-1);' : 'left:14px;'}" viewBox="0 0 20 40"><path d="M14 38C6 30 5 18 10 4" stroke="#E9B23A" stroke-width="1.6" fill="none"/>${[[9, 8, -30], [7, 15, -20], [6, 22, -10], [7, 29, 5], [10, 35, 20]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="5" fill="#F2C14A" transform="rotate(${a} ${x} ${y})"/><ellipse cx="${x + 5}" cy="${y + 1}" rx="2.2" ry="4.6" fill="#D99A1E" transform="rotate(${-a - 40} ${x + 5} ${y + 1})"/>`).join('')}</svg>`;

    mount.innerHTML = `
      <div class="gw-phone-frame csm-stage">
        ${CSM_DEFS}
        <div class="csm-machine">
          <svg class="csm-crown" viewBox="0 0 96 62">
            <path d="M10 52L6 16l22 18L48 6l20 28 22-18-4 36z" fill="url(#csmCrown)" stroke="#B87400" stroke-width="2" stroke-linejoin="round"/>
            <rect x="9" y="48" width="78" height="10" rx="4" fill="url(#csmCrown)" stroke="#B87400" stroke-width="2"/>
            <circle cx="6" cy="14" r="5" fill="url(#csmCrown)"/><circle cx="48" cy="6" r="5.5" fill="url(#csmCrown)"/><circle cx="90" cy="14" r="5" fill="url(#csmCrown)"/>
            <path d="M48 26l8 9-8 9-8-9z" fill="#E0111F" stroke="#8A0410" stroke-width="1.5"/><path d="M45 31l3-3 3 3" stroke="#fff" stroke-width="1.3" fill="none" opacity=".7"/>
            <circle cx="24" cy="44" r="2.5" fill="#FFF3B0"/><circle cx="72" cy="44" r="2.5" fill="#FFF3B0"/>
          </svg>

          <div class="csm-sign">
            <div class="csm-sign-inner">
              ${laurel(false)}${laurel(true)}
              <div class="csm-headline">${esc(c.headline || 'WIN JACKPOT')}</div>
              <div class="csm-offer">${offerHtml}</div>
            </div>
            ${signBulbs}
          </div>

          <div class="csm-lever" id="csmLever" title="Pull to spin">
            <div class="csm-lever-rod"></div>
            <div class="csm-lever-knob"></div>
            <div class="csm-lever-base"></div>
          </div>

          <div class="csm-cabinet">
            <div class="csm-cabinet-inner">
              ${sideBulbs}
              <div class="csm-window">
                <div class="csm-window-inner">
                  <span class="csm-payline l"></span><span class="csm-payline r"></span>
                  ${reels.map((r, i) => `<div class="csm-reel"><div class="csm-strip" id="csmStrip${i}">${r.map((k) => cell(k)).join('')}</div></div>`).join('')}
                </div>
                <div class="csm-win" id="csmWin">
                  <div class="won">You won</div>
                  <div class="title">${esc(rewardTitle)}</div>
                  <button class="csm-claim" id="csmClaim">CLAIM VOUCHER &middot; ${esc(couponCode)}</button>
                </div>
              </div>

              <div class="csm-controls">
                <button class="csm-spin" id="csmSpin"><span class="tri"></span><span id="csmSpinLabel">SPIN</span></button>              </div>

              <div class="csm-status">
                <span id="csmSpinsText">${spinsLeft} / ${maxSpins} SPINS LEFT</span>
                <span class="sep"></span>
                <span class="players"><i class="fa-solid fa-user-group"></i> ${esc(c.playersCount || '43,745')} played</span>
              </div>
              <div class="csm-progress"><div class="csm-progress-fill" id="csmProgress" style="width:${(spinsLeft / maxSpins) * 100}%"></div></div>
            </div>
          </div>
          <div class="csm-base"></div>
        </div>
      </div>
    `;

    const $ = (sel) => mount.querySelector(sel);
    const spinBtn = $('#csmSpin');
    const updateSpinsUi = () => {
      $('#csmSpinsText').textContent = `${spinsLeft} / ${maxSpins} SPINS LEFT`;
      $('#csmProgress').style.width = `${(spinsLeft / maxSpins) * 100}%`;
      spinBtn.disabled = spinsLeft <= 0;
      $('#csmSpinLabel').textContent = spinsLeft <= 0 ? 'NO SPINS' : 'SPIN';
    };
    updateSpinsUi();

    const triggerSpin = () => {
      if (isSpinning || spinsLeft <= 0) return;
      isSpinning = true;
      spinBtn.disabled = true;
      $('#csmWin').classList.remove('show');

      const lever = $('#csmLever');
      lever.classList.add('pull');
      setTimeout(() => lever.classList.remove('pull'), 380);

      if (soundOn) snd.playCredSlotSpin();
      spinsLeft--;
      updateSpinsUi();
      spinBtn.disabled = true;

      const stopTimes = [1.5, 2.0, 2.5];
      finals.forEach((final, i) => {
        const strip = $(`#csmStrip${i}`);
        const filler = Array.from({ length: 14 + i * 5 }, () => CSM_KEYS[Math.floor(Math.random() * CSM_KEYS.length)]);
        // Reels move downward: final faces sit on top, current faces at the bottom, then slide to 0.
        const seq = [...final, ...filler, ...reels[i]];
        strip.innerHTML = seq.map((k, idx) => cell(k, idx === 1 ? 'payline-cell' : '')).join('');
        strip.style.transition = 'none';
        strip.style.transform = `translateY(${-(seq.length - 3) * CELL}px)`;
        void strip.offsetHeight;
        strip.classList.add('spinning');
        strip.style.transition = `transform ${stopTimes[i]}s cubic-bezier(.2,.65,.25,1.06)`;
        strip.style.transform = 'translateY(0)';
        setTimeout(() => strip.classList.remove('spinning'), stopTimes[i] * 780);
        setTimeout(() => {
          strip.innerHTML = final.map((k, idx) => cell(k, idx === 1 ? 'payline-cell' : '')).join('');
          strip.style.transition = 'none';
          strip.style.transform = 'translateY(0)';
          if (soundOn) snd.playOdometerTick();
        }, stopTimes[i] * 1000 + 40);
      });
      reels = finals.map((f) => f.slice());

      setTimeout(() => {
        isSpinning = false;
        updateSpinsUi();
        mount.querySelectorAll('.payline-cell').forEach((el) => el.classList.add('win'));
        if (soundOn) snd.playCredSlotWin();
        fireConfetti(['#FFD43B', '#FF4D6D', '#B266FF', '#FFFFFF']);
        setTimeout(() => $('#csmWin') && $('#csmWin').classList.add('show'), 700);
        ctx.emit('cred_slot_won', { widgetId: widget.id, reward: rewardTitle });
      }, stopTimes[2] * 1000 + 120);
    };

    spinBtn.onclick = triggerSpin;
    $('#csmLever').onclick = triggerSpin;
    $('#csmClaim').onclick = () => {
      navigator.clipboard?.writeText(couponCode).catch(() => {});
      $('#csmClaim').textContent = `CODE ${couponCode} COPIED`;
      ctx.emit('cred_slot_voucher_claimed', { widgetId: widget.id, code: couponCode });
    };
  }

  // =========================================================================
  // 8. TRIPLE PODIUM GAMIFIED LEADERBOARD (Region / National / Global)
  // =========================================================================
  function renderGamifyLeaderboard(mount, widget, ctx) {
    const c = widget.config;
    const snd = ctx.sound;
    let currentTab = c.activeTab || 'Region';
    const tabs = Array.isArray(c.tabs) ? c.tabs : ['Region', 'National', 'Global'];

    // Multipliers for tab datasets
    const tabMultipliers = {
      'Region': 1,
      'National': 1.65,
      'Global': 2.85
    };

    const baseTop = JSON.parse(JSON.stringify(c.topThree || [
      { rank: 1, name: 'Eiden', username: '@username', score: 2430, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', color: '#F59E0B' },
      { rank: 2, name: 'Jackson', username: '@username', score: 1847, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', color: '#38BDF8' },
      { rank: 3, name: 'Emma Aria', username: '@username', score: 1674, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', color: '#22C55E' }
    ]));
    const baseList = JSON.parse(JSON.stringify(c.listPlayers || [
      { rank: 4, name: 'Sebastian', username: '@username', score: 1124, trend: 'up', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
      { rank: 5, name: 'Jason', username: '@username', score: 875, trend: 'down', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
      { rank: 6, name: 'Natalie', username: '@username', score: 774, trend: 'up', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
      { rank: 7, name: 'Serenity', username: '@username', score: 723, trend: 'up', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' }
    ]));

    // Ranks come from sorting by score, so earning or losing points really moves people around.
    const youName = String(c.youName || 'You').slice(0, 16);
    const pointsStep = Math.max(1, Number(c.pointsStep) || 250);
    const players = [...baseTop, ...baseList].map(p => ({ name: p.name, username: p.username || '@username', score: Number(p.score) || 0, trend: p.trend || 'up', avatar: p.avatar }));
    players.push({ name: youName, username: '@you', score: Number(c.youScore ?? 700), trend: 'up', isYou: true, avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(youName) + '&background=F97316&color=FFF&bold=true' });
    const ordered = () => players.slice().sort((a, b) => b.score - a.score);
    const rankOfYou = () => ordered().findIndex(p => p.isYou) + 1;
    let youMove = null; // { dir: 'up' | 'down', from, to } for the move that just happened

    // Animations live in one stylesheet, added once. Reduced motion turns them off.
    if (!document.getElementById('lb-anim-styles')) {
      const st = document.createElement('style');
      st.id = 'lb-anim-styles';
      st.textContent = `
        @keyframes lbFlashUp { 0% { background: rgba(34,197,94,.5); } 100% { background: rgba(249,115,22,.10); } }
        @keyframes lbFlashDown { 0% { background: rgba(239,68,68,.5); } 100% { background: rgba(249,115,22,.10); } }
        @keyframes lbShake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
        @keyframes lbBadge { 0% { transform: scale(.4); opacity: 0; } 45% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes lbPodPop { 0% { transform: translateY(20px) scale(.9); opacity: .4; } 60% { transform: translateY(-8px) scale(1.04); opacity: 1; } 100% { transform: none; opacity: 1; } }
        @keyframes lbRing { 0% { box-shadow: 0 0 0 0 rgba(249,115,22,.75); } 100% { box-shadow: 0 0 0 20px rgba(249,115,22,0); } }
        @keyframes lbDrop { from { transform: translateY(-24px); opacity: 0; } to { transform: none; opacity: 1; } }
        .lb-flash-up { animation: lbFlashUp 1.4s ease-out both; }
        .lb-flash-down { animation: lbFlashDown 1.4s ease-out both, lbShake .5s ease-in-out; }
        .lb-move { display: inline-block; font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 10px; animation: lbBadge .45s ease-out both; }
        .lb-move.up { background: rgba(34,197,94,.18); color: #4ADE80; }
        .lb-move.down { background: rgba(239,68,68,.18); color: #F87171; }
        .lb-pod-pop { animation: lbPodPop .65s cubic-bezier(.2,1.2,.3,1) both; }
        .lb-pod-pop > div:first-child { animation: lbRing 1s ease-out 2; border-radius: 50%; }
        .lb-drop { animation: lbDrop .4s ease-out both; }
        .lb-ctl { flex: 1; height: 34px; border-radius: 10px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.05); color: #E2E8F0; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; }
        .lb-ctl:hover { background: rgba(255,255,255,.1); }
        .lb-ctl.good { background: rgba(34,197,94,.16); border-color: rgba(34,197,94,.4); color: #86EFAC; }
        .lb-ctl.bad { background: rgba(239,68,68,.14); border-color: rgba(239,68,68,.35); color: #FCA5A5; }
        @media (prefers-reduced-motion: reduce) { .lb-flash-up, .lb-flash-down, .lb-move, .lb-pod-pop, .lb-pod-pop > div:first-child, .lb-drop { animation: none !important; } }
      `;
      document.head.appendChild(st);
    }

    function getAdjustedScore(baseScore) {
      const mult = tabMultipliers[currentTab] || 1;
      return Math.round(baseScore * mult);
    }

    function renderView() {
      const board = ordered();
      const rank1 = board[0];
      const rank2 = board[1];
      const rank3 = board[2];
      const listPlayers = board.slice(3);
      const myRank = rankOfYou();
      const me = players.find(p => p.isYou);
      const tag = (p) => (p.isYou ? ' (you)' : '');

      const tabsHtml = tabs.map(tab => {
        const isActive = tab === currentTab;
        return `
          <div class="lb-tab-btn" data-tab="${tab}" style="flex: 1; text-align: center; padding: 8px 4px; cursor: pointer; position: relative;">
            <span style="font-size: 13.5px; font-weight: ${isActive ? '700' : '500'}; color: ${isActive ? '#FFFFFF' : '#8A99AD'}; transition: color 0.2s;">
              ${tab}
            </span>
            ${isActive ? `
              <div style="width: 32px; height: 3px; background: #38BDF8; border-radius: 2px; margin: 4px auto 0; box-shadow: 0 0 10px rgba(56, 189, 248, 0.7); animation: gwPopIn 0.2s ease;"></div>
            ` : '<div style="height: 3px; margin-top: 4px;"></div>'}
          </div>
        `;
      }).join('');

      const rowsHtml = listPlayers.map((player, idx) => {
        const score = getAdjustedScore(player.score);
        const isYou = !!player.isYou;
        const isUp = isYou ? (youMove ? youMove.dir === 'up' : true) : player.trend === 'up';
        const isLast = idx === listPlayers.length - 1;
        return `
          <div class="lb-player-row gw-btn-press" data-name="${player.name}" ${isYou ? 'data-you="1"' : ''} style="display: flex; align-items: center; justify-content: space-between; padding: 12px ${isYou ? '8px' : '4px'}; ${isYou ? 'background: rgba(249,115,22,0.10); border-radius: 12px;' : (isLast ? '' : 'border-bottom: 1px solid rgba(255, 255, 255, 0.06);')} cursor: pointer; transition: background 0.15s;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 18px; font-size: 12px; font-weight: 700; color: ${isYou ? '#FB923C' : '#64748B'}; font-variant-numeric: tabular-nums;">${idx + 4}</span>
              <img src="${player.avatar}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1E293B&color=FFF';" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 1.5px solid rgba(255, 255, 255, 0.12);" alt="${player.name}" />
              <div>
                <div style="font-size: 14px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.2px;">${player.name}${isYou ? ' <span style="font-size: 10px; font-weight: 800; color: #FB923C;">YOU</span>' : ''}</div>
                <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${player.username}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${isYou && youMove ? `<span class="lb-move ${youMove.dir}">${youMove.dir === 'up' ? '&#9650;' : '&#9660;'} ${Math.abs(youMove.from - youMove.to)}</span>` : ''}
              <span style="font-size: 14.5px; font-weight: 800; color: #FFFFFF; font-variant-numeric: tabular-nums;">${score.toLocaleString()}</span>
              <span style="font-size: 9px; color: ${isUp ? '#22C55E' : '#EF4444'};">${isUp ? '&#9650;' : '&#9660;'}</span>
            </div>
          </div>
        `;
      }).join('');

      mount.innerHTML = `
        <div class="gw-phone-frame" style="background: #0E1322; padding: 0; display: flex; flex-direction: column; height: 680px; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          
          <!-- Top iOS Status & App Header -->
          <div style="padding: 12px 18px 4px; display: flex; justify-content: space-between; align-items: center; color: #FFFFFF;">
            <!-- Back Arrow -->
            <button id="lbBackBtn" class="gw-btn-press" style="width: 32px; height: 32px; border-radius: 50%; background: transparent; border: none; color: #4A9DFF; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              <i class="fa-solid fa-chevron-left"></i>
            </button>

            <!-- Title -->
            <div style="font-size: 17px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.2px;">${c.title || 'Leaderboard'}</div>

            <!-- 4-Dot Menu Icon -->
            <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #4A9DFF; cursor: pointer;">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="4" cy="4" r="2.2" />
                <circle cx="12" cy="4" r="2.2" />
                <circle cx="4" cy="12" r="2.2" />
                <circle cx="12" cy="12" r="2.2" />
              </svg>
            </div>
          </div>

          <!-- Segmented Tab Bar (Region / National / Global) -->
          <div style="margin: 12px 18px 16px; background: #161D32; border-radius: 14px; padding: 3px 6px; display: flex; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 4px 14px rgba(0,0,0,0.2);">
            ${tabsHtml}
          </div>

          <!-- Triple Podium Section (Rank 2 | Rank 1 | Rank 3) -->
          <div style="padding: 0 14px; display: flex; align-items: flex-end; justify-content: center; gap: 8px; margin-top: 10px;">
            
            <!-- RANK 2: Jackson (Left) -->
            <div class="lb-podium-col gw-btn-press" data-slot="2" data-name="${rank2.name}" style="flex: 1; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="position: relative; margin-bottom: -10px; z-index: 2;">
                <img src="${rank2.avatar}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(rank2.name)}&background=0284C7&color=FFF';" style="width: 66px; height: 66px; border-radius: 50%; object-fit: cover; border: 3px solid #38BDF8; box-shadow: 0 0 16px rgba(56, 189, 248, 0.45);" alt="${rank2.name}" />
                <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 22px; height: 22px; background: #0284C7; border: 1.5px solid #38BDF8; border-radius: 5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                  <span style="transform: rotate(-45deg); font-size: 11px; font-weight: 900; color: #FFFFFF;">2</span>
                </div>
              </div>
              <div style="width: 100%; height: 138px; background: #18223C; border-radius: 18px 18px 0 0; padding: 20px 6px 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-top: 1px solid rgba(56, 189, 248, 0.2);">
                <div style="font-size: 13.5px; font-weight: 700; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 84px;">${rank2.name}${tag(rank2)}</div>
                <div style="font-size: 16px; font-weight: 800; color: #38BDF8; margin: 4px 0 2px; font-variant-numeric: tabular-nums;">${getAdjustedScore(rank2.score).toLocaleString()}</div>
                <div style="font-size: 10.5px; color: #64748B;">${rank2.username}</div>
              </div>
            </div>

            <!-- RANK 1: Eiden (Center - Tallest & Crowned) -->
            <div class="lb-podium-col gw-btn-press" data-slot="1" data-name="${rank1.name}" style="flex: 1.15; display: flex; flex-direction: column; align-items: center; cursor: pointer; z-index: 5;">
              <!-- 5-Point Golden Crown -->
              <div style="margin-bottom: -4px; animation: gwFloatCoin 3s ease-in-out infinite;">
                <svg width="34" height="26" viewBox="0 0 24 20" fill="none">
                  <path d="M2 17L4 6L8.5 11L12 3L15.5 11L20 6L22 17H2Z" fill="url(#crownGrad)" stroke="#FDE68A" stroke-width="1.2" stroke-linejoin="round" />
                  <circle cx="12" cy="3" r="1.5" fill="#FFF" />
                  <circle cx="4" cy="6" r="1.2" fill="#FFF" />
                  <circle cx="20" cy="6" r="1.2" fill="#FFF" />
                  <defs>
                    <linearGradient id="crownGrad" x1="2" y1="3" x2="22" y2="17" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#FDE047" />
                      <stop offset="0.6" stop-color="#F59E0B" />
                      <stop offset="1" stop-color="#B45309" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div style="position: relative; margin-bottom: -12px; z-index: 2;">
                <img src="${rank1.avatar}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(rank1.name)}&background=D97706&color=FFF';" style="width: 82px; height: 82px; border-radius: 50%; object-fit: cover; border: 3.5px solid #F59E0B; box-shadow: 0 0 24px rgba(245, 158, 11, 0.55);" alt="${rank1.name}" />
                <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 24px; height: 24px; background: #D97706; border: 1.5px solid #FDE68A; border-radius: 5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
                  <span style="transform: rotate(-45deg); font-size: 12px; font-weight: 900; color: #FFFFFF;">1</span>
                </div>
              </div>

              <div style="width: 100%; height: 172px; background: #1D2847; border-radius: 20px 20px 0 0; padding: 24px 8px 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-top: 1px solid rgba(245, 158, 11, 0.35); box-shadow: 0 -8px 24px rgba(0,0,0,0.3);">
                <div style="font-size: 15px; font-weight: 800; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 96px;">${rank1.name}${tag(rank1)}</div>
                <div style="font-size: 19px; font-weight: 900; color: #F59E0B; margin: 4px 0 2px; font-variant-numeric: tabular-nums;">${getAdjustedScore(rank1.score).toLocaleString()}</div>
                <div style="font-size: 11px; color: #64748B;">${rank1.username}</div>
              </div>
            </div>

            <!-- RANK 3: Emma Aria (Right) -->
            <div class="lb-podium-col gw-btn-press" data-slot="3" data-name="${rank3.name}" style="flex: 1; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="position: relative; margin-bottom: -10px; z-index: 2;">
                <img src="${rank3.avatar}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(rank3.name)}&background=16A34A&color=FFF';" style="width: 66px; height: 66px; border-radius: 50%; object-fit: cover; border: 3px solid #22C55E; box-shadow: 0 0 16px rgba(34, 197, 94, 0.45);" alt="${rank3.name}" />
                <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 22px; height: 22px; background: #16A34A; border: 1.5px solid #86EFAC; border-radius: 5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                  <span style="transform: rotate(-45deg); font-size: 11px; font-weight: 900; color: #FFFFFF;">3</span>
                </div>
              </div>
              <div style="width: 100%; height: 126px; background: #18223C; border-radius: 18px 18px 0 0; padding: 20px 6px 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-top: 1px solid rgba(34, 197, 94, 0.2);">
                <div style="font-size: 13.5px; font-weight: 700; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 84px;">${rank3.name}${tag(rank3)}</div>
                <div style="font-size: 16px; font-weight: 800; color: #22C55E; margin: 4px 0 2px; font-variant-numeric: tabular-nums;">${getAdjustedScore(rank3.score).toLocaleString()}</div>
                <div style="font-size: 10.5px; color: #64748B;">${rank3.username}</div>
              </div>
            </div>

          </div>

          <!-- Bottom Sheet (Ranks 4+) -->
          <div style="background: #141A2D; border-radius: 26px 26px 0 0; padding: 16px 18px 24px; box-shadow: 0 -10px 30px rgba(0,0,0,0.4); flex: 1; border-top: 1px solid rgba(255, 255, 255, 0.06);">
            <div style="margin-bottom: 10px; padding: 12px 14px; border-radius: 14px; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.22);">
              <div style="display: flex; align-items: baseline; justify-content: space-between;">
                <div style="font-size: 11px; font-weight: 600; color: #FDBA74;">Your position</div>
                <div style="font-size: 12px; color: #CBD5E1; font-variant-numeric: tabular-nums;">${getAdjustedScore(me.score).toLocaleString()} pts</div>
              </div>
              <div id="lbYouRank" style="font-size: 30px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.02em; line-height: 1.15;">#${myRank}<span style="font-size: 12px; font-weight: 600; color: ${myRank <= 3 ? '#FDE68A' : '#94A3B8'}; margin-left: 8px;">${myRank <= 3 ? 'On the podium' : 'of ' + board.length}</span>${youMove ? `<span class="lb-move ${youMove.dir}" style="margin-left: 8px; vertical-align: 4px;">${youMove.dir === 'up' ? '&#9650;' : '&#9660;'} ${Math.abs(youMove.from - youMove.to)}</span>` : ''}</div>
              ${c.showDemoControls === false ? '' : `
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button class="lb-ctl bad" id="lbLose">- ${pointsStep}</button>
                <button class="lb-ctl good" id="lbEarn">+ ${pointsStep}</button>
                <button class="lb-ctl good" id="lbBig">+ ${pointsStep * 3}</button>
              </div>`}
            </div>
            ${rowsHtml}
          </div>

        </div>
      `;

      // Event handlers for tab clicks
      mount.querySelectorAll('.lb-tab-btn').forEach(btn => {
        btn.onclick = () => {
          const tab = btn.getAttribute('data-tab');
          if (tab === currentTab) return;
          currentTab = tab;
          youMove = null;
          if (c.soundEnabled !== false) snd.playToastPop();
          renderView();
          ctx.emit('leaderboard_tab_switched', { widgetId: widget.id, tab });
        };
      });

      // Event handlers for player row click
      mount.querySelectorAll('.lb-player-row, .lb-podium-col').forEach(row => {
        row.onclick = () => {
          const name = row.getAttribute('data-name');
          if (c.soundEnabled !== false) snd.playRewardChime();
          fireConfetti(['#38BDF8', '#F59E0B', '#22C55E']);
          ctx.emit('leaderboard_player_inspected', { widgetId: widget.id, name });
        };
      });

      const backBtn = mount.querySelector('#lbBackBtn');
      if (backBtn) {
        backBtn.onclick = () => {
          if (c.soundEnabled !== false) snd.playToastPop();
          ctx.emit('leaderboard_back_pressed', { widgetId: widget.id });
        };
      }

      const earn = mount.querySelector('#lbEarn');
      const big = mount.querySelector('#lbBig');
      const lose = mount.querySelector('#lbLose');
      if (earn) earn.onclick = () => changeScore(pointsStep);
      if (big) big.onclick = () => changeScore(pointsStep * 3);
      if (lose) lose.onclick = () => changeScore(-pointsStep);
    }

    const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function bigConfetti() {
      if (typeof window.confetti !== 'function') return;
      const colors = ['#F59E0B', '#FDE047', '#38BDF8', '#22C55E', '#FFFFFF'];
      window.confetti({ particleCount: 90, spread: 80, origin: { y: 0.45 }, colors });
      setTimeout(() => {
        window.confetti({ particleCount: 55, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
        window.confetti({ particleCount: 55, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
      }, 220);
    }

    // Earn or lose points, then show what happened: rows slide to their new places, the player's
    // row flashes green (up) or red with a shake (down), a badge shows how many places moved, and
    // reaching the top 3 pops the podium and fires confetti.
    function changeScore(delta) {
      const me = players.find(p => p.isYou);
      const frame = mount.querySelector('.gw-phone-frame');
      const scrollTop = frame ? frame.scrollTop : 0;
      const before = {};
      mount.querySelectorAll('[data-name]').forEach(el => {
        before[el.getAttribute('data-name') + (el.classList.contains('lb-podium-col') ? '|pod' : '|row')] = el.getBoundingClientRect().top;
      });
      const prevSlots = {};
      mount.querySelectorAll('.lb-podium-col').forEach(el => { prevSlots[el.getAttribute('data-slot')] = el.getAttribute('data-name'); });

      const from = rankOfYou();
      me.score = Math.max(0, me.score + delta);
      const to = rankOfYou();
      youMove = to === from ? null : { dir: to < from ? 'up' : 'down', from, to };
      renderView();

      const nowFrame = mount.querySelector('.gw-phone-frame');
      if (nowFrame) nowFrame.scrollTop = scrollTop;
      if (reduced()) { if (youMove) setTimeout(() => { youMove = null; }, 2200); return; }

      // Rows slide from their old position to the new one.
      mount.querySelectorAll('.lb-player-row').forEach(row => {
        const name = row.getAttribute('data-name');
        const oldTop = before[name + '|row'];
        if (oldTop !== undefined) {
          const dy = oldTop - row.getBoundingClientRect().top;
          if (Math.abs(dy) > 1) {
            row.style.transition = 'none';
            row.style.transform = 'translateY(' + dy + 'px)';
            row.style.position = 'relative';
            row.style.zIndex = row.hasAttribute('data-you') ? '3' : '1';
            void row.offsetHeight;
            row.style.transition = 'transform 520ms cubic-bezier(.2,.8,.2,1)';
            row.style.transform = 'none';
          }
        } else if (before[name + '|pod'] !== undefined) {
          row.classList.add('lb-drop'); // knocked off the podium
        }
      });

      const youRow = mount.querySelector('.lb-player-row[data-you]');
      if (youRow && youMove) youRow.classList.add(youMove.dir === 'up' ? 'lb-flash-up' : 'lb-flash-down');

      // Podium places that changed hands pop in.
      mount.querySelectorAll('.lb-podium-col').forEach(col => {
        if (prevSlots[col.getAttribute('data-slot')] !== col.getAttribute('data-name')) col.classList.add('lb-pod-pop');
      });

      const sound = c.soundEnabled !== false;
      if (youMove && youMove.dir === 'up') {
        ctx.emit('leaderboard_rank_up', { widgetId: widget.id, from: youMove.from, to: youMove.to });
        if (to <= 3) {
          if (sound) snd.playRewardChime();
          bigConfetti();
          ctx.emit('leaderboard_top3_reached', { widgetId: widget.id, rank: to });
        } else if (sound) {
          snd.playToastPop();
        }
      } else if (youMove && youMove.dir === 'down') {
        ctx.emit('leaderboard_rank_down', { widgetId: widget.id, from: youMove.from, to: youMove.to });
        if (sound) snd.playToastPop();
      }
      if (youMove) setTimeout(() => { youMove = null; }, 2200);
    }

    renderView();
    // Starting on the podium earns the confetti too.
    if (rankOfYou() <= 3 && !reduced()) setTimeout(bigConfetti, 500);
  }

  // Automatic sticker rewards are capped per browser session (default 2) so they stay special
  // instead of popping up after every reward. Manual unlocks (sticker album, SDK API) are not capped.
  const AUTO_STICKER_KEY = 'gmf_auto_stickers_shown';
  let autoStickersShownMem = 0;
  function takeAutoStickerSlot(max) {
    const limit = Number.isFinite(max) ? max : 2;
    let shown = autoStickersShownMem;
    try { shown = Math.max(shown, Number(sessionStorage.getItem(AUTO_STICKER_KEY)) || 0); } catch (_) {}
    if (shown >= limit) return false;
    autoStickersShownMem = shown + 1;
    try { sessionStorage.setItem(AUTO_STICKER_KEY, String(shown + 1)); } catch (_) {}
    return true;
  }

  // Widgets built in React live in their own bundles and load the first time one is shown:
  // Fire Streak and Coin Wallet (packages/coins-streak) and the Onboarding Tour nudge
  // (packages/flow-kit, react-native-flow-kit running on react-native-web).
  const REACT_KITS = [
    { types: ['fire_streak', 'coin_wallet'], global: 'GamifyCoinsStreak', file: 'coins-streak.js' },
    { types: ['nudge_tour'], global: 'GamifyFlowKit', file: 'flow-kit.js' },
    // Gift Rain, Smash the Egg and Claw Machine from @play-kit/games (packages/play-kit)
    { types: ['gift_rain', 'smash_egg', 'claw_machine'], global: 'GamifyPlayKit', file: 'play-kit.js', css: 'play-kit.css' }
  ];
  const kitLoading = {};
  function loadKit(kit, baseUrl) {
    if (kit.css && !document.querySelector(`link[data-gmf-kit="${kit.css}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${baseUrl}/sdk/${kit.css}`;
      link.setAttribute('data-gmf-kit', kit.css);
      document.head.appendChild(link);
    }
    if (window[kit.global]) return Promise.resolve(window[kit.global]);
    if (!kitLoading[kit.file]) {
      kitLoading[kit.file] = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = `${baseUrl}/sdk/${kit.file}`;
        s.onload = () => resolve(window[kit.global]);
        s.onerror = () => { kitLoading[kit.file] = null; reject(new Error(`Failed to load ${kit.file}`)); };
        document.head.appendChild(s);
      });
    }
    return kitLoading[kit.file];
  }
  function loadCoinsStreak(baseUrl) { return loadKit(REACT_KITS[0], baseUrl); }
  // A React widget may own this mount; release it before another widget replaces its content.
  function releaseReactKits(mountEl, except) {
    REACT_KITS.forEach((k) => { if (k !== except && window[k.global]) window[k.global].unmount(mountEl); });
  }
  function renderReactKit(kit, mount, widget, ctx) {
    releaseReactKits(mount, kit);
    mount.dataset.gmfPending = widget.id;
    if (!window[kit.global]) mount.innerHTML = '<div style="color:#94A3B8;">Loading widget...</div>';
    loadKit(kit, ctx.baseUrl)
      .then((lib) => {
        // Skip if another widget was selected while the bundle was loading.
        if (mount.dataset.gmfPending !== widget.id) return;
        lib.render(mount, widget, ctx);
      })
      .catch(() => { mount.innerHTML = '<div style="color:#94A3B8;">Could not load this widget.</div>'; });
  }

  // Brand logo on every widget: config.logoUrl (uploaded data URL, http(s) or site path),
  // logoPosition, logoSize (px height), logoOpacity, logoBadge. A MutationObserver keeps the logo
  // in place when a widget re-renders itself or a React kit mounts later.
  const LOGO_POSITIONS = {
    'top-left': 'top:10px; left:12px;',
    'top-center': 'top:10px; left:50%; transform:translateX(-50%);',
    'top-right': 'top:10px; right:12px;',
    'bottom-left': 'bottom:10px; left:12px;',
    'bottom-center': 'bottom:10px; left:50%; transform:translateX(-50%);',
    'bottom-right': 'bottom:10px; right:12px;'
  };
  function safeLogoUrl(u) {
    const s = String(u || '').trim();
    return /^(data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,|https?:\/\/|\/)/i.test(s) ? s : '';
  }
  // The widget's own frame: plain widgets use .gw-phone-frame, play-kit uses .pk-root; for other
  // React kits take the deepest leading element that is at least phone-card sized.
  function findLogoAnchor(mountEl) {
    const direct = mountEl.querySelector('.gw-phone-frame, .pk-root');
    if (direct) return direct;
    let el = mountEl.firstElementChild;
    let best = null;
    while (el) {
      if (el.offsetWidth >= 260 && el.offsetHeight >= 300) best = el;
      else if (best) break;
      el = el.firstElementChild;
    }
    return best;
  }
  function placeLogo(mountEl, cfg) {
    const url = safeLogoUrl(cfg.logoUrl);
    const existing = mountEl.querySelector('img[data-gmf-logo]');
    if (!url) { if (existing) existing.remove(); return; }
    const anchor = findLogoAnchor(mountEl);
    if (!anchor) return;
    if (existing && existing.parentElement === anchor) return;
    if (existing) existing.remove();
    if (getComputedStyle(anchor).position === 'static') anchor.style.position = 'relative';
    const size = Math.min(Math.max(Number(cfg.logoSize) || 28, 12), 120);
    const opacity = Math.min(Math.max(cfg.logoOpacity === undefined || cfg.logoOpacity === '' ? 1 : Number(cfg.logoOpacity), 0.1), 1);
    const badge = cfg.logoBadge === true;
    const img = document.createElement('img');
    img.setAttribute('data-gmf-logo', '');
    img.alt = 'Brand logo';
    img.src = url;
    img.style.cssText = `position:absolute; ${LOGO_POSITIONS[cfg.logoPosition] || LOGO_POSITIONS['bottom-center']} height:${size}px; width:auto; max-width:45%; object-fit:contain; opacity:${opacity}; z-index:40; pointer-events:none;` +
      (badge ? ' background:rgba(255,255,255,0.94); padding:4px 8px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.25); box-sizing:content-box;' : '');
    anchor.appendChild(img);
  }
  function applyLogo(mountEl, widget) {
    if (mountEl.__gmfLogoObs) { mountEl.__gmfLogoObs.disconnect(); mountEl.__gmfLogoObs = null; }
    const cfg = (widget && widget.config) || {};
    placeLogo(mountEl, cfg);
    if (!safeLogoUrl(cfg.logoUrl) || typeof MutationObserver === 'undefined') return;
    const obs = new MutationObserver(() => {
      const img = mountEl.querySelector('img[data-gmf-logo]');
      if (!img || img.parentElement !== findLogoAnchor(mountEl)) placeLogo(mountEl, cfg);
    });
    obs.observe(mountEl, { childList: true, subtree: true });
    mountEl.__gmfLogoObs = obs;
  }

  // Public API
  window.GamifyWidgets = {
    render(mountEl, widget, opts = {}) {
      injectSharedStyles();
      const sound = opts.sound || new window.GamifySoundEngine(opts.baseUrl || '');
      const originalEmit = opts.onEvent || (() => {});
      const emit = (ev, meta) => {
        originalEmit(ev, meta);
        // Automatic achievement sticker reward trigger
        if (opts.autoStickers !== false && window.GamifyStickers) {
          const STICKER_EVENT_MAP = {
            'duolingo_flow_completed': 'award_winner',
            'cred_slot_won': 'action_hero',
            'cred_wheel_won': 'comedy_king',
            'zepto_scratch_revealed': 'drama_llamaa',
            'mynaksh_streak_claimed': 'binge_watcher',
            'mynaksh_mantra_claimed': 'romance_pro',
            'paytm_chest_opened': 'wildlife_explorer',
            'paytm_scratch_revealed': 'wildlife_explorer',
            'paytm_spin_won': 'sci_fi_geek',
            'fire_streak_extended': 'binge_watcher',
            'coin_reward_claimed': 'award_winner',
            'nudge_tour_completed': 'award_winner',
            'gift_rain_won': 'action_hero',
            'smash_egg_won': 'comedy_king',
            'claw_machine_won': 'award_winner'
          };
          const targetSticker = STICKER_EVENT_MAP[ev];
          // Passport stamps are earned once: skip stickers already stamped. A new stamp always goes
          // into the passport; the celebration popup still respects the per-session cap.
          if (targetSticker && !window.GamifyStickers.isUnlocked(targetSticker)) {
            const showPopup = takeAutoStickerSlot(opts.maxStickersPerSession);
            setTimeout(() => {
              const stampFn = window.GamifyStickers.stamp || window.GamifyStickers.unlock;
              stampFn.call(window.GamifyStickers, targetSticker, {
                baseUrl: opts.baseUrl || '',
                sound,
                silent: !showPopup
              });
            }, 850);
          }
        }
      };
      const ctx = { sound, emit, baseUrl: opts.baseUrl || '' };

      // Analytics: one impression per render (Studio previews pass trackImpressions:false).
      if (opts.trackImpressions !== false) {
        try { originalEmit('widget_impression', { widgetId: widget.id, widgetType: widget.type }); } catch (_) {}
      }

      applyLogo(mountEl, widget);
      const kit = REACT_KITS.find((k) => k.types.includes(widget.type));
      if (kit) return renderReactKit(kit, mountEl, widget, ctx);
      delete mountEl.dataset.gmfPending;
      releaseReactKits(mountEl);

      switch (widget.type) {
        case 'zepto_scratch': return renderZeptoScratch(mountEl, widget, ctx);
        case 'mynaksh_checkin': return renderMynakshCheckin(mountEl, widget, ctx);
        case 'instaastro_points': return renderInstaAstroPoints(mountEl, widget, ctx);
        case 'paytm_chest_scratch': return renderPaytmChestScratch(mountEl, widget, ctx);
        case 'paytm_spin_win': return renderPaytmSpinWin(mountEl, widget, ctx);
        case 'duolingo_flow': return renderDuolingoFlow(mountEl, widget, ctx);
        case 'cred_wheel': return renderCredWheel(mountEl, widget, ctx);
        case 'cred_slot_machine': return renderCredSlotMachine(mountEl, widget, ctx);
        case 'gamify_leaderboard': return renderGamifyLeaderboard(mountEl, widget, ctx);
        default:
          mountEl.innerHTML = `<div style="color:#94A3B8;">Unknown widget type: ${widget.type}</div>`;
      }
    }
  };
})(window, document);

