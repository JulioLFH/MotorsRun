/**
 * MotorsRun - servidor en Google Apps Script.
 * Guarda los pilotos en la hoja "Pilotos" de esta hoja de cálculo.
 *
 * Instalación: Extensiones > Apps Script > pegar este código > Implementar >
 * Nueva implementación > Aplicación web > Ejecutar como: Yo > Acceso: Cualquier usuario.
 */
const SHEET = 'Pilotos';
const HEAD = ['Nombre', 'Monedas', 'Récord', 'Mejor km', 'Km totales', 'Partidas', 'Monedas ganadas', 'Color', 'Creado', 'Última partida', 'PIN (cifrado)'];
const MAX_COINS_PER_RUN = 1000;

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#c8323a').setFontColor('#fff2d0');
    sh.setColumnWidth(1, 140);
    sh.hideColumns(HEAD.length);
  }
  return sh;
}

function hash_(name, pin) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, name + '|' + pin + '|motorsrun');
  return bytes.map(b => ((b + 256) % 256).toString(16).padStart(2, '0')).join('');
}

function clean_(s) {
  return String(s || '').toUpperCase().replace(/[^A-Z0-9ÑÁÉÍÓÚÜ ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 10);
}

function findRow_(sh, name) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return 0;
  const names = sh.getRange(2, 1, n, 1).getValues();
  for (let i = 0; i < names.length; i++) if (names[i][0] === name) return i + 2;
  return 0;
}

function read_(sh, row) {
  const r = sh.getRange(row, 1, 1, HEAD.length).getValues()[0];
  return {
    name: r[0], coins: +r[1] || 0, best: +r[2] || 0, bestKm: +r[3] || 0, totalKm: +r[4] || 0,
    games: +r[5] || 0, totalCoins: +r[6] || 0, color: +r[7] || 0,
  };
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// GET: ranking de los 10 mejores récords (no expone PINs)
function doGet() {
  const sh = sheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return out_({ ok: true, ranking: [] });
  const ranking = sh.getRange(2, 1, n, 4).getValues()
    .map(r => ({ name: r[0], coins: +r[1] || 0, best: +r[2] || 0, bestKm: +r[3] || 0 }))
    .sort((a, b) => b.best - a.best)
    .slice(0, 10);
  return out_({ ok: true, ranking });
}

// POST: register | login | run | color
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const b = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const sh = sheet_();
    const name = clean_(b.name);
    const pin = String(b.pin || '');
    if (!name) return out_({ ok: false, error: 'Escribe un nombre de piloto.' });
    if (!/^\d{4}$/.test(pin)) return out_({ ok: false, error: 'El PIN debe tener 4 números.' });
    const h = hash_(name, pin);
    const now = new Date();
    let row = findRow_(sh, name);

    if (b.action === 'register') {
      if (row) return out_({ ok: false, error: 'Ese piloto ya existe. Usa ENTRAR con su PIN.' });
      sh.appendRow([name, 0, 0, 0, 0, 0, 0, 0, now, '', h]);
      return out_({ ok: true, profile: read_(sh, sh.getLastRow()) });
    }

    if (!row) return out_({ ok: false, error: 'Ese piloto no existe. Usa CREAR.' });
    if (sh.getRange(row, HEAD.length).getValue() !== h) return out_({ ok: false, error: 'PIN incorrecto.' });

    if (b.action === 'login') return out_({ ok: true, profile: read_(sh, row) });

    if (b.action === 'run') {
      const p = read_(sh, row);
      const coins = Math.max(0, Math.min(MAX_COINS_PER_RUN, Math.floor(+b.coins || 0)));
      const score = Math.max(0, Math.floor(+b.score || 0));
      const km = Math.max(0, Math.min(500, +b.km || 0));
      sh.getRange(row, 2, 1, 6).setValues([[
        p.coins + coins, Math.max(p.best, score), Math.max(p.bestKm, Math.round(km * 100) / 100),
        Math.round((p.totalKm + km) * 100) / 100, p.games + 1, p.totalCoins + coins,
      ]]);
      sh.getRange(row, 10).setValue(now);
      return out_({ ok: true, profile: read_(sh, row), newBest: score > p.best });
    }

    if (b.action === 'color') {
      sh.getRange(row, 8).setValue(Math.max(0, Math.floor(+b.color || 0)));
      return out_({ ok: true, profile: read_(sh, row) });
    }

    return out_({ ok: false, error: 'Acción desconocida.' });
  } catch (err) {
    return out_({ ok: false, error: 'Error del servidor: ' + err });
  } finally {
    lock.releaseLock();
  }
}
