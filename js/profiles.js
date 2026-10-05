'use strict';
// Perfiles de piloto: billetera (monedas acumuladas), récord, color y estadísticas.
// Con MOTORSRUN_API configurada, cada piloto se guarda en Google Sheets y entra con nombre + PIN
// desde cualquier dispositivo. Sin ella, los perfiles viven solo en este navegador.
const Profiles = (() => {
  const KEY = 'motorsrun.profiles.v2';
  const OLD_KEYS = ['motorsrun.profiles.v1'];
  const OLD_SAVE = 'motorsrun.save.v1';
  const api = () => String(window.MOTORSRUN_API || '').trim();
  const online = () => !!api();
  let data = { current: null, list: [] };
  let modal = null, onClose = null, busy = false;
  const syncing = new Map();

  function persist() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* sin almacenamiento */ } }

  function blank(name, pin) {
    return {
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name, pin: pin || '', coins: 0, best: 0, bestKm: 0, games: 0, totalKm: 0, totalCoins: 0, color: 0,
      owned: [BIKE_START], bike: BIKE_START,
      pending: [], created: new Date().toISOString(),
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) data = Object.assign({ current: null, list: [] }, JSON.parse(raw));
    } catch (e) { /* datos corruptos: se empieza de cero */ }
    if (!Array.isArray(data.list)) data.list = [];
    if (!data.list.length) {
      // migra perfiles de versiones anteriores (quedan como pilotos locales)
      try {
        for (const k of OLD_KEYS) {
          const old = JSON.parse(localStorage.getItem(k) || 'null');
          if (old && Array.isArray(old.list)) for (const p of old.list) data.list.push(Object.assign(blank(p.name), p, { pin: '', pending: [] }));
        }
        if (!data.list.length) {
          const old = JSON.parse(localStorage.getItem(OLD_SAVE) || '{}');
          if (old.best > 0) data.list.push(Object.assign(blank('PILOTO'), { best: old.best | 0, bestKm: +old.bestKm || 0, color: old.color | 0 }));
        }
      } catch (e) { /* ignorar */ }
    }
    for (const p of data.list) {
      if (!Array.isArray(p.pending)) p.pending = [];
      fixBikes(p);
    }
    if (!data.list.find(p => p.id === data.current)) data.current = data.list[0] ? data.list[0].id : null;
    persist();
  }

  const current = () => data.list.find(p => p.id === data.current) || null;
  const clean = s => String(s).toUpperCase().replace(/[^A-Z0-9ÑÁÉÍÓÚÜ ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 10);
  const isCloud = p => online() && !!p.pin;

  // ---------- Servidor (Google Apps Script) ----------
  async function call(action, body) {
    let res;
    try {
      // text/plain evita la verificación CORS previa, que Apps Script no responde
      res = await fetch(api(), { method: 'POST', body: JSON.stringify(Object.assign({ action }, body)) });
    } catch (e) {
      throw new Error('Sin conexión. Revisa tu internet e inténtalo otra vez.');
    }
    let j;
    try { j = await res.json(); } catch (e) { throw new Error('El servidor no respondió bien. Inténtalo en un momento.'); }
    if (!j.ok) throw new Error(j.error || 'Error del servidor.');
    return j;
  }

  function fixBikes(p) {
    if (!Array.isArray(p.owned)) p.owned = [];
    p.owned = p.owned.filter(id => BIKES.some(b => b.id === id));
    if (!p.owned.includes(BIKE_START)) p.owned.unshift(BIKE_START);
    if (!p.owned.includes(p.bike)) p.bike = BIKE_START;
  }

  // ---------- Compras con un servidor antiguo (sin acción "buy") ----------
  // El servidor viejo solo deja escribir la columna "Color". Ahí se guardan, en un solo número,
  // las monedas gastadas, las motos compradas (máscara de bits) y la moto en uso.
  const ENC = 1e12, B16 = 65536, B20 = 1048576;
  function decodeShop(n) {
    n = +n || 0;
    if (n < ENC) return null;
    n -= ENC;
    return { spent: Math.floor(n / B20), bike: Math.floor(n / B16) % 16, mask: n % B16 };
  }
  function encodeShop(spent, bikeIdx, mask) { return ENC + spent * B20 + bikeIdx * B16 + mask; }
  const maskOf = owned => owned.reduce((m, id) => { const i = BIKES.findIndex(b => b.id === id); return i >= 0 ? m | (1 << i) : m; }, 0);

  function merge(p, s) {
    if (!s) return;
    Object.assign(p, {
      coins: s.coins, best: s.best, bestKm: s.bestKm, games: s.games,
      totalKm: s.totalKm, totalCoins: s.totalCoins, color: s.color,
    });
    // un servidor antiguo (sin tienda) no envía motos: se conservan las locales
    if (Array.isArray(s.owned)) p.owned = s.owned.slice();
    if (s.bike) p.bike = s.bike;
    const shop = decodeShop(s.color);
    p.spent = shop ? shop.spent : 0;
    if (shop) {
      // billetera = monedas ganadas en el servidor - monedas gastadas en la tienda
      p.coins = Math.max(0, s.coins - shop.spent);
      BIKES.forEach((b, i) => { if ((shop.mask >> i) & 1 && !p.owned.includes(b.id)) p.owned.push(b.id); });
      if (!s.bike && BIKES[shop.bike]) p.bike = BIKES[shop.bike].id;
    }
    fixBikes(p);
  }

  // Guarda compras y moto en uso en la columna Color (servidor antiguo)
  async function saveShopLegacy(p, extraSpent) {
    const spent = (p.spent || 0) + extraSpent;
    const idx = Math.max(0, BIKES.findIndex(b => b.id === p.bike));
    const j = await call('color', { name: p.name, pin: p.pin, color: encodeShop(spent, idx, maskOf(p.owned)) });
    merge(p, j.profile);
  }

  // ---------- Concesionario ----------
  async function buy(b) {
    const p = current();
    if (!p) throw new Error('Primero elige un piloto.');
    if (p.owned.includes(b.id)) return p;
    if (isCloud(p)) {
      await flush(p);
      if (p.pending.length) await flush(p);
      if (p.pending.length) throw new Error('Sin conexión. Inténtalo de nuevo.');
      if (p.coins < b.price) throw new Error('Te faltan S/ ' + (b.price - p.coins) + '.');
      try {
        merge(p, (await call('buy', { name: p.name, pin: p.pin, bike: b.id, price: b.price })).profile);
      } catch (e) {
        if (!/desconocida/i.test(e.message)) throw e;
        // servidor antiguo: la compra se registra en la columna Color
        const prevOwned = p.owned.slice(), prevBike = p.bike;
        p.owned.push(b.id); p.bike = b.id;
        try { await saveShopLegacy(p, b.price); } catch (err) { p.owned = prevOwned; p.bike = prevBike; throw err; }
      }
      persist();
      return p;
    }
    if (p.coins < b.price) throw new Error('Te faltan S/ ' + (b.price - p.coins) + '.');
    p.coins -= b.price;
    p.owned.push(b.id);
    p.bike = b.id;
    persist();
    return p;
  }

  function useBike(id) {
    const p = current();
    if (!p || !p.owned.includes(id)) return;
    p.bike = id;
    persist();
    if (isCloud(p)) {
      call('bike', { name: p.name, pin: p.pin, bike: id })
        .catch(e => { if (/desconocida/i.test(e.message)) return saveShopLegacy(p, 0).then(persist); })
        .catch(() => {});
    }
  }

  // Envía las partidas pendientes; si no hay internet quedan guardadas y se reintentan.
  // si ya hay un envío en curso, devuelve esa misma promesa para poder esperarla
  function flush(p) {
    if (!isCloud(p)) return Promise.resolve();
    if (syncing.has(p.id)) return syncing.get(p.id);
    const job = flushNow(p);
    syncing.set(p.id, job);
    return job;
  }
  async function flushNow(p) {
    try {
      let last = null;
      while (p.pending.length) {
        last = await call('run', Object.assign({ name: p.name, pin: p.pin }, p.pending[0]));
        p.pending.shift();
        persist();
      }
      if (last) merge(p, last.profile);
      else merge(p, (await call('login', { name: p.name, pin: p.pin })).profile);
      persist();
    } catch (e) { /* se reintenta en la próxima partida o al abrir el juego */ }
    finally { syncing.delete(p.id); }
  }

  function remember(profile, pin) {
    let p = data.list.find(x => x.name === profile.name && (x.pin || '') === (pin || ''));
    if (!p) { p = blank(profile.name, pin); data.list.push(p); }
    merge(p, profile);
    data.current = p.id;
    persist();
    return p;
  }

  async function create(name, pin) {
    name = clean(name);
    if (!name) throw new Error('Escribe un nombre (letras o números).');
    if (!online()) {
      if (data.list.some(p => p.name === name)) throw new Error('Ese piloto ya existe en este dispositivo.');
      return remember(blank(name), '');
    }
    if (!/^\d{4}$/.test(pin)) throw new Error('El PIN debe tener 4 números.');
    const j = await call('register', { name, pin });
    return remember(j.profile, pin);
  }

  async function enter(name, pin) {
    name = clean(name);
    if (!name) throw new Error('Escribe el nombre del piloto.');
    if (!/^\d{4}$/.test(pin)) throw new Error('El PIN debe tener 4 números.');
    const j = await call('login', { name, pin });
    return remember(j.profile, pin);
  }

  function select(id) {
    const p = data.list.find(x => x.id === id);
    if (!p) return;
    data.current = id; persist();
    flush(p);
  }

  function forget(id) {
    data.list = data.list.filter(p => p.id !== id);
    if (data.current === id) data.current = data.list[0] ? data.list[0].id : null;
    persist();
  }

  // Suma el resultado de una partida al piloto activo (al instante en pantalla y luego en la nube).
  function addRun(run) {
    const p = current();
    if (!p) return { newBest: false };
    const newBest = run.score > p.best;
    p.coins += run.coins; p.totalCoins += run.coins;
    p.games++; p.totalKm += run.km;
    p.bestKm = Math.max(p.bestKm, run.km);
    if (newBest) p.best = run.score;
    if (isCloud(p)) p.pending.push({ coins: run.coins, score: run.score, km: Math.round(run.km * 100) / 100 });
    persist();
    flush(p);
    return { newBest };
  }

  function update(fields) {
    const p = current();
    if (!p) return;
    Object.assign(p, fields);
    persist();
    if (isCloud(p) && fields.color !== undefined) call('color', { name: p.name, pin: p.pin, color: fields.color }).catch(() => {});
  }

  async function ranking() {
    if (!online()) return null;
    try { const r = await fetch(api()); const j = await r.json(); return j.ok ? j.ranking : null; } catch (e) { return null; }
  }

  // ---------- Ventana de pilotos ----------
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function render(msg) {
    modal.innerHTML = '';
    const card = el('div', 'pf-card');
    card.appendChild(el('div', 'pf-kicker', online() ? 'MOTORSRUN · PILOTOS EN LÍNEA' : 'MOTORSRUN · COSTA VERDE'));
    card.appendChild(el('h2', 'pf-title', '¿QUIÉN MANEJA?'));

    const list = el('div', 'pf-list');
    if (!data.list.length) list.appendChild(el('p', 'pf-empty', online()
      ? 'Crea tu piloto con un PIN de 4 números. Con ese nombre y PIN entras desde cualquier celular o PC con tus mismas monedas.'
      : 'Aún no hay pilotos. Crea el tuyo para guardar tus monedas.'));
    for (const p of data.list) {
      const row = el('div', 'pf-row' + (p.id === data.current ? ' pf-active' : ''));
      const pick = el('button', 'pf-pick');
      pick.type = 'button';
      pick.appendChild(el('span', 'pf-name', p.name));
      pick.appendChild(el('span', 'pf-coins', 'S/ ' + p.coins));
      const where = isCloud(p) ? (p.pending.length ? 'en línea · sincronizando' : 'en línea') : 'solo este dispositivo';
      pick.appendChild(el('span', 'pf-stats', `Récord ${p.best} · ${p.bestKm.toFixed(2)} km · ${p.games} partidas · ${where}`));
      pick.addEventListener('click', () => { select(p.id); close(); });
      const del = el('button', 'pf-del', '✕');
      del.type = 'button';
      del.title = isCloud(p) ? 'Quitar de este dispositivo' : 'Borrar piloto';
      del.addEventListener('click', () => {
        if (del.dataset.armed) { forget(p.id); render(); return; }
        del.dataset.armed = '1';
        del.textContent = '¿SÍ?';
        setTimeout(() => { if (del.isConnected) { delete del.dataset.armed; del.textContent = '✕'; } }, 3000);
      });
      row.appendChild(pick); row.appendChild(del);
      list.appendChild(row);
    }
    card.appendChild(list);

    const form = el('form', 'pf-form');
    const name = el('input', 'pf-input');
    name.id = 'pf-name'; name.maxLength = 10; name.placeholder = 'NOMBRE'; name.autocomplete = 'off'; name.spellcheck = false;
    name.setAttribute('aria-label', 'Nombre del piloto');
    form.appendChild(name);
    let pin = null;
    if (online()) {
      pin = el('input', 'pf-input pf-pin');
      pin.id = 'pf-pin'; pin.type = 'password'; pin.inputMode = 'numeric'; pin.maxLength = 4; pin.placeholder = 'PIN';
      pin.autocomplete = 'off'; pin.setAttribute('aria-label', 'PIN de 4 números');
      pin.addEventListener('input', () => { pin.value = pin.value.replace(/\D/g, '').slice(0, 4); });
      form.appendChild(pin);
    }
    const btns = el('div', 'pf-btns');
    const add = el('button', 'pf-add', 'CREAR');
    add.type = 'submit'; add.dataset.act = 'create';
    btns.appendChild(add);
    if (online()) {
      const ent = el('button', 'pf-add pf-enter', 'ENTRAR');
      ent.type = 'submit'; ent.dataset.act = 'enter';
      btns.appendChild(ent);
    }
    form.appendChild(btns);
    const status = el('div', 'pf-error', msg || '');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (busy) return;
      const act = (e.submitter && e.submitter.dataset.act) || 'create';
      busy = true;
      status.className = 'pf-status'; status.textContent = 'Conectando…';
      form.querySelectorAll('button,input').forEach(x => { x.disabled = true; });
      try {
        if (act === 'enter') await enter(name.value, pin.value);
        else await create(name.value, pin ? pin.value : '');
        busy = false;
        close();
      } catch (err) {
        busy = false;
        form.querySelectorAll('button,input').forEach(x => { x.disabled = false; });
        status.className = 'pf-error'; status.textContent = err.message;
      }
    });
    card.appendChild(form);
    card.appendChild(status);
    if (online()) card.appendChild(el('p', 'pf-hint', '¿Ya tienes piloto? Escribe su nombre y PIN y dale a ENTRAR.'));

    if (current()) {
      const x = el('button', 'pf-close', 'VOLVER AL GARAJE');
      x.type = 'button';
      x.addEventListener('click', close);
      card.appendChild(x);
    }
    modal.appendChild(card);
    if (!data.list.length) setTimeout(() => name.focus(), 50);
  }

  function open(cb) {
    if (!modal) {
      modal = el('div');
      modal.id = 'profiles';
      modal.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Escape' && current() && !busy) close();
      });
      document.body.appendChild(modal);
    }
    onClose = cb || null;
    render();
    modal.classList.add('open');
  }

  function close() {
    if (!modal || !current()) return;
    modal.classList.remove('open');
    if (onClose) onClose(current());
  }

  const isOpen = () => !!modal && modal.classList.contains('open');

  load();
  if (current()) flush(current());
  return {
    current, create, enter, select, forget, addRun, update, ranking, open, close, isOpen, online, buy, useBike,
    isCloud: () => { const p = current(); return !!p && isCloud(p); },
    get all() { return data.list; },
  };
})();
