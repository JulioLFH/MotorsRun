'use strict';
// Primitivas de dibujo pixel a pixel (sin antialiasing).
const Pix = {
  canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    return { c, g };
  },
  rect(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); },
  px(g, x, y, col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); },
  line(g, x0, y0, x1, y1, col, th = 1) {
    g.fillStyle = col;
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, o = Math.floor((th - 1) / 2);
    let err = dx + dy;
    for (;;) {
      g.fillRect(x0 - o, y0 - o, th, th);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  },
  inside(x, y, pts) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  },
  poly(g, pts, col) {
    g.fillStyle = col;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++)
      for (let x = Math.floor(x0); x <= Math.ceil(x1); x++)
        if (Pix.inside(x + 0.5, y + 0.5, pts)) g.fillRect(x, y, 1, 1);
  },
  disc(g, cx, cy, r, col) {
    g.fillStyle = col;
    const rr = r * r + r * 0.8, R = Math.ceil(r);
    for (let dy = -R; dy <= R; dy++)
      for (let dx = -R; dx <= R; dx++)
        if (dx * dx + dy * dy <= rr) g.fillRect(cx + dx, cy + dy, 1, 1);
  },
  // Duplica la resolución de un sprite con acabado de pixel art:
  // EPX/Scale2x (suaviza diagonales sin borronear), luz arriba-izquierda, sombra abajo-derecha
  // y contorno oscuro de 1 píxel. Devuelve un canvas de (2w+2)x(2h+2) si hay contorno.
  enhance(src, opt = {}) {
    const outline = opt.outline !== false, shade = opt.shade !== false, up = opt.scale !== false;
    const w = src.width, h = src.height;
    const sd = src.getContext('2d').getImageData(0, 0, w, h);
    const s32 = new Uint32Array(sd.data.buffer);
    const W2 = up ? w * 2 : w, H2 = up ? h * 2 : h;
    const big = up ? new Uint32Array(W2 * H2) : s32.slice();
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : s32[y * w + x];
    for (let y = 0; up && y < h; y++) {
      for (let x = 0; x < w; x++) {
        const P = s32[y * w + x], A = at(x, y - 1), B = at(x + 1, y), C = at(x - 1, y), D = at(x, y + 1);
        const o = (y * 2) * W2 + x * 2;
        big[o] = (C === A && C !== D && A !== B) ? A : P;
        big[o + 1] = (A === B && A !== C && B !== D) ? B : P;
        big[o + W2] = (D === C && D !== B && C !== A) ? C : P;
        big[o + W2 + 1] = (B === D && B !== A && D !== C) ? D : P;
      }
    }
    const pad = outline ? 1 : 0, OW = W2 + pad * 2, OH = H2 + pad * 2;
    const out = new ImageData(OW, OH);
    const o32 = new Uint32Array(out.data.buffer);
    const solid = v => (v >>> 24) > 160;
    const bigAt = (x, y) => (x < 0 || y < 0 || x >= W2 || y >= H2) ? 0 : big[y * W2 + x];
    const tint = (v, k, add) => {
      const a = v >>> 24, b = (v >> 16) & 255, g = (v >> 8) & 255, r = v & 255;
      const f = c => Math.max(0, Math.min(255, Math.round(c * k + add)));
      return ((a << 24) | (f(b) << 16) | (f(g) << 8) | f(r)) >>> 0;
    };
    for (let y = 0; y < H2; y++) {
      for (let x = 0; x < W2; x++) {
        let v = big[y * W2 + x];
        if (shade && solid(v)) {
          const up = bigAt(x, y - 1), lf = bigAt(x - 1, y), dn = bigAt(x, y + 1), rt = bigAt(x + 1, y);
          if (!solid(up) || !solid(lf)) v = tint(v, 1.08, 26);
          else if (!solid(dn) || !solid(rt)) v = tint(v, 0.68, 0);
          else if (up !== v && solid(up) && dn === v && (y & 1)) v = tint(v, 1.04, 8);
        }
        o32[(y + pad) * OW + x + pad] = v;
      }
    }
    if (outline) {
      const base = o32.slice();
      for (let y = 0; y < OH; y++) {
        for (let x = 0; x < OW; x++) {
          if (solid(base[y * OW + x])) continue;
          let dark = 0;
          for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= OW || ny >= OH) continue;
            const n = base[ny * OW + nx];
            if (solid(n)) { dark = n; break; }
          }
          if (dark) o32[y * OW + x] = ((tint(dark, 0.22, 4) & 0x00ffffff) | 0xf0000000) >>> 0;
        }
      }
    }
    const { c, g } = Pix.canvas(OW, OH);
    g.putImageData(out, 0, 0);
    return c;
  },

  // Acabado sin agrandar (para sprites dibujados ya a doble detalle)
  finish(src, opt = {}) { return Pix.enhance(src, Object.assign({}, opt, { scale: false })); },

  // Lienzo de dibujo a doble resolución: mismas coordenadas de siempre, pero cada
  // figura se rasteriza al doble (curvas y diagonales más finas). Con .fine(...) se pinta
  // detalle de 1 píxel real (coordenadas en medios píxeles).
  hd(w, h) {
    const { c, g } = Pix.canvas(w * 2, h * 2);
    const S = v => v * 2;
    return {
      c, g,
      rect: (x, y, ww, hh, col) => Pix.rect(g, S(x), S(y), S(ww), S(hh), col),
      px: (x, y, col) => Pix.rect(g, S(x), S(y), 2, 2, col),
      line: (x0, y0, x1, y1, col, th = 1) => Pix.line(g, S(x0), S(y0), S(x1), S(y1), col, th * 2),
      poly: (pts, col) => Pix.poly(g, pts.map(([x, y]) => [S(x), S(y)]), col),
      disc: (cx, cy, r, col) => Pix.disc(g, S(cx), S(cy), r * 2, col),
      ring: (cx, cy, r0, r1, col) => Pix.ring(g, S(cx), S(cy), r0 * 2, r1 * 2, col),
      // detalle fino en coordenadas de medio píxel
      fine: (x, y, ww, hh, col) => Pix.rect(g, Math.round(x * 2), Math.round(y * 2), Math.max(1, Math.round(ww * 2)), Math.max(1, Math.round(hh * 2)), col),
      fline: (x0, y0, x1, y1, col) => Pix.line(g, x0 * 2, y0 * 2, x1 * 2, y1 * 2, col, 1),
      text: (s, x, y, col) => PixelFont.draw(g, s, S(x), S(y), col, 1, 'center'),
    };
  },

  ring(g, cx, cy, r0, r1, col) {
    g.fillStyle = col;
    const a = r0 * r0 + r0 * 0.8, b = r1 * r1 + r1 * 0.8, R = Math.ceil(r1);
    for (let dy = -R; dy <= R; dy++)
      for (let dx = -R; dx <= R; dx++) {
        const d = dx * dx + dy * dy;
        if (d > a && d <= b) g.fillRect(cx + dx, cy + dy, 1, 1);
      }
  },
};

