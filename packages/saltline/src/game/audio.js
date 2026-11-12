import { LoopRepeat as px, CineonToneMapping as lx, Clock as sp, LoopOnce as dx, Vector3 as K, Euler as _0, LessDepth as hp, Group as At, Box3 as B0, Matrix4 as Je, InstancedMesh as Wo } from 'three';
import { a6, l6, h6, d6, p6, m6, g6, x6, v6, y6, b6, M6, _6, w6, E6, S6, T6, A6, R6, C6, k6, P6, UI, BI, HI, OI, VI, WI, GI, qI, XI, YI, $I, ZI, jI, F6, KI, D6, L6, tz, nz, iz, oz, sz, I6, z6, rz, az, lz, cz, uz, fz, hz, dz, JI, QI, ez, pz, mz, gz, xz, q6, vz, yz, n6, Pr, ls, as, Gv, Ci, $l, it } from './fx.js';
import { ch } from './backdrop.js';
import { Ti } from './props.js';
import { zi, Hn, Is, j0, u0, Kn, ou, ig } from './common.js';
import { __late as __late_level } from './level.js';
// forward references, filled in by the owning later file (see README)
let sr, ir, t0, py, ly, dy, vT, gT, pT;
export const __late = {
  sr(v) {
    sr = v;
  },
  ir(v) {
    ir = v;
  },
  t0(v) {
    t0 = v;
  },
  py(v) {
    py = v;
  },
  ly(v) {
    ly = v;
  },
  dy(v) {
    dy = v;
  },
  vT(v) {
    vT = v;
  },
  gT(v) {
    gT = v;
  },
  pT(v) {
    pT = v;
  },
};

