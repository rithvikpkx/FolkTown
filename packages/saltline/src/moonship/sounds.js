// Moonship sound recipes, generated procedurally at boot like the rest of Saltline's audio (fx.js delegates the
// old hound recipes here; audio.js keeps the 'hound_*' keys). Each takes (sampleRate, rng, variant) and returns
// a Float32Array; the mixer normalises to the table's peak, so only the shape matters.
const TAU = Math.PI * 2;
const rnd = (r) => (typeof r === 'function' ? r : Math.random);

function lp(x, sr, fc) {
  const a = 1 - Math.exp((-TAU * fc) / sr);
  let y = 0;
  for (let i = 0; i < x.length; i++) x[i] = y += a * (x[i] - y);
  return x;
}
function hp(x, sr, fc) {
  const a = 1 - Math.exp((-TAU * fc) / sr);
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    y += a * (x[i] - y);
    x[i] -= y;
  }
  return x;
}
// one-pole low-pass run twice round a loop buffer so the filter state is continuous at the wrap
function lpLoop(x, sr, fc) {
  const a = 1 - Math.exp((-TAU * fc) / sr);
  let y = 0;
  for (let p = 0; p < 2; p++)
    for (let i = 0; i < x.length; i++) {
      y += a * (x[i] - y);
      if (p) x[i] = y;
    }
  return x;
}
function noise(r, n) {
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = r() * 2 - 1;
  return o;
}

// hound_servo (loop, 2 s): soft electric drive whir. Every frequency sits on the 0.5 Hz grid so the loop is
// seamless; the game raises playback rate and gain with speed.
export function msWhir(sr, rng) {
  const r = rnd(rng),
    N = sr * 2,
    s = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / sr,
      wob = 0.35 * Math.sin(TAU * 0.5 * t) + 0.2 * Math.sin(TAU * 1.5 * t + 1),
      ph = TAU * 118 * t + wob,
      hum = Math.sin(ph) * 0.5 + Math.sin(2 * ph + 0.3) * 0.2 + Math.sin(3 * ph + 1.1) * 0.05,
      whine = Math.sin(TAU * 1416 * t + 0.5 * Math.sin(TAU * t)) * 0.08 + Math.sin(TAU * 2832 * t + 0.4) * 0.025,
      am = 0.82 + 0.18 * Math.sin(TAU * 2 * t);
    s[i] = (hum + whine) * am;
  }
  const h = noise(r, N),
    l = lpLoop(Float32Array.from(h), sr, 500);
  for (let i = 0; i < N; i++) h[i] -= l[i];
  lpLoop(h, sr, 2600);
  for (let i = 0; i < N; i++) s[i] += h[i] * 0.22;
  return s;
}

// alert, variant 1 (Moonship spots you): friendly rising "bee-boop" chirp with a tiny trailing blip.
export function msChirp(sr) {
  const s = new Float32Array(Math.round(sr * 0.42));
  let ph = 0;
  const note = (t0, dur, f0, f1, amp) => {
    const a = Math.round(t0 * sr),
      n = Math.round(dur * sr);
    for (let i = 0; i < n && a + i < s.length; i++) {
      const u = i / n,
        f = f0 * Math.pow(f1 / f0, u),
        env = Math.min(1, i / (0.004 * sr), (n - i) / (0.018 * sr));
      ph += (TAU * f) / sr;
      s[a + i] += (Math.sin(ph) + 0.22 * Math.sin(2 * ph) + 0.08 * Math.sin(3 * ph)) * env * amp;
    }
  };
  note(0, 0.07, 1450, 1700, 0.75);
  note(0.095, 0.12, 1850, 2650, 1);
  note(0.255, 0.05, 2650, 2400, 0.45);
  return s;
}

// hound_fire (3 variants): electric zap, a falling gritty buzz with sample-and-hold crackle and a mains hum tail.
export function msZap(sr, rng, v = 0) {
  const r = rnd(rng),
    k = [1, 0.93, 1.08][v % 3],
    n = Math.round(sr * 0.3),
    s = new Float32Array(n);
  let p1 = 0,
    p2 = 0,
    hold = 0,
    hv = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr,
      f = (420 + 2600 * Math.exp(-t / 0.035)) * k;
    p1 += (TAU * f) / sr;
    p2 += (TAU * f * 1.51) / sr;
    const buzz = Math.tanh(3 * (Math.sin(p1) + 0.6 * Math.sin(p2)));
    if (--hold <= 0) {
      hold = 1 + ((r() * sr) / 2500) | 0;
      hv = r() < 0.35 ? r() * 2 - 1 : hv * 0.3;
    }
    const att = Math.min(1, t / 0.0015);
    s[i] =
      buzz * att * Math.exp(-t / 0.07) * 0.7 +
      hv * att * Math.exp(-t / 0.12) * 0.5 +
      Math.sin(TAU * 120 * k * t) * 0.15 * Math.exp(-t / 0.1) * Math.min(1, t / 0.005);
  }
  return hp(s, sr, 90);
}

// hound_step (3 variants; ram hits and wreck crashes): rubbery body bump plus a short plastic knock.
export function msBump(sr, rng, v = 0) {
  const r = rnd(rng),
    k = [1, 1.07, 0.93][v % 3],
    n = Math.round(sr * 0.32),
    s = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    ph += (TAU * (92 + 70 * Math.exp(-t / 0.018)) * k) / sr;
    s[i] = Math.sin(ph) * Math.exp(-t / 0.06) * Math.min(1, t / 0.002);
  }
  const knock = hp(lp(noise(r, Math.round(sr * 0.05)), sr, 2400 * k), sr, 500);
  for (let i = 0; i < knock.length; i++) s[i] += knock[i] * 0.9 * Math.exp(-i / sr / 0.01);
  // second, softer rattle as the shell settles
  const off = Math.round(sr * 0.07);
  for (let i = 0; i < knock.length && off + i < n; i++) s[off + i] += knock[i] * 0.3 * Math.exp(-i / sr / 0.008);
  return s;
}
