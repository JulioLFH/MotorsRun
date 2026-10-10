'use strict';
// Motor pseudo-3D (estilo arcade de los 80): pista con curvas y lomas, mar a la izquierda y acantilados a la derecha.
const Road = (() => {
  const W = 384, H = 216, HORIZON = 92, YS = 108, T = 768;
  const SEG = 200, RUMBLE = 3, ROAD_W = 1000, LANES = 3, CAM_H = 1000;
  const CAM_DEPTH = 1 / Math.tan(50 * Math.PI / 180), DRAW = 150, FOG = 8;
  const PLAYER_Z = CAM_H * CAM_DEPTH;
  let segments = [], trackLength = 0, SP = null;
  let skyDay, skyNight, sunC, moonC, cloudsC, farDay, farNight, nearDay, nearNight;
  let stars = [], sunX = 110;

  const mod = (a, n) => ((a % n) + n) % n;
  function rng(s) { return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

  // ---------- Paletas: atardecer y noche ----------
  const DAY = {
    road1: '#5c5060', road2: '#554a5a', rum1: '#c8323a', rum2: '#f0e6d2', lane: '#f0e6d2',
    sand1: '#e8b878', sand2: '#ddab6a', foam: '#fff0d8', sea1: '#3d5490', sea2: '#354a84',
    walk1: '#a89a8a', walk2: '#9c8e7e', side1: '#6a7a3a', side2: '#62723a', glint: '#ffd690', fog: '#e8987a',
    cliff1: '#b08a5c', cliff2: '#a17d52', cliffD: '#7a5c3c', cliffL: '#d0a874', veg1: '#5a8a3a', veg2: '#4a7a30',
    rail: '#dfe3ea', railD: '#8e93a0', post: '#5b5f6a', curb: '#c8c0b0', curbD: '#8a8070',
  };
  const NIGHT = {
    road1: '#26242f', road2: '#22202b', rum1: '#7a1a22', rum2: '#8a8698', lane: '#a6a2b4',
    sand1: '#5a4a4a', sand2: '#544444', foam: '#8a96c0', sea1: '#111b3c', sea2: '#0e1735',
    walk1: '#3a3844', walk2: '#363440', side1: '#1f2a22', side2: '#1c2620', glint: '#c8d4ff', fog: '#1c2040',
    cliff1: '#3a3038', cliff2: '#342a32', cliffD: '#241c24', cliffL: '#4a3e46', veg1: '#1e3424', veg2: '#182c1e',
    rail: '#8a8ea0', railD: '#4a4e5c', post: '#2c2e38', curb: '#4a4854', curbD: '#2c2a34',
  };
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const css = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  const D = {}, N = {};
  for (const k in DAY) { D[k] = hex(DAY[k]); N[k] = hex(NIGHT[k]); }
  let PAL = [], palNight = -1;

  function palette(m) {
    if (PAL.length && Math.abs(m - palNight) < 0.004) return;
    palNight = m;
    const base = {};
    for (const k in D) base[k] = mix(D[k], N[k], m);
    PAL = [];
    for (let l = 0; l < FOG; l++) {
      const f = l / (FOG - 1) * 0.85, p = {};
      for (const k in base) p[k] = css(k === 'fog' ? base[k] : mix(base[k], base.fog, f));
      PAL.push(p);
    }
  }

  // ---------- Construcción de la pista ----------
  const lastY = () => segments.length ? segments[segments.length - 1].p2.world.y : 0;
  function addSeg(curve, y) {
    const n = segments.length;
    segments.push({
      index: n, curve, sprites: [], clip: 0, fog: 0, vis: false,
      p1: { world: { y: lastY(), z: n * SEG }, camera: {}, screen: {} },
      p2: { world: { y, z: (n + 1) * SEG }, camera: {}, screen: {} },
    });
  }
  const easeIn = (a, b, p) => a + (b - a) * p * p;
  const easeInOut = (a, b, p) => a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5);
  function addRoad(enter, hold, leave, curve, y) {
    const sy = lastY(), ey = sy + y * SEG, tot = enter + hold + leave;
    for (let n = 0; n < enter; n++) addSeg(easeIn(0, curve, n / enter), easeInOut(sy, ey, n / tot));
    for (let n = 0; n < hold; n++) addSeg(curve, easeInOut(sy, ey, (enter + n) / tot));
    for (let n = 0; n < leave; n++) addSeg(easeInOut(curve, 0, n / leave), easeInOut(sy, ey, (enter + hold + n) / tot));
  }

  function buildTrack() {
    const R = rng(1987);
    const pick = a => a[R() * a.length | 0];
    const hill = h => (Math.abs(lastY()) > 3000 ? -Math.sign(lastY()) * Math.abs(h) : (R() < 0.5 ? h : -h));
    segments = [];
    addRoad(10, 30, 10, 0, 0);
    for (let k = 0; k < 70; k++) {
      const r = R(), len = 20 + (R() * 40 | 0);
      const c = pick([2, 3, 4, 6]) * (R() < 0.5 ? -1 : 1);
      if (r < 0.22) addRoad(10, len, 10, 0, R() < 0.4 ? hill(8 + R() * 12) : 0);
      else if (r < 0.55) addRoad(len / 2 | 0, len, len / 2 | 0, c, R() < 0.5 ? hill(6 + R() * 14) : 0);
      else if (r < 0.72) addRoad(25, 25, 25, R() < 0.5 ? c / 2 : 0, hill(15 + R() * 15));
      else if (r < 0.88) { addRoad(20, 25, 20, c, 0); addRoad(20, 25, 20, -c, hill(5 + R() * 8)); }
      else for (let i = 0; i < 4; i++) addRoad(8, 6, 8, 0, i % 2 ? -4 : 4);
    }
    addRoad(40, 40, 40, 0, -lastY() / SEG);
    trackLength = segments.length * SEG;
  }

  // Altura del acantilado en cada borde de segmento (pared 3D continua)
  function buildWalls() {
    const R = rng(77), n = segments.length;
    const hgt = i => 2300 + 900 * Math.sin(i * 0.045) + 500 * Math.sin(i * 0.21 + 1) + 220 * Math.sin(i * 0.93);
    for (const s of segments) {
      s.wh1 = hgt(s.index);
      s.wh2 = hgt((s.index + 1) % n === 0 ? 0 : s.index + 1);
      s.veg = R() < 0.35 ? 0.3 + R() * 0.45 : 0;
    }
  }

  function decorate() {
    const R = rng(2024);
    const add = (seg, spr, offset, w, extra = {}) => seg.sprites.push(Object.assign({ spr, offset, w, ax: -0.5, hit: 0, shadow: 0.7 }, extra));
    let signK = 0, boardK = 0;
    for (const s of segments) {
      const i = s.index;
      if (i >= 4 && i <= 5) s.start = true;
      if (i % 24 === 0) add(s, SP.lamp, 1.22, 500, { ax: -35 / 40, hit: 0.06, glow: [[9 / 40, 8 / 96, 0.7]], pool: 9 / 40, shadow: 0 });
      if (i < 12) continue;
      if (i % 520 === 260) add(s, SP.signs[signK++ % SP.signs.length], 1.55, 800, { hit: 0.35 });
      else if (i % 300 === 150) add(s, SP.billboards[boardK++ % SP.billboards.length], 1.8, 950, { hit: 0.4 });
      else if (R() < 0.05) add(s, R() < 0.5 ? SP.rock : SP.bush, 1.45 + R() * 0.5, 320, { hit: 0.12 });
      if (i % 190 === 95) add(s, SP.lifeguard, -1.95, 620, { hit: 0.25 });
      else if (i % 230 === 40) add(s, SP.stall, -1.5, 720, { hit: 0.35 });
      else if (R() < 0.09) add(s, SP.palms[R() * 3 | 0], -1.55 - R() * 0.9, 620 + R() * 160, { hit: 0.08 });
      else if (R() < 0.05) add(s, SP.umbrellas[R() * 3 | 0], -1.4 - R() * 0.9, 420, { hit: 0.15 });
      else if (R() < 0.015) add(s, SP.surf, -1.35, 300, { hit: 0.12 });
      // surfistas en el mar
      if (SP.surfers && R() < 0.02) add(s, SP.surfers[R() * SP.surfers.length | 0], -3.1 - R() * 0.9, 300, { shadow: 0 });
    }
  }

  // ---------- Fondo ----------
  // Cielo en degradado con tramado (dithering) a resolución real doble
  function bands(cols, h) {
    const { c, g } = Pix.canvas(W * 2, h * 2);
    const bh = h * 2 / (cols.length - 1);
    const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
    for (let y = 0; y < h * 2; y++) {
      const f = y / bh, i = Math.min(cols.length - 1, Math.floor(f)), n = Math.min(cols.length - 1, i + 1), fr = f - i;
      Pix.rect(g, 0, y, W * 2, 1, cols[i]);
      g.fillStyle = cols[n];
      for (let x = 0; x < W * 2; x++) if (bayer[y & 3][x & 3] / 16 < fr) g.fillRect(x, y, 1, 1);
    }
    return c;
  }
  const HD = (c, shade = true) => Pix.enhance(c, { outline: false, shade });

  function hills(base, top, lights, amp, seed, h, gap) {
    const { c, g } = Pix.canvas(T, h);
    const R = rng(seed), TAU = Math.PI * 2;
    for (let x = 0; x < T; x++) {
      const u = x / T;
      let v = amp * (0.55 + 0.25 * Math.sin(TAU * 2 * u + seed) + 0.15 * Math.sin(TAU * 7 * u + seed * 2) + 0.05 * Math.sin(TAU * 23 * u));
      if (gap) v *= Math.max(0, Math.min(1, (Math.sin(TAU * u + seed) + 0.25) * 2.2));
      const y = Math.round(h - v);
      if (y >= h) continue;
      Pix.rect(g, x, y, 1, h - y, base);
      Pix.px(g, x, y, top);
      if (lights && R() < 0.18 && h - y > 3) Pix.px(g, x, y + 2 + (R() * (h - y - 2) | 0), R() < 0.6 ? '#ffd27a' : '#ffb347');
    }
    return c;
  }

  function buildBackdrop() {
    skyDay = bands(['#1e1838', '#33204c', '#5a2a5e', '#8e3462', '#c8485e', '#ea6a52', '#f69a52', '#fcc566', '#ffe2a0'], 140);
    skyNight = bands(['#04050e', '#070a1c', '#0b1028', '#101736', '#151d42', '#1b234c', '#222a58', '#2c3264', '#3a3a70'], 140);
    const R = rng(77);
    stars = Array.from({ length: 140 }, () => ({ x: (R() * W * 2 | 0) / 2, y: (R() * 160 | 0) / 2, ph: R() * 6.28, sp: 1 + R() * 3 }));

    // sol retro con franjas
    {
      const { c, g } = Pix.canvas(60, 60);
      const cols = ['#fff4b0', '#ffe07a', '#ffc25a', '#ff9a4a', '#ff7048', '#f04a58'];
      for (let y = 0; y < 60; y++) {
        const dy = y - 30;
        if (Math.abs(dy) > 26) continue;
        if (dy > 2 && (dy % 6) < Math.min(5, 1 + dy / 6)) continue;
        const hw = Math.round(Math.sqrt(26 * 26 - dy * dy));
        Pix.rect(g, 30 - hw, y, hw * 2, 1, cols[Math.min(5, Math.floor((y - 4) / 9))]);
      }
      sunC = HD(c, false);
    }
    // luna creciente con cráteres
    {
      const { c, g } = Pix.canvas(18, 18);
      Pix.disc(g, 9, 9, 7, '#f2ecd2');
      for (const [x, y] of [[6, 7], [7, 11], [10, 13], [5, 10]]) Pix.px(g, x, y, '#d6cfae');
      Pix.disc(g, 12, 7, 6, 'rgba(0,0,0,0)');
      g.globalCompositeOperation = 'destination-out';
      Pix.disc(g, 12, 7, 6, '#000');
      moonC = HD(c);
    }
    // nubes
    {
      const { c, g } = Pix.canvas(T, 34);
      const Rc = rng(5);
      for (let k = 0; k < 9; k++) {
        const x = Rc() * T | 0, y = 4 + (Rc() * 22 | 0), w = 30 + (Rc() * 70 | 0);
        for (const ox of [0, -T]) {
          Pix.rect(g, x + ox, y, w, 3, '#f4a08c');
          Pix.rect(g, x + ox + 6, y - 2, w - 14, 2, '#f8b89a');
          Pix.rect(g, x + ox + 14, y - 3, w * 0.4 | 0, 1, '#ffd2a8');
          Pix.rect(g, x + ox + 3, y + 3, w - 6, 1, '#b0607a');
        }
      }
      cloudsC = HD(c);
    }
    farDay = HD(hills('#7a4a78', '#9a5a86', false, 20, 1.3, 30, false));
    farNight = HD(hills('#161a38', '#222850', true, 20, 1.3, 30, false), false);
    nearDay = HD(hills('#4a2a52', '#6a3a62', false, 34, 4.1, 40, true));
    nearNight = HD(hills('#0c0f22', '#181c3a', true, 34, 4.1, 40, true), false);
  }

  // Las capas están a doble resolución: se dibujan a tamaño lógico con desplazamiento de medio píxel
  function tile(ctx, img, off, y) {
    const o = mod(Math.floor(off * 2) / 2, T), h = img.height / 2;
    ctx.drawImage(img, -o, y, T, h);
    if (T - o < W) ctx.drawImage(img, T - o, y, T, h);
  }

  function drawBackdrop(ctx, skyOff, hillOff, t, m, hz = HORIZON) {
    palette(m);
    ctx.drawImage(skyDay, 0, hz - 139, W, 140);
    if (m > 0) { ctx.globalAlpha = m; ctx.drawImage(skyNight, 0, hz - 139, W, 140); ctx.globalAlpha = 1; }
    if (m > 0.2) {
      for (const s of stars) {
        if (s.y > hz - 6) continue;
        const b = Math.sin(t * s.sp + s.ph);
        if (b < -0.2) continue;
        ctx.globalAlpha = (m - 0.2) * 1.25;
        ctx.fillStyle = b > 0.6 ? '#ffffff' : '#8a90c8';
        ctx.fillRect(s.x, s.y, 0.5, 0.5);
        if (b > 0.9 && s.sp > 3) { ctx.fillRect(s.x - 0.5, s.y, 1.5, 0.5); ctx.fillRect(s.x, s.y - 0.5, 0.5, 1.5); }
      }
      ctx.globalAlpha = 1;
    }

    // sol (se oculta en el mar al anochecer) y luna
    let sx = mod(110 - skyOff, T);
    if (sx > W + 40) sx -= T;
    sunX = sx;
    const sy = Math.round(hz - 16 + m * 50);
    if (m < 0.95) {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, hz + 1); ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.5 * (1 - m);
      ctx.drawImage(SP.glowWarm, sx - 64, sy - 64, 128, 128);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.drawImage(sunC, Math.round(sx * 2) / 2 - 30, sy - 30, 60, 60);
      ctx.restore();
    }
    if (m > 0.3) {
      let mx = mod(300 - skyOff, T);
      if (mx > W + 20) mx -= T;
      ctx.globalAlpha = Math.min(1, (m - 0.3) * 2);
      ctx.drawImage(moonC, Math.round(mx * 2) / 2 - 9, hz - 73, 18, 18);
      ctx.globalAlpha = 1;
    }

    ctx.globalAlpha = 1 - m * 0.8;
    tile(ctx, cloudsC, skyOff * 0.8, hz - 72);
    ctx.globalAlpha = 1;
    tile(ctx, farDay, hillOff * 0.5, hz - 29);
    if (m > 0) { ctx.globalAlpha = m; tile(ctx, farNight, hillOff * 0.5, hz - 29); ctx.globalAlpha = 1; }
    tile(ctx, nearDay, hillOff, hz - 39);
    if (m > 0) { ctx.globalAlpha = m; tile(ctx, nearNight, hillOff, hz - 39); ctx.globalAlpha = 1; }

    // parapentes sobre los acantilados (de día)
    if (m < 0.85 && SP.paragliders) {
      ctx.globalAlpha = 1 - m;
      for (let i = 0; i < 4; i++) {
        let x = mod(232 + i * 38 + (i % 2 ? 300 : 0) - hillOff * 0.8 + Math.sin(t * 0.13 + i) * 14, T);
        if (x > W + 20) x -= T;
        const y = hz - 56 + i * 9 + Math.sin(t * 0.7 + i * 2) * 3;
        const s = 0.62 - i * 0.06, pg = SP.paragliders[i];
        ctx.drawImage(pg, Math.round(x * 2) / 2, Math.round(y * 2) / 2, pg.width * s / 2 * 2, pg.height * s / 2 * 2);
      }
      ctx.globalAlpha = 1;
    }
    // gaviotas aleteando
    if (m < 0.9) {
      ctx.fillStyle = m > 0.5 ? 'rgba(20,20,40,0.6)' : '#3a2a3a';
      for (let i = 0; i < 7; i++) {
        const x = mod(i * 61 - t * (9 + i) - skyOff * 0.6, W + 40) - 20;
        const y = hz - 62 + (i * 13) % 26 + Math.sin(t * 0.8 + i) * 4;
        const f = Math.sin(t * (7 + i * 0.5) + i) > 0 ? -0.5 : 0.5;
        ctx.fillRect(x - 1.5, y + f, 1.5, 0.5); ctx.fillRect(x, y, 0.5, 0.5); ctx.fillRect(x + 0.5, y + f, 1.5, 0.5);
      }
    }

    const far = PAL[FOG - 1];
    Pix.rect(ctx, 0, hz + 1, W, H - hz, far.sea1);
    // veleros en el horizonte
    if (SP.sailboat) {
      ctx.globalAlpha = 1 - m * 0.6;
      for (let i = 0; i < 3; i++) {
        let x = mod(60 + i * 230 + t * (1.5 + i * 0.6) - skyOff * 0.35, T);
        if (x > W + 10) x -= T;
        const sb = SP.sailboat, s = 0.32 + i * 0.05;
        ctx.drawImage(sb, x, hz - sb.height * s / 2 + 2 + Math.sin(t * 1.3 + i) * 0.3, sb.width * s / 2, sb.height * s / 2);
      }
      ctx.globalAlpha = 1;
    }
    if (m < 0.95) {
      ctx.fillStyle = far.glint;
      for (let y = hz + 1; y < hz + 5; y += 0.5) {
        const gw = 6 + (y - hz) * 3;
        const j = Math.round(Math.sin(t * 4 + y * 4.6) * 6) / 2;
        if (Math.sin(t * 7 + y * 9) > -0.4) ctx.fillRect(Math.round((sunX - gw / 2 + j) * 2) / 2, y, Math.round(gw * 1.2) / 2, 0.5);
      }
    }
  }

  // Mar visto desde la ventana del garaje
  function drawSeaBand(ctx, hz, bottom, t, m) {
    palette(m);
    const P = PAL[3];
    for (let y = hz + 1; y < bottom; y++) {
      const k = Math.floor((y - hz) / 3 + t * 2) % 2;
      Pix.rect(ctx, 0, y, W, 1, k ? P.sea1 : P.sea2);
      const gw = 4 + (y - hz) * 1.2;
      if ((y + Math.floor(t * 6)) % 3 === 0 && m < 0.95) Pix.rect(ctx, Math.round(sunX - gw / 2 + Math.sin(t * 3 + y) * 3), y, Math.round(gw * 0.7), 1, P.glint);
    }
  }

  // ---------- Proyección y dibujo ----------
  function project(p, camX, camY, camZ) {
    p.camera.x = -camX;
    p.camera.y = p.world.y - camY;
    p.camera.z = p.world.z - camZ;
    p.screen.scale = CAM_DEPTH / p.camera.z;
    p.screen.x = half(W / 2 + p.screen.scale * p.camera.x * W / 2);
    p.screen.y = half(HORIZON - p.screen.scale * p.camera.y * YS);
    p.screen.w = half(p.screen.scale * ROAD_W * W / 2);
  }

  // El lienzo real tiene el doble de resolución: todo se redondea a medio píxel lógico
  const half = v => Math.round(v * 2) / 2;
  function fill(ctx, x, y, w, col) {
    if (w <= 0) return;
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, 0.5);
  }

  function drawSegment(ctx, seg, clipY, m) {
    const p1 = seg.p1.screen, p2 = seg.p2.screen;
    const top = Math.max(0, p2.y), bot = Math.min(H, p1.y, clipY);
    if (bot <= top) return;
    const P = PAL[seg.fog];
    const alt = Math.floor(seg.index / RUMBLE) % 2;
    const sAlt = Math.floor(seg.index / 2) % 2;
    const road = alt ? P.road1 : P.road2, rum = alt ? P.rum1 : P.rum2;
    const sand = alt ? P.sand1 : P.sand2, side = alt ? P.side1 : P.side2, walk = alt ? P.walk1 : P.walk2;
    const sea = sAlt ? P.sea1 : P.sea2;
    const span = Math.max(0.5, p1.y - p2.y);
    // líneas de medio píxel lógico = 1 píxel real
    for (let y = top; y < bot; y += 0.5) {
      const f = (y - p2.y + 0.25) / span;
      const x = p2.x + (p1.x - p2.x) * f, w = p2.w + (p1.w - p2.w) * f;
      const rL = half(x - w), rR = half(x + w), rw = Math.max(0.5, half(w * 0.1));
      const foamX = half(x - w * 2.7), sandX = half(x - w * 2.55);
      const row = Math.round(y * 2);
      fill(ctx, 0, y, foamX, sea);
      // brillos del sol sobre el mar
      if (m < 0.95 && foamX > 0 && ((seg.index * 7 + row) % 5 === 0)) {
        const gw = 2 + (y - HORIZON) * 0.45;
        const gx = half(sunX + (seg.index * 13 % 11) - 5 - gw / 2 + Math.sin(row * 0.7 + seg.index) * 2);
        if (gx + gw < foamX) fill(ctx, gx, y, half(gw), P.glint);
      }
      // ola que rompe en la orilla
      const surf = sAlt ? half(w * 0.12) : half(w * 0.05);
      fill(ctx, foamX - surf, y, surf, P.foam);
      fill(ctx, foamX, y, sandX - foamX, (row + seg.index) % 3 ? P.foam : sand);
      fill(ctx, sandX, y, rL - rw - sandX, sand);
      if (row % 7 === 0 && w > 20) fill(ctx, half(sandX + (seg.index * 17 % 13) / 13 * (rL - rw - sandX)), y, 0.5, alt ? P.sand2 : P.sand1);
      fill(ctx, rL - rw, y, rw, rum);
      if (seg.start) {
        const cw = Math.max(0.5, half(w / 6));
        for (let k = 0; k < 12; k++) fill(ctx, rL + k * cw, y, cw, (k + (row >> 2)) % 2 ? '#f4f4f4' : '#141418');
      } else {
        fill(ctx, rL, y, rR - rL, road);
        if (alt) {
          const lw = Math.max(0.5, half(w * 0.03));
          for (let i = 1; i < LANES; i++) fill(ctx, half(x - w + 2 * w * i / LANES - lw / 2), y, lw, P.lane);
        }
        // borde blanco de la pista
        const ew = Math.max(0.5, half(w * 0.012));
        fill(ctx, rL, y, ew, P.lane); fill(ctx, rR - ew, y, ew, P.lane);
      }
      fill(ctx, rR, y, rw, rum);
      const sw = half(x + w * 1.35);
      fill(ctx, rR + rw, y, sw - rR - rw, walk);
      fill(ctx, sw, y, W - sw, side);
    }
    // ojos de gato en las líneas de carril (brillan de noche)
    if (seg.index % 4 === 0 && !seg.start && p1.y <= clipY && p1.w > 6) {
      const ds = Math.max(0.5, half(p1.w * 0.022));
      ctx.fillStyle = m > 0.3 ? '#fff2a0' : '#f4f4f4';
      for (let i = 1; i < LANES; i++) ctx.fillRect(half(p1.x - p1.w + 2 * p1.w * i / LANES - ds / 2), p1.y - ds, ds, ds);
      if (m > 0.3) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = m * 0.6;
        const gs = ds * 6;
        for (let i = 1; i < LANES; i++) ctx.drawImage(SP.glowWarm, p1.x - p1.w + 2 * p1.w * i / LANES - gs / 2, p1.y - ds / 2 - gs / 2, gs, gs);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }

  // ---------- Volumen 3D: acantilado, guardavías y sardinel ----------
  const WALL_OFF = 2.3, RAIL_OFF = -1.16, CURB_OFF = 1.36;
  function quad(ctx, p, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
    ctx.closePath();
    ctx.fill();
  }

  // franja vertical entre dos alturas (en unidades del mundo) a lo largo de un segmento
  function band(ctx, a, b, off, h0a, h1a, h0b, h1b, clip, col) {
    const xa = a.x + a.scale * off * ROAD_W * W / 2, xb = b.x + b.scale * off * ROAD_W * W / 2;
    const ya0 = Math.min(a.y - h0a * a.scale * YS, clip), ya1 = Math.min(a.y - h1a * a.scale * YS, clip);
    const yb0 = Math.min(b.y - h0b * b.scale * YS, clip), yb1 = Math.min(b.y - h1b * b.scale * YS, clip);
    if (ya1 >= clip && yb1 >= clip) return;
    quad(ctx, [[xa, ya0], [xa, ya1], [xb, yb1], [xb, yb0]], col);
  }

  function drawWall(ctx, seg) {
    const a = seg.p1.screen, b = seg.p2.screen, clip = seg.clip;
    if (seg.p2.camera.z <= CAM_DEPTH) return;
    const P = PAL[seg.fog], alt = seg.index % 2;
    const h1 = seg.wh1, h2 = seg.wh2;
    band(ctx, a, b, WALL_OFF, 0, h1, 0, h2, clip, alt ? P.cliff1 : P.cliff2);
    // vetas de roca
    for (const f of [0.22, 0.47, 0.71]) band(ctx, a, b, WALL_OFF, h1 * f, h1 * f + 55, h2 * f, h2 * f + 55, clip, P.cliffD);
    band(ctx, a, b, WALL_OFF, h1 * 0.5, h1 * 0.5 + 30, h2 * 0.5, h2 * 0.5 + 30, clip, P.cliffL);
    // vegetación de la Costa Verde
    if (seg.veg) band(ctx, a, b, WALL_OFF, h1 * seg.veg, h1 * (seg.veg + 0.12), h2 * seg.veg, h2 * (seg.veg + 0.12), clip, P.veg2);
    band(ctx, a, b, WALL_OFF, h1 * 0.86, h1, h2 * 0.86, h2, clip, P.veg1);
    band(ctx, a, b, WALL_OFF, h1 * 0.97, h1 + 20, h2 * 0.97, h2 + 20, clip, P.veg2);
    // pie del acantilado (sombra)
    band(ctx, a, b, WALL_OFF, 0, 90, 0, 90, clip, P.cliffD);
  }

  function drawRails(ctx, seg) {
    const a = seg.p1.screen, b = seg.p2.screen, clip = seg.clip;
    if (seg.p2.camera.z <= CAM_DEPTH) return;
    const P = PAL[seg.fog];
    // guardavía del lado del mar: postes y doble riel
    if (seg.index % 2 === 0) {
      const pw = Math.max(0.5, half(a.scale * 22 * W / 2));
      const px = a.x + a.scale * RAIL_OFF * ROAD_W * W / 2;
      const top = a.y - 140 * a.scale * YS;
      if (top < clip) { ctx.fillStyle = P.post; ctx.fillRect(px - pw / 2, top, pw, Math.min(a.y, clip) - top); }
    }
    band(ctx, a, b, RAIL_OFF, 95, 135, 95, 135, clip, P.rail);
    band(ctx, a, b, RAIL_OFF, 95, 108, 95, 108, clip, P.railD);
    // sardinel del lado del cerro
    band(ctx, a, b, CURB_OFF, 0, 50, 0, 50, clip, seg.index % 2 ? P.curb : P.curbD);
    band(ctx, a, b, CURB_OFF, 42, 50, 42, 50, clip, P.rail);
  }

  // Vehículo como caja 3D: la cara trasera es el sprite y la delantera se proyecta z+largo más adelante
  // con la misma perspectiva de la pista. Se dibujan costado, capó/maletera, cabina y techo; luego el sprite.
  function drawBox(ctx, o, sc, sx, sy, f, clipY, m = 0, far = null) {
    const B = o.box, asp = o.spr.height / o.spr.width;
    const rw = o.w * sc * W / 2, rh = rw * asp, fw = o.w * f.sc * W / 2, fh = fw * asp;
    if (rw < 2) return;
    const R = { x0: sx - rw / 2, x1: sx + rw / 2, y: fr => sy - rh * (1 - fr), w: rw };
    const F = { x0: f.x - fw / 2, x1: f.x + fw / 2, y: fr => f.y - fh * (1 - fr), w: fw };
    // punto a lo largo del vehículo: u=0 trasera, u=1 delantera
    const at = (u, side, fr, inset = 0) => {
      const rx = side < 0 ? R.x0 + R.w * inset : R.x1 - R.w * inset;
      const fx = side < 0 ? F.x0 + F.w * inset : F.x1 - F.w * inset;
      return [rx + (fx - rx) * u, R.y(fr) + (F.y(fr) - R.y(fr)) * u];
    };
    const face = (u0, u1, side, f0, f1, inset, col) => quad(ctx, [at(u0, side, f0, inset), at(u0, side, f1, inset), at(u1, side, f1, inset), at(u1, side, f0, inset)], col);
    const top = (u0, u1, fr, inset, col) => quad(ctx, [at(u0, -1, fr, inset), at(u0, 1, fr, inset), at(u1, 1, fr, inset), at(u1, -1, fr, inset)], col);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, clipY); ctx.clip();
    // de noche, los faros delanteros alumbran la pista por delante del vehículo
    if (m > 0.05 && far && !B.noLights) {
      const fl = at(1, -1, 0.75), fr = at(1, 1, 0.75);
      const spread = (far.sc * o.w * W / 2) * 1.6;
      ctx.globalCompositeOperation = 'lighter';
      const prevA = ctx.globalAlpha;
      ctx.globalAlpha = prevA * m * 0.16;
      quad(ctx, [fl, fr, [far.x + spread, far.y], [far.x - spread, far.y]], '#ffe8b0');
      ctx.globalAlpha = prevA;
      ctx.globalCompositeOperation = 'source-over';
    }
    // se ve el costado que mira hacia la cámara
    const side = sx < W / 2 - 1 ? 1 : sx > W / 2 + 1 ? -1 : 0;
    if (B.tex) {
      // techo, capó y maletera como superficies; el costado es el dibujo de perfil en perspectiva
      if (!B.noHood) top(0, 1, B.body, 0.02, B.top);
      if (B.cab) top(B.cab[0], B.cab[1], B.cabTop, B.inset, B.roof);
      if (B.rails && B.cab) top(B.cab[0] + 0.05, B.cab[1] - 0.05, B.cabTop - 0.03, B.inset + 0.02, '#2a2b33');
      if (side) drawSideTex(ctx, B.tex, side, R, F, sc, f.sc);
      ctx.restore();
      return;
    }
    const uEnd = B.nose ? (B.cab ? B.cab[1] : 1) : 1;
    if (side) {
      face(0, uEnd, side, 0.96, B.body, 0, B.side);
      if (B.sideL) face(0, uEnd, side, B.body + 0.1, B.body, 0, B.sideL);
      if (B.stripe) face(0, uEnd, side, B.stripe[0], B.stripe[1], 0, B.stripe[2]);
      face(0, uEnd, side, 0.96, 0.9, 0, B.sideD);
      // líneas de puertas y manijas
      if (B.doors) for (const u of B.doors) {
        face(u, u + 0.012, side, 0.9, B.body + 0.02, 0, B.sideD);
        face(u + 0.05, u + 0.09, side, B.body + 0.12, B.body + 0.15, 0, B.sideL || B.side);
      }
      if (B.windows) for (let u = 0.08; u < 0.86; u += 0.2) face(u, u + 0.15, side, B.windows[0], B.windows[1], 0, B.glass);
      // llantas con aro y guardabarro
      for (const u of B.wheels) {
        const [x, y] = at(u, side, 1), [, yt] = at(u, side, 0.76);
        const ww = Math.max(1, (R.w + (F.w - R.w) * u) * 0.17);
        ctx.fillStyle = '#0a0a0e';
        ctx.fillRect(x - ww / 2 - 0.5, yt - 0.5, ww + 1, 1);
        ctx.fillStyle = '#0e0e12';
        ctx.fillRect(x - ww / 2, yt, ww, y - yt);
        ctx.fillStyle = '#9aa0ac';
        ctx.fillRect(x - ww / 4, yt + (y - yt) * 0.28, ww / 2, (y - yt) * 0.4);
        ctx.fillStyle = '#5a5d6a';
        ctx.fillRect(x - ww / 10, yt + (y - yt) * 0.4, ww / 5, (y - yt) * 0.16);
      }
    }
    // capó y maletera
    top(0, uEnd, B.body, 0, B.top);
    if (B.cab) {
      const [u0, u1] = B.cab;
      if (side) {
        face(u0, u1, side, B.body, B.cabTop, B.inset, B.glass);
        // parantes de la cabina
        for (const p of [u0, u0 + (u1 - u0) * 0.5, u1 - 0.02]) face(p, p + 0.03, side, B.body, B.cabTop, B.inset, B.roof);
        if (B.mirror) face(u1 - 0.02, u1 + 0.05, side, B.body - 0.02, B.body - 0.09, -0.06, B.side);
      }
      top(u0, u1, B.cabTop, B.inset, B.roof);
      if (B.rails) {
        top(u0 + 0.05, u1 - 0.05, B.cabTop - 0.03, B.inset + 0.02, '#2a2b33');
        top(u0 + 0.05, u1 - 0.05, B.cabTop - 0.03, B.inset + 0.08, B.roof);
      }
      if (B.cargo) top(0.02, u0 - 0.04, B.body - 0.12, 0.06, B.cargo);
    }
    // mototaxi: la moto y el conductor van adelante, al centro
    if (B.nose) {
      const u0 = B.cab ? B.cab[1] : 0.6;
      top(u0, 1, B.body + 0.05, 0.38, '#2a2b33');
      if (side) face(u0, 1, side, 0.96, B.body + 0.05, 0.38, '#3a3d48');
      const [hx, hy] = at(u0 + 0.12, -1, 0.12, 0.5);
      const hr = Math.max(0.5, (R.w + (F.w - R.w) * 0.7) * 0.08);
      ctx.fillStyle = '#1f2f5a'; ctx.fillRect(hx - hr, hy, hr * 2, hr * 2.4);
      ctx.fillStyle = '#131318'; ctx.fillRect(hx - hr * 0.8, hy - hr * 1.4, hr * 1.6, hr * 1.5);
    }
    ctx.restore();
  }

  // Proyecta la textura de perfil sobre el plano vertical del costado, una columna de 1 píxel real a la vez.
  // La columna de textura se elige con interpolación correcta en perspectiva (proporcional a 1/z).
  function drawSideTex(ctx, tex, side, R, F, sr, sf) {
    const xr = side > 0 ? R.x1 : R.x0, xf = side > 0 ? F.x1 : F.x0;
    const span = xf - xr, n = Math.floor(Math.abs(span) * 2);
    if (n < 1) return;
    const yrT = R.y(0), yrB = R.y(1), yfT = F.y(0), yfB = F.y(1);
    const tw = tex.width, th = tex.height;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const u = t * sf / ((1 - t) * sr + t * sf);
      const col = Math.min(tw - 1, Math.floor(u * tw));
      const x = Math.floor((xr + span * t) * 2) / 2;
      const yt = yrT + (yfT - yrT) * t, yb = yrB + (yfB - yrB) * t;
      ctx.drawImage(tex, col, 0, 1, th, x, yt, 0.5, yb - yt);
    }
  }

  // proyección de un punto (z absoluto) usando los segmentos ya proyectados en este cuadro
  let PROJ = null;
  function screenAt(z, xOff) {
    if (!PROJ) return null;
    const r = (z - PROJ.baseAbs) / SEG, n = Math.floor(r);
    if (n < 0 || n >= DRAW) return null;
    const seg = segments[(PROJ.base + n) % segments.length];
    if (!seg.vis) return null;
    const a = seg.p1.screen, b = seg.p2.screen, k = r - n;
    const sc = a.scale + (b.scale - a.scale) * k;
    return { sc, x: a.x + (b.x - a.x) * k + sc * xOff * ROAD_W * W / 2, y: a.y + (b.y - a.y) * k };
  }

  function drawObj(ctx, s, scale, sx, sy, clipY, m, fog) {
    const img = s.spr;
    const dw = half(s.w * scale * W / 2);
    if (dw < 0.5 || dw > 1600) return;
    const dh = half(dw * img.height / img.width);
    const dx = half(sx + dw * (s.ax !== undefined ? s.ax : -0.5)), dy = half(sy - dh);
    const ch = Math.max(0, dy + dh - clipY);
    if (ch >= dh) return;
    ctx.globalAlpha = fog >= 5 ? 1 - (fog - 4) * 0.2 : 1;
    // sombra en el piso
    if (s.shadow && sy <= clipY && !s.lift) {
      const sw = dw * s.shadow, shh = Math.max(0.5, half(dw * 0.09));
      ctx.fillStyle = 'rgba(20,8,20,0.32)';
      ctx.fillRect(half(sx - sw / 2), half(sy - shh / 2), half(sw), shh);
      ctx.fillRect(half(sx - sw * 0.38), half(sy - shh), half(sw * 0.76), half(shh * 2));
    } else if (s.lift && sy <= clipY) {
      const base = sy + s.lift * scale * YS, sw = dw * 0.5;
      if (base <= clipY) { ctx.fillStyle = 'rgba(20,8,20,0.25)'; ctx.fillRect(half(sx - sw / 2), half(base - 0.5), half(sw), 1); }
    }
    if (s.halo) {
      // brillo dorado alrededor del casco extra
      ctx.globalCompositeOperation = 'lighter';
      const gs = dw * 2.6 * s.halo;
      ctx.drawImage(SP.glowWarm, dx + dw / 2 - gs / 2, dy + dh / 2 - gs / 2, gs, gs);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.drawImage(img, 0, 0, img.width, img.height * (dh - ch) / dh, dx, dy, dw, dh - ch);
    ctx.globalAlpha = 1;
    if (s.beacons) {
      // balizas intermitentes (ambulancia): se ven de día y de noche
      ctx.globalCompositeOperation = 'lighter';
      const gs = Math.max(6, dw * 0.9);
      for (const [fx, fy, blue] of s.beacons) ctx.drawImage(blue ? SP.glowBlue : SP.glowRed, dx + fx * dw - gs / 2, dy + fy * dh - gs / 2, gs, gs);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (m > 0.05 && (s.glow || s.lights)) {
      ctx.globalCompositeOperation = 'lighter';
      if (s.glow) {
        for (const [fx, fy, sz] of s.glow) {
          const gs = Math.max(4, dw * sz * 1.4);
          ctx.globalAlpha = m;
          ctx.drawImage(SP.glowWarm, dx + fx * dw - gs / 2, dy + fy * dh - gs / 2, gs, gs);
          if (s.pool !== undefined && sy <= clipY) {
            const pw = dw * 2.6, ph = Math.max(2, dw * 0.45);
            ctx.globalAlpha = m * 0.7;
            ctx.drawImage(SP.glowWarm, dx + s.pool * dw - pw / 2, sy - ph / 2, pw, ph);
          }
        }
      }
      if (s.lights) {
        ctx.globalAlpha = m;
        const gs = Math.max(3, dw * 0.35);
        for (const [fx, fy] of s.lights) ctx.drawImage(SP.glowRed, dx + fx * dw - gs / 2, dy + fy * dh - gs / 2, gs, gs);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  const segAt = z => segments[Math.floor(mod(z, trackLength) / SEG) % segments.length];

  function render(ctx, v) {
    const pos = mod(v.dist, trackLength);
    const base = segAt(pos), basePct = (pos % SEG) / SEG;
    const pz = mod(pos + PLAYER_Z, trackLength), pSeg = segAt(pz), pPct = (pz % SEG) / SEG;
    const playerY = pSeg.p1.world.y + (pSeg.p2.world.y - pSeg.p1.world.y) * pPct;
    drawBackdrop(ctx, v.skyOff, v.hillOff, v.t, v.night);

    const buckets = [];
    const baseAbs = v.dist - basePct * SEG;
    for (const o of v.objs) {
      const r = (o.z - baseAbs) / SEG, n = Math.floor(r);
      if (n >= 0 && n < DRAW) { o._pct = r - n; (buckets[n] || (buckets[n] = [])).push(o); }
    }

    let maxy = H, x = 0, dx = -(base.curve * basePct);
    const camX = v.x * ROAD_W, camY = playerY + CAM_H;
    for (let n = 0; n < DRAW; n++) {
      const seg = segments[(base.index + n) % segments.length];
      const camZ = pos - (seg.index < base.index ? trackLength : 0);
      seg.clip = maxy;
      const fd = n / DRAW;
      seg.fog = Math.min(FOG - 1, Math.floor((1 - Math.exp(-fd * fd * 4.5)) * FOG));
      project(seg.p1, camX - x, camY, camZ);
      project(seg.p2, camX - x - dx, camY, camZ);
      x += dx; dx += seg.curve;
      seg.vis = seg.p1.camera.z > CAM_DEPTH;
      if (!seg.vis || seg.p2.screen.y >= seg.p1.screen.y || seg.p2.screen.y >= maxy) continue;
      drawSegment(ctx, seg, maxy, v.night);
      maxy = seg.p2.screen.y;
    }

    PROJ = { baseAbs, base: base.index };
    for (let n = DRAW - 1; n >= 0; n--) {
      const seg = segments[(base.index + n) % segments.length];
      if (!seg.vis) continue;
      const s1 = seg.p1.screen, s2 = seg.p2.screen;
      const put = s => drawObj(ctx, s, s1.scale, s1.x + s1.scale * s.offset * ROAD_W * W / 2, s1.y, seg.clip, v.night, seg.fog);
      // de atrás hacia adelante: acantilado, objetos detrás de las barandas, barandas, objetos junto a la pista
      drawWall(ctx, seg);
      for (const s of seg.sprites) if (s.offset < RAIL_OFF || s.offset > CURB_OFF) put(s);
      drawRails(ctx, seg);
      for (const s of seg.sprites) if (s.offset >= RAIL_OFF && s.offset <= CURB_OFF) put(s);
      const objs = buckets[n];
      if (!objs) continue;
      objs.sort((a, b) => b._pct - a._pct);
      for (const o of objs) {
        const k = o._pct;
        const sc = s1.scale + (s2.scale - s1.scale) * k;
        const sx = s1.x + (s2.x - s1.x) * k + sc * o.x * ROAD_W * W / 2;
        const sy = s1.y + (s2.y - s1.y) * k - (o.lift || 0) * sc * YS;
        if (o.box) {
          const f = screenAt(o.z + o.box.len, o.x);
          if (f && f.y < sy) {
            ctx.globalAlpha = seg.fog >= 5 ? 1 - (seg.fog - 4) * 0.2 : 1;
            const far = v.night > 0.05 ? screenAt(o.z + o.box.len + SEG * 6, o.x) : null;
            drawBox(ctx, o, sc, sx, sy, f, seg.clip, v.night, far);
            ctx.globalAlpha = 1;
          }
        }
        drawObj(ctx, o, sc, sx, sy, seg.clip, v.night, seg.fog);
      }
    }
    return { pSeg, playerY };
  }

  function build(sprites) {
    SP = sprites;
    buildTrack();
    buildWalls();
    decorate();
    buildBackdrop();
  }

  return {
    build, render, drawBackdrop, drawSeaBand, segAt,
    SEG, ROAD_W, DRAW, PLAYER_Z, HORIZON,
    get trackLength() { return trackLength; },
  };
})();
