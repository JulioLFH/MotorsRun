/**
 * MotorsRun - servidor en Google Apps Script.
 * Guarda los pilotos en la hoja "Pilotos" de esta hoja de cálculo.
 *
 * Instalación: Extensiones > Apps Script > pegar este código > Implementar >
 * Nueva implementación > Aplicación web > Ejecutar como: Yo > Acceso: Cualquier usuario.
 */
const SHEET = 'Pilotos';
const HEAD = ['Nombre', 'Monedas', 'Récord', 'Mejor km', 'Km totales', 'Partidas', 'Monedas ganadas', 'Color', 'Creado', 'Última partida', 'PIN (cifrado)', 'Motos', 'Moto actual'];
const COL_PIN = 11, COL_OWNED = 12, COL_BIKE = 13;
const MAX_COINS_PER_RUN = 1000;
const VERSION = '1.2.0';

// Precios del concesionario (deben coincidir con js/bikes.js)
const BIKES = {
  yb125: 0, gn125: 120, gixxer150: 250, fzs: 400, mt15: 600, cf250nk: 850, vstrom250: 1150, gixxersf250: 1500,
  duke250: 1900, mt03: 2400, duke390: 3000, r3: 3800, cf450srs: 4800, tenere700: 6000, cf675srr: 7500, mt09: 9000,
};
const START_BIKE = 'yb125';

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 140);
    sh.hideColumns(COL_PIN);
  }
  if (sh.getLastColumn() < HEAD.length || sh.getRange(1, HEAD.length).getValue() !== HEAD[HEAD.length - 1]) {
    sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]);
  }
  sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#c8323a').setFontColor('#fff2d0');
  return sh;
}

function owned_(v) {
  const list = String(v || '').split(',').map(s => s.trim()).filter(id => id in BIKES);
  if (list.indexOf(START_BIKE) < 0) list.unshift(START_BIKE);
  return list;
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
  const owned = owned_(r[COL_OWNED - 1]);
  const bike = owned.indexOf(r[COL_BIKE - 1]) >= 0 ? r[COL_BIKE - 1] : START_BIKE;
  return {
    name: r[0], coins: +r[1] || 0, best: +r[2] || 0, bestKm: +r[3] || 0, totalKm: +r[4] || 0,
    games: +r[5] || 0, totalCoins: +r[6] || 0, color: +r[7] || 0, owned, bike,
  };
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// GET: ranking de los 10 mejores récords (no expone PINs)
function doGet() {
  const sh = sheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return out_({ ok: true, version: VERSION, ranking: [] });
  const ranking = sh.getRange(2, 1, n, 4).getValues()
    .map(r => ({ name: r[0], coins: +r[1] || 0, best: +r[2] || 0, bestKm: +r[3] || 0 }))
    .sort((a, b) => b.best - a.best)
    .slice(0, 10);
  return out_({ ok: true, version: VERSION, ranking });
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
      sh.appendRow([name, 0, 0, 0, 0, 0, 0, 0, now, '', h, START_BIKE, START_BIKE]);
      return out_({ ok: true, profile: read_(sh, sh.getLastRow()) });
    }

    if (!row) return out_({ ok: false, error: 'Ese piloto no existe. Usa CREAR.' });
    if (sh.getRange(row, COL_PIN).getValue() !== h) return out_({ ok: false, error: 'PIN incorrecto.' });

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

    if (b.action === 'buy') {
      const id = String(b.bike || '');
      if (!(id in BIKES)) return out_({ ok: false, error: 'Esa moto no existe.' });
      const p = read_(sh, row);
      if (p.owned.indexOf(id) < 0) {
        const price = BIKES[id];
        if (p.coins < price) return out_({ ok: false, error: 'Te faltan S/ ' + (price - p.coins) + '.' });
        p.owned.push(id);
        sh.getRange(row, 2).setValue(p.coins - price);
        sh.getRange(row, COL_OWNED).setValue(p.owned.join(','));
      }
      sh.getRange(row, COL_BIKE).setValue(id);
      return out_({ ok: true, profile: read_(sh, row) });
    }

    if (b.action === 'bike') {
      const p = read_(sh, row);
      if (p.owned.indexOf(String(b.bike)) < 0) return out_({ ok: false, error: 'Todavía no tienes esa moto.' });
      sh.getRange(row, COL_BIKE).setValue(String(b.bike));
      return out_({ ok: true, profile: read_(sh, row) });
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
