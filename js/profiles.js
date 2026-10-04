'use strict';
// Perfiles de piloto: cada uno guarda su billetera (monedas acumuladas), récord, color y estadísticas.
const Profiles = (() => {
  const KEY = 'motorsrun.profiles.v1';
  const OLD_KEY = 'motorsrun.save.v1';
  let data = { current: null, list: [] };
  let modal = null, onClose = null;

  function persist() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* sin almacenamiento */ } }

  function blank(name) {
    return {
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name, coins: 0, best: 0, bestKm: 0, games: 0, totalKm: 0, totalCoins: 0, color: 0,
      created: new Date().toISOString(),
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) data = Object.assign({ current: null, list: [] }, JSON.parse(raw));
    } catch (e) { /* datos corruptos: se empieza de cero */ }
    if (!Array.isArray(data.list)) data.list = [];
    // migra el récord de la versión sin perfiles
    if (!data.list.length) {
      try {
        const old = JSON.parse(localStorage.getItem(OLD_KEY) || '{}');
        if (old.best > 0) {
          const p = blank('PILOTO');
          p.best = old.best | 0; p.bestKm = +old.bestKm || 0; p.color = old.color | 0;
          data.list.push(p); data.current = p.id; persist();
        }
      } catch (e) { /* ignorar */ }
    }
    if (!data.list.find(p => p.id === data.current)) data.current = data.list[0] ? data.list[0].id : null;
  }

  const current = () => data.list.find(p => p.id === data.current) || null;
  const clean = s => String(s).toUpperCase().replace(/[^A-Z0-9ÑÁÉÍÓÚÜ ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 10);

  function create(name) {
    name = clean(name);
    if (!name) return { error: 'Escribe un nombre (letras o números).' };
    if (data.list.some(p => p.name === name)) return { error: 'Ese piloto ya existe.' };
    const p = blank(name);
    data.list.push(p); data.current = p.id; persist();
    return { profile: p };
  }

  function select(id) { if (data.list.some(p => p.id === id)) { data.current = id; persist(); } }

  function remove(id) {
    data.list = data.list.filter(p => p.id !== id);
    if (data.current === id) data.current = data.list[0] ? data.list[0].id : null;
    persist();
  }

  // Suma el resultado de una partida al perfil activo.
  function addRun(run) {
    const p = current();
    if (!p) return { newBest: false };
    p.coins += run.coins; p.totalCoins += run.coins;
    p.games++; p.totalKm += run.km;
    p.bestKm = Math.max(p.bestKm, run.km);
    const newBest = run.score > p.best;
    if (newBest) p.best = run.score;
    persist();
    return { newBest };
  }

  function update(fields) { const p = current(); if (p) { Object.assign(p, fields); persist(); } }

  // ---------- Ventana de selección / creación ----------
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function render() {
    modal.innerHTML = '';
    const card = el('div', 'pf-card');
    card.appendChild(el('div', 'pf-kicker', 'MOTORSRUN · COSTA VERDE'));
    card.appendChild(el('h2', 'pf-title', '¿QUIÉN MANEJA?'));

    const list = el('div', 'pf-list');
    if (!data.list.length) list.appendChild(el('p', 'pf-empty', 'Aún no hay pilotos. Crea el tuyo para guardar tus monedas.'));
    for (const p of data.list) {
      const row = el('div', 'pf-row' + (p.id === data.current ? ' pf-active' : ''));
      const pick = el('button', 'pf-pick');
      pick.type = 'button';
      pick.appendChild(el('span', 'pf-name', p.name));
      pick.appendChild(el('span', 'pf-coins', 'S/ ' + p.coins));
      pick.appendChild(el('span', 'pf-stats', `Récord ${p.best} · ${p.bestKm.toFixed(2)} km · ${p.games} partidas`));
      pick.addEventListener('click', () => { select(p.id); close(); });
      const del = el('button', 'pf-del', '✕');
      del.type = 'button';
      del.title = 'Borrar piloto';
      // doble clic de confirmación dentro de la propia ventana
      del.addEventListener('click', () => {
        if (del.dataset.armed) { remove(p.id); render(); return; }
        del.dataset.armed = '1';
        del.textContent = '¿SÍ?';
        del.title = `Toca otra vez para borrar a ${p.name} y sus S/ ${p.coins}`;
        setTimeout(() => { if (del.isConnected) { delete del.dataset.armed; del.textContent = '✕'; } }, 3000);
      });
      row.appendChild(pick); row.appendChild(del);
      list.appendChild(row);
    }
    card.appendChild(list);

    const form = el('form', 'pf-form');
    const input = el('input', 'pf-input');
    input.maxLength = 10; input.placeholder = 'NOMBRE DEL PILOTO'; input.autocomplete = 'off'; input.spellcheck = false;
    const add = el('button', 'pf-add', 'CREAR');
    add.type = 'submit';
    const err = el('div', 'pf-error');
    form.appendChild(input); form.appendChild(add);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const r = create(input.value);
      if (r.error) { err.textContent = r.error; input.focus(); } else close();
    });
    card.appendChild(form);
    card.appendChild(err);

    if (current()) {
      const x = el('button', 'pf-close', 'VOLVER AL GARAJE');
      x.type = 'button';
      x.addEventListener('click', close);
      card.appendChild(x);
    }
    modal.appendChild(card);
    if (!data.list.length) setTimeout(() => input.focus(), 50);
  }

  function open(cb) {
    if (!modal) {
      modal = el('div');
      modal.id = 'profiles';
      modal.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Escape' && current()) close();
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
  return { current, create, select, remove, addRun, update, open, close, isOpen, get all() { return data.list; } };
})();
