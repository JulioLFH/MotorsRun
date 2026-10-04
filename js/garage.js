'use strict';
// Menú principal: el garaje con la moto, los cuadros y la vista a la Costa Verde.
const Garage = (() => {
  const WIN = { x: 296, y: 18, w: 88, h: 152 };
  const SHOP = { x: 2, y: 172, w: 62, h: 19 };
  let staticC = null, signLima = null;

  function bricks(g) {
    Pix.rect(g, 0, 0, 296, 172, '#1b1c23');
    const shades = ['#24252e', '#262731', '#22232b', '#282a34'];
    let i = 0;
    for (let row = 0; row * 6 < 172; row++) {
      const off = (row % 2) * 7;
      for (let x = -off; x < 296; x += 14) Pix.rect(g, x + 1, row * 6 + 1, 13, 5, shades[(i++ * 7 + row) % 4]);
    }
  }

  function poster(g, x, y, w, h, lines, gap, top) {
    Pix.rect(g, x - 1, y - 1, w + 2, h + 2, '#3c3d48');
    Pix.rect(g, x, y, w, h, '#0f0f14');
    lines.forEach((l, i) => PixelFont.draw(g, l, x + w / 2, y + top + i * gap, '#e8e8ee', 1, 'center'));
  }

  function build() {
    const { c, g } = Pix.canvas(384, 216);
    bricks(g);

    // techo, puerta enrollable y marco
    Pix.rect(g, 0, 0, 384, 7, '#121319');
    Pix.rect(g, 0, 7, 296, 1, '#0d0e13');
    Pix.rect(g, 108, 7, 104, 3, '#3a3b45');
    Pix.rect(g, 110, 9, 100, 1, '#ffe6b0');
    Pix.rect(g, 296, 7, 88, 11, '#2b2d36');
    for (let y = 8; y < 18; y += 3) Pix.rect(g, 296, y, 88, 1, '#1f2028');
    Pix.rect(g, 290, 0, 6, 172, '#3b3d48');
    Pix.rect(g, 291, 0, 1, 172, '#555866');

    // repisa superior: casco y planta
    Pix.rect(g, 0, 54, 60, 3, '#5a3d26'); Pix.rect(g, 0, 57, 60, 1, '#3a2716');
    Pix.disc(g, 22, 45, 8, '#121216');
    Pix.rect(g, 24, 42, 7, 4, '#2d3a58'); Pix.px(g, 26, 42, '#8fb0e0');
    Pix.line(g, 15, 42, 20, 37, '#d01c1f', 2); Pix.line(g, 17, 43, 22, 38, '#f4f4f4'); Pix.line(g, 18, 45, 24, 38, '#d01c1f');
    Pix.px(g, 18, 40, '#4a4b5c'); Pix.px(g, 19, 39, '#4a4b5c');
    Pix.rect(g, 15, 52, 15, 2, '#0b0b0f');
    Pix.rect(g, 42, 47, 10, 7, '#b5562a'); Pix.rect(g, 42, 47, 10, 1, '#d06a35');
    for (const [x, y, r] of [[44, 43, 2], [49, 42, 2], [47, 39, 2], [42, 40, 1], [51, 45, 1]]) Pix.disc(g, x, y, r, '#2e7d32');
    for (const [x, y] of [[44, 42], [48, 38], [49, 41]]) Pix.px(g, x, y, '#5fbf62');

    // repisa con aceites
    Pix.rect(g, 0, 82, 60, 3, '#5a3d26'); Pix.rect(g, 0, 85, 60, 1, '#3a2716');
    for (const [x, y, w, col] of [[3, 68, 8, '#c0392b'], [13, 72, 7, '#e67e22'], [22, 66, 5, '#2c3e50'], [29, 70, 9, '#7f8c8d'], [40, 68, 5, '#d4ac0d'], [47, 71, 9, '#1f5fd0']]) {
      Pix.rect(g, x, y, w, 82 - y, col);
      Pix.rect(g, x, y + 4, w, 3, '#e8e8ee');
      Pix.rect(g, x + 1, y - 1, w - 2, 1, '#1a1a1f');
    }

    // panel de herramientas
    Pix.rect(g, 2, 89, 54, 36, '#2b2c35');
    for (let y = 91; y < 124; y += 4) for (let x = 4; x < 55; x += 4) Pix.px(g, x, y, '#202129');
    for (let i = 0; i < 6; i++) {
      const x = 6 + i * 5, len = 12 + i * 2;
      Pix.line(g, x, 93, x, 93 + len, '#b8bcc6');
      Pix.rect(g, x - 1, 91, 3, 2, '#d0d4dc');
    }
    Pix.line(g, 42, 94, 42, 118, '#7a4f2a', 2); Pix.rect(g, 38, 92, 9, 3, '#8a8f9c');
    Pix.rect(g, 50, 93, 3, 7, '#d01c1f'); Pix.line(g, 51, 100, 51, 116, '#c9ced8');

    // caja de herramientas roja
    Pix.rect(g, 0, 126, 56, 3, '#d42a2f');
    Pix.rect(g, 0, 129, 56, 41, '#b3161b');
    for (const y of [131, 139, 147, 155, 163]) {
      Pix.rect(g, 2, y + 6, 52, 1, '#6e0c10');
      Pix.rect(g, 18, y + 2, 20, 1, '#c9ced8');
    }
    Pix.rect(g, 54, 129, 2, 41, '#7a0f12');
    Pix.rect(g, 58, 148, 18, 22, '#1e1f26'); Pix.rect(g, 60, 152, 6, 1, '#8a8f9c');

    // chaqueta colgada
    Pix.line(g, 70, 76, 70, 82, '#8a8f9c');
    Pix.line(g, 62, 84, 78, 84, '#5a5d6a');
    Pix.poly(g, [[62, 84], [78, 84], [80, 92], [79, 117], [61, 117], [60, 92]], '#15151b');
    Pix.rect(g, 56, 88, 5, 26, '#1a1a21'); Pix.rect(g, 79, 88, 5, 26, '#1a1a21');
    Pix.rect(g, 56, 98, 5, 2, '#c0151a'); Pix.rect(g, 79, 98, 5, 2, '#c0151a');
    Pix.line(g, 62, 86, 66, 93, '#c0151a'); Pix.line(g, 78, 86, 74, 93, '#c0151a');
    Pix.rect(g, 66, 83, 8, 2, '#2a2a33');
    Pix.line(g, 70, 85, 70, 116, '#3a3b45');

    // cuadro 1: DISCIPLINA HOY, LIBERTAD MAÑANA
    poster(g, 88, 32, 46, 42, ['DISCIPLINA', 'HOY,', 'LIBERTAD', 'MAÑANA'], 7, 4);
    Pix.line(g, 104, 69, 109, 64, '#e8e8ee'); Pix.line(g, 109, 64, 112, 67, '#e8e8ee');
    Pix.line(g, 112, 67, 114, 65, '#e8e8ee'); Pix.line(g, 114, 65, 118, 69, '#e8e8ee');

    // cuadro central: foto con la moto y birrete
    Pix.rect(g, 142, 30, 54, 46, '#6b4a2a');
    Pix.rect(g, 144, 32, 50, 42, '#4a3018');
    const pic = [['#1a2354', 8], ['#232b62', 8], ['#2f3470', 8], ['#3b3a70', 6]];
    let py = 35;
    for (const [col, h] of pic) { Pix.rect(g, 147, py, 44, h, col); py += h; }
    Pix.disc(g, 183, 40, 2, '#f2ecd2');
    Pix.poly(g, [[147, 62], [158, 54], [168, 60], [176, 52], [191, 62]], '#141a3c');
    Pix.rect(g, 147, 62, 44, 9, '#26232c');
    Pix.disc(g, 163, 67, 2, '#0e0e12'); Pix.disc(g, 174, 67, 2, '#0e0e12');
    Pix.rect(g, 164, 63, 9, 2, '#d01c1f'); Pix.rect(g, 166, 62, 5, 1, '#ff5a4a');
    Pix.rect(g, 168, 57, 3, 5, '#15151b'); Pix.disc(g, 170, 56, 1, '#15151b');
    Pix.rect(g, 157, 56, 4, 9, '#15151b'); Pix.disc(g, 159, 54, 1, '#c99a6a');
    Pix.rect(g, 155, 51, 8, 1, '#0b0b0f'); Pix.rect(g, 157, 52, 4, 1, '#0b0b0f');
    Pix.px(g, 162, 52, '#ffd23f'); Pix.px(g, 162, 53, '#ffd23f');
    Pix.rect(g, 147, 35, 44, 1, 'rgba(255,255,255,0.15)');

    // cuadro 2: SUEÑA PLANIFICA TRABAJA LOGRA
    poster(g, 204, 32, 46, 42, ['SUEÑA', 'PLANIFICA', 'TRABAJA', 'LOGRA'], 7, 12);
    Pix.rect(g, 222, 38, 11, 3, '#e8e8ee');
    Pix.px(g, 222, 36, '#e8e8ee'); Pix.px(g, 222, 37, '#e8e8ee'); Pix.px(g, 227, 36, '#e8e8ee');
    Pix.px(g, 227, 37, '#e8e8ee'); Pix.px(g, 232, 36, '#e8e8ee'); Pix.px(g, 232, 37, '#e8e8ee');
    Pix.px(g, 227, 39, '#d01c1f');

    // repisa con planta y reloj
    Pix.rect(g, 256, 30, 32, 2, '#5a3d26');
    Pix.rect(g, 268, 23, 8, 7, '#b5562a');
    for (const [x, y] of [[268, 20], [272, 17], [276, 20], [270, 18], [274, 19]]) Pix.disc(g, x, y, 2, '#2e7d32');
    Pix.disc(g, 272, 52, 11, '#16161c');
    Pix.disc(g, 272, 52, 9, '#e2e3e8');
    for (const [x, y] of [[272, 44], [280, 52], [272, 60], [264, 52]]) Pix.px(g, x, y, '#16161c');

    // pizarra de récord
    Pix.rect(g, 252, 78, 38, 30, '#5a3d26');
    Pix.rect(g, 254, 80, 34, 26, '#1d2b22');

    // piso
    Pix.rect(g, 0, 170, 384, 46, '#2a2b33');
    Pix.rect(g, 0, 170, 384, 1, '#3a3b45');
    Pix.rect(g, 296, 171, 88, 45, '#1f2028');
    for (const y of [180, 194, 210]) Pix.rect(g, 0, y, 296, 1, '#26272f');
    for (let i = 0; i < 300; i++) Pix.px(g, (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * 296 | 0, 171 + (i * 7) % 45, '#30313b');

    // alfombra
    Pix.poly(g, [[90, 182], [216, 182], [234, 199], [72, 199]], '#8a1015');
    Pix.poly(g, [[93, 184], [213, 184], [229, 197], [77, 197]], '#17171c');

    // caja RIDE SAFE
    Pix.rect(g, 330, 158, 46, 14, '#24252d'); Pix.rect(g, 330, 158, 46, 1, '#3a3b45');
    Pix.rect(g, 326, 172, 54, 26, '#1b1c22');
    Pix.rect(g, 326, 172, 54, 1, '#3a3b45');
    PixelFont.draw(g, 'RIDE', 333, 179, '#c9ccd4');
    PixelFont.draw(g, 'SAFE', 333, 187, '#c9ccd4');
    Pix.ring(g, 366, 185, 4, 5, '#c9ccd4'); Pix.rect(g, 367, 183, 3, 2, '#c9ccd4');

    staticC = Pix.enhance(c, { outline: false, shade: false });
    signLima = Sprites.sign(['LIMA, PERÚ >', 'COSTA VERDE'], 40);
  }

  function draw(ctx, t, o) {
    if (!staticC) build();

    // vista a la calle por la puerta abierta
    ctx.save();
    ctx.beginPath(); ctx.rect(WIN.x, WIN.y, WIN.w, WIN.h + 2); ctx.clip();
    Road.drawBackdrop(ctx, -225 + Math.sin(t * 0.2) * 6, t * 6, t, 0.12, 112);
    Road.drawSeaBand(ctx, 112, 146, t, 0.12);
    Pix.rect(ctx, WIN.x, 146, WIN.w, 1, '#fff0d8');
    Pix.rect(ctx, WIN.x, 147, WIN.w, 8, '#e0b070');
    Pix.rect(ctx, WIN.x, 155, WIN.w, 2, '#c8323a');
    Pix.rect(ctx, WIN.x, 157, WIN.w, 14, '#5c5060');
    for (let x = WIN.x - Math.floor(t * 30) % 24; x < 384; x += 24) Pix.rect(ctx, x, 163, 12, 1, '#f0e6d2');
    ctx.drawImage(signLima, 318, 150 - signLima.height);
    ctx.restore();

    ctx.drawImage(staticC, 0, 0, 384, 216);

    // luz LED del techo
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,220,160,0.022)';
    for (let y = 10; y < 200; y += 1) {
      const hw = 50 + (y - 10) * 0.45;
      ctx.fillRect(160 - hw, y, hw * 2, 1);
    }
    ctx.globalCompositeOperation = 'source-over';

    // reloj con la hora real
    const d = new Date();
    const hand = (len, ang, col) => Pix.line(ctx, 272, 52, 272 + Math.sin(ang) * len, 52 - Math.cos(ang) * len, col);
    hand(5, ((d.getHours() % 12) + d.getMinutes() / 60) * Math.PI / 6, '#16161c');
    hand(7, (d.getMinutes() + d.getSeconds() / 60) * Math.PI / 30, '#16161c');
    hand(7, d.getSeconds() * Math.PI / 30, '#d01c1f');
    Pix.px(ctx, 272, 52, '#d01c1f');

    // pizarra de récord
    PixelFont.draw(ctx, o.name.slice(0, 8), 271, 83, '#e8e8ee', 1, 'center');
    PixelFont.draw(ctx, 'S/' + o.coins, 271, 91, '#ffd27a', 1, 'center');
    PixelFont.draw(ctx, 'R ' + o.best, 271, 99, '#9fd3a0', 1, 'center');
    if (Math.sin(t * 3) > -0.5) PixelFont.draw(ctx, o.touch ? 'PERFIL' : 'U:PERFIL', 271, 111, '#8a8fa8', 1, 'center');

    // moto en grande + reflejo en el piso
    const mx = 106, my = 108;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 192, 296, 24); ctx.clip();
    ctx.globalAlpha = 0.14;
    ctx.translate(0, 2 * 192); ctx.scale(1, -1);
    ctx.drawImage(o.park, mx, my - 1, 100, 84);
    ctx.restore();
    ctx.drawImage(o.park, mx, my, 100, 84);

    // título
    const bob = Math.round(Math.sin(t * 2) * 1);
    PixelFont.outline(ctx, 'MOTORSRUN', 145, 13 + bob, r => (r < 2 ? '#ff6a5a' : r < 4 ? '#e8343a' : '#a8141a'), '#0a0a0f', 3, 'center');

    // selector de moto (entre las que ya tiene el piloto)
    const blink = Math.sin(t * 6) > -0.2;
    if (blink && o.owned > 1) {
      PixelFont.outline(ctx, '<', 92, 140, o.color.light, '#0a0a0f', 3, 'center');
      PixelFont.outline(ctx, '>', 220, 140, o.color.light, '#0a0a0f', 3, 'center');
    }
    PixelFont.outline(ctx, o.color.name, 156, 192, o.color.light, '#0a0a0f', 1, 'center');

    // botón de la tienda (letrero colgado sobre la caja de herramientas)
    const S = SHOP, glow = Math.sin(t * 3) > 0;
    Pix.rect(ctx, S.x, S.y, S.w, S.h, '#2a1810');
    Pix.rect(ctx, S.x + 1, S.y + 1, S.w - 2, S.h - 2, glow ? '#d42a2f' : '#b3161b');
    Pix.rect(ctx, S.x + 1, S.y + 1, S.w - 2, 1, 'rgba(255,255,255,0.35)');
    PixelFont.draw(ctx, 'TIENDA', S.x + S.w / 2, S.y + 4, '#fff2d0', 1, 'center', '#5a0a0e');
    PixelFont.draw(ctx, o.touch ? 'DE MOTOS' : 'DE MOTOS (T)', S.x + S.w / 2, S.y + 11, '#ffd27a', 1, 'center', '#5a0a0e');
    PixelFont.draw(ctx, o.version, 3, 1, '#5a5d6a');

    // ícono de sonido
    Pix.rect(ctx, 366, 22, 3, 4, '#e8e8ee'); Pix.poly(ctx, [[369, 22], [372, 19], [372, 29], [369, 26]], '#e8e8ee');
    if (o.muted) Pix.line(ctx, 374, 21, 380, 27, '#ff5a4a'); else { Pix.line(ctx, 374, 22, 374, 25, '#e8e8ee'); Pix.line(ctx, 376, 20, 376, 27, '#e8e8ee'); }

    // textos inferiores
    ctx.fillStyle = 'rgba(5,6,13,0.7)';
    ctx.fillRect(0, 200, 384, 16);
    if (Math.sin(t * 4) > -0.4) {
      PixelFont.draw(ctx, o.touch ? 'TOCA LA PANTALLA PARA RODAR' : 'PRESIONA ENTER PARA RODAR', 192, 202, '#ffd27a', 1, 'center');
    }
    PixelFont.draw(ctx, o.touch ? '< >: CAMBIAR DE MOTO · TIENDA: COMPRAR MOTOS' : '↑ ACELERAR · ← → MANEJAR · ↓ FRENO · ESPACIO NITRO · T TIENDA', 192, 209, '#8a8fa8', 1, 'center');
  }

  return { draw, SHOP, ARROW_L: { x: 80, y: 128, w: 26, h: 30 }, ARROW_R: { x: 208, y: 128, w: 26, h: 30 }, SOUND: { x: 362, y: 18, w: 22, h: 14 }, PROFILE: { x: 248, y: 76, w: 46, h: 42 } };
})();