export var hn = 44100,
    _n = 32e3,
    wu = 22050,
    Ir = {
      rifle_shot: { gen: a6, n: 5, sr: hn, peak: 0.97, bus: "gun", max: 9, pri: 9, boot: 1 },
      pistol_shot: { gen: l6, n: 4, sr: hn, peak: 0.97, bus: "gun", max: 6, pri: 9 },
      rifle_tail_out: { gen: h6, n: 2, sr: _n, peak: 0.8, fixed: 1, bus: "tail", max: 4, pri: 8, soft: 1 },
      rifle_tail_in: { gen: d6, n: 2, sr: _n, peak: 0.75, fixed: 1, bus: "tail", max: 4, pri: 8, soft: 1 },
      pistol_tail_out: { gen: p6, n: 1, sr: _n, peak: 0.62, fixed: 1, bus: "tail", max: 3, pri: 8, soft: 1 },
      pistol_tail_in: { gen: m6, n: 1, sr: _n, peak: 0.6, fixed: 1, bus: "tail", max: 3, pri: 8, soft: 1 },
      rifle_dry: { gen: g6, n: 1, sr: hn, peak: 0.5, bus: "gun", max: 2, pri: 6, boot: 1 },
      pistol_dry: { gen: x6, n: 1, sr: hn, peak: 0.42, bus: "gun", max: 2, pri: 6 },
      reload_magout: { gen: v6, n: 1, sr: hn, peak: 0.45, bus: "gun", max: 2, pri: 6 },
      reload_maginsert: { gen: y6, n: 1, sr: hn, peak: 0.36, bus: "gun", max: 2, pri: 6 },
      reload_magin: { gen: b6, n: 1, sr: hn, peak: 0.64, bus: "gun", max: 2, pri: 7 },
      reload_boltback: { gen: M6, n: 2, sr: hn, peak: 0.48, bus: "gun", max: 2, pri: 6 },
      reload_bolt: { gen: _6, n: 1, sr: hn, peak: 0.72, bus: "gun", max: 2, pri: 7 },
      pistol_magout: { gen: w6, n: 1, sr: hn, peak: 0.38, bus: "gun", max: 2, pri: 6 },
      pistol_maginsert: { gen: E6, n: 1, sr: hn, peak: 0.3, bus: "gun", max: 2, pri: 6 },
      pistol_magin: { gen: S6, n: 1, sr: hn, peak: 0.52, bus: "gun", max: 2, pri: 7 },
      pistol_slide: { gen: T6, n: 1, sr: hn, peak: 0.6, bus: "gun", max: 2, pri: 7 },
      weapon_holster: { gen: A6, n: 1, sr: _n, peak: 0.32, bus: "gun", max: 2, pri: 5 },
      weapon_draw: { gen: R6, n: 1, sr: _n, peak: 0.32, bus: "gun", max: 2, pri: 5 },
      gear_rustle: { gen: C6, n: 2, sr: _n, peak: 0.18, bus: "gun", max: 2, pri: 3 },
      shell_bounce: { gen: k6, n: 4, sr: hn, peak: 0.3, bus: "world", max: 4, pri: 1, ref: 2, roll: 1 },
      shell_bounce_metal: { gen: P6, n: 3, sr: hn, peak: 0.32, bus: "world", max: 4, pri: 1, ref: 2, roll: 1 },
      step_concrete: { gen: UI, n: 4, sr: _n, peak: 0.45, bus: "near", max: 3, pri: 3, boot: 1 },
      step_water: { gen: BI, n: 3, sr: _n, peak: 0.5, bus: "near", max: 3, pri: 3, boot: 1 },
      step_metal: { gen: HI, n: 3, sr: _n, peak: 0.5, bus: "near", max: 3, pri: 3, boot: 1 },
      land: { gen: OI, n: 1, sr: _n, peak: 0.7, bus: "near", max: 2, pri: 4 },
      jump: { gen: VI, n: 1, sr: _n, peak: 0.35, bus: "near", max: 2, pri: 3 },
      hurt: { gen: WI, n: 1, sr: _n, peak: 0.85, bus: "dry", max: 2, pri: 8 },
      ear_ring: { gen: GI, n: 1, sr: wu, peak: 0.2, bus: "dry", max: 1, pri: 5 },
      impact_metal: { gen: qI, n: 3, sr: hn, peak: 0.7, bus: "world", max: 4, pri: 4, ref: 4, roll: 0.7 },
      impact_concrete: { gen: XI, n: 3, sr: hn, peak: 0.7, bus: "world", max: 4, pri: 4, ref: 4, roll: 0.7 },
      impact_wood: { gen: YI, n: 2, sr: hn, peak: 0.7, bus: "world", max: 3, pri: 4, ref: 4, roll: 0.7 },
      impact_water: { gen: $I, n: 2, sr: _n, peak: 0.6, bus: "world", max: 3, pri: 4, ref: 4, roll: 0.7 },
      impact_enemy: { gen: ZI, n: 3, sr: hn, peak: 0.75, bus: "world", max: 4, pri: 5, ref: 5, roll: 0.6 },
      impact_glass: { gen: jI, n: 1, sr: hn, peak: 0.6, bus: "world", max: 2, pri: 4, ref: 4, roll: 0.7 },
      whiz: { gen: F6, n: 3, sr: hn, peak: 0.5, bus: "world", max: 3, pri: 5, ref: 2.5, roll: 0.6 },
      ricochet: { gen: KI, n: 3, sr: hn, peak: 0.4, bus: "world", max: 2, pri: 3, ref: 5, roll: 0.6 },
      gull_fire: { gen: D6, n: 3, sr: hn, peak: 0.7, bus: "world", max: 5, pri: 7, ref: 7, roll: 0.55 },
      hound_fire: { gen: L6, n: 3, sr: hn, peak: 0.6, bus: "world", max: 5, pri: 7, ref: 8, roll: 0.5 },
      hound_step: { gen: tz, n: 3, sr: _n, peak: 0.7, bus: "world", max: 4, pri: 3, ref: 5, roll: 0.8 },
      gull_die: { gen: nz, n: 1, sr: _n, peak: 0.85, bus: "world", max: 3, pri: 7, ref: 7, roll: 0.5 },
      hound_die: { gen: iz, n: 1, sr: _n, peak: 0.9, bus: "world", max: 3, pri: 7, ref: 7, roll: 0.5 },
      telegraph: { gen: oz, n: 2, sr: _n, peak: 0.42, bus: "world", max: 4, pri: 6, ref: 6, roll: 0.6 },
      alert: { gen: sz, n: 2, sr: _n, peak: 0.5, bus: "world", max: 3, pri: 6, ref: 8, roll: 0.5 },
      explosion: { gen: I6, n: 2, sr: hn, peak: 0.95, bus: "world", max: 3, pri: 10, ref: 12, roll: 0.5 },
      explosion_big: { gen: z6, n: 2, sr: _n, peak: 0.97, bus: "world", max: 2, pri: 11, ref: 16, roll: 0.45 },
      relay_cut: { gen: rz, n: 1, sr: _n, peak: 0.75, bus: "world", max: 2, pri: 8, ref: 6, roll: 0.5 },
      thunder: { gen: az, n: 2, sr: wu, peak: 0.8, bus: "dry", max: 2, pri: 6 },
      foghorn: { gen: lz, n: 1, sr: wu, peak: 0.5, bus: "world", max: 1, pri: 2 },
      gull_cry: { gen: cz, n: 2, sr: wu, peak: 0.4, bus: "world", max: 2, pri: 1 },
      halyard: { gen: uz, n: 2, sr: _n, peak: 0.3, bus: "world", max: 2, pri: 1 },
      container_bang: { gen: fz, n: 1, sr: wu, peak: 0.6, bus: "world", max: 1, pri: 2 },
      ui_click: { gen: hz, n: 1, sr: hn, peak: 0.3, bus: "dry", max: 2, pri: 9 },
      ui_hover: { gen: dz, n: 1, sr: hn, peak: 0.12, bus: "dry", max: 2, pri: 9 },
      gull_rotor: { gen: JI, n: 1, sr: _n, peak: 0.6, loop: 1, ref: 5, roll: 0.9 },
      hound_servo: { gen: QI, n: 1, sr: _n, peak: 0.42, loop: 1, ref: 4, roll: 1 },
      relay_hum: { gen: ez, n: 1, sr: _n, peak: 0.4, loop: 1, ref: 2.5, roll: 1.4 },
      rain: { gen: pz, n: 1, sr: _n, peak: 0.5, loop: 1 },
      rain_interior: { gen: mz, n: 1, sr: _n, peak: 0.7, loop: 1 },
      wind: { gen: gz, n: 1, sr: wu, peak: 0.5, loop: 1 },
      sea: { gen: xz, n: 1, sr: wu, peak: 0.5, loop: 1, ref: 10, roll: 0.6 },
      ...q6,
      ir_outdoor: { gen: vz, n: 1, sr: hn, peak: 0.9, ir: 1 },
      ir_shed: { gen: yz, n: 1, sr: hn, peak: 0.9, ir: 1 },
    },
    $6 = {
      step: "step_concrete",
      impact: "impact_concrete",
      hurt: "hurt",
      objective_done: "objective",
      objective_all: "objective",
      extraction: "complete",
      enemy_alert: "alert",
    },
    Z6 = (n) => n && typeof n.next == "function";
  export function j6(n, e, t) {
    let i = Array.isArray(e) ? e : [e];
    if (!n.loop) for (let r of i) n6(r, t, n.ir ? 0 : 3e-4, n.ir ? 0.05 : 0.012);
    let s = 0;
    for (let r of i) s = Math.max(s, Pr(r));
    let o = n.fixed ? Math.min(1, n.peak / (s || 1)) : s > 0 ? n.peak / s : 1;
    for (let r of i) ls(r, o);
    return { sr: t, ch: i, loop: !!n.loop };
  }
  export function K6(n, e = 0, t) {
    let i = Ir[n];
    if (!i) return null;
    let s = t || i.sr,
      o = e % i.n,
      r = i.gen(s, as(Gv(n) + o * 7919), o);
    if (Z6(r)) {
      let a;
      do a = r.next();
      while (!a.done);
      r = a.value;
    }
    return j6(i, r, s);
  }
  export function J6(n, e = 0, t) {
    let i = Ir[n];
    if (!i) return null;
    let s = t || i.sr,
      o = e % i.n,
      r = i.gen(s, as(Gv(n) + o * 7919), o),
      a = null;
    return {
      step() {
        if (a) return a;
        if (Z6(r)) {
          let l = r.next();
          if (!l.done) return null;
          r = l.value;
        }
        return (a = j6(i, r, s));
      },
    };
  }
  export var ji = {
    comp: { threshold: -3, knee: 6, ratio: 2, attack: 0.01, release: 0.12 },
    preGain: 1,
    master: 0.9,
    musicBus: 0.73,
    weapon: {
      rifle: {
        shot: "rifle_shot",
        n: 5,
        gain: 1.12,
        tailOut: "rifle_tail_out",
        tailIn: "rifle_tail_in",
        tail: 1.12,
        duck: 0.45,
        shellPitch: 1,
      },
      pistol: {
        shot: "pistol_shot",
        n: 4,
        gain: 1.12,
        tailOut: "pistol_tail_out",
        tailIn: "pistol_tail_in",
        tail: 1.12,
        duck: 0.5,
        shellPitch: 1.22,
      },
    },
    duck: { attack: 0.012, hold: 0.085, release: 0.1 },
    tailBoostAfter: 0.105,
    music: {
      trim: 0.92,
      layers: { music_drone: 1, music_strings: 1, music_pulse: 1, music_ticks: 1, music_drums: 1, music_brass: 1, music_lift: 1 },
      cell: 0.8,
      horn: 0.7,
      fill: 0.55,
      hit: 0.42,
      riser: 0.9,
      impact: 0.75,
      relay: 0.9,
      death: 0.9,
      complete: 0.9,
      xfade: 0.5,
      relayDuck: 0.4,
      preImpactDip: 0.45,
      riserMin: 1.25,
      riserMinAfterRelay: 2.6,
      riserCooldown: 25,
      cadenceLen: 11.5,
    },
  };
  export function Q6(n) {
    return n >= 0.45 ? 1 : 0.4 + (0.6 * Math.max(0, n)) / 0.45;
  }
  export function bz(n) {
    let e = Math.abs(n);
    return Math.sign(n) * (e <= 0.6 ? e : 0.6 + 0.4 * Math.tanh((e - 0.6) / 0.4));
  }
  export var eE = 4;
  export function tE(n = 4097) {
    let e = new Float32Array(n);
    for (let t = 0; t < n; t++) e[t] = bz(((t / (n - 1)) * 2 - 1) * eE);
    return e;
  }
  export function Mz(n) {
    let e = (d) => Math.pow(10, d / 20),
      t = (d) => (d > 0 ? 20 * Math.log10(d) : -1e3),
      i = e(n.threshold),
      s = n.threshold + n.knee,
      o = e(s),
      r = 1 / n.ratio,
      a = (d, m) => (d < i ? d : i + (1 - Math.exp(-m * (d - i))) / m),
      l = (d, m) => {
        if (d < i) return 1;
        let x = d * 1.001;
        return (t(a(x, m)) - t(a(d, m))) / (t(x) - t(d));
      },
      c = 0.1,
      u = 1e4,
      f = 5;
    if (n.knee > 0) for (let d = 0; d < 15; d++) (l(o, f) < r ? (u = f) : (c = f), (f = Math.sqrt(c * u)));
    let h = t(a(o, f)),
      p = (d) => (d < o ? a(d, f) : e(h + r * (t(d) - s)));
    return { saturate: p, makeup: Math.pow(1 / p(1), 0.6) };
  }
  export function nE() {
    return ji.preGain / (Mz(ji.comp).makeup * eE);
  }
  export var _z = (n, e, t) => Math.min(t, Math.max(e, n)),
    iE = (n, e, t) => {
      let i = _z((t - n) / (e - n), 0, 1);
      return i * i * (3 - 2 * i);
    },
    Jv = Ci.bar,
    sE = Ci.beat;
  export var wz = {};
  export function oE(n, e, t = wz, i = {}) {
    let s = ji.music.layers;
    for (let o of $l) i[o] = 0;
    if (n === "title" || n === "intro") i.music_drone = 0.95;
    else if (n === "dead") i.music_drone = 0.4;
    else if (n === "complete") i.music_drone = t.after == null || t.after > ji.music.cadenceLen ? 0.7 : 0;
    else {
      let o = iE(0.3, 0.6, e),
        r = iE(0.7, 0.95, e) * (t.gate == null ? 1 : t.gate),
        a = t.final ? r : 0;
      ((i.music_drone = 1 - 0.15 * o - 0.15 * r - 0.2 * a),
        (i.music_strings = o * (0.85 + 0.15 * r)),
        (i.music_pulse = o * (0.8 + 0.2 * r) * (1 - 0.2 * a)),
        (i.music_ticks = o * (0.7 + 0.3 * r)),
        (i.music_drums = r),
        (i.music_brass = r * (1 - 0.15 * a)),
        (i.music_lift = a));
    }
    for (let o of $l) i[o] *= s[o] * ji.music.trim;
    return i;
  }
  export function rE(n) {
    let { ctx: e, out: t, bufs: i, whenReady: s, running: o } = n,
      r = n.rnd || Math.random,
      a = ji.music,
      l = {
        on: !1,
        t0: 0,
        layers: {},
        nextBar: 0,
        live: "title",
        tier: 0,
        final: !1,
        gate: 1,
        gateT: -1,
        wave: null,
        lastImpact: -99,
        armed: !1,
        plan: "rest",
        cycle: 0,
        quiet: 0,
        lastFill: -1,
        duckUntil: -1,
        muteUntil: -1,
        completeT: -1,
        lastSting: -99,
        lastRelay: -99,
        voices: [],
        bars: 0,
      },
      c = (R, z = 0) => i.get(R + "#" + z),
      u = () => {};
    function f(R, z) {
      let I = c(R);
      if (!I) return;
      let L = e.createGain();
      ((L.gain.value = 0), L.connect(t));
      let U = e.createBufferSource();
      ((U.buffer = I), (U.loop = !0), U.connect(L));
      let k = z + 0.06,
        C = 0;
      (l.on ? (C = (((k - l.t0) % I.duration) + I.duration) % I.duration) : ((l.on = !0), (l.t0 = k), (l.nextBar = 0)),
        U.start(k, C),
        (l.layers[R] = { g: L, s: U, t: 0, hold: -1 }));
    }
    function h(R, z, I, L) {
      if (!(I < R.hold) && !(Math.abs(z - R.t) < 0.004 && !(z === 0 && R.t !== 0))) {
        R.t = z;
        try {
          R.g.gain.setTargetAtTime(z, I, L);
        } catch {
          R.g.gain.value = z;
        }
      }
    }
    let p = { gate: 1, final: !1, after: null },
      d = {},
      m = (R, z) => ((p.gate = l.gate), (p.final = l.final), (p.after = l.completeT >= 0 ? z - l.completeT : null), oE(l.live, R, p, d));
    function x(R, z, I, L, U = {}) {
      let k = c(R, z);
      if (!k) return (s(R, z, u), null);
      if (!o()) return null;
      let C = e.currentTime;
      ((I = Math.max(I, C)), (L *= a.trim));
      let A = e.createGain(),
        F = e.createBufferSource();
      if (((F.buffer = k), F.connect(A), A.connect(t), U.fadeIn))
        try {
          (A.gain.setValueAtTime(0, I), A.gain.linearRampToValueAtTime(L, I + U.fadeIn));
        } catch {
          A.gain.value = L;
        }
      else A.gain.value = L;
      let H = { s: F, g: A, name: R, kind: U.kind || "phrase", end: I + k.duration - (U.offset || 0), gain: L };
      return (
        (F.onended = () => {
          try {
            (F.disconnect(), A.disconnect());
          } catch {}
        }),
        F.start(I, U.offset || 0),
        l.voices.push(H),
        H
      );
    }
    function v(R, z) {
      let I = e.currentTime;
      for (let L of l.voices)
        if (!(L.end <= I || (R && !R(L)))) {
          try {
            (L.g.gain.cancelScheduledValues(I), L.g.gain.setTargetAtTime(0, I, z / 3), L.s.stop(I + z));
          } catch {}
          L.end = I + z;
        }
    }
    function y(R, z, I, L) {
      if (c(R)) return x(R, 0, z, I, { kind: L });
      let U = e.currentTime;
      return (
        s(R, 0, () => {
          e.currentTime - U < 1.5 && x(R, 0, e.currentTime + 0.03, I, { kind: L });
        }),
        null
      );
    }
    let b = (R, z, I) => (l.on ? l.t0 + Math.ceil((R + z - l.t0) / I - 1e-9) * I : R + z);
    function g(R, z, I) {
      if (!l.on || !c("mus_impact") || (!I && R - l.lastImpact < a.riserCooldown)) {
        l.gate = 1;
        return;
      }
      let L = R - l.lastRelay < 1.5 ? a.riserMinAfterRelay : a.riserMin,
        U = b(R, L, Jv);
      ((l.gate = 0), (l.gateT = U), (l.lastImpact = U), (l.muteUntil = Math.max(l.muteUntil, U + 0.2)));
      let k = { Ti: U, voices: [] };
      if (c("mus_riser")) {
        let F = Math.max(R + 0.02, U - Ci.riserPeak);
        k.voices.push(x("mus_riser", 0, F, a.riser, { offset: Ci.riserPeak - (U - F), fadeIn: 0.1, kind: "wave" }));
      }
      k.voices.push(x("mus_impact", 0, U, a.impact, { kind: "wave" }));
      let C = oE("playing", 1, { gate: 1, final: l.final }),
        A = R < l.duckUntil ? a.relayDuck : 1;
      for (let F of $l) {
        let H = l.layers[F];
        if (H) {
          try {
            (H.g.gain.cancelScheduledValues(R),
              A < 1 && H.t > 0.01 && H.g.gain.setTargetAtTime(Math.max(0, H.t) * A, R, 0.2),
              H.t > 0.01 && H.g.gain.setTargetAtTime(H.t * Math.min(A, a.preImpactDip), U - 0.5, 0.12),
              H.g.gain.setTargetAtTime(C[F], U - 0.03, 0.008));
          } catch {}
          ((H.t = C[F]), (H.hold = U + 0.25));
        }
      }
      ((l.wave = k), (l.armed = !0));
    }
    function E(R) {
      if (l.wave) {
        for (let z of l.wave.voices)
          if (z) {
            try {
              (z.g.gain.cancelScheduledValues(R), z.g.gain.setTargetAtTime(0, R, 0.08), z.s.stop(R + 0.3));
            } catch {}
            z.end = R + 0.3;
          }
        for (let z of $l) {
          let I = l.layers[z];
          if (I) {
            try {
              I.g.gain.cancelScheduledValues(R);
            } catch {}
            ((I.hold = -1), (I.t = -1));
          }
        }
        ((l.wave = null), (l.gate = 1), (l.lastImpact = -99), (l.armed = !1));
      }
    }
    function M() {
      ((l.final = !1),
        (l.gate = 1),
        (l.gateT = -1),
        (l.wave = null),
        (l.armed = !1),
        (l.completeT = -1),
        (l.duckUntil = -1),
        (l.muteUntil = -1),
        (l.lastImpact = -99),
        (l.plan = "rest"),
        (l.quiet = 0));
    }
    let _ = {
        get on() {
          return l.on;
        },
        state(R, z) {
          if (R === "paused") return;
          let I = l.live;
          if (((l.live = R), z === "paused" && I === R)) return;
          let L = e.currentTime;
          (R === "playing" || R === "intro" || R === "title") &&
            ((R === "playing" && I === "intro") || (E(L), M(), v((U) => U.kind !== "phrase", 0.5)));
        },
        relay() {
          if (!o()) return;
          let R = e.currentTime;
          if (R - l.lastRelay < 1) return;
          let z = b(R, 0.15, sE);
          ((l.lastRelay = R),
            v((I) => I.kind === "phrase", 0.4),
            y("objective", z, a.relay, "sting"),
            (l.duckUntil = z + 3.4),
            (l.muteUntil = Math.max(l.muteUntil, z + 4.2)));
        },
        finalRun() {
          if (l.final || ((l.final = !0), !o() || !l.on)) return;
          let R = e.currentTime;
          (l.wave && E(R), g(R, 1, !0));
        },
        death() {
          if (!o()) return;
          let R = e.currentTime;
          R - l.lastSting < 1 || ((l.lastSting = R), E(R), v(null, 0.25), y("death", R + 0.02, a.death, "sting"));
        },
        complete() {
          if (!o()) return;
          let R = e.currentTime;
          if (R - l.lastSting < 6) return;
          ((l.lastSting = R), E(R), v(null, 0.35));
          let z = b(R, 0.15, sE);
          ((l.completeT = z), y("complete", z, a.complete, "sting"));
        },
        snap() {
          ((l.gate = 1), (l.lastImpact = e.currentTime), (l.armed = !0));
        },
        update(R, z, I) {
          if (!o()) return;
          let L = e.currentTime;
          if (!l.on)
            if (c("music_drone")) f("music_drone", L);
            else return;
          for (let H of $l) !l.layers[H] && c(H) && f(H, L);
          let U = l.live === "playing",
            k = U ? (I >= 0.8 || (l.tier === 2 && I >= 0.68) ? 2 : I >= 0.4 || (l.tier >= 1 && I >= 0.32) ? 1 : 0) : 0;
          (k === 2 && l.tier < 2 && !l.wave && l.gate === 1 ? g(L, z, !1) : k < 2 && l.wave && L < l.wave.Ti - 0.6 && !l.final && E(L),
            (l.tier = k),
            l.wave && L >= l.wave.Ti && ((l.gate = 1), (l.wave = null)));
          let C = m(z, L),
            A = L < l.duckUntil ? a.relayDuck : 1,
            F = l.live === "dead" || (l.live === "complete" && l.completeT >= 0 && L - l.completeT < a.cadenceLen);
          for (let H of $l) {
            let N = l.layers[H];
            N && h(N, C[H] * A, L, F ? 0.22 : A < 1 ? 0.2 : a.xfade);
          }
          for (; l.t0 + l.nextBar * Jv - L < 0.4;) {
            let H = l.t0 + l.nextBar * Jv;
            (H > L + 0.03 && S(l.nextBar, H, k, L), l.nextBar++);
          }
          (l.voices.length > 24 || (l.voices.length && l.voices[0].end < L)) && (l.voices = l.voices.filter((H) => H.end > L));
        },
        debug() {
          let R = {};
          for (let z of $l) R[z] = l.layers[z] ? +l.layers[z].t.toFixed(3) : null;
          return {
            on: l.on,
            t0: l.t0,
            bar: l.nextBar,
            live: l.live,
            tier: l.tier,
            final: l.final,
            gate: l.gate,
            plan: l.plan,
            voices: l.voices.length,
            layers: R,
          };
        },
      },
      T = (R, z, I) => x("mus_cell", R, z, I),
      w = (R, z, I) => x("mus_horn", R, z, I);
    function S(R, z, I, L) {
      let U = R % 8,
        k = l.live;
      if (k === "dead") return;
      if (z < l.muteUntil) {
        U === 0 && (l.plan = "rest");
        return;
      }
      if (k === "complete") {
        if (l.completeT >= 0 && z - l.completeT < a.cadenceLen + 2) return;
        U === 0 && r() < 0.6 && T(0, z, a.cell * 0.8);
        return;
      }
      if (U === 0) {
        let N = r();
        (l.cycle++,
          k === "title" || k === "intro"
            ? (l.plan = c("mus_cell", 3) && l.plan !== "full" ? "full" : "rest")
            : I === 0
              ? (l.plan =
                  l.quiet >= 1
                    ? N < 0.5
                      ? "call"
                      : N < 0.8
                        ? "full call"
                        : "answer"
                    : N < 0.3
                      ? "call"
                      : N < 0.48
                        ? "full call"
                        : N < 0.62
                          ? "tail"
                          : N < 0.72
                            ? "answer"
                            : "rest")
              : I === 1
                ? (l.plan = N < 0.4 ? "call" : N < 0.55 ? "tail" : "rest")
                : l.armed || l.final
                  ? ((l.plan = l.armed || l.cycle % 2 ? "full" : "call"), (l.armed = !1))
                  : (l.plan = ["rest", "full call", "rest", "full"][l.cycle % 4]),
          (l.quiet = l.plan === "rest" ? l.quiet + 1 : 0));
      }
      let C = l.plan,
        A = U >> 1,
        H =
          (U & 1) === 0 &&
          (C === "full" ||
            (C === "call" && A === 0) ||
            (C === "full call" && A < 2) ||
            (C === "tail" && A === 3) ||
            (C === "answer" && A >= 2));
      if (I === 2 && l.gate === 1) {
        H && w(A, z, a.horn);
        let N = l.final ? [0.6, 1] : [0.3, 0.8];
        if ((U === 3 && r() < N[0]) || (U === 7 && r() < N[1])) {
          let Z = Math.floor(r() * 3);
          (Z === l.lastFill && (Z = (Z + 1) % 3), (l.lastFill = Z), x("mus_fill", Z, z, a.fill, { kind: "fill" }));
        }
        return;
      }
      I !== 2 &&
        (H && T(A, z, k === "title" || k === "intro" ? a.cell : I === 1 ? a.cell * 0.85 : a.cell),
        H ||
          (k === "title" || k === "intro"
            ? U === 5 && r() < 0.5 && x("mus_hit", 0, z, a.hit * 0.8, { kind: "hit" })
            : I === 0
              ? (U === 4 || U === 1) &&
                r() < (U === 4 ? 0.5 : 0.2) &&
                x("mus_hit", r() < 0.5 ? 0 : 1, z, a.hit * (0.7 + 0.3 * r()), { kind: "hit" })
              : I === 1 && (U === 0 || (U === 4 && r() < 0.4)) && x("mus_hit", U === 0 ? 0 : 1, z, a.hit * 0.85, { kind: "hit" })));
    }
    return _;
  }
  export var ti = (n, e, t) => Math.min(t, Math.max(e, n));
  export var aE = {
      metal: "impact_metal",
      concrete: "impact_concrete",
      wood: "impact_wood",
      water: "impact_water",
      glass: "impact_glass",
      dirt: "impact_concrete",
      rubber: "impact_wood",
    },
    Qv = {
      metal: "step_metal",
      water: "step_water",
      concrete: "step_concrete",
      wood: "step_concrete",
      dirt: "step_concrete",
      glass: "step_concrete",
      rubber: "step_concrete",
    },
    lE = new Set([
      "thunder",
      "foghorn",
      "objective",
      "complete",
      "death",
      "mus_cell",
      "mus_horn",
      "mus_fill",
      "mus_hit",
      "mus_riser",
      "mus_impact",
      "explosion",
      "explosion_big",
      "rifle_tail_out",
      "rifle_tail_in",
      "pistol_tail_out",
      "pistol_tail_in",
      "gull_die",
      "hound_die",
      "relay_cut",
      "container_bang",
      "ear_ring",
    ]),
    Ez = [
      "rifle_tail_out",
      "rifle_tail_in",
      "ir_outdoor",
      "ir_shed",
      "pistol_shot",
      "pistol_tail_out",
      "pistol_tail_in",
      "reload_magout",
      "reload_maginsert",
      "reload_magin",
      "reload_boltback",
      "reload_bolt",
      "pistol_dry",
      "pistol_magout",
      "pistol_maginsert",
      "pistol_magin",
      "pistol_slide",
      "weapon_holster",
      "weapon_draw",
      "gear_rustle",
      "shell_bounce",
      "shell_bounce_metal",
      "rain",
      "whiz",
      "impact_concrete",
      "impact_metal",
      "land",
      "jump",
      "hurt",
      "explosion",
      "explosion_big",
      "music_drone",
      "mus_cell",
      "wind",
      "impact_enemy",
      "impact_wood",
      "impact_water",
      "impact_glass",
      "ricochet",
      "gull_rotor",
      "hound_servo",
      "alert",
      "telegraph",
      "gull_fire",
      "hound_fire",
      "hound_step",
      "ui_click",
      "ui_hover",
      "sea",
      "rain_interior",
      "relay_hum",
      "gull_die",
      "hound_die",
      "ear_ring",
      "death",
      "mus_hit",
      "music_strings",
      "music_pulse",
      "music_ticks",
      "relay_cut",
      "objective",
      "mus_riser",
      "mus_impact",
      "music_drums",
      "music_brass",
      "mus_fill",
      "mus_horn",
      "thunder",
      "music_lift",
      "complete",
      "gull_cry",
      "halyard",
      "foghorn",
      "container_bang",
    ];
  export function Sz() {
    let n = () => {},
      e = { setPos: n, setGain: n, setPitch: n, stop: n };
    return {
      silent: !0,
      update: n,
      resume: n,
      play: n,
      loop: () => e,
      setIntensity: n,
      setInterior: n,
      setVolume: n,
      setPaused: n,
      debug: () => ({ state: "none" }),
      names: Object.keys(Ir),
      ready: Promise.resolve(),
    };
  }
  export async function cE(n) {
    let e = typeof window < "u" && (window.AudioContext || window.webkitAudioContext),
      t = null;
    try {
      e && (t = new e({ latencyHint: "interactive" }));
    } catch {
      t = null;
    }
    return t ? uE(n, t, null) : (console.warn("[audio] WebAudio unavailable \u2014 running silent"), Sz());
  }
  export function uE(n, e, t) {
    let i = n.events,
      s = Math.random,
      o = () => (t ? !0 : e.state === "running"),
      r = t ? t.bufs : new Map(),
      a = new Map(),
      l = 0,
      c = 0,
      u = 0;
    function f(ie, ae) {
      let pe = e.createBuffer(ae.ch.length, ae.ch[0].length, ae.sr);
      for (let Me = 0; Me < ae.ch.length; Me++) pe.getChannelData(Me).set(ae.ch[Me]);
      (r.set(ie, pe), c++);
      let Ee = a.get(ie);
      if (Ee) {
        a.delete(ie);
        for (let Me of Ee)
          try {
            Me(pe);
          } catch (Ie) {
            console.error("[audio] ready callback", Ie);
          }
      }
      return pe;
    }
    let h = (ie) => (Ir[ie].ir ? e.sampleRate : void 0);
    function p(ie, ae) {
      let pe = performance.now(),
        Ee = f(ie + "#" + ae, K6(ie, ae, h(ie)));
      return ((l += performance.now() - pe), Ee);
    }
    let d = [],
      m = new Set();
    for (let ie of [...Ez, ...Object.keys(Ir)]) {
      let ae = Ir[ie];
      if (!(!ae || m.has(ie))) {
        m.add(ie);
        for (let pe = 0; pe < ae.n; pe++)
          r.has(ie + "#" + pe) || (ae.boot ? p(ie, pe) : d.push({ name: ie, v: pe, k: ie + "#" + pe, steps: null }));
      }
    }
    u = l;
    let x,
      v = new Promise((ie) => {
        x = ie;
      });
    function y() {
      let ie = performance.now();
      for (; d.length;) {
        let ae = d[0];
        if (r.has(ae.k)) {
          d.shift();
          continue;
        }
        ae.steps || (ae.steps = J6(ae.name, ae.v, h(ae.name)));
        let pe = null;
        try {
          pe = ae.steps.step();
        } catch (Ee) {
          (console.error("[audio] synthesis failed for " + ae.k, Ee), d.shift());
          continue;
        }
        if ((pe && (f(ae.k, pe), d.shift(), ae.name, void 0), performance.now() - ie > 6)) break;
      }
      ((l += performance.now() - ie), d.length ? setTimeout(y, 12) : x());
    }
    t ? x() : setTimeout(y, 120);
    function b(ie, ae, pe) {
      let Ee = ie + "#" + ae,
        Me = r.get(Ee);
      if (Me) {
        pe(Me);
        return;
      }
      (a.has(Ee) || a.set(Ee, []), a.get(Ee).push(pe));
      let Ie = d.findIndex((Ce) => Ce.k === Ee);
      if (Ie > 0 && !d[Ie].steps) {
        let [Ce] = d.splice(Ie, 1);
        d.splice(d[0] && d[0].steps ? 1 : 0, 0, Ce);
      }
    }
    let g = (ie) => {
        let ae = e.createGain();
        return ((ae.gain.value = ie), ae);
      },
      E = g(1),
      M = e.createDynamicsCompressor(),
      _ = g(nE()),
      T = e.createWaveShaper(),
      w = g(ji.master);
    ((M.threshold.value = ji.comp.threshold),
      (M.knee.value = ji.comp.knee),
      (M.ratio.value = ji.comp.ratio),
      (M.attack.value = ji.comp.attack),
      (M.release.value = ji.comp.release),
      (T.curve = tE()));
    try {
      T.oversample = "2x";
    } catch {}
    (E.connect(M), M.connect(_), _.connect(T), T.connect(w), w.connect(e.destination));
    let S = e.createBiquadFilter();
    ((S.type = "lowpass"), (S.frequency.value = 2e4), (S.Q.value = 0.5));
    let R = g(1);
    (S.connect(R), R.connect(E));
    let z = { world: g(1.25), near: g(1.24), gun: g(1), tail: g(1), amb: g(0.767), dry: g(1.3), music: g(ji.musicBus) };
    (z.world.connect(S), z.near.connect(S), z.gun.connect(S), z.tail.connect(S), z.dry.connect(E));
    let I = g(1),
      L = g(1),
      U = g(1);
    (z.amb.connect(I), I.connect(S), z.music.connect(U), U.connect(L), L.connect(E));
    function k(ie, ae, pe) {
      let Ee = e.currentTime,
        Me = ji.duck;
      for (let Ie of [I.gain, L.gain])
        try {
          (Ie.cancelScheduledValues(Ee),
            Ie.setTargetAtTime(ie, Ee, Me.attack),
            Ie.setTargetAtTime(1, Ee + (ae || Me.hold), pe || Me.release));
        } catch {}
    }
    let C = g(1),
      A = g(1),
      F = g(0),
      H = e.createConvolver(),
      N = e.createConvolver(),
      Z = g(0.75),
      Q = g(0.95),
      W = g(0.9),
      J = g(0.32),
      G = g(0.07),
      te = g(0.2);
    (z.world.connect(W),
      W.connect(C),
      z.near.connect(J),
      J.connect(C),
      z.gun.connect(G),
      G.connect(C),
      C.connect(A),
      C.connect(F),
      A.connect(H),
      F.connect(N),
      H.connect(Z),
      N.connect(Q),
      Z.connect(S),
      Q.connect(S),
      z.music.connect(te),
      te.connect(N),
      b("ir_outdoor", 0, (ie) => {
        H.buffer = ie;
      }),
      b("ir_shed", 0, (ie) => {
        N.buffer = ie;
      }));
    function oe(ie, ae, pe, Ee) {
      ie.positionX ? ((ie.positionX.value = ae), (ie.positionY.value = pe), (ie.positionZ.value = Ee)) : ie.setPosition(ae, pe, Ee);
    }
    function ee(ie) {
      let ae = e.createPanner();
      return (
        (ae.panningModel = ie ? "HRTF" : "equalpower"),
        (ae.distanceModel = "inverse"),
        (ae.refDistance = 3),
        (ae.rolloffFactor = 0.6),
        (ae.maxDistance = 400),
        (ae.coneInnerAngle = 360),
        ae
      );
    }
    let le = { world: [], near: [], gun: [], tail: [], dry: [], music: [] };
    function xe(ie, ae) {
      let pe = { g: g(0), pan: null, src: null, end: 0, start: 0, name: "", pri: 0 };
      (ae ? ((pe.pan = ee(!1)), pe.g.connect(pe.pan), pe.pan.connect(z[ie])) : pe.g.connect(z[ie]), le[ie].push(pe));
    }
    for (let ie = 0; ie < 22; ie++) xe("world", !0);
    for (let ie = 0; ie < 12; ie++) xe("near", !1);
    for (let ie = 0; ie < 18; ie++) xe("gun", !1);
    for (let ie = 0; ie < 12; ie++) xe("tail", !1);
    for (let ie = 0; ie < 8; ie++) xe("dry", !1);
    for (let ie = 0; ie < 3; ie++) xe("music", !1);
    let j = { x: 0, y: 1.7, z: 0 },
      O = !1,
      q = !1,
      ue = 0.9,
      de = (n.game && n.game.state) || "title",
      $ = 0,
      se = 0,
      fe = 0,
      me = 0,
      ge = 0,
      ce = 0,
      P = 1,
      D = 1,
      B = 0,
      X = -9,
      re = -9,
      Y = ji.weapon.rifle,
      he = -9,
      V = -9,
      ne = -9,
      ye = -9,
      Te = -9,
      Re = -9,
      Ue = -9,
      Ve = {},
      ze = { rifle: 0, pistol: 0 },
      Ge = [],
      _e = { autoIntensity: !0 };
    function Ne(ie, ae, pe, Ee) {
      let Me = null,
        Ie = 0,
        Ce = null,
        Ye = null;
      for (let rt = 0; rt < ie.length; rt++) {
        let Be = ie[rt];
        if (Be.end <= Ee) {
          Me || (Me = Be);
          continue;
        }
        (Be.name === ae && (Ie++, (!Ce || Be.start < Ce.start) && (Ce = Be)),
          (!Ye || Be.pri < Ye.pri || (Be.pri === Ye.pri && Be.start < Ye.start)) && (Ye = Be));
      }
      if (Ie >= (pe.max || 4)) {
        if (!pe.soft || !Me) return Ce;
        try {
          (Ce.g.gain.cancelScheduledValues(Ee), Ce.g.gain.setTargetAtTime(0, Ee, 0.035), Ce.src && Ce.src.stop(Ee + 0.25));
        } catch {}
        ((Ce.end = Ee + 0.25), (Ce.name = ""));
      }
      return Me || (Ye && Ye.pri <= pe.pri ? Ye : null);
    }
    let ke = (ie, ae) => !!je(ie, ae);
    function je(ie, ae) {
      ((ae = ae || {}),
        (ie = $6[ie] || ie),
        ae.surface && (ie === "impact_concrete" ? (ie = aE[ae.surface] || ie) : ie === "step_concrete" && (ie = Qv[ae.surface] || ie)));
      let pe = Ir[ie];
      if (!pe || pe.loop || pe.ir || !o()) return null;
      let Ee = ae.variant;
      Ee == null ? (Ee = Ve[ie] = ((Ve[ie] || 0) + 1 + (pe.n > 2 && s() < 0.3 ? 1 : 0)) % pe.n) : (Ee %= pe.n);
      let Me = r.get(ie + "#" + Ee);
      if (!Me) {
        if (ae.noDefer && lE.has(ie)) return null;
        if (lE.has(ie)) {
          let o0 = e.currentTime;
          return (
            b(ie, Ee, () => {
              e.currentTime - o0 < 2.5 && ke(ie, Object.assign({}, ae, { variant: Ee }));
            }),
            null
          );
        }
        Me = p(ie, Ee);
      }
      let Ie = e.currentTime,
        Ce = ae.pos,
        Ye = !!Ce && pe.bus === "world",
        rt = Ye ? le.world : le[pe.bus === "world" ? "near" : pe.bus],
        Be = Ne(rt, ie, pe, Ie);
      if (!Be) return null;
      let _t = Ie + (ae.delay || 0),
        wt = Be.g.gain;
      if ((wt.cancelScheduledValues(Ie), Be.end > Ie && Be.src)) {
        wt.setTargetAtTime(0, Ie, 0.004);
        try {
          Be.src.stop(Ie + 0.025);
        } catch {}
        _t = Math.max(_t, Ie + 0.025);
      }
      let z0 = ae.jitter != null ? ae.jitter : 0.035,
        Pi = ti((ae.pitch || 1) * (1 + (s() * 2 - 1) * z0), 0.25, 4);
      if ((wt.setValueAtTime((ae.gain != null ? ae.gain : 1) * (1 - s() * 0.08), _t), Ye)) {
        let o0 = Array.isArray(Ce) ? { x: Ce[0], y: Ce[1], z: Ce[2] } : Ce;
        (oe(Be.pan, o0.x || 0, o0.y || 0, o0.z || 0),
          (Be.pan.refDistance = ae.ref || pe.ref || 3),
          (Be.pan.rolloffFactor = ae.roll != null ? ae.roll : pe.roll != null ? pe.roll : 0.6));
      }
      let Lt = e.createBufferSource();
      return (
        (Lt.buffer = Me),
        (Lt.playbackRate.value = Pi),
        Lt.connect(Be.g),
        (Lt.onended = () => {
          try {
            Lt.disconnect();
          } catch {}
        }),
        Lt.start(_t),
        (Be.src = Lt),
        (Be.start = _t),
        (Be.end = _t + Me.duration / Pi + 0.03),
        (Be.name = ie),
        (Be.pri = pe.pri || 0),
        Be
      );
    }
    let Ze = new Set(),
      qe = new Set(),
      Oe = () => {},
      mt = !1,
      $e = { setPos: Oe, setGain: Oe, setPitch: Oe, stop: Oe, alive: !1 };
    function Ke(ie, ae) {
      ae = ae || {};
      let pe = Ir[ie];
      if (!pe || !pe.loop) return $e;
      let Ee = (ie === "gull_rotor" || ie === "hound_servo") && !ae._auto;
      Ee && !ae.hrtf && (ae = Object.assign({ hrtf: !0 }, ae));
      let Me = {
          name: ie,
          alive: !0,
          vT: 1,
          vC: 1,
          px: 0,
          py: 0,
          pz: 0,
          gT: ae.gain != null ? ae.gain : 1,
          gC: 0,
          pT: ae.pitch || 1,
          pC: ae.pitch || 1,
          src: null,
          g: g(0),
          pan: null,
          rate: ae.fade || 6,
        },
        Ie = Me.g;
      if (
        (ae.pos &&
          ((Me.pan = ee(!!ae.hrtf)),
          (Me.pan.refDistance = ae.ref || pe.ref || 3),
          (Me.pan.rolloffFactor = ae.roll != null ? ae.roll : pe.roll != null ? pe.roll : 0.6),
          Me.g.connect(Me.pan),
          (Ie = Me.pan)),
        Ie.connect(z[ae.bus || (ae.pos ? "world" : pe.music ? "music" : "amb")]),
        (Me.setPos = (Ce) => {
          Me.pan &&
            Ce &&
            (Array.isArray(Ce)
              ? ((Me.px = Ce[0]), (Me.py = Ce[1]), (Me.pz = Ce[2]))
              : ((Me.px = Ce.x || 0), (Me.py = Ce.y || 0), (Me.pz = Ce.z || 0)),
            Number.isFinite(Me.px + Me.py + Me.pz) && oe(Me.pan, Me.px, Me.py, Me.pz));
        }),
        (Me.setGain = (Ce) => {
          Me.gT = Math.max(0, +Ce || 0);
        }),
        (Me.setPitch = (Ce) => {
          Me.pT = ti(+Ce || 1, 0.25, 4);
        }),
        (Me.stop = (Ce) => {
          if (!Me.alive) return;
          ((Me.alive = !1), Ze.delete(Me), qe.delete(Me));
          let Ye = Ce ?? 0.18,
            rt = e.currentTime;
          try {
            (Me.g.gain.setValueAtTime(Me.gC, rt), Me.g.gain.linearRampToValueAtTime(0, rt + Ye), Me.src && Me.src.stop(rt + Ye + 0.03));
          } catch {}
          setTimeout(
            () => {
              try {
                (Me.src && Me.src.disconnect(), Me.g.disconnect(), Me.pan && Me.pan.disconnect());
              } catch {}
            },
            (Ye + 0.3) * 1e3,
          );
        }),
        ae.pos && Me.setPos(ae.pos),
        b(ie, 0, (Ce) => {
          if (!Me.alive) return;
          let Ye = e.createBufferSource();
          ((Ye.buffer = Ce),
            (Ye.loop = !0),
            (Ye.playbackRate.value = Me.pC),
            Ye.connect(Me.g),
            Ye.start(0, ae.offset != null ? ae.offset : s() * Ce.duration),
            (Me.src = Ye));
        }),
        Ze.add(Me),
        Ee && (qe.add(Me), !mt))
      ) {
        mt = !0;
        for (let Ce of [...Sn.keys()]) xn(Ce);
      }
      return Me;
    }
    let Bt = rE({ ctx: e, out: z.music, bufs: r, whenReady: b, running: o, rnd: s });
    function Gt() {}
    let vi = {
        rain: Ke("rain", { gain: 0, fade: 2 }),
        rainIn: Ke("rain_interior", { gain: 0, fade: 2 }),
        wind: Ke("wind", { gain: 0, fade: 2 }),
        sea: Ke("sea", { gain: 0, pos: [33, -1, 0], fade: 2, bus: "amb" }),
      },
      q0 = 0.4,
      yi = 0.4,
      sn = 2,
      P0 = { fog: 14 + s() * 14, gull: 5 + s() * 8, hal: 4 + s() * 6, bang: 20 + s() * 25 };
    function $t(ie, ae) {
      let pe = 1 - 0.7 * se;
      if ((P0.fog -= ie) <= 0) {
        P0.fog = 40 + s() * 30;
        let Ee = j.z + (s() * 2 - 1) * 250;
        ke("foghorn", { pos: [j.x + 320, 8, Ee], ref: 400, gain: 0.34 * ae * pe, pitch: s() < 0.3 ? 0.89 : 1, jitter: 0.01 });
      }
      if ((P0.gull -= ie) <= 0) {
        P0.gull = 9 + s() * 16;
        let Ee = s() * 6.283,
          Me = 35 + s() * 50;
        ke("gull_cry", {
          pos: [j.x + Math.cos(Ee) * Me, 14 + s() * 18, j.z + Math.sin(Ee) * Me],
          ref: Me,
          roll: 1,
          gain: (0.16 + s() * 0.16) * ae * pe,
          jitter: 0.1,
        });
      }
      if (
        ((P0.hal -= ie) <= 0 &&
          ((P0.hal = 6 + s() * 11),
          ke("halyard", {
            pos: [29 + s() * 8, 3 + s() * 6, -8 + s() * 32],
            ref: 16,
            roll: 0.5,
            gain: (0.3 + s() * 0.3) * ae * pe,
            jitter: 0.08,
          })),
        (P0.bang -= ie) <= 0)
      ) {
        P0.bang = 28 + s() * 34;
        let Ee = 1.6 + s() * 3.2;
        ke("container_bang", {
          pos: [j.x + Math.cos(Ee) * 150, 4, j.z + Math.sin(Ee) * 150],
          ref: 150,
          gain: (0.2 + s() * 0.16) * ae * pe,
          jitter: 0.12,
        });
      }
    }
    let Sn = new Map(),
      bi = 0;
    function oi(ie) {
      !ie ||
        mt ||
        Sn.has(ie) ||
        ie.alive === !1 ||
        Sn.set(ie, {
          h: null,
          type: ie.type === "hound" ? "hound" : "gull",
          lx: ie.pos ? ie.pos.x : 0,
          ly: ie.pos ? ie.pos.y : 0,
          lz: ie.pos ? ie.pos.z : 0,
          sp: 0,
          d: 1e9,
          tune: 0.96 + s() * 0.1,
        });
    }
    function xn(ie) {
      let ae = Sn.get(ie);
      ae && (ae.h && ae.h.stop(0.12), Sn.delete(ie));
    }
    let Zt = [];
    function Vs(ie) {
      if (((bi -= ie), bi <= 0 && mt)) {
        ((bi = 0.25), (Zt.length = 0));
        for (let ae of qe) ((ae.d = Math.hypot(ae.px - j.x, ae.py - j.y, ae.pz - j.z)), Zt.push(ae));
        Zt.sort((ae, pe) => ae.d - pe.d);
        for (let ae = 0; ae < Zt.length; ae++) Zt[ae].vT = ae < 6 && Zt[ae].d < 90 ? 1 : 0;
      }
      if (bi <= 0) {
        bi = 0.25;
        let ae = n.enemies && n.enemies.list;
        if (Array.isArray(ae))
          for (let pe = 0; pe < ae.length; pe++) {
            let Ee = ae[pe];
            Ee && Ee.alive !== !1 && !Sn.has(Ee) && oi(Ee);
          }
        Zt.length = 0;
        for (let [pe, Ee] of Sn) {
          if (pe.alive === !1 || (Array.isArray(ae) && ae.indexOf(pe) < 0)) {
            xn(pe);
            continue;
          }
          let Me = pe.pos;
          Me && ((Ee.d = Math.hypot(Me.x - j.x, Me.y - j.y, Me.z - j.z)), Zt.push(Ee));
        }
        Zt.sort((pe, Ee) => pe.d - Ee.d);
        for (let pe = 0; pe < Zt.length; pe++) {
          let Ee = Zt[pe],
            Me = pe < 6 && Ee.d < 90;
          Me && !Ee.h
            ? (Ee.h = Ke(Ee.type === "gull" ? "gull_rotor" : "hound_servo", {
                pos: [Ee.lx, Ee.ly, Ee.lz],
                gain: 0,
                hrtf: !0,
                fade: 5,
                _auto: !0,
              }))
            : !Me && Ee.h && (Ee.h.stop(0.25), (Ee.h = null));
        }
      }
      for (let [ae, pe] of Sn) {
        let Ee = ae.pos;
        if (Ee) {
          if (ie > 0) {
            let Me = Math.hypot(Ee.x - pe.lx, Ee.y - pe.ly, Ee.z - pe.lz) / ie;
            pe.sp += (Math.min(Me, 30) - pe.sp) * Math.min(1, ie * 5);
          }
          if (((pe.lx = Ee.x), (pe.ly = Ee.y), (pe.lz = Ee.z), !!pe.h))
            if ((pe.h.setPos(Ee), pe.type === "gull")) (pe.h.setGain(1), pe.h.setPitch(pe.tune * (0.94 + 0.3 * ti(pe.sp / 10, 0, 1))));
            else {
              let Me = ti(pe.sp / 3, 0, 1);
              (pe.h.setGain(0.3 + 0.5 * Me), pe.h.setPitch(pe.tune * (0.88 + 0.3 * Me)));
            }
        }
      }
    }
    let ws = [];
    function cl() {
      for (let ae of ws) ae.h.stop(0.2);
      ws = [];
      let ie = n.level && n.level.objectives;
      Array.isArray(ie) &&
        ie.forEach((ae, pe) => {
          ae &&
            ae.pos &&
            ws.push({
              id: ae.id,
              index: pe,
              pos: { x: ae.pos.x, y: (ae.pos.y || 0) + 1.2, z: ae.pos.z },
              h: Ke("relay_hum", { pos: [ae.pos.x, (ae.pos.y || 0) + 1.2, ae.pos.z], gain: 0.9 }),
            });
        });
    }
    function I0(ie) {
      ie = ie || {};
      let ae = ws.findIndex((pe) => ie.id != null && pe.id === ie.id);
      if ((ae < 0 && ie.index != null && (ae = ws.findIndex((pe) => pe.index === ie.index)), ae >= 0)) {
        let pe = ws[ae];
        (pe.h.stop(0.08), ws.splice(ae, 1), ke("relay_cut", { pos: pe.pos, gain: 1 }));
      } else ke("relay_cut", { gain: 0.8 });
    }
    let Kt = (ie) => (ie && typeof ie.x == "number" ? ie : null),
      be = (ie) => (ie && ie.weapon === "pistol" ? "pistol" : "rifle");
    function Le(ie) {
      let ae = ji.weapon[ie],
        pe = e.currentTime;
      ((Y = ae),
        (X = pe),
        (ze[ie] = (ze[ie] + 1 + (s() < 0.25 ? 1 : 0)) % ae.n),
        je(ae.shot, { variant: ze[ie], gain: ae.gain, jitter: 0.012 }));
      for (let Ce of Ge)
        if (Ce.ch.src === Ce.src)
          try {
            Ce.ch.g.gain.cancelScheduledValues(pe);
          } catch {}
      Ge.length = 0;
      let Ee = se,
        Me = Q6(pe - re),
        Ie = (Ce, Ye) => {
          if (Ye < 0.05) return;
          let rt = ae.tail * Ye,
            Be = je(Ce, { gain: rt * Me, jitter: 0.02, noDefer: !0 });
          if (Be && Me < 0.999) {
            try {
              Be.g.gain.setTargetAtTime(rt, Be.start + ji.tailBoostAfter, 0.03);
            } catch {}
            Ge.push({ ch: Be, src: Be.src });
          }
        };
      (Ie(ae.tailOut, Math.cos((Ee * Math.PI) / 2)),
        Ie(ae.tailIn, Math.sin((Ee * Math.PI) / 2)),
        (re = pe),
        k(ae.duck),
        me > 0.3 && (me = Math.min(1, me + 0.015)));
    }
    let Fe = (ie, ae) => {
      i &&
        i.on &&
        i.on(ie, (pe) => {
          try {
            ae(pe || {});
          } catch (Ee) {
            console.error("[audio] " + ie, Ee);
          }
        });
    };
    (Fe("weapon:fire", (ie) => {
      o() && Le(be(ie));
    }),
      Fe("weapon:dry", (ie) => ke(be(ie) === "pistol" ? "pistol_dry" : "rifle_dry", { gain: 1, jitter: 0.02 })));
    let He = {
      rifle: {
        magout: "reload_magout",
        maginsert: "reload_maginsert",
        magin: "reload_magin",
        boltback: "reload_boltback",
        bolt: "reload_bolt",
        slide: "reload_bolt",
      },
      pistol: {
        magout: "pistol_magout",
        maginsert: "pistol_maginsert",
        magin: "pistol_magin",
        boltback: "pistol_slide",
        bolt: "pistol_slide",
        slide: "pistol_slide",
      },
    };
    (Fe("weapon:reload", (ie) => {
      let ae = be(ie),
        pe = ie.phase,
        Ee = He[ae][pe];
      pe === "start"
        ? ke("gear_rustle", { variant: 0, gain: 0.9, pitch: ae === "pistol" ? 1.12 : 1 })
        : pe === "done"
          ? ke("gear_rustle", { variant: 1, gain: 0.6, pitch: ae === "pistol" ? 1.12 : 1 })
          : pe === "boltback" && ae === "rifle"
            ? ke(Ee, { variant: ie.partial ? 1 : 0, gain: ie.partial ? 0.6 : 1, jitter: 0.02 })
            : Ee && ke(Ee, { gain: 1, jitter: 0.02 });
    }),
      Fe("weapon:switch", (ie) => {
        let ae = ie.to === "pistol",
          pe = ie.from === "pistol";
        ie.phase === "holster"
          ? ke("weapon_holster", { gain: pe ? 0.75 : 1, pitch: pe ? 1.18 : 1 })
          : ie.phase === "draw" && ke("weapon_draw", { gain: ae ? 0.8 : 1, pitch: ae ? 1.15 : 1 });
      }),
      Fe("weapon:melee", () => ke("jump", { gain: 0.9, pitch: 1.2 })),
      Fe("shell:bounce", (ie) => {
        let ae = e.currentTime;
        if (ae - ye < 0.04) return;
        ye = ae;
        let pe = Y.shellPitch;
        ie.surface === "water"
          ? ke("impact_water", { pos: Kt(ie.pos), gain: 0.25, pitch: 1.7 })
          : ie.surface === "metal" || ie.surface === "glass"
            ? ke("shell_bounce_metal", { pos: Kt(ie.pos), gain: 1, pitch: pe, jitter: 0.06 })
            : ke("shell_bounce", {
                pos: Kt(ie.pos),
                gain: ie.surface === "wood" || ie.surface === "rubber" || ie.surface === "dirt" ? 0.5 : 0.85,
                pitch: pe * (ie.surface === "wood" ? 0.9 : 1),
                jitter: 0.06,
              });
      }),
      Fe("impact", (ie) => {
        let ae = e.currentTime;
        if (ae - he < 0.022) return;
        he = ae;
        let pe = Kt(ie.point),
          Ee = ie.surface;
        if (ie.enemy) {
          ke("impact_enemy", { pos: pe, gain: ie.part === "weak" ? 1 : 0.85, pitch: ie.part === "weak" ? 1.25 : 1 });
          return;
        }
        if (ie.from === "enemy" && pe && ie.dir && typeof ie.dir.x == "number" && ae - Ue > 0.09) {
          let Me = ie.dir,
            Ie = Me.x * Me.x + Me.y * Me.y + Me.z * Me.z || 1,
            Ce = ((j.x - pe.x) * Me.x + (j.y - pe.y) * Me.y + (j.z - pe.z) * Me.z) / Ie;
          if (Ce < -1.5) {
            let Ye = pe.x + Me.x * Ce,
              rt = pe.y + Me.y * Ce,
              Be = pe.z + Me.z * Ce,
              _t = Math.hypot(j.x - Ye, j.y - rt, j.z - Be);
            _t < 3.2 && ((Ue = ae), ke("whiz", { pos: { x: Ye, y: rt, z: Be }, gain: ti(1.15 - _t / 3.5, 0.3, 1), jitter: 0.1 }));
          }
        }
        (ke(aE[Ee] || "impact_concrete", {
          pos: pe,
          gain: ie.from === "enemy" ? 0.8 : 0.9,
          pitch: Ee === "dirt" ? 0.8 : Ee === "rubber" ? 0.7 : 1,
          jitter: 0.07,
        }),
          ae - V > 0.22 &&
            ((Ee === "metal" && s() < 0.24) || (Ee === "concrete" && s() < 0.07)) &&
            ((V = ae), ke("ricochet", { pos: pe, gain: 0.75, delay: 0.012, jitter: 0.12 })));
      }),
      Fe("player:step", (ie) => {
        let ae = ie.surface || "concrete";
        try {
          ie.pos && n.ground && n.ground.isPuddle && n.ground.isPuddle(ie.pos.x, ie.pos.z) && (ae = "water");
        } catch {}
        ke(Qv[ae] || "step_concrete", {
          gain: (ie.sprint ? 0.8 : 0.55) * (ae === "water" ? 0.9 : 1),
          pitch: (ie.sprint ? 1.05 : 1) * (ae === "wood" ? 1.18 : 1),
          jitter: 0.06,
        });
      }),
      Fe("player:jump", () => ke("jump", { gain: 0.8 })),
      Fe("player:land", (ie) => {
        let ae = ti(0.35 + (Math.abs(ie.speed) || 4) / 10, 0.35, 1);
        (ke("land", { gain: ae }),
          (ie.surface === "water" || ie.surface === "metal") && ke(Qv[ie.surface], { gain: ae * 0.8, pitch: 0.9 }));
      }),
      Fe("player:hit", (ie) => {
        let ae = +ie.amount || 10,
          pe = e.currentTime;
        (ke("hurt", { gain: ti(0.5 + ae / 40, 0.5, 1), jitter: 0.08 }),
          ae >= 6 && pe - ne > 1.8 && ((ne = pe), ke("ear_ring", { gain: ti(ae / 28, 0.3, 1), jitter: 0.02 })),
          (ce = Math.max(ce, ti(ae / 40, 0.2, 0.7))),
          (me = Math.min(1, Math.max(me, 0.6) + 0.15)));
      }),
      Fe("player:dead", () => {
        (Bt.death(), (ce = 1));
      }),
      Fe("enemy:spawn", (ie) => oi(ie.enemy)),
      Fe("enemy:alert", (ie) => {
        me = Math.max(me, 0.6);
        let ae = e.currentTime;
        if (ae - Te < 0.12) return;
        Te = ae;
        let pe = ie.enemy || {};
        ke("alert", { pos: Kt(pe.pos) || Kt(ie.pos), variant: pe.type === "hound" ? 1 : 0, gain: 0.9 });
      }),
      Fe("enemy:fire", (ie) => {
        let ae = ie.type || (ie.enemy && ie.enemy.type),
          pe = Kt(ie.pos) || (ie.enemy && Kt(ie.enemy.pos));
        (ke(ae === "hound" ? "hound_fire" : "gull_fire", { pos: pe, gain: 1, jitter: 0.04 }), (me = Math.min(1, Math.max(me, 0.6) + 0.05)));
      }),
      Fe("enemy:step", (ie) => {
        if (ie.crash) {
          (ke("hound_step", { pos: Kt(ie.pos), gain: 1, pitch: 0.72 }), ke("impact_metal", { pos: Kt(ie.pos), gain: 0.8, pitch: 0.55 }));
          return;
        }
        ie.type !== "gull" && ke("hound_step", { pos: Kt(ie.pos), gain: ti(0.6 + (+ie.speed || 2) * 0.1, 0.6, 1), jitter: 0.06 });
      }),
      Fe("enemy:telegraph", (ie) => {
        let ae = ie.enemy || {},
          pe = ie.type || ae.type,
          Ee = ti(+ie.time || 0.55, 0.15, 1.5);
        (ke("telegraph", {
          pos: Kt(ie.pos) || Kt(ae.pos),
          variant: pe === "hound" ? 1 : 0,
          pitch: 0.55 / Ee,
          gain: ie.melee ? 0.7 : 1,
          jitter: 0,
        }),
          (me = Math.max(me, 0.6)));
      }),
      Fe("enemy:melee", (ie) => {
        let ae = Kt(ie.pos) || (ie.enemy && Kt(ie.enemy.pos));
        (ke("hound_step", { pos: ae, gain: 1, pitch: 0.8 }),
          ke("impact_metal", { pos: ae, gain: 0.9, pitch: 0.7 }),
          ke("hurt", { gain: 0.6 }));
      }),
      Fe("enemy:killed", (ie) => {
        let ae = ie.enemy,
          pe = ie.type || (ae && ae.type),
          Ee = Kt(ie.pos) || (ae && Kt(ae.pos));
        (ae && xn(ae), ke(pe === "hound" ? "hound_die" : "gull_die", { pos: Ee, gain: 1, jitter: 0.05 }));
      }),
      Fe("explosion", (ie) => {
        let ae = ti(+ie.size || 1, 0.3, 3),
          pe = Kt(ie.pos),
          Ee = ae >= 1.3,
          Me = () => ke("explosion", { pos: pe, gain: ti(0.42 + 0.4 * ae, 0.5, 1), pitch: ti(1.26 - 0.22 * ae, 0.82, 1.2), jitter: 0.04 });
        if (
          ((Ee &&
            je("explosion_big", {
              pos: pe,
              gain: ti(0.7 + 0.18 * ae, 0.9, 1.2),
              pitch: ti(1.13 - 0.075 * ae, 0.92, 1.04),
              jitter: 0.03,
              ref: 12 + 3 * ae,
              noDefer: !0,
            })) ||
            Me(),
          pe)
        ) {
          let Ie = Math.hypot(pe.x - j.x, pe.y - j.y, pe.z - j.z);
          ce = Math.max(ce, ti((1 - (Ie - 5) / 10) * (Ee ? 1 : 0.7), 0, 0.8));
        }
        ((me = Math.max(me, 0.6)), (P = Math.min(P, Ee ? 0.3 : 0.45)), k(Ee ? 0.4 : 0.6, Ee ? 0.4 : 0.15, Ee ? 0.45 : 0.2));
      }),
      Fe("objective:done", (ie) => {
        (I0(ie), Bt.relay());
      }),
      Fe("objective:all", () => Bt.finalRun()));
    let De = () => Bt.complete();
    (Fe("extraction:reached", De),
      Fe("thunder", (ie) => {
        let ae = ti(ie.intensity != null ? +ie.intensity : 0.6, 0.1, 1);
        ke("thunder", { variant: ae > 0.6 ? 1 : 0, delay: 0.5 + (1 - ae) * 2 + s() * 0.6, gain: 0.35 + 0.65 * ae, jitter: 0.1 });
      }),
      Fe("ui:click", () => ke("ui_click")),
      Fe("ui:hover", () => ke("ui_hover")),
      Fe("game:state", (ie) => {
        let ae = de;
        if (((de = ie.state || de), Bt.state(de, ae), de === "playing" && ae !== "paused")) {
          ((me = 0), (ce = 0), cl());
          for (let pe of [...Sn.keys()]) pe.alive === !1 && xn(pe);
        }
        (de === "complete" && De(), de === "paused" ? (q = !0) : ae === "paused" && (q = !1));
      }));
    function ve() {
      if (((O = !0), e.state !== "running" && e.state !== "closed"))
        try {
          let ie = e.resume();
          ie && ie.catch && ie.catch(() => {});
        } catch {}
    }
    if (typeof window < "u" && !t) {
      let ie = () => {
        if ((ve(), o())) for (let ae of ["pointerdown", "keydown", "touchend", "mousedown"]) window.removeEventListener(ae, ie, !0);
      };
      for (let ae of ["pointerdown", "keydown", "touchend", "mousedown"]) window.addEventListener(ae, ie, { capture: !0, passive: !0 });
      document.addEventListener("visibilitychange", () => {
        try {
          document.hidden ? e.suspend() : O && e.resume();
        } catch {}
      });
    }
    function we(ie) {
      ie = Math.min(Math.max(+ie || 0, 0), 0.25);
      let ae = n.camera,
        pe = e.listener;
      if (ae && ae.matrixWorld) {
        let Be = ae.matrixWorld.elements;
        ((j.x = Be[12]),
          (j.y = Be[13]),
          (j.z = Be[14]),
          Number.isFinite(j.x + j.y + j.z + Be[8] + Be[4]) &&
            (pe.positionX
              ? ((pe.positionX.value = j.x),
                (pe.positionY.value = j.y),
                (pe.positionZ.value = j.z),
                (pe.forwardX.value = -Be[8]),
                (pe.forwardY.value = -Be[9]),
                (pe.forwardZ.value = -Be[10]),
                (pe.upX.value = Be[4]),
                (pe.upY.value = Be[5]),
                (pe.upZ.value = Be[6]))
              : (pe.setPosition(j.x, j.y, j.z), pe.setOrientation(-Be[8], -Be[9], -Be[10], Be[4], Be[5], Be[6]))));
      }
      let Ee = n.level && n.level.interiorBoxes;
      if (Array.isArray(Ee) && Ee.length) {
        let Be = 0;
        for (let _t = 0; _t < Ee.length; _t++) {
          let wt = Ee[_t];
          if (
            wt &&
            wt.min &&
            wt.max &&
            j.x > wt.min.x &&
            j.x < wt.max.x &&
            j.y > wt.min.y - 0.5 &&
            j.y < wt.max.y &&
            j.z > wt.min.z &&
            j.z < wt.max.z
          ) {
            Be = 1;
            break;
          }
        }
        $ = Be;
      }
      let Me = (Be) => 1 - Math.exp(-ie * Be);
      if (((se += ($ - se) * Me(3)), (A.gain.value = 1 - 0.9 * se), (F.gain.value = se), !o())) return;
      let Ie = e.currentTime,
        Ce = de === "playing" || de === "intro";
      ((B += ((q ? 0 : de === "title" ? 0.6 : de === "dead" ? 0.7 : 1) - B) * Me(1.2)),
        (D += ((q ? 0 : 1) - D) * Me(12)),
        (R.gain.value = D),
        (ce += ((de === "dead" ? 0.85 : 0) - ce) * Me(de === "dead" ? 3 : 0.9)),
        (S.frequency.value = 2e4 * Math.pow(0.03, ti(ce, 0, 1))),
        (w.gain.value = ue),
        (sn -= ie) <= 0 && ((sn = 3 + s() * 6), (yi = 0.12 + s() * 0.88)),
        (q0 += (yi - q0) * Me(0.5)),
        vi.rain.setGain(B * (1 - 0.93 * se) * 0.95),
        vi.rainIn.setGain(B * se * 0.95),
        vi.wind.setGain(B * (0.3 + 0.7 * q0) * (1 - 0.65 * se) * 0.75),
        vi.wind.setPitch(0.9 + 0.25 * q0),
        vi.sea.setGain(B * (1 - 0.5 * se) * 1),
        vi.sea.setPos([33, -1, ti(j.z, -28, 26)]),
        !q && (Ce || de === "title" || de === "complete") && $t(ie, de === "title" ? 0.7 : 1),
        q || Vs(ie),
        (me = Math.max(0, me - ie * (Sn.size ? 0.045 : 0.14))));
      let rt = Ce || q ? Math.max(fe, _e.autoIntensity ? Math.max(0.15, me) : 0) : 0;
      ((ge += (rt - ge) * Me(2)), (P += (1 - P) * Me(3.5)), (U.gain.value = P * (q ? 0.45 : 1)), Bt.update(ie, ge, rt));
      for (let Be of Ze)
        ((Be.vC += (Be.vT - Be.vC) * Me(4)),
          (Be.gC += (Be.gT * Be.vC - Be.gC) * Me(Be.rate)),
          (Be.g.gain.value = Be.gC),
          Be.src && Math.abs(Be.pT - Be.pC) > 1e-4 && ((Be.pC += (Be.pT - Be.pC) * Me(8)), (Be.src.playbackRate.value = Be.pC)));
    }
    async function Ae(ie) {
      ((ie = ie || {}), await v);
      let ae = e.sampleRate,
        pe = ie.seconds || 10,
        Ee = new OfflineAudioContext(2, ae * pe, ae),
        Me = new Map(),
        Ie = {
          on(Ht, rn) {
            (Me.has(Ht) || Me.set(Ht, []), Me.get(Ht).push(rn));
          },
          emit(Ht, rn) {
            for (let Hi of Me.get(Ht) || []) Hi(rn);
          },
        },
        Ce = new Float32Array(16);
      ((Ce[0] = Ce[5] = Ce[10] = Ce[15] = 1), (Ce[13] = 1.7));
      let Ye = [
          { type: "gull", alive: !0, pos: { x: 6, y: 4, z: -9 } },
          { type: "hound", alive: !0, pos: { x: -8, y: 0, z: -14 } },
          { type: "gull", alive: !0, pos: { x: 0, y: 5, z: -30 } },
        ],
        rt = { min: { x: -99, y: -9, z: -99 }, max: { x: 99, y: 99, z: 99 } },
        Be = {
          events: Ie,
          params: {},
          camera: { matrixWorld: { elements: Ce } },
          enemies: { list: [] },
          level: {
            interiorBoxes: ie.interior ? [rt] : [{ min: { x: 500, y: 0, z: 500 }, max: { x: 501, y: 1, z: 501 } }],
            objectives: [{ id: "A", pos: { x: 4, y: 0, z: 3 } }],
          },
        },
        _t = uE(Be, Ee, { bufs: r }),
        wt = 0.02,
        z0 = 0,
        Pi = (Ht) => {
          let rn = Ht * wt;
          if (
            (Ht === 0 && (Ie.emit("game:state", { state: "playing" }), ie.bare && (_t.setIntensity(1), _t.music.snap())),
            rn < 3 && Ht % 23 === 0 && Ie.emit("player:step", { surface: "concrete", sprint: !1 }),
            Ht === 150)
          ) {
            for (let Hi of Ye) (Be.enemies.list.push(Hi), Ie.emit("enemy:spawn", { enemy: Hi }));
            (Ie.emit("enemy:alert", { enemy: Ye[0] }), _t.setIntensity(1));
          }
          (Ht >= 150 &&
            Ht < 198 &&
            Ht % 4 === 2 &&
            (Ie.emit("weapon:fire", { weapon: "rifle" }),
            ie.bare ||
              (Ie.emit("impact", { point: { x: 4, y: 1, z: -12 }, surface: Ht % 8 ? "metal" : "concrete", from: "player" }),
              Ie.emit("shell:bounce", { pos: { x: 0.6, y: 0, z: 0.2 }, surface: Ht % 3 ? "concrete" : "metal" }))),
            Ht >= 225 && Ht < 275 && Ht % 10 === 5 && Ie.emit("weapon:fire", { weapon: "pistol" }),
            Ht === 276 && Ie.emit("weapon:dry", { weapon: "pistol" }));
          {
            let Hi = ["start", "magout", "maginsert", "magin", "boltback", "bolt", "done"],
              Oi = (Ht - 280) / 4;
            Oi >= 0 && Oi < Hi.length && Oi === Math.floor(Oi) && Ie.emit("weapon:reload", { phase: Hi[Oi], weapon: "rifle", empty: !0 });
          }
          (Ht === 312 && Ie.emit("weapon:switch", { from: "rifle", to: "pistol", phase: "holster" }),
            Ht === 322 && Ie.emit("weapon:switch", { from: "rifle", to: "pistol", phase: "draw" }),
            rn >= 4 &&
              rn < 6.6 &&
              !ie.bare &&
              (Ht % 13 === 0 && Ie.emit("enemy:fire", { enemy: Ye[0], pos: Ye[0].pos, type: "gull" }),
              Ht % 17 === 0 && Ie.emit("enemy:fire", { enemy: Ye[1], pos: Ye[1].pos, type: "hound" }),
              Ht % 25 === 0 && Ie.emit("enemy:step", { pos: Ye[1].pos, type: "hound" })),
            Ht === 330 && Ie.emit("explosion", { pos: { x: 3, y: 0, z: -7 }, size: 2 }),
            Ht === 345 && Ie.emit("explosion", { pos: { x: -6, y: 3, z: -9 }, size: 0.9 }),
            Ht === 350 && Ie.emit("player:hit", { amount: 20 }),
            Ht === 360 && ((Ye[0].alive = !1), Ie.emit("enemy:killed", { enemy: Ye[0], pos: Ye[0].pos, type: "gull" })),
            Ht === 400 && (Ie.emit("objective:done", { id: "A", index: 0, total: 3 }), _t.setIntensity(0.15)));
        };
      for (let Ht = 1; Ht * wt < pe - 0.01; Ht++)
        Ee.suspend(Ht * wt).then(() => {
          (Pi(Ht), _t.update(wt), z0++, Ee.resume());
        });
      (Pi(0), _t.update(wt));
      let Lt = performance.now(),
        o0 = await Ee.startRendering(),
        g0 = performance.now() - Lt,
        M0 = {
          interior: !!ie.interior,
          renderMs: Math.round(g0),
          steps: z0,
          peak: 0,
          over: 0,
          nan: 0,
          rmsDb: [],
          shotPeakDb: [],
          shotRmsDb: [],
          bodyRmsDb: [],
          troughDb: [],
          bedRmsDb: 0,
          inst: _t.debug(),
        },
        on = o0.getChannelData(0),
        Tn = o0.getChannelData(1),
        ri = Math.round(ae / 2);
      for (let Ht = 0; Ht * ri < on.length; Ht++) {
        let rn = 0;
        for (let Hi = Ht * ri; Hi < (Ht + 1) * ri && Hi < on.length; Hi++) {
          let Oi = on[Hi],
            uc = Tn[Hi];
          (!(Math.abs(Oi) < 1e9) || !(Math.abs(uc) < 1e9)) && M0.nan++;
          let Wu = Math.max(Math.abs(Oi), Math.abs(uc));
          (Wu > M0.peak && (M0.peak = Wu), Wu >= 0.999 && M0.over++, (rn += Oi * Oi + uc * uc));
        }
        M0.rmsDb.push(+(10 * Math.log10(rn / (2 * ri) + 1e-12)).toFixed(1));
      }
      for (let Ht = 0; Ht < 12; Ht++) {
        let rn = Math.round((3.004 + Ht * 0.08) * ae),
          Hi = rn + Math.round(0.076 * ae),
          Oi = 0,
          uc = 0;
        for (let Br = rn; Br < Hi && Br < on.length; Br++) {
          let Xh = Math.max(Math.abs(on[Br]), Math.abs(Tn[Br]));
          (Xh > Oi && (Oi = Xh), (uc += on[Br] * on[Br]));
        }
        (M0.shotPeakDb.push(+(20 * Math.log10(Oi + 1e-9)).toFixed(1)),
          M0.shotRmsDb.push(+(10 * Math.log10(uc / (Hi - rn) + 1e-12)).toFixed(1)));
        let Wu = (Br, Xh) => {
          let cb = 0;
          for (let Yh = Br; Yh < Xh && Yh < on.length; Yh++) cb += on[Yh] * on[Yh];
          return +(10 * Math.log10(cb / (Xh - Br) + 1e-12)).toFixed(1);
        };
        (M0.bodyRmsDb.push(Wu(rn, rn + Math.round(0.05 * ae))),
          M0.troughDb.push(Wu(rn + Math.round(0.051 * ae), rn + Math.round(0.076 * ae))));
      }
      {
        let Ht = 0,
          rn = Math.round(2 * ae),
          Hi = Math.round(2.95 * ae);
        for (let Oi = rn; Oi < Hi; Oi++) Ht += on[Oi] * on[Oi];
        M0.bedRmsDb = +(10 * Math.log10(Ht / (Hi - rn) + 1e-12)).toFixed(1);
      }
      return ((M0.peak = +M0.peak.toFixed(3)), M0);
    }
    return (
      Object.assign(_e, {
        ctx: e,
        resume: ve,
        play: ke,
        loop: Ke,
        update: we,
        ready: v,
        selfTest: Ae,
        music: Bt,
        setIntensity(ie) {
          fe = ti(+ie || 0, 0, 1);
        },
        setInterior(ie) {
          $ = ti(+ie || 0, 0, 1);
        },
        setVolume(ie) {
          ((ue = ti(+ie, 0, 1)), Number.isFinite(ue) || (ue = 0.9), (w.gain.value = ue));
        },
        setPaused(ie) {
          q = !!ie;
        },
        names: Object.keys(Ir).filter((ie) => !Ir[ie].ir),
        get intensity() {
          return ge;
        },
        get interior() {
          return se;
        },
        debug() {
          let ie = 0,
            ae = e.currentTime;
          for (let pe in le) for (let Ee of le[pe]) Ee.end > ae && ie++;
          return {
            state: e.state,
            sampleRate: e.sampleRate,
            buffers: c,
            queued: d.length,
            genMs: Math.round(l),
            bootMs: Math.round(u),
            voices: ie,
            loops: Ze.size,
            tracked: Sn.size,
            music: Bt.on,
            score: Bt.debug(),
            intensity: +ge.toFixed(2),
            interior: +se.toFixed(2),
            gameState: de,
            reverb: [!!H.buffer, !!N.buffer],
          };
        },
      }),
      _e
    );
  }
  export var fE = {
      KeyW: "forward",
      KeyS: "back",
      KeyA: "left",
      KeyD: "right",
      Space: "jump",
      ShiftLeft: "sprint",
      ShiftRight: "sprint",
      KeyC: "crouch",
      ControlLeft: "crouch",
      ControlRight: "crouch",
      KeyR: "reload",
      KeyE: "interact",
      KeyF: "melee",
      KeyV: "melee",
      Escape: "pause",
      KeyP: "pause",
      KeyQ: "swap",
      Digit1: "weapon1",
      Digit2: "weapon2",
      Numpad1: "weapon1",
      Numpad2: "weapon2",
      Enter: "fire",
      NumpadEnter: "fire",
      ArrowLeft: "turnL",
      ArrowRight: "turnR",
      ArrowUp: "turnU",
      ArrowDown: "turnD",
      KeyJ: "turnL",
      KeyL: "turnR",
      KeyI: "turnU",
      KeyK: "turnD",
    },
    hE = 0.0021,
    dE = 0.0052,
    pE = 2.1,
    Az = 2.9,
    Rz = 1.75,
    Cz = 0.45,
    x1 = 58,
    mE = { pause: 1 };
