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
  };
  const NIGHT = {
    road1: '#26242f', road2: '#22202b', rum1: '#7a1a22', rum2: '#8a8698', lane: '#a6a2b4',
    sand1: '#5a4a4a', sand2: '#544444', foam: '#8a96c0', sea1: '#111b3c', sea2: '#0e1735',
    walk1: '#3a3844', walk2: '#363440', side1: '#1f2a22', side2: '#1c2620', glint: '#c8d4ff', fog: '#1c2040',
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

  function decorate() {
    const R = rng(2024);
    const add = (seg, spr, offset, w, extra = {}) => seg.sprites.push(Object.assign({ spr, offset, w, ax: -0.5, hit: 0 }, extra));
    let signK = 0, boardK = 0;
    for (const s of segments) {
      const i = s.index;
      if (i >= 4 && i <= 5) s.start = true;
      if (i % 3 === 0) add(s, SP.cliffs[(i / 3) % 3], 3.0 + R() * 0.3, 1500 + R() * 300);
      if (i % 24 === 0) add(s, SP.lamp, 1.22, 500, { ax: -35 / 40, hit: 0.06, glow: [[9 / 40, 8 / 96, 0.7]], pool: 9 / 40 });
      if (i < 12) continue;
      if (i % 520 === 260) add(s, SP.signs[signK++ % SP.signs.length], 1.55, 800, { hit: 0.35 });
      else if (i % 300 === 150) add(s, SP.billboards[boardK++ % SP.billboards.length], 1.8, 950, { hit: 0.4 });
      else if (R() < 0.05) add(s, R() < 0.5 ? SP.rock : SP.bush, 1.45 + R() * 0.5, 320, { hit: 0.12 });
      if (i % 190 === 95) add(s, SP.lifeguard, -1.95, 620, { hit: 0.25 });
      else if (i % 230 === 40) add(s, SP.stall, -1.5, 720, { hit: 0.35 });
      else if (R() < 0.09) add(s, SP.palms[R() * 3 | 0], -1.55 - R() * 0.9, 620 + R() * 160, { hit: 0.08 });
      else if (R() < 0.05) add(s, SP.umbrellas[R() * 3 | 0], -1.4 - R() * 0.9, 420, { hit: 0.15 });
      else if (R() < 0.015) add(s, SP.surf, -1.35, 300, { hit: 0.12 });
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

    const far = PAL[FOG - 1];
    Pix.rect(ctx, 0, hz + 1, W, H - hz, far.sea1);
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

    for (let n = DRAW - 1; n >= 0; n--) {
      const seg = segments[(base.index + n) % segments.length];
      if (!seg.vis) continue;
      const s1 = seg.p1.screen, s2 = seg.p2.screen;
      for (const s of seg.sprites) drawObj(ctx, s, s1.scale, s1.x + s1.scale * s.offset * ROAD_W * W / 2, s1.y, seg.clip, v.night, seg.fog);
      const objs = buckets[n];
      if (!objs) continue;
      objs.sort((a, b) => b._pct - a._pct);
      for (const o of objs) {
        const k = o._pct;
        const sc = s1.scale + (s2.scale - s1.scale) * k;
        const sx = s1.x + (s2.x - s1.x) * k + sc * o.x * ROAD_W * W / 2;
        const sy = s1.y + (s2.y - s1.y) * k - (o.lift || 0) * sc * YS;
        drawObj(ctx, o, sc, sx, sy, seg.clip, v.night, seg.fog);
      }
    }
    return { pSeg, playerY };
  }

  function build(sprites) {
    SP = sprites;
    buildTrack();
    decorate();
    buildBackdrop();
  }

  return {
    build, render, drawBackdrop, drawSeaBand, segAt,
    SEG, ROAD_W, DRAW, PLAYER_Z, HORIZON,
    get trackLength() { return trackLength; },
  };
})();