const Sprites = (() => {
  // Moto naked tipo "NK 250" de 50x42. Rueda trasera (11,34), delantera (38,34).
  function moto(col, rider, frame, letters = true) {
    const { c, g } = Pix.canvas(50, 42);
    const M = col.main, L = col.light, D = col.dark;

    const wheel = (cx, cy, front) => {
      Pix.disc(g, cx, cy, 7, '#0e0e12');
      Pix.ring(g, cx, cy, 6, 7, '#1d1d25');
      Pix.px(g, cx - 4, cy - 5, '#3c3c48'); Pix.px(g, cx - 5, cy - 4, '#3c3c48');
      Pix.disc(g, cx, cy, 5, '#17171e');
      Pix.ring(g, cx, cy, 4, 5, M);
      if (front) Pix.ring(g, cx, cy, 2, 3, '#8a8f9c');
      const a0 = frame * (Math.PI * 2 / 5) / 4;
      for (let k = 0; k < 5; k++) {
        const a = a0 + k * Math.PI * 2 / 5;
        Pix.line(g, cx, cy, cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, '#5d616c');
      }
      Pix.disc(g, cx, cy, 1, '#b0b4bc');
    };

    wheel(11, 34, false);
    wheel(38, 34, true);
    if (!rider) Pix.line(g, 20, 32, 16, 41, '#3a3b45');           // caballete
    Pix.line(g, 11, 34, 21, 31, '#2c2d36', 2);                     // basculante
    Pix.line(g, 12, 33, 21, 30, '#44465a');
    // motor
    Pix.rect(g, 19, 24, 11, 8, '#2c2d36');
    for (const y of [25, 27, 29]) Pix.line(g, 20, y, 28, y, '#46485a');
    Pix.disc(g, 23, 29, 2, '#55586a'); Pix.px(g, 22, 28, '#7a7d90');
    Pix.line(g, 19, 23, 30, 24, '#1e1e26');
    // escape
    Pix.line(g, 26, 32, 18, 32, '#7d838f');
    Pix.poly(g, [[7, 27], [18, 29], [18, 32], [8, 31]], '#9ea4b0');
    Pix.line(g, 8, 28, 17, 30, '#dfe3ea');
    Pix.rect(g, 6, 27, 2, 4, '#5a5f6a');
    // horquilla
    Pix.line(g, 36, 16, 38, 34, '#2a2a32', 2);
    Pix.line(g, 36, 17, 37, 30, '#5a5d6a');
    // guardabarro delantero
    Pix.rect(g, 34, 26, 9, 1, M); Pix.px(g, 33, 27, M); Pix.px(g, 43, 27, D);
    // colín
    Pix.poly(g, [[2, 18], [13, 19], [19, 21], [18, 23], [14, 23], [6, 21]], M);
    Pix.line(g, 3, 18, 12, 19, L);
    Pix.line(g, 7, 21, 15, 23, D);
    Pix.rect(g, 1, 18, 2, 2, '#ff3a3a');
    Pix.line(g, 8, 22, 6, 27, '#1e1e26');
    // asiento
    Pix.poly(g, [[12, 18], [21, 19], [21, 21], [14, 21]], '#121216');
    // tanque
    Pix.poly(g, [[20, 19], [24, 15], [31, 14], [34, 17], [33, 21], [23, 23]], M);
    Pix.line(g, 24, 15, 31, 14, L);
    Pix.line(g, 23, 16, 28, 15, L);
    Pix.line(g, 23, 22, 32, 21, D);
    // carenado lateral
    Pix.poly(g, [[30, 18], [35, 17], [37, 22], [34, 26], [29, 25]], M);
    Pix.line(g, 29, 25, 34, 26, D);
    Pix.line(g, 31, 21, 36, 20, '#16161c');
    // letras NK
    if (letters) for (const [x, y] of [[25, 17], [25, 18], [25, 19], [26, 17], [27, 18], [28, 17], [28, 18], [28, 19],
                          [30, 17], [30, 18], [30, 19], [31, 18], [32, 17], [32, 19]]) Pix.px(g, x, y, '#f4f4f4');
    // faro
    Pix.poly(g, [[34, 12], [38, 13], [41, 16], [40, 19], [35, 18]], '#16161c');
    Pix.rect(g, 39, 15, 2, 3, '#fff4b8'); Pix.px(g, 40, 16, '#ffffff');
    Pix.px(g, 37, 19, '#ff9a1a');
    // manubrio y espejo
    Pix.line(g, 33, 13, 33, 9, '#1e1e26');
    Pix.rect(g, 32, 8, 3, 2, '#121216');
    Pix.line(g, 31, 13, 35, 14, '#26262e');

    if (rider) {
      // pierna
      Pix.line(g, 19, 20, 27, 23, '#23232c', 3);
      Pix.line(g, 27, 23, 24, 30, '#23232c', 2);
      Pix.rect(g, 21, 30, 4, 2, '#0b0b0f');
      Pix.px(g, 27, 22, M);
      // torso
      Pix.poly(g, [[15, 20], [17, 15], [24, 9], [28, 9], [29, 12], [22, 20]], '#17171d');
      Pix.line(g, 17, 15, 24, 9, '#30313c');
      Pix.line(g, 19, 17, 26, 11, M);
      // brazo
      Pix.line(g, 27, 11, 30, 15, '#202029', 2);
      Pix.line(g, 30, 15, 33, 13, '#202029', 2);
      Pix.px(g, 30, 15, M);
      Pix.rect(g, 33, 12, 1, 2, '#0b0b0f');
      // casco
      Pix.disc(g, 30, 6, 4, '#131318');
      Pix.px(g, 28, 3, '#4a4b5c'); Pix.px(g, 29, 3, '#4a4b5c'); Pix.px(g, 27, 4, '#4a4b5c');
      Pix.rect(g, 31, 5, 3, 3, '#2d3f66');
      Pix.px(g, 32, 5, '#9cc0ff');
      Pix.line(g, 26, 6, 29, 2, M);
      Pix.rect(g, 31, 9, 2, 1, '#131318');
    }
    // pedalín
    Pix.rect(g, 22, 30, 3, 1, '#8a8f9c');
    return c;
  }

  function motoSet(col) {
    return { ride: [0, 1, 2, 3].map(f => moto(col, true, f)), park: moto(col, false, 0) };
  }

  // ---------- Motos del catálogo vistas de perfil (garaje y tienda) ----------
  function spokeWheel(g, cx, cy, rim, front) {
    Pix.disc(g, cx, cy, 7, '#0e0e12');
    Pix.ring(g, cx, cy, 6, 7, '#1d1d25');
    Pix.px(g, cx - 4, cy - 5, '#3c3c48'); Pix.px(g, cx - 5, cy - 4, '#3c3c48');
    Pix.disc(g, cx, cy, 5, '#17171e');
    Pix.ring(g, cx, cy, 4, 5, rim);
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      Pix.line(g, cx, cy, cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, '#7d838f');
    }
    if (front) Pix.ring(g, cx, cy, 1, 2, '#9ea4b0');
    Pix.disc(g, cx, cy, 1, '#c9ced8');
  }

  function classicBike(c) {
    const { c: cv, g } = Pix.canvas(50, 42);
    const M = c.main, L = c.light, D = c.dark, CH = '#c9ced8';
    spokeWheel(g, 11, 34, CH, false); spokeWheel(g, 38, 34, CH, true);
    Pix.line(g, 20, 32, 16, 41, '#3a3b45');
    Pix.line(g, 11, 34, 21, 30, '#2c2d36', 2);
    Pix.rect(g, 4, 25, 12, 1, CH); Pix.px(g, 3, 26, CH);
    Pix.rect(g, 33, 26, 10, 1, CH); Pix.px(g, 43, 27, CH);
    Pix.rect(g, 19, 24, 10, 8, '#8a8f9c');
    for (const y of [25, 27, 29]) Pix.line(g, 20, y, 28, y, '#5a5d6a');
    Pix.disc(g, 22, 29, 2, '#b0b4bc');
    Pix.line(g, 24, 32, 6, 31, CH, 2); Pix.rect(g, 3, 30, 4, 3, '#9ea4b0'); Pix.line(g, 7, 30, 18, 31, '#ffffff');
    Pix.line(g, 18, 22, 31, 22, '#1e1e26');
    Pix.line(g, 35, 15, 38, 34, CH, 2); Pix.line(g, 36, 22, 37, 27, '#3a3b45', 2);
    Pix.rect(g, 14, 22, 6, 5, D);
    Pix.rect(g, 7, 18, 15, 3, '#2a1a12'); Pix.rect(g, 7, 18, 15, 1, '#4a3020');
    Pix.rect(g, 3, 19, 5, 1, CH); Pix.disc(g, 3, 21, 1, '#ff3a3a');
    Pix.poly(g, [[20, 20], [23, 16], [31, 16], [33, 19], [31, 22], [22, 22]], M);
    Pix.line(g, 23, 17, 30, 17, L); Pix.px(g, 27, 19, CH); Pix.px(g, 28, 19, CH);
    Pix.line(g, 22, 21, 31, 21, D);
    Pix.line(g, 31, 11, 36, 12, CH);
    Pix.line(g, 32, 11, 31, 6, '#5a5d6a'); Pix.disc(g, 31, 5, 1, CH);
    Pix.disc(g, 38, 15, 3, CH); Pix.disc(g, 38, 15, 2, '#fff4b8'); Pix.px(g, 39, 14, '#ffffff');
    return cv;
  }

  function sportBike(c) {
    const { c: cv, g } = Pix.canvas(50, 42);
    const M = c.main, L = c.light, D = c.dark, A = c.accent;
    for (const [x, f] of [[11, false], [38, true]]) {
      Pix.disc(g, x, 34, 7, '#0e0e12'); Pix.ring(g, x, 34, 6, 7, '#1d1d25');
      Pix.disc(g, x, 34, 5, '#17171e'); Pix.ring(g, x, 34, 4, 5, A);
      for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; Pix.line(g, x, 34, x + Math.cos(a) * 4, 34 + Math.sin(a) * 4, '#5d616c'); }
      if (f) Pix.ring(g, x, 34, 2, 3, '#8a8f9c');
      Pix.disc(g, x, 34, 1, '#b0b4bc');
    }
    Pix.line(g, 20, 32, 16, 41, '#3a3b45');
    Pix.line(g, 11, 34, 21, 31, '#2c2d36', 2);
    Pix.line(g, 36, 17, 38, 34, '#2a2a32', 2);
    Pix.rect(g, 34, 26, 8, 1, M);
    Pix.poly(g, [[2, 15], [14, 18], [20, 21], [18, 23], [8, 21]], M);
    Pix.line(g, 3, 15, 13, 18, L); Pix.px(g, 1, 15, '#ff3a3a'); Pix.px(g, 2, 16, '#ff3a3a');
    Pix.line(g, 6, 20, 12, 20, A);
    Pix.poly(g, [[12, 18], [21, 19], [21, 21], [14, 21]], '#121216');
    Pix.poly(g, [[20, 19], [23, 15], [30, 14], [33, 16], [27, 21]], M);
    Pix.line(g, 23, 15, 30, 14, L);
    Pix.poly(g, [[26, 14], [36, 11], [43, 15], [44, 21], [39, 27], [30, 31], [21, 31], [21, 25], [27, 20]], M);
    Pix.line(g, 27, 15, 36, 12, L);
    Pix.line(g, 25, 26, 42, 19, A); Pix.line(g, 26, 27, 41, 21, A);
    Pix.line(g, 21, 30, 30, 30, D); Pix.line(g, 30, 30, 39, 26, D);
    Pix.rect(g, 28, 22, 4, 1, '#16161c'); Pix.rect(g, 28, 24, 4, 1, '#16161c');
    Pix.rect(g, 18, 31, 9, 2, '#3a3d48'); Pix.rect(g, 16, 31, 2, 2, '#9ea4b0');
    Pix.poly(g, [[34, 11], [38, 6], [41, 7], [37, 12]], '#4a6a98'); Pix.px(g, 38, 7, '#9cc0ff');
    Pix.rect(g, 40, 15, 3, 1, '#fff4b8'); Pix.px(g, 42, 16, '#ffffff');
    Pix.line(g, 31, 13, 34, 14, '#26262e'); Pix.rect(g, 35, 10, 3, 1, '#121216');
    return cv;
  }

  function adventureBike(c) {
    const { c: cv, g } = Pix.canvas(50, 42);
    const M = c.main, L = c.light, D = c.dark, A = c.accent, GOLD = '#d4a02a';
    spokeWheel(g, 11, 34, GOLD, false); spokeWheel(g, 38, 34, GOLD, true);
    Pix.line(g, 20, 32, 16, 41, '#3a3b45');
    Pix.line(g, 11, 34, 21, 30, '#2c2d36', 2);
    Pix.line(g, 36, 15, 38, 34, GOLD, 2);
    Pix.rect(g, 33, 26, 9, 1, '#16161c');
    Pix.rect(g, 19, 23, 11, 6, '#2c2d36');
    Pix.poly(g, [[19, 31], [30, 31], [32, 28], [19, 28]], '#9ea4b0');
    Pix.line(g, 13, 24, 5, 21, '#9ea4b0', 2); Pix.rect(g, 3, 20, 3, 3, '#5a5f6a');
    Pix.rect(g, 1, 11, 10, 8, '#9ea4b0'); Pix.rect(g, 1, 11, 10, 1, '#c9ced8'); Pix.rect(g, 1, 18, 10, 1, '#5a5f6a');
    Pix.rect(g, 2, 14, 1, 2, '#ff3a3a');
    Pix.poly(g, [[4, 18], [13, 18], [19, 20], [16, 22], [7, 21]], M);
    Pix.rect(g, 10, 16, 12, 2, '#121216');
    Pix.poly(g, [[19, 17], [23, 12], [33, 12], [36, 16], [34, 22], [22, 22]], M);
    Pix.line(g, 23, 13, 32, 13, L);
    Pix.line(g, 22, 19, 34, 15, A); Pix.line(g, 23, 20, 34, 17, A);
    Pix.line(g, 22, 22, 34, 22, D);
    Pix.poly(g, [[35, 9], [40, 10], [42, 15], [38, 18], [35, 16]], '#16161c');
    Pix.poly(g, [[38, 16], [46, 19], [39, 21]], M);
    Pix.rect(g, 39, 12, 2, 3, '#fff4b8'); Pix.px(g, 40, 13, '#ffffff');
    Pix.poly(g, [[35, 9], [38, 2], [40, 3], [38, 10]], '#4a6a98'); Pix.px(g, 38, 4, '#9cc0ff');
    Pix.line(g, 30, 9, 35, 10, '#26262e'); Pix.rect(g, 29, 8, 3, 2, A);
    return cv;
  }

  // ---------- Motos de perfil a doble detalle (garaje y tienda) ----------
  function sideBikeHD(b) {
    const c = bikeColors(b), T = b.type;
    const d = Pix.hd(50, 42);
    const M = c.main, D = c.dark, A = c.accent;
    const ML = shadeHex(M, 1.18, 40), MD = shadeHex(M, 0.68);
    const STEEL = '#9ea4b0', CH = '#d8dce4', BLK = '#16161c', ENG = '#34363f', ENG2 = '#4e515e';
    const ktm = b.brand === 'KTM';
    const wire = T === 'classic' || T === 'adventure';
    const rim = T === 'classic' ? CH : T === 'adventure' ? '#d4a02a' : ktm ? '#f07a12' : (A === '#16161c' ? '#2c2c34' : A);

    const wheel = (cx, cy, front) => {
      d.disc(cx, cy, 7, '#0e0e12');
      d.ring(cx, cy, 6.4, 7, '#24242c');
      d.fline(cx - 5.6, cy - 3.6, cx - 3.4, cy - 5.8, '#44444f');
      d.disc(cx, cy, 5.2, '#141418');
      d.ring(cx, cy, 4.6, 5.2, rim);
      d.fine(cx - 3.5, cy - 4, 1.5, 0.5, shadeHex(rim, 1.2, 50));
      if (wire) {
        for (let k = 0; k < 18; k++) { const a = k * Math.PI / 9; d.fline(cx, cy, cx + Math.cos(a) * 4.6, cy + Math.sin(a) * 4.6, '#a8aeb8'); }
      } else {
        const n = T === 'sport' ? 3 : 5;
        for (let k = 0; k < n; k++) {
          const a = k * Math.PI * 2 / n + 0.4;
          for (const o of [-0.25, 0.25]) d.fline(cx + Math.cos(a + o) * 1.2, cy + Math.sin(a + o) * 1.2, cx + Math.cos(a + o * 0.4) * 4.6, cy + Math.sin(a + o * 0.4) * 4.6, rim);
        }
      }
      if (T === 'classic') {
        d.disc(cx, cy, 2.6, '#8a8f9c'); d.ring(cx, cy, 2, 2.6, '#c9ced8');
      } else {
        d.ring(cx, cy, 2.4, front ? 3.8 : 3.2, '#b8bcc6');
        for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; d.fine(cx + Math.cos(a) * (front ? 3.1 : 2.8) - 0.25, cy + Math.sin(a) * (front ? 3.1 : 2.8) - 0.25, 0.5, 0.5, '#5a5d6a'); }
        if (front) { d.rect(cx + 1.6, cy - 4.4, 2, 2.4, ktm ? '#f07a12' : '#c8282a'); d.fine(cx + 1.8, cy - 4.4, 1.5, 0.5, '#ff9a8a'); }
        else d.rect(cx - 3.6, cy + 1.6, 1.8, 1.8, '#2a2a32');
      }
      d.disc(cx, cy, 1, '#c9ced8'); d.fine(cx - 0.5, cy - 0.5, 0.5, 0.5, '#ffffff');
    };

    wheel(11, 34, false);
    wheel(38, 34, true);
    // caballete
    d.line(20, 32, 16, 41, '#3a3b45', 0.8);
    // basculante, cadena y piñones
    d.line(11, 34, 21.5, 30.5, T === 'classic' ? '#2c2d36' : '#3a3d48', 1.8);
    d.fline(11.5, 32.8, 21.2, 29.6, '#7a7e8a');
    d.disc(11, 34, 2.3, '#5a5d6a'); d.ring(11, 34, 1.8, 2.3, '#8a8f9c');
    d.disc(21.5, 30.8, 1.3, '#7a7e8a');
    d.fline(11, 31.7, 21.5, 29.5, '#8a8f9c'); d.fline(11, 36.3, 21.5, 32.1, '#6a6e7a');
    // amortiguador con resorte
    if (T === 'classic') {
      for (let i = 0; i < 7; i++) d.fline(11.5 + i * 0.35, 21.5 + i * 1.2, 13 + i * 0.35, 22.1 + i * 1.2, CH);
    } else {
      const sp = T === 'adventure' ? '#e8b818' : ktm ? '#f07a12' : '#c8282a';
      for (let i = 0; i < 7; i++) d.fline(16.6 + i * 0.45, 22.5 + i * 0.95, 18.4 + i * 0.45, 22.9 + i * 0.95, sp);
    }

    // motor: bloque, cilindro con aletas, tapa de embrague con pernos
    d.rect(19, 24, 11, 8, ENG);
    d.poly([[24, 24.5], [29.5, 21], [32, 23.5], [29, 27]], ENG2);
    for (let i = 0; i < 5; i++) d.fline(25 + i * 0.9, 24 - i * 0.6, 29 + i * 0.6, 26.5 - i * 0.7, '#6e7280');
    d.disc(23.5, 29, 2.6, ENG2); d.ring(23.5, 29, 2.1, 2.6, '#7a7e8a');
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; d.fine(23.5 + Math.cos(a) * 1.6 - 0.25, 29 + Math.sin(a) * 1.6 - 0.25, 0.5, 0.5, '#a8acb8'); }
    d.fine(22.6, 28, 1, 0.5, '#9a9eaa');
    d.rect(26.5, 30.5, 2.5, 1.5, '#2a2b33');
    d.rect(22, 30, 3, 0.8, '#a8aeb8'); d.fine(21, 30.6, 2, 0.5, '#5a5d6a');

    if (T === 'classic') {
      // clásica: cromo, faro redondo, asiento largo y escape largo
      d.rect(4, 25, 12, 1, CH); d.px(3, 26, CH);
      d.poly([[32.5, 26], [37, 25], [42, 25.5], [43.5, 27], [41.5, 26.5], [34, 27]], CH);
      d.line(24, 32.5, 6, 31, CH, 1.6); d.fline(7, 30.3, 22, 31.7, '#ffffff');
      d.rect(2.5, 29.5, 4, 3, '#9ea4b0'); d.rect(2, 30, 1, 2, '#5a5d6a');
      d.rect(14, 22, 6, 5, D); d.fine(15, 23, 4, 3, MD);
      d.rect(7, 18, 15, 3, '#2a1a12'); d.fine(7, 18, 15, 0.5, '#5a3a26');
      for (let x = 8; x < 21; x += 1.2) d.fine(x, 19.4, 0.6, 0.5, '#4a3020');
      d.rect(2.5, 19, 5.5, 0.8, CH); d.disc(3, 21, 1, '#d81a20'); d.fine(2.6, 20.6, 0.6, 0.5, '#ff9090');
      d.poly([[20, 20], [23, 16], [31, 16], [33, 19], [31, 22], [22, 22]], M);
      d.fline(23.2, 16.5, 30.5, 16.5, ML); d.fine(23, 17, 7, 0.5, ML); d.fine(22, 21.5, 9, 0.5, MD);
      d.rect(26, 18, 2.5, 2, CH); d.fine(26.5, 18.5, 1.5, 1, '#ffffff');
      d.rect(21.5, 19.5, 2.5, 2, '#2a2a32');
      d.line(35, 15, 38, 34, CH, 1.6); d.fine(35.8, 22, 1.5, 4, '#3a3b45');
      d.line(31, 11, 36, 12, CH, 0.6); d.fline(32, 11, 31, 6, '#5a5d6a'); d.disc(31, 5, 1, CH);
      d.disc(38.5, 15, 3, CH); d.disc(38.5, 15, 2.2, '#fff4c8'); d.fine(38.2, 13.8, 1, 1, '#ffffff');
      d.disc(34.5, 12, 1.4, BLK); d.fine(34, 11.5, 1, 0.5, '#e8e8ee');
      d.fine(19, 31.5, 2.5, 0.5, '#c9ced8');
      return d.c;
    }

    // escape (naked / aventura): colector, silenciador con protector térmico
    if (T === 'adventure') {
      d.line(30, 27, 15, 24, STEEL, 1); d.poly([[2, 21.5], [12, 22.5], [12.5, 25.5], [2.5, 25]], '#8a8f9c');
      d.poly([[3.5, 22], [10, 22.8], [10, 24], [3.5, 23.4]], '#c0c4cc');
      d.rect(1.5, 21.5, 1.5, 3.5, '#3a3d48');
    } else if (T !== 'sport') {
      d.line(31, 26.5, 29, 32, STEEL, 1); d.line(29, 32.5, 19, 33, STEEL, 1);
      d.poly([[7, 27.5], [18, 29], [18.5, 32.5], [8, 31.5]], '#8a8f9c');
      d.poly([[9, 28], [16, 29], [16, 30.4], [9, 29.6]], '#c0c4cc');
      for (let x = 10; x < 16; x += 1.5) d.fine(x, 28.7, 0.5, 1.2, '#7a7e8a');
      d.rect(6, 27.3, 2, 4.5, '#3a3d48'); d.disc(6.6, 29.5, 1, '#15151a');
    } else {
      d.rect(17, 31, 9, 2.2, '#3a3d48'); d.rect(15.5, 31, 1.5, 2.2, STEEL); d.fine(17, 31, 9, 0.5, '#6a6e7a');
    }
    // chasis multitubular (KTM / CFMOTO)
    if (ktm || b.brand === 'CFMOTO') {
      const fc = ktm ? '#f07a12' : '#2a2a32';
      d.line(19, 23, 33, 15.5, fc, 0.9); d.line(19, 23, 30, 25, fc, 0.9);
      d.line(23, 21, 26, 25, fc, 0.6); d.line(27, 19, 30, 24, fc, 0.6);
    }

    // colín, stop LED y porta placa
    const tail = T === 'sport' ? [[2, 15], [14, 18], [20, 21], [18, 23], [8, 21]] : [[2, 18], [13, 19], [19, 21], [18, 23], [14, 23], [6, 21]];
    d.poly(tail, M);
    d.fline(tail[0][0] + 1, tail[0][1], tail[1][0], tail[1][1], ML);
    d.fline(7, 21.3, 15, 23, MD);
    d.line(T === 'sport' ? 6 : 6, 20, 12, 21.5, A, 0.5);
    d.rect(1, tail[0][1], 1.8, 1.6, '#d81a20'); d.fine(1.2, tail[0][1], 1.2, 0.5, '#ffb0a0');
    d.line(8, 22, 6, 27, '#1e1e26', 0.6); d.rect(4.5, 26.5, 1, 3, '#e8e4d0'); d.px(7, 23, '#ffa020');
    // asiento con costuras
    d.poly([[11.5, 18], [21.5, 18.8], [22, 20.8], [13.5, 21]], '#141418');
    for (let x = 12.5; x < 21; x += 1.2) d.fine(x, 19.4, 0.6, 0.5, '#3a3a46');
    if (T === 'adventure') {
      d.rect(1, 11, 10, 8, '#9ea4b0'); d.rect(1, 11, 10, 1, '#d8dce4'); d.rect(1, 18, 10, 1, '#5a5f6a');
      d.fine(1.5, 12, 0.5, 6, '#e0e4ea'); d.rect(5, 14, 2, 1, '#2a2b33'); d.rect(1.5, 14.5, 1, 2, '#d81a20');
      d.rect(3, 22, 11, 8, '#8a909c'); d.rect(3, 22, 11, 1, '#c9ced8'); d.fine(3.5, 23, 0.5, 6, '#e0e4ea');
      d.rect(7.5, 25, 2, 1, '#2a2b33');
    }

    // tanque con brillo, sombra, rodillera y gráfico
    d.poly([[20, 19], [24, 14.5], [31.5, 13.5], [34.5, 16.5], [33.5, 21], [23, 23]], M);
    d.poly([[24.2, 15], [31.3, 14], [33.2, 16.2], [25, 16.5]], ML);
    d.fine(24.5, 14.5, 6.5, 0.5, '#ffffff');
    d.poly([[22, 21.5], [33.5, 19.5], [33.5, 21], [23, 23]], MD);
    d.poly([[24.5, 18], [28, 17.5], [27.5, 20.5], [24, 21]], D);
    d.line(25, 19.8, 33.5, 17.2, A, 0.6);
    d.disc(29.5, 14, 0.8, '#c9ced8');
    if (b.id === 'cf250nk') for (const [x, y] of [[29, 17.5], [29, 18.5], [29, 19.5], [29.5, 18], [30, 18.5], [30.5, 17.5], [30.5, 18.5], [30.5, 19.5], [31.5, 17.5], [31.5, 18.5], [31.5, 19.5], [32, 18.5], [32.5, 17.5], [32.5, 19.5]]) d.fine(x, y, 0.5, 0.5, '#ffffff');

    // horquilla, guardabarro y frente según el tipo
    const gold = ktm || T === 'sport' || T === 'adventure';
    d.line(36, 15.5, 38, 33, '#26262e', 1.8);
    d.fline(36.3, 16, 37, 22, gold ? '#d4a02a' : CH); d.fline(36.8, 16, 37.5, 22, gold ? '#f0c84a' : '#ffffff');
    if (T === 'adventure') {
      d.line(30, 22, 33, 30, '#2a2a32', 0.6); d.line(29, 31, 33, 30, '#2a2a32', 0.6);
      d.poly([[19, 31.5], [30, 31.5], [32.5, 28.5], [19, 28.5]], '#a8aeb8'); d.fine(19, 28.5, 13, 0.5, '#e0e4ea');
      d.poly([[35, 9], [40, 10], [42, 15], [38, 18], [35, 16]], BLK);
      d.poly([[38, 16], [46, 19], [39, 21]], M); d.fline(39, 16.5, 45.5, 19, ML);
      d.rect(39, 12, 2, 3, '#fff4c8'); d.fine(39.5, 12.5, 1, 1, '#ffffff');
      d.poly([[35, 9], [38, 2], [40, 3], [38, 10]], 'rgba(90,120,170,0.75)'); d.fline(38, 3.5, 37.5, 8, 'rgba(220,235,255,0.7)');
      d.line(30, 9, 35, 10, '#26262e', 0.6); d.rect(28.5, 8, 3, 2, A);
      d.rect(32.5, 8.2, 2.5, 1.5, '#1a1a20'); d.fine(33, 8.5, 1.5, 0.8, '#5ad1ff');
      d.rect(33, 26.5, 9, 0.8, BLK);
    } else if (T === 'sport') {
      d.poly([[26, 14], [36, 11], [43, 15], [44, 21], [39, 27], [30, 31], [21, 31], [21, 25], [27, 20]], M);
      d.poly([[27, 15], [35.5, 12], [42, 15.5], [36, 16]], ML); d.fine(28, 14.5, 7, 0.5, '#ffffff');
      d.line(25, 26, 42, 19, A, 0.9); d.line(26, 27.5, 41, 21, A, 0.6);
      for (const y of [22, 23.2, 24.4]) d.fine(28, y, 4.5, 0.6, BLK);
      d.line(21, 30, 30, 30, MD, 0.6); d.line(30, 30, 39, 26, MD, 0.6);
      d.poly([[34, 11], [38, 6], [41, 7], [37, 12]], 'rgba(90,120,170,0.8)'); d.fline(38, 7, 36, 10.5, 'rgba(220,235,255,0.7)');
      d.rect(40, 15, 3, 1, '#fff4c8'); d.fine(40.5, 15, 2, 0.5, '#ffffff'); d.px(42, 16, '#ffffff');
      d.line(31, 13, 34, 14, '#26262e', 0.6); d.rect(35, 10, 3, 1, BLK); d.fine(35.5, 10, 2, 0.5, '#5a6a8a');
      d.poly([[33.5, 26.5], [37, 25.4], [42, 25.8], [43.5, 27.2], [41, 26.6], [35, 27.4]], M);
    } else {
      // naked
      d.poly([[30, 18], [35, 17], [37, 22], [34, 26], [29, 25]], M); d.fline(30.5, 18, 34.8, 17.2, ML);
      d.line(31, 21, 36, 20, BLK, 0.8);
      d.rect(31.5, 19, 2.5, 6, '#2a2b33'); for (let y = 19.5; y < 25; y += 0.8) d.fine(31.5, y, 2.5, 0.5, '#4a4d58');
      d.poly([[33.5, 26.5], [37, 25.4], [42, 25.8], [43.5, 27.2], [41, 26.6], [35, 27.4]], M);
      d.poly([[34, 12], [38, 12.5], [41, 16], [40, 19], [35, 18]], BLK);
      d.rect(39, 14.5, 2, 3.5, '#fff4c8'); d.fine(39.5, 14.5, 1, 3, '#ffffff'); d.fine(38.5, 18.5, 1.5, 0.5, '#bfe6ff');
      d.px(37, 19, '#ff9a1a');
      d.rect(33.5, 11, 2.5, 1.5, '#1a1a20'); d.fine(34, 11.4, 1.5, 0.8, '#5ad1ff');
      d.line(31, 13, 35.5, 13.6, '#26262e', 0.8); d.fline(35.5, 13.6, 36.5, 14.5, '#8a8f9c');
      d.fline(33, 13, 32.5, 8.5, '#2a2a32'); d.rect(31.5, 7.5, 3, 1.6, BLK); d.fine(32, 7.8, 2, 0.6, '#5a6a8a');
    }
    d.rect(22, 30, 3, 0.8, '#a8aeb8'); d.fline(25, 30.4, 27, 31.6, '#7a7e8a');
    return d.c;
  }

  function sideBike(b) {
    const c = bikeColors(b);
    if (b.type === 'classic') return classicBike(c);
    if (b.type === 'sport') return sportBike(c);
    if (b.type === 'adventure') return adventureBike(c);
    const cv = moto(c, false, 0, b.id === 'cf250nk');
    const g = cv.getContext('2d');
    Pix.line(g, 31, 22, 36, 21, c.accent);
    Pix.line(g, 4, 19, 11, 20, c.accent);
    return cv;
  }

  function cone() {
    const { c, g } = Pix.canvas(9, 11);
    for (let y = 0; y < 9; y++) {
      const hw = Math.floor(y * 3.5 / 9);
      const col = (y === 3 || y === 4 || y === 7) ? '#f2f2f2' : '#ff7a1a';
      Pix.rect(g, 4 - hw, y, hw * 2 + 1, 1, col);
      Pix.px(g, 4 + hw, y, (y === 3 || y === 4 || y === 7) ? '#c9c9c9' : '#c75510');
    }
    Pix.rect(g, 0, 9, 9, 2, '#26262c');
    Pix.rect(g, 0, 9, 9, 1, '#3a3a44');
    return c;
  }

  function barrier() {
    const { c, g } = Pix.canvas(24, 13);
    const pts = [[4, 0], [20, 0], [21, 6], [24, 13], [0, 13], [3, 6]];
    Pix.poly(g, pts, '#9a9ea8');
    for (let y = 2; y < 6; y++)
      for (let x = 0; x < 24; x++)
        if (Pix.inside(x + 0.5, y + 0.5, pts)) Pix.px(g, x, y, ((x + y) >> 2) & 1 ? '#d01c1f' : '#f2f2f2');
    Pix.rect(g, 4, 0, 16, 1, '#c9ccd4');
    Pix.rect(g, 1, 11, 22, 2, '#6c707a');
    Pix.px(g, 6, 8, '#ffd23f'); Pix.px(g, 17, 8, '#ffd23f');
    return c;
  }

  function pothole() {
    const { c, g } = Pix.canvas(26, 6);
    for (let y = 0; y < 6; y++)
      for (let x = 0; x < 26; x++) {
        const e = ((x + 0.5 - 13) / 13) ** 2 + ((y + 0.5 - 3) / 3) ** 2;
        if (e <= 1) Pix.px(g, x, y, e > 0.6 ? '#3c3d48' : '#0a0a0e');
      }
    for (const [x, y] of [[8, 2], [9, 2], [15, 3], [16, 3], [17, 3]]) Pix.px(g, x, y, '#4a5a8a');
    return c;
  }

  function ramp() {
    const { c, g } = Pix.canvas(34, 13);
    const pts = [[0, 13], [34, 0], [34, 13]];
    Pix.poly(g, pts, '#8a5a2b');
    for (let k = 3; k < 13; k += 3) Pix.line(g, k * 2.6, 13, 34, k, '#6a4320');
    Pix.line(g, 0, 12, 33, 0, '#c08a4a');
    for (let y = 1; y < 13; y++) Pix.rect(g, 31, y, 3, 1, (y >> 1) & 1 ? '#1a1a1f' : '#e8b818');
    Pix.rect(g, 0, 12, 34, 1, '#4a2e14');
    return c;
  }

  function car(body, shade, taxi) {
    const { c, g } = Pix.canvas(46, 21);
    for (const x of [10, 36]) Pix.disc(g, x, 16, 5, '#15151a');
    Pix.poly(g, [[0, 10], [2, 8], [12, 7], [17, 2], [32, 2], [38, 7], [44, 8], [46, 10], [46, 15], [0, 15]], body);
    Pix.rect(g, 0, 14, 46, 1, shade);
    Pix.line(g, 17, 2, 31, 2, '#ffffff');
    Pix.poly(g, [[14, 7], [18, 3], [24, 3], [24, 7]], '#2b3b5e');
    Pix.poly(g, [[26, 3], [31, 3], [36, 7], [26, 7]], '#2b3b5e');
    Pix.px(g, 19, 4, '#7a9ad0'); Pix.px(g, 28, 4, '#7a9ad0');
    Pix.line(g, 25, 7, 25, 14, shade);
    for (const x of [10, 36]) Pix.disc(g, x, 16, 5, '#15151a');
    for (const x of [10, 36]) {
      Pix.disc(g, x, 16, 4, '#0e0e12');
      Pix.disc(g, x, 16, 2, '#7d838f');
      Pix.px(g, x, 16, '#c9ced8');
    }
    if (taxi) {
      for (let x = 4; x < 42; x += 2) Pix.rect(g, x, 10, 1, 1, ((x >> 1) & 1) ? '#111' : '#f4f4f4'),
        Pix.rect(g, x + 1, 10, 1, 1, ((x >> 1) & 1) ? '#f4f4f4' : '#111');
      Pix.rect(g, 21, 0, 6, 2, '#f4f4f4');
      Pix.rect(g, 22, 0, 4, 1, '#d01c1f');
    }
    Pix.rect(g, 0, 9, 2, 2, '#ff3030');
    Pix.rect(g, 44, 9, 2, 2, '#fff4b8');
    return c;
  }

  function combi() {
    const { c, g } = Pix.canvas(60, 27);
    for (const x of [12, 48]) Pix.disc(g, x, 22, 5, '#15151a');
    Pix.poly(g, [[1, 3], [4, 1], [54, 1], [57, 3], [60, 8], [60, 21], [0, 21], [0, 4]], '#e8e4d8');
    Pix.rect(g, 2, 1, 52, 1, '#f8f6f0');
    for (let x = 4; x < 50; x += 8) {
      Pix.rect(g, x, 3, 6, 5, '#2b3b5e');
      Pix.px(g, x + 1, 4, '#7a9ad0');
    }
    Pix.poly(g, [[52, 3], [55, 3], [59, 8], [52, 8]], '#2b3b5e');
    Pix.rect(g, 0, 10, 60, 2, '#1f5fd0');
    Pix.rect(g, 0, 12, 60, 1, '#d01c1f');
    Pix.rect(g, 0, 20, 60, 1, '#a8a49a');
    PixelFont.draw(g, 'CHORRILLOS', 28, 14, '#1f3f8a', 1, 'center');
    Pix.rect(g, 0, 14, 2, 3, '#ff3030');
    Pix.rect(g, 58, 14, 2, 2, '#fff4b8');
    for (const x of [12, 48]) {
      Pix.disc(g, x, 22, 4, '#0e0e12');
      Pix.disc(g, x, 22, 2, '#7d838f');
      Pix.px(g, x, 22, '#c9ced8');
    }
    return c;
  }

  function coin(frame) {
    const { c, g } = Pix.canvas(7, 7);
    const rx = [3.5, 2.5, 1, 2.5][frame];
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const e = ((x + 0.5 - 3.5) / rx) ** 2 + ((y + 0.5 - 3.5) / 3.5) ** 2;
        if (e <= 1) Pix.px(g, x, y, e > 0.55 ? '#b8860b' : (frame === 2 ? '#e0a92a' : '#ffd23f'));
      }
    if (frame !== 2) { Pix.px(g, 3, 2, '#c99a1a'); Pix.px(g, 3, 3, '#c99a1a'); Pix.px(g, 3, 4, '#c99a1a'); Pix.px(g, 2, 1, '#fff3b0'); }
    return c;
  }

  function fuel() {
    const { c, g } = Pix.canvas(9, 11);
    Pix.rect(g, 1, 2, 7, 9, '#d42a2a');
    Pix.rect(g, 7, 2, 1, 9, '#8e1414');
    Pix.rect(g, 1, 2, 1, 9, '#ff6a5a');
    Pix.rect(g, 2, 0, 3, 1, '#8e1414'); Pix.px(g, 2, 1, '#8e1414'); Pix.px(g, 4, 1, '#8e1414');
    Pix.rect(g, 6, 0, 2, 2, '#ffd23f');
    Pix.line(g, 2, 4, 6, 9, '#ff8a7a'); Pix.line(g, 6, 4, 2, 9, '#ff8a7a');
    return c;
  }

  function helmetIcon(on) {
    const { c, g } = Pix.canvas(8, 7);
    Pix.disc(g, 3, 3, 3, on ? '#e8343a' : '#3a3b48');
    Pix.rect(g, 4, 2, 3, 2, on ? '#2d3f66' : '#2a2b34');
    if (on) Pix.px(g, 1, 1, '#ffb0a8');
    Pix.rect(g, 0, 6, 7, 1, on ? '#8a1015' : '#26262e');
    return c;
  }

  function fuelIcon() {
    const { c, g } = Pix.canvas(6, 8);
    Pix.rect(g, 0, 1, 6, 7, '#d42a2a');
    Pix.rect(g, 1, 0, 3, 1, '#8e1414');
    Pix.px(g, 5, 0, '#ffd23f');
    Pix.line(g, 1, 3, 4, 6, '#ff8a7a');
    return c;
  }

  function sign(lines, post = 30) {
    const lw = Math.max(...lines.map(l => PixelFont.width(l)));
    const bw = lw + 8, bh = lines.length * 7 + 4;
    const { c, g } = Pix.canvas(bw, bh + post);
    Pix.rect(g, 4, bh, 2, post, '#6b6f7a'); Pix.rect(g, bw - 6, bh, 2, post, '#6b6f7a');
    Pix.rect(g, 0, 0, bw, bh, '#e8eef0');
    Pix.rect(g, 1, 1, bw - 2, bh - 2, '#0f6b3a');
    lines.forEach((l, i) => PixelFont.draw(g, l, bw / 2, 3 + i * 7, '#f4f4f4', 1, 'center'));
    return c;
  }

  function chevron() {
    const { c, g } = Pix.canvas(10, 26);
    Pix.rect(g, 4, 10, 2, 16, '#6b6f7a');
    Pix.rect(g, 0, 0, 10, 10, '#1a1a1f');
    Pix.rect(g, 1, 1, 8, 8, '#e8b818');
    Pix.line(g, 3, 2, 6, 5, '#1a1a1f', 2); Pix.line(g, 6, 5, 3, 8, '#1a1a1f', 2);
    return c;
  }

  function turboButton() {
    const { c, g } = Pix.canvas(40, 40);
    Pix.disc(g, 20, 20, 18, 'rgba(10,14,34,0.55)');
    Pix.ring(g, 20, 20, 16, 18, 'rgba(90,209,255,0.8)');
    PixelFont.draw(g, 'TURBO', 20, 17, '#bff3ff', 1, 'center');
    return c;
  }

  function build() {
    return {
      cone: cone(), barrier: barrier(), pothole: pothole(), ramp: ramp(),
      cars: [car('#f2c230', '#b8901f', true), car('#e9ecf2', '#9ea4b0', false), car('#b3161b', '#6e0c10', false), car('#f2c230', '#b8901f', true)],
      combi: combi(),
      coin: [0, 1, 2, 3].map(coin), fuel: fuel(),
      helmetOn: helmetIcon(true), helmetOff: helmetIcon(false), fuelIcon: fuelIcon(),
      signLima: sign(['LIMA, PERÚ >', 'COSTA VERDE'], 52), chevron: chevron(), turbo: turboButton(),
    };
  }

  return { motoSet, sideBike, sideBikeHD, build, sign, chevron };
})();