__late_level.x1(x1);
  export function gE(n) {
    let e = (n.renderer && n.renderer.domElement) || document.getElementById("view"),
      t = document.getElementById("ui"),
      i = new Set(),
      s = new Set(),
      o = { key: new Set(), mouse: new Set(), touch: new Set(), pad: new Set() },
      r = !1,
      a = !1,
      l = 0,
      c = 0,
      u = 0,
      f = [],
      h = new Set(),
      p = !1;
    function d(ne) {
      if (m.device !== ne) {
        m.device = ne;
        try {
          document.documentElement.dataset.device = ne;
        } catch {}
        n.events.emit("input:device", { device: ne });
      }
    }
    let m = {
      move: { x: 0, y: 0 },
      look: { dx: 0, dy: 0 },
      fire: !1,
      ads: !1,
      sprint: !1,
      crouch: !1,
      locked: !1,
      touch: !1,
      gamepad: !1,
      sensitivity: 1,
      invertY: !1,
      mode: "lock",
      device: "kbm",
      assist: 1,
      padName: "",
      uiPressed(ne) {
        return h.has(ne);
      },
      rumble: Y,
      down(ne) {
        return i.has(ne) && (r || mE[ne] === 1);
      },
      pressed(ne) {
        return s.has(ne) && (r || mE[ne] === 1);
      },
      update: he,
      endFrame: V,
      requestLock: w,
      exitLock: S,
      setGameplay(ne) {
        ((ne = !!ne), ne !== r && ((r = ne), ne || y(), R && R.root.classList.toggle("on", ne && m.touch)));
      },
      setPrompt(ne) {
        ((p = !!ne), R && R.btn.interact.classList.toggle("on", !!ne));
      },
      onModeChange(ne) {
        f.push(ne);
      },
      describeMode() {
        return m.mode === "touch"
          ? "Touch controls active"
          : m.device === "pad"
            ? "Controller active"
            : m.mode === "drag"
              ? "Mouse capture unavailable \u2014 move the mouse to look, rest it at a screen edge to keep turning \xB7 click fires \xB7 arrows or IJKL also turn"
              : m.locked
                ? "Mouse captured \u2014 Esc releases it"
                : "Click once to capture the mouse";
      },
    };
    function x(ne) {
      if (m.mode !== ne) {
        m.mode = ne;
        for (let ye of f)
          try {
            ye(ne);
          } catch (Te) {
            console.error(Te);
          }
      }
    }
    function v(ne, ye, Te) {
      if (!ye) return;
      let Re = o[ne];
      if (Te) {
        if (Re.has(ye)) return;
        (Re.add(ye), i.has(ye) || (i.add(ye), s.add(ye)));
      } else {
        if (!Re.delete(ye)) return;
        !o.key.has(ye) && !o.mouse.has(ye) && !o.touch.has(ye) && !o.pad.has(ye) && i.delete(ye);
      }
    }
    function y() {
      for (let ne in o) o[ne].clear();
      (i.clear(), (u = 0), (W = !1), R && (R.btn.ads.classList.remove("active"), oe(), (A = -1), (N = -1)));
    }
    (addEventListener("keydown", (ne) => {
      let ye = fE[ne.code];
      if (!ye) return;
      let Te = ne.target;
      (Te && (Te.tagName === "INPUT" || Te.tagName === "SELECT" || Te.tagName === "TEXTAREA")) ||
        (Te && Te.tagName === "BUTTON" && (ne.code === "Space" || ne.code === "Enter" || ne.code === "NumpadEnter")) ||
        (r && (ne.code === "Space" || ne.code.startsWith("Arrow") || ne.code === "ControlLeft") && ne.preventDefault(),
        !ne.repeat && (d("kbm"), v("key", ye, !0)));
    }),
      addEventListener("keyup", (ne) => {
        v("key", fE[ne.code], !1);
      }),
      addEventListener("blur", () => {
        y();
      }));
    let b = (ne) => (ne === 0 ? "fire" : ne === 2 ? "ads" : ne === 1 ? "melee" : null);
    (e.addEventListener("mousedown", (ne) => {
      (m.touch && performance.now() - z < 800) ||
        (r && (d("kbm"), !m.locked && m.mode === "lock" && w(), (u |= 1 << ne.button), v("mouse", b(ne.button), !0), ne.preventDefault()));
    }),
      addEventListener("mouseup", (ne) => {
        ((u &= ~(1 << ne.button)), v("mouse", b(ne.button), !1));
      }));
    let g = 0;
    (e.addEventListener(
      "wheel",
      (ne) => {
        if (!r) return;
        ne.preventDefault();
        let ye = performance.now();
        ye - g < 280 || Math.abs(ne.deltaY) < 1 || ((g = ye), s.add("swap"));
      },
      { passive: !1 },
    ),
      addEventListener("contextmenu", (ne) => {
        (ne.target === e || r) && ne.preventDefault();
      }),
      addEventListener("mousemove", (ne) => {
        if (
          r &&
          (m.locked || ((E = ne.clientX / Math.max(1, innerWidth)), (M = ne.clientY / Math.max(1, innerHeight)), (_ = !0)),
          !m.touch || m.locked)
        ) {
          let ye = ne.movementX || 0,
            Te = ne.movementY || 0;
          if (Math.abs(ye) > 400 || Math.abs(Te) > 400) return;
          ((ye || Te) && d("kbm"), (m.look.dx += ye * hE * m.sensitivity), (m.look.dy += Te * hE * m.sensitivity * (m.invertY ? -1 : 1)));
        }
      }),
      document.addEventListener("pointerlockchange", () => {
        if (((m.locked = document.pointerLockElement === e), m.locked)) ((a = !0), (l = 0), (c = 0), m.touch || x("lock"));
        else {
          (o.mouse.clear(), i.delete("fire"), i.delete("ads"));
          for (let ne of o.key) i.add(ne);
          u = 0;
        }
        n.events.emit("input:lock", { locked: m.locked });
      }),
      document.addEventListener("pointerlockerror", () => T()));
    let E = 0.5,
      M = 0.5,
      _ = !1;
    document.addEventListener("mouseleave", () => {
      _ = !1;
    });
    function T() {
      ((l = 0), !(m.locked || m.touch) && (c++, a || x("drag")));
    }
    function w() {
      if (!(m.touch || m.locked)) {
        if (!e.requestPointerLock) {
          T();
          return;
        }
        try {
          l = performance.now();
          let ne = e.requestPointerLock();
          ne && ne.catch && ne.catch(() => T());
        } catch {
          T();
        }
        try {
          e.focus({ preventScroll: !0 });
        } catch {}
      }
    }
    function S() {
      try {
        document.pointerLockElement && document.exitPointerLock();
      } catch {}
    }
    let R = null,
      z = 0,
      I = -1,
      L = 0,
      U = 0,
      k = 0,
      C = 0,
      A = -1,
      F = 0,
      H = 0,
      N = -1,
      Z = 0,
      Q = 0,
      W = !1;
    function J() {
      let ne = document.createElement("div");
      ((ne.className = "touch"),
        (ne.innerHTML =
          '<div class="t-stick"><i class="t-ring"></i><i class="t-nub"></i></div><button class="t-btn t-fire" data-a="fire" aria-label="Fire"><span>FIRE</span></button><button class="t-btn t-ads" data-a="ads" aria-label="Aim"><span>AIM</span></button><button class="t-btn t-reload" data-a="reload" aria-label="Reload"><span>RLD</span></button><button class="t-btn t-swap" data-a="swap" aria-label="Swap weapon"><span>SWAP</span></button><button class="t-btn t-jump" data-a="jump" aria-label="Jump"><span>JUMP</span></button><button class="t-btn t-interact" data-a="interact" aria-label="Interact"><span>USE</span></button><button class="t-btn t-pause" data-a="pause" aria-label="Pause"><span>II</span></button>'),
        t.appendChild(ne));
      let ye = (Re) => ne.querySelector(Re),
        Te = {
          root: ne,
          stick: ye(".t-stick"),
          nub: ye(".t-nub"),
          btn: {
            fire: ye(".t-fire"),
            ads: ye(".t-ads"),
            reload: ye(".t-reload"),
            swap: ye(".t-swap"),
            jump: ye(".t-jump"),
            interact: ye(".t-interact"),
            pause: ye(".t-pause"),
          },
        };
      for (let Re in Te.btn) {
        let Ue = Te.btn[Re];
        Ue.addEventListener(
          "touchstart",
          (ze) => {
            (ze.preventDefault(), ze.stopPropagation(), (z = performance.now()));
            let Ge = ze.changedTouches[0];
            if (Re === "ads") {
              ((W = !W), Ue.classList.toggle("active", W));
              return;
            }
            (Re === "fire" && ((N = Ge.identifier), (Z = Ge.clientX), (Q = Ge.clientY)), Ue.classList.add("active"), v("touch", Re, !0));
          },
          { passive: !1 },
        );
        let Ve = (ze) => {
          if ((ze.preventDefault(), ze.stopPropagation(), Re !== "ads")) {
            if (Re === "fire") {
              let Ge = !1;
              for (let _e of ze.changedTouches) _e.identifier === N && (Ge = !0);
              if (!Ge) return;
              N = -1;
            }
            (Ue.classList.remove("active"), v("touch", Re, !1));
          }
        };
        (Ue.addEventListener("touchend", Ve, { passive: !1 }),
          Ue.addEventListener("touchcancel", Ve, { passive: !1 }),
          Ue.addEventListener(
            "touchmove",
            (ze) => {
              if ((ze.preventDefault(), Re === "fire"))
                for (let Ge of ze.changedTouches)
                  Ge.identifier === N && (G(Ge.clientX - Z, Ge.clientY - Q), (Z = Ge.clientX), (Q = Ge.clientY));
            },
            { passive: !1 },
          ),
          Ue.addEventListener("contextmenu", (ze) => ze.preventDefault()));
      }
      return Te;
    }
    function G(ne, ye) {
      ((m.look.dx += ne * dE * m.sensitivity), (m.look.dy += ye * dE * m.sensitivity * (m.invertY ? -1 : 1)));
    }
    function te() {
      m.touch ||
        ((m.touch = !0),
        S(),
        R || (R = J()),
        R.root.classList.toggle("on", r),
        document.documentElement.classList.add("is-touch"),
        x("touch"),
        d("touch"));
    }
    function oe() {
      ((I = -1), (k = C = 0), R && R.stick.classList.remove("on"));
    }
    (addEventListener(
      "touchstart",
      () => {
        ((z = performance.now()), te());
      },
      { passive: !0, capture: !0 },
    ),
      e.addEventListener(
        "touchstart",
        (ne) => {
          if ((ne.preventDefault(), !!r))
            for (let ye of ne.changedTouches)
              ye.clientX < innerWidth * 0.45 && I < 0
                ? ((I = ye.identifier),
                  (L = ye.clientX),
                  (U = ye.clientY),
                  (k = C = 0),
                  R &&
                    ((R.stick.style.transform = `translate3d(${L}px,${U}px,0)`),
                    (R.nub.style.transform = "translate3d(0,0,0)"),
                    R.stick.classList.add("on")))
                : A < 0 && ((A = ye.identifier), (F = ye.clientX), (H = ye.clientY));
        },
        { passive: !1 },
      ),
      e.addEventListener(
        "touchmove",
        (ne) => {
          if ((ne.preventDefault(), !!r))
            for (let ye of ne.changedTouches)
              if (ye.identifier === I) {
                let Te = ye.clientX - L,
                  Re = ye.clientY - U,
                  Ue = Math.hypot(Te, Re);
                (Ue > x1 && ((Te *= x1 / Ue), (Re *= x1 / Ue)),
                  (k = Te / x1),
                  (C = -Re / x1),
                  R && (R.nub.style.transform = `translate3d(${Te.toFixed(1)}px,${Re.toFixed(1)}px,0)`));
              } else ye.identifier === A && (G(ye.clientX - F, ye.clientY - H), (F = ye.clientX), (H = ye.clientY));
        },
        { passive: !1 },
      ));
    let ee = (ne) => {
      for (let ye of ne.changedTouches) ye.identifier === I ? oe() : ye.identifier === A && (A = -1);
    };
    (e.addEventListener("touchend", ee, { passive: !1 }), e.addEventListener("touchcancel", ee, { passive: !1 }));
    let le = {
        jump: [0],
        crouch: [1, 4],
        swap: [3, 12, 13],
        melee: [5, 11],
        ads: [6],
        fire: [7],
        pause: [9],
        weapon1: [14],
        weapon2: [15],
      },
      xe = { 0: "accept", 1: "back", 9: "start", 12: "up", 13: "down", 14: "left", 15: "right" },
      j = typeof navigator < "u" && !!navigator.getGamepads,
      O = 0,
      q = 0,
      ue = null,
      de = 0,
      $ = !1,
      se = "",
      fe = new Uint8Array(20),
      me = 0,
      ge = 0,
      ce = 0,
      P = (ne, ye = 0.14) => {
        let Te = Math.abs(ne);
        return Te < ye ? 0 : (Math.sign(ne) * (Te - ye)) / (1 - ye);
      },
      D = (ne) => !!ne && (ne.pressed || ne.value > 0.35);
    (addEventListener("gamepadconnected", (ne) => {
      ((j = !0), (m.padName = (ne.gamepad && ne.gamepad.id) || "gamepad"), n.events.emit("input:pad", { connected: !0, name: m.padName }));
    }),
      addEventListener("gamepaddisconnected", () => {
        n.events.emit("input:pad", { connected: !1 });
      }));
    function B() {
      let ne;
      try {
        ne = navigator.getGamepads();
      } catch {
        return ((j = !1), null);
      }
      let ye = null;
      for (let Te = 0; ne && Te < ne.length; Te++) {
        let Re = ne[Te];
        if (!(!Re || !Re.connected || Re.buttons.length < 10 || Re.axes.length < 4)) {
          if (Re.mapping === "standard") return Re;
          ye || (ye = Re);
        }
      }
      return ye;
    }
    function X() {
      ((m.gamepad = !1), (ue = null), ($ = !1), (se = ""), fe.fill(0));
      for (let ne of [...o.pad]) v("pad", ne, !1);
      m.device === "pad" && d("kbm");
    }
    function re(ne) {
      if (((O = q = 0), h.clear(), !j)) return;
      let ye = B();
      if (!ye) {
        m.gamepad && X();
        return;
      }
      ((ue = ye), (m.gamepad = !0));
      let Te = P(ye.axes[0] || 0),
        Re = P(ye.axes[1] || 0),
        Ue = P(ye.axes[2] || 0),
        Ve = P(ye.axes[3] || 0),
        ze = !!(Te || Re || Ue || Ve);
      if (((O = Te), (q = -Re), r)) {
        let _e = Math.min(1, Math.hypot(Ue, Ve));
        de = _e > 0.92 ? Math.min(1, de + ne / Cz) : Math.max(0, de - ne * 6);
        let Ne = _e > 0 ? (0.25 * _e + 0.75 * _e * _e * _e) / _e : 0,
          ke = Az * (1 + (Rz - 1) * de) * Ne * m.assist * m.sensitivity * ne;
        ((m.look.dx += Ue * ke), (m.look.dy += Ve * ke * 0.62 * (m.invertY ? -1 : 1)), D(ye.buttons[10]) && ($ = !0), q < 0.55 && ($ = !1));
      } else $ = !1;
      for (let _e = 0; _e < ye.buttons.length && _e < 20; _e++) {
        let Ne = D(ye.buttons[_e]) ? 1 : 0;
        (Ne && !fe[_e] && ((ze = !0), !r && xe[_e] && h.add(xe[_e])), (fe[_e] = Ne));
      }
      let Ge = D(ye.buttons[2]);
      (Ge && !se && (se = p ? "interact" : "reload"),
        v("pad", "interact", Ge && se === "interact"),
        v("pad", "reload", Ge && se === "reload"),
        Ge || (se = ""));
      for (let _e in le) {
        let Ne = le[_e],
          ke = !1;
        for (let je = 0; je < Ne.length; je++) D(ye.buttons[Ne[je]]) && (ke = !0);
        v("pad", _e, ke);
      }
      if ((v("pad", "sprint", $), !r)) {
        let _e = Math.abs(Re) > 0.6 ? Math.sign(Re) : 0,
          Ne = performance.now();
        _e !== me
          ? ((me = _e), (ge = Ne + 380), _e && h.add(_e < 0 ? "up" : "down"))
          : _e && Ne > ge && ((ge = Ne + 170), h.add(_e < 0 ? "up" : "down"));
        let ke = Math.abs(Te) > 0.6 ? Math.sign(Te) : 0;
        ke !== ce && ((ce = ke), ke && h.add(ke < 0 ? "left" : "right"));
      }
      ze && d("pad");
    }
    function Y(ne = 0.5, ye = 0.5, Te = 80) {
      if (!(m.device !== "pad" || !ue))
        try {
          let Re = ue.vibrationActuator;
          if (Re && Re.playEffect) {
            let Ue = Re.playEffect("dual-rumble", {
              startDelay: 0,
              duration: Te,
              strongMagnitude: Math.min(1, ne),
              weakMagnitude: Math.min(1, ye),
            });
            Ue && Ue.catch && Ue.catch(() => {});
          }
        } catch {}
    }
    function he(ne) {
      if (
        (re(ne),
        l && performance.now() - l > 1200 && !m.locked && T(),
        r && _ && !m.locked && !m.touch && m.device === "kbm" && (m.mode === "drag" || l === 0))
      ) {
        let Ue = E < 0.12 ? -(0.12 - E) / 0.12 : E > 0.88 ? (E - 0.88) / 0.12 : 0,
          Ve = M < 0.1 ? -(0.1 - M) / 0.1 : M > 0.9 ? (M - 0.9) / 0.1 : 0;
        ((m.look.dx += Ue * 2.4 * ne * m.sensitivity), (m.look.dy += Ve * 1.2 * ne * m.sensitivity * (m.invertY ? -1 : 1)));
      }
      let ye = 0,
        Te = 0,
        Re = !1;
      if (r) {
        ((ye = (i.has("right") ? 1 : 0) - (i.has("left") ? 1 : 0)),
          (Te = (i.has("forward") ? 1 : 0) - (i.has("back") ? 1 : 0)),
          (Re = i.has("sprint")),
          I >= 0 && ((ye += k), (Te += C), Math.hypot(k, C) > 0.93 && C > 0.8 && (Re = !0)),
          (ye += O),
          (Te += q));
        let Ue = Math.hypot(ye, Te);
        Ue > 1 && ((ye /= Ue), (Te /= Ue));
        let Ve = (i.has("turnR") ? 1 : 0) - (i.has("turnL") ? 1 : 0),
          ze = (i.has("turnD") ? 1 : 0) - (i.has("turnU") ? 1 : 0);
        (Ve && (m.look.dx += Ve * pE * ne), ze && (m.look.dy += ze * pE * 0.6 * ne));
      }
      ((m.move.x = ye),
        (m.move.y = Te),
        (m.fire = r && i.has("fire")),
        (m.ads = r && (i.has("ads") || W)),
        (m.sprint = r && Re),
        (m.crouch = r && i.has("crouch")));
    }
    function V() {
      (s.clear(), (m.look.dx = 0), (m.look.dy = 0));
    }
    return m;
  }
  export var Nt = {
      walk: 3.8,
      sprint: 6.4,
      crouch: 1.9,
      ads: 2.4,
      accelGround: 34,
      decelGround: 26,
      accelAir: 9,
      gravity: 21,
      jumpApex: 1,
      coyote: 0.12,
      jumpBuffer: 0.13,
      standHeight: zi.height,
      crouchHeight: 1.15,
      eyeRate: 11,
      stride: { walk: 1.55, sprint: 2.1, crouch: 1.05 },
      bobY: 0.024,
      bobX: 0.013,
      bobSprint: 1.9,
      bobAds: 0.22,
      rollStrafe: 0.02,
      landDip: 0.36,
      landDipMax: 0.2,
      fovSprint: 6,
      fovAds: 52,
      adsLook: 0.6,
      regenDelay: 4,
      regenRate: 25,
      recoilKeep: 0.35,
      recoilApply: 34,
      recoilRecover: 6.5,
      recoilHold: 0.09,
      shakeDecay: 1.7,
      shakePitch: 0.03,
      shakeYaw: 0.03,
      shakeRoll: 0.045,
      pitchLimit: 1.5,
    },
    Pz = Math.sqrt(2 * Nt.gravity * Nt.jumpApex);
  export function xE(n) {
    let e = n.camera,
      t = () => (n.render && n.render.post) || i,
      i = {},
      s = zi.eye,
      o = Nt.standHeight,
      r = 0,
      a = 0,
      l = !0,
      c = 0,
      u = 0,
      f = 0,
      h = 0,
      p = 0,
      d = 0,
      m = 0,
      x = { x: 0, v: 0 },
      v = 0,
      y = 0,
      b = 0,
      g = 0,
      E = 0,
      M = 0,
      _ = 0,
      T = 99,
      w = 0,
      S = 0,
      R = 0,
      z = zi.fov,
      I = 0,
      L = "concrete",
      U = new K(),
      k = new _0(0, 0, 0, "YXZ"),
      C = new K(),
      A = {
        pos: new K(),
        eye: new K(),
        vel: new K(),
        forward: new K(0, 0, -1),
        yaw: 0,
        pitch: 0,
        health: 100,
        maxHealth: 100,
        alive: !0,
        onGround: !0,
        sprinting: !1,
        crouching: !1,
        ads: 0,
        speed: 0,
        enabled: !0,
        invulnerable: !1,
        baseFov: zi.fov,
        hurtPulse: 0,
        lookScale: 1,
        lastSafe: C,
        tuning: Nt,
        reset(J) {
          let G = J || (n.level && n.level.playerStart) || { pos: new K(), yaw: 0 };
          (A.pos.copy(G.pos),
            (A.yaw = G.yaw || 0),
            (A.pitch = 0),
            A.vel.set(0, 0, 0),
            (A.health = A.maxHealth),
            (A.alive = !0),
            (A.onGround = !0),
            (A.sprinting = !1),
            (A.crouching = !1),
            (A.invulnerable = !1),
            (A.speed = 0),
            (s = zi.eye),
            (o = Nt.standHeight),
            (r = 0),
            (a = 0),
            (l = !0),
            (c = 0),
            (u = 0),
            (f = 0),
            (h = 0),
            (p = d = 0),
            (m = 0),
            (x.x = x.v = 0),
            (v = y = b = g = 0),
            (E = 0),
            (M = 0),
            (T = 99),
            (w = 0),
            (S = 0),
            (R = 0),
            (A.hurtPulse = 0),
            C.copy(A.pos));
          let te = t();
          ((te.damage = 0), (te.lowHealth = 0), (te.ads = 0), Q(0));
        },
        damage(J, G) {
          !A.alive ||
            A.invulnerable ||
            !(J > 0) ||
            ((A.health = Math.max(0, A.health - J)),
            (T = 0),
            (w = Math.min(1, w + 0.35 + J / 40)),
            A.addShake(0.22 + J / 70),
            n.events.emit("player:hit", { amount: J, fromPos: G }),
            A.health <= 0 && ((A.alive = !1), (R = 0), (A.sprinting = !1), n.events.emit("player:dead", {})));
        },
        heal(J) {
          A.alive && (A.health = Math.min(A.maxHealth, A.health + J));
        },
        addRecoil(J = 0, G = 0) {
          let te = Nt.recoilKeep;
          ((A.pitch = Hn(A.pitch + J * te, -Nt.pitchLimit, Nt.pitchLimit)),
            (A.yaw += G * te),
            (v += J * (1 - te)),
            (y += G * (1 - te)),
            (v = Hn(v, -0.3, 0.3)),
            (y = Hn(y, -0.2, 0.2)),
            (E = Nt.recoilHold));
        },
        addShake(J = 0.3) {
          M = Math.min(1, M + J);
        },
        setFov(J) {
          A.baseFov = Hn(+J || zi.fov, 55, 100);
        },
        update: N,
      };
    n.events.on("explosion", (J) => {
      if (!J || !J.pos) return;
      let G = A.eye.distanceTo(J.pos),
        te = J.size || 1,
        oe = Is(1 - G / (14 + te * 10)) * (0.35 + 0.35 * te);
      oe > 0.01 && A.addShake(oe);
    });
    function F() {
      let J = n.physics && n.physics.boxes;
      if (!J) return !0;
      let G = zi.radius * 0.9,
        te = A.pos.y + Nt.crouchHeight - 0.05,
        oe = A.pos.y + Nt.standHeight;
      for (let ee = 0; ee < J.length; ee++) {
        let le = J[ee];
        if (
          !le.bulletOnly &&
          !(A.pos.x + G < le.min.x || A.pos.x - G > le.max.x || A.pos.z + G < le.min.z || A.pos.z - G > le.max.z) &&
          le.min.y < oe &&
          le.max.y > te
        )
          return !1;
      }
      return !0;
    }
    function H() {
      let J = A.pos.x,
        G = A.pos.z;
      try {
        if (n.ground && n.ground.isPuddle && A.pos.y < 0.05 && n.ground.isPuddle(J, G)) return "water";
      } catch {}
      if (L && L !== "concrete") return L;
      try {
        return (n.level && n.level.groundSurfaceAt && n.level.groundSurfaceAt(J, G)) || L || "concrete";
      } catch {
        return L || "concrete";
      }
    }
    function N(J) {
      let G = n.input,
        te = n.weapon || {};
      if (
        (te.stub || typeof te.ads != "number" ? ((I = j0(I, A.enabled && G.ads ? 1 : 0, 14, J)), (A.ads = I)) : (A.ads = Is(te.ads)),
        !A.alive)
      ) {
        ((R += J), Z(J), Q(J), W(J));
        return;
      }
      let oe = A.enabled;
      ((A.lookScale = u0(1, Nt.adsLook, A.ads)),
        oe &&
          ((A.yaw -= G.look.dx * A.lookScale),
          (A.pitch = Hn(A.pitch - G.look.dy * A.lookScale, -Nt.pitchLimit, Nt.pitchLimit)),
          (A.yaw > Math.PI * 4 || A.yaw < -Math.PI * 4) && (A.yaw = A.yaw % (Math.PI * 2))),
        oe && G.crouch ? (A.crouching = !0) : A.crouching && F() && (A.crouching = !1),
        (o = A.crouching ? Nt.crouchHeight : Nt.standHeight));
      let le = oe ? G.move.x : 0,
        xe = oe ? G.move.y : 0,
        j = le * le + xe * xe > 0.01,
        O = oe && G.sprint && xe > 0.55 && Math.abs(le) < 0.6 && !A.crouching && A.ads < 0.35 && !G.fire;
      A.sprinting = (O && A.onGround && A.speed > Nt.walk * 0.6) || (O && !A.onGround && A.sprinting);
      let q = Nt.walk;
      (A.crouching ? (q = Nt.crouch) : O && (q = Nt.sprint), (q = u0(q, Math.min(q, Nt.ads), A.ads)), xe < 0 && (q *= u0(1, 0.82, -xe)));
      let ue = Math.sin(A.yaw),
        de = Math.cos(A.yaw);
      U.set(le * de - xe * ue, 0, -le * ue - xe * de).multiplyScalar(q);
      let $ = A.onGround ? (j ? Nt.accelGround : Nt.decelGround) : j ? Nt.accelAir : 0.6,
        se = U.x - A.vel.x,
        fe = U.z - A.vel.z;
      !A.onGround && !j && ((se = -A.vel.x), (fe = -A.vel.z));
      let me = Math.hypot(se, fe),
        ge = $ * J;
      (me <= ge || me < 1e-6
        ? (A.onGround || j) && ((A.vel.x = U.x), (A.vel.z = U.z))
        : ((A.vel.x += (se / me) * ge), (A.vel.z += (fe / me) * ge)),
        (r = A.onGround ? Nt.coyote : Math.max(0, r - J)),
        (a = oe && G.pressed("jump") ? Nt.jumpBuffer : Math.max(0, a - J)),
        a > 0 &&
          r > 0 &&
          (!A.crouching || F()) &&
          ((A.vel.y = Pz),
          (a = 0),
          (r = 0),
          (A.onGround = !1),
          (A.crouching = !1),
          (o = Nt.standHeight),
          n.events.emit("player:jump", { pos: A.pos })),
        (A.vel.y -= Nt.gravity * J * 0.5),
        A.vel.y < -40 && (A.vel.y = -40));
      let ce = A.vel.y,
        P = n.physics.moveCapsule(A.pos, A.vel, J, zi.radius, o, l) || {};
      P.onGround || (A.vel.y -= Nt.gravity * J * 0.5);
      let D = n.physics.bounds;
      if (
        (D && ((A.pos.x = Hn(A.pos.x, D.min.x + 0.4, D.max.x - 0.4)), (A.pos.z = Hn(A.pos.z, D.min.z + 0.4, D.max.z - 0.4))),
        (A.onGround = !!P.onGround),
        P.surface && (L = P.surface),
        A.onGround)
      ) {
        if (!l && c > 0.12) {
          let Y = Math.max(0, -ce, u);
          ((x.v -= Math.min(Y * Nt.landDip, 3.2)),
            Y > 7.5 && A.addShake(Math.min(0.5, (Y - 7.5) * 0.06)),
            n.events.emit("player:land", { speed: Y, surface: H(), pos: A.pos }),
            Y > 13 && A.damage((Y - 13) * 7, null),
            (f = 0.35));
        }
        ((c = 0), (u = 0), A.pos.x <= Kn.quayX - 1.2 && A.pos.y > -0.5 && C.copy(A.pos));
      } else ((c += J), (u = Math.max(u, -A.vel.y)));
      ((l = A.onGround),
        A.pos.y < Kn.seaY - 2.2 &&
          (A.pos.copy(C),
          A.vel.set(0, 0, 0),
          (A.onGround = !0),
          (l = !0),
          (M = 0.6),
          (A.yaw += Math.PI),
          A.damage(12, null),
          n.events.emit("player:rescued", {})),
        (A.speed = Math.hypot(A.vel.x, A.vel.z)));
      let B = A.crouching ? Nt.stride.crouch : A.sprinting ? Nt.stride.sprint : Nt.stride.walk;
      if (A.onGround && A.speed > 0.5) {
        let Y = f;
        ((f += (A.speed * J) / B),
          Math.floor(f) > Math.floor(Y) && n.events.emit("player:step", { surface: H(), sprint: A.sprinting, pos: A.pos }));
      } else A.onGround && (f = j0(f, Math.round(f), 8, J));
      let X = A.onGround ? Is(A.speed / Nt.walk) * (A.sprinting ? Nt.bobSprint : 1) * u0(1, Nt.bobAds, A.ads) * (A.crouching ? 0.7 : 1) : 0;
      ((h = j0(h, X, 9, J)), (d = -Math.cos(f * Math.PI * 2) * Nt.bobY * h), (p = Math.sin(f * Math.PI) * Nt.bobX * h));
      let re = A.vel.x * de - A.vel.z * ue;
      ((m = j0(m, (-re / Nt.sprint) * Nt.rollStrafe * u0(1, 0.4, A.ads), 8, J)),
        (T += J),
        T > Nt.regenDelay && A.health < A.maxHealth && (A.health = Math.min(A.maxHealth, A.health + Nt.regenRate * J)),
        Q(J),
        W(J));
    }
    function Z(J) {
      ((A.vel.x = j0(A.vel.x, 0, 5, J)), (A.vel.z = j0(A.vel.z, 0, 5, J)), (A.vel.y -= Nt.gravity * J));
      try {
        let G = n.physics.moveCapsule(A.pos, A.vel, J, zi.radius, 0.6, l);
        l = !!(G && G.onGround);
      } catch {}
      (A.pos.y < Kn.seaY - 1 && ((A.pos.y = Kn.seaY - 1), (A.vel.y = 0)),
        (A.speed = 0),
        (A.sprinting = !1),
        (h = j0(h, 0, 10, J)),
        (p *= 0.9),
        (d *= 0.9));
    }
    function Q(J) {
      let G = A.crouching ? zi.crouchEye : zi.eye,
        te = 0,
        oe = 0;
      if (A.alive) J > 0 ? (s = j0(s, G, Nt.eyeRate, J)) : (s = G);
      else {
        let se = ou(0, 0.85, R),
          fe = se * se;
        ((G = u0(zi.eye, 0.22, fe)), (s = j0(s, G, 18, J)), (te = 1.15 * fe), (oe = -0.25 * se + 0.12 * Math.sin(se * Math.PI)));
      }
      if (J > 0) {
        let se = -x.x * 150 - x.v * 17;
        ((x.v += se * J),
          (x.x += x.v * J),
          (x.x = Hn(x.x, -Nt.landDipMax, 0.05)),
          (E -= J),
          E <= 0 && ((v = j0(v, 0, Nt.recoilRecover, J)), (y = j0(y, 0, Nt.recoilRecover, J))),
          (b = j0(b, v, Nt.recoilApply, J)),
          (g = j0(g, y, Nt.recoilApply, J)),
          (M = Math.max(0, M - Nt.shakeDecay * J)),
          (_ += J));
      }
      let ee = Math.sin(A.yaw),
        le = Math.cos(A.yaw);
      A.eye.set(A.pos.x + p * le, A.pos.y + s + d + x.x, A.pos.z - p * ee);
      let xe = Hn(A.pitch + b, -1.55, 1.55),
        j = A.yaw + g;
      (k.set(xe, j, 0, "YXZ"), A.forward.set(0, 0, -1).applyEuler(k));
      let O = M * M,
        q = _,
        ue = O * Nt.shakePitch * (Math.sin(q * 43.1) + 0.6 * Math.sin(q * 71.7 + 1.3)),
        de = O * Nt.shakeYaw * (Math.sin(q * 37.3 + 2.1) + 0.6 * Math.sin(q * 83.9)),
        $ = O * Nt.shakeRoll * (Math.sin(q * 29.7 + 0.7) + 0.5 * Math.sin(q * 61.3 + 4));
      if (
        (e.position.copy(A.eye),
        e.rotation.set(xe + ue + oe + x.x * 0.12, j + de, m + $ + te + p * 0.35, "YXZ"),
        !n.params || !n.params.fov)
      ) {
        let se = u0(A.baseFov + (A.sprinting ? Nt.fovSprint : 0), Nt.fovAds, A.ads);
        ((z = J > 0 ? j0(z, se, A.ads > 0.02 && A.ads < 0.98 ? 30 : 7, J) : se),
          Math.abs(e.fov - z) > 0.01 && ((e.fov = z), e.updateProjectionMatrix()));
      }
    }
    function W(J) {
      ((w = Math.max(0, w - J * 1.9)), (A.hurtPulse = w));
      let G = A.alive ? ou(0.55, 0.12, A.health / A.maxHealth) : 1;
      S = j0(S, G, 4, J);
      let te = t();
      ((te.damage = w), (te.lowHealth = S), (te.ads = A.ads));
    }
    return A;
  }
  export function ey(n) {
    let e = { shots: 0, hits: 0, kills: 0 };
    return (
      n.events.on("enemy:killed", () => {
        e.kills++;
      }),
      {
        stats: e,
        reset() {
          e.shots = e.hits = e.kills = 0;
        },
        playerShot(i, s, { damage: o = 28, range: r = 300, impulse: a = 1 } = {}) {
          e.shots++;
          let l = n.physics.raycast(i, s, r),
            c = n.enemies.raycast(i, s, l ? l.dist : r);
          if (c) {
            e.hits++;
            let u = c.part === "weak" ? 2.2 : 1,
              f = c.enemy.damage(o * u, c.point, s, c.part) === !0,
              h = {
                point: c.point,
                normal: c.normal || s.clone().negate(),
                dist: c.dist,
                surface: "enemy",
                enemy: c.enemy,
                part: c.part,
                dir: s,
                from: "player",
                killed: f,
              };
            return (
              n.events.emit("impact", h),
              n.events.emit("player:hitEnemy", { enemy: c.enemy, part: c.part, killed: f, weak: c.part === "weak" }),
              h
            );
          }
          if (l) {
            let u = { point: l.point, normal: l.normal, dist: l.dist, surface: l.surface, enemy: null, dir: s, from: "player", box: l.box };
            return (n.events.emit("impact", u), u);
          }
          return null;
        },
        enemyShot(i, s, { damage: o = 6, range: r = 200 } = {}) {
          let a = n.physics.raycast(i, s, r),
            l = a ? a.dist : r,
            c = n.player;
          if (c && c.alive) {
            let u = a5.copy(c.pos);
            u.y += 1;
            let f = u.sub(i).dot(s);
            if (f > 0 && f < l) {
              v1.copy(i).addScaledVector(s, f);
              let h = Math.abs(v1.y - (c.pos.y + 0.95));
              if (Math.hypot(v1.x - c.pos.x, v1.z - c.pos.z) < 0.38 && h < 0.95) return (c.damage(o, i), !0);
            }
          }
          return (
            a &&
              n.events.emit("impact", {
                point: a.point,
                normal: a.normal,
                dist: a.dist,
                surface: a.surface,
                enemy: null,
                dir: s,
                from: "enemy",
                box: a.box,
              }),
            !1
          );
        },
        explode(i, s = 5, o = 80, r = "player") {
          for (let l of n.enemies.list) {
            if (!l.alive) continue;
            let c = l.pos.distanceTo(i);
            c < s &&
              n.physics.lineOfSight(i, a5.copy(l.pos).setY(l.pos.y + 0.5)) &&
              l.damage(o * (1 - c / s), l.pos, v1.copy(l.pos).sub(i).normalize(), "body");
          }
          let a = n.player;
          if (a && a.alive) {
            let l = a5
              .copy(a.pos)
              .setY(a.pos.y + 1)
              .distanceTo(i);
            l < s && n.physics.lineOfSight(i, a5.copy(a.pos).setY(a.pos.y + 1)) && a.damage(o * 0.5 * (1 - l / s), i);
          }
          r === "explosive" && (e.blasts = (e.blasts || 0) + 1);
        },
      }
    );
  }
  export var a5 = new K(),
    v1 = new K();
  export var vE = {
      barrel: { hp: 50, fuse: 1.6, size: 1.9, radius: 6.5, damage: 170, chain: 5.2 },
      gas_cylinders: { hp: 70, fuse: 1.1, size: 2.3, radius: 7.5, damage: 210, chain: 6 },
    },
    Dz = [
      [-12, 6.5],
      [-5, 1.5],
      [9, 7],
      [13, 13],
      [-14, 13],
      [1, 20],
      [11, 21],
      [-20, 19],
      [19, 9],
      [21, -6],
      [24, 11],
      [-21, -5],
      [0, -14.5],
      [-11, -21],
      [9, -24.5],
    ],
    xh = K;
  export function yE(n) {
    let e = new At();
    ((e.name = "explosives"), n.scene.add(e));
    let t = [],
      i = new Map(),
      s = n.rng && n.rng.fork ? n.rng.fork() : Math.random,
      o = new B0(),
      r = new B0(),
      a = new xh(),
      l = new xh(),
      c = new xh(0, 1, 0);
    function u(v) {
      let y = null;
      try {
        y = n.props.build(v.name, { ...(v.opts || {}), ...(v.name === "barrel" ? { color: "red" } : {}) });
      } catch (M) {
        return (console.warn("[explosives] build failed: " + M), null);
      }
      (y.position.set(v.x, v.y || 0, v.z), (y.rotation.y = v.yaw || 0), e.add(y), y.updateMatrixWorld(!0), o.makeEmpty());
      let b = y.userData.colliders || [];
      for (let M of b) (r.min.fromArray(M.min), r.max.fromArray(M.max), r.applyMatrix4(y.matrixWorld), o.union(r));
      if (o.isEmpty()) {
        let M = y.userData.size || [0.6, 0.9, 0.6];
        (o.min.set(v.x - M[0] / 2, v.y || 0, v.z - M[2] / 2), o.max.set(v.x + M[0] / 2, (v.y || 0) + M[1], v.z + M[2] / 2));
      }
      let g = vE[v.name] || vE.barrel,
        E = {
          def: v,
          obj: y,
          inst: null,
          kind: v.name,
          spec: g,
          min: o.min.clone(),
          max: o.max.clone(),
          pos: o.getCenter(new xh()),
          hp: g.hp,
          fuse: -1,
          alive: !0,
          box: null,
          leak: new xh(),
          leakDir: new xh(0, 1, 0),
          tick: 0,
        };
      return (t.push(E), f(E), E);
    }
    function f(v) {
      v.box || ((v.box = n.physics.addBox(v.min, v.max, { surface: "metal", tag: "explosive" })), i.set(v.box, v));
    }
    for (let v of (n.level && n.level.explosives) || []) u(v);
    try {
      let v = n.physics.nav,
        y = n.level && n.level.playerStart && n.level.playerStart.pos,
        b = (M, _) =>
          v.isWalkable(M, _) &&
          v.isWalkable(M + 0.3, _) &&
          v.isWalkable(M - 0.3, _) &&
          v.isWalkable(M, _ + 0.3) &&
          v.isWalkable(M, _ - 0.3),
        g = (M, _) =>
          M < 28 &&
          M > -37 &&
          Math.abs(_) < 27 &&
          (!v.isWalkable(M + 0.6, _) || !v.isWalkable(M - 0.6, _) || !v.isWalkable(M, _ + 0.6) || !v.isWalkable(M, _ - 0.6)),
        E = 0;
      for (let [M, _] of Dz) {
        let T = null,
          w = 1e9;
        for (let I = -3; I <= 3; I += 0.5)
          for (let L = -3; L <= 3; L += 0.5) {
            let U = M + L,
              k = _ + I,
              C = L * L + I * I;
            if (C >= w || !b(U, k) || !g(U, k) || (y && Math.hypot(U - y.x, k - y.z) < 7)) continue;
            let A = !1;
            for (let F of t)
              if (Math.hypot(F.pos.x - U, F.pos.z - k) < 1.1) {
                A = !0;
                break;
              }
            for (let F of (n.level && n.level.objectives) || []) F.pos && Math.hypot(F.pos.x - U, F.pos.z - k) < 2.2 && (A = !0);
            A || ((T = [U, k]), (w = C));
          }
        if (!T) continue;
        let [S, R] = T;
        v.isWalkable(S + 0.6, R)
          ? v.isWalkable(S - 0.6, R)
            ? v.isWalkable(S, R + 0.6)
              ? (R -= 0.2)
              : (R += 0.2)
            : (S -= 0.2)
          : (S += 0.2);
        let z =
          n.level &&
          n.level.interiorBoxes &&
          n.level.interiorBoxes[0] &&
          S > n.level.interiorBoxes[0].min.x &&
          S < n.level.interiorBoxes[0].max.x &&
          R > n.level.interiorBoxes[0].min.z &&
          R < n.level.interiorBoxes[0].max.z
            ? 0.03
            : 0;
        (u({ name: "barrel", x: S, y: z, z: R, yaw: s() * 6.28, opts: { seed: 100 + (E % 2) } }), E++);
      }
    } catch (v) {
      console.warn("[explosives] extra barrels skipped: " + ((v && v.message) || v));
    }
    let h = new Je().makeScale(0, 0, 0);
    try {
      let v = new Map();
      for (let y of t) {
        if ((y.obj.updateMatrixWorld(!0), y.kind !== "barrel")) {
          let b = ig(y.obj);
          (e.remove(y.obj), e.add(b), (y.obj = b));
          continue;
        }
        ((y.inst = []),
          y.obj.traverse((b) => {
            if (!b.isMesh || Array.isArray(b.material)) return;
            let g = b.geometry.uuid + "|" + b.material.uuid,
              E = v.get(g);
            (E || v.set(g, (E = { geo: b.geometry, mat: b.material, cast: b.castShadow, recv: b.receiveShadow, list: [] })),
              E.list.push({ it: y, m: b.matrixWorld.clone() }));
          }),
          e.remove(y.obj));
      }
      for (let y of v.values()) {
        let b = new Wo(y.geo, y.mat, y.list.length);
        ((b.castShadow = y.cast),
          (b.receiveShadow = y.recv),
          (b.frustumCulled = !1),
          y.list.forEach((g, E) => {
            (b.setMatrixAt(E, g.m), g.it.inst.push({ im: b, i: E, m: g.m }));
          }),
          (b.instanceMatrix.needsUpdate = !0),
          e.add(b));
      }
    } catch (v) {
      console.error("[explosives] instancing failed, barrels stay as plain meshes: " + ((v && v.stack) || v));
      for (let y of t) y.inst && ((y.inst = null), y.obj.parent || e.add(y.obj));
    }
    function p(v, y) {
      if (!v.inst) {
        v.obj.visible = y;
        return;
      }
      for (let b of v.inst) (b.im.setMatrixAt(b.i, y ? b.m : h), (b.im.instanceMatrix.needsUpdate = !0));
    }
    function d(v, y, b, g) {
      if (v.alive) {
        if (((v.hp -= y), v.hp <= 0)) {
          v.fuse = v.fuse < 0 ? 0.06 : Math.min(v.fuse, 0.06);
          return;
        }
        v.fuse < 0 &&
          ((v.fuse = v.spec.fuse),
          b
            ? (v.leak.copy(b), v.leakDir.set(b.x - v.pos.x, 0.35, b.z - v.pos.z).normalize())
            : (v.leak.copy(v.pos), (v.leak.y = v.max.y), v.leakDir.copy(c)),
          n.events.emit("explosive:lit", { pos: v.pos, kind: v.kind }));
      }
    }
    (n.events.on("impact", (v) => {
      let y = v && v.box && i.get(v.box);
      y && d(y, v.from === "player" ? (n.weapon && n.weapon.damage) || 26 : 9, v.point, v.dir);
    }),
      n.events.on("explosion", (v) => {
        if (!v || !v.pos) return;
        let y = 2.2 + (v.size || 1) * 1.6;
        for (let b of t) {
          if (!b.alive) continue;
          let g = b.pos.distanceTo(v.pos);
          if (g > y || g < 0.05) continue;
          let E = 0.14 + s() * 0.3 + g * 0.03;
          b.fuse = b.fuse < 0 ? E : Math.min(b.fuse, E);
        }
      }));
    function m(v) {
      ((v.alive = !1), (v.fuse = -1), p(v, !1), v.box && (n.physics.removeBox(v.box), i.delete(v.box), (v.box = null)));
      let y = v.spec;
      l.copy(v.pos);
      try {
        n.fx.explosion(l, y.size);
      } catch (g) {
        console.error("[explosives] fx.explosion threw", g);
      }
      try {
        n.fx.debris(l, { count: 14, color: v.kind === "barrel" ? 3804938 : 3159098, size: 0.09, speed: 9, spread: 1.4 });
      } catch {}
      try {
        n.combat.explode(l, y.radius, y.damage, "explosive");
      } catch (g) {
        console.error("[explosives] combat.explode threw", g);
      }
      let b = n.player;
      if (b && b.addShake) {
        let g = Math.max(0, 1 - b.pos.distanceTo(l) / 28);
        g > 0 && b.addShake(0.15 + 0.9 * g * g);
      }
      try {
        n.enemies.alert && n.enemies.alert(l, 60);
      } catch {}
      n.events.emit("explosive:blast", { pos: l, kind: v.kind });
    }
    return {
      items: t,
      root: e,
      count() {
        let v = 0;
        for (let y of t) y.alive && v++;
        return v;
      },
      reset() {
        for (let v of t) ((v.alive = !0), (v.hp = v.spec.hp), (v.fuse = -1), p(v, !0), f(v));
      },
      debugBlast(v = 0, y = !0) {
        let b = t.filter((E) => E.alive),
          g = b[v % Math.max(1, b.length)];
        return (g && (y ? m(g) : d(g, 1, null, null)), g ? g.pos.clone() : null);
      },
      update(v) {
        for (let y = 0; y < t.length; y++) {
          let b = t[y];
          if (!(!b.alive || b.fuse < 0)) {
            if (((b.fuse -= v), b.fuse <= 0)) {
              m(b);
              continue;
            }
            if (((b.tick -= v), b.tick <= 0)) {
              b.tick = 0.07;
              try {
                (n.fx.sparks(b.leak, b.leakDir, 3),
                  n.fx.smoke(b.leak, {
                    size: 0.3,
                    life: 0.9,
                    rise: 1.4,
                    count: 1,
                    color: 1381653,
                    vel: a.copy(b.leakDir).multiplyScalar(1.5),
                  }),
                  n.render && n.render.lightPool && n.render.lightPool.flash(b.leak, 16742944, 5, 4, 0.09));
              } catch {}
            }
          }
        }
      },
    };
  }
