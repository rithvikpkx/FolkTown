import { NeutralToneMapping as fx, Vector3 as K, PlaneGeometry as w0, Vector2 as We, LoopOnce as dx } from 'three';
import * as ut from 'three';
import { cv, lv, v_ } from './mats.js';
import { Av, Pg } from './level.js';
import { buildCampus } from '../campus/index.js';
import { buildWalk, walkInput, walkPlayer, walkQuality } from '../campus/walk.js';
import { zv, dt, Iv } from './backdrop.js';
import { Lv, Vg } from './ground.js';
import { Wv, f1 } from './fx.js';
import { Zy, dy } from './weapon.js';
import { zy, I5 } from './hands.js';
import { ib, W5 } from './enemies.js';
import { hv, fv } from './props.js';
import { rv, ov } from './render.js';
import { BM, su, UM, Sr, ns, zi } from './common.js';
import { gE, ey, cE, xE, yE } from './audio.js';
import { sT } from './hud.js';
import { pT } from './loop.js';
import { __late as __late_audio } from './audio.js';

export var mT = { mats: cv, level: Av, backdrop: zv, ground: Lv, fx: Wv, weapon: Zy, hands: zy, enemies: ib, props: hv, render: rv };
  window.__frames = 0;
  window.__ready = !1;
  window.__fatal = null;
  window.__errors = [];
  export var gT = document.getElementById("boot"),
    xT = document.getElementById("boot-msg"),
    vT = document.getElementById("boot-fill");
