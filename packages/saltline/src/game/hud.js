import { Vector3 as K, Audio as op, LessDepth as hp } from 'three';
import { el } from './weapon.js';
import { zi, jr } from './common.js';
import { __late as __late_weapon } from './weapon.js';
import { __late as __late_enemies } from './enemies.js';
__late_weapon.si(si);

export var sb = 4,
    ob = -90,
    JD = 450,
    QD = { 0: "N", 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SW", 270: "W", 315: "NW" },
    rb = 2 * Math.PI * 19;
__late_weapon.rb(rb);
  export function si(n, e, t) {
    let i = document.createElement(n);
    return (e && (i.className = e), t != null && (i.innerHTML = t), i);
  }
  export function sT(n) {
    let e = document.getElementById("ui"),
      t = si("div", "hud");
    t.setAttribute("aria-hidden", "true");
    let i = si("div", "h-compass"),
      s = si("div", "h-tape"),
      o = "";
    for (let he = ob; he <= JD; he += 5) {
      let V = (he - ob) * sb,
        ne = ((he % 360) + 360) % 360,
        ye = ne % 45 === 0,
        Te = ne % 15 === 0;
      ((o += `<i class="${ye ? "mj" : Te ? "md" : "mn"}" style="left:${V}px"></i>`),
        ye
          ? (o += `<b class="${ne % 90 === 0 ? "card" : "ic"}" style="left:${V}px">${QD[ne]}</b>`)
          : ne % 15 === 0 && (o += `<b class="num" style="left:${V}px">${String(ne).padStart(3, "0")}</b>`));
    }
    s.innerHTML = o;
    let r = si("div", "h-tape-wrap");
    r.appendChild(s);
    let a = si("div", "h-cmarks"),
      l = si("div", "h-heading", "000");
    i.append(r, si("i", "h-needle"), a, l);
    let c = si(
        "div",
        "h-obj",
        '<div class="h-k">Objective</div><div class="h-obj-t"></div><div class="h-relays"><span>Relays</span><i></i><i></i><i></i><b>0/3</b></div>',
      ),
      u = c.querySelector(".h-obj-t"),
      f = c.querySelector(".h-relays"),
      h = f.querySelector("b"),
      p = f.querySelector("span"),
      d = [...f.querySelectorAll("i")],
      m = si("div", "h-warn"),
      x = si("div", "h-cross", '<i class="c-t"></i><i class="c-b"></i><i class="c-l"></i><i class="c-r"></i><i class="c-dot"></i>'),
      v = x.querySelectorAll("i"),
      y = si("div", "h-hit", "<i></i><i></i><i></i><i></i>"),
      b = si("div", "h-arcs"),
      g = [];
    for (let he = 0; he < 4; he++) {
      let V = si(
        "div",
        "h-arc",
        '<svg viewBox="-100 -100 200 200"><path d="M -38 -84 A 92 92 0 0 1 38 -84" /><path class="tip" d="M -7 -97 L 0 -106 L 7 -97" /></svg>',
      );
      (b.appendChild(V), g.push({ el: V, life: 0, src: new K(), op: -1, rot: 1e9 }));
    }
    let E = si(
        "div",
        "h-prompt",
        `<svg viewBox="-24 -24 48 48"><circle class="bg" r="19"/><circle class="fg" r="19" stroke-dasharray="${rb.toFixed(2)}" stroke-dashoffset="${rb.toFixed(2)}" transform="rotate(-90)"/></svg><span class="h-key">E</span><span class="h-plabel"></span>`,
      ),
      M = E.querySelector(".fg"),
      _ = E.querySelector(".h-key"),
      T = E.querySelector(".h-plabel"),
      w = si("div", "h-feed"),
      S = si("div", "h-msg"),
      R = si(
        "div",
        "h-health",
        '<div class="h-k">Vitals</div><div class="h-hp-row"><b class="h-hp-n">100</b><div class="h-hp-bar">' +
          "<i></i>".repeat(10) +
          "</div></div>",
      ),
      z = R.querySelector(".h-hp-n"),
      I = [...R.querySelectorAll(".h-hp-bar i")],
      L = si(
        "div",
        "h-ammo",
        '<div class="h-cue"></div><div class="h-ammo-row"><b class="h-ammo-n">30</b><span class="h-ammo-r">120</span></div><div class="h-pips"></div><div class="h-wname"></div><div class="h-alt"></div>',
      ),
      U = L.querySelector(".h-ammo-n"),
      k = L.querySelector(".h-ammo-r"),
      C = L.querySelector(".h-pips"),
      A = L.querySelector(".h-wname"),
      F = L.querySelector(".h-cue"),
      H = L.querySelector(".h-alt"),
      N = si("div", "h-marks");
    (t.append(N, i, c, m, b, x, y, E, w, S, R, L), e.appendChild(t));
    let Z = si("div", "comms", '<span class="comms-who">Control</span><span class="comms-t"></span>');
    (Z.setAttribute("role", "status"), Z.setAttribute("aria-live", "polite"));
    let Q = Z.querySelector(".comms-t");
    e.appendChild(Z);
    let W = !1,
      J = 420,
      G = innerWidth,
      te = innerHeight,
      oe = {
        ammo: -1,
        mag: -1,
        reserve: -1,
        name: null,
        cue: null,
        low: null,
        hp: -1,
        hpSeg: -1,
        hurt: null,
        head: -1,
        tapeX: 1e9,
        gap: -1,
        crossOn: null,
        promptOn: null,
        promptText: null,
        promptT: -1,
        promptKey: null,
        marksOn: null,
        done: -1,
        total: -1,
      },
      ee = [],
      le = "",
      xe = 0,
      j = 0,
      O = [],
      q = null,
      ue = 0,
      de = 0,
      $ = 0,
      se = 0,
      fe = 0,
      me = [],
      ge = [],
      ce = new K(),
      P = null,
      D = -1;
    function B() {
      ((G = innerWidth), (te = innerHeight), (J = i.clientWidth || Math.min(420, G * 0.6)), (oe.tapeX = 1e9), (oe.gap = -1));
      for (let he of ge) ((he.lastC = 1e9), (he.lastW = ""));
    }
    (addEventListener("resize", B),
      n.events.on("player:hitEnemy", (he) => {
        (X.hitmarker(he && he.killed ? "kill" : he && (he.weak || he.part === "weak") ? "weak" : "hit"),
          he && he.killed && he.weak && P && D === n.time.frame && !P.weak && ((P.weak = !0), (P.el.innerHTML += "<em>Weak point</em>")));
      }),
      n.events.on("enemy:killed", (he) => {
        let V = String((he && (he.type || (he.enemy && he.enemy.type))) || "machine").toUpperCase();
        ((P = X.feed(`<b>${V}</b> destroyed`)), (D = n.time.frame));
      }),
      n.events.on("player:hit", (he) => {
        if (!he || !he.fromPos) return;
        let V = g[0];
        for (let ne of g) {
          if (ne.life <= 0) {
            V = ne;
            break;
          }
          ne.life < V.life && (V = ne);
        }
        (V.src.copy(he.fromPos), (V.life = 1.5), (V.max = 1.5));
      }));
    let X = {
      root: t,
      show(he) {
        ((he = !!he), he !== W && ((W = he), t.classList.toggle("on", he), he && B()));
      },
      setObjective(he) {
        ((he = he || ""),
          he !== le &&
            ((le = he),
            (xe = 0),
            (j = 0),
            (u.textContent = ""),
            c.classList.toggle("has", !!he),
            c.classList.remove("flash"),
            c.offsetWidth,
            c.classList.add("flash")));
      },
      setTally(he) {
        let V = he != null;
        (f.classList.toggle("tally", V), (p.textContent = V ? he : "Relays"));
      },
      setRelays(he, V) {
        if (!(he === oe.done && V === oe.total)) {
          if (V !== oe.total) {
            (d.forEach((ne) => ne.remove()), (d = []));
            for (let ne = 0; ne < V; ne++) {
              let ye = document.createElement("i");
              (f.insertBefore(ye, h), d.push(ye));
            }
          }
          ((oe.done = he),
            (oe.total = V),
            d.forEach((ne, ye) => ne.classList.toggle("cut", ye < he)),
            (h.textContent = `${he}/${V}`),
            f.classList.toggle("all", he >= V && V > 0));
        }
      },
      setMarkers(he) {
        for (let V of ge) (V.cEl.remove(), V.wEl.remove());
        ge = (he || []).map((V) => {
          let ne = si("div", "h-cm " + (V.kind || "relay"), `<i></i><b>${V.short || ""}</b><span></span>`),
            ye = si("div", "h-wm " + (V.kind || "relay"), `<i></i><b>${V.short || ""}</b><span></span>`);
          return (
            a.appendChild(ne),
            N.appendChild(ye),
            {
              ...V,
              cEl: ne,
              wEl: ye,
              cDist: ne.querySelector("span"),
              wDist: ye.querySelector("span"),
              lastD: -1,
              lastC: 1e9,
              lastW: "",
              vis: null,
            }
          );
        });
      },
      setPrompt(he, V = 0) {
        let ne = !!he;
        if ((ne !== oe.promptOn && ((oe.promptOn = ne), E.classList.toggle("on", ne), n.input.setPrompt && n.input.setPrompt(ne)), !ne))
          return;
        let ye = n.input.touch ? "USE" : n.input.device === "pad" ? "X" : "E";
        ye !== oe.promptKey && ((oe.promptKey = ye), (_.textContent = ye), _.classList.toggle("wide", ye.length > 1));
        let Te = `Hold ${ye} \u2014 ${he}`;
        Te !== oe.promptText && ((oe.promptText = Te), (T.textContent = Te));
        let Re = Math.round(V * 200) / 200;
        Re !== oe.promptT &&
          ((oe.promptT = Re), M.setAttribute("stroke-dashoffset", (rb * (1 - Re)).toFixed(2)), E.classList.toggle("busy", Re > 0));
      },
      radio(he, V = 4.5) {
        he && O.push({ text: he, secs: V });
      },
      clearRadio() {
        ((O.length = 0), (q = null), Z.classList.remove("on"));
      },
      warn(he, V = 3) {
        ((m.textContent = he), (se = V), m.classList.remove("on"), m.offsetWidth, m.classList.add("on"));
      },
      message(he, V = 3) {
        ((S.textContent = he || ""), (fe = he ? V : 0), S.classList.toggle("on", !!he));
      },
      feed(he) {
        let V = si("div", "h-fl", he);
        w.appendChild(V);
        let ne = { el: V, life: 4.2, weak: !1 };
        for (me.push(ne); me.length > 4;) me.shift().el.remove();
        return ne;
      },
      hitmarker(he = "hit") {
        y.className = "h-hit " + he;
        let V = he === "weak" || he === "kill" ? 1.5 : 1.15;
        try {
          y.animate(
            [
              { opacity: 1, transform: `translate(-50%,-50%) scale(${V})` },
              { opacity: 1, transform: "translate(-50%,-50%) scale(1)", offset: 0.35 },
              { opacity: 0, transform: "translate(-50%,-50%) scale(0.92)" },
            ],
            { duration: he === "kill" ? 420 : 240, easing: "ease-out" },
          );
        } catch {}
      },
      reset() {
        ((O.length = 0), (q = null), Z.classList.remove("on"));
        for (let he of me) he.el.remove();
        me.length = 0;
        for (let he of g) he.life = 0;
        ((se = 0), m.classList.remove("on"), X.message(""), X.setPrompt(null), X.setObjective(""), (oe.hp = -1));
      },
      update: re,
    };
    function re(he) {
      if ((Y(he), !W)) return;
      let V = n.player,
        ne = n.weapon || {},
        ye = n.camera,
        Te = V.ads || 0,
        Re = ((-V.yaw * 180) / Math.PI) % 360;
      Re < 0 && (Re += 360);
      let Ue = Math.round((J / 2 - (Re - ob) * sb) * 2) / 2;
      Ue !== oe.tapeX && ((oe.tapeX = Ue), (s.style.transform = `translate3d(${Ue}px,0,0)`));
      let Ve = Math.round(Re) % 360;
      Ve !== oe.head && ((oe.head = Ve), (l.textContent = String(Ve).padStart(3, "0")));
      let ze = Te < 0.5;
      if ((ze !== oe.marksOn && ((oe.marksOn = ze), N.classList.toggle("off", !ze)), ge.length)) {
        (ye.updateMatrixWorld(), ye.matrixWorldInverse.copy(ye.matrixWorld).invert());
        let $e = J / 2 - 14;
        for (let Ke of ge) {
          let Bt = Ke.pos.x - V.pos.x,
            Gt = Ke.pos.z - V.pos.z,
            vi = Math.round(Math.hypot(Bt, Gt));
          if (vi !== Ke.lastD) {
            Ke.lastD = vi;
            let oi = vi + "m";
            ((Ke.cDist.textContent = oi), (Ke.wDist.textContent = oi));
          }
          let q0 = (Math.atan2(Bt, -Gt) * 180) / Math.PI - Re;
          q0 = ((q0 + 540) % 360) - 180;
          let yi = Math.round(Math.max(-$e, Math.min($e, q0 * sb)));
          (yi !== Ke.lastC &&
            ((Ke.lastC = yi), (Ke.cEl.style.transform = `translate3d(${yi}px,0,0)`), Ke.cEl.classList.toggle("edge", Math.abs(yi) >= $e)),
            ce.set(Ke.pos.x, Ke.pos.y + (Ke.kind === "extract" ? 1.2 : 1.9), Ke.pos.z).project(ye));
          let sn,
            P0,
            $t = !1;
          if ((ce.z > 1 && (($t = !0), (ce.x = -ce.x), (ce.y = -ce.y)), $t || Math.abs(ce.x) > 0.9 || Math.abs(ce.y) > 0.82)) {
            $t = !0;
            let oi = Math.max(Math.abs(ce.x) / 0.9, Math.abs(ce.y) / 0.82, 0.001);
            if (((ce.x /= oi), (ce.y /= oi), ce.z > 1)) {
              let xn = Math.max(Math.abs(ce.x) / 0.9, Math.abs(ce.y) / 0.82);
              xn < 0.999 && ((ce.x /= xn), (ce.y /= xn));
            }
          }
          ((sn = Math.round((ce.x * 0.5 + 0.5) * G)), (P0 = Math.round((-ce.y * 0.5 + 0.5) * te)));
          let Sn = !$t && Math.hypot(ce.x, ce.y * 0.6) < 0.16,
            bi = sn + "," + P0 + ($t ? "o" : "") + (vi < 3 ? "n" : "") + (Sn ? "d" : "");
          bi !== Ke.lastW &&
            ((Ke.lastW = bi),
            (Ke.wEl.style.transform = `translate3d(${sn}px,${P0}px,0)`),
            Ke.wEl.classList.toggle("offscreen", $t),
            Ke.wEl.classList.toggle("near", vi < 3),
            Ke.wEl.classList.toggle("dim", Sn));
        }
      }
      let Ge = Te <= 0.6 && V.alive && ne.state !== "reloading_hidden";
      if ((Ge !== oe.crossOn && ((oe.crossOn = Ge), x.classList.toggle("off", !Ge)), Ge)) {
        let $e = typeof ne.spread == "number" ? ne.spread : 0.012,
          Ke = (ye.fov * Math.PI) / 360,
          Bt = (Math.tan($e) / Math.tan(Ke)) * (te / 2) + 4 + (V.sprinting ? 10 : 0);
        ((Bt = Math.round(Math.max(4, Math.min(70, Bt)) * 2) / 2),
          Bt !== oe.gap &&
            ((oe.gap = Bt),
            (v[0].style.transform = `translate3d(-50%,${-Bt}px,0) translateY(-100%)`),
            (v[1].style.transform = `translate3d(-50%,${Bt}px,0)`),
            (v[2].style.transform = `translate3d(${-Bt}px,-50%,0) translateX(-100%)`),
            (v[3].style.transform = `translate3d(${Bt}px,-50%,0)`)));
      }
      let _e = Math.max(1, Math.min(60, ne.magSize | 0 || 30)),
        Ne = Math.max(0, ne.ammo | 0),
        ke = ne.reserve === 1 / 0 ? 9999 : Math.max(0, ne.reserve | 0);
      if (
        (_e !== oe.mag && ((oe.mag = _e), (C.innerHTML = "<i></i>".repeat(_e)), (ee = [...C.children]), (oe.ammo = -1)), Ne !== oe.ammo)
      ) {
        ((oe.ammo = Ne), (U.textContent = String(Ne).padStart(2, "0")));
        for (let $e = 0; $e < ee.length; $e++) ee[$e].className = $e < Ne ? "" : "off";
      }
      (ke !== oe.reserve && ((oe.reserve = ke), (k.textContent = ke >= 9999 ? "\u221E" : String(ke).padStart(3, "0"))),
        ne.name !== oe.name && ((oe.name = ne.name), (A.textContent = ne.name || "")));
      let je = "";
      if (ne.slots && ne.slots.length > 1) {
        let $e = ne.slots[0].id === ne.current ? ne.slots[1] : ne.slots[0],
          Ke = n.input.device;
        je =
          (Ke === "pad" ? "<kbd>Y</kbd>" : Ke === "touch" || n.input.touch ? "" : "<kbd>Q</kbd>") +
          `<b>${$e.name || ""}</b> ${String(Math.max(0, $e.ammo | 0)).padStart(2, "0")} / ${$e.reserve === 1 / 0 ? "\u221E" : Math.max(0, $e.reserve | 0)}`;
      }
      je !== oe.alt && ((oe.alt = je), (H.innerHTML = je));
      let Ze = Ne <= Math.ceil(_e * 0.27),
        qe =
          ne.state === "reloading"
            ? "Reloading"
            : ne.state === "switching"
              ? ""
              : Ne === 0
                ? ke > 0
                  ? n.input.touch
                    ? "Reload"
                    : n.input.device === "pad"
                      ? "X \u2014 Reload"
                      : "R \u2014 Reload"
                  : ne.slots && ne.slots.length > 1
                    ? n.input.device === "pad"
                      ? "Empty \u2014 Y swaps"
                      : n.input.touch
                        ? "Empty \u2014 swap"
                        : "Empty \u2014 Q swaps"
                    : "Empty"
                : Ze
                  ? "Low ammo"
                  : "";
      (qe !== oe.cue &&
        ((oe.cue = qe),
        (F.textContent = qe),
        (F.className = "h-cue" + (qe ? " on" : "") + (Ne === 0 && ne.state !== "reloading" ? " urgent" : ""))),
        Ze !== oe.low && ((oe.low = Ze), L.classList.toggle("low", Ze)));
      let Oe = Math.max(0, Math.ceil(V.health)),
        mt = V.health < V.maxHealth - 0.5;
      if (Oe !== oe.hp) {
        ((oe.hp = Oe), (z.textContent = String(Oe)));
        let $e = Math.ceil((Oe / V.maxHealth) * I.length);
        if ($e !== oe.hpSeg) {
          oe.hpSeg = $e;
          for (let Ke = 0; Ke < I.length; Ke++) I[Ke].className = Ke < $e ? "" : "off";
          R.classList.toggle("crit", $e <= 3);
        }
      }
      mt !== oe.hurt && ((oe.hurt = mt), R.classList.toggle("on", mt));
      for (let $e of g) {
        if ($e.life <= 0) {
          $e.op !== 0 && (($e.op = 0), ($e.el.style.opacity = "0"));
          continue;
        }
        $e.life -= he;
        let Ke = Math.atan2($e.src.x - V.pos.x, -($e.src.z - V.pos.z)) + V.yaw,
          Bt = Math.round((Ke * 180) / Math.PI);
        Bt !== $e.rot && (($e.rot = Bt), ($e.el.style.transform = `translate(-50%,-50%) rotate(${Bt}deg)`));
        let Gt = Math.round(Math.min(1, Math.max(0, $e.life / 0.6)) * 20) / 20;
        Gt !== $e.op && (($e.op = Gt), ($e.el.style.opacity = String(Gt)));
      }
      if (xe < le.length) {
        j += he * 46;
        let $e = Math.min(le.length, Math.floor(j));
        $e !== xe && ((xe = $e), (u.textContent = le.slice(0, $e)));
      }
      (se > 0 && ((se -= he), se <= 0 && m.classList.remove("on")), fe > 0 && ((fe -= he), fe <= 0 && S.classList.remove("on")));
      for (let $e = me.length - 1; $e >= 0; $e--) {
        let Ke = me[$e];
        ((Ke.life -= he),
          Ke.life <= 0 ? (Ke.el.remove(), me.splice($e, 1)) : Ke.life < 0.6 && !Ke.out && ((Ke.out = !0), Ke.el.classList.add("out")));
      }
    }
    function Y(he) {
      if (!q) {
        if (!O.length) return;
        ((q = O.shift()),
          (ue = 0),
          (de = 0),
          ($ = q.secs),
          (Q.textContent = ""),
          Z.classList.add("on"),
          n.events.emit("radio:line", { text: q.text }));
      }
      let V = q.text;
      if (ue < V.length) {
        de += he * 58;
        let ne = Math.min(V.length, Math.floor(de));
        ne !== ue && ((ue = ne), (Q.textContent = V.slice(0, ne)));
      } else (($ -= he), $ <= 0 && ((q = null), O.length || Z.classList.remove("on")));
    }
    return (B(), X);
  }
  export var oT = "legacy-v8";
  export function rT() {
    return !!document.getElementById(oT);
  }
  export function aT(n) {
    let e = document.getElementById(oT);
    if (!e) return !1;
    let t = atob(e.textContent.replace(/\s+/g, "")),
      i = new Uint8Array(t.length);
    for (let o = 0; o < t.length; o++) i[o] = t.charCodeAt(o);
    let s = new TextDecoder("utf-8").decode(i);
    n.dead = !0;
    try {
      n.renderer.setAnimationLoop(null);
    } catch {}
    try {
      n.audio && n.audio.ctx && n.audio.ctx.close && n.audio.ctx.close();
    } catch {}
    try {
      document.pointerLockElement && document.exitPointerLock();
    } catch {}
    try {
      n.renderer.forceContextLoss();
    } catch {}
    return (document.open(), document.write(s), document.close(), !0);
  }
  export var lT = "saltline.settings.v1",
    tL = { quality: "auto", sens: 1, invertY: !1, volume: 0.8, fov: zi.fov, difficulty: "hard", mode: "mission", view: 1 },
    cT = [
      [1, "Close"],
      [2, "Three-quarter"],
      [3, "Compact"],
    ],
    uT = [
      ["mission", "Mission"],
      ["holdout", "Holdout"],
    ],
    nL = {
      mission: "Cut three relays and reach the boat. About five minutes.",
      holdout: "Endless waves that keep growing. Resupply between waves. How long can you hold?",
    },
    ab = [
      ["standard", "Standard"],
      ["hard", "Hard"],
      ["brutal", "Brutal"],
    ],
    fT = ["low", "medium", "high", "ultra"];
__late_weapon.ab(ab);
  export function iL() {
    let n = { ...tL };
    try {
      let e = JSON.parse(localStorage.getItem(lT) || "null");
      e &&
        typeof e == "object" &&
        ((e.quality === "auto" || fT.includes(e.quality)) && (n.quality = e.quality),
        Number.isFinite(e.sens) && (n.sens = Math.min(3, Math.max(0.2, e.sens))),
        (n.invertY = !!e.invertY),
        Number.isFinite(e.volume) && (n.volume = Math.min(1, Math.max(0, e.volume))),
        Number.isFinite(e.fov) && (n.fov = Math.min(95, Math.max(60, e.fov))),
        ab.some((t) => t[0] === e.difficulty) && (n.difficulty = e.difficulty),
        uT.some((t) => t[0] === e.mode) && (n.mode = e.mode),
        cT.some((t) => t[0] === e.view) && (n.view = e.view));
    } catch {}
    return n;
  }
  export function cc(n) {
    try {
      localStorage.setItem(lT, JSON.stringify(n));
    } catch {}
  }
  export var sL = `
  <dl class="keys">
    <div><dt>Move</dt><dd><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></dd></div>
    <div><dt>Look</dt><dd>Mouse</dd></div>
    <div><dt>Fire</dt><dd>Left button</dd></div>
    <div><dt>Aim</dt><dd>Right button</dd></div>
    <div><dt>Reload</dt><dd><kbd>R</kbd></dd></div>
    <div><dt>Swap weapon</dt><dd><kbd>Q</kbd>, wheel, or <kbd>1</kbd> <kbd>2</kbd></dd></div>
    <div><dt>Cut relay</dt><dd>Hold <kbd>E</kbd></dd></div>
    <div><dt>Jump</dt><dd><kbd>Space</kbd></dd></div>
    <div><dt>Sprint</dt><dd><kbd>Shift</kbd></dd></div>
    <div><dt>Crouch</dt><dd><kbd>C</kbd> or <kbd>Ctrl</kbd></dd></div>
    <div><dt>Melee</dt><dd><kbd>F</kbd></dd></div>
    <div><dt>Pause</dt><dd><kbd>Esc</kbd> or <kbd>P</kbd></dd></div>
  </dl>`,
    oL = `
  <dl class="keys">
    <div><dt>Move \xB7 Look</dt><dd>Left stick \xB7 Right stick</dd></div>
    <div><dt>Fire \xB7 Aim</dt><dd><kbd>RT</kbd> \xB7 <kbd>LT</kbd></dd></div>
    <div><dt>Reload</dt><dd><kbd>X</kbd></dd></div>
    <div><dt>Cut relay</dt><dd>Hold <kbd>X</kbd> at a relay</dd></div>
    <div><dt>Swap weapon</dt><dd><kbd>Y</kbd> or D-pad</dd></div>
    <div><dt>Jump</dt><dd><kbd>A</kbd></dd></div>
    <div><dt>Crouch</dt><dd><kbd>B</kbd> or <kbd>LB</kbd></dd></div>
    <div><dt>Sprint</dt><dd>Click the left stick</dd></div>
    <div><dt>Melee</dt><dd><kbd>RB</kbd> or click the right stick</dd></div>
    <div><dt>Pause</dt><dd><kbd>Start</kbd></dd></div>
  </dl>`,
    rL = `
  <dl class="keys">
    <div><dt>Move</dt><dd>Left thumb, anywhere</dd></div>
    <div><dt>Look</dt><dd>Drag the right side</dd></div>
    <div><dt>Fire</dt><dd>Hold FIRE, drag to track</dd></div>
    <div><dt>Aim</dt><dd>AIM toggles</dd></div>
    <div><dt>Reload</dt><dd>RLD</dd></div>
    <div><dt>Jump</dt><dd>JUMP</dd></div>
    <div><dt>Cut relay</dt><dd>Hold USE at a relay</dd></div>
    <div><dt>Sprint</dt><dd>Push the stick fully forward</dd></div>
  </dl>`;
__late_enemies.sL(sL);
  export function hT(n, e) {
    let t = document.getElementById("ui"),
      i = iL(),
      s = document.createElement("div");
    ((s.className = "menu"),
      (s.dataset.screen = "none"),
      (s.innerHTML = `
    <div class="m-veil"></div>
    <div class="m-bars"><i></i><i></i></div>

    <section class="m-screen m-title" data-s="title" aria-label="Saltline">
      <div class="m-title-main">
        <div class="m-eyebrow"><span class="m-tag">B4</span><span>Port Authority Breach Unit</span><span class="m-dim">Saltline Terminal \xB7 05:42</span></div>
        <h1 class="m-word">SALTLINE</h1>
        <p class="m-premise">The port\u2019s security net has gone feral. Cut its three uplinks. Reach the boat.</p>
        <div class="m-actions">
          <button class="btn primary" data-act="deploy">Deploy</button>
          <button class="btn" data-act="settings">Settings</button>
          <button class="btn m-only-narrow" data-act="controls">Controls</button>
        </div>
        <div class="m-pick">
          <label id="l-tm">Mode</label><div class="seg" role="group" aria-labelledby="l-tm">${uT.map((W) => `<button data-m="${W[0]}" aria-pressed="false">${W[1]}</button>`).join("")}</div>
          <label id="l-td">Difficulty</label><div class="seg" role="group" aria-labelledby="l-td">${ab.map((W) => `<button data-d="${W[0]}" aria-pressed="false">${W[1]}</button>`).join("")}</div>
          <div class="m-pick-note" data-f="modenote"></div>
        </div>
        <p class="m-note">Every surface, machine and sound is generated in your browser. Nothing is downloaded.</p>
      </div>
      <aside class="m-legend" aria-label="Controls at a glance">
        <div><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move</span><span><kbd>Mouse</kbd> Look</span><span><kbd>LMB</kbd> Fire</span><span><kbd>RMB</kbd> Aim</span><span><kbd>R</kbd> Reload</span></div>
        <div><span><kbd>Q</kbd> Sidearm</span><span><kbd>E</kbd> Cut relay</span><span><kbd>Space</kbd> Jump</span><span><kbd>Shift</kbd> Sprint</span><span><kbd>C</kbd> Crouch</span><span><kbd>Esc</kbd> Pause</span></div>
        <div class="lg-pad"><em>Controller</em><span>Sticks move and look</span><span><kbd>RT</kbd> Fire</span><span><kbd>LT</kbd> Aim</span><span><kbd>X</kbd> Reload / cut</span><span><kbd>Y</kbd> Sidearm</span><span><kbd>A</kbd> Deploy</span></div>
        <div class="lg-touch"><em>Touch</em><span>Left thumb moves</span><span>Right thumb looks</span><span>Fire \xB7 Aim \xB7 Reload \xB7 Jump on screen</span></div>
      </aside>
      <aside class="m-callout" aria-label="A note from Felix" hidden>
        <button class="m-callout-tab" data-act="note" aria-expanded="false">A note from Felix</button>
        <div class="m-callout-body">
          <button class="m-callout-x" data-act="note" aria-label="Dismiss this note">&times;</button>
          <p>Hi, Felix here. People online were impressed with the one-shotted version of this game - Claude Fable 5.2 built something pretty good without any human feedback. However, I really wanted to fix the weapon models, sounds, and some gameplay work. I spent an additional two hours to improve this game.</p>
          <p>If you'd rather see the first version that didn't receive any human feedback, click here:</p>
          <a class="btn small" href="https://claude.ai/artifact/2UXyB49DrVHFfhTMdNDFTA" style="display:flex;align-items:center;justify-content:center;text-align:center;padding-left:18px;padding-right:18px;text-decoration:none">See the one-shotted version</a>
        </div>
      </aside>
    </section>

    <section class="m-screen m-card" data-s="paused" aria-label="Paused">
      <div class="m-k">Operation on hold</div>
      <h2 class="m-h">Paused</h2>
      <p class="m-line" data-f="lookmode"></p>
      <div class="m-actions col">
        <button class="btn primary" data-act="resume">Resume</button>
        <button class="btn" data-act="settings">Settings</button>
        <button class="btn" data-act="controls">Controls</button>
        <button class="btn" data-act="restart">Restart mission</button>
      </div>
    </section>

    <section class="m-screen m-card m-dead" data-s="dead" aria-label="Signal lost">
      <div class="m-k">Breacher down</div>
      <h2 class="m-h">Signal lost</h2>
      <dl class="m-stats"><div><dt>Time survived</dt><dd data-f="dead-time">00:00</dd></div><div data-only="mission"><dt>Relays cut</dt><dd data-f="dead-relays">0/3</dd></div><div data-only="holdout"><dt>Waves cleared</dt><dd data-f="dead-wave">0</dd></div><div data-only="holdout"><dt>Machines destroyed</dt><dd data-f="dead-kills">0</dd></div><div data-only="holdout"><dt>Score</dt><dd data-f="dead-score">0</dd></div><div data-only="holdout"><dt>Best</dt><dd data-f="dead-best">0</dd></div></dl>
      <div class="m-actions col"><button class="btn primary" data-act="retry">Retry</button></div>
    </section>

    <section class="m-screen m-card m-debrief" data-s="complete" aria-label="Debrief">
      <div class="m-k">Berth 4 \xB7 Debrief</div>
      <h2 class="m-h">Saltline is dark</h2>
      <div class="m-rating"><span>Rating</span><b data-f="rating">Clean</b></div>
      <dl class="m-stats">
        <div><dt>Time</dt><dd data-f="time">00:00</dd></div>
        <div><dt>Accuracy</dt><dd data-f="acc">0%</dd></div>
        <div><dt>Machines destroyed</dt><dd data-f="kills">0</dd></div>
        <div><dt>Retries</dt><dd data-f="retries">0</dd></div>
      </dl>
      <div class="m-actions col"><button class="btn primary" data-act="redeploy">Redeploy</button></div>
    </section>

    <div class="panel" role="dialog" aria-modal="true" aria-label="Settings and controls" tabindex="-1" hidden>
      <header class="panel-h">
        <div class="tabs" role="tablist">
          <button class="tab" role="tab" data-tab="settings" aria-selected="true">Settings</button>
          <button class="tab" role="tab" data-tab="controls" aria-selected="false">Controls</button>
        </div>
        <button class="btn small" data-act="close-panel">Close</button>
      </header>
      <div class="panel-b" data-pane="settings">
        <div class="row"><label id="l-d">Difficulty</label>
          <div class="seg" role="group" aria-labelledby="l-d">${ab.map((W) => `<button data-d="${W[0]}" aria-pressed="false">${W[1]}</button>`).join("")}</div></div>
        <div class="row"><label id="l-v">Weapon position</label>
          <div class="seg" role="group" aria-labelledby="l-v">${cT.map((W) => `<button data-v="${W[0]}" aria-pressed="false">${W[1]}</button>`).join("")}</div></div>
        <div class="row"><label id="l-q">Graphics quality</label>
          <div class="seg" role="group" aria-labelledby="l-q">${fT.map((W) => `<button data-q="${W}" aria-pressed="false">${W}</button>`).join("")}</div></div>
        <div class="row"><label for="s-sens">Mouse sensitivity</label><div class="slider"><input id="s-sens" type="range" min="0.2" max="3" step="0.05"><output data-o="sens"></output></div></div>
        <div class="row"><label id="l-inv">Invert Y</label><button class="toggle" data-act="invert" aria-labelledby="l-inv" aria-pressed="false"><i></i><span>Off</span></button></div>
        <div class="row"><label for="s-vol">Master volume</label><div class="slider"><input id="s-vol" type="range" min="0" max="100" step="1"><output data-o="vol"></output></div></div>
        <div class="row"><label for="s-fov">Field of view</label><div class="slider"><input id="s-fov" type="range" min="60" max="95" step="1"><output data-o="fov"></output></div></div>
        <div class="row" data-row="fs"><label id="l-fs">Display</label><button class="btn small" data-act="fullscreen" aria-labelledby="l-fs fs-t"><span id="fs-t">Enter fullscreen</span></button></div>
        <p class="panel-note" data-f="qnote"></p>
      </div>
      <div class="panel-b" data-pane="controls" hidden>
        <h3>Keyboard \xB7 Mouse</h3>${sL}
        <p class="panel-note">If the browser will not capture the mouse, hold a mouse button and drag to look (left also fires, right also aims). Arrow keys or <kbd>I</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd> turn, <kbd>Enter</kbd> fires.</p>
        <h3>Touch</h3>${rL}
        <h3>Controller</h3>${oL}
        <p class="panel-note">In menus the D-pad or left stick moves the selection, <kbd>A</kbd> accepts and <kbd>B</kbd> goes back. Browsers only start sound after a click or key press, so click once if a controller-only start is silent.</p>
      </div>
    </div>

    <div class="loc-card" aria-hidden="true"><i></i><b>Saltline Terminal \xB7 Berth 4 \xB7 05:42</b><span>Port Authority Breach Unit \u2014 one breacher, no backup</span></div>
  `),
      t.appendChild(s));
    let o = (W) => s.querySelector(W),
      r = (W) => [...s.querySelectorAll(W)],
      a = o(".panel"),
      l = o(".loc-card"),
      c = (W) => s.querySelector(`[data-f="${W}"]`),
      u = o("#s-sens"),
      f = o("#s-vol"),
      h = o("#s-fov"),
      p = "none",
      d = null;
    function m(W) {
      if (
        ((!W || W === "sens") && (n.input.sensitivity = i.sens),
        (!W || W === "invertY") && (n.input.invertY = i.invertY),
        !W || W === "volume")
      )
        try {
          n.audio && n.audio.setVolume && n.audio.setVolume(i.volume);
        } catch (J) {
          console.error(J);
        }
      if (!W || W === "view")
        try {
          n.weapon && n.weapon.setView && n.weapon.setView(i.view);
        } catch (J) {
          console.error(J);
        }
      if (
        ((!W || W === "fov") && n.player && n.player.setFov && n.player.setFov(i.fov),
        W === "quality" || (!W && i.quality !== "auto" && !n.params.shot && !n.params.q && i.quality !== (n.quality && n.quality.name)))
      ) {
        let J = jr[i.quality];
        if (J)
          try {
            n.render && n.render.setQuality ? n.render.setQuality({ ...J }) : (n.quality = { ...J });
          } catch (G) {
            console.error("[game] setQuality failed", G);
          }
      }
    }
    function x() {
      let W = i.quality === "auto" ? n.quality && n.quality.name : i.quality;
      for (let G of r(".seg button[data-q]")) G.setAttribute("aria-pressed", String(G.dataset.q === W));
      for (let G of r(".seg button[data-d]")) G.setAttribute("aria-pressed", String(G.dataset.d === i.difficulty));
      for (let G of r(".seg button[data-v]")) G.setAttribute("aria-pressed", String(+G.dataset.v === i.view));
      for (let G of r(".seg button[data-m]")) G.setAttribute("aria-pressed", String(G.dataset.m === i.mode));
      ((s.dataset.mode = i.mode),
        (c("modenote").textContent = nL[i.mode] || ""),
        (u.value = i.sens),
        (f.value = Math.round(i.volume * 100)),
        (h.value = i.fov),
        (o('[data-o="sens"]').textContent = i.sens.toFixed(2) + "\xD7"),
        (o('[data-o="vol"]').textContent = Math.round(i.volume * 100) + "%"),
        (o('[data-o="fov"]').textContent = Math.round(i.fov) + "\xB0"));
      let J = o('[data-act="invert"]');
      (J.setAttribute("aria-pressed", String(i.invertY)),
        (J.querySelector("span").textContent = i.invertY ? "On" : "Off"),
        (c("qnote").textContent =
          i.quality === "auto"
            ? `Quality was picked for this device (${W || "default"}). Lower it if the frame rate struggles.`
            : "Quality changes apply at once; shadows and reflections may take a moment to rebuild."),
        (c("qnote").textContent += " Difficulty applies to machines that arrive from now on."));
    }
    (u.addEventListener("input", () => {
      ((i.sens = +u.value), m("sens"), x(), cc(i));
    }),
      f.addEventListener("input", () => {
        ((i.volume = +f.value / 100), m("volume"), x(), cc(i));
      }),
      h.addEventListener("input", () => {
        ((i.fov = +h.value), m("fov"), x(), cc(i));
      }));
    let v = o('[data-row="fs"]'),
      y = o("#fs-t"),
      b = () => document.fullscreenElement || document.webkitFullscreenElement || null,
      g = document.getElementById("app") || document.documentElement;
    (g &&
      (g.requestFullscreen || g.webkitRequestFullscreen) &&
      document.fullscreenEnabled !== !1 &&
      document.webkitFullscreenEnabled !== !1) ||
      (v.hidden = !0);
    function M() {
      y.textContent = "Fullscreen is not available here";
    }
    function _() {
      try {
        if (b()) {
          (document.exitFullscreen || document.webkitExitFullscreen).call(document);
          return;
        }
        let W = (g.requestFullscreen || g.webkitRequestFullscreen).call(g);
        W && W.catch && W.catch(M);
      } catch {
        M();
      }
    }
    let T = () => {
      y.textContent = b() ? "Exit fullscreen" : "Enter fullscreen";
    };
    (document.addEventListener("fullscreenchange", T), document.addEventListener("webkitfullscreenchange", T));
    function w(W) {
      ((d = document.activeElement), (a.hidden = !1), s.classList.add("panel-open"), R(W || "settings"));
      try {
        a.focus({ preventScroll: !0 });
      } catch {}
    }
    function S() {
      return a.hidden ? !1 : ((a.hidden = !0), s.classList.remove("panel-open"), d && d.focus && s.contains(d) ? d.focus() : z(), !0);
    }
    function R(W) {
      for (let J of r(".tab")) J.setAttribute("aria-selected", String(J.dataset.tab === W));
      for (let J of r(".panel-b")) J.hidden = J.dataset.pane !== W;
    }
    function z() {
      let W = s.querySelector(`.m-screen[data-s="${p}"] .btn.primary`);
      if (W)
        try {
          W.focus({ preventScroll: !0 });
        } catch {}
    }
    let I = s.querySelector(".m-callout"),
      L = I.querySelector(".m-callout-tab"),
      U = "saltline.note";
    function k(W, J) {
      if ((I.classList.toggle("open", W), L.setAttribute("aria-expanded", String(W)), J))
        try {
          localStorage.setItem(U, W ? "1" : "0");
        } catch {}
    }
    {
      let W = null;
      try {
        W = localStorage.getItem(U);
      } catch {}
      (k(W ? W === "1" : typeof matchMedia == "function" && matchMedia("(min-width: 1100px) and (min-height: 600px)").matches, !1),
        (I.hidden = !rT()));
    }
    (s.addEventListener("click", (W) => {
      let J = W.target.closest("button");
      if (!J || !s.contains(J)) return;
      if ((n.events.emit("ui:click", {}), J.dataset.q)) {
        ((i.quality = J.dataset.q), m("quality"), x(), cc(i));
        return;
      }
      if (J.dataset.v) {
        ((i.view = +J.dataset.v), m("view"), x(), cc(i));
        return;
      }
      if (J.dataset.m) {
        ((i.mode = J.dataset.m), x(), cc(i));
        return;
      }
      if (J.dataset.d) {
        ((i.difficulty = J.dataset.d), e.difficulty && e.difficulty(i.difficulty), x(), cc(i));
        return;
      }
      if (J.dataset.tab) {
        R(J.dataset.tab);
        return;
      }
      let G = J.dataset.act;
      G === "settings"
        ? w("settings")
        : G === "controls"
          ? w("controls")
          : G === "close-panel"
            ? S()
            : G === "invert"
              ? ((i.invertY = !i.invertY), m("invertY"), x(), cc(i))
              : G === "fullscreen"
                ? _()
                : G === "note"
                  ? (k(!I.classList.contains("open"), !0), (I.classList.contains("open") ? I.querySelector(".m-callout-x") : L).focus())
                  : G === "legacy"
                    ? ((J.disabled = !0), (J.textContent = "Loading version 8"), requestAnimationFrame(() => setTimeout(() => aT(n), 30)))
                    : G && e[G] && e[G](W);
    }),
      s.addEventListener("mouseover", (W) => {
        let J = W.target.closest("button");
        J && W.relatedTarget && !J.contains(W.relatedTarget) && n.events.emit("ui:hover", {});
      }),
      s.addEventListener("keydown", (W) => {
        if ((W.code === "Escape" && !a.hidden && (S(), W.stopPropagation(), W.preventDefault()), W.code === "Tab" && !a.hidden)) {
          let J = [...a.querySelectorAll("button, input")].filter((oe) => oe.offsetParent !== null);
          if (!J.length) return;
          let G = J[0],
            te = J[J.length - 1];
          W.shiftKey && document.activeElement === G
            ? (te.focus(), W.preventDefault())
            : !W.shiftKey && document.activeElement === te && (G.focus(), W.preventDefault());
        }
      }));
    let C = () => {
      let W = a.hidden ? s.querySelector(`.m-screen[data-s="${p}"]`) : a;
      return W ? [...W.querySelectorAll("button, input")].filter((J) => !J.disabled && J.offsetParent !== null) : [];
    };
    function A(W) {
      let J = C();
      if (!J.length) return;
      s.classList.add("pad-nav");
      let G = J.indexOf(document.activeElement);
      G = G < 0 ? (W > 0 ? 0 : J.length - 1) : (G + W + J.length) % J.length;
      try {
        (J[G].focus({ preventScroll: !1 }), J[G].scrollIntoView && J[G].scrollIntoView({ block: "nearest" }));
      } catch {}
      n.events.emit("ui:hover", {});
    }
    function F(W) {
      let J = document.activeElement;
      if (J && J.tagName === "INPUT" && J.type === "range" && s.contains(J)) {
        let G = (+J.step || 1) * (J.id === "s-vol" ? 5 : J.id === "s-sens" ? 2 : 1);
        ((J.value = String(Math.min(+J.max, Math.max(+J.min, +J.value + W * G)))), J.dispatchEvent(new Event("input", { bubbles: !0 })));
      } else A(W);
    }
    function H() {
      let W = s.querySelector(`.m-screen[data-s="${p}"] .btn.primary`);
      W && W.click();
    }
    function N() {
      let W = document.activeElement;
      W && W.tagName === "BUTTON" && s.contains(W) && W.offsetParent !== null ? W.click() : H();
    }
    s.addEventListener(
      "mousemove",
      () => {
        s.classList.toggle("pad-nav", !1);
      },
      { passive: !0 },
    );
    let Z = (W) => ((W = Math.max(0, Math.floor(W))), String(Math.floor(W / 60)).padStart(2, "0") + ":" + String(W % 60).padStart(2, "0")),
      Q = {
        root: s,
        settings: i,
        fmtTime: Z,
        get screen() {
          return p;
        },
        get panelOpen() {
          return !a.hidden;
        },
        closePanel: S,
        nav: A,
        adjust: F,
        accept: N,
        primary: H,
        show(W) {
          W !== p &&
            ((p = W),
            (s.dataset.screen = W),
            S(),
            s.classList.toggle("open", W !== "none"),
            W !== "none"
              ? (x(), setTimeout(z, 30))
              : document.activeElement && s.contains(document.activeElement) && document.activeElement.blur());
        },
        locationCard(W) {
          l.classList.toggle("on", !!W);
        },
        setLookMode(W) {
          c("lookmode").textContent = W || "";
        },
        setDead({ time: W, relays: J, total: G, holdout: te }) {
          ((c("dead-time").textContent = Z(W)),
            (c("dead-relays").textContent = `${J}/${G}`),
            te &&
              ((c("dead-wave").textContent = String(te.waves)),
              (c("dead-kills").textContent = String(te.kills)),
              (c("dead-score").textContent = te.score.toLocaleString("en-US")),
              (c("dead-best").textContent = te.best.toLocaleString("en-US") + (te.record ? "  NEW" : ""))));
        },
        setDebrief({ time: W, accuracy: J, kills: G, retries: te, rating: oe }) {
          ((c("time").textContent = Z(W)),
            (c("acc").textContent = J == null ? "\u2014" : Math.round(J * 100) + "%"),
            (c("kills").textContent = String(G)),
            (c("retries").textContent = String(te)),
            (c("rating").textContent = oe));
        },
        applySettings: m,
      };
    return (x(), Q);
  }
  export var xi = {
      introSeconds: 2.4,
      retryIntroSeconds: 1.1,
      interactRange: 2.2,
      interactFacing: 0.45,
      cutSeconds: 2.4,
      patrol: { gull: 2, hound: 1 },
      waves: [
        { gull: 3, hound: 1 },
        { gull: 3, hound: 2 },
        { gull: 4, hound: 3 },
      ],
      maxAlive: 9,
      spawnStagger: 0.85,
      spawnFar: 18,
      pursuitEvery: 7,
      pursuitMinAlive: 4,
      pursuitExtra: 5,
      titleSpeed: 1.15,
      titleFov: 50,
    },
    lb = {
      standard: { label: "Standard" },
      hard: {
        label: "Hard",
        gull: { hp: 55, boltDamage: 10, telegraph: 0.46, cooldown: [1.4, 2.5], spreadFar: 0.052, spreadNear: 0.016 },
        hound: {
          hp: 170,
          shotDamage: 8,
          burst: 5,
          cooldown: [1.4, 2.4],
          spreadFar: 0.095,
          spreadNear: 0.038,
          lungeDamage: 22,
          runSpeed: 5,
        },
        ai: { maxTokens: 3, maxTokensCrowd: 4, tokenGap: 0.85, exposureUp: 0.14 },
        player: { regenDelay: 5.5, regenRate: 16 },
        flow: {
          patrol: { gull: 3, hound: 2 },
          waves: [
            { gull: 4, hound: 2 },
            { gull: 5, hound: 3 },
            { gull: 6, hound: 4 },
          ],
          maxAlive: 11,
          pursuitEvery: 5.5,
          pursuitExtra: 8,
        },
      },
      brutal: {
        label: "Brutal",
        gull: { hp: 60, boltDamage: 13, telegraph: 0.38, cooldown: [1, 1.9], spreadFar: 0.042, spreadNear: 0.014 },
        hound: {
          hp: 200,
          shotDamage: 10,
          burst: 6,
          cooldown: [1, 1.9],
          spreadFar: 0.08,
          spreadNear: 0.032,
          lungeDamage: 30,
          runSpeed: 5.4,
        },
        ai: { maxTokens: 4, maxTokensCrowd: 5, tokenGap: 0.6, exposureUp: 0.18 },
        player: { regenDelay: 7, regenRate: 10 },
        flow: {
          patrol: { gull: 4, hound: 2 },
          waves: [
            { gull: 5, hound: 3 },
            { gull: 6, hound: 4 },
            { gull: 7, hound: 5 },
          ],
          maxAlive: 13,
          pursuitEvery: 4.5,
          pursuitExtra: 12,
        },
      },
    },
    cs = {
      firstDelay: 3.5,
      breather: 9,
      count: (n) => Math.min(5 + 2 * n, 30),
      houndShare: (n) => Math.min(0.45, 0.2 + 0.03 * n),
      stagger: (n) => Math.max(0.35, 0.9 - 0.04 * n),
      hp: (n) => Math.min(2.5, 1 + 0.07 * (n - 1)),
      dmg: (n) => Math.min(2, 1 + 0.05 * (n - 1)),
      cool: (n) => Math.max(0.6, 1 - 0.03 * (n - 1)),
      extraAlive: (n) => Math.min(5, Math.floor(n / 2)),
      resupply: 90,
      reserveCap: 240,
      heal: 35,
      killScore: { gull: 100, hound: 250 },
      waveBonus: 500,
      bestKey: "saltline.holdout.best",
    },
    dT = ["NORTH", "NORTH-EAST", "EAST", "SOUTH-EAST", "SOUTH", "SOUTH-WEST", "WEST", "NORTH-WEST"],
    Vu = {
      intro: "Breacher, this is Control. The Harbormaster holds the berth. Cut its three uplinks \u2014 yard, shed, quay.",
      contact: "It has seen you. Gulls fly, Hounds walk. Put them down.",
      cut: ["One relay dark. It felt that \u2014 machines inbound.", "Two dark. It is throwing everything it has left at you."],
      all: "All three dark. The boat is holding at the quay ladder, south end. Run.",
      low: "You are hit hard. Get behind steel and breathe.",
      done: "Breacher is aboard. Saltline is dark. Good work.",
    };
