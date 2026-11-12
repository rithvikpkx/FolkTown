/**
 * Offline sound synthesis, ported from Saltline's audio engine (docs/saltline-gameplay-findings.md).
 * Every recipe renders a Float32Array of mono samples from noise, biquad filters, damped sweeps and
 * modal resonators, deterministically from a seed. No Web Audio, no DOM: it runs in tests and the
 * audio system turns the arrays into AudioBuffers. A recipe is chosen per sound by the audio
 * manifest (`synth`), so any sound can stay a file.
 */

export type Rand = () => number;
const TAU = Math.PI * 2;

/** Small seeded generator (mulberry32). */
export function makeRng(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const buf = (sr: number, secs: number) => new Float32Array(Math.max(1, Math.round(sr * secs)));
const between = (r: Rand, lo: number, hi: number) => lo + (hi - lo) * r();

function noise(sr: number, secs: number, r: Rand): Float32Array {
  const o = buf(sr, secs);
  for (let i = 0; i < o.length; i++) o[i] = r() * 2 - 1;
  return o;
}

type FilterKind = 'lp' | 'hp' | 'bp';

/** RBJ biquad coefficients [b0, b1, b2, a1, a2], normalised. */
function coeffs(kind: FilterKind, f: number, q: number, sr: number): number[] {
  const w = (TAU * Math.max(10, Math.min(f, sr * 0.47))) / sr;
  const c = Math.cos(w);
  const al = Math.sin(w) / (2 * q);
  let b0: number;
  let b1: number;
  let b2: number;
  if (kind === 'lp') {
    b0 = (1 - c) / 2;
    b1 = 1 - c;
    b2 = b0;
  } else if (kind === 'hp') {
    b0 = (1 + c) / 2;
    b1 = -(1 + c);
    b2 = b0;
  } else {
    b0 = al;
    b1 = 0;
    b2 = -al;
  }
  const a0 = 1 + al;
  return [b0 / a0, b1 / a0, b2 / a0, (-2 * c) / a0, (1 - al) / a0];
}

/** In-place biquad (direct form II transposed). */
function filter(x: Float32Array, kind: FilterKind, f: number, q: number, sr: number): Float32Array {
  const [b0, b1, b2, a1, a2] = coeffs(kind, f, q, sr) as [number, number, number, number, number];
  let z1 = 0;
  let z2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = x[i] as number;
    const y = b0 * v + z1;
    z1 = b1 * v - a1 * y + z2;
    z2 = b2 * v - a2 * y;
    x[i] = y;
  }
  return x;
}

/** In-place biquad whose cutoff follows `cutoff(t)`, t in 0..1 over the buffer. */
function sweep(
  x: Float32Array,
  kind: FilterKind,
  cutoff: (t: number) => number,
  q: number,
  sr: number,
): Float32Array {
  let z1 = 0;
  let z2 = 0;
  let c = coeffs(kind, cutoff(0), q, sr) as [number, number, number, number, number];
  for (let i = 0; i < x.length; i++) {
    if ((i & 31) === 0) c = coeffs(kind, cutoff(i / x.length), q, sr) as typeof c;
    const v = x[i] as number;
    const y = c[0] * v + z1;
    z1 = c[1] * v - c[3] * y + z2;
    z2 = c[2] * v - c[4] * y;
    x[i] = y;
  }
  return x;
}

/** Exponential-decay envelope with an optional soft attack. */
const decay = (tau: number, att = 0) =>
  att > 0
    ? (t: number) => (1 - Math.exp(-t / att)) * Math.exp(-t / tau)
    : (t: number) => Math.exp(-t / tau);

function peak(x: Float32Array): number {
  let m = 0;
  for (let i = 0; i < x.length; i++) m = Math.max(m, Math.abs(x[i] as number));
  return m;
}

function scale(x: Float32Array, g: number): Float32Array {
  for (let i = 0; i < x.length; i++) x[i] = (x[i] as number) * g;
  return x;
}

/** Add `src * gain` into `dst` starting at `at` seconds. */
function mix(
  dst: Float32Array,
  src: Float32Array,
  at: number,
  gain: number,
  sr: number,
): Float32Array {
  const o = Math.round(at * sr);
  const end = Math.min(src.length, dst.length - o);
  for (let i = Math.max(0, -o); i < end; i++)
    dst[o + i] = (dst[o + i] as number) + (src[i] as number) * gain;
  return dst;
}