__late_audio.vT(vT); __late_audio.gT(gT);
  export function yT(n) {
    ((window.__fatal = String(n)), console.error("[fatal] " + n));
    let e = document.getElementById("fatal");
    (e || ((e = document.createElement("div")), (e.id = "fatal"), document.getElementById("app").appendChild(e)),
      (e.textContent = "Saltline could not start: " + n));
  }
  window.addEventListener("error", (n) => {
    window.__errors.push(String(n.message));
  });
  {
    let n = console.error.bind(console);
    console.error = (...e) => {
      try {
        window.__errors.push(
          e
            .map((t) => (t && t.stack) || String(t))
            .join(" ")
            .slice(0, 400),
        );
      } catch {}
      n(...e);
    };
  }
  export var lL = () => new Promise((n) => setTimeout(n, 0));
  export async function fa(n, e) {
    (xT && (xT.textContent = n), vT && (vT.style.width = Math.round(e * 100) + "%"), await lL());
  }
  export async function cL() {
    let n = Object.fromEntries(new URLSearchParams(location.search)),
      __w = (import.meta.env.VITE_WALK && n.walk == null && (n.walk = "1"), n.walk === "0" ? delete n.walk : n.walk && (n.noaudio = "1")),
      e = !!n.bench || location.hash === "#bench";
    e && ((n.noaudio = "1"), (n.autostart = "1"));
    let t = {
      THREE: ut,
      params: n,
      events: BM(),
      rng: su(+(n.seed || 4207)),
      time: { t: 0, dt: 0, frame: 0, real: 0 },
      quality: n.walk ? walkQuality(UM(n.q || "ultra")) : UM(n.q || (n.shot ? "test" : "")),
    };
    window.__G = t;
    let i = n.show && mT[n.show] ? n.show : null;
    t.showcase = i;
    let s = null;
    function o(p) {
      if (p.cam) {
        let d = String(p.cam).split(",").map(Number);
        s = { pos: new K(d[0], d[1], d[2]), look: new K(d[3] ?? 0, d[4] ?? 1, d[5] ?? 0) };
      }
      (p.cam === "" && (s = null),
        p.fov && ((t.camera.fov = +p.fov), t.camera.updateProjectionMatrix()),
        p.exposure && (t.render.exposure = +p.exposure));
    }
    window.__setShot = o;
    async function r(p, d, m, x = !1) {
      let v = performance.now();
      try {
        t[p] = await m();
      } catch (b) {
        if ((console.error(`[boot] module "${p}" failed: ${(b && b.stack) || b}`), x || !Sr[p])) throw b;
        t[p] = Sr[p]();
      }
      let y = performance.now() - v;
      y > 150 && console.log(`[boot] ${p} ${y.toFixed(0)}ms`);
    }
    if (
      (await fa("Waking the renderer", 0.04),
      await r("render", "render", () => ov(t), !0),
      (t.renderer = t.render.renderer),
      (t.scene = t.render.scene),
      (t.camera = t.render.camera),
      (t.viewCamera = t.render.viewCamera),
      await fa("Mixing paint, rust and rain", 0.12),
      await r("mats", "materials", () => lv(t)),
      (t.physics = v_(t)),
      (t.props = fv(t)),
      (t.input = n.walk ? walkInput() : i ? fL() : gE(t)),
      i)
    ) {
      let p = ns(new w0(80, 80).rotateX(-Math.PI / 2), t.mats.get("concrete"), { cast: !1 });
      if (
        (t.scene.add(p),
        (t.level = {
          stub: !0,
          playerStart: { pos: new K(0, 0, 4), yaw: 0 },
          objectives: [],
          enemySpawns: [],
          zones: [],
          interiorBoxes: [],
          cinematicPath: [],
          extraction: { pos: new K(), radius: 2 },
          groundSurfaceAt: () => "concrete",
          update() {},
        }),
        (t.backdrop = Sr.backdrop()),
        (t.ground = Sr.ground()),
        t.physics.build(),
        i === "fx")
      )
        await r("fx", "fx", () => f1(t));
      else
        try {
          t.fx = await f1(t);
        } catch {
          t.fx = Sr.fx();
        }
      ((t.audio = Sr.audio()),
        (t.hud = Sr.hud()),
        (t.player = hL(t)),
        (t.combat = ey(t)),
        (t.weapon = Sr.weapon()),
        (t.enemies = Sr.enemies()),
        (t.game = { state: "showcase", update: () => !1, start() {} }));
      let d = null;
      try {
        d = await mT[i].showcase(t);
      } catch (m) {
        yT(`showcase "${i}" threw: ${(m && m.stack) || m}`);
      }
      ((t.showcaseInfo = d || {}), d && d.cam && o({ cam: [...d.cam, ...(d.target || [0, 1, 0])].join(",") }));
    } else {
      if (
        (await fa("Stacking containers", 0.34),
        await r("level", "level", () => (n.walk ? buildWalk(t) : n.level === "harbour" ? Pg(t) : buildCampus(t)), !0),
        await fa("Raising the cranes", 0.5),
        await r("backdrop", "backdrop", () => (n.level === "harbour" ? Iv(t) : Sr.backdrop())),
        await fa("Flooding the apron", 0.58),
        await r("ground", "ground", () => (n.level === "harbour" ? Vg(t) : Sr.ground())),
        t.ground.stub && n.level === "harbour")
      ) {
        let p = ns(new w0(400, 400).rotateX(-Math.PI / 2), t.mats.get("asphalt"), { cast: !1 });
        t.scene.add(p);
      }
      (t.physics.build(),
        await fa("Loading tracers and smoke", 0.66),
        await r("fx", "fx", () => (n.walk ? Sr.fx() : f1(t))),
        await r("audio", "audio", () => (n.noaudio ? Sr.audio() : cE(t))),
        (t.player = n.walk ? walkPlayer(t) : xE(t)),
        (t.combat = n.walk ? {} : ey(t)));
      try {
        t.explosives = n.walk ? { items: [], reset() {}, update() {} } : yE(t);
      } catch (p) {
        (console.error("[boot] explosives failed: " + ((p && p.stack) || p)), (t.explosives = { items: [], reset() {}, update() {} }));
      }
      (await fa("Checking the rifle", 0.74),
        await r("weapon", "weapon", () => (n.walk ? Sr.weapon() : I5(t))),
        await fa("Waking the Harbormaster", 0.82),
        await r("enemies", "enemies", () => (n.walk ? Sr.enemies() : W5(t))),
        await r("hud", "hud", () => (n.walk ? Sr.hud() : sT(t))),
        (t.game = n.walk ? t.game : pT(t)));
    }
    await fa("Waiting for first light", 0.92);
    try {
      await t.render.onLevelReady();
    } catch (p) {
      console.error("[boot] render.onLevelReady failed: " + ((p && p.stack) || p));
    }
    let a = 0;
    if (
      ((window.__stats = () => ({
        ...(t.render.stats ? t.render.stats() : {}),
        fps: a ? +(1 / a).toFixed(1) : 0,
        state: t.game && t.game.state,
      })),
      n.cam && o(n),
      n.fov && o({ fov: n.fov }),
      !i && (n.shot || n.autostart))
    )
      try {
        t.game.start({ skipIntro: !0 });
      } catch (p) {
        console.error("[boot] game.start failed", p);
      }
    (n.noweapon && t.weapon.setVisible && t.weapon.setVisible(!1),
      e && uL(t),
      await fa("Ready", 1),
      gT.classList.add("done"),
      setTimeout(() => {
        gT.hidden = !0;
      }, 700));
    let l = performance.now(),
      c = 1,
      u = 1.1,
      f = new K();
    n.step && (window.__step = 3);
    let h = (p, d) => {
      let m = t[p];
      if (m && m.update)
        try {
          m.update(d);
        } catch (x) {
          h.err[p] || ((h.err[p] = 1), console.error(`[loop] ${p}.update threw: ${(x && x.stack) || x}`));
        }
    };
    ((h.err = {}),
      t.renderer.setAnimationLoop(() => {
        if (n.step) {
          if (!(window.__step > 0)) return;
          window.__step--;
        }
        let p = performance.now(),
          d = (p - l) / 1e3;
        ((l = p), (a = a ? a * 0.95 + d * 0.05 : d));
        let m = Math.min(d, 0.05);
        (n.dt && (m = +n.dt), (t.time.dt = m), (t.time.t += m), (t.time.real = p / 1e3), t.time.frame++, h("input", m));
        let x = !1;
        try {
          x = t.game.update(m) !== !1 && t.game.state !== "title" && t.game.state !== "paused";
        } catch (v) {
          h.err.game || ((h.err.game = 1), console.error("[loop] game.update threw: " + ((v && v.stack) || v)));
        }
        if (i) {
          if (t.showcaseInfo.update)
            try {
              t.showcaseInfo.update(m);
            } catch (v) {
              h.err.sc || ((h.err.sc = 1), console.error("[loop] showcase update threw: " + ((v && v.stack) || v)));
            }
        } else x && (h("player", m), h("weapon", m), h("enemies", m), h("explosives", m));
        if (t.weapon && t.weapon.setWetness && t.level && t.level.interiorBoxes && t.level.interiorBoxes[0]) {
          let v = t.level.interiorBoxes[0],
            y = t.camera.position,
            b = y.x > v.min.x && y.x < v.max.x && y.z > v.min.z && y.z < v.max.z && y.y < v.max.y;
          c += ((b ? 0.3 : 1) - c) * Math.min(1, m * (b ? 0.25 : 0.6));
          try {
            t.weapon.setWetness(c);
          } catch {}
          if (!n.wfill && t.render.sunDir) {
            let g = t.camera.getWorldDirection(f),
              E = Math.max(0, g.x * t.render.sunDir.x + g.z * t.render.sunDir.z);
            ((u += ((b ? 1.1 : 1.1 + 0.6 * E * E) - u) * Math.min(1, m * 2.5)), (t.render.viewFill = u));
          }
        }
        (t.game.state !== "paused" && (h("fx", m), h("ground", m), h("level", m), h("backdrop", m), h("mats", m)),
          h("audio", m),
          h("hud", m),
          s && (t.camera.position.copy(s.pos), t.camera.lookAt(s.look)),
          t.bench && t.bench.frame(d));
        try {
          t.render.frame(m);
        } catch (v) {
          h.err.render || ((h.err.render = 1), console.error("[loop] render.frame threw: " + ((v && v.stack) || v)));
        }
        (t.input.endFrame && t.input.endFrame(), window.__frames++, window.__frames === 2 && (window.__ready = !0));
      }));
  }
  export function uL(n) {
    let e = document.createElement("pre");
    ((e.id = "bench"),
      (e.style.cssText =
        'position:absolute;left:12px;top:12px;z-index:90;margin:0;padding:10px 12px;font:12px/1.45 "IBM Plex Mono",ui-monospace,monospace;color:#d8f0d0;background:rgba(0,0,0,.72);white-space:pre-wrap;max-width:min(560px,90vw);pointer-events:none'),
      document.getElementById("app").appendChild(e));
    let t = "unknown";
    try {
      let h = n.renderer.getContext(),
        p = h.getExtension("WEBGL_debug_renderer_info");
      t = p ? h.getParameter(p.UNMASKED_RENDERER_WEBGL) : h.getParameter(h.RENDERER);
    } catch {}
    let i =
        n.level.cinematicPath && n.level.cinematicPath.length >= 2
          ? n.level.cinematicPath
          : [
              { pos: [-32, 1.7, 6], look: [0, 2, 5] },
              { pos: [10, 1.7, 6], look: [30, 6, 0] },
            ],
      s = [],
      o = 0,
      r = 0,
      a = 30,
      l = new K(),
      c = new K(),
      u = new K(),
      f = new K();
    (n.player && (n.player.enabled = !1),
      (n.bench = {
        frame(h) {
          o += h;
          let p = ((o / a) % 1) * (i.length - 1),
            d = Math.min(i.length - 2, Math.floor(p)),
            m = p - d,
            x = m * m * (3 - 2 * m);
          if (
            (l.fromArray(i[d].pos),
            c.fromArray(i[d + 1].pos),
            u.fromArray(i[d].look),
            f.fromArray(i[d + 1].look),
            n.camera.position.lerpVectors(l, c, x),
            n.camera.lookAt(u.lerp(f, x)),
            o > 2 && s.push(h * 1e3),
            s.length > 3e3 && s.shift(),
            o - r > 1 && s.length > 10)
          ) {
            r = o;
            let v = s.slice().sort((_, T) => _ - T),
              y = v.reduce((_, T) => _ + T, 0) / v.length,
              b = v[Math.floor(v.length * 0.99)],
              g = v[v.length >> 1],
              E = n.render.stats ? n.render.stats() : {},
              M = n.renderer.getDrawingBufferSize(new We());
            e.textContent = `SALTLINE BENCH  t=${o.toFixed(0)}s
GPU: ${t}
buffer ${M.x}x${M.y}  quality ${n.quality.name}  dpr ${window.devicePixelRatio}
frame ms avg ${y.toFixed(1)}  median ${g.toFixed(1)}  p99 ${b.toFixed(1)}  => ${(1e3 / y).toFixed(0)} fps
stats ${JSON.stringify(E)}
errors ${window.__errors.length}${
              window.__errors.length
                ? `
 - ` +
                  window.__errors.slice(0, 6).join(`
 - `)
                : ""
            }`;
          }
        },
      }));
  }
  export function fL() {
    let n = () => {};
    return {
      move: { x: 0, y: 0 },
      look: { dx: 0, dy: 0 },
      fire: !1,
      ads: !1,
      sprint: !1,
      crouch: !1,
      locked: !1,
      touch: !1,
      sensitivity: 1,
      down: () => !1,
      pressed: () => !1,
      update: n,
      endFrame: n,
      requestLock: n,
      exitLock: n,
    };
  }
  export function hL(n) {
    return {
      pos: new K(0, 0, 4),
      vel: new K(),
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
      eye: new K(0, zi.eye, 4),
      forward: new K(0, 0, -1),
      enabled: !1,
      reset() {},
      damage() {},
      heal() {},
      addRecoil() {},
      addShake() {},
      update() {},
    };
  }
  cL().catch((n) => yT((n && n.stack) || n));
