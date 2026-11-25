// WOK HEI — every sound is synthesized with WebAudio. No audio files,
// no network: a few oscillators, a noise buffer for the wok sizzle, and a
// quiet pentatonic loop for the kitchen music.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.sizzle = null;
    this.musicStep = 0;
  }

  // Call from the first user gesture; browsers block audio before one.
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
    if (muted) this.stopSizzle();
  }

  tone(freq, dur, type, vol, when = 0, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // A short noise burst, used for the wok toss and the trash puff.
  noise(dur, vol, filterFreq) {
    if (!this.ctx || this.muted) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start();
  }

  // Ingredient tossed into the wok.
  pop() {
    this.tone(520, 0.09, 'triangle', 0.25, 0, 880);
    this.noise(0.08, 0.12, 2400);
  }

  // An item hit the perfect zone.
  ding() {
    this.tone(1180, 0.22, 'sine', 0.22);
    this.tone(1760, 0.3, 'sine', 0.14, 0.07);
  }

  // A dish served: a little coin arpeggio.
  coin() {
    this.tone(988, 0.1, 'square', 0.12);
    this.tone(1319, 0.1, 'square', 0.12, 0.08);
    this.tone(1568, 0.22, 'square', 0.12, 0.16);
  }

  // Something burnt or an order walked out.
  buzz() {
    this.tone(160, 0.28, 'sawtooth', 0.16, 0, 110);
  }

  // A new order pinned to the board.
  bell() {
    this.tone(2093, 0.35, 'sine', 0.1);
    this.tone(2637, 0.4, 'sine', 0.07, 0.1);
  }

  // Continuous wok sizzle while anything cooks; gain follows the wok load.
  startSizzle() {
    if (!this.ctx || this.muted || this.sizzle) return;
    const len = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3200;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.0;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start();
    this.sizzle = { src, gain };
  }

  setSizzleLevel(level) {
    if (!this.sizzle || !this.ctx) return;
    const target = this.muted ? 0 : Math.min(0.09, level * 0.035);
    this.sizzle.gain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.2);
  }

  stopSizzle() {
    if (!this.sizzle) return;
    try { this.sizzle.src.stop(); } catch (e) { /* already stopped */ }
    this.sizzle = null;
  }

  // A slow pentatonic loop: one plucked note per beat, quiet underneath.
  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const pattern = [0, 2, 4, 3, 4, 5, 4, 2, 0, 1, 2, 4, 3, 2, 1, 0];
    this.musicTimer = window.setInterval(() => {
      if (this.muted) return;
      const note = scale[pattern[this.musicStep % pattern.length]];
      this.musicStep += 1;
      this.tone(note, 0.5, 'triangle', 0.05);
      if (this.musicStep % 4 === 1) this.tone(note / 2, 0.7, 'sine', 0.04);
    }, 420);
  }
}