/** Soft clip: tanh with drive `d`, scaled so full scale stays at 1. */
function drive(x: Float32Array, d: number): Float32Array {
  const k = 1 / Math.tanh(d);
  for (let i = 0; i < x.length; i++) x[i] = Math.tanh((x[i] as number) * d) * k;
  return x;
}

interface BurstOpts {
  hp?: number;
  lp?: number;
  bp?: number;
  q?: number;
  att?: number;
}

/** Filtered noise with an exponential decay, normalised to peak 1. */
function burst(sr: number, r: Rand, len: number, tau: number, o: BurstOpts = {}): Float32Array {
  const x = noise(sr, len, r);
  if (o.hp) filter(x, 'hp', o.hp, 0.707, sr);
  if (o.lp) filter(x, 'lp', o.lp, 0.707, sr);
  if (o.bp) filter(x, 'bp', o.bp, o.q ?? 1, sr);
  const env = decay(tau, o.att ?? 0);
  for (let i = 0; i < x.length; i++) x[i] = (x[i] as number) * env(i / sr);
  const p = peak(x);
  return p > 0 ? scale(x, 1 / p) : x;
}

/** Sine that falls from f0 to f1 (time constant tauF) and fades with tauA: a body thump. */
function thump(
  sr: number,
  len: number,
  f0: number,
  f1: number,
  tauF: number,
  tauA: number,
  att = 6e-4,
): Float32Array {
  const o = buf(sr, len);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / sr;
    ph += (TAU * (f1 + (f0 - f1) * Math.exp(-t / tauF))) / sr;
    o[i] = Math.sin(ph) * Math.exp(-t / tauA) * (1 - Math.exp(-t / att));
  }
  return o;
}

/** Decaying sine partials [freq, decay tau, amplitude]: metal and plastic ringing. */
function modal(
  sr: number,
  len: number,
  parts: readonly (readonly [number, number, number])[],
  r: Rand,
): Float32Array {
  const o = buf(sr, len);
  for (const [f, tau, amp] of parts) {
    if (f > sr * 0.46) continue;
    const w = (TAU * f) / sr;
    const ph = r() * TAU;
    const n = Math.min(o.length, Math.ceil(tau * sr * 11.5)); // to -100 dB
    for (let i = 0; i < n; i++)
      o[i] = (o[i] as number) + amp * Math.sin(w * i + ph) * Math.exp(-i / (tau * sr));
  }
  const ramp = Math.min(o.length, Math.round(4e-4 * sr));
  for (let i = 0; i < ramp; i++) o[i] = (o[i] as number) * (i / ramp);
  return o;
}

/** A mechanical click: a short ring of partials plus a noise tick. */
function click(
  sr: number,
  r: Rand,
  parts: readonly (readonly [number, number, number])[],
  o: { hp?: number; tick?: number; ring?: number } = {},
): Float32Array {
  const longest = Math.max(0.004, ...parts.map((p) => p[1]));
  const out = buf(sr, Math.min(0.5, longest * 7 + 0.004));
  mix(
    out,
    modal(
      sr,
      out.length / sr,
      parts.map(([f, t, a]) => [f * (1 + (r() * 2 - 1) * 0.02), t, a] as const),
      r,
    ),
    0,
    o.ring ?? 0.6,
    sr,
  );
  mix(out, burst(sr, r, 0.006, 9e-4, { hp: o.hp ?? 2500 }), 0, o.tick ?? 0.7, sr);
  return out;
}

