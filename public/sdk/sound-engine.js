/**
 * GamifySound — Studio Audio Engine for Gamify SaaS
 * Combines real extracted APK .mp3 effects with synthesized Web Audio API foley
 * (foil scratch rustle, coin cascade, mechanical odometer roll, wheel peg ticks, starburst whoosh).
 */
(function (window) {
  'use strict';

  class GamifySoundEngine {
    constructor(baseUrl = '') {
      this.baseUrl = baseUrl;
      this.ctx = null;
      this.muted = false;
      this.noiseBuffer = null;
      this.lastScratchAt = 0;
    }

    _ensureCtx() {
      if (this.muted) return null;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    setMuted(muted) {
      this.muted = !!muted;
    }

    playMp3(relPath, volume = 0.75) {
      if (this.muted) return;
      try {
        const url = `${this.baseUrl}${relPath.startsWith('/') ? '' : '/'}${relPath}`;
        const audio = new Audio(url);
        audio.volume = volume;
        audio.play().catch(() => {});
      } catch (_) {}
    }

    // Metallic foil scratch rustle (filtered white noise burst)
    playScratchFoil() {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const now = performance.now();
      if (now - this.lastScratchAt < 45) return;
      this.lastScratchAt = now;

      if (!this.noiseBuffer) {
        const bufferSize = ctx.sampleRate * 0.15;
        this.noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.6;
        }
      }

      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2600 + Math.random() * 1200;
      filter.Q.value = 1.4;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      src.stop(ctx.currentTime + 0.06);
    }

    // Crisp mechanical wheel peg tick
    playWheelTick(pitchMultiplier = 1) {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620 * pitchMultiplier, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.028);
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.032);
    }

    // Mechanical odometer digit roll click
    playOdometerTick() {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, t);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.018);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.022);
    }

    // Coin fountain cascade (multiple sparkling coin clinks)
    playCoinCascade(count = 10) {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const notes = [1318.5, 1567.98, 1760.0, 2093.0, 2349.3];
      for (let i = 0; i < count; i++) {
        const delay = i * 0.065 + Math.random() * 0.02;
        const t = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const f = notes[i % notes.length] * (0.98 + Math.random() * 0.06);
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.setValueAtTime(f * 1.25, t + 0.035);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.13, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.24);
      }
    }

    // Zepto / MyNaksh / InstaAstro bright reward pop & fanfare
    playRewardChime() {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.075;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.37);
      });
    }

    // Starburst transition whoosh + triumph chord (Paytm Spin & Win)
    playStarburstWin() {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.22);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.27);
      setTimeout(() => this.playRewardChime(), 160);
    }

    // Soft UI pop (for InstaAstro toast / card tap)
    playToastPop() {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      [587.33, 880].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + i * 0.06);
        gain.gain.setValueAtTime(0.14, t + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.18);
      });
    }

    // Flip card swoosh
    playCardFlip() {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(640, t + 0.14);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.17);
    }

    // Real extracted CRED Slot & Wheel sounds
    playCredSlotSpin() {
      this.playMp3('/assets/cred_slot_spin.mp3', 0.85);
    }

    playCredSlotWin() {
      this.playMp3('/assets/cred_slot_win.mp3', 0.9);
    }

    playCredWheelSpin() {
      this.playMp3('/assets/cred_wheel_spin.mp3', 0.85);
    }

    playCredWheelWin() {
      this.playMp3('/assets/cred_wheel_win.mp3', 0.9);
    }
  }

  window.GamifySoundEngine = GamifySoundEngine;
})(window);

