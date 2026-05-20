class StartScene extends Phaser.Scene {
  constructor() { super({ key: 'StartScene' }); }

  create() {
    const W = 800, H = 400;
    const g = this.add.graphics();

    // Sky gradient
    g.fillGradientStyle(0x000011, 0x000011, 0x001033, 0x001033, 1);
    g.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 90; i++) {
      const sx = Phaser.Math.Between(0, W);
      const sy = Phaser.Math.Between(0, H * 0.7);
      g.fillStyle(0xffffff, Math.random() * 0.7 + 0.3);
      g.fillRect(sx, sy, Math.random() > 0.75 ? 2 : 1, Math.random() > 0.75 ? 2 : 1);
    }

    // Mountain silhouette
    g.fillStyle(0x080820);
    g.fillPoints([
      { x: 0,   y: H }, { x: 0,   y: 240 },
      { x: 60,  y: 180 }, { x: 130, y: 240 },
      { x: 200, y: 165 }, { x: 270, y: 240 },
      { x: 340, y: 185 }, { x: 410, y: 240 },
      { x: 480, y: 160 }, { x: 550, y: 240 },
      { x: 620, y: 175 }, { x: 690, y: 240 },
      { x: 760, y: 190 }, { x: W,   y: 240 },
      { x: W,   y: H },
    ], true);

    // Hill midground
    g.fillStyle(0x0e2818);
    g.fillPoints([
      { x: 0,   y: H }, { x: 0,   y: 310 },
      { x: 80,  y: 285 }, { x: 180, y: 300 },
      { x: 260, y: 275 }, { x: 360, y: 295 },
      { x: 450, y: 270 }, { x: 560, y: 290 },
      { x: 640, y: 272 }, { x: 740, y: 288 },
      { x: W,   y: 280 }, { x: W,   y: H },
    ], true);

    // Ground strip
    g.fillStyle(0x3a2510); g.fillRect(0, 360, W, H);
    g.fillStyle(0x52361a); g.fillRect(0, 360, W, 6);

    // ── Title ─────────────────────────────────────────────────────────
    g.fillStyle(0xff6600, 0.06);
    g.fillRect(60, 38, 680, 56);

    this.add.text(W / 2, 62, 'SHOOTER SCROLLER', {
      fontSize: '42px', color: '#ffcc00', fontFamily: 'monospace',
      stroke: '#aa3300', strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);

    const dl = this.add.graphics();
    dl.lineStyle(1, 0xff6600, 0.35);
    dl.lineBetween(30, 94, 770, 94);

    // ── Left column: Controls ──────────────────────────────────────────
    const hdr = { fontSize: '12px', color: '#ffcc00', fontFamily: 'monospace' };
    const cs  = { fontSize: '11px', color: '#7788aa', fontFamily: 'monospace' };
    const cx1 = 195;

    this.add.text(cx1, 104, 'CONTROLS', hdr).setOrigin(0.5);

    const controls = [
      ['A / D  or  ◄ ►',  'Move'],
      ['W / Space / ▲',    'Jump'],
      ['S / ▼',            'Crouch'],
      ['Z / J  (hold)',    'Shoot'],
      ['▲ + Shoot',        'Aim up'],
      ['ESC / P',          'Pause'],
      ['R',                'Restart'],
    ];
    controls.forEach(([key, action], i) => {
      const y = 122 + i * 18;
      this.add.text(cx1 - 8,  y, key,    { ...cs, color: '#99aacc' }).setOrigin(1, 0);
      this.add.text(cx1 + 8,  y, action, cs).setOrigin(0, 0);
    });

    // vertical divider
    dl.lineStyle(1, 0x223344, 0.7);
    dl.lineBetween(390, 100, 390, 292);

    // ── Right column: Leaderboard ──────────────────────────────────────
    const cx2 = 596;
    this.add.text(cx2, 104, 'TOP SCORES', hdr).setOrigin(0.5);

    this._statusText = this.add.text(cx2, 148, 'Loading…', {
      fontSize: '11px', color: '#445566', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Pre-create 8 score row text objects
    this._scoreRows = Array.from({ length: 8 }, (_, i) =>
      this.add.text(cx2, 130 + (i + 1) * 18, '', {
        fontSize: '11px', color: '#8899bb', fontFamily: 'monospace',
      }).setOrigin(0.5)
    );

    // ── Bottom: start prompt ───────────────────────────────────────────
    const prompt = this.add.text(W / 2, 320, '[ PRESS  ENTER  TO  START ]', {
      fontSize: '17px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.05, duration: 550, yoyo: true, repeat: -1 });

    this.add.text(W / 2, 341, 'or Space', {
      fontSize: '11px', color: '#445566', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(W - 6, H - 6, 'v0.4', {
      fontSize: '10px', color: '#334455', fontFamily: 'monospace',
    }).setOrigin(1, 1);

    // ── Start handler ──────────────────────────────────────────────────
    const start = () => {
      sfx.init();
      this.scene.start('NameScene');
    };
    this.input.keyboard.once('keydown-ENTER', start);
    this.input.keyboard.once('keydown-SPACE', start);

    // Fetch leaderboard (fire-and-forget — Phaser create() is synchronous)
    this._loadScores();
  }

  async _loadScores() {
    const scores = await LeaderboardService.getScores();
    if (!this.scene.isActive('StartScene')) return;

    this._statusText.setVisible(false);

    if (!scores.length) {
      this._statusText.setText('No scores yet — be first!').setVisible(true);
      return;
    }

    scores.slice(0, 8).forEach((entry, i) => {
      const rank  = `${i + 1}.`.padEnd(3);
      const name  = (entry.name || '???').padEnd(8).slice(0, 8);
      const score = String(entry.score ?? 0).padStart(6);
      this._scoreRows[i].setText(`${rank} ${name} ${score}`);
    });
  }
}
