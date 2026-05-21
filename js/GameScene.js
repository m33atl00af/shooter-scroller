class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // ─── Asset Generation ────────────────────────────────────────────────────

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Sky gradient
    g.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    g.fillRect(0, 0, 800, 400);
    g.generateTexture('sky', 800, 400);

    // Far mountains (tiling)
    g.clear();
    g.fillStyle(0x2a1f3d);
    for (let i = 0; i < 6; i++) {
      const x = i * 200;
      g.fillTriangle(x, 200, x + 120, 60, x + 240, 200);
    }
    g.generateTexture('mountains', 1200, 200);

    // Mid hills (tiling)
    g.clear();
    g.fillStyle(0x1e3a2f);
    for (let i = 0; i < 8; i++) {
      const x = i * 160;
      g.fillEllipse(x + 80, 180, 200, 120);
    }
    g.generateTexture('hills', 1280, 180);

    // Ground tile
    g.clear();
    g.fillStyle(0x5a3e28); g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x6b4c30); g.fillRect(0, 0, 32, 6);
    g.fillStyle(0x4a321e); g.fillRect(1, 1, 30, 4);
    g.generateTexture('ground', 32, 32);

    // Platform tile
    g.clear();
    g.fillStyle(0x4a4a6a); g.fillRect(0, 0, 32, 16);
    g.fillStyle(0x5a5a7a); g.fillRect(0, 0, 32, 4);
    g.generateTexture('platform', 32, 16);

    // Player standing (36x40)
    g.clear();
    g.fillStyle(0x3d2b1f); g.fillRect(4, 32, 10, 8); g.fillRect(18, 32, 10, 8);
    g.fillStyle(0x2e4a6e); g.fillRect(4, 22, 24, 12);
    g.fillStyle(0x8b6914); g.fillRect(4, 21, 24, 3);
    g.fillStyle(0x8b7355); g.fillRect(6, 12, 20, 12);
    g.fillStyle(0x8b7355); g.fillRect(1, 13, 6, 8); g.fillRect(25, 13, 6, 8);
    g.fillStyle(0x333333); g.fillRect(25, 15, 10, 4);
    g.fillStyle(0xdaa070); g.fillRect(8, 3, 16, 14);
    g.fillStyle(0x5c4a1e); g.fillRect(7, 1, 18, 7);
    g.fillStyle(0x000000); g.fillRect(11, 9, 3, 3); g.fillRect(18, 9, 3, 3);
    g.generateTexture('player_stand', 36, 40);

    // Player crouching (36x28)
    g.clear();
    g.fillStyle(0x3d2b1f); g.fillRect(2, 20, 10, 8); g.fillRect(20, 20, 10, 8);
    g.fillStyle(0x2e4a6e); g.fillRect(2, 12, 28, 10);
    g.fillStyle(0x8b6914); g.fillRect(2, 11, 28, 3);
    g.fillStyle(0x8b7355); g.fillRect(4, 5, 24, 8);
    g.fillStyle(0x333333); g.fillRect(26, 7, 10, 4);
    g.fillStyle(0xdaa070); g.fillRect(8, 0, 16, 9);
    g.fillStyle(0x5c4a1e); g.fillRect(7, 0, 18, 5);
    g.generateTexture('player_crouch', 36, 28);

    // Player jumping (36x40)
    g.clear();
    g.fillStyle(0x3d2b1f); g.fillRect(6, 32, 10, 6); g.fillRect(22, 30, 10, 6);
    g.fillStyle(0x2e4a6e); g.fillRect(4, 20, 26, 13);
    g.fillStyle(0x8b7355); g.fillRect(6, 10, 20, 12);
    g.fillStyle(0x333333); g.fillRect(24, 13, 10, 4);
    g.fillStyle(0xdaa070); g.fillRect(8, 2, 16, 12);
    g.fillStyle(0x5c4a1e); g.fillRect(7, 0, 18, 7);
    g.generateTexture('player_jump', 36, 40);

    // Enemy — green uniform (28x36)
    g.clear();
    g.fillStyle(0x3d2b1f); g.fillRect(2, 28, 8, 8); g.fillRect(18, 28, 8, 8);
    g.fillStyle(0x3a5c2e); g.fillRect(2, 18, 24, 12);
    g.fillStyle(0x8b7355); g.fillRect(4, 10, 20, 10);
    g.fillStyle(0x3a5c2e); g.fillRect(0, 11, 5, 7); g.fillRect(23, 11, 5, 7);
    g.fillStyle(0x333333); g.fillRect(22, 14, 9, 3);
    g.fillStyle(0xdaa070); g.fillRect(6, 2, 16, 12);
    g.fillStyle(0x4a3c1a); g.fillRect(5, 0, 18, 7);
    g.fillStyle(0x000000); g.fillRect(9, 8, 3, 3); g.fillRect(16, 8, 3, 3);
    g.generateTexture('enemy', 28, 36);

    // Elite enemy — red uniform (28x36)
    g.clear();
    g.fillStyle(0x3d2b1f); g.fillRect(2, 28, 8, 8); g.fillRect(18, 28, 8, 8);
    g.fillStyle(0xaa2200); g.fillRect(2, 18, 24, 12);
    g.fillStyle(0x8b7355); g.fillRect(4, 10, 20, 10);
    g.fillStyle(0xaa2200); g.fillRect(0, 11, 5, 7); g.fillRect(23, 11, 5, 7);
    g.fillStyle(0x222222); g.fillRect(22, 14, 9, 3);
    g.fillStyle(0xdaa070); g.fillRect(6, 2, 16, 12);
    g.fillStyle(0x1a0a0a); g.fillRect(5, 0, 18, 7);
    g.fillStyle(0xff2200, 0.9); g.fillRect(9, 8, 3, 3); g.fillRect(16, 8, 3, 3);
    g.generateTexture('enemy_elite', 28, 36);

    // Brutal enemy — black uniform, orange eyes (28x36)
    g.clear();
    g.fillStyle(0x2a1a0f); g.fillRect(2, 28, 8, 8); g.fillRect(18, 28, 8, 8);
    g.fillStyle(0x111111); g.fillRect(2, 18, 24, 12);
    g.fillStyle(0x6b5a3e); g.fillRect(4, 10, 20, 10);
    g.fillStyle(0x111111); g.fillRect(0, 11, 5, 7); g.fillRect(23, 11, 5, 7);
    g.fillStyle(0x333333); g.fillRect(22, 14, 9, 3);
    g.fillStyle(0xdaa070); g.fillRect(6, 2, 16, 12);
    g.fillStyle(0x000000); g.fillRect(5, 0, 18, 7);
    g.fillStyle(0xff8800, 1.0); g.fillRect(9, 8, 3, 3); g.fillRect(16, 8, 3, 3);
    g.generateTexture('enemy_brutal', 28, 36);

    // Bullet (horizontal)
    g.clear();
    g.fillStyle(0xffdd00); g.fillRect(0, 0, 10, 4);
    g.fillStyle(0xff8800); g.fillRect(6, 1, 4, 2);
    g.generateTexture('bullet', 10, 4);

    // Bullet (vertical, upward shots)
    g.clear();
    g.fillStyle(0xffdd00); g.fillRect(0, 0, 4, 10);
    g.fillStyle(0xff8800); g.fillRect(1, 0, 2, 4);
    g.generateTexture('bullet_up', 4, 10);

    // Enemy bullet
    g.clear();
    g.fillStyle(0xff3300); g.fillRect(0, 0, 8, 4);
    g.generateTexture('enemy_bullet', 8, 4);

    // Muzzle flash
    g.clear();
    g.fillStyle(0xffff00, 0.9); g.fillCircle(6, 6, 6);
    g.fillStyle(0xffffff, 0.8); g.fillCircle(6, 6, 3);
    g.generateTexture('muzzle', 12, 12);

    // Blood particle
    g.clear();
    g.fillStyle(0xcc0000); g.fillRect(0, 0, 5, 5);
    g.generateTexture('blood', 5, 5);

    // Explosion frames
    const expColors = [0xffff00, 0xff8800, 0xff4400, 0xcc2200];
    for (let i = 0; i < 4; i++) {
      g.clear();
      g.fillStyle(expColors[i]); g.fillCircle(16, 16, 16 - i * 2);
      g.fillStyle(0xffffff, 0.5); g.fillCircle(16, 16, Math.max(1, 8 - i * 2));
      g.generateTexture(`exp${i}`, 32, 32);
    }

    g.destroy();
  }

  // ─── Level Construction ───────────────────────────────────────────────────

  buildLevel() {
    const groundY = 368;
    for (let x = 0; x < this.worldWidth; x += 32) {
      this.groundGroup.create(x + 16, groundY, 'ground').setImmovable(true).refreshBody();
    }

    const platforms = [
      // Zone 1 (0–2100): easy, wide platforms
      { x: 320,  y: 300, w: 6 }, { x: 680,  y: 260, w: 5 },
      { x: 980,  y: 300, w: 6 }, { x: 1280, y: 240, w: 5 },
      { x: 1550, y: 300, w: 5 }, { x: 1820, y: 255, w: 5 },

      // Zone 2 (2100–4200): medium difficulty
      { x: 2150, y: 255, w: 5 }, { x: 2420, y: 215, w: 4 },
      { x: 2680, y: 270, w: 5 }, { x: 2960, y: 235, w: 4 },
      { x: 3220, y: 205, w: 5 }, { x: 3500, y: 275, w: 4 },
      { x: 3780, y: 240, w: 4 }, { x: 4020, y: 210, w: 4 },

      // Zone 3 (4200–6400): hard, narrower
      { x: 4280, y: 235, w: 4 }, { x: 4520, y: 275, w: 3 },
      { x: 4740, y: 210, w: 4 }, { x: 4980, y: 265, w: 3 },
      { x: 5200, y: 225, w: 4 }, { x: 5430, y: 190, w: 3 },
      { x: 5650, y: 260, w: 4 }, { x: 5900, y: 220, w: 3 },
      { x: 6120, y: 195, w: 3 },

      // Zone 4 (6400–8500): very hard, tight platforms
      { x: 6480, y: 245, w: 3 }, { x: 6700, y: 205, w: 3 },
      { x: 6920, y: 260, w: 3 }, { x: 7150, y: 220, w: 3 },
      { x: 7370, y: 180, w: 3 }, { x: 7600, y: 245, w: 3 },
      { x: 7820, y: 205, w: 3 }, { x: 8060, y: 265, w: 2 },
      { x: 8270, y: 225, w: 2 },

      // Zone 5 (8500–10650): extreme, small platforms
      { x: 8580, y: 240, w: 2 }, { x: 8790, y: 200, w: 2 },
      { x: 9000, y: 260, w: 2 }, { x: 9210, y: 220, w: 2 },
      { x: 9420, y: 180, w: 3 }, { x: 9650, y: 245, w: 2 },
      { x: 9860, y: 205, w: 2 }, { x: 10060, y: 260, w: 2 },
      { x: 10260, y: 185, w: 2 }, { x: 10460, y: 235, w: 2 },

      // Zone 6 (10650–12800): brutal, tiny platforms, large gaps
      { x: 10730, y: 230, w: 2 }, { x: 10940, y: 190, w: 2 },
      { x: 11160, y: 255, w: 2 }, { x: 11380, y: 210, w: 2 },
      { x: 11580, y: 170, w: 2 }, { x: 11810, y: 235, w: 2 },
      { x: 12020, y: 195, w: 2 }, { x: 12230, y: 255, w: 2 },
      { x: 12440, y: 215, w: 2 }, { x: 12640, y: 180, w: 2 },
    ];

    for (const p of platforms) {
      for (let i = 0; i < p.w; i++) {
        this.groundGroup.create(p.x + i * 32 + 16, p.y, 'platform').setImmovable(true).refreshBody();
      }
    }
  }

  spawnEnemies() {
    const zones = [
      {
        start: 150,   end: 2050,  count: 8,
        opts: { hp: 2, speed: 65,  shootTimerMin: 4000, shootTimerMax: 7000, bulletSpeed: 260, texture: 'enemy' },
      },
      {
        start: 2200,  end: 4150,  count: 10,
        opts: { hp: 2, speed: 80,  shootTimerMin: 2800, shootTimerMax: 5000, bulletSpeed: 300, texture: 'enemy' },
      },
      {
        start: 4300,  end: 6350,  count: 12,
        opts: { hp: 3, speed: 95,  shootTimerMin: 2000, shootTimerMax: 4000, bulletSpeed: 340, texture: 'enemy_elite' },
      },
      {
        start: 6500,  end: 8450,  count: 14,
        opts: { hp: 3, speed: 110, shootTimerMin: 1500, shootTimerMax: 3000, bulletSpeed: 380, texture: 'enemy_elite' },
      },
      {
        start: 8600,  end: 10600, count: 16,
        opts: { hp: 4, speed: 125, shootTimerMin: 1000, shootTimerMax: 2200, bulletSpeed: 420, texture: 'enemy_elite' },
      },
      {
        start: 10750, end: 12750, count: 18,
        opts: { hp: 4, speed: 140, shootTimerMin: 600,  shootTimerMax: 1500, bulletSpeed: 460, texture: 'enemy_brutal' },
      },
    ];

    for (const zone of zones) {
      const positions = [];
      let attempts = 0;
      while (positions.length < zone.count && attempts < 600) {
        attempts++;
        const x = Phaser.Math.Between(zone.start, zone.end);
        if (positions.every(p => Math.abs(p - x) >= 90)) positions.push(x);
      }
      positions.forEach(x => this.spawnEnemy(x, zone.opts));
    }

    this.totalEnemies = this.enemies.getChildren().length;
  }

  spawnEnemy(x, opts = {}) {
    const e = this.physics.add.sprite(x, 80, opts.texture || 'enemy');
    e.setCollideWorldBounds(false);
    e.hp            = opts.hp            ?? 2;
    e.speed         = opts.speed         ?? 65;
    e.bulletSpeed   = opts.bulletSpeed   ?? 260;
    e.shootTimerMin = opts.shootTimerMin ?? 4000;
    e.shootTimerMax = opts.shootTimerMax ?? 7000;
    e.lastShot      = this.time.now + Phaser.Math.Between(e.shootTimerMin, e.shootTimerMax);
    e.shootTimer    = Phaser.Math.Between(e.shootTimerMin, e.shootTimerMax);
    this.enemies.add(e);
    return e;
  }

  // ─── Scene Lifecycle ──────────────────────────────────────────────────────

  preload() {}

  create() {
    this.worldWidth = 12800;

    this.score          = 0;
    this.hp             = 100;
    this.invincible     = false;
    this.facingRight    = true;
    this.lastShot       = 0;
    this.shootCooldown  = 160;
    this.crouching      = false;
    this.isPaused       = false;
    this.gameOverState  = false;
    this.winState       = false;
    this.anyEnemyKilled = false;
    this.currentZone    = 1;
    this.totalEnemies   = 0;

    this.playerName = this.registry.get('playerName') || 'PLAYER';
    LeaderboardService.startSession(); // fire-and-forget; token ready well before game ends

    document.getElementById('hp').textContent          = this.hp;
    document.getElementById('score').textContent       = this.score;
    document.getElementById('player-name').textContent = this.playerName;

    this.createTextures();

    this.add.image(400, 200, 'sky').setScrollFactor(0);
    this.bg1 = this.add.tileSprite(400, 110, 800, 200, 'mountains').setScrollFactor(0);
    this.bg2 = this.add.tileSprite(400, 310, 800, 180, 'hills').setScrollFactor(0);

    this.groundGroup  = this.physics.add.staticGroup();
    this.enemies      = this.physics.add.group();
    this.bullets      = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    this.buildLevel();
    this.spawnEnemies();

    this.player = this.physics.add.sprite(100, 200, 'player_stand');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(24, 36).setOffset(6, 4);

    this.physics.add.collider(this.player,       this.groundGroup);
    this.physics.add.collider(this.enemies,      this.groundGroup);
    this.physics.add.collider(this.bullets,      this.groundGroup, (b) => b.destroy());
    this.physics.add.collider(this.enemyBullets, this.groundGroup, (b) => b.destroy());
    this.physics.add.overlap(this.bullets,      this.enemies,      (b, e) => this.hitEnemy(b, e));
    this.physics.add.overlap(this.player,       this.enemyBullets, (p, b) => this.hitPlayer(b));
    this.physics.add.overlap(this.player,       this.enemies,      ()     => this.touchEnemy());

    this.cameras.main.setBounds(0, 0, this.worldWidth, 400);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.physics.world.setBounds(0, 0, this.worldWidth, 400);

    this.cursors  = this.input.keyboard.createCursorKeys();
    this.wasd     = this.input.keyboard.addKeys({
      up:     Phaser.Input.Keyboard.KeyCodes.W,
      down:   Phaser.Input.Keyboard.KeyCodes.S,
      left:   Phaser.Input.Keyboard.KeyCodes.A,
      right:  Phaser.Input.Keyboard.KeyCodes.D,
      shoot:  Phaser.Input.Keyboard.KeyCodes.Z,
      shootJ: Phaser.Input.Keyboard.KeyCodes.J,
    });
    this.escKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.particles = this.add.particles(0, 0, 'blood', {
      speed: { min: 80, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 0,
      gravityY: 400,
    });

    this.createPauseMenu();
  }

  // ─── Pause Menu ───────────────────────────────────────────────────────────

  createPauseMenu() {
    const cx = 400, cy = 200, depth = 30;

    const bg = this.add.rectangle(cx, cy, 294, 214, 0x000000, 0.93)
      .setStrokeStyle(2, 0x4444aa).setScrollFactor(0).setDepth(depth);

    const titleTxt = this.add.text(cx, 124, '— PAUSED —', {
      fontSize: '26px', color: '#bbbbff', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth);

    const divider = this.add.rectangle(cx, 151, 244, 1, 0x334488)
      .setScrollFactor(0).setDepth(depth);

    this.pauseLabels = ['RESUME', 'RESTART', 'QUIT TO MENU'];
    this.pauseOptionTexts = this.pauseLabels.map((lbl, i) =>
      this.add.text(cx, 176 + i * 40, `  ${lbl}`, {
        fontSize: '18px', fontFamily: 'monospace', color: '#777788',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(depth)
    );

    const hintTxt = this.add.text(cx, 292, 'ESC / P  ·  toggle  |  ▲ ▼  navigate  |  Enter  select', {
      fontSize: '10px', fontFamily: 'monospace', color: '#2a3a55',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth);

    this.pauseGroup = [bg, titleTxt, divider, ...this.pauseOptionTexts, hintTxt];
    this.pauseGroup.forEach(el => el.setVisible(false));
    this.pauseIndex = 0;
  }

  updatePauseHighlight() {
    this.pauseOptionTexts.forEach((t, i) => {
      const lbl = this.pauseLabels[i];
      if (i === this.pauseIndex) {
        t.setText(`▶ ${lbl}`).setColor('#ffcc00');
      } else {
        t.setText(`  ${lbl}`).setColor('#777788');
      }
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      this.pauseIndex = 0;
      this.updatePauseHighlight();
      this.pauseGroup.forEach(el => el.setVisible(true));
    } else {
      this.physics.resume();
      this.pauseGroup.forEach(el => el.setVisible(false));
    }
  }

  navigatePause(dir) {
    this.pauseIndex = (this.pauseIndex + dir + this.pauseLabels.length) % this.pauseLabels.length;
    this.updatePauseHighlight();
  }

  selectPause() {
    switch (this.pauseIndex) {
      case 0: this.togglePause(); break;
      case 1: this.physics.resume(); this.scene.restart(); break;
      case 2: this.physics.resume(); this.scene.start('StartScene'); break;
    }
  }

  // ─── Zone banner ──────────────────────────────────────────────────────────

  showZoneBanner(zone) {
    const labels = [
      '', 'ZONE  1',
      'ZONE  2  —  CAUTION',
      'ZONE  3  —  DANGER',
      'ZONE  4  —  CRITICAL',
      'ZONE  5  —  EXTREME',
      'ZONE  6  —  NO  MERCY',
    ];
    const colors = ['', '#aaffaa', '#ffff44', '#ff8822', '#ff2222', '#dd00ff', '#ff4400'];

    const txt = this.add.text(400, 72, labels[zone], {
      fontSize: '20px', color: colors[zone], fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(15).setAlpha(0);

    this.tweens.add({
      targets: txt, alpha: 1, duration: 280,
      onComplete: () => {
        this.tweens.add({
          targets: txt, alpha: 0, delay: 1800, duration: 500,
          onComplete: () => txt.destroy(),
        });
      },
    });
  }

  // ─── Shooting ─────────────────────────────────────────────────────────────

  shootBullet(shootUp) {
    const now = this.time.now;
    if (now - this.lastShot < this.shootCooldown) return;
    this.lastShot = now;

    sfx.shoot();

    let texture, vx, vy, ox, oy;
    if (shootUp) {
      texture = 'bullet_up';
      vx = 0; vy = -720; ox = 0; oy = -22;
    } else {
      texture = 'bullet';
      vx = this.facingRight ? 720 : -720;
      vy = 0;
      ox = this.facingRight ? 20 : -20;
      oy = this.crouching ? 2 : -5;
    }

    const b = this.bullets.create(this.player.x + ox, this.player.y + oy, texture);
    b.setVelocity(vx, vy);
    b.setFlipX(!shootUp && !this.facingRight);
    b.body.allowGravity = false;
    this.time.delayedCall(1100, () => { if (b && b.active) b.destroy(); });

    const mf = this.add.image(this.player.x + ox * 1.4, this.player.y + oy, 'muzzle');
    this.time.delayedCall(55, () => { if (mf) mf.destroy(); });
  }

  // ─── Combat ───────────────────────────────────────────────────────────────

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.hp--;
    this.particles.explode(8, enemy.x, enemy.y);
    this.cameras.main.shake(55, 0.004);

    if (enemy.hp <= 0) {
      sfx.explosion();
      this.showExplosion(enemy.x, enemy.y);
      enemy.destroy();
      this.anyEnemyKilled = true;
      this.score += 100;
      document.getElementById('score').textContent = this.score;
    } else {
      sfx.hit();
      this.tweens.add({ targets: enemy, alpha: 0.15, duration: 70, yoyo: true });
    }
  }

  hitPlayer(bullet) {
    if (this.invincible) return;
    bullet.destroy();
    sfx.hurt();
    this.hp = Math.max(0, this.hp - 20);
    document.getElementById('hp').textContent = this.hp;
    this.cameras.main.shake(110, 0.01);
    this.invincible = true;
    this.tweens.add({
      targets: this.player, alpha: 0.25, duration: 90,
      yoyo: true, repeat: 9,
      onComplete: () => { this.player.setAlpha(1); this.invincible = false; },
    });
    if (this.hp <= 0) this.gameOver();
  }

  touchEnemy() {
    if (!this.invincible) this.hitPlayer({ destroy: () => {} });
  }

  showExplosion(x, y) {
    let frame = 0;
    const img = this.add.image(x, y, 'exp0').setDepth(10);
    const ev = this.time.addEvent({
      delay: 55, repeat: 3,
      callback: () => {
        frame++;
        if (frame < 4) img.setTexture(`exp${frame}`);
        else { img.destroy(); ev.remove(); }
      },
    });
  }

  gameOver() {
    if (this.gameOverState || this.winState) return;
    this.gameOverState = true;
    this._doGameOver();
  }

  async _doGameOver() {
    this.physics.pause();
    sfx.gameOver();

    const depth = 20;
    this.add.rectangle(400, 200, 480, 168, 0x000000, 0.88).setScrollFactor(0).setDepth(depth);
    this.add.text(400, 152, 'GAME OVER', {
      fontSize: '42px', color: '#ff3300', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);
    this.add.text(400, 195, `Score: ${this.score}`, {
      fontSize: '16px', color: '#ffcc00', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    const savingText = this.add.text(400, 220, 'Saving score…', {
      fontSize: '14px', color: '#778899', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    const result = await LeaderboardService.submitScore(this.playerName, this.score);
    if (!this.sys.isActive()) return;
    savingText.destroy();

    const statusMsg = result?.rank
      ? `Rank  #${result.rank}  on the leaderboard!`
      : result?.ok ? 'Score saved!' : '(offline — score not saved)';

    this.add.text(400, 220, statusMsg, {
      fontSize: '14px', color: result?.rank ? '#44ffaa' : '#778899', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);
    this.add.text(400, 252, 'R  restart   ·   ESC  main menu', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    this.input.keyboard.once('keydown-R', () => this.scene.restart());
    this.input.keyboard.once('keydown-ESC', () => {
      this.physics.resume();
      this.scene.start('StartScene');
    });
  }

  // ─── Win condition ────────────────────────────────────────────────────────

  triggerWin() {
    if (this.winState || this.gameOverState) return;
    this.winState = true;
    this._doWin();
  }

  async _doWin() {
    this.physics.pause();
    sfx.win();

    const depth = 20;
    this.add.rectangle(400, 200, 540, 190, 0x000000, 0.92).setScrollFactor(0).setDepth(depth);

    this.add.text(400, 138, 'ALL ENEMIES DEFEATED!', {
      fontSize: '26px', color: '#44ffaa', fontFamily: 'monospace',
      stroke: '#006633', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    this.add.text(400, 170, 'YOU  ARE  LEGENDARY', {
      fontSize: '18px', color: '#ffcc00', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    this.add.text(400, 198, `Final Score: ${this.score}`, {
      fontSize: '16px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    const savingText = this.add.text(400, 222, 'Saving score…', {
      fontSize: '14px', color: '#778899', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    const result = await LeaderboardService.submitScore(this.playerName, this.score);
    if (!this.sys.isActive()) return;
    savingText.destroy();

    const statusMsg = result?.rank
      ? `Rank  #${result.rank}  on the leaderboard!`
      : result?.ok ? 'Score saved!' : '(offline — score not saved)';

    this.add.text(400, 222, statusMsg, {
      fontSize: '14px', color: result?.rank ? '#44ffaa' : '#778899', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    this.add.text(400, 256, 'R  restart   ·   ESC  main menu', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    this.input.keyboard.once('keydown-R', () => this.scene.restart());
    this.input.keyboard.once('keydown-ESC', () => {
      this.physics.resume();
      this.scene.start('StartScene');
    });
  }

  // ─── Enemy AI ─────────────────────────────────────────────────────────────

  updateEnemies(time) {
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      if (e.y > 450) { e.destroy(); return; }

      const dx   = this.player.x - e.x;
      const dist = Math.abs(dx);

      if (dist < 500) {
        e.setVelocityX(dx > 0 ? e.speed : -e.speed);
        e.setFlipX(dx < 0);
      } else {
        e.setVelocityX(0);
      }

      if (dist < 360 && time - e.lastShot > e.shootTimer) {
        e.lastShot   = time;
        e.shootTimer = Phaser.Math.Between(e.shootTimerMin, e.shootTimerMax);
        const b = this.enemyBullets.create(
          e.x + (dx > 0 ? 14 : -14), e.y - 8, 'enemy_bullet'
        );
        b.setVelocityX(dx > 0 ? e.bulletSpeed : -e.bulletSpeed);
        b.body.allowGravity = false;
        this.time.delayedCall(2200, () => { if (b && b.active) b.destroy(); });
      }

      if (e.body.blocked.down && dist < 420 && Phaser.Math.Between(0, 280) === 0) {
        e.setVelocityY(-460);
      }
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(time) {
    if (!this.player.active) return;

    if (Phaser.Input.Keyboard.JustDown(this.escKey) || Phaser.Input.Keyboard.JustDown(this.pKey)) {
      if (!this.gameOverState && !this.winState) this.togglePause();
    }

    if (this.isPaused) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
          Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
        this.navigatePause(-1);
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
                 Phaser.Input.Keyboard.JustDown(this.wasd.down)) {
        this.navigatePause(1);
      } else if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
                 Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        this.selectPause();
      }
      return;
    }

    // ── Win check — fires once all kills are confirmed ────────────────
    if (this.anyEnemyKilled && !this.winState && !this.gameOverState &&
        this.enemies.getChildren().length === 0) {
      this.triggerWin();
      return;
    }

    // ── Zone check ────────────────────────────────────────────────────
    const x = this.player.x;
    const playerZone = x < 2100 ? 1 : x < 4200 ? 2 : x < 6400 ? 3
                     : x < 8500 ? 4 : x < 10650 ? 5 : 6;
    if (playerZone !== this.currentZone) {
      this.currentZone = playerZone;
      this.showZoneBanner(playerZone);
    }

    const { left, right, up, down, space } = this.cursors;
    const w = this.wasd;
    const onGround = this.player.body.blocked.down;

    const goLeft  = left.isDown  || w.left.isDown;
    const goRight = right.isDown || w.right.isDown;
    const goDown  = down.isDown  || w.down.isDown;
    const aimUp   = up.isDown    || w.up.isDown;

    const jumpJust = Phaser.Input.Keyboard.JustDown(up)   ||
                     Phaser.Input.Keyboard.JustDown(space) ||
                     Phaser.Input.Keyboard.JustDown(w.up);

    if (jumpJust && onGround) { this.player.setVelocityY(-530); sfx.jump(); }

    this.crouching = onGround && goDown;

    if (goLeft) {
      this.player.setVelocityX(-185);
      this.facingRight = false;
      this.player.setFlipX(true);
    } else if (goRight) {
      this.player.setVelocityX(185);
      this.facingRight = true;
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (!onGround) {
      this.player.setTexture('player_jump');
      this.player.body.setSize(24, 36).setOffset(6, 4);
    } else if (this.crouching) {
      this.player.setTexture('player_crouch');
      this.player.body.setSize(24, 24).setOffset(6, 10);
    } else {
      this.player.setTexture('player_stand');
      this.player.body.setSize(24, 36).setOffset(6, 4);
    }

    const shootUp = aimUp && onGround;
    if (w.shoot.isDown || w.shootJ.isDown) this.shootBullet(shootUp);

    const camX = this.cameras.main.scrollX;
    this.bg1.tilePositionX = camX * 0.15;
    this.bg2.tilePositionX = camX * 0.4;

    this.updateEnemies(time);
  }
}
