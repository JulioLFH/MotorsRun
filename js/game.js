'use strict';
// MotorsRun - carrera retro en tercera persona por la Costa Verde.
(() => {
  const VERSION = 'v1.8.0';
  const W = 384, H = 216;
  const cvs = document.getElementById('game');
  const wrap = document.getElementById('wrap');
  const ctx = cvs.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const DISTRICTS = ['SAN MIGUEL', 'MAGDALENA', 'SAN ISIDRO', 'MIRAFLORES', 'BARRANCO', 'CHORRILLOS', 'LA HERRADURA'];
  const QUOTES = [['DISCIPLINA HOY,', 'LIBERTAD MAÑANA'], ['SUEÑA · PLANIFICA', 'TRABAJA · LOGRA'], ['RIDE SAFE', 'CASCO SIEMPRE']];
  const TYPE_NAME = { classic: 'CLÁSICA', naked: 'NAKED', sport: 'DEPORTIVA', adventure: 'AVENTURA' };

  // ---------- Ajustes del dispositivo ----------
  const STORE = 'motorsrun.save.v1';
  const save = { muted: false, crt: true };
  try { Object.assign(save, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { /* sin almacenamiento */ }
  const persist = () => { try { localStorage.setItem(STORE, JSON.stringify(save)); } catch (e) { /* ignorar */ } };
  wrap.classList.toggle('crt', save.crt !== false);

  // monedas, récord y motos viven en el perfil del piloto (profiles.js)
  const profile = () => Profiles.current() || { name: '---', coins: 0, best: 0, bestKm: 0, owned: [BIKE_START], bike: BIKE_START };
  const curBike = () => bikeById(profile().bike);

  // ---------- Recursos ----------
  const SPR = Sprites.build();
  const SP = Sprites3D.build();
  Road.build(SP);
  Sound.setMuted(save.muted);

  const cache = new Map();
  function art(b) {
    if (!cache.has(b.id)) cache.set(b.id, { side: Pix.enhance(Sprites.sideBike(b)), rear: Sprites3D.rearSet(b), rider: Sprites3D.flyingRider(b), carry: Sprites3D.carry(b) });
    return cache.get(b.id);
  }
  let ART = art(curBike());
  function refreshBike() { ART = art(curBike()); setFavicon(); }

  const SEG = Road.SEG, MAX = SEG * 60, PZ = Road.PLAYER_Z, DRAW = Road.DRAW;
  const U = MAX / 180;            // unidades del mundo por km/h
  const UNITS_PER_M = MAX / 50;
  const LANES_X = [-2 / 3, 0, 2 / 3];
  const PW = 0.12;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const hit = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  const smooth = x => x * x * (3 - 2 * x);

  function setFavicon() {
    const link = document.querySelector('link[rel=icon]');
    if (link) link.href = ART.side.toDataURL();
  }
  setFavicon();

  // ---------- Tablero analógico ----------
  const A0 = 0.75 * Math.PI, SWEEP = 1.5 * Math.PI, DIAL_MAX = 300;
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
    return Pix.enhance(c, { outline: false, shade: false });
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
  const BTN_IMG = {
    gas: roundButton('ACELERA', 'rgba(125,255,154,0.85)'),
    turbo: roundButton('TURBO', 'rgba(90,209,255,0.85)'),
    brake: roundButton('FRENO', 'rgba(255,90,74,0.85)'),
  };

  // ---------- Estado ----------
  let state = 'menu', t = 0, stateT = 0, G = null;
  const input = { left: false, right: false, brake: false, turbo: false, gas: false };
  const keys = { left: false, right: false, brake: false, turbo: false, gas: false };
  const pointers = new Map();
  let touchMode = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const shop = { i: 0, msg: '', msgT: 0, busy: false };

  const BTN = {
    pause: { x: W - 16, y: 0, w: 16, h: 13 },
    gas: { x: W - 60, y: H - 104, w: 40, h: 40 },
    turbo: { x: W - 60, y: H - 150, w: 40, h: 40 },
    brake: { x: 20, y: H - 104, w: 40, h: 40 },
    retry: { x: W / 2 - 78, y: 170, w: 74, h: 16 },
    menuO: { x: W / 2 + 4, y: 170, w: 74, h: 16 },
    menuP: { x: W / 2 - 40, y: 136, w: 80, h: 16 },
    shopL: { x: 132, y: 66, w: 22, h: 40 },
    shopR: { x: 254, y: 66, w: 22, h: 40 },
    shopBuy: { x: 284, y: 150, w: 92, h: 20 },
    shopBack: { x: 8, y: 192, w: 70, h: 16 },
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
      night: 0, smokeT: 0, countdown: 3.2, lastCount: 4, slide: 0, crash: null,
      bike: curBike(),
    };
    for (let i = 0; i < 3; i++) spawnCar(PZ + SEG * (30 + i * 35));
  }

  // ---------- Flujo de pantallas ----------
  function startGame() {
    if (!Profiles.current()) { openProfiles(); return; }
    Sound.init(); Sound.musicStart();
    refreshBike();
    newRun();
    state = 'play'; stateT = 0;
    Sound.engineOn();
    if (touchMode && document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
      }).catch(() => {});
    }
  }
  function toMenu() { state = 'menu'; stateT = 0; Sound.engineOff(); Sound.sirenOff(); Sound.musicStart(); }
  function pauseGame() { if (state !== 'play') return; state = 'pause'; stateT = 0; Sound.engineOff(); Sound.musicStop(); }
  function resume() {
    state = 'play'; stateT = 1;
    pointers.clear();
    for (const k in keys) keys[k] = false;
    syncInput();
    Sound.musicStart();
  }
  function openShop() {
    if (!Profiles.current()) { openProfiles(); return; }
    state = 'shop'; stateT = 0;
    shop.i = Math.max(0, BIKES.findIndex(b => b.id === profile().bike));
    shop.msg = '';
    Sound.select();
  }

  function gameOver(reason) {
    const g = G;
    state = 'over'; stateT = 0; g.reason = reason;
    Sound.engineOff(); Sound.sirenOff(); Sound.over();
    g.final = Math.floor(g.score);
    g.quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    g.newBest = Profiles.addRun({ coins: g.coins, score: g.final, km: g.dist / UNITS_PER_M / 1000 }).newBest;
  }

  // flechas del garaje: cambia entre las motos que ya tiene el piloto
  function cycleBike(d) {
    const p = profile();
    const owned = BIKES.filter(b => p.owned.includes(b.id));
    if (owned.length < 2) { Sound.denied(); return; }
    const i = owned.findIndex(b => b.id === p.bike);
    Profiles.useBike(owned[(i + d + owned.length) % owned.length].id);
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

  // ---------- Tienda ----------
  function shopMsg(m) { shop.msg = m; shop.msgT = 3; }
  async function shopAction() {
    if (shop.busy) return;
    const b = BIKES[shop.i], p = profile();
    if (p.owned.includes(b.id)) {
      if (p.bike !== b.id) { Profiles.useBike(b.id); refreshBike(); Sound.select(); shopMsg('¡LISTO! AHORA MANEJAS LA ' + b.model); }
      return;
    }
    if (p.coins < b.price) { Sound.denied(); shopMsg('TE FALTAN S/ ' + (b.price - p.coins)); return; }
    shop.busy = true; shopMsg('COMPRANDO...');
    try {
      await Profiles.buy(b);
      refreshBike(); Sound.cash();
      shopMsg('¡COMPRASTE LA ' + b.model + '!');
    } catch (e) {
      Sound.denied(); shopMsg(e.message.toUpperCase());
    } finally { shop.busy = false; }
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
    const tpl = SP.cars[Math.random() * SP.cars.length | 0];
    // los mototaxis van despacio y casi siempre por el carril derecho
    const lane = tpl.slow ? (Math.random() < 0.8 ? 2 : 1) : Math.random() * 3 | 0;
    for (const c of G.cars) if (c.lane === lane && Math.abs(c.z - z) < SEG * 12) return;
    const speed = (tpl.slow ? rand(25, 40) : rand(40, 75)) * U;
    G.cars.push({ spr: tpl.spr, w: tpl.w, lights: tpl.lights, box: tpl.box, slow: tpl.slow, police: tpl.police, beacons: null, shadow: 0.95, z, x: LANES_X[lane], tx: LANES_X[lane], lane, speed, passed: false, hit: false, prevRel: null });
  }

  function addItem(kind, z, x) {
    const d = { coin: [SP.coin[0], 150, 70], fuel: [SP.fuel, 170, 0], nitro: [SP.nitro, 140, 0] }[kind];
    G.items.push({ kind, spr: d[0], w: d[1], lift: d[2], shadow: 0.8, z, x, ph: Math.random() * 4, got: false, prevRel: null });
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

  // pasó por la posición del jugador entre el cuadro anterior y este (no se salta nada a alta velocidad)
  const crossed = (o, rel, ahead, behind) => rel < ahead && (o.prevRel === null ? rel : o.prevRel) > -behind;

  function hurt(text) {
    const g = G;
    if (g.invuln > 0 || state !== 'play') return;
    g.lives--; g.invuln = 2; g.shake = 0.4;
    sparks(W / 2, H - 10, 18);
    Sound.hit();
    float(W / 2, H - 80, text || '-1 CASCO', '#ff5a4a');
    if (g.lives <= 0) startCrash(text);
  }

  // ---------- Choque final: tres finales distintos ----------
  //  fly       : cámara lenta y el piloto sale volando alto y lejos
  //  ambulance : cae, llega la ambulancia y dos enfermeros lo suben en camilla
  //  fire      : explosión y la moto se incendia
  let lastEnding = null, forcedEnding = null;
  function pickEnding(text) {
    if (forcedEnding) return forcedEnding;
    let opts = ['fly', 'ambulance', 'fire'];
    if (text === '¡AL MAR!') opts = ['fly', 'ambulance'];
    else if (text === '¡CHOCASTE!' && Math.random() < 0.45 && lastEnding !== 'fire') return 'fire';
    const pool = opts.filter(k => k !== lastEnding);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function startCrash(text) {
    const g = G;
    const kind = pickEnding(text);
    lastEnding = kind;
    state = 'crash'; stateT = 0;
    g.slide = g.x < 0 ? -1 : 1;
    g.shake = 0.7;
    Sound.crash(); Sound.engineOff();
    const rider = { z: g.dist + PZ + SEG * 0.3, x: clamp(g.x, -1.6, 1.6), lift: 60, vl: 1500, vz: clamp(g.speed * 0.35, 1400, 2600), spr: ART.rider.frames[0], w: 300, gone: false };
    g.crash = { kind, t: 0, phase: 'fly', amb: null, medics: null, rider, flash: 0 };
    if (kind === 'fly') {
      rider.vl = 3400; rider.vz = clamp(g.speed * 0.6, 3200, 6000); rider.x = clamp(g.x * 0.6, -1.2, 1.2);
      g.reason = text === '¡AL MAR!' ? '¡AL MAR!' : '¡SALISTE VOLANDO!';
      Sound.whooshUp();
      float(W / 2, H - 90, '¡SALISTE VOLANDO!', '#ff5a4a');
    } else if (kind === 'fire') {
      rider.vl = 900; rider.vz = 700; rider.x = clamp(g.x + (g.slide > 0 ? -0.5 : 0.5), -1.6, 1.6);
      g.reason = '¡MOTO EN LLAMAS!';
      g.crash.flash = 1; g.shake = 1.1;
      Sound.boom();
      for (let i = 0; i < 60; i++) {
        const a = rand(0, Math.PI * 2), v = rand(60, 260);
        part({ x: W / 2, y: H - 22, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: rand(0.4, 1), color: ['#fff2a0', '#ffd23f', '#ff9a1a', '#ff5a1a'][i % 4], size: rand(1, 3), grav: 200 });
      }
      float(W / 2, H - 100, '¡BOOM!', '#ffd23f');
    } else {
      g.reason = text === '¡AL MAR!' ? '¡AL MAR!' : '¡TE CAÍSTE!';
      float(W / 2, H - 90, '¡TE CAÍSTE!', '#ff5a4a');
    }
  }

  // ---------- Actualización ----------
  function updatePlay(dt) {
    const g = G, bk = g.bike;
    const prevPz = g.dist + PZ;
    const pSeg = Road.segAt(prevPz);
    const sp = g.speed / MAX;

    if (g.countdown > 0) {
      g.countdown -= dt;
      const n = Math.ceil(g.countdown);
      if (n !== g.lastCount && n >= 0) { g.lastCount = n; if (n > 0) Sound.select(); else Sound.start(); }
      if (g.countdown <= 0) banner('¡A RODAR!', bk.brand + ' ' + bk.model);
      Sound.engineSet(60 + Math.sin(t * 20) * 20, false, true);
      return;
    }

    // dirección (mejor manejo en motos con más agarre) y fuerza centrífuga
    const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    g.x += steer * dt * 2.4 * bk.grip * Math.min(1, 0.25 + sp);
    g.x -= dt * 2 * sp * sp * pSeg.curve * 0.18;
    g.lean += (steer * 0.32 + pSeg.curve * sp * 0.025 - g.lean) * Math.min(1, dt * 8);

    // velocidad: crucero según la cilindrada; acelerando llega a la máxima de la moto; el nitro suma 15-20 %
    g.turbo = input.turbo && g.nitro > 0.5 && !g.stall;
    const maxU = bk.max * U;
    let target = bk.cruise * U;
    if (g.turbo) target = maxU * (1 + bk.nitro);
    else if (input.gas) target = maxU;
    const accel = MAX / 4.5 * bk.accel * (g.turbo ? 1.7 : 1);
    if (g.stall) g.speed -= MAX * 0.35 * dt;
    else if (input.brake) g.speed -= MAX * 1.1 * dt;
    else if (g.speed < target) g.speed = Math.min(target, g.speed + accel * dt);
    else g.speed = Math.max(target, g.speed - MAX / 3.5 * dt);
    if (g.turbo) g.nitro = Math.max(0, g.nitro - 22 * dt);

    // fuera de la pista: la arena frena (menos en motos de aventura)
    const off = Math.abs(g.x) > 1.1;
    if (off) {
      const adv = bk.type === 'adventure';
      if (g.speed > MAX * (adv ? 0.6 : 0.35)) g.speed -= MAX * (adv ? 0.35 : 0.9) * dt;
      g.bounce = Math.round(Math.random() * 2 * Math.min(1, sp));
      if (Math.random() < sp * 0.8) part({ x: W / 2 + rand(-14, 14), y: H - 6, vx: rand(-80, 80), vy: rand(-60, -10), life: 0.4, color: g.x < 0 ? '#e8c08a' : '#7a8a4a', size: 2, grav: 300 });
      if (Math.random() < dt * 8) Sound.rumble();
    } else g.bounce = 0;
    g.speed = Math.max(0, g.speed);
    g.dist += g.speed * dt;
    g.wheel += g.speed * dt;
    if (g.invuln > 0) g.invuln -= dt;
    const pz = g.dist + PZ;

    // mar a la izquierda, cerro a la derecha
    if (g.x < -2.6) {
      Sound.splash();
      for (let i = 0; i < 30; i++) part({ x: W / 2 + rand(-30, 30), y: H - 20, vx: rand(-120, 120), vy: rand(-200, -60), life: rand(0.5, 0.9), color: Math.random() < 0.5 ? '#bfe0ff' : '#ffffff', size: 2, grav: 500 });
      g.x = -0.7; g.speed = MAX * 0.1; g.invuln = 0;
      hurt('¡AL MAR!');
      if (state !== 'play') return;
    }
    if (g.x > 2.05) { g.x = 1.6; g.speed = MAX * 0.15; hurt('¡CONTRA EL CERRO!'); if (state !== 'play') return; }

    // choque con objetos al costado (revisa cada segmento recorrido en este cuadro)
    if (Math.abs(g.x) > 1.05 && g.invuln <= 0) {
      outer: for (let z = prevPz; z <= pz + 1; z += SEG) {
        for (const s of Road.segAt(Math.min(z, pz)).sprites) {
          if (s.hit && Math.abs(g.x - s.offset) < PW + s.hit) {
            g.speed = MAX * 0.12; g.x += g.x < 0 ? 0.35 : -0.35;
            hurt('¡CHOCASTE!');
            if (state !== 'play') return;
            break outer;
          }
        }
      }
    }

    // tráfico
    for (const c of g.cars) {
      c.z += c.speed * dt;
      if (Math.random() < dt * (c.slow ? 0.04 : 0.12)) { c.lane = clamp(c.lane + (Math.random() < 0.5 ? -1 : 1), c.slow ? 1 : 0, 2); c.tx = LANES_X[c.lane]; }
      c.x += clamp(c.tx - c.x, -0.5 * dt, 0.5 * dt);
      if (c.police) c.beacons = Math.floor(t * 7) % 2 ? [[0.38, 0.05, false]] : [[0.62, 0.05, true]];
      const rel = c.z - pz;
      if (!c.passed && rel < -SEG * 0.5) {
        c.passed = true;
        if (!c.hit && Math.abs(c.x - g.x) < 0.42 && g.speed > 100 * U) { addScore(50, '¡ROZÓN! +50'); Sound.whoosh(); }
      }
      if (!c.hit && g.invuln <= 0 && crossed(c, rel, SEG * 0.6, SEG * 0.5) && Math.abs(c.x - g.x) < PW + c.w / Road.ROAD_W / 2 * 0.85) {
        c.hit = true;
        g.speed = Math.min(g.speed, c.speed * 0.6);
        hurt('¡CHOCASTE!');
        if (state !== 'play') return;
      }
      c.prevRel = rel;
    }
    g.cars = g.cars.filter(c => c.z - pz > -SEG * 4 && c.z - pz < SEG * (DRAW + 30));
    const km = g.dist / UNITS_PER_M / 1000;
    if (g.cars.length < Math.min(12, 3 + Math.floor(km * 1.2)) && Math.random() < dt * 2.5) spawnCar(pz + SEG * (DRAW - 5 - Math.random() * 20));

    // ítems
    if (g.dist > g.nextItem) { spawnItems(pz + SEG * (DRAW - 8)); g.nextItem = g.dist + SEG * rand(20, 45); }
    for (const it of g.items) {
      if (it.kind === 'coin') it.spr = SP.coin[Math.floor(t * 10 + it.ph) % 4];
      const rel = it.z - pz;
      if (!it.got && crossed(it, rel, SEG * 0.7, SEG * 0.7) && Math.abs(it.x - g.x) < 0.24) {
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
      it.prevRel = rel;
    }
    g.items = g.items.filter(it => !it.got && it.z - pz > -SEG * 3);

    // gasolina y puntaje
    if (!g.stall) {
      g.fuel -= (1.3 + Math.min(1.4, sp) * 1.5 + (g.turbo ? 1.5 : 0)) * dt;
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

    Sound.engineSet(40 + Math.min(1.5, sp) * 300, g.turbo, !g.stall);
  }

  function updateCrash(dt) {
    const g = G, c = g.crash, r = c.rider, pz = g.dist + PZ;
    c.t += dt;
    g.speed = Math.max(0, g.speed - MAX * 1.4 * dt);
    g.dist += g.speed * dt;
    g.lean += (g.slide * 1.45 - g.lean) * Math.min(1, dt * 6);
    g.x += g.slide * dt * 0.4 * Math.min(1, g.speed / MAX);
    if (Math.random() < g.speed / MAX) sparks(W / 2 + g.slide * 14, H - 8, 2);
    for (const car of g.cars) car.z += car.speed * dt;

    // el piloto vuela, cae y se desliza
    if (c.phase === 'fly') {
      r.z += r.vz * dt; r.vl -= 3600 * dt; r.lift += r.vl * dt;
      r.spr = ART.rider.frames[Math.floor(c.t * (c.kind === 'fly' ? 18 : 14)) % 8];
      if (r.lift <= 0) {
        r.lift = 0; c.phase = 'down'; c.downT = c.t; r.spr = ART.rider.lying; r.w = 360;
        Sound.thud(); g.shake = c.kind === 'fly' ? 0.45 : 0.25;
        if (c.kind === 'fly') float(W / 2, 70, '¡AUCH!', '#fff2d0');
      }
    } else {
      r.vz = Math.max(0, r.vz - 7000 * dt); r.z += r.vz * dt;
    }

    if (c.kind === 'fly') {
      if (c.phase === 'down' && c.t - c.downT > 2) gameOver(g.reason);
      return;
    }
    if (c.kind === 'fire') { updateFire(dt, c); return; }
    updateAmbulance(dt, c, r, pz);
  }

  // Final 3: la moto se incendia
  function updateFire(dt, c) {
    const g = G;
    c.flash = Math.max(0, c.flash - dt * 2.5);
    const bx = W / 2 + g.slide * Math.min(stateT, 1.5) * 20, by = H - 8;
    const k = Math.min(1, 0.4 + c.t * 0.4);
    for (let i = 0; i < 9 * k; i++) {
      part({ x: bx + rand(-18, 18), y: by - rand(0, 16), vx: rand(-14, 14), vy: rand(-110, -40), life: rand(0.4, 0.9), color: ['#fff2a0', '#ffd23f', '#ff9a1a', '#ff5a1a', '#d0201a'][Math.random() * 5 | 0], size: rand(2.5, 6), grow: -4.5, fire: true });
    }
    if (Math.random() < 0.6) part({ x: bx + rand(-10, 10), y: by - 22, vx: rand(-8, 14), vy: rand(-40, -22), life: rand(1, 1.8), color: 'rgba(40,30,36,0.55)', size: 3, grow: 9 });
    if (Math.random() < dt * 4) sparks(bx + rand(-8, 8), by - 10, 3);
    if (Math.random() < dt * 14) Sound.crackle();
    if (c.t > 1.2 && !c.banner) { c.banner = true; banner('¡SE INCENDIÓ LA MOTO!', 'EL PILOTO SE SALVÓ DE MILAGRO'); }
    if (c.t > 5.2) gameOver(g.reason);
  }

  // Final 2: llega la ambulancia, bajan dos enfermeros con camilla, lo suben y se van
  function updateAmbulance(dt, c, r, pz) {
    const g = G;
    if (!c.amb && c.t > 1.5) {
      const A = SP.ambulance;
      // se estaciona al costado del piloto para que los enfermeros caminen junto a ella
      const ax = clamp(r.x + (r.x > 0 ? -0.55 : 0.55), -1, 1);
      c.amb = { spr: A.spr, w: A.w, lights: A.lights, box: A.box, shadow: 0.95, z: pz - PZ * 0.6, x: ax, tx: ax, speed: 8500, phase: 'come', t: 0, beacons: [] };
      Sound.sirenOn();
      banner('¡AMBULANCIA!', 'TRANQUILO, YA TE RECOGEN');
    }
    const a = c.amb;
    if (!a) return;
    a.t += dt;
    const on = Math.floor(t * 6) % 2 === 0;
    a.beacons = on ? [[0.36, 0.04, false]] : [[0.64, 0.04, true]];
    const stopZ = r.z - SEG * 2.2;
    const walk = Math.floor(t * 6) % 2;

    if (a.phase === 'come') {
      const d = stopZ - a.z;
      a.speed = clamp(d * 2.4, 0, 8500);
      a.z += a.speed * dt;
      a.x += (a.tx - a.x) * Math.min(1, dt * 2);
      if (d < 40 && r.vz === 0) { a.phase = 'doors'; a.t = 0; }
    } else if (a.phase === 'doors') {
      if (a.t > 0.5) {
        Sound.door();
        // bajan los dos enfermeros por las puertas traseras
        c.medics = [-1, 1].map(s => ({ spr: SP.medic[0], w: 150, x: a.x + s * 0.14, z: a.z - SEG * 0.3, shadow: 0.8, side: null, tx: r.x + s * 0.16 }));
        a.phase = 'walk'; a.t = 0;
        float(W / 2, 70, '¡BAJAN LOS ENFERMEROS!', '#fff2d0');
      }
    } else if (a.phase === 'walk') {
      let arrived = true;
      for (const m of c.medics) {
        const goal = r.z - SEG * 0.35;
        if (m.z < goal) { m.z = Math.min(goal, m.z + 900 * dt); arrived = false; }
        // primero se apartan de la ambulancia y luego caminan hacia el piloto
        m.x += (m.tx - m.x) * Math.min(1, dt * (m.z > a.z + SEG * 0.6 ? 3 : 1.2));
        m.spr = SP.medic[m.z < goal ? walk : 0];
      }
      if (arrived) { a.phase = 'pickup'; a.t = 0; }
    } else if (a.phase === 'pickup') {
      if (a.t > 0.9) {
        r.gone = true;
        c.medics = null;
        c.carry = { spr: ART.carry, w: 480, x: r.x, z: r.z - SEG * 0.2, shadow: 0.9, side: null };
        a.phase = 'carry'; a.t = 0;
        float(W / 2, 70, '¡A LA CAMILLA!', '#fff2d0');
        Sound.select();
      }
    } else if (a.phase === 'carry') {
      // regresan con la camilla hasta las puertas traseras
      const goal = a.z - SEG * 0.3;
      c.carry.z = Math.max(goal, c.carry.z - 700 * dt);
      const near = c.carry.z < a.z + SEG * 0.8;
      c.carry.x += ((near ? a.x : r.x) - c.carry.x) * Math.min(1, dt * 1.8);
      c.carry.lift = Math.abs(Math.sin(t * 9)) * 12;
      if (c.carry.z <= goal) {
        c.carry = null; Sound.door();
        float(W / 2, 70, '¡ARRIBA, CAMPEÓN!', '#fff2d0');
        a.phase = 'close'; a.t = 0;
      }
    } else if (a.phase === 'close') {
      if (a.t > 0.6) { a.phase = 'leave'; a.t = 0; }
    } else {
      a.speed = Math.min(9000, a.speed + 5000 * dt);
      a.z += a.speed * dt;
    }
    Sound.sirenLevel(clamp(1 - (a.z - pz) / (SEG * 140), 0.1, 1));
    if (a.phase === 'leave' && a.z - pz > SEG * 110) { gameOver(g.reason); return; }
    if (c.t > 20) gameOver(g.reason);
  }

  function updateCommon(dt) {
    const g = G;
    for (const q of g.parts) { q.life -= dt; q.vy += q.grav * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.size += q.grow * dt; }
    g.parts = g.parts.filter(q => q.life > 0);
    for (const f of g.floats) { f.t += dt; f.y -= 22 * dt; }
    g.floats = g.floats.filter(f => f.t < 1.2);
    if (g.banner) { g.banner.t += dt; if (g.banner.t > g.banner.dur) g.banner = null; }
    if (g.shake > 0) g.shake -= dt;
  }

  function update(dt) {
    if (state === 'play') { updatePlay(dt); updateCommon(dt); }
    else if (state === 'crash') {
      // cámara lenta mientras el piloto sale volando
      const slow = G.crash && G.crash.kind === 'fly' && G.crash.phase === 'fly' ? 0.45 : 1;
      updateCrash(dt * slow); updateCommon(dt * slow);
    }
    if (shop.msgT > 0) shop.msgT -= dt;
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
      const frame = state === 'crash' || state === 'over' && g.crash ? ART.rear.empty : ART.rear.ride[Math.floor(g.wheel / 160) % 2];
      ctx.save();
      ctx.translate(bx + (g.crash ? g.slide * Math.min(stateT, 1.5) * 20 : 0), by);
      ctx.rotate(g.lean);
      // sprite a doble resolución (con contorno de 1 px): se dibuja a la mitad de su tamaño
      ctx.drawImage(frame, -frame.width / 4, -frame.height / 2 + 0.5, frame.width / 2, frame.height / 2);
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
      ctx.globalCompositeOperation = q.fire ? 'lighter' : 'source-over';
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
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawHUD() {
    const g = G, bk = g.bike;
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

    // velocímetro (marca la máxima de la moto)
    const kmh = Math.round(g.speed / U);
    ctx.drawImage(FACE_SPEED, 3, H - 49, 46, 46);
    const am = A0 + clamp(bk.max / DIAL_MAX, 0, 1) * SWEEP;
    Pix.line(ctx, 26 + Math.cos(am) * 16, H - 26 + Math.sin(am) * 16, 26 + Math.cos(am) * 19, H - 26 + Math.sin(am) * 19, '#7dff9a');
    needle(26, H - 26, 15, kmh / DIAL_MAX, '#ff4a3d');
    Pix.rect(ctx, 16, H - 17, 21, 7, '#0a0605');
    PixelFont.draw(ctx, String(kmh).padStart(3, '0'), 26, H - 16, g.turbo ? '#5ad1ff' : '#ffb347', 1, 'center');

    // gasolina y nitro
    ctx.drawImage(FACE_FUEL, W - 49, H - 49, 46, 46);
    needle(W - 26, H - 26, 15, g.fuel / 100, g.fuel < 22 && Math.sin(t * 12) > 0 ? '#ffffff' : '#ff4a3d');
    PixelFont.draw(ctx, 'NITRO +' + Math.round(bk.nitro * 100) + '%', W - 98, H - 13, '#5ad1ff', 1, 'left', '#0a0605');
    Pix.rect(ctx, W - 99, H - 7, 46, 5, '#0a0605');
    Pix.rect(ctx, W - 98, H - 6, Math.round(44 * g.nitro / 100), 3, g.turbo && Math.sin(t * 30) > 0 ? '#e0f8ff' : '#2fb8ff');
    PixelFont.draw(ctx, bk.model, 52, H - 13, '#f0e2c0', 1, 'left', '#0a0605');

    if (g.fuel < 22 && !g.stall && Math.sin(t * 10) > 0) PixelFont.outline(ctx, '¡POCA GASOLINA!', W / 2, 20, '#ff5a4a', '#1a0a0a', 1, 'center');

    if (touchMode && state === 'play') {
      ctx.globalAlpha = 0.75;
      for (const k of ['gas', 'turbo', 'brake']) ctx.drawImage(BTN_IMG[k], BTN[k].x, BTN[k].y);
      ctx.globalAlpha = 1;
    }
    if (state === 'play' && g.countdown <= 0 && stateT < 8 && Math.sin(t * 5) > -0.3) {
      PixelFont.outline(ctx, touchMode ? 'TOCA IZQ / DER PARA MANEJAR · ACELERA PARA IR A FONDO' : '↑ ACELERAR · ← → MANEJAR · ↓ FRENO · ESPACIO NITRO', W / 2, H - 70, '#fff2d0', '#1a0a0a', 1, 'center');
    }
  }

  function drawCountdown() {
    const g = G;
    if (g.countdown <= 0) return;
    const n = Math.ceil(g.countdown);
    const k = g.countdown - Math.floor(g.countdown);
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
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2);
      PixelFont.outline(ctx, f.text, f.x, f.y, f.color, '#1a0a0a', 1, 'center');
    }
    ctx.globalAlpha = 1;
  }

  function button(r, text, col, txt = '#fff2d0') {
    Pix.rect(ctx, r.x, r.y, r.w, r.h, '#2a1810');
    Pix.rect(ctx, r.x + 1, r.y + 1, r.w - 2, r.h - 2, col);
    Pix.rect(ctx, r.x + 1, r.y + 1, r.w - 2, 1, 'rgba(255,255,255,0.3)');
    PixelFont.draw(ctx, text, r.x + r.w / 2, r.y + Math.floor(r.h / 2) - 2, txt, 1, 'center', '#2a1810');
  }

  function drawScene() {
    const g = G;
    ctx.save();
    if (g.shake > 0 && state !== 'over') {
      const m = Math.ceil(g.shake * 8);
      ctx.translate(Math.round(rand(-m, m)), Math.round(rand(-m, m)));
    }
    const objs = g.cars.concat(g.items);
    if (g.crash) {
      const c = g.crash;
      if (!c.rider.gone) objs.push(c.rider);
      if (c.amb) objs.push(c.amb);
      if (c.medics) objs.push(...c.medics);
      if (c.carry) objs.push(c.carry);
    }
    Road.render(ctx, { dist: g.dist, x: g.x, t, night: g.night, skyOff: g.skyOff, hillOff: g.hillOff, objs });
    const fire = g.crash && g.crash.kind === 'fire';
    if (fire) {
      // resplandor del incendio sobre la pista
      const bx = W / 2 + g.slide * Math.min(stateT, 1.5) * 20;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.55 + Math.sin(t * 23) * 0.12;
      ctx.drawImage(SP.glowWarm, bx - 70, H - 80, 140, 110);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    drawBike();
    drawParticles();
    ctx.restore();
    if (fire && g.crash.flash > 0) {
      ctx.fillStyle = `rgba(255,240,200,${g.crash.flash * 0.75})`;
      ctx.fillRect(0, 0, W, H);
    }
    drawHUD();
    drawFloats();
    drawBanner();
    drawCountdown();
    if (state === 'crash' && stateT > 1.2 && Math.sin(t * 4) > -0.3) PixelFont.outline(ctx, touchMode ? 'TOCA PARA SALTAR' : 'ENTER PARA SALTAR', W / 2, H - 22, '#fff2d0', '#1a0a0a', 1, 'center');
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
    const rs = PixelFont.width(g.reason, 3) <= 180 ? 3 : 2;
    PixelFont.outline(ctx, g.reason, px + 11, py + (rs === 3 ? 20 : 23), '#c8323a', '#5a0a0e', rs, 'left');

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

    const p = profile();
    const rows = [
      ['DISTANCIA', (g.dist / UNITS_PER_M / 1000).toFixed(2) + ' KM'],
      ['MONEDAS', 'S/ ' + g.coins],
      ['PUNTAJE', String(g.final)],
      ['RÉCORD', String(p.best)],
      ['BILLETERA DE ' + p.name, 'S/ ' + p.coins + '  (+' + g.coins + ')'],
    ];
    rows.forEach(([a, b], i) => {
      const y = py + 50 + i * 10;
      PixelFont.draw(ctx, a, px + 14, y, '#7a5a3a');
      PixelFont.draw(ctx, b, px + 176, y, i === 2 ? '#c8323a' : i === 4 ? '#b8860b' : '#3a2418', 1, 'right');
      for (let x = px + 14; x < px + 176; x += 3) Pix.px(ctx, x, y + 8, '#c8b48a');
    });
    if (g.newBest && Math.sin(t * 8) > -0.3) PixelFont.outline(ctx, '¡NUEVO RÉCORD!', px + pw / 2, py + 104, '#2a8a4a', '#f0e2c0', 2, 'center');
    const next = BIKES.find(b => !p.owned.includes(b.id) && b.price > 0);
    const line = next ? (p.coins >= next.price ? '¡YA PUEDES COMPRAR LA ' + next.model + '!' : 'TE FALTAN S/ ' + (next.price - p.coins) + ' PARA LA ' + next.model) : '"' + g.quote[0] + ' ' + g.quote[1] + '"';
    PixelFont.draw(ctx, line, px + pw / 2, py + 120, next && p.coins >= next.price ? '#2a8a4a' : '#5a3a2a', 1, 'center');
    PixelFont.draw(ctx, touchMode ? '' : 'ENTER: REINTENTAR · ESC: GARAJE', px + pw / 2, py + 132, '#a08a6a', 1, 'center');
    if (stateT > 0.8) {
      button(BTN.retry, 'REINTENTAR', '#c8323a');
      button(BTN.menuO, 'GARAJE', '#1f3f8a');
    }
  }

  // ---------- Concesionario ----------
  function statBar(x, y, label, value, frac, col) {
    PixelFont.draw(ctx, label, x, y, '#b8a888');
    PixelFont.draw(ctx, value, x + 110, y, '#fff2d0', 1, 'right');
    Pix.rect(ctx, x, y + 7, 110, 4, '#1a120e');
    Pix.rect(ctx, x, y + 7, Math.round(110 * clamp(frac, 0.03, 1)), 4, col);
    for (let i = x + 10; i < x + 110; i += 10) Pix.rect(ctx, i, y + 7, 1, 4, 'rgba(0,0,0,0.35)');
  }

  function drawShop() {
    const b = BIKES[shop.i], p = profile();
    const owned = p.owned.includes(b.id), using = p.bike === b.id, afford = p.coins >= b.price;
    // salón de exhibición
    Pix.rect(ctx, 0, 0, W, H, '#1a1216');
    for (let y = 0; y < 150; y += 6) for (let x = (y / 6) % 2 ? -7 : 0; x < W; x += 14) Pix.rect(ctx, x + 1, y + 1, 13, 5, (x + y) % 3 ? '#22181d' : '#241a1f');
    Pix.rect(ctx, 0, 150, W, 66, '#2a2026');
    for (let x = 0; x < W; x += 16) for (let y = 150; y < H; y += 8) if (((x + y) / 8) % 2 === 0) Pix.rect(ctx, x, y, 16, 8, '#30252c');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,220,160,0.035)';
    for (let y = 18; y < 160; y++) { const hw = 14 + (y - 18) * 0.42; ctx.fillRect(204 - hw, y, hw * 2, 1); }
    ctx.globalCompositeOperation = 'source-over';
    // letrero de neón
    const flick = Math.sin(t * 13) > -0.95;
    Pix.rect(ctx, 96, 4, 192, 16, '#100a0c');
    PixelFont.outline(ctx, 'CONCESIONARIO COSTA VERDE', W / 2, 9, flick ? '#ff6a8a' : '#6a2a3a', '#3a0a1a', 1, 'center');
    // plataforma giratoria y moto
    const cx = 204;
    Pix.disc(ctx, cx, 146, 0, '#000');
    for (let r = 0; r < 4; r++) Pix.rect(ctx, cx - 60 + r * 4, 140 + r, 120 - r * 8, 1, r === 0 ? '#5a4a52' : '#3a2e34');
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 140, W, 30); ctx.clip();
    ctx.globalAlpha = 0.18; ctx.translate(0, 2 * 140); ctx.scale(1, -1);
    ctx.drawImage(art(b).side, cx - 50, 56, 100, 84);
    ctx.restore();
    ctx.drawImage(art(b).side, cx - 50, 56 + Math.round(Math.sin(t * 2)), 100, 84);
    if (!owned) { ctx.globalAlpha = 0.85; PixelFont.outline(ctx, 'S/ ' + b.price, cx, 44, afford ? '#7dff9a' : '#ffd27a', '#1a0a0a', 2, 'center'); ctx.globalAlpha = 1; }
    else PixelFont.outline(ctx, using ? 'EN USO' : 'TUYA', cx, 44, '#7dff9a', '#1a0a0a', 2, 'center');
    if (Math.sin(t * 6) > -0.3) {
      PixelFont.outline(ctx, '<', BTN.shopL.x + 11, 80, '#fff2d0', '#1a0a0a', 3, 'center');
      PixelFont.outline(ctx, '>', BTN.shopR.x + 11, 80, '#fff2d0', '#1a0a0a', 3, 'center');
    }

    // ficha técnica
    const fx = 8, fy = 28;
    Pix.rect(ctx, fx - 2, fy - 2, 124, 118, 'rgba(10,6,8,0.75)');
    Pix.rect(ctx, fx - 2, fy - 2, 124, 1, '#c8323a');
    PixelFont.draw(ctx, b.brand, fx, fy + 2, bikeColors(b).light === '#ffffff' ? '#ffd27a' : '#ffd27a');
    PixelFont.draw(ctx, TYPE_NAME[b.type] + ' · ' + b.cc + ' CC', fx + 118, fy + 2, '#8a7a80', 1, 'right');
    const big = PixelFont.width(b.model, 2) <= 118;
    PixelFont.outline(ctx, b.model, fx, fy + 11, '#fff2d0', '#1a0a0a', big ? 2 : 1, 'left');
    const sy = fy + 28;
    statBar(fx, sy, 'CRUCERO', b.cruise + ' KM/H', b.cruise / 120, '#f0e2c0');
    statBar(fx, sy + 14, 'VEL. MÁXIMA', b.max + ' KM/H', b.max / 230, '#ff5a4a');
    statBar(fx, sy + 28, 'CON NITRO', Math.round(b.max * (1 + b.nitro)) + ' KM/H', b.max * (1 + b.nitro) / 270, '#5ad1ff');
    statBar(fx, sy + 42, 'ACELERACIÓN', Math.round(b.accel * 100) + '', b.accel / 1.8, '#ffd23f');
    statBar(fx, sy + 56, 'MANEJO', Math.round(b.grip * 100) + '', b.grip / 1.45, '#7dff9a');
    if (b.type === 'adventure') PixelFont.draw(ctx, 'BUENA EN LA ARENA', fx, sy + 72, '#b8a888');

    // billetera y compra
    Pix.rect(ctx, 282, 128, 96, 46, 'rgba(10,6,8,0.75)');
    PixelFont.draw(ctx, p.name, 330, 132, '#f0e2c0', 1, 'center');
    PixelFont.draw(ctx, 'TIENES S/ ' + p.coins, 330, 140, '#ffd23f', 1, 'center');
    let label, col;
    if (using) { label = 'EN USO'; col = '#3a5a3a'; }
    else if (owned) { label = 'USAR ESTA'; col = '#2a8a4a'; }
    else if (afford) { label = shop.busy ? 'COMPRANDO...' : 'COMPRAR'; col = '#c8323a'; }
    else { label = 'FALTAN S/ ' + (b.price - p.coins); col = '#5a4a4a'; }
    button(BTN.shopBuy, label, col);

    // índice de motos (llenas = compradas)
    for (let i = 0; i < BIKES.length; i++) {
      const x = W / 2 - BIKES.length * 4 + i * 8, has = p.owned.includes(BIKES[i].id);
      Pix.rect(ctx, x, 180, 6, 6, i === shop.i ? '#fff2d0' : '#4a3a40');
      Pix.rect(ctx, x + 1, 181, 4, 4, has ? '#7dff9a' : '#1a1216');
    }
    PixelFont.draw(ctx, (shop.i + 1) + '/' + BIKES.length, W / 2, 189, '#8a7a80', 1, 'center');
    button(BTN.shopBack, 'GARAJE', '#1f3f8a');
    if (shop.msgT > 0 && shop.msg) PixelFont.outline(ctx, shop.msg, W / 2, 198, '#fff2d0', '#1a0a0a', 1, 'center');
    else PixelFont.draw(ctx, touchMode ? 'TOCA < > PARA VER MÁS MOTOS' : '← → VER MOTOS · ENTER COMPRAR / USAR · ESC GARAJE', W / 2, 202, '#8a7a80', 1, 'center');
  }

  function render() {
    // el lienzo real es de 768x432: todo se dibuja en coordenadas lógicas de 384x216
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (state === 'menu') {
      const p = profile(), b = curBike();
      Garage.draw(ctx, t, {
        park: ART.side, color: { name: b.model, light: bikeColors(b).light }, name: p.name, coins: p.coins,
        best: p.best, bestKm: p.bestKm, touch: touchMode, muted: save.muted, version: VERSION,
        owned: p.owned.length,
      });
      return;
    }
    if (state === 'shop') { drawShop(); return; }
    drawScene();
    if (state === 'pause') drawPause();
    else if (state === 'over') drawOver();
  }

  // ---------- Entrada ----------
  const KEYMAP = {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    ArrowDown: 'brake', KeyS: 'brake', ArrowUp: 'gas', KeyW: 'gas',
    Space: 'turbo', ShiftLeft: 'turbo', ShiftRight: 'turbo', KeyX: 'turbo',
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
    if (k === 'KeyF') { toggleFullscreen(); return; }
    if (k === 'KeyC') { toggleCrt(); return; }
    switch (state) {
      case 'menu':
        if (k === 'ArrowLeft' || k === 'KeyA') cycleBike(-1);
        else if (k === 'ArrowRight' || k === 'KeyD') cycleBike(1);
        else if (k === 'KeyT') openShop();
        else if (k === 'KeyU') openProfiles();
        else if (k === 'Enter' || k === 'Space') startGame();
        break;
      case 'shop':
        if (k === 'ArrowLeft' || k === 'KeyA') { shop.i = (shop.i - 1 + BIKES.length) % BIKES.length; Sound.select(); }
        else if (k === 'ArrowRight' || k === 'KeyD') { shop.i = (shop.i + 1) % BIKES.length; Sound.select(); }
        else if (k === 'Enter' || k === 'Space') shopAction();
        else if (k === 'Escape' || k === 'KeyT') toMenu();
        break;
      case 'play':
        if (k === 'KeyP' || k === 'Escape') pauseGame();
        break;
      case 'crash':
        if (stateT > 1.2 && (k === 'Enter' || k === 'Space' || k === 'Escape')) gameOver(G.reason);
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
        if (hit(p, Garage.ARROW_L)) cycleBike(-1);
        else if (hit(p, Garage.ARROW_R)) cycleBike(1);
        else if (hit(p, Garage.SOUND)) toggleMute();
        else if (hit(p, Garage.PROFILE)) openProfiles();
        else if (hit(p, Garage.SHOP)) openShop();
        else startGame();
        break;
      case 'shop':
        if (hit(p, BTN.shopL)) { shop.i = (shop.i - 1 + BIKES.length) % BIKES.length; Sound.select(); }
        else if (hit(p, BTN.shopR)) { shop.i = (shop.i + 1) % BIKES.length; Sound.select(); }
        else if (hit(p, BTN.shopBuy)) shopAction();
        else if (hit(p, BTN.shopBack)) toMenu();
        else if (p.y > 176 && p.y < 188) {
          const i = Math.floor((p.x - (W / 2 - BIKES.length * 4)) / 8);
          if (i >= 0 && i < BIKES.length) { shop.i = i; Sound.select(); }
        }
        break;
      case 'play':
        if (hit(p, BTN.pause)) { pauseGame(); break; }
        if (touchMode && hit(p, BTN.gas)) pointers.set(e.pointerId, 'gas');
        else if (touchMode && hit(p, BTN.turbo)) pointers.set(e.pointerId, 'turbo');
        else if (touchMode && hit(p, BTN.brake)) pointers.set(e.pointerId, 'brake');
        else pointers.set(e.pointerId, steerRole(p));
        syncInput();
        break;
      case 'crash':
        if (stateT > 1.2) gameOver(G.reason);
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
    VERSION,
    get state() { return state; }, get G() { return G; }, startGame, openShop, input, keys, syncInput,
    forceEnding(k) { forcedEnding = k || null; },
    get SP() { return SP; },
    tick(sec) { for (let i = 0; i < sec * 60; i++) { t += 1 / 60; stateT += 1 / 60; update(1 / 60); } render(); },
  };
})();
