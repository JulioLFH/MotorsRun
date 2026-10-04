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

  return { motoSet, sideBike, build, sign, chevron };
})();
