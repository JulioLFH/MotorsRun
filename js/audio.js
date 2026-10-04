'use strict';
// Sonido 8-bit generado con Web Audio: motor, efectos y música chiptune.
const Sound = (() => {
  let ac = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  let muted = false, eng = null;
  let musicOn = false, timer = null, nextT = 0, step = 0;
  const VOL = 0.5;

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = muted ? 0 : VOL; master.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = 0.32; musicBus.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  function tone(f, dur, type = 'square', vol = 0.15, slide = null, delay = 0, bus = null) {
    if (!ac) return;
    const t = ac.currentTime + Math.max(0, delay);
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(bus || sfxBus);
    o.start(t); o.stop(t + dur + 0.03);
  }

  function noise(dur, vol = 0.3, cut = 1200, delay = 0, bus = null) {
    if (!ac) return;
    const t = ac.currentTime + Math.max(0, delay);
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(bus || sfxBus);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
  }

  const seq = (notes, gap, type, vol, len) => notes.forEach((f, i) => tone(f, len, type, vol, null, i * gap));

  const fx = {
    jump: () => tone(220, 0.18, 'square', 0.1, 560),
    land: () => noise(0.09, 0.18, 700),
    coin: () => { tone(988, 0.07, 'square', 0.08); tone(1319, 0.14, 'square', 0.08, null, 0.06); },
    fuel: () => seq([523, 659, 784, 1047], 0.06, 'square', 0.08, 0.09),
    hit: () => { noise(0.35, 0.45, 900); tone(160, 0.3, 'sawtooth', 0.14, 50); },
    crash: () => { noise(1.0, 0.55, 650); tone(220, 0.9, 'sawtooth', 0.14, 30); },
    ramp: () => tone(260, 0.35, 'square', 0.1, 1000),
    bonus: () => seq([784, 988, 1175, 1568], 0.05, 'triangle', 0.13, 0.08),
    select: () => tone(660, 0.06, 'square', 0.08),
    start: () => seq([392, 523, 659, 784], 0.07, 'square', 0.09, 0.1),
    over: () => seq([523, 440, 349, 262], 0.16, 'triangle', 0.15, 0.2),
    milestone: () => seq([659, 784, 988, 1319], 0.08, 'square', 0.07, 0.1),
    stall: () => tone(180, 0.8, 'sawtooth', 0.1, 40),
    splash: () => { noise(0.8, 0.45, 2400); noise(0.4, 0.3, 500, 0.15); },
    whoosh: () => { noise(0.25, 0.22, 3000); tone(500, 0.2, 'triangle', 0.05, 200); },
    nitro: () => seq([440, 660, 880], 0.05, 'triangle', 0.1, 0.08),
    rumble: () => noise(0.06, 0.06, 400),
  };

  function engineOn() {
    if (!ac || eng) return;
    const o1 = ac.createOscillator(), o2 = ac.createOscillator();
    o1.type = 'sawtooth'; o2.type = 'square';
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400;
    const g = ac.createGain(); g.gain.value = 0;
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(sfxBus);
    o1.start(); o2.start();
    eng = { o1, o2, f, g };
  }

  function engineSet(speed, turbo, on) {
    if (!eng) return;
    const t = ac.currentTime;
    const base = 36 + speed * 0.17 + (turbo ? 22 : 0);
    eng.o1.frequency.setTargetAtTime(base, t, 0.08);
    eng.o2.frequency.setTargetAtTime(base * 0.5 + 1.7, t, 0.08);
    eng.f.frequency.setTargetAtTime(280 + speed * 1.4 + (turbo ? 700 : 0), t, 0.1);
    eng.g.gain.setTargetAtTime(on ? 0.045 : 0, t, 0.12);
  }

  // Música: Am - F - C - G a 140 bpm
  const PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  const LEAD = [76, -1, 74, 72, -1, 72, 71, 72, 69, -1, -1, 72, 74, -1, 76, -1];
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function playStep(s, t) {
    const bar = Math.floor(s / 16) % 4, ch = PROG[bar], i = s % 16;
    const d = t - ac.currentTime;
    if ([0, 3, 6, 8, 10, 11, 14].includes(i)) {
      tone(mtof(ch[0] - 24 + (i === 8 || i === 14 ? 12 : 0)), 0.15, 'triangle', 0.35, null, d, musicBus);
    }
    if (i % 2 === 0) tone(mtof(ch[(i / 2) % 3] + 12), 0.08, 'square', 0.035, null, d, musicBus);
    if (s >= 32 && s < 64 && LEAD[i] > 0) {
      const shift = [0, -4, -9, -2][bar];
      tone(mtof(LEAD[i] + shift), 0.18, 'square', 0.04, null, d, musicBus);
    }
    if (i % 4 === 2) noise(0.03, 0.08, 7000, d, musicBus);
    if (i === 4 || i === 12) noise(0.09, 0.14, 1800, d, musicBus);
    if (i === 0 || i === 8) tone(110, 0.1, 'sine', 0.3, 40, d, musicBus);
  }

  function schedule() {
    while (nextT < ac.currentTime + 0.12) {
      playStep(step, nextT);
      nextT += 60 / 140 / 4;
      step = (step + 1) % 128;
    }
  }

  function musicStart() {
    if (!ac || musicOn) return;
    musicOn = true; nextT = ac.currentTime + 0.05; step = 0;
    timer = setInterval(schedule, 25);
  }
  function musicStop() { musicOn = false; clearInterval(timer); timer = null; }

  function setMuted(m) {
    muted = m;
    if (master) master.gain.setTargetAtTime(m ? 0 : VOL, ac.currentTime, 0.02);
  }

  const api = { init, engineOn, engineSet, engineOff: () => engineSet(0, false, false), musicStart, musicStop, setMuted };
  for (const k in fx) api[k] = () => { if (ac) fx[k](); };
  return api;
})();
