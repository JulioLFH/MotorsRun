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

  // ---------- Motos del catálogo vistas desde atrás ----------
  // Piloto (de espaldas). yo desplaza el torso: deportiva va agachado, clásica erguido.
  function drawRider(g, type, M, A, ox = 0, oy = 0) {
    const yo = (type === 'sport' ? 4 : type === 'classic' ? -1 : 0) + oy;
    const jacket = type === 'classic' ? '#4a3020' : '#17171d';
    const back = type === 'classic' ? '#5a3a26' : '#202029';
    const P = (x, y) => [x + ox, y + oy];
    Pix.poly(g, [P(12, 21), P(19, 24), P(17, 31), P(10, 29)], '#23232c');
    Pix.poly(g, [P(36, 21), P(29, 24), P(31, 31), P(38, 29)], '#23232c');
    Pix.rect(g, 8 + ox, 28 + oy, 5, 7, '#23232c'); Pix.rect(g, 35 + ox, 28 + oy, 5, 7, '#23232c');
    Pix.rect(g, 7 + ox, 34 + oy, 7, 3, '#0b0b0f'); Pix.rect(g, 34 + ox, 34 + oy, 7, 3, '#0b0b0f');
    const wide = type === 'sport' ? 2 : 0;
    Pix.poly(g, [[14 - wide + ox, 8 + yo], [34 + wide + ox, 8 + yo], [37 + wide + ox, 14 + yo], [33 + ox, 26 + oy], [15 + ox, 26 + oy], [11 - wide + ox, 14 + yo]], jacket);
    Pix.rect(g, 19 + ox, 12 + yo, 10, Math.max(4, 11 - (yo - oy)), back);
    if (type === 'sport') Pix.rect(g, 20 + ox, 12 + yo, 8, 3, A);
    Pix.line(g, 13 + ox, 12 + yo, 15 + ox, 25 + oy, type === 'classic' ? '#3a2416' : M, 2);
    Pix.line(g, 35 + ox, 12 + yo, 33 + ox, 25 + oy, type === 'classic' ? '#3a2416' : M, 2);
    Pix.rect(g, 16 + ox, 24 + oy, 16, 2, '#0f0f13');
    const gy = (type === 'sport' ? 19 : 16) + oy;
    Pix.line(g, 13 + ox, 11 + yo, 6 + ox, gy, jacket === '#17171d' ? '#1d1d24' : '#3a2416', 3);
    Pix.line(g, 35 + ox, 11 + yo, 42 + ox, gy, jacket === '#17171d' ? '#1d1d24' : '#3a2416', 3);
    Pix.rect(g, 3 + ox, gy - 1, 4, 3, '#0b0b0f'); Pix.rect(g, 41 + ox, gy - 1, 4, 3, '#0b0b0f');
    Pix.rect(g, 20 + ox, 11 + yo, 8, 3, '#0f0f13');
    Pix.disc(g, 24 + ox, 6 + yo, 6, type === 'classic' ? '#e8e4d8' : '#131318');
    Pix.rect(g, 23 + ox, yo, 2, 12, type === 'classic' ? '#c8323a' : M);
    if (type === 'adventure') Pix.rect(g, 18 + ox, yo, 12, 2, A);
    Pix.px(g, 20 + ox, 2 + yo, '#4a4b5c'); Pix.px(g, 21 + ox, 1 + yo, '#4a4b5c');
    return gy;
  }

  function rearBike(b, f, rider) {
    const col = bikeColors(b);
    const { c, g } = Pix.canvas(48, 60);
    const M = col.main, L = col.light, D = col.dark, A = col.accent, T = b.type;
    if (T === 'adventure') {
      for (const x of [1, 38]) {
        Pix.rect(g, x, 28, 9, 13, '#9ea4b0'); Pix.rect(g, x, 28, 9, 1, '#c9ced8'); Pix.rect(g, x, 40, 9, 1, '#5a5f6a');
        Pix.rect(g, x + 1, 37, 2, 1, '#ff3030');
      }
    }
    Pix.rect(g, 15, 38, 2, 10, '#2c2d36'); Pix.rect(g, 31, 38, 2, 10, '#2c2d36');
    const tw = T === 'classic' ? 8 : T === 'sport' ? 11 : 10, tx = 24 - tw / 2;
    Pix.rect(g, tx, 41, tw, 18, '#111115'); Pix.rect(g, tx + 1, 40, tw - 2, 20, '#111115');
    for (let y = 41 + f; y < 59; y += 3) Pix.rect(g, tx + 2, y, tw - 4, 1, '#2c2c36');
    if (T === 'classic') {
      Pix.rect(g, 30, 41, 10, 3, '#c9ced8'); Pix.rect(g, 38, 41, 2, 3, '#5a5f6a');
    } else if (T === 'adventure') {
      Pix.poly(g, [[29, 31], [35, 29], [37, 35], [31, 37]], '#9ea4b0'); Pix.disc(g, 35, 32, 1, '#3a3d48');
    } else {
      Pix.poly(g, [[29, 39], [36, 37], [38, 44], [31, 47]], '#9ea4b0');
      Pix.line(g, 30, 40, 36, 38, '#dfe3ea'); Pix.disc(g, 36, 41, 2, '#3a3d48'); Pix.px(g, 36, 41, '#15151a');
    }
    // carenado / tanque visto a los costados
    if (T === 'sport') { Pix.rect(g, 6, 19, 7, 11, M); Pix.rect(g, 35, 19, 7, 11, M); Pix.line(g, 7, 22, 11, 28, A); Pix.line(g, 40, 22, 36, 28, A); }
    else if (T === 'adventure') { Pix.rect(g, 8, 19, 6, 10, M); Pix.rect(g, 34, 19, 6, 10, M); Pix.rect(g, 8, 23, 6, 1, A); Pix.rect(g, 34, 23, 6, 1, A); }
    else if (T === 'classic') { Pix.rect(g, 11, 22, 3, 5, M); Pix.rect(g, 34, 22, 3, 5, M); }
    else { Pix.rect(g, 10, 22, 4, 7, M); Pix.rect(g, 34, 22, 4, 7, M); Pix.px(g, 10, 22, L); Pix.px(g, 37, 22, L); }

    // colín y luz trasera
    if (T === 'classic') {
      Pix.rect(g, 14, 26, 20, 3, '#2a1a12');
      Pix.rect(g, 15, 29, 18, 2, '#c9ced8');
      Pix.poly(g, [[17, 31], [31, 31], [30, 40], [18, 40]], '#c9ced8'); Pix.line(g, 18, 32, 29, 32, '#ffffff');
      Pix.disc(g, 24, 34, 2, '#ff3030'); Pix.px(g, 24, 33, '#ffb0a0');
      Pix.rect(g, 19, 40, 10, 4, '#e8e4d0'); Pix.rect(g, 20, 41, 8, 1, '#5a5040');
    } else if (T === 'sport') {
      Pix.poly(g, [[16, 25], [32, 25], [28, 33], [20, 33]], M); Pix.rect(g, 17, 25, 14, 1, L);
      Pix.rect(g, 19, 30, 10, 1, '#ff3030'); Pix.rect(g, 21, 31, 6, 1, '#ffb0a0');
      Pix.line(g, 24, 33, 24, 37, '#26262e'); Pix.rect(g, 19, 37, 10, 4, '#e8e4d0'); Pix.rect(g, 20, 38, 8, 1, '#5a5040');
      Pix.px(g, 15, 33, '#ffa020'); Pix.px(g, 32, 33, '#ffa020');
    } else {
      Pix.rect(g, 18, 36, 12, 4, '#1a1a20');
      Pix.poly(g, [[13, 29], [35, 29], [32, 37], [16, 37]], M);
      Pix.rect(g, 14, 29, 20, 1, L); Pix.rect(g, 16, 36, 16, 1, D);
      Pix.rect(g, 18, 32, 12, 2, '#ff3030'); Pix.rect(g, 21, 32, 6, 1, '#ffb0a0');
      Pix.px(g, 14, 33, '#ffa020'); Pix.px(g, 33, 33, '#ffa020');
      Pix.rect(g, 19, 38, 10, 4, '#e8e4d0'); Pix.rect(g, 20, 39, 8, 1, '#5a5040');
      if (T === 'naked') Pix.rect(g, 15, 31, 18, 1, A);
    }
    if (T !== 'classic' && T !== 'sport') Pix.rect(g, 17, 27, 14, 2, '#121216');

    if (rider) {
      const gy = drawRider(g, T, M, A);
      const my = T === 'sport' ? gy - 6 : gy - 7;
      Pix.line(g, 5, gy - 1, 3, my + 2, '#2a2a32'); Pix.rect(g, 1, my, 4, 3, '#121216');
      Pix.line(g, 43, gy - 1, 45, my + 2, '#2a2a32'); Pix.rect(g, 43, my, 4, 3, '#121216');
      if (T === 'adventure') { Pix.rect(g, 2, gy - 2, 4, 2, A); Pix.rect(g, 42, gy - 2, 4, 2, A); }
    } else {
      Pix.rect(g, 18, 20, 12, 5, M); Pix.rect(g, 18, 20, 12, 1, L);
      Pix.rect(g, 17, 25, 14, 3, '#121216');
      Pix.line(g, 6, 16, 42, 16, '#26262e', 2);
      Pix.line(g, 5, 15, 3, 9, '#2a2a32'); Pix.rect(g, 1, 7, 4, 3, '#121216');
      Pix.line(g, 43, 15, 45, 9, '#2a2a32'); Pix.rect(g, 43, 7, 4, 3, '#121216');
    }
    if (T === 'adventure') {
      Pix.rect(g, 14, 21, 20, 11, '#9ea4b0'); Pix.rect(g, 14, 21, 20, 1, '#c9ced8'); Pix.rect(g, 14, 31, 20, 1, '#5a5f6a');
      Pix.rect(g, 16, 27, 16, 1, '#ff3030'); Pix.rect(g, 22, 24, 4, 1, '#5a5f6a');
      Pix.rect(g, 18, 32, 12, 3, M);
      Pix.rect(g, 19, 36, 10, 4, '#e8e4d0'); Pix.rect(g, 20, 37, 8, 1, '#5a5040');
    }
    return c;
  }

  // ---------- Moto y piloto a doble detalle ----------
  // Mismas formas que la versión base, rasterizadas al doble y con detalle de 1 píxel real.
  function drawRiderHD(d, type, M, A) {
    const yo = type === 'sport' ? 4 : type === 'classic' ? -1 : 0;
    const classic = type === 'classic';
    const jacket = classic ? '#4a3020' : '#17171d', back = classic ? '#5a3a26' : '#22222c';
    const seam = classic ? '#2e1c10' : '#0c0c10', hi = classic ? '#6a4a30' : '#30303c';
    const PANTS = '#23232c', PANTH = '#34343f';
    // piernas, rodilleras y botas
    d.poly([[12, 21], [19, 24], [17, 31], [10, 29]], PANTS); d.poly([[36, 21], [29, 24], [31, 31], [38, 29]], PANTS);
    d.fine(12, 22, 3, 0.5, PANTH); d.fine(33, 22, 3, 0.5, PANTH);
    d.rect(8, 28, 5, 7, PANTS); d.rect(35, 28, 5, 7, PANTS);
    d.fine(8.5, 29, 0.5, 5, PANTH); d.fine(35.5, 29, 0.5, 5, PANTH);
    d.rect(10.5, 25, 2, 2, M); d.rect(35.5, 25, 2, 2, M);
    d.rect(7, 34, 7, 3, '#0b0b0f'); d.rect(34, 34, 7, 3, '#0b0b0f');
    d.fine(7, 36.5, 7, 0.5, '#3a3a46'); d.fine(34, 36.5, 7, 0.5, '#3a3a46');
    d.fine(9, 34.5, 3, 0.5, '#5a5d6a'); d.fine(36, 34.5, 3, 0.5, '#5a5d6a');
    // casaca con protector de espalda, costuras y franjas
    const wide = type === 'sport' ? 2 : 0;
    d.poly([[14 - wide, 8 + yo], [34 + wide, 8 + yo], [37 + wide, 14 + yo], [33, 26], [15, 26], [11 - wide, 14 + yo]], jacket);
    d.fine(14 - wide, 8 + yo, 20 + wide * 2, 0.5, hi);
    d.rect(19, 12 + yo, 10, Math.max(4, 11 - yo), back);
    for (let y = 13 + yo; y < 23; y += 2) d.fine(19.5, y, 9, 0.5, hi);
    d.fine(24, 12 + yo, 0.5, Math.max(4, 11 - yo), seam);
    if (type === 'sport') d.rect(20, 12 + yo, 8, 3, A);
    d.line(13, 12 + yo, 15, 25, classic ? '#3a2416' : M, 2);
    d.line(35, 12 + yo, 33, 25, classic ? '#3a2416' : M, 2);
    d.fline(16.5, 12 + yo, 17.5, 25, seam); d.fline(31.5, 12 + yo, 30.5, 25, seam);
    d.rect(13, 9 + yo, 4, 3, hi); d.rect(31, 9 + yo, 4, 3, hi);
    d.rect(16, 24, 16, 2, '#0f0f13'); d.fine(23, 24.5, 2, 1, '#8a8f9c');
    // brazos, codos y guantes
    const gy = type === 'sport' ? 19 : 16;
    const arm = classic ? '#3a2416' : '#1d1d24';
    d.line(13, 11 + yo, 6, gy, arm, 3); d.line(35, 11 + yo, 42, gy, arm, 3);
    d.rect(8.5, 13 + yo * 0.5, 2, 2, M); d.rect(37.5, 13 + yo * 0.5, 2, 2, M);
    d.rect(3, gy - 1, 4, 3, '#0b0b0f'); d.rect(41, gy - 1, 4, 3, '#0b0b0f');
    d.fine(3.5, gy - 1, 3, 0.5, '#3a3a46'); d.fine(41.5, gy - 1, 3, 0.5, '#3a3a46');
    // cuello y casco con brillo, franja y ventilaciones
    d.rect(20, 11 + yo, 8, 3, '#0f0f13');
    const shell = classic ? '#e8e4d8' : '#131318';
    d.disc(24, 6 + yo, 6, shell);
    d.ring(24, 6 + yo, 5.5, 6, classic ? '#b8b4a8' : '#26262e');
    d.rect(23, yo, 2, 12, classic ? '#c8323a' : M);
    d.fine(23, yo + 0.5, 0.5, 11, classic ? '#ff6a6a' : shadeHex(M, 1.2, 40));
    if (type === 'adventure') { d.rect(18, yo, 12, 2, A); d.fine(18, yo, 12, 0.5, shadeHex(A, 1.2, 40)); }
    d.fline(19.5, 2.5 + yo, 21.5, 0.8 + yo, classic ? '#ffffff' : '#5a5b6e');
    d.fline(20, 3.5 + yo, 22, 1.5 + yo, classic ? '#f8f4e8' : '#3e3f50');
    if (!classic) { d.fine(20, 9 + yo, 2, 0.5, '#2e2e3a'); d.fine(26, 9 + yo, 2, 0.5, '#2e2e3a'); }
    return gy;
  }

  function rearBikeHD(b, f, rider) {
    const col = bikeColors(b);
    const d = Pix.hd(48, 60);
    const M = col.main, L = col.light, D = col.dark, A = col.accent, T = b.type;
    const ML = shadeHex(M, 1.15, 40);
    if (T === 'adventure') {
      for (const x of [1, 38]) {
        d.rect(x, 28, 9, 13, '#9ea4b0'); d.rect(x, 28, 9, 1, '#c9ced8'); d.rect(x, 40, 9, 1, '#5a5f6a');
        d.fine(x + 0.5, 29, 0.5, 11, '#d8dce4'); d.fine(x + 1, 33.5, 7, 0.5, '#7a808c');
        d.rect(x + 1, 37, 2, 1, '#ff3030');
      }
    }
    d.rect(15, 38, 2, 10, '#2c2d36'); d.rect(31, 38, 2, 10, '#2c2d36');
    d.fine(15, 38, 0.5, 10, '#4a4d58'); d.fine(31, 38, 0.5, 10, '#4a4d58');
    // llanta trasera con dibujo que gira
    const tw = T === 'classic' ? 8 : T === 'sport' ? 11 : 10, tx = 24 - tw / 2;
    d.rect(tx, 41, tw, 18, '#111115'); d.rect(tx + 1, 40, tw - 2, 20, '#111115');
    for (let y = 41 + f * 0.75; y < 59; y += 1.5) {
      d.fine(tx + 1, y, tw / 2 - 1.5, 0.5, '#2a2a34');
      d.fine(24 + 0.5, y + 0.75, tw / 2 - 1.5, 0.5, '#2a2a34');
    }
    d.fine(tx + 0.5, 42, 0.5, 15, '#34343e'); d.fine(tx + tw - 1, 42, 0.5, 15, '#08080a');
    // escape
    if (T === 'classic') {
      d.rect(30, 41, 10, 3, '#c9ced8'); d.fine(30, 41, 10, 0.5, '#ffffff'); d.rect(38, 41, 2, 3, '#5a5f6a');
    } else if (T === 'adventure') {
      d.poly([[29, 31], [35, 29], [37, 35], [31, 37]], '#9ea4b0'); d.disc(35, 32, 1, '#3a3d48');
      d.fline(30, 31.5, 35, 29.5, '#e0e4ea');
    } else {
      d.poly([[29, 39], [36, 37], [38, 44], [31, 47]], '#9ea4b0');
      d.fline(30, 40, 36, 38, '#e8ecf2');
      for (let k = 0; k < 3; k++) d.fline(31 + k * 1.5, 41.5 + k * 0.4, 33 + k * 1.5, 45.5 + k * 0.4, '#6a6e7a');
      d.disc(36, 41, 2, '#3a3d48'); d.ring(36, 41, 1.5, 2, '#c9ced8'); d.px(36, 41, '#15151a');
    }
    // carenado / tanque a los costados
    if (T === 'sport') {
      d.rect(6, 19, 7, 11, M); d.rect(35, 19, 7, 11, M); d.line(7, 22, 11, 28, A); d.line(40, 22, 36, 28, A);
      d.fine(6, 19, 7, 0.5, ML); d.fine(35, 19, 7, 0.5, ML);
    } else if (T === 'adventure') {
      d.rect(8, 19, 6, 10, M); d.rect(34, 19, 6, 10, M); d.rect(8, 23, 6, 1, A); d.rect(34, 23, 6, 1, A);
      d.fine(8, 19, 6, 0.5, ML); d.fine(34, 19, 6, 0.5, ML);
    } else if (T === 'classic') {
      d.rect(11, 22, 3, 5, M); d.rect(34, 22, 3, 5, M); d.fine(11, 22, 3, 0.5, ML); d.fine(34, 22, 3, 0.5, ML);
    } else {
      d.rect(10, 22, 4, 7, M); d.rect(34, 22, 4, 7, M); d.fine(10, 22, 4, 0.5, ML); d.fine(34, 22, 4, 0.5, ML);
    }
    // colín, stop con LEDs y placa
    const plate = (x, y) => {
      d.rect(x, y, 10, 4, '#eceadf'); d.fine(x, y, 10, 0.5, '#1f3f8a'); d.fine(x, y + 3.5, 10, 0.5, '#9a988a');
      d.text(b.id.replace(/[^a-z0-9]/g, '').slice(0, 4).toUpperCase(), x + 5, y + 1.2, '#1f2f5a');
    };
    if (T === 'classic') {
      d.rect(14, 26, 20, 3, '#2a1a12'); d.fine(14, 26, 20, 0.5, '#5a3a26');
      d.rect(15, 29, 18, 2, '#c9ced8'); d.fine(15, 29, 18, 0.5, '#ffffff');
      d.poly([[17, 31], [31, 31], [30, 40], [18, 40]], '#c9ced8'); d.line(18, 32, 29, 32, '#ffffff');
      d.disc(24, 34, 2, '#d81a20'); d.disc(24, 34, 1, '#ff5a5a'); d.fine(23.5, 33, 1, 0.5, '#ffd0c8');
      plate(19, 40);
    } else if (T === 'sport') {
      d.poly([[16, 25], [32, 25], [28, 33], [20, 33]], M); d.rect(17, 25, 14, 1, L);
      d.rect(19, 30, 10, 1, '#d81a20');
      for (let x = 19.5; x < 29; x += 1) d.fine(x, 30.25, 0.5, 0.5, '#ffd0c8');
      d.line(24, 33, 24, 37, '#26262e'); plate(19, 37);
      d.px(15, 33, '#ffa020'); d.px(32, 33, '#ffa020');
    } else {
      d.rect(18, 36, 12, 4, '#1a1a20');
      d.poly([[13, 29], [35, 29], [32, 37], [16, 37]], M);
      d.rect(14, 29, 20, 1, L); d.fine(15, 29, 18, 0.5, '#ffffff'); d.rect(16, 36, 16, 1, D);
      d.rect(18, 32, 12, 2, '#d81a20');
      for (let x = 18.5; x < 30; x += 1) d.fine(x, 32.5, 0.5, 0.5, '#ffd0c8');
      d.px(14, 33, '#ffa020'); d.px(33, 33, '#ffa020');
      plate(19, 38);
      if (T === 'naked') d.rect(15, 31, 18, 1, A);
    }
    if (T !== 'classic' && T !== 'sport') { d.rect(17, 27, 14, 2, '#121216'); d.fine(17, 27, 14, 0.5, '#2a2a32'); }

    if (rider) {
      const gy = drawRiderHD(d, T, M, A);
      const my = T === 'sport' ? gy - 6 : gy - 7;
      d.line(5, gy - 1, 3, my + 2, '#2a2a32'); d.rect(1, my, 4, 3, '#121216'); d.fine(1.5, my + 0.5, 3, 1, '#5a6a8a');
      d.line(43, gy - 1, 45, my + 2, '#2a2a32'); d.rect(43, my, 4, 3, '#121216'); d.fine(43.5, my + 0.5, 3, 1, '#5a6a8a');
      if (T === 'adventure') { d.rect(2, gy - 2, 4, 2, A); d.rect(42, gy - 2, 4, 2, A); }
    } else {
      d.rect(18, 20, 12, 5, M); d.rect(18, 20, 12, 1, L);
      d.rect(17, 25, 14, 3, '#121216');
      d.line(6, 16, 42, 16, '#26262e', 2);
      d.line(5, 15, 3, 9, '#2a2a32'); d.rect(1, 7, 4, 3, '#121216');
      d.line(43, 15, 45, 9, '#2a2a32'); d.rect(43, 7, 4, 3, '#121216');
    }
    if (T === 'adventure') {
      d.rect(14, 21, 20, 11, '#9ea4b0'); d.rect(14, 21, 20, 1, '#c9ced8'); d.rect(14, 31, 20, 1, '#5a5f6a');
      d.fine(14.5, 22, 0.5, 9, '#e0e4ea');
      d.rect(16, 27, 16, 1, '#d81a20'); d.rect(22, 24, 4, 1, '#5a5f6a');
      d.rect(18, 32, 12, 3, M);
      plate(19, 36);
    }
    return d.c;
  }

  const rearSet = b => ({ ride: [0, 1].map(f => rearBikeHD(b, f, true)), empty: rearBikeHD(b, 0, false) });

  // Piloto volando tras el choque final: cuadros rotados y uno tirado en el piso
  function flyingRider(b) {
    const col = bikeColors(b);
    const base = Pix.hd(48, 40);
    drawRiderHD(base, b.type === 'sport' ? 'naked' : b.type, col.main, col.accent);
    const frames = [];
    for (let k = 0; k < 8; k++) {
      const { c, g } = Pix.canvas(112, 112);
      g.translate(56, 56); g.rotate(k * Math.PI / 4); g.drawImage(base.c, -48, -40);
      frames.push(c);
    }
    const lie = Pix.canvas(88, 104);
    lie.g.translate(44, 52); lie.g.rotate(Math.PI / 2); lie.g.drawImage(base.c, -48, -40);
    return { frames, lying: lie.c };
  }

  // Enfermero (paramédico) caminando, visto de espaldas
  function medic(f) {
    const { c, g } = Pix.canvas(22, 40);
    const PANT = '#1f2f5a', WH = '#f4f4f4', SH = '#c9ced8', SKIN = '#c99a6a';
    const l1 = f ? 10 : 12, l2 = f ? 12 : 10;
    Pix.rect(g, 7, 28, 3, l1, PANT); Pix.rect(g, 12, 28, 3, l2, PANT);
    Pix.rect(g, 6, 27 + l1, 5, 2, '#111'); Pix.rect(g, 11, 27 + l2, 5, 2, '#111');
    Pix.rect(g, 5, 13, 12, 15, WH); Pix.rect(g, 15, 14, 2, 14, SH);
    Pix.rect(g, 10, 16, 2, 6, '#d01c1f'); Pix.rect(g, 8, 18, 6, 2, '#d01c1f');
    Pix.rect(g, 3, 14 + (f ? 1 : 0), 2, 11, WH); Pix.rect(g, 17, 14 + (f ? 0 : 1), 2, 11, SH);
    Pix.rect(g, 3, 25 + (f ? 1 : 0), 2, 2, SKIN); Pix.rect(g, 17, 25 + (f ? 0 : 1), 2, 2, SKIN);
    Pix.rect(g, 9, 11, 4, 2, SKIN);
    Pix.disc(g, 11, 7, 4, '#3a2416');
    Pix.rect(g, 7, 2, 8, 4, WH); Pix.rect(g, 6, 5, 10, 1, SH); Pix.px(g, 11, 3, '#d01c1f');
    return c;
  }

  // Dos enfermeros cargando la camilla con el piloto
  function carry(col) {
    const { c, g } = Pix.canvas(70, 40);
    const m = medic(0), m2 = medic(1);
    Pix.rect(g, 15, 22, 40, 3, '#5a5d6a');
    Pix.rect(g, 15, 18, 40, 4, '#e07b39'); Pix.rect(g, 15, 18, 40, 1, '#ffa060');
    Pix.rect(g, 20, 14, 26, 4, '#17171d'); Pix.rect(g, 22, 15, 20, 1, col.main);
    Pix.rect(g, 18, 15, 3, 3, '#0b0b0f');
    Pix.disc(g, 49, 15, 3, '#131318'); Pix.rect(g, 46, 14, 6, 1, col.main);
    Pix.rect(g, 20, 17, 30, 2, '#e8e4d8');
    g.drawImage(m, 0, 0); g.drawImage(m2, 48, 0);
    Pix.rect(g, 14, 20, 4, 2, '#c99a6a'); Pix.rect(g, 52, 20, 4, 2, '#c99a6a');
    return c;
  }

  function ambulance() {
    const { c, g } = Pix.canvas(52, 52);
    Pix.rect(g, 5, 45, 10, 7, '#0e0e12'); Pix.rect(g, 37, 45, 10, 7, '#0e0e12');
    Pix.poly(g, [[2, 46], [2, 8], [5, 5], [47, 5], [50, 8], [50, 46]], '#f4f4f4');
    Pix.rect(g, 3, 6, 46, 1, '#ffffff');
    Pix.rect(g, 12, 0, 28, 5, '#2a2b33');
    Pix.rect(g, 13, 1, 12, 3, '#d01c1f'); Pix.rect(g, 27, 1, 12, 3, '#1f5fd0');
    Pix.rect(g, 6, 9, 18, 10, '#2b3b5e'); Pix.rect(g, 28, 9, 18, 10, '#2b3b5e');
    Pix.px(g, 8, 10, '#7a9ad0'); Pix.px(g, 30, 10, '#7a9ad0');
    Pix.rect(g, 25, 8, 2, 37, '#c9ced8');
    Pix.rect(g, 2, 22, 48, 3, '#d01c1f');
    PixelFont.draw(g, 'AMBULANCIA', 26, 27, '#d01c1f', 1, 'center');
    Pix.rect(g, 11, 34, 9, 3, '#d01c1f'); Pix.rect(g, 14, 31, 3, 9, '#d01c1f');
    Pix.rect(g, 32, 34, 9, 3, '#d01c1f'); Pix.rect(g, 35, 31, 3, 9, '#d01c1f');
    Pix.rect(g, 3, 33, 4, 6, '#c81a1f'); Pix.rect(g, 45, 33, 4, 6, '#c81a1f');
    Pix.rect(g, 1, 42, 50, 3, '#7d838f');
    return { spr: c, w: 470, lights: [[5 / 52, 36 / 52], [47 / 52, 36 / 52]], box: { len: 1100, body: 0.1, side: '#dcdce2', sideD: '#8a8a94', top: '#f4f4f4', glass: '#2b3b5e', windows: [0.2, 0.36], stripe: [0.42, 0.48, '#d01c1f'], wheels: [0.15, 0.82] } };
  }

  // ---------- Tráfico (vistos desde atrás) ----------
  // ---------- Vehículos de perfil (textura del costado) ----------
  // Dibujados con la parte trasera a la izquierda y el frente a la derecha; el suelo es el borde inferior.
  function sideWheel(d, cx, cy, r, rim = '#a8aeb8') {
    d.disc(cx, cy, r + 0.8, '#121218');
    d.disc(cx, cy, r, '#0e0e12');
    d.ring(cx, cy, r - 0.6, r, '#26262e');
    d.disc(cx, cy, r * 0.62, rim);
    for (let k = 0; k < 5; k++) {
      const a = k * Math.PI * 2 / 5 + 0.3;
      d.fline(cx, cy, cx + Math.cos(a) * r * 0.58, cy + Math.sin(a) * r * 0.58, '#5a5d6a');
    }
    d.disc(cx, cy, r * 0.2, '#3a3d48');
    d.fine(cx - r * 0.5, cy - r * 0.55, r * 0.5, 0.5, '#e8ecf2');
  }

  function sedanSide(body, kind) {
    const d = Pix.hd(72, 24);
    const L = shadeHex(body, 1.1, 20), L2 = shadeHex(body, 1.22, 48), Dk = shadeHex(body, 0.72), Dd = shadeHex(body, 0.5);
    // silueta con techo, cabina y maletera
    d.poly([[1, 12.5], [2.5, 10], [19, 9.2], [26, 4], [46, 3.6], [54, 9], [67, 9.8], [70.5, 11.5], [71, 17.5], [69, 19.5], [3, 19.5], [1, 17.5]], body);
    d.fine(3, 9.6, 16, 0.5, L2); d.fline(19.5, 9, 26, 4.2, L2); d.fine(26.5, 4, 19, 0.5, L2); d.fline(46.5, 4, 54, 9, L); d.fine(54.5, 9.2, 12, 0.5, L2);
    d.rect(1, 16.5, 70, 3, Dk); d.fine(1, 19, 70, 0.5, Dd);
    d.fine(2, 12.5, 68, 0.5, L);
    // ventanas con parante central y reflejos
    d.poly([[21.5, 9.5], [27, 5.2], [36.5, 5], [36.5, 9.5]], '#1c2438');
    d.poly([[38, 9.5], [38, 5], [45.5, 4.9], [52, 9.5]], '#1c2438');
    d.poly([[23.5, 9.5], [27.5, 6.2], [36.5, 6], [36.5, 9.5]], '#26324c');
    d.poly([[38, 9.5], [38, 6], [45, 5.9], [50, 9.5]], '#26324c');
    d.fline(28, 9.3, 31, 5.5, 'rgba(180,210,255,0.45)'); d.fline(40, 9.3, 43, 5.5, 'rgba(180,210,255,0.4)');
    d.fine(21, 9.5, 31.5, 0.5, '#c9ced8');
    // puertas, manijas y espejo
    for (const x of [22, 37.2, 52.5]) d.fine(x, 9.5, 0.5, 8.5, Dd);
    d.fine(30, 11.5, 2.5, 0.5, L2); d.fine(45.5, 11.5, 2.5, 0.5, L2);
    d.rect(51.5, 8, 2.5, 1.5, Dk); d.fine(51.5, 8, 2.5, 0.5, L);
    // faros, stop y parachoques
    d.rect(68.5, 10.5, 2.2, 1.6, '#fff4c8'); d.fine(69, 10.5, 1.5, 0.5, '#ffffff');
    d.rect(1, 10.8, 2, 2.2, '#d81a20'); d.fine(1, 10.8, 2, 0.5, '#ff9090');
    d.rect(0.5, 15.5, 3, 3, '#24252c'); d.rect(68.5, 15.5, 3, 3, '#24252c');
    if (kind === 'taxi') {
      for (let x = 4; x < 68; x++) { d.fine(x, 13.5, 1, 1, x % 2 ? '#141414' : '#f4f4f4'); d.fine(x, 14.5, 1, 1, x % 2 ? '#f4f4f4' : '#141414'); }
      d.rect(33, 1.6, 8, 2, '#f4f4f4'); d.fine(33, 3.1, 8, 0.5, '#b8b8c0');
    } else if (kind === 'police') {
      d.rect(3, 13, 66, 3, '#1d6b3a'); d.fine(3, 13, 66, 0.5, '#3a9a5a');
      d.text('POLICÍA', 37, 13.3, '#f4f4f4');
      d.rect(31, 2, 12, 1.8, '#2a2b33'); d.rect(31.5, 2.3, 5, 1.2, '#d01c1f'); d.rect(37.5, 2.3, 5, 1.2, '#1f5fd0');
    }
    // pasos de rueda y llantas
    d.disc(13, 19.5, 5, '#16161c'); d.disc(58, 19.5, 5, '#16161c');
    d.rect(7, 19.5, 58, 4.5, 'rgba(0,0,0,0)');
    sideWheel(d, 13, 20, 4); sideWheel(d, 58, 20, 4);
    return d.c;
  }

  function suvSide(body) {
    const d = Pix.hd(68, 25);
    const L = shadeHex(body, 1.12, 24), L2 = shadeHex(body, 1.25, 50), Dk = shadeHex(body, 0.72), Dd = shadeHex(body, 0.48);
    d.poly([[1, 11], [2, 4], [4, 2.5], [50, 2.5], [57, 8.5], [66, 9.5], [67.5, 12], [67.5, 19], [66, 20.5], [2, 20.5], [1, 19]], body);
    d.fine(4, 2.5, 46, 0.5, L2); d.fline(50.5, 2.8, 57, 8.6, L); d.fine(57.5, 8.8, 8, 0.5, L2);
    d.rect(1, 17, 66.5, 3.5, Dk); d.fine(1, 20, 66.5, 0.5, Dd); d.fine(2, 11.5, 64, 0.5, L);
    d.rect(5, 1.2, 42, 1, '#2a2b33'); for (const x of [6, 26, 45]) d.rect(x, 1.2, 1.5, 1.5, '#2a2b33');
    // tres ventanas
    d.poly([[3.5, 9], [4.5, 4], [17, 4], [17, 9]], '#1c2438'); d.poly([[18.5, 9], [18.5, 4], [33, 4], [33, 9]], '#1c2438');
    d.poly([[34.5, 9], [34.5, 4], [49.5, 4], [55, 9]], '#1c2438');
    d.poly([[19.5, 9], [19.5, 5], [32, 5], [32, 9]], '#26324c'); d.poly([[35.5, 9], [35.5, 5], [49, 5], [53, 9]], '#26324c');
    d.fline(22, 8.8, 25, 4.6, 'rgba(180,210,255,0.45)'); d.fline(38, 8.8, 41, 4.6, 'rgba(180,210,255,0.4)');
    for (const x of [18, 33.8, 55.5]) d.fine(x, 9, 0.5, 9.5, Dd);
    d.fine(28, 11, 2.5, 0.5, L2); d.fine(44, 11, 2.5, 0.5, L2);
    d.rect(54.5, 7.5, 2.5, 1.6, Dk);
    d.rect(65.5, 10.3, 2.2, 2, '#fff4c8'); d.rect(1, 10, 1.8, 3, '#d81a20');
    d.rect(0.5, 16, 3, 3.5, '#24252c'); d.rect(65, 16, 3, 3.5, '#24252c');
    d.disc(13, 20.5, 5.6, '#16161c'); d.disc(55, 20.5, 5.6, '#16161c');
    sideWheel(d, 13, 20.5, 4.6); sideWheel(d, 55, 20.5, 4.6);
    return d.c;
  }

  // Mototaxi de perfil: cabina con pasajeros, toldo con flecos y la moto con su conductor adelante
  function mototaxiSide(canopy, deco) {
    const d = Pix.hd(48, 27);
    const Ck = shadeHex(canopy, 0.68), Cl = shadeHex(canopy, 1.15, 28), CH = '#c9ced8';
    // chasis
    d.line(10, 21.5, 40, 21.5, '#2a2b33', 1.2);
    // moto delantera: tanque, horquilla, faro y guardabarros
    d.line(41, 14, 43, 23, '#3a3d48', 1); d.fline(41.5, 14, 43.5, 23, '#8a8f9c');
    d.poly([[31, 17], [33, 14.5], [40, 14], [42, 16.5], [39, 18.5], [31, 18.5]], canopy);
    d.fine(33, 14.5, 7, 0.5, Cl);
    d.rect(31, 18.5, 8, 3, '#3a3d48'); d.fine(32, 19, 6, 0.5, '#6a6e7a');
    d.rect(43, 13, 2.5, 2, '#2a2b33'); d.rect(44.8, 13.3, 1.2, 1.4, '#fff4c8');
    d.line(39.5, 12.5, 42.5, 12, '#2a2b33', 0.6);
    d.poly([[39.5, 19.5], [42, 18], [46, 18.5], [46.5, 20]], canopy);
    // conductor con casco
    d.poly([[33, 18], [34.5, 11.5], [37.5, 11.5], [37.5, 18]], '#2a3a6a');
    d.line(36.5, 13, 40.5, 12.8, '#2a3a6a', 0.8);
    d.poly([[33.5, 18], [37, 17.5], [38.5, 21.5], [37, 22]], '#23232c');
    d.rect(36.5, 21.5, 2.5, 1, '#0b0b0f');
    d.disc(36, 9.5, 2.3, '#c8323a'); d.rect(36.5, 8.8, 2, 1.2, '#2d3f66'); d.fine(34.6, 8.3, 1, 0.5, '#ff9090');
    // cabina: carrocería decorada, asiento y pasajeros
    d.poly([[1.5, 22], [1.5, 15], [3, 14], [30, 14], [31, 15.5], [31, 22]], canopy);
    d.fine(2, 14, 28, 0.5, CH); d.fine(1.5, 21.5, 29.5, 0.5, Ck);
    d.poly([[3, 20], [13, 15.2], [16, 15.2], [6, 20]], deco); d.poly([[16, 20], [26, 15.2], [29, 15.2], [19, 20]], deco);
    d.rect(4, 12.5, 25, 1.5, '#4a3424');
    d.disc(10, 7.5, 2, '#2a1a10'); d.fine(8.6, 6.5, 2.4, 0.8, '#3a2416'); d.poly([[7.5, 13], [8.5, 9.5], [12, 9.5], [12.5, 13]], '#2a6ad0');
    d.disc(20.5, 7.8, 2, '#1a1008'); d.poly([[18, 13], [19, 9.8], [22.5, 9.8], [23, 13]], '#d8b040');
    d.fine(10, 12, 4, 0.8, '#1f2f5a'); d.fine(20.5, 12, 4, 0.8, '#23232c');
    // parantes y toldo con flecos
    d.rect(2, 3, 1, 11, '#8a8f9c'); d.fine(2, 3, 0.5, 11, '#e0e4ea');
    d.rect(29.5, 3, 1, 11, '#8a8f9c'); d.fine(29.5, 3, 0.5, 11, '#e0e4ea');
    d.poly([[0.5, 3.5], [1.5, 1], [32, 1], [33.5, 3.5]], canopy); d.fine(1.5, 1, 30, 0.5, Cl);
    for (let x = 6; x < 32; x += 6) d.fine(x, 1.5, 0.5, 2, Ck);
    for (let x = 1, i = 0; x < 33; x += 2.2, i++) d.disc(x + 0.6, 4.2, 0.9, i % 2 ? '#f4f4f4' : Ck);
    d.rect(1, 17.5, 1.5, 1.8, '#d81a20');
    // ruedas
    sideWheel(d, 8.5, 23.5, 3.3, '#9aa0ac'); sideWheel(d, 42.5, 23.5, 3.3, '#9aa0ac');
    d.poly([[4.5, 20], [8.5, 18.5], [12.5, 20], [12.5, 20.8], [4.5, 20.8]], canopy);
    return d.c;
  }

  function beetleSide(body, shade) {
    const d = Pix.hd(57, 22);
    const L = shadeHex(body, 1.12, 26), Dk = shade, Dd = shadeHex(shade, 0.7);
    // silueta clásica del escarabajo: techo en arco, capó bajo y guardabarros redondos
    d.poly([[2, 16], [2.5, 12.5], [6, 10], [11, 8.8], [14.5, 4.5], [20, 2], [30, 1.8], [36.5, 3.2], [42, 7.5], [48, 9.2], [52.5, 11], [55, 13.5], [55, 16.5]], body);
    d.disc(11, 16, 5.4, body); d.disc(46, 16, 5.4, body);
    d.fline(14.8, 4.5, 20, 2.2, L); d.fine(20, 2, 10, 0.5, L); d.fline(30, 2, 36.5, 3.4, L);
    d.fline(6.5, 12.2, 10.5, 10.8, L); d.fline(41.5, 12.2, 45.5, 10.8, L);
    // estribo entre guardabarros
    d.rect(16, 15, 25, 2, Dk); d.fine(16, 16.5, 25, 0.5, Dd);
    // ventanas redondeadas con marco cromado
    d.poly([[16, 8.8], [19.5, 4.2], [27.5, 3.6], [27.5, 8.8]], '#1c2438');
    d.poly([[29, 8.8], [29, 3.6], [35, 4.2], [39, 8.8]], '#1c2438');
    d.fline(20.5, 8.4, 23, 5, 'rgba(180,210,255,0.45)'); d.fline(31, 8.4, 33, 5.2, 'rgba(180,210,255,0.35)');
    d.fine(15.5, 8.8, 24, 0.5, '#c9ced8');
    d.fine(28.2, 4, 0.5, 11, Dd); d.fine(33, 10.5, 2, 0.5, '#e0e4ea');
    // faro en el guardabarros, stop y parachoques cromados
    d.disc(51.5, 12, 1.4, '#fff4c8'); d.fine(51, 11.2, 1, 0.5, '#ffffff');
    d.disc(4.8, 12, 1, '#d81a20');
    d.rect(0.5, 14.5, 3, 1.2, '#c9ced8'); d.rect(54, 14.5, 3, 1.2, '#c9ced8');
    sideWheel(d, 11, 17.8, 3.6, '#e0e4ea'); sideWheel(d, 46, 17.8, 3.6, '#e0e4ea');
    return d.c;
  }

  function vanSide(kind) {
    const amb = kind === 'ambulance';
    const d = Pix.hd(62, 26);
    const body = amb ? '#f4f4f4' : '#e8e4d8', Dk = amb ? '#c8c8d0' : '#c8c2b0', L = '#ffffff';
    d.poly([[1, 21], [1, 3], [3, 1.5], [50, 1.5], [55, 4], [60, 11], [61, 13], [61, 21]], body);
    d.fine(3, 1.5, 47, 0.5, L); d.rect(1, 18.5, 60, 2.5, Dk);
    if (amb) {
      d.rect(1, 12, 60, 2.5, '#d01c1f');
      d.text('AMBULANCIA', 24, 14.8, '#d01c1f');
      d.rect(36, 6, 2, 6, '#d01c1f'); d.rect(34, 8, 6, 2, '#d01c1f');
      d.rect(12, 0.2, 14, 1.4, '#2a2b33'); d.rect(12.5, 0.4, 6, 1, '#d01c1f'); d.rect(19.5, 0.4, 6, 1, '#1f5fd0');
      d.poly([[47, 10], [47, 4], [53, 4], [57.5, 10]], '#1c2438');
      d.fine(46, 4, 0.5, 14, '#9a9aa4'); d.fine(20, 4, 0.5, 14, '#9a9aa4');
    } else {
      for (let x = 4; x < 44; x += 10) { d.rect(x, 4, 8, 6, '#1c2438'); d.rect(x + 0.5, 5, 7, 4.5, '#26324c'); d.fline(x + 2, 9.5, x + 4, 4.5, 'rgba(180,210,255,0.4)'); }
      d.poly([[47, 10], [47, 4], [53, 4], [57.5, 10]], '#1c2438');
      d.rect(1, 11.5, 60, 2, '#1f5fd0'); d.rect(1, 13.5, 60, 1, '#d01c1f');
      d.text('CHORRILLOS', 25, 15.5, '#1f3f8a');
      d.fine(33, 4, 0.5, 14, '#9a988a'); d.fine(43, 4, 0.5, 14, '#9a988a');
    }
    d.rect(59, 12, 2, 2, '#fff4c8'); d.rect(1, 13, 1.5, 3, '#d81a20');
    d.rect(0.5, 17, 3, 3, '#24252c'); d.rect(58.5, 17, 3, 3, '#24252c');
    d.disc(11, 21.5, 5, '#16161c'); d.disc(50, 21.5, 5, '#16161c');
    sideWheel(d, 11, 21.5, 4); sideWheel(d, 50, 21.5, 4);
    return d.c;
  }

  function pickupSide() {
    const d = Pix.hd(66, 21);
    const body = '#b3161b', L = '#e04a4a', Dk = '#7a0f12';
    d.poly([[1, 17], [1, 8.5], [37, 8.5], [39, 2.5], [50, 2.5], [56, 7.5], [64, 8.5], [65.5, 11], [65.5, 17]], body);
    d.fine(1, 8.5, 36, 0.5, L); d.fine(39.5, 2.5, 10, 0.5, L);
    d.rect(1, 14.5, 64.5, 2.5, Dk);
    for (const [x, col] of [[4, '#a0703a'], [12, '#b88a4a'], [22, '#a0703a']]) { d.rect(x, 5, 8, 3.6, col); d.fine(x, 5, 8, 0.5, '#d8a868'); }
    d.disc(32, 7, 1.8, '#3f9a3a'); d.disc(29, 7.5, 1.6, '#e07b39');
    d.poly([[40, 8], [41.5, 3.5], [49.5, 3.5], [54.5, 8]], '#1c2438'); d.fline(43, 7.8, 45, 4, 'rgba(180,210,255,0.45)');
    d.fine(38, 8.5, 0.5, 6, Dk); d.fine(55, 8.5, 0.5, 6, Dk); d.fine(48, 10, 2.5, 0.5, L);
    d.rect(64, 9.5, 1.8, 1.6, '#fff4c8'); d.rect(1, 9.5, 1.6, 2.5, '#ff3030');
    d.disc(12, 17, 4.8, '#16161c'); d.disc(54, 17, 4.8, '#16161c');
    sideWheel(d, 12, 17, 3.9); sideWheel(d, 54, 17, 3.9);
    return d.c;
  }

  // agrega la textura del costado al modelo 3D del vehículo
  function withSide(o, sideCanvas, extra = {}) {
    o.box = Object.assign({}, o.box, { tex: Pix.finish(sideCanvas) }, extra);
    return o;
  }

  // ---------- Vehículos dibujados a doble detalle ----------
  // kind: 'taxi' | 'police' | null
  function sedanHD(body, kind) {
    const d = Pix.hd(48, 34);
    const L = shadeHex(body, 1.1, 20), L2 = shadeHex(body, 1.2, 45), Dk = shadeHex(body, 0.74), Dd = shadeHex(body, 0.5);
    const T = '#101014';
    // llantas con banda de rodadura
    for (const x of [4, 35]) {
      d.rect(x, 27.5, 9, 6.5, T);
      d.fine(x + 0.5, 28, 8, 0.5, '#30303a');
      for (let k = 0.5; k < 9; k += 1.5) d.fine(x + k, 30.5, 0.5, 3, '#1e1e26');
    }
    // cabina y luneta con degradado, desempañador y reflejos
    d.poly([[8, 13.5], [12.5, 4], [35.5, 4], [40, 13.5]], body);
    d.fine(13, 4, 22, 0.5, L2);
    d.poly([[11.5, 13], [14.5, 5.5], [33.5, 5.5], [36.5, 13]], '#1a2236');
    d.poly([[12.5, 13], [15, 7.5], [33, 7.5], [35.5, 13]], '#232e48');
    d.poly([[13.5, 13], [15.5, 10], [32.5, 10], [34.5, 13]], '#2c3a58');
    for (let y = 7.5; y < 12.6; y += 1.5) d.fline(15.5, y, 32.5, y, '#3a4c70');
    d.poly([[16, 12.5], [19, 6], [21, 6], [18, 12.5]], 'rgba(170,200,250,0.35)');
    d.poly([[22.5, 12.5], [24.5, 8], [25.5, 8], [23.5, 12.5]], 'rgba(170,200,250,0.22)');
    d.rect(20.5, 4.5, 7, 1, '#d81a20'); d.fine(21, 4.5, 6, 0.5, '#ff9090');
    // carrocería: brillo arriba, sombra abajo, tapa de maletera y emblema
    d.poly([[2, 15], [3, 13.5], [45, 13.5], [46, 15], [46, 27], [2, 27]], body);
    d.rect(2, 13.5, 44, 1.5, L); d.fine(3, 13.5, 42, 0.5, L2);
    d.rect(2, 24, 44, 3, Dk); d.fine(2, 26.5, 44, 0.5, Dd);
    d.fine(11, 15.5, 26, 0.5, Dd); d.fine(11, 15.5, 0.5, 6.5, Dd); d.fine(36.5, 15.5, 0.5, 6.5, Dd);
    d.fine(23, 17, 2, 1, '#d8dce4'); d.fine(23, 17, 2, 0.5, '#ffffff');
    // faros traseros envolventes
    d.poly([[2.5, 15], [10.5, 15], [10.5, 19.5], [3, 20]], '#a0101a');
    d.rect(3.5, 15.5, 6, 2, '#e8282a'); d.fine(4, 15.5, 5, 0.5, '#ffb0a0'); d.rect(8.5, 18, 2, 1.5, '#ff9a1a');
    d.poly([[37.5, 15], [45.5, 15], [45, 20], [37.5, 19.5]], '#a0101a');
    d.rect(38.5, 15.5, 6, 2, '#e8282a'); d.fine(39, 15.5, 5, 0.5, '#ffb0a0'); d.rect(37.5, 18, 2, 1.5, '#ff9a1a');
    // placa
    d.rect(17.5, 21, 13, 5.5, '#eceadf'); d.fine(17.5, 21, 13, 0.5, '#1f3f8a'); d.fine(17.5, 26, 13, 0.5, '#9a988a');
    d.text(kind === 'police' ? 'EP1247' : 'MRN264', 24, 22.3, '#1f2f5a');
    // parachoques, catadióptricos y escape
    d.rect(1, 26.5, 46, 2.5, '#2a2b33'); d.fine(1, 26.5, 46, 0.5, '#4e515c');
    d.fine(3, 27.5, 4, 0.5, '#c81a1f'); d.fine(41, 27.5, 4, 0.5, '#c81a1f');
    d.rect(35, 29, 3, 1.5, '#8a8f9c'); d.fine(35.5, 29.5, 2, 0.5, '#24242c');
    if (kind === 'taxi') {
      d.rect(16, 0.5, 16, 3.5, '#f4f4f4'); d.fine(16, 0.5, 16, 0.5, '#ffffff'); d.fine(16, 3.5, 16, 0.5, '#b8b8c0');
      d.text('TAXI', 24, 0.9, '#d01c1f');
      for (let x = 2; x < 46; x++) { d.fine(x, 19.5, 1, 1, x % 2 ? '#141414' : '#f4f4f4'); d.fine(x, 20.5, 1, 1, x % 2 ? '#f4f4f4' : '#141414'); }
    } else if (kind === 'police') {
      d.rect(2, 17, 8, 1, '#f4f4f4');
      d.rect(11, 16.5, 26, 4.5, '#1d6b3a'); d.fine(11, 16.5, 26, 0.5, '#3a9a5a');
      d.text('POLICÍA', 24, 17.2, '#f4f4f4');
      d.rect(14, 0.5, 20, 3.5, '#2a2b33');
      d.rect(14.5, 1, 9, 2.5, '#d01c1f'); d.fine(15, 1, 8, 0.5, '#ff8a8a');
      d.rect(24.5, 1, 9, 2.5, '#1f5fd0'); d.fine(25, 1, 8, 0.5, '#8ab8ff');
    }
    return d.c;
  }

  function suvHD(body) {
    const d = Pix.hd(50, 40);
    const L = shadeHex(body, 1.12, 24), L2 = shadeHex(body, 1.25, 50), Dk = shadeHex(body, 0.72), Dd = shadeHex(body, 0.48);
    for (const x of [4, 36]) {
      d.rect(x, 32.5, 10, 7.5, '#101014'); d.fine(x + 0.5, 33, 9, 0.5, '#30303a');
      for (let k = 0.5; k < 10; k += 1.5) d.fine(x + k, 35.5, 0.5, 4, '#1e1e26');
    }
    d.poly([[5, 16], [7, 3], [43, 3], [45, 16]], body); d.fine(7.5, 3, 35, 0.5, L2);
    d.rect(6, 1, 38, 1, '#2a2b33'); d.rect(6, 1, 1.5, 2, '#2a2b33'); d.rect(42.5, 1, 1.5, 2, '#2a2b33');
    d.poly([[9, 15.5], [10, 4.5], [40, 4.5], [41, 15.5]], '#1a2236');
    d.poly([[10, 15.5], [10.8, 7], [39.2, 7], [40, 15.5]], '#253050');
    d.poly([[13, 15], [16, 5], [18, 5], [15, 15]], 'rgba(170,200,250,0.3)');
    d.fine(14, 13.5, 22, 0.5, '#3a4c70'); d.rect(22, 4.5, 6, 1, '#d81a20');
    d.rect(3, 16, 44, 16, body); d.rect(3, 16, 44, 1.5, L); d.fine(3, 16, 44, 0.5, L2);
    d.rect(3, 28, 44, 2, Dk); d.fine(3, 29.5, 44, 0.5, Dd);
    d.poly([[3.5, 17.5], [10, 17.5], [10, 24], [4, 24.5]], '#a0101a'); d.rect(4.5, 18.5, 4.5, 3, '#e8282a'); d.fine(5, 18.5, 3.5, 0.5, '#ffb0a0');
    d.poly([[40, 17.5], [46.5, 17.5], [46, 24.5], [40, 24]], '#a0101a'); d.rect(41, 18.5, 4.5, 3, '#e8282a'); d.fine(41.5, 18.5, 3.5, 0.5, '#ffb0a0');
    d.disc(25, 21.5, 4, '#24252c'); d.ring(25, 21.5, 3, 4, '#5a5d6a'); d.fine(23.5, 19.5, 2, 0.5, '#8a8f9c');
    d.rect(19, 26, 12, 4.5, '#eceadf'); d.fine(19, 26, 12, 0.5, '#1f3f8a'); d.text('SUV707', 25, 27, '#1f2f5a');
    d.rect(2, 30.5, 46, 2.5, '#24252c'); d.fine(2, 30.5, 46, 0.5, '#4e515c');
    return d.c;
  }

  function mototaxiHD(canopy, deco) {
    const d = Pix.hd(40, 42);
    const Ck = shadeHex(canopy, 0.68), Cl = shadeHex(canopy, 1.15, 28), CH = '#c9ced8';
    // llantas traseras y guardabarros
    for (const x of [2, 31]) {
      d.rect(x, 33, 7, 9, '#101014'); d.fine(x + 0.5, 33.5, 6, 0.5, '#30303a');
      for (let k = 0.5; k < 7; k += 1.5) d.fine(x + k, 36, 0.5, 5.5, '#1e1e26');
      d.rect(x - 0.5, 31.5, 8, 2, canopy); d.fine(x - 0.5, 31.5, 8, 0.5, CH);
    }
    // carrocería trasera decorada
    d.poly([[3, 34], [3, 24], [4, 23], [36, 23], [37, 24], [37, 34]], canopy);
    d.rect(3, 23, 34, 1, CH); d.fine(3, 23, 34, 0.5, '#ffffff');
    d.poly([[3, 31], [12, 24.5], [15, 24.5], [6, 31]], deco); d.poly([[37, 31], [28, 24.5], [25, 24.5], [34, 31]], deco);
    d.rect(3, 32, 34, 2, Ck);
    d.text('MOTOTAXI', 20, 25, '#f4f4f4');
    d.disc(6, 29, 1.5, '#c81a1f'); d.fine(5.5, 28.5, 1, 0.5, '#ff9090');
    d.disc(34, 29, 1.5, '#c81a1f'); d.fine(33.5, 28.5, 1, 0.5, '#ff9090');
    d.rect(15, 28.5, 10, 4, '#eceadf'); d.fine(15, 28.5, 10, 0.5, '#1f3f8a'); d.text('M4T0', 20, 29.6, '#1f2f5a');
    // ventana trasera de plástico con pasajeros
    d.rect(4.5, 8, 31, 15, '#2a2b33');
    d.rect(6, 9.5, 28, 12.5, '#3a2a20');
    d.disc(13, 14.5, 2.5, '#2a1a10'); d.fine(11.5, 13, 3, 1, '#4a3020');
    d.poly([[9, 22], [10, 17.5], [16, 17.5], [17, 22]], '#2a6ad0'); d.fine(10.5, 17.5, 5, 0.5, '#5a9aff');
    d.disc(26.5, 14, 2.5, '#1a1008'); d.fine(25, 12.5, 3, 1, '#3a2416');
    d.poly([[22.5, 22], [23.5, 17], [29.5, 17], [30.5, 22]], '#d8b040'); d.fine(24, 17, 5, 0.5, '#ffe080');
    d.rect(6, 9.5, 28, 12.5, 'rgba(190,215,240,0.28)');
    d.poly([[8, 21.5], [12, 10], [14, 10], [10, 21.5]], 'rgba(255,255,255,0.22)');
    d.fine(6, 22, 28, 0.5, CH);
    // parantes cromados y toldo con costuras y flecos
    d.rect(3, 6, 1.5, 18, '#8a8f9c'); d.fine(3, 6, 0.5, 18, '#e0e4ea');
    d.rect(35.5, 6, 1.5, 18, '#8a8f9c'); d.fine(35.5, 6, 0.5, 18, '#e0e4ea');
    d.poly([[1, 6.5], [39, 6.5], [36.5, 0.5], [3.5, 0.5]], canopy);
    d.fine(4, 0.5, 32, 0.5, Cl);
    for (let x = 8; x < 33; x += 6) d.fline(x, 1, x - 1, 6, Ck);
    d.rect(1, 5.5, 38, 1, Ck);
    for (let x = 1.5, i = 0; x < 39; x += 2.5, i++) d.disc(x + 0.5, 7, 1, i % 2 ? '#f4f4f4' : Ck);
    return d.c;
  }

  // Sedán visto desde atrás (taxi limeño o auto particular)
  function sedan(body, isTaxi) {
    const { c, g } = Pix.canvas(48, 34);
    const L = shadeHex(body, 1.12, 22), Dk = shadeHex(body, 0.72), Dd = shadeHex(body, 0.5);
    Pix.rect(g, 4, 28, 9, 6, '#0e0e12'); Pix.rect(g, 35, 28, 9, 6, '#0e0e12');
    Pix.rect(g, 5, 29, 2, 3, '#2a2a32'); Pix.rect(g, 41, 29, 2, 3, '#2a2a32');
    // cabina y luneta con desempañador
    Pix.poly(g, [[8, 13], [12, 4], [36, 4], [40, 13]], body);
    Pix.line(g, 12, 4, 36, 4, L);
    Pix.poly(g, [[11, 12], [14, 6], [34, 6], [37, 12]], '#26344f');
    for (const y of [8, 10]) Pix.line(g, 14, y, 34, y, '#3a4a6a');
    Pix.line(g, 15, 7, 21, 7, '#8aa8d8'); Pix.px(g, 31, 11, '#8aa8d8');
    Pix.rect(g, 21, 5, 6, 1, '#ff3030');
    // carrocería con brillo arriba y sombra abajo
    Pix.rect(g, 2, 13, 44, 15, body);
    Pix.rect(g, 2, 13, 44, 2, L);
    Pix.rect(g, 2, 24, 44, 2, Dk);
    Pix.rect(g, 12, 15, 24, 1, Dk); Pix.rect(g, 12, 15, 1, 6, Dk); Pix.rect(g, 35, 15, 1, 6, Dk);
    if (isTaxi) {
      Pix.rect(g, 16, 1, 16, 4, '#f4f4f4'); Pix.rect(g, 17, 2, 14, 1, '#d01c1f');
      for (let x = 2; x < 46; x += 2) {
        const a = (x >> 1) % 2;
        Pix.rect(g, x, 20, 1, 1, a ? '#111' : '#f4f4f4'); Pix.rect(g, x + 1, 20, 1, 1, a ? '#f4f4f4' : '#111');
        Pix.rect(g, x, 21, 1, 1, a ? '#f4f4f4' : '#111'); Pix.rect(g, x + 1, 21, 1, 1, a ? '#111' : '#f4f4f4');
      }
    }
    // faros traseros de dos tonos e intermitentes
    Pix.rect(g, 3, 15, 7, 4, '#c81a1f'); Pix.rect(g, 38, 15, 7, 4, '#c81a1f');
    Pix.rect(g, 4, 16, 3, 1, '#ff8a80'); Pix.rect(g, 39, 16, 3, 1, '#ff8a80');
    Pix.rect(g, 8, 15, 2, 4, '#ffa020'); Pix.rect(g, 38, 15, 2, 4, '#ffa020');
    Pix.rect(g, 19, 22, 10, 5, '#e8e4d0'); Pix.rect(g, 20, 24, 8, 1, '#4a4030'); Pix.rect(g, 19, 22, 10, 1, '#c9c4b0');
    // parachoques, escape y sombra
    Pix.rect(g, 1, 26, 46, 3, '#c9ced8'); Pix.rect(g, 1, 26, 46, 1, '#e8ecf2'); Pix.rect(g, 1, 28, 46, 1, '#7d838f');
    Pix.rect(g, 36, 29, 3, 2, '#5a5d6a');
    return {
      spr: c, w: 420, lights: [[6.5 / 48, 17 / 34], [41.5 / 48, 17 / 34]],
      box: {
        len: 900, body: 0.4, cab: [0.12, 0.58], cabTop: 0.1, inset: 0.17, side: Dk, sideL: body, sideD: Dd, top: body, roof: L,
        glass: '#26344f', wheels: [0.16, 0.82], stripe: isTaxi ? [0.59, 0.64, '#16161c'] : null, doors: [0.3, 0.58], mirror: true,
      },
    };
  }

  // Camioneta SUV alta
  function suv(body) {
    const { c, g } = Pix.canvas(50, 40);
    const L = shadeHex(body, 1.15, 26), Dk = shadeHex(body, 0.7), Dd = shadeHex(body, 0.48);
    Pix.rect(g, 4, 33, 10, 7, '#0e0e12'); Pix.rect(g, 36, 33, 10, 7, '#0e0e12');
    Pix.poly(g, [[5, 16], [7, 3], [43, 3], [45, 16]], body);
    Pix.rect(g, 7, 3, 36, 1, L);
    Pix.rect(g, 6, 1, 3, 2, '#2a2b33'); Pix.rect(g, 41, 1, 3, 2, '#2a2b33'); Pix.rect(g, 6, 1, 38, 1, '#2a2b33');
    Pix.poly(g, [[9, 15], [10, 5], [40, 5], [41, 15]], '#26344f');
    Pix.line(g, 12, 6, 18, 6, '#8aa8d8'); Pix.rect(g, 23, 5, 4, 1, '#ff3030');
    Pix.rect(g, 3, 16, 44, 16, body); Pix.rect(g, 3, 16, 44, 2, L); Pix.rect(g, 3, 28, 44, 2, Dk);
    Pix.rect(g, 4, 18, 6, 6, '#c81a1f'); Pix.rect(g, 40, 18, 6, 6, '#c81a1f');
    Pix.rect(g, 5, 19, 2, 2, '#ff8a80'); Pix.rect(g, 41, 19, 2, 2, '#ff8a80');
    Pix.disc(g, 25, 22, 4, '#2a2b33'); Pix.disc(g, 25, 22, 3, '#4a4d58');
    Pix.rect(g, 20, 26, 10, 4, '#e8e4d0');
    Pix.rect(g, 2, 30, 46, 3, '#2a2b33'); Pix.rect(g, 2, 30, 46, 1, '#4a4d58');
    return {
      spr: c, w: 450, lights: [[7 / 50, 21 / 40], [43 / 50, 21 / 40]],
      box: {
        len: 980, body: 0.4, cab: [0.05, 0.68], cabTop: 0.07, inset: 0.07, side: Dk, sideL: body, sideD: Dd, top: body, roof: L,
        glass: '#26344f', wheels: [0.15, 0.82], doors: [0.28, 0.56], mirror: true, rails: true,
      },
    };
  }

  // Mototaxi peruano: moto adelante y cabina con toldo atrás
  function mototaxi(canopy) {
    const { c, g } = Pix.canvas(40, 42);
    const Ck = shadeHex(canopy, 0.7), Cl = shadeHex(canopy, 1.15, 25);
    Pix.rect(g, 2, 33, 7, 9, '#0e0e12'); Pix.rect(g, 31, 33, 7, 9, '#0e0e12');
    Pix.rect(g, 4, 35, 3, 4, '#5a5d6a'); Pix.rect(g, 33, 35, 3, 4, '#5a5d6a');
    // chasis y caja trasera
    Pix.rect(g, 3, 24, 34, 10, '#2a2b33');
    Pix.rect(g, 4, 25, 32, 7, canopy); Pix.rect(g, 4, 25, 32, 1, Cl);
    PixelFont.draw(g, 'MOTOTAXI', 20, 27, '#f4f4f4', 1, 'center');
    Pix.rect(g, 4, 31, 3, 2, '#ff3030'); Pix.rect(g, 33, 31, 3, 2, '#ff3030');
    Pix.rect(g, 15, 33, 10, 4, '#e8e4d0'); Pix.rect(g, 16, 34, 8, 1, '#4a4030');
    // pasajeros vistos por la ventana de plástico
    Pix.rect(g, 6, 9, 28, 15, '#3a2a20');
    Pix.disc(g, 13, 15, 3, '#2a1a10'); Pix.rect(g, 10, 18, 7, 6, '#1f5fd0');
    Pix.disc(g, 26, 14, 3, '#2a1a10'); Pix.rect(g, 23, 17, 7, 7, '#d0b040');
    Pix.rect(g, 8, 10, 24, 9, 'rgba(180,210,235,0.35)');
    Pix.line(g, 9, 11, 14, 11, 'rgba(255,255,255,0.6)');
    // toldo con flecos
    Pix.rect(g, 3, 4, 2, 21, '#7d838f'); Pix.rect(g, 35, 4, 2, 21, '#7d838f');
    Pix.rect(g, 5, 5, 30, 4, canopy); Pix.rect(g, 5, 8, 30, 1, Ck);
    Pix.poly(g, [[1, 5], [39, 5], [36, 0], [4, 0]], canopy);
    Pix.rect(g, 4, 0, 32, 1, Cl);
    for (let x = 2; x < 38; x += 3) Pix.rect(g, x, 5, 2, 2, x % 2 ? Ck : '#f4f4f4');
    return {
      spr: c, w: 300, slow: true, lights: [[5.5 / 40, 32 / 42], [34.5 / 40, 32 / 42]],
      box: {
        len: 560, body: 0.58, cab: [0, 0.62], cabTop: 0.05, inset: 0.04, side: '#2a2b33', sideL: canopy, sideD: '#1a1a20',
        top: '#2a2b33', roof: canopy, glass: '#3a2a20', wheels: [0.12], nose: true,
      },
    };
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
    return { spr: c, w: 380, lights: [[7.5 / 44, 19.5 / 32], [37.5 / 44, 19.5 / 32]], box: { len: 720, body: 0.38, cab: [0.2, 0.62], cabTop: 0.06, inset: 0.22, side: shade, sideD: '#2a2a30', top: body, roof: body, glass: '#2b3b5e', wheels: [0.15, 0.8] } };
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
    return { spr: c, w: 460, lights: [[5 / 50, 35 / 48], [45 / 50, 35 / 48]], box: { len: 1050, body: 0.04, side: '#d0ccc0', sideD: '#8a8678', top: '#e8e4d8', glass: '#2b3b5e', windows: [0.24, 0.48], stripe: [0.54, 0.64, '#1f5fd0'], wheels: [0.14, 0.84] } };
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
    return { spr: c, w: 430, lights: [[5 / 48, 18 / 34], [43 / 48, 18 / 34]], box: { len: 960, body: 0.4, cab: [0.55, 0.85], cabTop: 0.09, inset: 0.2, side: '#8e1014', sideD: '#4a080a', top: '#b3161b', roof: '#a8141a', glass: '#2b3b5e', wheels: [0.16, 0.8], cargo: '#a0703a' } };
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

  // Todo sprite del mundo pasa por Pix.enhance (doble resolución, luz, sombra y contorno)
  const E = c => Pix.enhance(c);
  const EO = o => Object.assign({}, o, { spr: E(o.spr) });
  // vehículo dibujado a doble detalle: sprite nuevo + datos 3D del modelo base
  const HDV = (spr, base) => Object.assign({}, base, { spr: Pix.finish(spr) });

  // Patrullero de la Policía: blanco con franja verde y balizas roja/azul
  function police() {
    const base = sedan('#eef0f4', false);
    const o = HDV(sedanHD('#eef0f4', 'police'), base);
    o.police = true;
    o.box = Object.assign({}, base.box, { stripe: [0.5, 0.63, '#1d6b3a'] });
    return o;
  }

  function build() {
    return {
      cars: [
        ...['taxi', 'taxi'].map(k => withSide(HDV(sedanHD('#f2c230', k), sedan('#f2c230', true)), sedanSide('#f2c230', k))),
        ...['#e8e8ee', '#9aa0ac', '#b3161b', '#1f3f8a'].map(c => withSide(HDV(sedanHD(c), sedan(c, false)), sedanSide(c))),
        ...['#1a1a22', '#e8e8ee'].map(c => withSide(HDV(suvHD(c), suv(c)), suvSide(c))),
        ...[['#7fb3c8', '#4f8398'], ['#f0e2c0', '#b8a888'], ['#e07b39', '#a04a1a']].map(([c, s]) => withSide(EO(beetle(c, s)), beetleSide(c, s))),
        withSide(EO(combi()), vanSide('combi')), withSide(EO(pickup()), pickupSide()),
        ...[['#c8323a', '#ffd23f'], ['#1f5fd0', '#f4f4f4'], ['#e8b818', '#1f5fd0']].map(([c, k]) =>
          withSide(HDV(mototaxiHD(c, k), mototaxi(c)), mototaxiSide(c, k), { noHood: true })),
        withSide(police(), sedanSide('#eef0f4', 'police')),
      ],
      palms: [palm(1), palm(2), palm(3)].map(E),
      umbrellas: [umbrella('#d83a3a', '#f4ead0'), umbrella('#2aa8a8', '#f4ead0'), umbrella('#ffd23f', '#e07b39')].map(E),
      lifeguard: E(lifeguard()), surf: E(surf()), stall: E(stall()), lamp: E(lamp()),
      cliffs: [cliff(3), cliff(9), cliff(17)].map(c => Pix.enhance(c, { outline: false })), rock: E(rock()), bush: E(bush()),
      billboards: [['CHICHA MORADA', '¡BIEN HELADA!'], ['VISITE', 'MIRAFLORES'], ['RIDE SAFE', 'USA CASCO'], ['DISCIPLINA HOY', 'LIBERTAD MAÑANA'], ['SUEÑA·PLANIFICA', 'TRABAJA·LOGRA']].map(l => E(billboard(l))),
      signs: [['SAN MIGUEL'], ['MAGDALENA'], ['SAN ISIDRO'], ['MIRAFLORES'], ['BARRANCO'], ['CHORRILLOS'], ['LIMA, PERÚ >', 'COSTA VERDE']].map(l => E(Sprites.sign(l, 22))),
      coin: [0, 1, 2, 3].map(f => E(coin(f))), fuel: E(fuel()), nitro: E(nitro()),
      glowWarm: glow(255, 200, 120, 1), glowRed: glow(255, 40, 40, 1), glowWhite: glow(255, 240, 200, 1),
      glowBlue: glow(60, 120, 255, 1), ambulance: withSide(EO(ambulance()), vanSide('ambulance')),
      medic: [E(medic(0)), E(medic(1))],
    };
  }
  const carryHD = b => E(carry(bikeColors(b)));

  const F = c => Pix.finish(c);
  const rearSetHD = b => { const s = rearSet(b); return { ride: s.ride.map(F), empty: F(s.empty) }; };
  const flyingRiderHD = b => { const r = flyingRider(b); return { frames: r.frames.map(F), lying: F(r.lying) }; };

  return { build, bike, rearSet: rearSetHD, flyingRider: flyingRiderHD, carry: carryHD };
})();
