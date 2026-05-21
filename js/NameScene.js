class NameScene extends Phaser.Scene {
  constructor() { super({ key: 'NameScene' }); }

  create() {
    const W = 800, H = 400;
    this.nameStr      = '';
    this.MAX_LEN      = 12;
    this.cursorOn     = true;
    this.errorVisible = false;

    // ── Background (matches StartScene) ───────────────────────────────
    const g = this.add.graphics();
    g.fillGradientStyle(0x000011, 0x000011, 0x001033, 0x001033, 1);
    g.fillRect(0, 0, W, H);

    for (let i = 0; i < 90; i++) {
      const sx = Phaser.Math.Between(0, W);
      const sy = Phaser.Math.Between(0, H * 0.7);
      g.fillStyle(0xffffff, Math.random() * 0.7 + 0.3);
      g.fillRect(sx, sy, Math.random() > 0.75 ? 2 : 1, Math.random() > 0.75 ? 2 : 1);
    }

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

    g.fillStyle(0x3a2510); g.fillRect(0, 360, W, H);
    g.fillStyle(0x52361a); g.fillRect(0, 360, W, 6);

    // ── Title ─────────────────────────────────────────────────────────
    this.add.text(W / 2, 85, 'ENTER YOUR NAME', {
      fontSize: '38px', color: '#ffcc00', fontFamily: 'monospace',
      stroke: '#aa3300', strokeThickness: 5,
    }).setOrigin(0.5);

    const dl = this.add.graphics();
    dl.lineStyle(1, 0xff6600, 0.4);
    dl.lineBetween(160, 118, 640, 118);

    // ── Input box ─────────────────────────────────────────────────────
    this.add.rectangle(W / 2, 195, 360, 52, 0x000000, 0.82)
      .setStrokeStyle(2, 0x4466aa);

    this.nameDisplay = this.add.text(W / 2, 195, '', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // ── Hints ─────────────────────────────────────────────────────────
    this.add.text(W / 2, 240, 'A – Z only   ·   12 characters max   ·   Backspace to delete', {
      fontSize: '11px', color: '#445566', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // ── Error text (hidden until needed) ──────────────────────────────
    this.errorText = this.add.text(W / 2, 268, '', {
      fontSize: '13px', color: '#ff4444', fontFamily: 'monospace',
    }).setOrigin(0.5).setAlpha(0);

    // ── Blinking prompt ───────────────────────────────────────────────
    const prompt = this.add.text(W / 2, 316, '[ PRESS  ENTER  TO  CONTINUE ]', {
      fontSize: '17px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.05, duration: 550, yoyo: true, repeat: -1 });

    // ── Cursor blink timer ────────────────────────────────────────────
    this.time.addEvent({
      delay: 530, loop: true,
      callback: () => { this.cursorOn = !this.cursorOn; this._renderName(); },
    });

    this._renderName();

    // ── Keyboard input ────────────────────────────────────────────────
    sfx.playMusic('title');
    this.input.keyboard.on('keydown', this._handleKey, this);
  }

  _handleKey(event) {
    if (event.key === 'Backspace') {
      this.nameStr = this.nameStr.slice(0, -1);
      this._renderName();
      return;
    }
    if (event.key === 'Enter') {
      this._submit();
      return;
    }
    if (/^[a-zA-Z]$/.test(event.key) && this.nameStr.length < this.MAX_LEN) {
      this.nameStr += event.key.toUpperCase();
      this._renderName();
    }
  }

  _renderName() {
    this.nameDisplay.setText(this.nameStr + (this.cursorOn ? '|' : ' '));
  }

  _submit() {
    const name = this.nameStr.trim();
    if (name.length < 2) {
      this._showError('Name must be at least 2 letters');
      return;
    }
    if (this._hasBadWord(name)) {
      this._showError('Please choose a different name');
      this.nameStr = '';
      this._renderName();
      return;
    }
    this.registry.set('playerName', name);
    sfx.init();
    this.scene.start('GameScene');
  }

  _showError(msg) {
    this.errorText.setText(msg).setAlpha(1);
    this.tweens.add({ targets: this.errorText, alpha: 0, delay: 2200, duration: 400 });
  }

  _hasBadWord(name) {
    const lower = name.toLowerCase();
    // Normalize common phonetic letter substitutions before checking
    const norm  = lower.replace(/ph/g, 'f').replace(/kn/g, 'n');

    const check = (s) => {
      // Root patterns — catch all suffix variants (nigguh, niggah, phuck, etc.)
      const roots = ['nigg', 'fuc'];
      if (roots.some(r => s.includes(r))) return true;

      // Short words — exact match only (avoids BASS→ass, LASS→ass false positives)
      const exactOnly = ['ass', 'fag', 'cum', 'poo', 'tit', 'nut', 'gay'];
      if (exactOnly.includes(s)) return true;

      // Longer words and phonetic variants — substring match
      const substrings = [
        'shit', 'shyt', 'bitch', 'biatch', 'cunt', 'kunt',
        'dick', 'cock', 'kock', 'pussy', 'faggot', 'whore',
        'slut', 'bastard', 'piss', 'prick', 'twat', 'wank',
        'arse', 'asshole', 'arsehole', 'bollock', 'tosser',
        'wanker', 'retard', 'rape', 'nazi', 'fuk', 'azz',
      ];
      return substrings.some(w => s.includes(w));
    };

    return check(lower) || check(norm);
  }
}
