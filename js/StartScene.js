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
      this.add.text(cx1 - 8, y, key,    { ...cs, color: '#99aacc' }).setOrigin(1, 0);
      this.add.text(cx1 + 8, y, action, cs).setOrigin(0, 0);
    });

    // vertical divider
    dl.lineStyle(1, 0x223344, 0.7);
    dl.lineBetween(390, 100, 390, 310);

    // ── Right column: Leaderboard ──────────────────────────────────────
    const cx2      = 596;
    const VISIBLE  = 10;
    const ROW_H    = 15;
    const ROW_TOP  = 133;

    this.add.text(cx2, 104, 'TOP  100', hdr).setOrigin(0.5);

    // Scroll indicators
    this._arrowUp = this.add.text(cx2, ROW_TOP - 11, '▲', {
      fontSize: '10px', color: '#445566', fontFamily: 'monospace',
    }).setOrigin(0.5).setVisible(false);

    this._arrowDown = this.add.text(cx2, ROW_TOP + VISIBLE * ROW_H + 2, '▼', {
      fontSize: '10px', color: '#445566', fontFamily: 'monospace',
    }).setOrigin(0.5).setVisible(false);

    // Pre-create visible row text objects
    this._scoreRows = Array.from({ length: VISIBLE }, (_, i) =>
      this.add.text(cx2, ROW_TOP + i * ROW_H, '', {
        fontSize: '11px', color: '#8899bb', fontFamily: 'monospace',
      }).setOrigin(0.5)
    );

    this._statusText = this.add.text(cx2, ROW_TOP + 2, 'Loading…', {
      fontSize: '11px', color: '#445566', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this._allScores   = [];
    this._scrollOffset = 0;
    this._VISIBLE      = VISIBLE;

    // Mouse wheel scroll
    this.input.on('wheel', (pointer, objs, dx, deltaY) => {
      this._scrollList(deltaY > 0 ? 1 : -1);
    });

    // Arrow key scroll (Up/Down don't conflict with Enter/Space start keys)
    this.input.keyboard.on('keydown-UP',   () => this._scrollList(-1));
    this.input.keyboard.on('keydown-DOWN', () => this._scrollList(1));

    // ── Bottom: start prompt ───────────────────────────────────────────
    const prompt = this.add.text(W / 2, 325, '[ PRESS  ENTER  TO  START ]', {
      fontSize: '17px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.05, duration: 550, yoyo: true, repeat: -1 });

    this.add.text(W / 2, 346, 'or Space      ·      ▲ ▼ / scroll  to  browse  scores', {
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

    this._loadScores();
  }

  _scrollList(dir) {
    const max = Math.max(0, this._allScores.length - this._VISIBLE);
    this._scrollOffset = Math.max(0, Math.min(max, this._scrollOffset + dir));
    this._renderScores();
  }

  _renderScores() {
    const slice = this._allScores.slice(this._scrollOffset, this._scrollOffset + this._VISIBLE);
    this._scoreRows.forEach((row, i) => {
      const entry = slice[i];
      if (!entry) { row.setText(''); return; }
      const rank  = `${this._scrollOffset + i + 1}.`.padEnd(3);
      const name  = (entry.name || '???').slice(0, 12).padEnd(12);
      const score = String(entry.score ?? 0).padStart(6);
      row.setText(`${rank} ${name} ${score}`);
    });
    this._arrowUp.setVisible(this._scrollOffset > 0);
    this._arrowDown.setVisible(this._scrollOffset < this._allScores.length - this._VISIBLE);
  }

  async _loadScores() {
    const scores = await LeaderboardService.getScores();
    if (!this.scene.isActive('StartScene')) return;

    this._statusText.setVisible(false);
    this._allScores = scores.slice(0, 100);

    if (!this._allScores.length) {
      this._statusText.setText('No scores yet — be first!').setVisible(true);
      return;
    }

    this._renderScores();
  }
}
