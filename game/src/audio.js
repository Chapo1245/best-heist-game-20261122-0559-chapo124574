// audio.js — tiny synthesised sound bank (WebAudio, no audio files).
// Every sound is built from oscillators at run time, so the game ships
// zero audio assets and makes zero network requests.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.lastAlarmTick = 0;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.ctx.destination);
    } catch (_err) { this.ctx = null; }
  }

  tone(freq, dur, type = 'sine', vol = 1, delay = 0, slideTo = 0) {
    if (!this.ctx || this.muted) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain); gain.connect(this.master);
      osc.start(t0); osc.stop(t0 + dur + 0.05);
    } catch (_err) { /* headless / no audio: stay silent */ }
  }

  pickup() { this.tone(880, 0.09, 'sine', 0.7); this.tone(1318, 0.12, 'sine', 0.5, 0.07); }
  targetLoot() { this.tone(523, 0.12, 'triangle', 0.8); this.tone(659, 0.12, 'triangle', 0.8, 0.09); this.tone(784, 0.22, 'triangle', 0.8, 0.18); }
  coinToss() { this.tone(1567, 0.06, 'square', 0.25); this.tone(2093, 0.08, 'square', 0.2, 0.05); }
  smoke() { this.tone(220, 0.35, 'sawtooth', 0.25, 0, 90); }
  jammer() { this.tone(440, 0.1, 'square', 0.3); this.tone(440, 0.1, 'square', 0.3, 0.12); }
  doorOpen() { this.tone(392, 0.15, 'triangle', 0.6); this.tone(523, 0.2, 'triangle', 0.6, 0.1); }
  spotted() { this.tone(660, 0.16, 'square', 0.5, 0, 330); }
  caught() { this.tone(311, 0.3, 'sawtooth', 0.6, 0, 110); this.tone(233, 0.5, 'sawtooth', 0.6, 0.22, 70); }
  win() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.7, i * 0.11)); }

  // Soft alarm pulse while hunted; throttled so it never spams.
  alarmTick(now) {
    if (now - this.lastAlarmTick < 620) return;
    this.lastAlarmTick = now;
    this.tone(980, 0.07, 'square', 0.22);
  }
}
