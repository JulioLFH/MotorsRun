'use strict';
// Catálogo del concesionario: motos del mercado peruano (CFMOTO, Suzuki, KTM, Yamaha).
// max: velocidad máxima en km/h · nitro: % extra con turbo · accel: aceleración · grip: manejo en curvas
// type: classic | naked | sport | adventure (cambia el dibujo y, en adventure, rinde mejor en la arena)
const BIKES = [
  { id: 'yb125', brand: 'YAMAHA', model: 'YB125 CHACARERA', type: 'classic', price: 0, max: 95, nitro: 0.15, accel: 0.8, grip: 0.95, main: '#1f3f8a', accent: '#c9ced8' },
  { id: 'gn125', brand: 'SUZUKI', model: 'GN 125', type: 'classic', price: 120, max: 100, nitro: 0.15, accel: 0.85, grip: 1.0, main: '#b3161b', accent: '#c9ced8' },
  { id: 'gixxer150', brand: 'SUZUKI', model: 'GIXXER 150', type: 'naked', price: 250, max: 115, nitro: 0.16, accel: 0.95, grip: 1.05, main: '#1f5fd0', accent: '#16161c' },
  { id: 'fzs', brand: 'YAMAHA', model: 'FZ-S 4.0', type: 'naked', price: 400, max: 120, nitro: 0.16, accel: 1.0, grip: 1.05, main: '#3a3d4a', accent: '#1f5fd0' },
  { id: 'mt15', brand: 'YAMAHA', model: 'MT-15', type: 'naked', price: 600, max: 130, nitro: 0.17, accel: 1.05, grip: 1.1, main: '#24348a', accent: '#5ad1ff' },
  { id: 'cf250nk', brand: 'CFMOTO', model: '250NK', type: 'naked', price: 850, max: 140, nitro: 0.17, accel: 1.1, grip: 1.1, main: '#d01c1f', accent: '#f4f4f4' },
  { id: 'vstrom250', brand: 'SUZUKI', model: 'V-STROM 250 SX', type: 'adventure', price: 1150, max: 135, nitro: 0.17, accel: 1.05, grip: 1.3, main: '#e8b818', accent: '#16161c' },
  { id: 'gixxersf250', brand: 'SUZUKI', model: 'GIXXER SF 250', type: 'sport', price: 1500, max: 150, nitro: 0.18, accel: 1.15, grip: 1.15, main: '#1f5fd0', accent: '#c9ced8' },
  { id: 'duke250', brand: 'KTM', model: '250 DUKE', type: 'naked', price: 1900, max: 150, nitro: 0.18, accel: 1.25, grip: 1.2, main: '#f07a12', accent: '#16161c' },
  { id: 'mt03', brand: 'YAMAHA', model: 'MT-03', type: 'naked', price: 2400, max: 170, nitro: 0.18, accel: 1.3, grip: 1.2, main: '#3a3d55', accent: '#5ad1ff' },
  { id: 'duke390', brand: 'KTM', model: '390 DUKE', type: 'naked', price: 3000, max: 175, nitro: 0.19, accel: 1.4, grip: 1.25, main: '#f07a12', accent: '#f4f4f4' },
  { id: 'r3', brand: 'YAMAHA', model: 'YZF-R3', type: 'sport', price: 3800, max: 185, nitro: 0.19, accel: 1.4, grip: 1.25, main: '#1f3fa8', accent: '#f4f4f4' },
  { id: 'cf450srs', brand: 'CFMOTO', model: '450SRS', type: 'sport', price: 4800, max: 195, nitro: 0.19, accel: 1.5, grip: 1.3, main: '#e8e8ee', accent: '#1f5fd0' },
  { id: 'tenere700', brand: 'YAMAHA', model: 'TÉNÉRÉ 700', type: 'adventure', price: 6000, max: 190, nitro: 0.2, accel: 1.5, grip: 1.45, main: '#e8e8ee', accent: '#1f3fa8' },
  { id: 'cf675srr', brand: 'CFMOTO', model: '675SRR', type: 'sport', price: 7500, max: 215, nitro: 0.2, accel: 1.65, grip: 1.35, main: '#1a1a22', accent: '#d01c1f' },
  { id: 'mt09', brand: 'YAMAHA', model: 'MT-09', type: 'naked', price: 9000, max: 225, nitro: 0.2, accel: 1.8, grip: 1.4, main: '#2c2d38', accent: '#5ad1ff' },
];
const BIKE_START = 'yb125';
const CRUISE_KMH = 75;
const bikeById = id => BIKES.find(b => b.id === id) || BIKES[0];

// Colores derivados para el pixel art (claro y oscuro a partir del color principal)
function bikeColors(b) {
  const h = b.main, n = parseInt(h.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, bl = n & 255;
  const sh = (k, o) => '#' + [r, g, bl].map(v => Math.max(0, Math.min(255, Math.round(v * k + o))).toString(16).padStart(2, '0')).join('');
  return { main: h, light: sh(1.15, 50), dark: sh(0.55, 0), accent: b.accent };
}
