import { Vector3 as K } from 'three';
import { hT, xi, lb, cs, dT, Vu } from './hud.js';
import { at } from './fx.js';
import { Hn, ou, Is, j0 } from './common.js';
import { __late as __late_audio } from './audio.js';
__late_audio.pT(pT);

export function pT(n) {
    let e = (n.render && n.render.post) || {},
      t = typeof e.saturation == "number" ? e.saturation : 1,
      i = n.player,
      s = n.level,
      o = n.hud,
      r = n.input,
      a = (Y, he, ...V) => {
        try {
          if (Y && typeof Y[he] == "function") return Y[he](...V);
        } catch (ne) {
          console.error(`[game] ${he} threw`, ne);
        }
      },
      l = hT(n, {
        difficulty(Y) {
          h(Y);
        },
        deploy() {
          (a(n.audio, "resume"), r.requestLock(), G({}));
        },
        resume() {
          xe(!0);
        },
        restart() {
          (a(n.audio, "resume"), r.requestLock(), g.retries++, G({ quick: !0, keepRetries: !0 }));
        },
        retry() {
          (a(n.audio, "resume"), r.requestLock(), g.retries++, G({ quick: !0, keepRetries: !0 }));
        },
        redeploy() {
          (a(n.audio, "resume"), r.requestLock(), G({ quick: !0 }));
        },
      });
    l.applySettings();
    let c = (Y) => JSON.parse(JSON.stringify(Y)),
      u = () => (n.enemies && n.enemies.TUNE) || null,
      f = { flow: c(xi), player: i.tuning ? c(i.tuning) : null, enemies: null };
    function h(Y) {
      let he = lb[Y] || lb.hard,
        V = u();
      V && !f.enemies && (f.enemies = c(V));
      let ne = (ye, Te, Re) => {
        if (!(!ye || !Te)) {
          for (let Ue in Te)
            (typeof Te[Ue] != "object" || Array.isArray(Te[Ue])) && (ye[Ue] = Array.isArray(Te[Ue]) ? Te[Ue].slice() : Te[Ue]);
          for (let Ue in Re || {}) ye[Ue] = Array.isArray(Re[Ue]) ? Re[Ue].slice() : Re[Ue];
        }
      };
      (V && (ne(V, f.enemies, he.ai), ne(V.gull, f.enemies.gull, he.gull), ne(V.hound, f.enemies.hound, he.hound)),
        ne(i.tuning, f.player, he.player),
        Object.assign(xi, c(f.flow), c(he.flow || {})),
        (C.difficulty = lb[Y] ? Y : "hard"));
    }
    let p = () => g.mode === "holdout",
      d = (Y) => Math.round(Y).toLocaleString("en-US");
    function m() {
      p() && o.setTally && o.setTally(g.wave > 0 ? `Wave ${g.wave} \xB7 ${d(g.score)}` : "Stand by");
    }
    function x() {
      let Y = ++g.wave,
        he = u();
      if ((h(C.difficulty), he)) {
        let ze = cs.hp(Y),
          Ge = cs.dmg(Y),
          _e = cs.cool(Y);
        ((he.gull.hp = Math.round(he.gull.hp * ze)),
          (he.hound.hp = Math.round(he.hound.hp * ze)),
          (he.gull.boltDamage *= Ge),
          (he.hound.shotDamage *= Ge),
          (he.hound.lungeDamage *= Ge),
          (he.gull.cooldown = he.gull.cooldown.map((Ne) => Ne * _e)),
          (he.hound.cooldown = he.hound.cooldown.map((Ne) => Ne * _e)));
      }
      xi.maxAlive += cs.extraAlive(Y);
      let V = cs.count(Y),
        ne = Math.round(V * cs.houndShare(Y)),
        ye = [];
      for (let ze = 0; ze < V; ze++) ye.push("gull");
      for (let ze = 0; ze < ne; ze++) ye[Math.min(V - 1, 1 + Math.floor((ze * V) / Math.max(1, ne)))] = "hound";
      let Te = 0,
        Re = 0,
        Ue = cs.stagger(Y);
      (ye.forEach((ze, Ge) => {
        let _e = O(ze);
        ((Te += _e.x - i.pos.x), (Re += _e.z - i.pos.z), g.queue.push({ type: ze, pos: _e, at: g.time + 1.2 + Ge * Ue }));
      }),
        (g.waveOn = !0),
        (g.waveHot = 30));
      let Ve = ((Math.atan2(Te, -Re) * 180) / Math.PI + 360) % 360;
      (o.warn && o.warn(`Wave ${Y} \u2014 ${dT[Math.round(Ve / 45) % 8]}`, 3.6),
        o.setObjective("Hold the berth"),
        m(),
        n.events.emit("holdout:wave", { wave: Y, count: V }));
    }
    function v() {
      ((g.waveOn = !1), (g.wavesCleared = g.wave), (g.breakT = cs.breather), (g.score += cs.waveBonus * g.wave));
      try {
        let Y = n.weapon.slots && n.weapon.slots[0];
        Y && Number.isFinite(Y.reserve) && (Y.reserve = Math.min(cs.reserveCap, Y.reserve + cs.resupply));
      } catch {}
      (i.heal(cs.heal),
        g.wave % 2 === 0 && a(n.explosives, "reset"),
        o.radio && o.radio(`Wave ${g.wave} down. Resupply dropped \u2014 ${cs.breather} seconds.`, 3.4),
        o.setObjective("Catch your breath"),
        m(),
        n.events.emit("objective:done", { id: "wave", index: g.wave, total: g.wave }));
    }
    function y(Y) {
      g.waveOn
        ? !g.queue.length && se() === 0 && v()
        : ((g.breakT -= Y),
          g.breakT <= 0
            ? x()
            : g.wave > 0 &&
              g.breakT < 3.05 &&
              Math.ceil(g.breakT) !== Math.ceil(g.breakT + Y) &&
              o.message(`Wave ${g.wave + 1} in ${Math.ceil(g.breakT)}`, 1));
    }
    n.events.on("enemy:killed", (Y) => {
      !p() || C.state !== "playing" || (g.kills++, (g.score += (cs.killScore[Y && Y.type] || 100) * (1 + 0.1 * (g.wave - 1))), m());
    });
    function b() {
      let Y = 0;
      try {
        Y = +localStorage.getItem(cs.bestKey) || 0;
      } catch {}
      let he = Math.round(g.score),
        V = he > Y;
      if (V) {
        Y = he;
        try {
          localStorage.setItem(cs.bestKey, String(Y));
        } catch {}
      }
      return { waves: g.wavesCleared, kills: g.kills, score: he, best: Y, record: V };
    }
    let g = {
        time: 0,
        retries: 0,
        relays: [],
        cut: 0,
        allCut: !1,
        queue: [],
        waveHot: 0,
        alertT: 0,
        pursuitT: 0,
        pursuitLeft: 0,
        contactSaid: !1,
        lowSaid: !1,
        extractHint: 0,
        intensity: 0.15,
        used: new Map(),
        mode: "mission",
        wave: 0,
        waveOn: !1,
        breakT: 0,
        score: 0,
        kills: 0,
        wavesCleared: 0,
      },
      E = 0,
      M = xi.introSeconds,
      _ = !1,
      T = !1,
      w = 0,
      S = 0,
      R = !1,
      z = "",
      I = 0.8,
      L = new K(),
      U = new K(),
      k = () => (s && s.objectives) || [],
      C = {
        state: "title",
        flow: xi,
        run: g,
        menus: l,
        holdout: cs,
        difficulty: "hard",
        setDifficulty: (Y) => h(Y),
        start(Y = {}) {
          G({ skipIntro: !!Y.skipIntro, quick: !!Y.quick, mode: Y.mode || (n.params.mode === "holdout" ? "holdout" : null) });
        },
        pause() {
          le();
        },
        resume() {
          xe(!1);
        },
        update: re,
        debugCut() {
          let Y = g.relays.find((he) => !he.cut);
          Y && ce(Y);
        },
      };
    function A(Y) {
      let he = C.state;
      Y !== he && ((C.state = Y), (E = 0), n.events.emit("game:state", { state: Y, prev: he }));
    }
    let F = { pos: [], look: [], len: 1, t: 0 };
    function H() {
      let Y = (s && s.cinematicPath) || [];
      if (((F.pos = Y.map((V) => new K(...V.pos))), (F.look = Y.map((V) => new K(...V.look))), F.pos.length < 2)) {
        let V = (s && s.playerStart && s.playerStart.pos) || new K();
        ((F.pos = [new K(V.x, 2.2, V.z), new K(V.x + 8, 2, V.z)]), (F.look = [new K(V.x + 30, 2.5, V.z - 2), new K(V.x + 40, 3, V.z - 2)]));
      }
      let he = 0;
      for (let V = 1; V < F.pos.length; V++) he += F.pos[V].distanceTo(F.pos[V - 1]);
      F.len = Math.max(he, 4);
    }
    function N(Y, he, V) {
      let ne = Y.length - 1,
        ye = Hn(he, 0, 1) * ne,
        Te = Math.min(ne - 1, Math.floor(ye)),
        Re = ye - Te,
        Ue = Y[Math.max(0, Te - 1)],
        Ve = Y[Te],
        ze = Y[Te + 1],
        Ge = Y[Math.min(ne, Te + 2)],
        _e = Re * Re,
        Ne = _e * Re,
        ke = (je, Ze, qe, Oe) =>
          0.5 * (2 * Ze + (-je + qe) * Re + (2 * je - 5 * Ze + 4 * qe - Oe) * _e + (-je + 3 * Ze - 3 * qe + Oe) * Ne);
      return V.set(ke(Ue.x, Ve.x, ze.x, Ge.x), ke(Ue.y, Ve.y, ze.y, Ge.y), ke(Ue.z, Ve.z, ze.z, Ge.z));
    }
    function Z(Y) {
      let he = Math.max(26, F.len / xi.titleSpeed);
      ((F.t += Y), F.t >= he && (F.t = 0));
      let V = F.t / he,
        ne = V * V * (3 - 2 * V) * 0.25 + V * 0.75,
        ye = n.camera,
        Te = n.time.t;
      (N(F.pos, ne, L),
        N(F.look, ne, U),
        (L.x += Math.sin(Te * 0.31) * 0.05),
        (L.y += Math.sin(Te * 0.43 + 1.7) * 0.035),
        (L.z += Math.sin(Te * 0.27 + 0.6) * 0.05),
        (U.y += Math.sin(Te * 0.19) * 0.12),
        (U.x += Math.sin(Te * 0.13 + 2) * 0.2),
        ye.position.copy(L),
        ye.lookAt(U),
        (ye.rotation.z += Math.sin(Te * 0.21) * 0.006),
        !n.params.fov && Math.abs(ye.fov - xi.titleFov) > 0.01 && ((ye.fov = xi.titleFov), ye.updateProjectionMatrix()),
        (e.fade = Math.max(1 - ou(0, 1.8, F.t), ou(he - 1.6, he, F.t))));
    }
    function Q() {
      if (
        (a(n.enemies, "clear"),
        a(n.fx, "clear"),
        a(n.combat, "reset"),
        a(n.weapon, "reset"),
        a(n.explosives, "reset"),
        (g.time = 0),
        (g.cut = 0),
        (g.allCut = !1),
        (g.queue.length = 0),
        (g.waveHot = 0),
        (g.alertT = 0),
        (g.pursuitT = 0),
        (g.pursuitLeft = 0),
        (g.contactSaid = !1),
        (g.lowSaid = !1),
        (g.extractHint = 0),
        g.used.clear(),
        (g.wave = 0),
        (g.waveOn = !1),
        (g.breakT = cs.firstDelay),
        (g.score = 0),
        (g.kills = 0),
        (g.wavesCleared = 0),
        h(C.difficulty),
        (g.relays = k().map((Y, he) => {
          let V = (/([a-z0-9])$/i.exec(String(Y.id || "")) || [0, String.fromCharCode(65 + he)])[1].toUpperCase();
          return (W(Y, "live"), { o: Y, id: Y.id || "relay_" + he, short: V, t: 0, cut: !1, cutting: !1 });
        })),
        i.reset(s.playerStart),
        o.reset && o.reset(),
        (e.saturation = t),
        (e.flash = 0),
        p())
      ) {
        for (let Y of g.relays) W(Y.o, "cut");
        g.relays = [];
      }
      (J(), o.setRelays && o.setRelays(0, g.relays.length), o.setTally && o.setTally(p() ? "Stand by" : null), p() || ue());
    }
    function W(Y, he) {
      try {
        let V = Y && Y.object && Y.object.userData;
        V && typeof V.setState == "function" && V.setState(he);
      } catch (V) {
        console.error("[game] relay setState threw", V);
      }
    }
    function J() {
      if (!o.setMarkers) return;
      let Y = g.relays
        .filter((he) => !he.cut)
        .map((he) => ({ id: he.id, short: he.short, label: he.o.label || "Relay " + he.short, pos: he.o.pos, kind: "relay" }));
      (g.allCut && s.extraction && Y.push({ id: "extract", short: "EX", label: "Boat", pos: s.extraction.pos, kind: "extract" }),
        o.setMarkers(Y));
    }
    function G({ skipIntro: Y = !1, quick: he = !1, keepRetries: V = !1, mode: ne = null } = {}) {
      if (
        ((g.mode = ne || (V || he ? g.mode : l.settings.mode) || "mission"),
        V || (g.retries = 0),
        l.show("none"),
        l.locationCard(!1),
        a(n.audio, "setPaused", !1),
        Q(),
        a(n.weapon, "setVisible", !0),
        (R = !1),
        Y)
      ) {
        ((e.fade = 0), te());
        return;
      }
      ((M = he ? xi.retryIntroSeconds : xi.introSeconds),
        (_ = he),
        (T = he),
        (i.enabled = !0),
        r.setGameplay && r.setGameplay(!0),
        o.show(!0),
        o.setObjective(oe()),
        (e.fade = 1),
        a(n.audio, "setIntensity", 0.15),
        A("intro"));
    }
    function te() {
      ((i.enabled = !0), o.show(!0), r.setGameplay && r.setGameplay(!0), o.setObjective(oe()), A("playing"), ee(!0));
    }
    function oe() {
      if (p()) return g.waveOn ? "Hold the berth" : g.wave ? "Catch your breath" : "Machines inbound";
      if (g.allCut) return "Get to the boat";
      let Y = g.relays.length - g.cut;
      return g.cut === 0 ? "Cut the three uplink relays" : Y === 1 ? "Cut the last relay" : `Cut the remaining ${Y} relays`;
    }
    function ee(Y) {
      let he = r.describeMode ? r.describeMode() : "";
      if ((l.setLookMode(he), !(!Y && he === z))) {
        if (((z = he), r.device === "pad")) {
          o.message("", 0);
          return;
        }
        C.state === "playing" && (r.mode === "drag" || (r.mode === "lock" && !r.locked && !n.params.shot && !n.params.autostart))
          ? o.message(he, r.mode === "drag" ? 7 : 4)
          : C.state === "playing" && r.locked && o.message("", 0);
      }
    }
    (r.onModeChange && r.onModeChange(() => ee(!1)),
      n.events.on("input:lock", (Y) => {
        if (Y.locked) {
          ((R = !0), ee(!1));
          return;
        }
        ((C.state === "playing" || C.state === "intro") && R && le(), (R = !1));
      }),
      document.addEventListener("visibilitychange", () => {
        document.hidden && (C.state === "playing" || C.state === "intro") && le();
      }),
      addEventListener("keydown", (Y) => {
        C.state !== "title" ||
          l.panelOpen ||
          (Y.code !== "Enter" && Y.code !== "NumpadEnter") ||
          (Y.target && Y.target.tagName === "BUTTON") ||
          (a(n.audio, "resume"), r.requestLock(), G({}));
      }));
    function le() {
      (C.state === "intro" && (l.locationCard(!1), (e.fade = 0), A("playing")),
        C.state === "playing" &&
          (r.setGameplay && r.setGameplay(!1),
          r.exitLock(),
          a(n.audio, "setPaused", !0),
          l.setLookMode(r.mode === "drag" ? r.describeMode() : r.touch ? "" : "Resume recaptures the mouse."),
          o.show(!1),
          l.show("paused"),
          (w = 0.35),
          A("paused")));
    }
    function xe(Y) {
      C.state === "paused" &&
        (l.show("none"),
        a(n.audio, "setPaused", !1),
        o.show(!0),
        r.setGameplay && r.setGameplay(!0),
        (R = !1),
        r.requestLock(),
        A("playing"),
        setTimeout(() => ee(!0), 700));
    }
    function j(Y) {
      let he = Y === "gull" ? "air" : "ground",
        V = (s && s.enemySpawns) || [],
        ne = V.filter((ye) => ye.type === he);
      return ne.length ? ne : V;
    }
    function O(Y, { minDist: he = xi.spawnFar, from: V = i.pos, preferHidden: ne = !0 } = {}) {
      let ye = j(Y),
        Te = null,
        Re = -1e9;
      for (let Ve of ye) {
        let ze = Math.hypot(Ve.pos.x - V.x, Ve.pos.z - V.z),
          Ge = n.rng() * 1.5;
        if (((Ge += ze >= he ? 2 + Math.min(1, (ze - he) / 30) * 0.5 : -(he - ze) / 4), ne)) {
          (L.copy(Ve.pos), (L.y += Y === "gull" ? 0 : 1));
          let Ne = !0;
          try {
            Ne = n.physics.lineOfSight(L, i.eye);
          } catch {}
          Ne || (Ge += 2.5);
        }
        let _e = g.used.get(Ve);
        (_e !== void 0 && g.time - _e < 6 && (Ge -= 3), Ge > Re && ((Re = Ge), (Te = Ve)));
      }
      let Ue = new K();
      if (Te) {
        (g.used.set(Te, g.time), Ue.copy(Te.pos));
        let Ve = (n.rng() - 0.5) * 2.4,
          ze = (n.rng() - 0.5) * 2.4,
          Ge = Y === "gull";
        try {
          Ge || (Ge = n.physics.nav.isWalkable(Ue.x + Ve, Ue.z + ze));
        } catch {
          Ge = !1;
        }
        Ge && ((Ue.x += Ve), (Ue.z += ze));
      } else {
        let Ve = n.rng() * Math.PI * 2;
        Ue.set(Hn(V.x + Math.cos(Ve) * 26, -34, 26), 0, Hn(V.z + Math.sin(Ve) * 26, -26, 24));
      }
      return (Y === "gull" && Ue.y < 2.5 && (Ue.y = 6 + n.rng() * 3), Ue);
    }
    function q(Y, he, V) {
      let ne = null;
      try {
        ne = n.enemies.spawn(Y, he, V);
      } catch (ye) {
        console.error("[game] enemies.spawn threw", ye);
      }
      return ne;
    }
    function ue() {
      let Y = (s.playerStart && s.playerStart.pos) || i.pos;
      for (let he of ["gull", "hound"])
        for (let V = 0; V < xi.patrol[he]; V++) q(he, O(he, { minDist: 32, from: Y, preferHidden: !0 }), { state: "patrol" });
    }
    function de(Y) {
      let he = xi.waves[Math.min(Y, xi.waves.length - 1)],
        V = [];
      for (let Re = 0; Re < he.gull; Re++) V.push("gull");
      for (let Re = 0; Re < he.hound; Re++) V.splice(Math.min(V.length, 1 + Re * 2), 0, "hound");
      let ne = 0,
        ye = 0;
      (V.forEach((Re, Ue) => {
        let Ve = O(Re);
        ((ne += Ve.x - i.pos.x), (ye += Ve.z - i.pos.z), g.queue.push({ type: Re, pos: Ve, at: g.time + 1.6 + Ue * xi.spawnStagger }));
      }),
        (g.waveHot = 30));
      let Te = ((Math.atan2(ne, -ye) * 180) / Math.PI + 360) % 360;
      o.warn && o.warn("Contact \u2014 " + dT[Math.round(Te / 45) % 8], 3.4);
    }
    function $(Y) {
      let he = se();
      for (let V = 0; V < g.queue.length; V++) {
        let ne = g.queue[V];
        if (g.time < ne.at) continue;
        if (he >= xi.maxAlive) {
          ne.at = g.time + 1;
          continue;
        }
        if (!q(ne.type, ne.pos, { state: "alert", target: i.pos }) && !n.enemies.stub && (ne.tries = (ne.tries || 0) + 1) < 6) {
          ne.at = g.time + 1.5;
          continue;
        }
        (g.queue.splice(V, 1), a(n.enemies, "alert", i.pos, 60));
        break;
      }
      if (g.allCut) {
        if (((g.pursuitT -= Y), g.pursuitT <= 0 && g.pursuitLeft > 0 && !g.queue.length && he < xi.pursuitMinAlive)) {
          ((g.pursuitT = xi.pursuitEvery), g.pursuitLeft--);
          let V = n.rng() < 0.6 ? "gull" : "hound";
          g.queue.push({ type: V, pos: O(V), at: g.time + 0.5 });
        }
        g.pursuitT <= 0 && ((g.pursuitT = 4), a(n.enemies, "alert", i.pos, 90));
      }
    }
    function se() {
      try {
        return n.enemies.aliveCount ? n.enemies.aliveCount() : n.enemies.list.filter((Y) => Y.alive).length;
      } catch {
        return 0;
      }
    }
    function fe(Y) {
      let he = (n.enemies && n.enemies.list) || [];
      for (let V = 0; V < he.length; V++) {
        let ne = he[V];
        if (ne && ne.alive && ne.pos && Math.hypot(ne.pos.x - i.pos.x, ne.pos.z - i.pos.z) < Y) return !0;
      }
      return !1;
    }
    (n.events.on("enemy:alert", () => {
      ((g.alertT = 10), C.state === "playing" && !g.contactSaid && ((g.contactSaid = !0), o.radio && o.radio(Vu.contact, 3.2)));
    }),
      n.events.on("player:hit", () => {
        g.alertT = Math.max(g.alertT, 8);
      }),
      n.events.on("player:rescued", () => {
        C.state === "playing" && o.message("Hauled out of the water", 2.5);
      }));
    function me() {
      let Y = null,
        he = xi.interactRange;
      for (let V of g.relays) {
        if (V.cut) continue;
        let ne = V.o.pos.x - i.pos.x,
          ye = V.o.pos.z - i.pos.z,
          Te = Math.hypot(ne, ye);
        Te > he ||
          Math.abs((V.o.pos.y || 0) - i.pos.y) > 2.5 ||
          (Te > 0.9 &&
            (ne * i.forward.x + ye * i.forward.z) / (Te * Math.max(0.2, Math.hypot(i.forward.x, i.forward.z))) < xi.interactFacing) ||
          ((Y = V), (he = Te));
      }
      return Y;
    }
    function ge(Y) {
      let he = i.alive ? me() : null;
      for (let ne of g.relays)
        ne.cut ||
          (ne === he && r.down("interact")
            ? (ne.cutting || ((ne.cutting = !0), W(ne.o, "cutting")),
              (ne.t += Y / xi.cutSeconds),
              n.events.emit("objective:progress", { id: ne.id, t: Math.min(1, ne.t) }),
              ne.t >= 1 && ce(ne))
            : ne.t > 0 &&
              ((ne.t = Math.max(0, ne.t - Y * 1.6)),
              ne.cutting && ((ne.cutting = !1), W(ne.o, "live"), n.events.emit("objective:progress", { id: ne.id, t: 0 }))));
      he && !he.cut ? o.setPrompt && o.setPrompt("Cut relay " + he.short, Is(he.t)) : o.setPrompt && o.setPrompt(null);
      let V = s.extraction;
      if (V && V.pos) {
        let ne = Math.hypot(V.pos.x - i.pos.x, V.pos.z - i.pos.z),
          ye = ne < (V.radius || 2.5) && Math.abs(V.pos.y - i.pos.y) < 3.5;
        (ye && g.allCut && i.alive && !p()
          ? P()
          : ye &&
            !g.allCut &&
            !p() &&
            g.extractHint <= 0 &&
            ((g.extractHint = 8), o.message("Relays still live \u2014 the boat will not wait under fire", 3.5)),
          (g.extractHint = Math.max(0, g.extractHint - Y)));
      }
    }
    function ce(Y) {
      ((Y.cut = !0), (Y.cutting = !1), (Y.t = 1), g.cut++, W(Y.o, "cut"));
      let he = g.relays.length;
      (n.events.emit("objective:done", { id: Y.id, index: g.cut, total: he }),
        o.setRelays && o.setRelays(g.cut, he),
        o.setPrompt && o.setPrompt(null),
        i.addShake(0.18),
        de(g.cut - 1),
        g.cut >= he
          ? ((g.allCut = !0),
            (g.pursuitLeft = xi.pursuitExtra),
            (g.pursuitT = 12),
            n.events.emit("objective:all", {}),
            o.radio && o.radio(Vu.all, 4.5))
          : o.radio && o.radio(Vu.cut[Math.min(g.cut - 1, Vu.cut.length - 1)], 3.6),
        o.setObjective(oe()),
        J());
    }
    n.events.on("player:dead", () => {
      (C.state !== "playing" && C.state !== "paused") ||
        (r.setGameplay && r.setGameplay(!1),
        r.exitLock(),
        o.setPrompt && o.setPrompt(null),
        o.show(!1),
        o.clearRadio && o.clearRadio(),
        l.setDead({ time: g.time, relays: g.cut, total: g.relays.length, holdout: p() ? b() : null }),
        A("dead"));
    });
    function P() {
      ((i.invulnerable = !0),
        (i.enabled = !1),
        r.setGameplay && r.setGameplay(!1),
        r.exitLock(),
        o.setPrompt && o.setPrompt(null),
        o.show(!1),
        n.events.emit("extraction:reached", {}),
        o.clearRadio && o.clearRadio(),
        o.radio && o.radio(Vu.done, 2.2));
      let Y = (n.combat && n.combat.stats) || { shots: 0, hits: 0, kills: 0 },
        he = Y.shots > 0 ? Hn(Y.hits / Y.shots, 0, 1) : null,
        V = (g.time < 270 ? 2 : g.time < 400 ? 1 : 0) + (he >= 0.5 ? 2 : he >= 0.3 ? 1 : 0) + (g.retries === 0 ? 1 : 0),
        ne = ["Messy", "Loud", "Steady", "Clean", "Sharp", "Surgical"][V];
      (l.setDebrief({ time: g.time, accuracy: he, kills: Y.kills || 0, retries: g.retries, rating: ne }), A("complete"));
    }
    let D = 0;
    function B(Y) {
      if (r.device !== "pad") {
        r.assist = 1;
        return;
      }
      if (((D -= Y), D <= 0)) {
        D = 0.05;
        let he = !1;
        try {
          let V = n.enemies.raycast(i.eye, n.camera.getWorldDirection(L), 60);
          V && (he = !n.physics.raycast(i.eye, L, V.dist));
        } catch {}
        B.target = he ? 0.55 : 1;
      }
      r.assist = j0(r.assist || 1, B.target || 1, 14, Y);
    }
    (n.events.on("weapon:fire", (Y) => {
      r.rumble && r.rumble(Y && Y.weapon === "pistol" ? 0.35 : 0.18, Y && Y.weapon === "pistol" ? 0.6 : 0.5, 55);
    }),
      n.events.on("player:hit", (Y) => {
        r.rumble && r.rumble(Math.min(1, 0.45 + (Y.amount || 0) / 30), 0.3, 160);
      }),
      n.events.on("explosion", (Y) => {
        if (!Y || !Y.pos) return;
        let he = i.pos.distanceTo(Y.pos),
          V = Is(1 - he / 22) * Math.min(1.2, Y.size || 1);
        V > 0.05 && r.rumble && r.rumble(Math.min(1, V), Math.min(1, V * 0.8), 240 + 200 * V);
      }),
      n.events.on("input:device", () => {
        ee(!0);
      }));
    function X() {
      !r.uiPressed ||
        l.screen === "none" ||
        (r.uiPressed("up") ? l.nav(-1) : r.uiPressed("down") && l.nav(1),
        r.uiPressed("left") ? l.adjust(-1) : r.uiPressed("right") && l.adjust(1),
        r.uiPressed("accept")
          ? l.accept()
          : r.uiPressed("back")
            ? !l.closePanel() && C.state === "paused" && xe(!1)
            : r.uiPressed("start") && C.state !== "paused" && (l.closePanel(), l.primary()));
    }
    function re(Y) {
      switch (((E += Y), X(), C.state)) {
        case "title":
          return (Z(Y), !1);
        case "intro":
          return (
            (e.fade = 1 - ou(0.05, Math.min(M, 1.3), E)),
            !_ && E > 0.25 && ((_ = !0), l.locationCard(!0)),
            !T && E > 0.9 && ((T = !0), o.radio && o.radio(Vu.intro, 4.2)),
            r.pressed("pause") ? (le(), !1) : (E >= M && (l.locationCard(!1), (e.fade = 0), te()), !0)
          );
        case "playing": {
          if (((g.time += Y), (e.fade = j0(e.fade || 0, 0, 6, Y)), w > 0 && (w -= Y), r.pressed("pause"))) return (le(), !1);
          if ((ge(Y), C.state !== "playing")) return !0;
          ($(Y), p() && y(Y), (g.alertT = Math.max(0, g.alertT - Y)), (g.waveHot = Math.max(0, g.waveHot - Y)));
          let he = se();
          g.waveHot > 0 && he === 0 && !g.queue.length && g.waveHot < 24 && (g.waveHot = 0);
          let V = g.allCut || g.queue.length || (g.waveHot > 0 && he > 0) ? 1 : g.alertT > 0 || (he > 0 && fe(26)) ? 0.6 : 0.15;
          return (
            V !== g.intensity && ((g.intensity = V), a(n.audio, "setIntensity", V)),
            r.mode === "lock" && !r.locked && !r.touch && r.device !== "pad" && !n.params.shot && !n.params.autostart
              ? ((I -= Y), I <= 0 && ((I = 6), o.message(r.describeMode(), 2.6)))
              : (I = 1.5),
            B(Y),
            !g.lowSaid && i.alive && i.health < 30 && ((g.lowSaid = !0), o.radio && o.radio(Vu.low, 3)),
            !0
          );
        }
        case "paused":
          return (w > 0 ? (w -= Y) : r.pressed("pause") && (l.closePanel() || xe(!1)), !1);
        case "dead":
          return (
            (e.saturation = j0(e.saturation ?? 1, 0.12, 2.2, Y)),
            (e.fade = j0(e.fade || 0, 0.55, 1.4, Y)),
            E > 1.5 && l.screen !== "dead" && (l.show("dead"), a(n.audio, "setIntensity", 0.15)),
            !0
          );
        case "complete":
          return (
            (e.fade = j0(e.fade || 0, 0.72, 0.9, Y)),
            (e.saturation = j0(e.saturation ?? 1, t * 0.7, 1, Y)),
            E > 3.3 && l.screen !== "complete" && (l.show("complete"), a(n.audio, "setIntensity", 0.15)),
            !0
          );
      }
      return !1;
    }
    return (
      H(),
      h(l.settings.difficulty),
      (i.enabled = !1),
      o.show(!1),
      a(n.weapon, "setVisible", !1),
      r.setGameplay && r.setGameplay(!1),
      a(n.audio, "setIntensity", 0.15),
      n.params.shot || n.params.autostart || l.show("title"),
      C
    );
  }
