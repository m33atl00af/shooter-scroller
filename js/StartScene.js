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

    // Far forest silhouette — conifer tree shapes
    g.fillStyle(0x091808);
    g.fillPoints([
      { x: 0,   y: H }, { x: 0,   y: 220 },
      { x: 40,  y: 175 }, { x: 80,  y: 220 },
      { x: 110, y: 160 }, { x: 150, y: 220 },
      { x: 185, y: 170 }, { x: 220, y: 220 },
      { x: 255, y: 155 }, { x: 295, y: 220 },
      { x: 330, y: 168 }, { x: 370, y: 220 },
      { x: 405, y: 158 }, { x: 445, y: 220 },
      { x: 478, y: 165 }, { x: 515, y: 220 },
      { x: 548, y: 152 }, { x: 588, y: 220 },
      { x: 622, y: 170 }, { x: 660, y: 220 },
      { x: 695, y: 160 }, { x: 735, y: 220 },
      { x: 768, y: 172 }, { x: W,   y: 220 },
      { x: W,   y: H },
    ], true);

    // Mid forest — closer, taller trees with wider canopy
    g.fillStyle(0x163820);
    g.fillPoints([
      { x: 0,   y: H }, { x: 0,   y: 295 },
      { x: 50,  y: 270 }, { x: 100, y: 295 },
      { x: 140, y: 262 }, { x: 185, y: 295 },
      { x: 230, y: 268 }, { x: 275, y: 295 },
      { x: 315, y: 258 }, { x: 360, y: 295 },
      { x: 400, y: 265 }, { x: 448, y: 295 },
      { x: 490, y: 260 }, { x: 538, y: 295 },
      { x: 578, y: 268 }, { x: 622, y: 295 },
      { x: 660, y: 255 }, { x: 708, y: 295 },
      { x: 745, y: 265 }, { x: W,   y: 295 },
      { x: W,   y: H },
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

    // ── Skin picker button ─────────────────────────────────────────────
    const currentSkinName = (localStorage.getItem('playerSkin') || 'blue').toUpperCase();
    this._skinBtn = this.add.text(W / 2, 305, `[ SKIN:  ${currentSkinName} ]`, {
      fontSize: '13px', color: '#44cc44', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this._skinBtn.on('pointerover', () => this._skinBtn.setColor('#88ff88'));
    this._skinBtn.on('pointerout',  () => this._skinBtn.setColor('#44cc44'));
    this._skinBtn.on('pointerdown', () => this._openSkinPopup());

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
    if (sfx.ok) sfx.playMusic('title');

    this._started = false;
    const start = () => {
      if (this._skinPopupOpen || this._started) return;
      this._started = true;
      sfx.init();
      this.scene.start('NameScene');
    };
    this.input.keyboard.on('keydown-ENTER', start);
    this.input.keyboard.on('keydown-SPACE', start);

    // Close popup on ESC
    this.input.keyboard.on('keydown-ESC', () => this._closeSkinPopup());

    this._skinPopupOpen = false;
    this._skinPopupEls  = [];
    this._loadScores();
  }

  _openSkinPopup() {
    if (this._skinPopupOpen) return;
    this._skinPopupOpen = true;
    this._buildSkinPopup();
    this._skinPopupEls.forEach(el => el.setVisible(true));
  }

  _closeSkinPopup() {
    if (!this._skinPopupOpen) return;
    this._skinPopupOpen = false;
    this._skinPopupEls.forEach(el => el.destroy());
    this._skinPopupEls = [];
  }

  _buildSkinPopup() {
    const CX = 400, CY = 205, depth = 25;
    const els = this._skinPopupEls;
    const add  = el => { els.push(el); return el; };

    const SKINS = [
      { name: 'blue',   label: 'BLUE',   color: 0x2e4a6e },
      { name: 'red',    label: 'RED',    color: 0xaa2200 },
      { name: 'green',  label: 'GREEN',  color: 0x1e6e2e },
      { name: 'yellow', label: 'YELLOW', color: 0x8b8014 },
      { name: 'black',  label: 'BLACK',  color: 0x1a1a2a },
    ];

    let selected = localStorage.getItem('playerSkin') || 'blue';
    const skinXs = [168, 256, 344, 432, 520];
    const charY  = 183;

    // Overlay + popup box
    add(this.add.rectangle(CX, CY, 800, 400, 0x000000, 0.75).setScrollFactor(0).setDepth(depth));
    add(this.add.rectangle(CX, CY, 540, 215, 0x071410, 0.97)
      .setStrokeStyle(2, 0x44aa44).setScrollFactor(0).setDepth(depth));
    add(this.add.text(CX, 115, '—  SELECT  SKIN  —', {
      fontSize: '18px', color: '#44ff44', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1));

    // Draw all character previews onto one graphics object
    const gfx = add(this.add.graphics().setScrollFactor(0).setDepth(depth + 1));
    SKINS.forEach((skin, i) => this._drawSkinPreview(gfx, skinXs[i], charY, skin.color));

    // Per-skin: selection border + label + hit zone
    const borders = [];
    SKINS.forEach((skin, i) => {
      const isSelected = () => selected === skin.name;

      const border = add(this.add.rectangle(skinXs[i], charY + 4, 72, 88, 0x000000, 0)
        .setStrokeStyle(2, isSelected() ? 0xffcc00 : 0x334455)
        .setScrollFactor(0).setDepth(depth + 2));
      borders.push(border);

      add(this.add.text(skinXs[i], charY + 52, skin.label, {
        fontSize: '10px', color: '#8899bb', fontFamily: 'monospace',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2));

      const hit = add(this.add.rectangle(skinXs[i], charY + 4, 72, 88, 0xffffff, 0)
        .setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(depth + 3));
      hit.on('pointerdown', () => {
        selected = skin.name;
        localStorage.setItem('playerSkin', selected);
        this._skinBtn.setText(`[ SKIN:  ${selected.toUpperCase()} ]`);
        borders.forEach((b, j) => b.setStrokeStyle(2, SKINS[j].name === selected ? 0xffcc00 : 0x334455));
      });
      hit.on('pointerover', () => { if (!isSelected()) border.setStrokeStyle(2, 0x666688); });
      hit.on('pointerout',  () => { border.setStrokeStyle(2, isSelected() ? 0xffcc00 : 0x334455); });
    });

    // Confirm button
    const confirmBtn = add(this.add.text(CX, 265, '[ CONFIRM ]', {
      fontSize: '16px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1)
      .setInteractive({ useHandCursor: true }));
    confirmBtn.on('pointerover', () => confirmBtn.setColor('#ffcc00'));
    confirmBtn.on('pointerout',  () => confirmBtn.setColor('#ffffff'));
    confirmBtn.on('pointerdown', () => this._closeSkinPopup());

    add(this.add.text(CX, 285, 'ESC  to  close', {
      fontSize: '10px', color: '#334455', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1));
  }

  _drawSkinPreview(g, cx, cy, unifColor) {
    g.fillStyle(0x5c4a1e); g.fillRect(cx - 8, cy - 34, 16, 7);   // helmet
    g.fillStyle(0xdaa070); g.fillRect(cx - 7, cy - 27, 14, 11);  // face
    g.fillStyle(0x000000); g.fillRect(cx + 2, cy - 25, 3, 3);    // eye
    g.fillStyle(0x8b6914); g.fillRect(cx - 9, cy - 16, 19, 3);   // belt
    g.fillStyle(unifColor); g.fillRect(cx - 9, cy - 13, 19, 13); // body
    g.fillStyle(0x8b7355); g.fillRect(cx - 13, cy - 12, 5, 9);   // left arm
    g.fillStyle(unifColor); g.fillRect(cx + 9, cy - 11, 5, 7);   // right arm
    g.fillStyle(0x444444); g.fillRect(cx + 9, cy - 13, 13, 3);   // gun
    g.fillStyle(0xff8800); g.fillRect(cx + 21, cy - 16, 3, 8);   // muzzle flash
    g.fillStyle(0xffee00); g.fillRect(cx + 22, cy - 15, 2, 6);
    g.fillStyle(0x3d2b1f); g.fillRect(cx - 8, cy, 6, 10);        // left leg
    g.fillRect(cx + 2, cy, 6, 10);                                // right leg
    g.fillRect(cx - 9, cy + 9, 8, 3);                            // left boot
    g.fillRect(cx + 2, cy + 9, 8, 3);                            // right boot
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
