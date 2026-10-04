'use strict';
// Sprites para la vista en tercera persona: moto de espaldas, tráfico, playa, acantilados e ítems.
const Sprites3D = (() => {
  // ---------- Moto vista desde atrás (48x60) ----------
  function bikeFrame(col, f) {
    const { c, g } = Pix.canvas(48, 60);
    const M = col.main, L = col.light, D = col.dark;
    Pix.rect(g, 15, 38, 2, 10, '#2c2d36'); Pix.rect(g, 31, 38, 2, 10, '#2c2d36');
    // llanta trasera
    Pix.rect(g, 19, 41, 10, 18, '#111115'); Pix.rect(g, 20, 40, 8, 20, '#111115');
    for (let y = 41 + f; y < 59; y += 3) Pix.rect(g, 21, y, 6, 1, '#2c2c36');
    Pix.rect(g, 19, 43, 1, 13, '#2a2a33');
    // escape
    Pix.poly(g, [[29, 39], [36, 37], [38, 44], [31, 47]], '#9ea4b0');
    Pix.line(g, 30, 40, 36, 38, '#dfe3ea');
    Pix.disc(g, 36, 41, 2, '#3a3d48'); Pix.px(g, 36, 41, '#15151a');
    Pix.rect(g, 18, 36, 12, 4, '#1a1a20');
    // laterales del tanque
    Pix.rect(g, 10, 22, 4, 7, M); Pix.rect(g, 34, 22, 4, 7, M);
    Pix.px(g, 10, 22, L); Pix.px(g, 37, 22, L);
    // colín y stop
    Pix.poly(g, [[13, 29], [35, 29], [32, 37], [16, 37]], M);
    Pix.rect(g, 14, 29, 20, 1, L);
    Pix.rect(g, 16, 36, 16, 1, D);
    Pix.rect(g, 18, 32, 12, 2, '#ff3030'); Pix.rect(g, 21, 32, 6, 1, '#ffb0a0');
    Pix.px(g, 14, 33, '#ffa020'); Pix.px(g, 33, 33, '#ffa020');
    // placa
    Pix.rect(g, 19, 38, 10, 4, '#e8e4d0'); Pix.rect(g, 20, 39, 8, 1, '#5a5040'); Pix.rect(g, 21, 40, 2, 1, '#5a5040'); Pix.rect(g, 25, 40, 2, 1, '#5a5040');
    Pix.rect(g, 17, 27, 14, 2, '#121216');
    // piernas y botas
    Pix.poly(g, [[12, 21], [19, 24], [17, 31], [10, 29]], '#23232c');
    Pix.poly(g, [[36, 21], [29, 24], [31, 31], [38, 29]], '#23232c');
    Pix.rect(g, 8, 28, 5, 7, '#23232c'); Pix.rect(g, 35, 28, 5, 7, '#23232c');
    Pix.rect(g, 7, 34, 7, 3, '#0b0b0f'); Pix.rect(g, 34, 34, 7, 3, '#0b0b0f');
    Pix.px(g, 11, 26, M); Pix.px(g, 36, 26, M);
    // espalda con casaca
    Pix.poly(g, [[14, 8], [34, 8], [37, 14], [33, 26], [15, 26], [11, 14]], '#17171d');
    Pix.rect(g, 19, 12, 10, 11, '#202029'); Pix.rect(g, 19, 12, 10, 1, '#2e2e3a');
    Pix.line(g, 13, 12, 15, 25, M, 2); Pix.line(g, 35, 12, 33, 25, M, 2);
    Pix.rect(g, 16, 24, 16, 2, '#0f0f13');
    // brazos, espejos y guantes
    Pix.line(g, 13, 11, 6, 16, '#1d1d24', 3); Pix.line(g, 35, 11, 42, 16, '#1d1d24', 3);
    Pix.px(g, 9, 13, M); Pix.px(g, 39, 13, M);
    Pix.line(g, 5, 15, 3, 9, '#2a2a32'); Pix.rect(g, 1, 7, 4, 3, '#121216'); Pix.px(g, 2, 8, '#5a6a8a');
    Pix.line(g, 43, 15, 45, 9, '#2a2a32'); Pix.rect(g, 43, 7, 4, 3, '#121216'); Pix.px(g, 45, 8, '#5a6a8a');
    Pix.rect(g, 3, 15, 4, 3, '#0b0b0f'); Pix.rect(g, 41, 15, 4, 3, '#0b0b0f');
    // casco
    Pix.rect(g, 20, 11, 8, 3, '#0f0f13');
    Pix.disc(g, 24, 6, 6, '#131318');
    Pix.rect(g, 23, 0, 2, 12, M);
    Pix.px(g, 20, 2, '#4a4b5c'); Pix.px(g, 21, 1, '#4a4b5c'); Pix.px(g, 19, 3, '#4a4b5c');
    return c;
  }
  const bike = col => [0, 1].map(f => bikeFrame(col, f));

  // ---------- Tráfico (vistos desde atrás) ----------
  function taxi() {
    const { c, g } = Pix.canvas(48, 34);
    Pix.rect(g, 4, 28, 9, 6, '#0e0e12'); Pix.rect(g, 35, 28, 9, 6, '#0e0e12');
    Pix.poly(g, [[8, 13], [12, 4], [36, 4], [40, 13]], '#f2c230');
    Pix.poly(g, [[11, 12], [14, 6], [34, 6], [37, 12]], '#2b3b5e');
    Pix.line(g, 16, 7, 20, 7, '#7a9ad0');
    Pix.rect(g, 2, 13, 44, 15, '#f2c230');
    Pix.rect(g, 2, 13, 44, 1, '#ffe07a');
    Pix.rect(g, 16, 1, 16, 4, '#f4f4f4'); Pix.rect(g, 17, 2, 14, 1, '#d01c1f');
    for (let x = 2; x < 46; x += 2) { Pix.rect(g, x, 20, 1, 1, (x >> 1) % 2 ? '#111' : '#f4f4f4'); Pix.rect(g, x + 1, 20, 1, 1, (x >> 1) % 2 ? '#f4f4f4' : '#111'); Pix.rect(g, x, 21, 1, 1, (x >> 1) % 2 ? '#f4f4f4' : '#111'); Pix.rect(g, x + 1, 21, 1, 1, (x >> 1) % 2 ? '#111' : '#f4f4f4'); }
    Pix.rect(g, 3, 15, 7, 4, '#c81a1f'); Pix.rect(g, 38, 15, 7, 4, '#c81a1f');
    Pix.rect(g, 4, 16, 3, 1, '#ff8a80'); Pix.rect(g, 39, 16, 3, 1, '#ff8a80');
    Pix.rect(g, 12, 15, 24, 1, '#b8901f');
    Pix.rect(g, 19, 22, 10, 5, '#e8e4d0'); Pix.rect(g, 20, 24, 8, 1, '#4a4030');
    Pix.rect(g, 1, 26, 46, 3, '#c9ced8'); Pix.rect(g, 1, 28, 46, 1, '#7d838f');
    return { spr: c, w: 420, lights: [[6.5 / 48, 17 / 34], [41.5 / 48, 17 / 34]] };
  }

  function beetle(body, shade) {
    const { c, g } = Pix.canvas(44, 32);
    Pix.rect(g, 4, 26, 8, 6, '#0e0e12'); Pix.rect(g, 32, 26, 8, 6, '#0e0e12');
    Pix.poly(g, [[3, 28], [1, 19], [4, 11], [10, 5], [16, 1], [28, 1], [34, 5], [40, 11], [43, 19], [41, 28]], body);
    Pix.poly(g, [[14, 9], [17, 4], [27, 4], [30, 9]], '#2b3b5e');
    Pix.px(g, 18, 5, '#7a9ad0');
    Pix.rect(g, 4, 11, 36, 1, shade);
    for (let y = 14; y < 21; y += 2) Pix.rect(g, 17, y, 10, 1, shade);
    Pix.disc(g, 7, 19, 2, '#c81a1f'); Pix.disc(g, 37, 19, 2, '#c81a1f');
    Pix.px(g, 6, 18, '#ff8a80'); Pix.px(g, 36, 18, '#ff8a80');
    Pix.rect(g, 17, 22, 10, 4, '#e8e4d0');
    Pix.rect(g, 1, 25, 42, 2, '#c9ced8');
    Pix.px(g, 10, 4, 'rgba(255,255,255,0.6)'); Pix.px(g, 11, 4, 'rgba(255,255,255,0.6)');
    return { spr: c, w: 380, lights: [[7.5 / 44, 19.5 / 32], [37.5 / 44, 19.5 / 32]] };
  }

  function combi() {
    const { c, g } = Pix.canvas(50, 48);
    Pix.rect(g, 5, 41, 10, 7, '#0e0e12'); Pix.rect(g, 35, 41, 10, 7, '#0e0e12');
    Pix.poly(g, [[2, 42], [2, 6], [5, 2], [45, 2], [48, 6], [48, 42]], '#e8e4d8');
    Pix.rect(g, 4, 3, 42, 8, '#ffd23f'); Pix.rect(g, 4, 10, 42, 1, '#b8901f');
    PixelFont.draw(g, 'CHORRILLOS', 25, 5, '#7a1015', 1, 'center');
    Pix.rect(g, 5, 13, 18, 11, '#2b3b5e'); Pix.rect(g, 27, 13, 18, 11, '#2b3b5e');
    Pix.px(g, 7, 14, '#7a9ad0'); Pix.px(g, 29, 14, '#7a9ad0');
    Pix.rect(g, 2, 26, 46, 4, '#1f5fd0'); Pix.rect(g, 2, 30, 46, 1, '#d01c1f');
    Pix.rect(g, 3, 32, 4, 6, '#c81a1f'); Pix.rect(g, 43, 32, 4, 6, '#c81a1f');
    Pix.rect(g, 20, 33, 10, 5, '#e8e4d0');
    Pix.rect(g, 1, 39, 48, 3, '#7d838f');
    for (let y = 13; y < 38; y += 3) Pix.rect(g, 46, y, 2, 1, '#9ea4b0');
    return { spr: c, w: 460, lights: [[5 / 50, 35 / 48], [45 / 50, 35 / 48]] };
  }

  function pickup() {
    const { c, g } = Pix.canvas(48, 34);
    Pix.rect(g, 4, 28, 9, 6, '#0e0e12'); Pix.rect(g, 35, 28, 9, 6, '#0e0e12');
    Pix.poly(g, [[10, 12], [13, 3], [35, 3], [38, 12]], '#a8141a');
    Pix.rect(g, 14, 5, 20, 6, '#2b3b5e');
    for (const [x, col] of [[6, '#a0703a'], [16, '#b88a4a'], [28, '#a0703a'], [37, '#8a5a2b']]) { Pix.rect(g, x, 8, 9, 6, col); Pix.rect(g, x, 8, 9, 1, '#d0a060'); }
    Pix.disc(g, 13, 7, 2, '#e07b39'); Pix.disc(g, 34, 7, 2, '#3f9a3a');
    Pix.rect(g, 2, 13, 44, 14, '#b3161b'); Pix.rect(g, 2, 13, 44, 1, '#e04a4a');
    Pix.rect(g, 6, 17, 36, 1, '#7a0f12');
    Pix.rect(g, 3, 15, 4, 6, '#ff3030'); Pix.rect(g, 41, 15, 4, 6, '#ff3030');
    Pix.rect(g, 19, 21, 10, 5, '#e8e4d0');
    Pix.rect(g, 1, 26, 46, 3, '#c9ced8');
    return { spr: c, w: 430, lights: [[5 / 48, 18 / 34], [43 / 48, 18 / 34]] };
  }

  // ---------- Playa y costa ----------
  function palm(seed) {
    const { c, g } = Pix.canvas(44, 92);
    const lean = seed % 2 ? 1 : -1;
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, x = 22 + lean * (6 * t + 3 * Math.sin(t * 3)), y = 91 - 68 * t;
      Pix.rect(g, Math.round(x) - 1, Math.round(y), 3, 4, i % 3 ? '#6a4a2e' : '#4e3420');
    }
    const cx = Math.round(22 + lean * 8.4), cy = 22;
    for (const a of [-170, -140, -110, -75, -40, -10, 20]) {
      const r = a * Math.PI / 180, len = 15 + (Math.abs(a + 75) < 40 ? -3 : 3);
      let px = cx, py = cy;
      for (let k = 1; k <= len; k++) {
        const nx = cx + Math.cos(r) * k, ny = cy + Math.sin(r) * k + k * k * 0.05;
        Pix.line(g, px, py, nx, ny, k > len - 4 ? '#3f8a4a' : '#1f5a3a', 2);
        if (k % 3 === 0) Pix.px(g, Math.round(nx), Math.round(ny) + 2, '#174a30');
        px = nx; py = ny;
      }
    }
    Pix.disc(g, cx - 1, cy + 2, 1, '#5a3a1a'); Pix.disc(g, cx + 2, cy + 3, 1, '#5a3a1a');
    return c;
  }

  function umbrella(a, b) {
    const { c, g } = Pix.canvas(36, 40);
    Pix.line(g, 18, 12, 18, 39, '#d8d0c0');
    for (let x = 2; x < 34; x++) {
      const h = Math.round(10 - (x - 18) * (x - 18) / 28);
      Pix.rect(g, x, 12 - h, 1, h + 1, ((x - 2) >> 2) % 2 ? a : b);
    }
    for (let x = 2; x < 34; x += 4) Pix.px(g, x + 1, 13, ((x - 2) >> 2) % 2 ? a : b);
    Pix.rect(g, 4, 36, 12, 2, '#3a7ab0'); Pix.rect(g, 4, 34, 2, 2, '#3a7ab0');
    return c;
  }

  function lifeguard() {
    const { c, g } = Pix.canvas(36, 58);
    Pix.line(g, 6, 57, 10, 28, '#8a6a44', 2); Pix.line(g, 30, 57, 26, 28, '#8a6a44', 2);
    Pix.line(g, 8, 44, 28, 34, '#6a4e30'); Pix.line(g, 28, 44, 8, 34, '#6a4e30');
    Pix.rect(g, 5, 26, 26, 3, '#a0805a');
    Pix.rect(g, 8, 13, 20, 13, '#c8323a');
    for (const y of [16, 20, 24]) Pix.rect(g, 8, y, 20, 1, '#f4ead0');
    Pix.rect(g, 11, 15, 14, 5, '#2b3b5e');
    Pix.poly(g, [[5, 13], [18, 6], [31, 13]], '#f4ead0');
    Pix.line(g, 18, 0, 18, 7, '#5a5d6a');
    Pix.rect(g, 19, 0, 2, 4, '#d01c1f'); Pix.rect(g, 21, 0, 2, 4, '#f4f4f4'); Pix.rect(g, 23, 0, 2, 4, '#d01c1f');
    return c;
  }

  function surf() {
    const { c, g } = Pix.canvas(30, 40);
    Pix.rect(g, 2, 30, 26, 2, '#6a4e30'); Pix.rect(g, 3, 32, 2, 8, '#6a4e30'); Pix.rect(g, 25, 32, 2, 8, '#6a4e30');
    for (const [x, col, st] of [[6, '#2aa8a8', '#f4ead0'], [14, '#ffd23f', '#d01c1f'], [22, '#e8343a', '#f4ead0']]) {
      for (let y = 0; y < 38; y++) {
        const hw = Math.round(3.2 * Math.sin(Math.PI * (y + 1) / 39));
        if (hw > 0) Pix.rect(g, x - hw, y, hw * 2, 1, col);
      }
      Pix.rect(g, x - 1, 4, 1, 30, st);
    }
    return c;
  }

  function stall() {
    const { c, g } = Pix.canvas(56, 46);
    Pix.rect(g, 4, 24, 48, 16, '#3a7ab0'); Pix.rect(g, 4, 31, 48, 2, '#f4ead0');
    Pix.disc(g, 12, 41, 4, '#1a1a20'); Pix.disc(g, 44, 41, 4, '#1a1a20');
    Pix.line(g, 6, 12, 6, 24, '#d8d0c0'); Pix.line(g, 50, 12, 50, 24, '#d8d0c0');
    for (let x = 2; x < 54; x++) Pix.rect(g, x, 10, 1, 5, ((x - 2) >> 2) % 2 ? '#d83a3a' : '#f4ead0');
    for (let x = 2; x < 54; x += 4) Pix.px(g, x + 1, 15, ((x - 2) >> 2) % 2 ? '#d83a3a' : '#f4ead0');
    Pix.rect(g, 9, 0, 38, 9, '#f0e2c0'); Pix.rect(g, 9, 0, 38, 1, '#b8901f'); Pix.rect(g, 9, 8, 38, 1, '#b8901f');
    PixelFont.draw(g, 'CEVICHE', 28, 2, '#c8323a', 1, 'center');
    Pix.rect(g, 14, 20, 6, 4, '#f4f4f4'); Pix.rect(g, 24, 19, 8, 5, '#e8b818'); Pix.rect(g, 36, 20, 6, 4, '#7a3a8a');
    return c;
  }

  function lamp() {
    const { c, g } = Pix.canvas(40, 96);
    Pix.rect(g, 34, 6, 3, 90, '#4a4d58'); Pix.rect(g, 34, 6, 1, 90, '#6a6d7a');
    Pix.rect(g, 33, 88, 5, 8, '#3a3d48');
    Pix.rect(g, 8, 4, 28, 2, '#4a4d58');
    Pix.rect(g, 4, 5, 10, 3, '#2a2b33'); Pix.rect(g, 5, 8, 8, 1, '#ffe0a0');
    return c;
  }

  function cliff(seed) {
    const { c, g } = Pix.canvas(96, 80);
    const R = rng(seed);
    const tops = [];
    for (let x = 0; x < 96; x++) tops[x] = Math.round(8 + 5 * Math.sin(x * 0.11 + seed) + 3 * Math.sin(x * 0.37 + seed * 2));
    for (let x = 0; x < 96; x++) {
      Pix.rect(g, x, tops[x], 1, 80 - tops[x], '#9a7a52');
      Pix.px(g, x, tops[x], '#b8946a');
    }
    for (let y = 18; y < 80; y += 7) for (let x = 0; x < 96; x++) if (y > tops[x] + 3 && Math.sin(x * 0.2 + y) > -0.3) Pix.px(g, x, y + (Math.sin(x * 0.15) > 0 ? 1 : 0), '#7a5e3e');
    for (let i = 0; i < 26; i++) {
      const x = R() * 96 | 0, y = tops[x] + (R() < 0.5 ? 1 : (R() * 50 | 0));
      Pix.disc(g, x, y, 1 + (R() * 3 | 0), R() < 0.5 ? '#4f7d3a' : '#3f6a30');
    }
    for (let x = 0; x < 96; x += 2) Pix.px(g, x, tops[x] - 1, '#5f9a44');
    return c;
  }

  function rock() {
    const { c, g } = Pix.canvas(30, 18);
    Pix.poly(g, [[1, 18], [3, 8], [10, 2], [20, 3], [27, 9], [29, 18]], '#7a6e66');
    Pix.poly(g, [[5, 9], [10, 4], [18, 4], [14, 10]], '#9a8e84');
    Pix.rect(g, 1, 16, 28, 2, '#5a504a');
    return c;
  }

  function bush() {
    const { c, g } = Pix.canvas(28, 16);
    for (const [x, y, r] of [[7, 10, 5], [14, 8, 7], [21, 10, 5]]) Pix.disc(g, x, y, r, '#3f6a30');
    for (const [x, y] of [[11, 4], [15, 3], [18, 6], [6, 7]]) Pix.px(g, x, y, '#6aa04a');
    Pix.rect(g, 2, 15, 24, 1, '#2a4a20');
    return c;
  }

  function billboard(lines) {
    const { c, g } = Pix.canvas(84, 60);
    Pix.rect(g, 14, 30, 4, 30, '#6a4e30'); Pix.rect(g, 66, 30, 4, 30, '#6a4e30');
    Pix.rect(g, 0, 0, 84, 34, '#7a1015');
    Pix.rect(g, 2, 2, 80, 30, '#f0e2c0');
    for (let x = 4; x < 80; x += 6) Pix.px(g, x, 3, '#c8323a');
    PixelFont.draw(g, lines[0], 42, 8, '#c8323a', 1, 'center');
    PixelFont.draw(g, lines[1], 42, 17, '#1f3f8a', 1, 'center');
    Pix.disc(g, 10, 25, 3, '#f4a259'); Pix.rect(g, 6, 27, 9, 2, '#3a4f8a');
    return c;
  }

  // ---------- Ítems ----------
  function coin(frame) {
    const { c, g } = Pix.canvas(16, 16);
    const rx = [8, 5.5, 2, 5.5][frame];
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const e = ((x + 0.5 - 8) / rx) ** 2 + ((y + 0.5 - 8) / 8) ** 2;
        if (e <= 1) Pix.px(g, x, y, e > 0.62 ? '#b8860b' : (frame === 2 ? '#e0a92a' : '#ffd23f'));
      }
    if (frame === 0) PixelFont.draw(g, 'S/', 8, 6, '#b8860b', 1, 'center');
    if (frame !== 2) Pix.px(g, 5, 3, '#fff3b0');
    return c;
  }

  function fuel() {
    const { c, g } = Pix.canvas(14, 18);
    Pix.rect(g, 1, 3, 12, 15, '#d42a2a'); Pix.rect(g, 12, 3, 1, 15, '#8e1414'); Pix.rect(g, 1, 3, 1, 15, '#ff6a5a');
    Pix.rect(g, 3, 0, 5, 1, '#8e1414'); Pix.px(g, 3, 1, '#8e1414'); Pix.px(g, 7, 1, '#8e1414');
    Pix.rect(g, 10, 0, 3, 3, '#ffd23f');
    Pix.line(g, 3, 6, 10, 15, '#ff8a7a'); Pix.line(g, 10, 6, 3, 15, '#ff8a7a');
    return c;
  }

  function nitro() {
    const { c, g } = Pix.canvas(12, 20);
    Pix.rect(g, 4, 0, 4, 3, '#c9ced8');
    Pix.rect(g, 1, 3, 10, 17, '#1f5fd0'); Pix.rect(g, 1, 3, 1, 17, '#5a9bff'); Pix.rect(g, 10, 3, 1, 17, '#0f2f70');
    Pix.rect(g, 2, 8, 8, 7, '#f4f4f4');
    PixelFont.draw(g, 'N', 6, 9, '#1f5fd0', 1, 'center');
    return c;
  }

  function glow(r, gc, b, a) {
    const { c, g } = Pix.canvas(32, 32);
    for (const [rad, al] of [[15, 0.08], [12, 0.1], [9, 0.14], [6, 0.2], [3, 0.35]]) Pix.disc(g, 16, 16, rad, `rgba(${r},${gc},${b},${al * a})`);
    return c;
  }

  function rng(s) { return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

  function build() {
    return {
      cars: [taxi(), taxi(), beetle('#7fb3c8', '#4f8398'), beetle('#f0e2c0', '#b8a888'), beetle('#e07b39', '#a04a1a'), combi(), pickup()],
      palms: [palm(1), palm(2), palm(3)],
      umbrellas: [umbrella('#d83a3a', '#f4ead0'), umbrella('#2aa8a8', '#f4ead0'), umbrella('#ffd23f', '#e07b39')],
      lifeguard: lifeguard(), surf: surf(), stall: stall(), lamp: lamp(),
      cliffs: [cliff(3), cliff(9), cliff(17)], rock: rock(), bush: bush(),
      billboards: [['CHICHA MORADA', '¡BIEN HELADA!'], ['VISITE', 'MIRAFLORES'], ['RIDE SAFE', 'USA CASCO'], ['DISCIPLINA HOY', 'LIBERTAD MAÑANA'], ['SUEÑA·PLANIFICA', 'TRABAJA·LOGRA']].map(billboard),
      signs: [['SAN MIGUEL'], ['MAGDALENA'], ['SAN ISIDRO'], ['MIRAFLORES'], ['BARRANCO'], ['CHORRILLOS'], ['LIMA, PERÚ >', 'COSTA VERDE']].map(l => Sprites.sign(l, 22)),
      coin: [0, 1, 2, 3].map(coin), fuel: fuel(), nitro: nitro(),
      glowWarm: glow(255, 200, 120, 1), glowRed: glow(255, 40, 40, 1), glowWhite: glow(255, 240, 200, 1),
    };
  }

  return { build, bike };
})();
