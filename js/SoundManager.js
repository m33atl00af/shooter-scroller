class SoundManager {
  constructor() { this.ctx = null; }

  init() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  }

  get ok() { return !!this.ctx; }

  _out(vol, dur) {
    const g = this.ctx.createGain();
    const t = this.ctx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    g.connect(this.ctx.destination);
    return g;
  }

  shoot() {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(260, t + 0.07);
    o.connect(this._out(0.16, 0.07));
    o.start(t); o.stop(t + 0.07);
  }

  jump() {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(500, t + 0.16);
    o.connect(this._out(0.12, 0.18));
    o.start(t); o.stop(t + 0.18);
  }

  hit() {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.09);
    o.connect(this._out(0.2, 0.09));
    o.start(t); o.stop(t + 0.09);
  }

  explosion() {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    const dur = 0.45;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 320;
    src.connect(lp);
    lp.connect(this._out(0.55, dur));
    src.start(t); src.stop(t + dur);
  }

  hurt() {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(460, t);
    o.frequency.exponentialRampToValueAtTime(85, t + 0.32);
    o.connect(this._out(0.26, 0.34));
    o.start(t); o.stop(t + 0.34);
  }

  gameOver() {
    if (!this.ok) return;
    [380, 290, 210, 155].forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.22;
      const o = this.ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = freq;
      o.connect(this._out(0.25, 0.2));
      o.start(t); o.stop(t + 0.2);
    });
  }

  pickup() {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(440, t);
    o.frequency.exponentialRampToValueAtTime(880, t + 0.1);
    o.connect(this._out(0.1, 0.13));
    o.start(t); o.stop(t + 0.13);
  }

  win() {
    if (!this.ok) return;
    [260, 330, 392, 520, 660].forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.16;
      const o = this.ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = freq;
      o.connect(this._out(0.22, 0.22));
      o.start(t); o.stop(t + 0.22);
    });
  }
}

const sfx = new SoundManager();
