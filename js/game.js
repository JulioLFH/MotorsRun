'use strict';
// MotorsRun - carrera retro en tercera persona por la Costa Verde.
(() => {
  const W = 384, H = 216;
  const cvs = document.getElementById('game');
  const wrap = document.getElementById('wrap');
  const ctx = cvs.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const COLORS = [
    { name: 'ROJO', main: '#d01c1f', light: '#ff5a4a', dark: '#7a0d10' },
    { name: 'AZUL', main: '#1f5fd0', light: '#5a9bff', dark: '#0f2f70' },
    { name: 'VERDE', main: '#1f9a46', light: '#5fd87e', dark: '#0d4d22' },
    { name: 'NARANJA', main: '#f07a12', light: '#ffb050', dark: '#8a4005' },
    { name: 'NEGRO', main: '#2c2d38', light: '#8a8da0', dark: '#141419' },
  ];
  const DISTRICTS = ['SAN MIGUEL', 'MAGDALENA', 'SAN ISIDRO', 'MIRAFLORES', 'BARRANCO', 'CHORRILLOS', 'LA HERRADURA'];
  const QUOTES = [['DISCIPLINA HOY,', 'LIBERTAD MAÑANA'], ['SUEÑA · PLANIFICA', 'TRABAJA · LOGRA'], ['RIDE SAFE', 'CASCO SIEMPRE']];

  // ---------- Guardado ----------
  const STORE = 'motorsrun.save.v1';
  const save = { muted: false, crt: true };
  try { Object.assign(save, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { /* sin almacenamiento */ }
  // récord, monedas y color viven en el perfil del piloto (profiles.js)
  const profile = () => Profiles.current() || { name: '---', coins: 0, best: 0, bestKm: 0, color: 0 };
  const colorIdx = () => { const c = profile().color | 0; return c >= 0 && c < COLORS.length ? c : 0; };
  const persist = () => { try { localStorage.setItem(STORE, JSON.stringify(save)); } catch (e) { /* ignorar */ } };
  wrap.classList.toggle('crt', save.crt !== false);

  // ---------- Recursos ----------
  const SPR = Sprites.build();
  const SP = Sprites3D.build();
  Road.build(SP);
  let moto = Sprites.motoSet(COLORS[colorIdx()]);
  let bike = Sprites3D.bike(COLORS[colorIdx()]);
  function refreshBike() {
    moto = Sprites.motoSet(COLORS[colorIdx()]);
    bike = Sprites3D.bike(COLORS[colorIdx()]);
    setFavicon();
  }
  Sound.setMuted(save.muted);

  const SEG = Road.SEG, MAX = SEG * 60, PZ = Road.PLAYER_Z, DRAW = Road.DRAW;
  const UNITS_PER_M = MAX / 50;
  const LANES_X = [-2 / 3, 0, 2 / 3];
  const PW = 0.12;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const hit = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  const smooth = x => x * x * (3 - 2 * x);

  function setFavicon() {
    const link = document.querySelector('link[rel=icon]');
    if (link) link.href = moto.park.toDataURL();
  }
  setFavicon();

  // ---------- Tablero analógico ----------
  const A0 = 0.75 * Math.PI, SWEEP = 1.5 * Math.PI;
  function dialFace(kind) {
    const { c, g } = Pix.canvas(46, 46);
    const cx = 23, cy = 23, r = 21;
    Pix.disc(g, cx, cy, r, '#3a2a20');
    Pix.disc(g, cx, cy, r - 1, '#c8b890');
    Pix.disc(g, cx, cy, r - 3, '#1a120e');
    const n = kind === 'speed' ? 12 : 4;
    for (let i = 0; i <= n; i++) {
      const a = A0 + i / n * SWEEP, major = kind === 'speed' ? i % 3 === 0 : true;
      const red = kind === 'speed' ? i >= 10 : i === 0;
      const r0 = major ? r - 9 : r - 7;
      Pix.line(g, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * (r - 5), cy + Math.sin(a) * (r - 5), red ? '#e8343a' : '#e8d8b0');
    }
    if (kind === 'speed') PixelFont.draw(g, 'KM/H', cx, cy - 9, '#8a7a60', 1, 'center');
    else {
      PixelFont.draw(g, 'E', cx - 11, cy + 9, '#e8343a', 1, 'center');
      PixelFont.draw(g, 'F', cx + 11, cy + 9, '#e8d8b0', 1, 'center');
      g.drawImage(SPR.fuelIcon, cx - 3, cy - 12);
    }
    Pix.px(g, cx - 12, cy - 13, 'rgba(255,255,255,0.4)'); Pix.px(g, cx - 13, cy - 11, 'rgba(255,255,255,0.4)'); Pix.px(g, cx - 10, cy - 14, 'rgba(255,255,255,0.4)');
    return c;
  }
  const FACE_SPEED = dialFace('speed'), FACE_FUEL = dialFace('fuel');
  function needle(cx, cy, len, frac, col) {
    const a = A0 + clamp(frac, 0, 1) * SWEEP;
    Pix.line(ctx, cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len, col);
    Pix.disc(ctx, cx, cy, 1, '#e8d8b0');
  }
  function roundButton(label, col) {
    const { c, g } = Pix.canvas(40, 40);
    Pix.disc(g, 20, 20, 18, 'rgba(20,10,12,0.55)');
    Pix.ring(g, 20, 20, 16, 18, col);
    PixelFont.draw(g, label, 20, 17, '#fff2d0', 1, 'center');
    return c;
  }
  const BTN_TURBO_IMG = roundButton('TURBO', 'rgba(90,209,255,0.85)');
  const BTN_BRAKE_IMG = roundButton('FRENO', 'rgba(255,90,74,0.85)');

  // ---------- Estado ----------
  let state = 'menu', t = 0, stateT = 0, G = null;
  const input = { left: false, right: false, brake: false, turbo: false };
  const keys = { left: false, right: false, brake: false, turbo: false };
  const pointers = new Map();
  let touchMode = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  const BTN = {
    pause: { x: W - 16, y: 0, w: 16, h: 13 },
    turbo: { x: W - 62, y: H - 108, w: 40, h: 40 },
    brake: { x: 22, y: H - 108, w: 40, h: 40 },
    retry: { x: W / 2 - 78, y: 170, w: 74, h: 16 },
    menuO: { x: W / 2 + 4, y: 170, w: 74, h: 16 },
    menuP: { x: W / 2 - 40, y: 136, w: 80, h: 16 },
  };

  function nightAt(dist) {
    const c = (dist / UNITS_PER_M / 1000) % 10;
    if (c < 3.5) return 0;
    if (c < 4.5) return smooth(c - 3.5);
    if (c < 9) return 1;
    return 1 - smooth(c - 9);
  }

  function newRun() {
    G = {
      dist: 0, x: 0, speed: 0, lean: 0, bounce: 0, wheel: 0,
      score: 0, coins: 0, fuel: 100, nitro: 50, lives: 3, invuln: 0,
      cars: [], items: [], parts: [], floats: [], banner: null,
      shake: 0, skyOff: 0, hillOff: 0, nextItem: SEG * 25, nextKm: 1,
      turbo: false, stall: false, reason: '', newBest: false, final: 0, quote: QUOTES[0],
      night: 0, smokeT: 0, countdown: 3.2, lastCount: 4, slide: 0,
    };
    for (let i = 0; i < 3; i++) spawnCar(PZ + SEG * (30 + i * 35));
  }

  // ---------- Flujo de pantallas ----------
  function startGame() {
    if (!Profiles.current()) { openProfiles(); return; }
    Sound.init(); Sound.musicStart();
    newRun();
    state = 'play'; stateT = 0;
    Sound.engineOn();
    if (touchMode && document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
      }).catch(() => {});
    }
  }
  function toMenu() { state = 'menu'; stateT = 0; Sound.engineOff(); Sound.musicStart(); }
  function pauseGame() { if (state !== 'play') return; state = 'pause'; stateT = 0; Sound.engineOff(); Sound.musicStop(); }
  function resume() {
    state = 'play'; stateT = 1;
    pointers.clear();
    for (const k in keys) keys[k] = false;
    syncInput();
    Sound.musicStart();
  }

  function gameOver(reason) {
    const g = G;
    state = 'over'; stateT = 0; g.reason = reason;
    Sound.engineOff(); Sound.over();
    g.final = Math.floor(g.score);
    g.quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    g.newBest = Profiles.addRun({ coins: g.coins, score: g.final, km: g.dist / UNITS_PER_M / 1000 }).newBest;
  }

  function changeColor(d) {
    Profiles.update({ color: (colorIdx() + d + COLORS.length) % COLORS.length });
    refreshBike(); Sound.select();
  }
  function openProfiles() {
    Sound.engineOff();
    Profiles.open(() => { refreshBike(); Sound.select(); });
  }
  function toggleMute() { save.muted = !save.muted; Sound.setMuted(save.muted); persist(); }
  function toggleCrt() { save.crt = !save.crt; wrap.classList.toggle('crt', save.crt); persist(); }
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }

  // ---------- Efectos ----------
  function banner(a, b) { G.banner = { a, b, t: 0, dur: 2.8 }; }
  function float(x, y, text, color) { G.floats.push({ x, y, text, color, t: 0 }); }
  function part(o) { if (G.parts.length < 400) G.parts.push(Object.assign({ vx: 0, vy: 0, size: 1, grow: 0, grav: 0, life: 0.5 }, o, { max: o.life || 0.5 })); }
  function addScore(n, text) { G.score += n; if (text) float(W / 2, H - 78, text, '#ffd27a'); }
  function sparks(x, y, n) {
    for (let i = 0; i < n; i++) part({ x, y, vx: rand(-120, 120), vy: rand(-140, -20), life: rand(0.3, 0.7), color: Math.random() < 0.5 ? '#ffd23f' : '#ff7a1a', grav: 400 });
  }

  // ---------- Tráfico e ítems ----------
  function spawnCar(z) {
    const lane = Math.random() * 3 | 0;
    for (const c of G.cars) if (c.lane === lane && Math.abs(c.z - z) < SEG * 12) return;
    const tpl = SP.cars[Math.random() * SP.cars.length | 0];
    G.cars.push({ spr: tpl.spr, w: tpl.w, lights: tpl.lights, z, x: LANES_X[lane], tx: LANES_X[lane], lane, speed: MAX * rand(0.22, 0.55), passed: false, hit: false });
  }

  function addItem(kind, z, x) {
    const d = { coin: [SP.coin[0], 150, 70], fuel: [SP.fuel, 170, 0], nitro: [SP.nitro, 140, 0] }[kind];
    G.items.push({ kind, spr: d[0], w: d[1], lift: d[2], z, x, ph: Math.random() * 4, got: false });
  }

  function spawnItems(z) {
    const g = G, lane = Math.random() * 3 | 0;
    const r = Math.random();
    if (r < 0.4) for (let i = 0; i < 7; i++) addItem('coin', z + i * SEG * 2.5, LANES_X[lane]);
    else if (r < 0.65) for (let i = 0; i < 9; i++) addItem('coin', z + i * SEG * 2.5, Math.sin(i * 0.75) * 0.66);
    else if (r < 0.8) for (let i = 0; i < 5; i++) addItem('coin', z + i * SEG * 3, LANES_X[(lane + i) % 3]);
    if (Math.random() < (g.fuel < 40 ? 0.5 : 0.16)) addItem('fuel', z + SEG * 24, LANES_X[Math.random() * 3 | 0]);
    if (Math.random() < 0.16) addItem('nitro', z + SEG * 32, LANES_X[Math.random() * 3 | 0]);
  }

  function hurt(text) {
    const g = G;
    if (g.invuln > 0 || state !== 'play') return;
    g.lives--; g.invuln = 2; g.shake = 0.4;
    sparks(W / 2, H - 10, 18);
    Sound.hit();
    float(W / 2, H - 80, text || '-1 CASCO', '#ff5a4a');
    if (g.lives <= 0) {
      state = 'crash'; stateT = 0;
      g.reason = text === '¡AL MAR!' ? '¡AL MAR!' : '¡TE CAÍSTE!';
      g.slide = g.x < 0 ? -1 : 1;
      Sound.crash(); Sound.engineOff();
    }
  }

  // ---------- Actualización ----------
  function updatePlay(dt) {
    const g = G, pz = g.dist + PZ;
    const pSeg = Road.segAt(pz);
    const sp = g.speed / MAX;

    if (g.countdown > 0) {
      g.countdown -= dt;
      const n = Math.ceil(g.countdown);
      if (n !== g.lastCount && n >= 0) { g.lastCount = n; if (n > 0) Sound.select(); else Sound.start(); }
      if (g.countdown <= 0) banner('¡A RODAR!', DISTRICTS[0] + ' · COSTA VERDE');
      Sound.engineSet(60 + Math.sin(t * 20) * 20, false, true);
      return;
    }

    // dirección y fuerza centrífuga
    const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    g.x += steer * dt * 2.4 * Math.min(1, 0.25 + sp);
    g.x -= dt * 2 * sp * sp * pSeg.curve * 0.18;
    g.lean += (steer * 0.32 + pSeg.curve * sp * 0.025 - g.lean) * Math.min(1, dt * 8);

    // acelerador automático, freno y turbo
    g.turbo = input.turbo && g.nitro > 0.5 && !g.stall;
    const top = MAX * (g.turbo ? 1.3 : 1);
    if (g.stall) g.speed -= MAX * 0.35 * dt;
    else if (input.brake) g.speed -= MAX * 1.1 * dt;
    else if (g.speed < top) g.speed += MAX / 4 * (g.turbo ? 1.8 : 1) * dt;
    else g.speed -= MAX / 3 * dt;
    if (g.turbo) g.nitro = Math.max(0, g.nitro - 22 * dt);

    const off = Math.abs(g.x) > 1.1;
    if (off) {
      if (g.speed > MAX * 0.35) g.speed -= MAX * 0.9 * dt;
      g.bounce = Math.round(Math.random() * 2 * sp);
      if (Math.random() < sp * 0.8) part({ x: W / 2 + rand(-14, 14), y: H - 6, vx: rand(-80, 80), vy: rand(-60, -10), life: 0.4, color: g.x < 0 ? '#e8c08a' : '#7a8a4a', size: 2, grav: 300 });
      if (Math.random() < dt * 8) Sound.rumble();
    } else g.bounce = 0;
    g.speed = clamp(g.speed, 0, MAX * 1.3);
    g.dist += g.speed * dt;
    g.wheel += g.speed * dt;
    if (g.invuln > 0) g.invuln -= dt;

    // mar a la izquierda, cerro a la derecha
    if (g.x < -2.6) {
      Sound.splash();
      for (let i = 0; i < 30; i++) part({ x: W / 2 + rand(-30, 30), y: H - 20, vx: rand(-120, 120), vy: rand(-200, -60), life: rand(0.5, 0.9), color: Math.random() < 0.5 ? '#bfe0ff' : '#ffffff', size: 2, grav: 500 });
      g.x = -0.7; g.speed = MAX * 0.1; g.invuln = 0;
      hurt('¡AL MAR!');
      if (state !== 'play') return;
    }
    if (g.x > 2.05) { g.x = 1.6; g.speed = MAX * 0.15; hurt('¡CONTRA EL CERRO!'); if (state !== 'play') return; }

    // choque con objetos al costado de la pista
    if (Math.abs(g.x) > 1.05 && g.invuln <= 0) {
      for (const s of Road.segAt(pz).sprites) {
        if (s.hit && Math.abs(g.x - s.offset) < PW + s.hit) {
          g.speed = MAX * 0.12; g.x += g.x < 0 ? 0.35 : -0.35;
          hurt('¡CHOCASTE!');
          if (state !== 'play') return;
          break;
        }
      }
    }

    // tráfico
    for (const c of g.cars) {
      c.z += c.speed * dt;
      if (Math.random() < dt * 0.12) { c.lane = clamp(c.lane + (Math.random() < 0.5 ? -1 : 1), 0, 2); c.tx = LANES_X[c.lane]; }
      c.x += clamp(c.tx - c.x, -0.5 * dt, 0.5 * dt);
      const rel = c.z - pz;
      if (!c.passed && rel < -SEG * 0.5) {
        c.passed = true;
        if (!c.hit && Math.abs(c.x - g.x) < 0.42 && g.speed > MAX * 0.55) { addScore(50, '¡ROZÓN! +50'); Sound.whoosh(); }
      }
      if (!c.hit && g.invuln <= 0 && rel > -SEG * 0.5 && rel < SEG * 0.6 && Math.abs(c.x - g.x) < PW + c.w / Road.ROAD_W / 2 * 0.85) {
        c.hit = true;
        g.speed = Math.min(g.speed, c.speed * 0.6);
        hurt('¡CHOCASTE!');
        if (state !== 'play') return;
      }
    }
    g.cars = g.cars.filter(c => c.z - pz > -SEG * 4 && c.z - pz < SEG * (DRAW + 30));
    const km = g.dist / UNITS_PER_M / 1000;
    if (g.cars.length < Math.min(12, 3 + Math.floor(km * 1.2)) && Math.random() < dt * 2.5) spawnCar(pz + SEG * (DRAW - 5 - Math.random() * 20));

    // ítems
    if (g.dist > g.nextItem) { spawnItems(pz + SEG * (DRAW - 8)); g.nextItem = g.dist + SEG * rand(20, 45); }
    for (const it of g.items) {
      if (it.kind === 'coin') it.spr = SP.coin[Math.floor(t * 10 + it.ph) % 4];
      if (!it.got && Math.abs(it.z - pz) < SEG * 0.7 && Math.abs(it.x - g.x) < 0.24) {
        it.got = true;
        if (it.kind === 'coin') {
          g.coins++; g.score += 10; g.nitro = Math.min(100, g.nitro + 3);
          Sound.coin();
          for (let i = 0; i < 6; i++) part({ x: W / 2 + rand(-8, 8), y: H - 50, vx: rand(-60, 60), vy: rand(-80, -10), life: 0.35, color: '#fff3b0', grav: 200 });
        } else if (it.kind === 'fuel') {
          g.fuel = Math.min(100, g.fuel + 30); Sound.fuel(); float(W / 2, H - 70, '+GASOLINA', '#7dff9a');
        } else {
          g.nitro = Math.min(100, g.nitro + 40); Sound.nitro(); float(W / 2, H - 70, '+NITRO', '#5ad1ff');
        }
      }
    }
    g.items = g.items.filter(it => !it.got && it.z - pz > -SEG * 3);

    // gasolina y puntaje
    if (!g.stall) {
      g.fuel -= (1.3 + sp * 1.5 + (g.turbo ? 1.5 : 0)) * dt;
      if (g.fuel <= 0) { g.fuel = 0; g.stall = true; banner('¡SIN GASOLINA!', 'EL MOTOR SE APAGÓ...'); Sound.stall(); Sound.engineOff(); }
    }
    if (g.stall && g.speed < 60) { gameOver('¡SIN GASOLINA!'); return; }
    g.score += g.speed * dt / UNITS_PER_M * 0.5 * (g.turbo ? 2 : 1);

    if (km >= g.nextKm) {
      const k = g.nextKm++;
      if (k % 3 === 0) { const q = QUOTES[(k / 3 - 1) % QUOTES.length]; banner(q[0], q[1]); }
      else banner('KM ' + k, DISTRICTS[k % DISTRICTS.length]);
      addScore(200);
      Sound.milestone();
    }

    g.night = nightAt(g.dist);
    g.skyOff += pSeg.curve * sp * dt * 14;
    g.hillOff += pSeg.curve * sp * dt * 28;

    // humo del escape, llamas del turbo y líneas de velocidad
    g.smokeT -= dt;
    if (g.smokeT <= 0 && !g.stall) {
      g.smokeT = g.turbo ? 0.02 : 0.06;
      const c = Math.cos(g.lean), s = Math.sin(g.lean);
      const ex = W / 2 + 12 * c + 19 * s, ey = H - 5 + 12 * s - 19 * c;
      if (g.turbo) {
        part({ x: ex, y: ey, vx: rand(-10, 30), vy: rand(20, 60), life: 0.15, color: Math.random() < 0.5 ? '#5ad1ff' : '#ffd23f', size: 2 });
        const a = rand(0, Math.PI * 2);
        part({ x: W / 2 + Math.cos(a) * 30, y: Road.HORIZON + 25 + Math.sin(a) * 15, vx: Math.cos(a) * 500, vy: Math.sin(a) * 300, life: 0.35, color: 'rgba(255,240,210,0.7)', streak: true });
      } else {
        part({ x: ex, y: ey, vx: rand(-10, 25), vy: rand(10, 30), life: 0.6, color: '#8a8090', size: 1, grow: 5 });
      }
    }

    Sound.engineSet(40 + sp * 330, g.turbo, !g.stall);
  }

  function updateCrash(dt) {
    const g = G;
    g.speed = Math.max(0, g.speed - MAX * 0.8 * dt);
    g.dist += g.speed * dt;
    g.lean += (g.slide * 1.45 - g.lean) * Math.min(1, dt * 6);
    g.x += g.slide * dt * 0.4 * (g.speed / MAX);
    if (Math.random() < g.speed / MAX) sparks(W / 2 + g.slide * 14, H - 8, 2);
    for (const c of g.cars) c.z += c.speed * dt;
    if (stateT > 1.8) gameOver(g.reason);
  }

  function updateCommon(dt) {
    const g = G;
    for (const q of g.parts) { q.life -= dt; q.vy += q.grav * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.size += q.grow * dt; }
    g.parts = g.parts.filter(q => q.life > 0);
    for (const f of g.floats) { f.t += dt; f.y -= 22 * dt; }
    g.floats = g.floats.filter(f => f.t < 1);
    if (g.banner) { g.banner.t += dt; if (g.banner.t > g.banner.dur) g.banner = null; }
    if (g.shake > 0) g.shake -= dt;
  }

  function update(dt) {
    if (state === 'play') { updatePlay(dt); updateCommon(dt); }
    else if (state === 'crash') { updateCrash(dt); updateCommon(dt); }
  }

  // ---------- Dibujo ----------
  function drawBike() {
    const g = G;
    const bx = W / 2, by = H - 5 - g.bounce;
    ctx.fillStyle = 'rgba(20,8,16,0.35)';
    ctx.fillRect(bx - 12, by - 1, 24, 3);
    ctx.fillRect(bx - 8, by - 2, 16, 5);

    if (g.night > 0.05 && state === 'play' && !g.stall) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,235,170,${0.06 * g.night})`;
      const y0 = Road.HORIZON + 14, y1 = by - 40;
      for (let y = y0; y < y1; y += 2) {
        const k = (y - y0) / (y1 - y0);
        const hw = 8 + k * 50;
        ctx.fillRect(Math.round(bx + g.lean * 30 * k - hw), y, Math.round(hw * 2), 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    if (!(g.invuln > 0 && state === 'play' && Math.floor(g.invuln * 14) % 2 === 0)) {
      const frame = bike[Math.floor(g.wheel / 160) % 2];
      ctx.save();
      ctx.translate(bx + (state === 'crash' ? g.slide * stateT * 20 : 0), by);
      ctx.rotate(g.lean);
      ctx.drawImage(frame, -24, -60);
      ctx.restore();
    }

    const braking = input.brake && state === 'play';
    const glowA = 0.25 + g.night * 0.5 + (braking ? 0.5 : 0);
    const gs = braking ? 30 : 18;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(1, glowA);
    ctx.drawImage(SP.glowRed, bx + Math.sin(g.lean) * 27 - gs / 2, by - Math.cos(g.lean) * 27 - gs / 2, gs, gs);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawParticles() {
    for (const q of G.parts) {
      ctx.globalAlpha = Math.min(1, (q.life / q.max) * 1.4);
      ctx.fillStyle = q.color;
      if (q.streak) {
        const l = Math.hypot(q.vx, q.vy), ux = q.vx / l, uy = q.vy / l;
        for (let i = 0; i < 6; i++) ctx.fillRect(Math.round(q.x - ux * i * 2), Math.round(q.y - uy * i * 2), 1, 1);
      } else {
        const s = Math.max(1, Math.round(q.size));
        ctx.fillRect(Math.round(q.x - s / 2), Math.round(q.y - s / 2), s, s);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawHUD() {
    const g = G;
    ctx.fillStyle = 'rgba(24,10,12,0.72)';
    ctx.fillRect(0, 0, W, 13);
    Pix.rect(ctx, 0, 13, W, 1, 'rgba(240,226,192,0.35)');
    for (let i = 0; i < 3; i++) ctx.drawImage(i < g.lives ? SPR.helmetOn : SPR.helmetOff, 3 + i * 9, 3);
    ctx.drawImage(SP.coin[0], 33, 2, 9, 9);
    PixelFont.draw(ctx, 'S/' + g.coins, 45, 4, '#ffd23f');
    PixelFont.draw(ctx, String(Math.floor(g.score)).padStart(6, '0'), W / 2, 4, '#fff2d0', 1, 'center');
    const km = g.dist / UNITS_PER_M / 1000;
    PixelFont.draw(ctx, DISTRICTS[Math.floor(km) % DISTRICTS.length] + ' · ' + km.toFixed(2) + ' KM', W - 22, 4, '#f0e2c0', 1, 'right');
    Pix.rect(ctx, W - 12, 3, 2, 7, '#f0e2c0'); Pix.rect(ctx, W - 8, 3, 2, 7, '#f0e2c0');

    // velocímetro
    const kmh = Math.round(g.speed / MAX * 180);
    ctx.drawImage(FACE_SPEED, 3, H - 49);
    needle(26, H - 26, 15, kmh / 240, '#ff4a3d');
    Pix.rect(ctx, 16, H - 17, 21, 7, '#0a0605');
    PixelFont.draw(ctx, String(kmh).padStart(3, '0'), 26, H - 16, g.turbo ? '#5ad1ff' : '#ffb347', 1, 'center');

    // gasolina y nitro
    ctx.drawImage(FACE_FUEL, W - 49, H - 49);
    needle(W - 26, H - 26, 15, g.fuel / 100, g.fuel < 22 && Math.sin(t * 12) > 0 ? '#ffffff' : '#ff4a3d');
    PixelFont.draw(ctx, 'NITRO', W - 98, H - 13, '#5ad1ff', 1, 'left', '#0a0605');
    Pix.rect(ctx, W - 99, H - 7, 46, 5, '#0a0605');
    Pix.rect(ctx, W - 98, H - 6, Math.round(44 * g.nitro / 100), 3, g.turbo && Math.sin(t * 30) > 0 ? '#e0f8ff' : '#2fb8ff');

    if (g.fuel < 22 && !g.stall && Math.sin(t * 10) > 0) PixelFont.outline(ctx, '¡POCA GASOLINA!', W / 2, 20, '#ff5a4a', '#1a0a0a', 1, 'center');

    if (touchMode && state === 'play') {
      ctx.globalAlpha = 0.75;
      ctx.drawImage(BTN_TURBO_IMG, BTN.turbo.x, BTN.turbo.y);
      ctx.drawImage(BTN_BRAKE_IMG, BTN.brake.x, BTN.brake.y);
      ctx.globalAlpha = 1;
    }
    if (state === 'play' && g.countdown <= 0 && stateT < 7 && Math.sin(t * 5) > -0.3) {
      PixelFont.outline(ctx, touchMode ? 'TOCA IZQ / DER PARA MANEJAR' : '← → MANEJAR · ↓ FRENO · ESPACIO TURBO', W / 2, H - 70, '#fff2d0', '#1a0a0a', 1, 'center');
    }
  }

  function drawCountdown() {
    const g = G;
    if (g.countdown <= 0) return;
    const n = Math.ceil(g.countdown);
    const k = g.countdown - Math.floor(g.countdown);
    // semáforo vintage
    const x = W / 2 - 22, y = 40;
    Pix.rect(ctx, x, y, 44, 16, '#1a1210'); Pix.rect(ctx, x, y, 44, 1, '#5a4a40');
    const cols = ['#ff3a3a', '#ffb347', '#5aff7a'];
    for (let i = 0; i < 3; i++) {
      const on = (3 - n) >= i;
      Pix.disc(ctx, x + 8 + i * 14, y + 8, 5, on ? cols[Math.min(i, n === 1 ? 2 : i)] : '#3a2a26');
    }
    PixelFont.outline(ctx, n > 0 ? String(n) : '', W / 2, 66 - Math.round(k * 4), '#fff2d0', '#3a0a0e', 4, 'center');
  }

  function drawBanner() {
    const b = G.banner;
    if (!b) return;
    const k = Math.min(1, b.t * 5, (b.dur - b.t) * 4);
    const y = Math.round(26 - (1 - k) * 30);
    const w = Math.max(PixelFont.width(b.a, 2), PixelFont.width(b.b)) + 24;
    const x = Math.round(W / 2 - w / 2);
    ctx.globalAlpha = k;
    Pix.poly(ctx, [[x - 12, y + 2], [x + 2, y + 2], [x + 2, y + 26], [x - 12, y + 26], [x - 6, y + 14]], '#7a0f12');
    Pix.poly(ctx, [[x + w + 12, y + 2], [x + w - 2, y + 2], [x + w - 2, y + 26], [x + w + 12, y + 26], [x + w + 6, y + 14]], '#7a0f12');
    Pix.rect(ctx, x, y, w, 26, '#b3161b');
    Pix.rect(ctx, x, y + 2, w, 1, '#f0e2c0'); Pix.rect(ctx, x, y + 23, w, 1, '#f0e2c0');
    PixelFont.outline(ctx, b.a, W / 2, y + 5, '#fff2d0', '#5a0a0e', 2, 'center');
    PixelFont.draw(ctx, b.b, W / 2, y + 16, '#ffd27a', 1, 'center');
    ctx.globalAlpha = 1;
  }

  function drawFloats() {
    for (const f of G.floats) {
      ctx.globalAlpha = 1 - f.t;
      PixelFont.outline(ctx, f.text, f.x, f.y, f.color, '#1a0a0a', 1, 'center');
    }
    ctx.globalAlpha = 1;
  }

  function button(r, text, col) {
    Pix.rect(ctx, r.x, r.y, r.w, r.h, '#2a1810');
    Pix.rect(ctx, r.x + 1, r.y + 1, r.w - 2, r.h - 2, col);
    Pix.rect(ctx, r.x + 1, r.y + 1, r.w - 2, 1, 'rgba(255,255,255,0.3)');
    PixelFont.draw(ctx, text, r.x + r.w / 2, r.y + 6, '#fff2d0', 1, 'center', '#2a1810');
  }

  function drawScene() {
    const g = G;
    ctx.save();
    if (g.shake > 0 && state !== 'over') {
      const m = Math.ceil(g.shake * 8);
      ctx.translate(Math.round(rand(-m, m)), Math.round(rand(-m, m)));
    }
    Road.render(ctx, { dist: g.dist, x: g.x, t, night: g.night, skyOff: g.skyOff, hillOff: g.hillOff, objs: g.cars.concat(g.items) });
    drawBike();
    drawParticles();
    ctx.restore();
    drawHUD();
    drawFloats();
    drawBanner();
    drawCountdown();
  }

  function drawPause() {
    ctx.fillStyle = 'rgba(20,8,10,0.72)';
    ctx.fillRect(0, 0, W, H);
    PixelFont.outline(ctx, 'PAUSA', W / 2, 66, '#fff2d0', '#7a0f12', 4, 'center');
    PixelFont.draw(ctx, touchMode ? 'TOCA PARA CONTINUAR' : 'P / ESC / ENTER PARA CONTINUAR', W / 2, 100, '#f0e2c0', 1, 'center');
    PixelFont.draw(ctx, touchMode ? '' : 'Q: GARAJE · M: SONIDO · C: FILTRO RETRO', W / 2, 110, '#b8a888', 1, 'center');
    button(BTN.menuP, 'GARAJE', '#5a3a2a');
  }

  // Pantalla final como postal antigua
  function drawOver() {
    const g = G, k = Math.min(1, stateT * 3);
    ctx.fillStyle = `rgba(20,8,10,${0.6 * k})`;
    ctx.fillRect(0, 0, W, H);
    const px = W / 2 - 124, py = 14 + Math.round((1 - k) * 30), pw = 248, ph = 182;
    Pix.rect(ctx, px + 3, py + 3, pw, ph, 'rgba(0,0,0,0.4)');
    Pix.rect(ctx, px, py, pw, ph, '#f0e2c0');
    for (let i = 0; i < pw + ph; i += 8) {
      const col = (i / 8) % 2 ? '#1f3f8a' : '#c8323a';
      if (i < pw) { Pix.rect(ctx, px + i, py, 5, 3, col); Pix.rect(ctx, px + pw - i - 5, py + ph - 3, 5, 3, col); }
      if (i < ph) { Pix.rect(ctx, px, py + i, 3, 5, col); Pix.rect(ctx, px + pw - 3, py + ph - i - 5, 3, 5, col); }
    }
    PixelFont.draw(ctx, 'SALUDOS DESDE LA COSTA VERDE', px + 10, py + 9, '#7a5a3a');
    PixelFont.outline(ctx, g.reason, px + 11, py + 20, '#c8323a', '#5a0a0e', 3, 'left');

    // estampilla
    const sx = px + pw - 50, sy = py + 8;
    Pix.rect(ctx, sx, sy, 40, 46, '#fff8e8');
    for (let i = 0; i < 40; i += 4) { Pix.rect(ctx, sx + i, sy - 1, 2, 1, '#f0e2c0'); Pix.rect(ctx, sx + i, sy + 46, 2, 1, '#f0e2c0'); }
    Pix.rect(ctx, sx + 3, sy + 3, 34, 30, '#f69a52');
    Pix.rect(ctx, sx + 3, sy + 3, 34, 10, '#c8485e');
    Pix.disc(ctx, sx + 20, sy + 22, 6, '#ffe07a');
    Pix.rect(ctx, sx + 3, sy + 24, 34, 9, '#3d5490');
    Pix.rect(ctx, sx + 5, sy + 27, 30, 1, '#ffd690');
    PixelFont.draw(ctx, 'PERÚ', sx + 20, sy + 36, '#c8323a', 1, 'center');
    Pix.ring(ctx, sx + 8, sy + 40, 9, 10, 'rgba(60,40,30,0.45)');

    const rows = [
      ['DISTANCIA', (g.dist / UNITS_PER_M / 1000).toFixed(2) + ' KM'],
      ['MONEDAS', 'S/ ' + g.coins],
      ['PUNTAJE', String(g.final)],
      ['RÉCORD', String(profile().best)],
      ['BILLETERA DE ' + profile().name, 'S/ ' + profile().coins + '  (+' + g.coins + ')'],
    ];
    rows.forEach(([a, b], i) => {
      const y = py + 50 + i * 10;
      PixelFont.draw(ctx, a, px + 14, y, '#7a5a3a');
      PixelFont.draw(ctx, b, px + 176, y, i === 2 ? '#c8323a' : i === 4 ? '#b8860b' : '#3a2418', 1, 'right');
      for (let x = px + 14; x < px + 176; x += 3) Pix.px(ctx, x, y + 8, '#c8b48a');
    });
    if (g.newBest && Math.sin(t * 8) > -0.3) PixelFont.outline(ctx, '¡NUEVO RÉCORD!', px + pw / 2, py + 104, '#2a8a4a', '#f0e2c0', 2, 'center');
    PixelFont.draw(ctx, '"' + g.quote[0] + ' ' + g.quote[1] + '"', px + pw / 2, py + 120, '#5a3a2a', 1, 'center');
    PixelFont.draw(ctx, touchMode ? '' : 'ENTER: REINTENTAR · ESC: GARAJE', px + pw / 2, py + 132, '#a08a6a', 1, 'center');
    if (stateT > 0.8) {
      button(BTN.retry, 'REINTENTAR', '#c8323a');
      button(BTN.menuO, 'GARAJE', '#1f3f8a');
    }
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    if (state === 'menu') {
      const p = profile();
      Garage.draw(ctx, t, { park: moto.park, color: COLORS[colorIdx()], name: p.name, coins: p.coins, best: p.best, bestKm: p.bestKm, touch: touchMode, muted: save.muted });
      return;
    }
    drawScene();
    if (state === 'pause') drawPause();
    else if (state === 'over') drawOver();
  }

  // ---------- Entrada ----------
  const KEYMAP = {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    ArrowDown: 'brake', KeyS: 'brake',
    Space: 'turbo', ShiftLeft: 'turbo', ShiftRight: 'turbo', ArrowUp: 'turbo', KeyW: 'turbo', KeyX: 'turbo',
  };

  function syncInput() {
    const roles = [...pointers.values()];
    for (const k in input) input[k] = keys[k] || roles.includes(k);
  }

  addEventListener('keydown', e => {
    const k = e.code;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) e.preventDefault();
    if (KEYMAP[k] && state === 'play') { keys[KEYMAP[k]] = true; syncInput(); }
    if (e.repeat || Profiles.isOpen()) return;
    Sound.init(); Sound.musicStart();
    touchMode = false;
    if (k === 'KeyM') { toggleMute(); return; }
    if (k === 'KeyU' && state === 'menu') { openProfiles(); return; }
    if (k === 'KeyF') { toggleFullscreen(); return; }
    if (k === 'KeyC') { toggleCrt(); return; }
    switch (state) {
      case 'menu':
        if (k === 'ArrowLeft' || k === 'KeyA') changeColor(-1);
        else if (k === 'ArrowRight' || k === 'KeyD') changeColor(1);
        else if (k === 'Enter' || k === 'Space') startGame();
        break;
      case 'play':
        if (k === 'KeyP' || k === 'Escape') pauseGame();
        break;
      case 'pause':
        if (k === 'KeyQ') toMenu();
        else if (k === 'KeyP' || k === 'Escape' || k === 'Enter' || k === 'Space') resume();
        break;
      case 'over':
        if (stateT > 0.8) {
          if (k === 'Enter' || k === 'Space') startGame();
          else if (k === 'Escape') toMenu();
        }
        break;
    }
  });
  addEventListener('keyup', e => {
    if (KEYMAP[e.code]) { keys[KEYMAP[e.code]] = false; syncInput(); }
  });

  function toCanvas(e) {
    const r = cvs.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
  }
  const steerRole = p => (p.x < W / 2 ? 'left' : 'right');

  cvs.addEventListener('pointerdown', e => {
    e.preventDefault();
    Sound.init(); Sound.musicStart();
    if (e.pointerType === 'touch') touchMode = true;
    const p = toCanvas(e);
    switch (state) {
      case 'menu':
        if (hit(p, Garage.ARROW_L)) changeColor(-1);
        else if (hit(p, Garage.ARROW_R)) changeColor(1);
        else if (hit(p, Garage.SOUND)) toggleMute();
        else if (hit(p, Garage.PROFILE)) openProfiles();
        else startGame();
        break;
      case 'play':
        if (hit(p, BTN.pause)) { pauseGame(); break; }
        if (touchMode && hit(p, BTN.turbo)) pointers.set(e.pointerId, 'turbo');
        else if (touchMode && hit(p, BTN.brake)) pointers.set(e.pointerId, 'brake');
        else pointers.set(e.pointerId, steerRole(p));
        syncInput();
        break;
      case 'pause':
        if (hit(p, BTN.menuP)) toMenu(); else resume();
        break;
      case 'over':
        if (stateT > 0.8) { if (hit(p, BTN.menuO)) toMenu(); else startGame(); }
        break;
    }
  });
  cvs.addEventListener('pointermove', e => {
    const role = pointers.get(e.pointerId);
    if (role === 'left' || role === 'right') { pointers.set(e.pointerId, steerRole(toCanvas(e))); syncInput(); }
  });
  const release = e => { if (pointers.delete(e.pointerId)) syncInput(); };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);
  cvs.addEventListener('contextmenu', e => e.preventDefault());

  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
  addEventListener('blur', () => pauseGame());

  // ---------- Escalado ----------
  function fit() {
    let s = Math.min(innerWidth / W, innerHeight / H);
    if (s >= 3) s = Math.floor(s);
    wrap.style.width = Math.floor(W * s) + 'px';
    wrap.style.height = Math.floor(H * s) + 'px';
  }
  addEventListener('resize', fit);
  fit();
  if (!Profiles.current()) openProfiles();

  // ---------- Bucle ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt; stateT += dt;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // acceso para depuración: MotorsRun.tick(2) simula 2 segundos de juego
  window.MotorsRun = {
    get state() { return state; }, get G() { return G; }, startGame, input,
    tick(sec) { for (let i = 0; i < sec * 60; i++) { t += 1 / 60; stateT += 1 / 60; update(1 / 60); } render(); },
  };
})();