/** Sparse random pops (debris, gravel) spread over `len` seconds, thinning with time. */
function crackle(
  sr: number,
  r: Rand,
  len: number,
  count: number,
  o: { from?: number; fall?: number; hp?: number; bp?: number; q?: number; ampFall?: number } = {},
): Float32Array {
  const out = buf(sr, len);
  const from = o.from ?? 0;
  for (let k = 0; k < count; k++) {
    const t = from + (len - from - 0.02) * r() ** (o.fall ?? 1);
    const at = Math.round(t * sr);
    const n = Math.round(between(r, 0.001, 0.004) * sr);
    const a = between(r, 0.2, 1) * (o.ampFall ? Math.exp(-t / o.ampFall) : 1);
    for (let i = 0; i < n && at + i < out.length; i++)
      out[at + i] = (out[at + i] as number) + (r() * 2 - 1) * a * Math.exp((-4 * i) / n);
  }
  if (o.hp) filter(out, 'hp', o.hp, 0.707, sr);
  if (o.bp) filter(out, 'bp', o.bp, o.q ?? 1, sr);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Gunshot: layered high-passed noise bands with a decay each, a body thump, a blast transient, tanh
// drive, a falling low-pass, then mechanical clicks (bolt, spring) after the report.

export interface GunParams {
  len: number;
  /** Per-variant pitch and brightness multipliers (variant i uses entry i mod n). */
  pitch: readonly number[];
  bright: readonly number[];
  /** [hp Hz, lp Hz, hold gain, decay start gain, decay tau]: one noise band each. */
  layers: readonly (readonly [number, number, number, number, number])[];
  hold: number;
  holdTau: number;
  drive: number;
  tPlus: number;
  blast: number;
  f0: number;
  f1: number;
  tauF: number;
  tauA: number;
  thump: number;
  lpEnd: number;
  lpMid: number;
  lpMidTau: number;
  lpTop: number;
  lpTopTau: number;
  shelfF: number;
  shelf: number;
  plateau: number;
  reDrive: number;
  mech: readonly (readonly [
    number,
    number,
    readonly (readonly [number, number, number])[],
    number,
  ])[];
  spring: readonly (readonly [number, number, number])[];
  springG: number;
}

export const RIFLE: GunParams = {
  len: 0.64,
  pitch: [1, 0.965, 1.035, 0.985, 1.018],
  bright: [1, 1.07, 0.94, 1.04, 0.97],
  layers: [
    [85, 220, 1.75, 0.115, 0.125],
    [220, 950, 2.2, 0.1, 0.052],
    [950, 5000, 1.5, 0.055, 0.026],
  ],
  hold: 0.022,
  holdTau: 0.0095,
  drive: 1.6,
  tPlus: 4e-4,
  blast: 2.5,
  f0: 150,
  f1: 62,
  tauF: 0.03,
  tauA: 0.055,
  thump: 0.2,
  lpEnd: 800,
  lpMid: 2600,
  lpMidTau: 0.07,
  lpTop: 15000,
  lpTopTau: 0.0028,
  shelfF: 230,
  shelf: 0.55,
  plateau: 0.8,
  reDrive: 1.5,
  mech: [
    [
      0.021,
      0.05,
      [
        [2180, 0.007, 1],
        [3460, 0.006, 0.7],
        [1840, 0.009, 0.5],
      ],
      3000,
    ],
    [
      0.058,
      0.07,
      [
        [1930, 0.009, 1],
        [2910, 0.007, 0.75],
        [4380, 0.005, 0.5],
        [860, 0.014, 0.4],
      ],
      2400,
    ],
  ],
  spring: [
    [706, 0.055, 1],
    [1418, 0.035, 0.4],
  ],
  springG: 0.02,
};

export const PISTOL: GunParams = {
  len: 0.44,
  pitch: [1, 1.04, 0.962, 1.02],
  bright: [1, 0.95, 1.06, 1.02],
  layers: [
    [100, 270, 1.3, 0.16, 0.055],
    [270, 1400, 2.2, 0.2, 0.038],
    [1400, 5500, 1.8, 0.12, 0.016],
  ],
  hold: 0.01,
  holdTau: 0.005,
  drive: 1.5,
  tPlus: 4.5e-4,
  blast: 2.5,
  f0: 230,
  f1: 105,
  tauF: 0.014,
  tauA: 0.028,
  thump: 0.25,
  lpEnd: 1000,
  lpMid: 2200,
  lpMidTau: 0.04,
  lpTop: 15000,
  lpTopTau: 0.0024,
  shelfF: 260,
  shelf: 0.2,
  plateau: 0.78,
  reDrive: 1.5,
  mech: [
    [
      0.016,
      0.09,
      [
        [2920, 0.006, 1],
        [4410, 0.005, 0.8],
        [1650, 0.007, 0.4],
      ],
      3400,
    ],
    [
      0.046,
      0.12,
      [
        [3380, 0.008, 1],
        [5180, 0.007, 0.8],
        [1230, 0.01, 0.35],
      ],
      3000,
    ],
  ],
  spring: [
    [1180, 0.02, 1],
    [2390, 0.012, 0.4],
  ],
  springG: 0.015,
};

/** Not in Saltline (it has a rifle and a pistol): the rifle recipe pushed lower, longer and heavier. */
export const SHOTGUN: GunParams = {
  ...RIFLE,
  len: 0.8,
  layers: [
    [60, 200, 2.0, 0.14, 0.16],
    [200, 900, 2.4, 0.13, 0.075],
    [900, 4200, 1.6, 0.07, 0.035],
  ],
  f0: 120,
  f1: 48,
  tauF: 0.04,
  tauA: 0.08,
  thump: 0.3,
  lpEnd: 650,
  drive: 1.9,
  mech: [
    [
      0.05,
      0.08,
      [
        [1500, 0.01, 1],
        [2400, 0.008, 0.7],
        [700, 0.016, 0.5],
      ],
      2000,
    ],
    [
      0.16,
      0.1,
      [
        [1200, 0.012, 1],
        [2100, 0.01, 0.6],
        [640, 0.018, 0.4],
      ],
      1800,
    ],
  ],
};

export function gunshot(sr: number, r: Rand, variant: number, g: GunParams): Float32Array {
  const pitch = g.pitch[variant % g.pitch.length] as number;
  const bright = g.bright[variant % g.bright.length] as number;
  const at = 5e-4;
  const out = buf(sr, g.len);
  const n = out.length - Math.round(0.004 * sr);
  const body = new Float32Array(n);
  for (const [hp, lp, hold, start, tau] of g.layers) {
    const y = new Float32Array(n);
    for (let i = 0; i < n; i++) y[i] = r() * 2 - 1;
    filter(y, 'hp', hp * pitch, 0.707, sr);
    filter(y, 'hp', hp * pitch, 0.707, sr);
    filter(y, 'lp', lp * pitch * bright, 0.707, sr);
    // Normalise the first 120 ms to unit RMS so the gains below mean the same for every band.
    const m = Math.min(n, Math.round(0.12 * sr));
    let e = 0;
    for (let i = 0; i < m; i++) e += (y[i] as number) ** 2;
    const norm = 1 / Math.sqrt(e / m + 1e-12);
    const dk = Math.exp(-1 / (tau * sr));
    const hk = Math.exp(-1 / (g.holdTau * sr));
    const holdN = Math.round(g.hold * sr);
    let s = start;
    let h = hold;
    for (let i = 0; i < n; i++) {
      body[i] = (body[i] as number) + (y[i] as number) * norm * (h + s);
      s *= dk;
      if (i >= holdN) h *= hk;
    }
  }
  mix(body, thump(sr, 0.3, g.f0 * pitch, g.f1 * pitch, g.tauF, g.tauA, 0.001), 0, g.thump, sr);
  // blast transient: (1 - s) * exp(-s), a one-sided click with a short negative tail
  const tp = g.tPlus / pitch;
  const bl = buf(sr, tp * 12);
  for (let i = 0; i < bl.length; i++) {
    const s = i / sr / tp;
    bl[i] = (1 - s) * Math.exp(-s);
  }
  mix(body, bl, 0, g.blast, sr);
  drive(body, g.drive);
  const cut = (i: number) => {
    const t = i / sr;
    return (
      (g.lpEnd + g.lpMid * Math.exp(-t / g.lpMidTau)) * bright + g.lpTop * Math.exp(-t / g.lpTopTau)
    );
  };
  sweep(body, 'lp', (t) => cut(t * n), 0.6, sr);
  sweep(body, 'lp', (t) => cut(t * n), 0.6, sr);
  const low = Float32Array.from(body);
  filter(low, 'lp', g.shelfF, 0.707, sr);
  for (let i = 0; i < n; i++) body[i] = (body[i] as number) + (low[i] as number) * g.shelf;
  filter(body, 'hp', 30, 0.707, sr);
  // level the first few ms of the report to a fixed plateau so every variant is equally loud
  const a = Math.round(0.004 * sr);
  const b = Math.round((g.hold + 0.004) * sr);
  let pe = 0;
  for (let i = a; i < b; i++) pe += (body[i] as number) ** 2;
  scale(body, g.plateau / Math.sqrt(pe / Math.max(1, b - a) + 1e-12));
  drive(body, g.reDrive);
  mix(out, body, at, 1, sr);
  g.mech.forEach(([when, gain, parts, hp], idx) => {
    const t = at + when * between(r, 0.94, 1.06);
    mix(
      out,
      click(
        sr,
        r,
        parts.map(([f, tt, aa]) => [f * pitch, tt, aa] as const),
        { hp, tick: 0.6, ring: 0.7 },
      ),
      t,
      gain,
      sr,
    );
    if (idx === g.mech.length - 1)
      mix(
        out,
        modal(
          sr,
          0.22,
          g.spring.map(([f, tt, aa]) => [f * pitch, tt, aa] as const),
          r,
        ),
        t + 0.002,
        g.springG,
        sr,
      );
  });
  return out;
}

// ---------------------------------------------------------------------------------------------
// Smaller sounds.

export function dryFire(sr: number, r: Rand): Float32Array {
  const o = buf(sr, 0.2);
  mix(
    o,
    click(
      sr,
      r,
      [
        [2260, 0.005, 1],
        [3640, 0.0045, 0.75],
        [5880, 0.003, 0.5],
        [8100, 0.002, 0.3],
      ],
      { hp: 2200, tick: 0.9 },
    ),
    5e-4,
    1,
    sr,
  );
  mix(
    o,
    modal(
      sr,
      0.05,
      [
        [640, 0.009, 1],
        [1180, 0.007, 0.6],
      ],
      r,
    ),
    5e-4,
    0.3,
    sr,
  );
  return o;
}

export function footstep(sr: number, r: Rand, variant: number): Float32Array {
  const o = buf(sr, 0.3);
  const s = [1, 1.07, 0.94, 1.03][variant & 3] as number;
  mix(o, thump(sr, 0.06, 112 * s, 58 * s, 0.018, 0.02, 0.002), 0, 0.75, sr);
  mix(o, burst(sr, r, 0.06, 0.016, { lp: 720 * s }), 0, 0.9, sr);
  mix(o, burst(sr, r, 0.1, 0.028, { bp: 2500 * s, q: 0.7, att: 0.004 }), 0.012, 0.22, sr);
  const grit = burst(sr, r, 0.2, 0.05, { hp: 3800, att: 0.01 });
  let g = 1;
  for (let i = 0; i < grit.length; i++) {
    if (i % 70 === 0) g = 0.3 + r() * 0.7;
    grit[i] = (grit[i] as number) * g;
  }
  mix(o, grit, 0.02, 0.16, sr);
  return o;
}

export function hurt(sr: number, r: Rand): Float32Array {
  const o = buf(sr, 0.5);
  mix(o, thump(sr, 0.25, 92, 38, 0.04, 0.06, 0.0015), 0, 1.1, sr);
  mix(o, burst(sr, r, 0.2, 0.04, { lp: 320 }), 0, 1.2, sr);
  mix(o, burst(sr, r, 0.06, 0.01, { bp: 820, q: 1 }), 0, 0.55, sr);
  mix(o, burst(sr, r, 0.03, 0.004, { hp: 1800, lp: 5000 }), 0, 0.2, sr);
  return drive(o, 1.6);
}

export function impactConcrete(sr: number, r: Rand, variant: number): Float32Array {
  const o = buf(sr, 0.36);
  const s = [1, 1.1, 0.9][variant % 3] as number;
  mix(o, burst(sr, r, 0.06, 0.013, { lp: 950 * s }), 0, 1.1, sr);
  mix(o, thump(sr, 0.05, 150 * s, 70, 0.012, 0.016), 0, 0.6, sr);
  mix(o, burst(sr, r, 0.012, 0.002, { hp: 2000 }), 0, 0.6, sr);
  mix(o, burst(sr, r, 0.12, 0.024, { bp: 3500 * s, q: 0.7 }), 0.003, 0.3, sr);
  mix(o, crackle(sr, r, 0.34, 16, { from: 0.03, fall: 1.8, hp: 1800, ampFall: 0.1 }), 0, 0.35, sr);
  return o;
}

/** Not in Saltline: a soft thud and a spray of grit for dirt and grass. */
export function impactDirt(sr: number, r: Rand, variant: number): Float32Array {
  const o = buf(sr, 0.3);
  const s = [1, 1.12, 0.9][variant % 3] as number;
  mix(o, thump(sr, 0.08, 110 * s, 55, 0.02, 0.03, 0.002), 0, 0.8, sr);
  mix(o, burst(sr, r, 0.1, 0.03, { lp: 600 * s, att: 0.002 }), 0, 1, sr);
  mix(
    o,
    crackle(sr, r, 0.28, 10, { from: 0.01, fall: 1.6, bp: 1800, q: 0.8, ampFall: 0.08 }),
    0,
    0.3,
    sr,
  );
  return o;
}

/** Bullet into a body or a target: a bright tick, ringing metal and a low knock. */
export function impactBody(sr: number, r: Rand, variant: number, pitch = 1): Float32Array {
  const o = buf(sr, 0.3);
  const s = ([1, 1.12, 0.9][variant % 3] as number) * pitch;
  mix(o, burst(sr, r, 0.03, 0.007, { hp: 4000 }), 0, 0.9, sr);
  mix(
    o,
    modal(
      sr,
      0.12,
      [
        [2920 * s, 0.022, 1],
        [4730 * s, 0.018, 0.8],
        [7310 * s, 0.012, 0.6],
        [1180 * s, 0.03, 0.5],
      ],
      r,
    ),
    0,
    0.4,
    sr,
  );
  mix(o, burst(sr, r, 0.05, 0.012, { bp: 320 * s, q: 1.5 }), 0, 0.9, sr);
  mix(o, crackle(sr, r, 0.28, 10, { from: 0.02, fall: 1.6, hp: 5000, ampFall: 0.08 }), 0, 0.3, sr);
  return o;
}

export function uiClick(sr: number, r: Rand): Float32Array {
  const o = buf(sr, 0.09);
  mix(
    o,
    modal(
      sr,
      0.08,
      [
        [1820, 0.009, 1],
        [2730, 0.007, 0.6],
        [640, 0.012, 0.5],
      ],
      r,
    ),
    0,
    1,
    sr,
  );
  mix(o, burst(sr, r, 0.004, 0.001, { hp: 2500 }), 0, 0.5, sr);
  return o;
}

// ---------------------------------------------------------------------------------------------

export interface Recipe {
  /** Number of distinct variants worth rendering. */
  variants: number;
  render(sr: number, r: Rand, variant: number): Float32Array;
}

/** Recipes by the id used in the audio manifest's `synth` field. */
export const RECIPES: Record<string, Recipe> = {
  'rifle-shot': { variants: 5, render: (sr, r, v) => gunshot(sr, r, v, RIFLE) },
  'pistol-shot': { variants: 4, render: (sr, r, v) => gunshot(sr, r, v, PISTOL) },
  'shotgun-shot': { variants: 3, render: (sr, r, v) => gunshot(sr, r, v, SHOTGUN) },
  'dry-fire': { variants: 1, render: (sr, r) => dryFire(sr, r) },
  step: { variants: 4, render: (sr, r, v) => footstep(sr, r, v) },
  hurt: { variants: 1, render: (sr, r) => hurt(sr, r) },
  'impact-concrete': { variants: 3, render: (sr, r, v) => impactConcrete(sr, r, v) },
  'impact-dirt': { variants: 3, render: (sr, r, v) => impactDirt(sr, r, v) },
  'hit-tick': { variants: 3, render: (sr, r, v) => impactBody(sr, r, v) },
  headshot: { variants: 2, render: (sr, r, v) => impactBody(sr, r, v, 1.35) },
  'ui-click': { variants: 1, render: (sr, r) => uiClick(sr, r) },
};

/** Render one variant of a recipe, peak-normalised to 0.97. Returns null for an unknown recipe. */
export function renderSynth(id: string, variant = 0, sr = 44100, seed = 1): Float32Array | null {
  const rec = RECIPES[id];
  if (!rec) return null;
  const x = rec.render(
    sr,
    makeRng((seed * 2654435761 + variant * 40503 + id.length * 977) >>> 0),
    variant,
  );
  const p = peak(x);
  return p > 0 ? scale(x, 0.97 / p) : x;
}
