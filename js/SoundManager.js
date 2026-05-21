// ─── Note frequency map ───────────────────────────────────────────────────────
const N = {
  E2:82.41,  F2:87.31,  G2:98.00,  A2:110.00, B2:123.47,
  C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, B3:246.94,
  C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880.00, B5:987.77,
  R:0,
};

// ─── Music tracks ─────────────────────────────────────────────────────────────
// Each voice: { wave, vol, notes: [[hz, beats], ...] }
// All voices in a track must have equal total beats.
const MUSIC_TRACKS = {

  // ── Title theme — C major, adventurous (130 BPM, 32 beats) ──────────────
  title: {
    bpm: 130,
    voices: [
      { wave:'square', vol:0.07, notes:[
        [N.E5,1],[N.G5,1],[N.A5,1],[N.G5,1],
        [N.E5,2],[N.D5,1],[N.C5,1],
        [N.F5,1],[N.E5,1],[N.D5,1],[N.C5,1],
        [N.G5,2],[N.E5,2],
        [N.A5,1],[N.G5,1],[N.E5,1],[N.G5,1],
        [N.A5,2],[N.G5,1],[N.E5,1],
        [N.D5,1],[N.F5,1],[N.G5,1],[N.A5,1],
        [N.C5,4],
      ]},
      { wave:'square', vol:0.055, notes:[
        [N.C3,2],[N.G3,2],
        [N.A3,2],[N.E3,2],
        [N.F3,2],[N.G3,2],
        [N.C3,4],
        [N.C3,2],[N.G3,2],
        [N.A3,2],[N.C3,2],
        [N.G3,2],[N.F3,2],
        [N.C3,4],
      ]},
      { wave:'triangle', vol:0.05, notes:[
        [N.E4,2],[N.D4,2],
        [N.C4,2],[N.B3,2],
        [N.A3,2],[N.B3,2],
        [N.C4,4],
        [N.E4,2],[N.D4,2],
        [N.C4,2],[N.E4,2],
        [N.D4,2],[N.C4,2],
        [N.G4,4],
      ]},
    ],
  },

  // ── Game theme — A minor, driving action (158 BPM, 32 beats) ────────────
  game: {
    bpm: 158,
    voices: [
      { wave:'square', vol:0.07, notes:[
        [N.A5,1],[N.G5,1],[N.E5,2],
        [N.C5,1],[N.D5,1],[N.E5,2],
        [N.G5,1],[N.F5,1],[N.E5,1],[N.D5,1],
        [N.E5,4],
        [N.A5,1],[N.C5,1],[N.E5,2],
        [N.D5,2],[N.C5,2],
        [N.G5,1],[N.F5,1],[N.E5,1],[N.D5,1],
        [N.A4,4],
      ]},
      { wave:'square', vol:0.065, notes:[
        [N.A2,1],[N.R,1],[N.A2,1],[N.R,1],
        [N.C3,1],[N.R,1],[N.G2,1],[N.R,1],
        [N.A2,1],[N.R,1],[N.F2,1],[N.R,1],
        [N.E2,2],[N.E2,2],
        [N.A2,1],[N.R,1],[N.A2,1],[N.R,1],
        [N.D3,1],[N.R,1],[N.G2,1],[N.R,1],
        [N.A2,1],[N.R,1],[N.E2,1],[N.R,1],
        [N.A2,4],
      ]},
      { wave:'triangle', vol:0.045, notes:[
        [N.A4,1],[N.C4,1],[N.E4,1],[N.C4,1],
        [N.A4,1],[N.C4,1],[N.E4,1],[N.C4,1],
        [N.G4,1],[N.B3,1],[N.D4,1],[N.B3,1],
        [N.G4,1],[N.B3,1],[N.D4,1],[N.B3,1],
        [N.A4,1],[N.C4,1],[N.E4,1],[N.C4,1],
        [N.D4,1],[N.F4,1],[N.A4,1],[N.F4,1],
        [N.E4,1],[N.G4,1],[N.B4,1],[N.G4,1],
        [N.A4,4],
      ]},
    ],
  },
};

// ─── SoundManager ─────────────────────────────────────────────────────────────
class SoundManager {
  constructor() {
    this.ctx           = null;
    this._musicPlaying = false;
    this._musicGain    = null;
    this._musicNodes   = [];
    this._musicTimer   = null;
  }

  init() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  }

  get ok() { return !!this.ctx; }

  // ── SFX helpers ────────────────────────────────────────────────────────────

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
    const t   = this.ctx.currentTime;
    const dur = 0.45;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const lp  = this.ctx.createBiquadFilter();
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

  heal() {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    [440, 554, 659].forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t + i * 0.09);
      o.connect(this._out(0.09, 0.18));
      o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.18);
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

  // ── Music ──────────────────────────────────────────────────────────────────

  playMusic(trackName) {
    if (!this.ok) return;
    this.stopMusic();

    const track = MUSIC_TRACKS[trackName];
    if (!track) return;

    this._musicGain = this.ctx.createGain();
    this._musicGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    this._musicGain.connect(this.ctx.destination);
    this._musicPlaying = true;
    this._musicNodes   = [];

    const loop = () => {
      if (!this._musicPlaying) return;
      const duration = this._scheduleTrack(track);
      this._musicTimer = setTimeout(loop, Math.max(100, (duration - 0.08) * 1000));
    };
    loop();
  }

  stopMusic() {
    this._musicPlaying = false;
    clearTimeout(this._musicTimer);
    if (this._musicGain) {
      this._musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
      const g = this._musicGain;
      this._musicGain = null;
      setTimeout(() => { try { g.disconnect(); } catch(e) {} }, 150);
    }
    this._musicNodes = [];
  }

  _scheduleTrack(track) {
    const bps    = track.bpm / 60;
    const offset = this.ctx.currentTime + 0.05;
    let   endTime = 0;

    track.voices.forEach(voice => {
      let t = offset;
      voice.notes.forEach(([hz, beats]) => {
        const dur = (beats / bps) * 0.82;
        if (hz > 0 && this._musicGain) {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = voice.wave || 'square';
          o.frequency.setValueAtTime(hz, t);
          g.gain.setValueAtTime(voice.vol || 0.07, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          o.connect(g);
          g.connect(this._musicGain);
          o.start(t);
          o.stop(t + dur + 0.02);
          this._musicNodes.push(o);
        }
        t += beats / bps;
        endTime = Math.max(endTime, t);
      });
    });

    return endTime - this.ctx.currentTime;
  }
}

const sfx = new SoundManager();
