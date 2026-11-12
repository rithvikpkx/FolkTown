import {
  type GameEvent,
  MAX_HEALTH,
  type MatchState,
  type PlayerState,
  WEAPONS,
} from '@folktown/shared';
import {
  ammoCue,
  DamageFx,
  HIT_MARKER_MS,
  type HitKind,
  healthSegments,
  hitMarkerKind,
  lowHealth,
} from './hud-fx';

const FEED_SECONDS = 5;
const FEED_MAX = 5;

export function killFeedLine(
  e: Extract<GameEvent, { type: 'kill' }>,
  nameOf: (id: number) => string,
): string {
  return `${nameOf(e.killer)}  [${e.weapon}]  ${nameOf(e.victim)}`;
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const CSS = `
.ft-hud{position:fixed;inset:0;pointer-events:none;font:600 16px 'Barlow Condensed','Arial Narrow',system-ui,sans-serif;color:#e8e4da;text-shadow:0 0 2px rgba(0,0,0,.75),0 1px 5px rgba(0,0,0,.55)}
.ft-hud .cross{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px}
.ft-hud .cross:before,.ft-hud .cross:after{content:"";position:absolute;background:#e8e4da;opacity:.85;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.ft-hud .cross:before{left:6px;top:0;width:2px;height:14px}.ft-hud .cross:after{top:6px;left:0;height:2px;width:14px}
.ft-hud .cross.ads{opacity:0}
.ft-hud .hitm{position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;opacity:0;transition:opacity .25s,transform .25s}
.ft-hud .hitm:before,.ft-hud .hitm:after{content:"";position:absolute;left:12px;top:-4px;width:2px;height:34px;background:#fff;transform:rotate(45deg);box-shadow:0 0 0 1px rgba(0,0,0,.35)}
.ft-hud .hitm:after{transform:rotate(-45deg)}.ft-hud .hitm.on{opacity:1;transition:none}
.ft-hud .hitm.head:before,.ft-hud .hitm.head:after{background:#ffb347}
.ft-hud .hitm.kill{transform:scale(1.5)}.ft-hud .hitm.kill:before,.ft-hud .hitm.kill:after{background:#ff5a40;width:3px}
.ft-hud .health{position:absolute;left:24px;bottom:24px}
.ft-hud .hp-row{display:flex;align-items:flex-end;gap:10px;margin-top:4px}
.ft-hud .hp-n{font:700 38px/.85 'Big Shoulders Display','Impact','Arial Narrow',sans-serif;min-width:1.6em}
.ft-hud .segs{display:flex;gap:3px;padding-bottom:3px}
.ft-hud .segs i{width:15px;height:5px;background:#e8e4da;box-shadow:0 0 2px rgba(0,0,0,.6)}
.ft-hud .segs i.off{background:transparent;box-shadow:inset 0 0 0 1px rgba(232,228,218,.24)}
.ft-hud .health.crit .hp-n{color:#ff5a40}.ft-hud .health.crit .segs i:not(.off){background:#ff5a40}
.ft-hud .k{font:600 11px/1 'Barlow Condensed',sans-serif;letter-spacing:.3em;text-transform:uppercase;color:rgba(232,228,218,.64)}
.ft-hud .ammo{position:absolute;right:28px;bottom:24px;text-align:right}
.ft-hud .ammo-n{font:700 64px/.8 'Big Shoulders Display','Impact','Arial Narrow',sans-serif;font-variant-numeric:tabular-nums}
.ft-hud .ammo-m{font:500 15px/1 ui-monospace,Menlo,monospace;padding-left:8px}.ft-hud .ammo-m:before{content:"/ ";opacity:.6}
.ft-hud .ammo.low .ammo-n{color:#ffb347}
.ft-hud .cue{height:16px;font:600 12px/16px 'Barlow Condensed',sans-serif;letter-spacing:.26em;text-transform:uppercase;color:#ffb347}
.ft-hud .cue.empty{color:#ff5a40;animation:ft-blink .7s steps(2,jump-none) infinite}
@keyframes ft-blink{0%{opacity:1}100%{opacity:.35}}
.ft-hud .wname{font:600 13px/1.4 'Barlow Condensed',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:rgba(232,228,218,.64)}
.ft-hud .feed{position:absolute;right:20px;top:16px;text-align:right;line-height:1.5}
.ft-hud .feed div{font:500 13px/1.5 'Barlow Condensed',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,228,218,.64);transition:opacity .5s}
.ft-hud .feed b{font-weight:600;color:#e8e4da}.ft-hud .feed em{font-style:normal;color:#ffb347;margin-left:10px}
.ft-hud .feed div.out{opacity:0}
.ft-hud .score{position:absolute;left:50%;top:12px;transform:translateX(-50%);text-align:center;letter-spacing:.08em}
.ft-hud .msg{position:absolute;left:0;right:0;top:38%;text-align:center;font-size:34px;letter-spacing:.2em;text-transform:uppercase}
.ft-hud .vig{position:absolute;inset:0;box-shadow:inset 0 0 140px 30px rgba(180,0,0,.9);opacity:0}
.ft-hud .arcs{position:absolute;inset:0}
.ft-hud .arc{position:absolute;left:50%;top:50%;width:min(72vh,94vw);aspect-ratio:1;transform:translate(-50%,-50%);opacity:0}
.ft-hud .arc svg{width:100%;height:100%;display:block;overflow:visible}
.ft-hud .arc path{fill:none;stroke:#ff5a40;stroke-width:4;opacity:.9}.ft-hud .arc path.tip{stroke-width:2.5}
`;

/** DOM heads-up display: health, ammo, crosshair, hit marker, damage arcs, kill feed, score and clock. */
export class Hud {
  private readonly root = document.createElement('div');
  private readonly el: Record<
    | 'cross'
    | 'hitm'
    | 'hp'
    | 'segs'
    | 'health'
    | 'ammo'
    | 'an'
    | 'am'
    | 'cue'
    | 'wname'
    | 'feed'
    | 'score'
    | 'msg'
    | 'vig',
    HTMLElement
  > = {} as never;
  private readonly segEls: HTMLElement[] = [];
  private readonly arcEls: HTMLElement[] = [];
  private readonly dmg = new DamageFx();
  private feed: { name: string; extra: string; ttl: number; el?: HTMLElement }[] = [];
  private hitTimer = 0;
  private low = 0;
  /** Victims hit in the head by the local player this frame batch, for the HEADSHOT tag. */
  private heads = new Set<number>();
  private last = { segs: -1, cue: '', an: -1, mag: -1, weapon: '' };

  constructor(
    private readonly selfId: number,
    private readonly nameOf: (id: number) => string,
    /** Where a shooter stands, for the damage direction arcs. */
    private readonly posOf: (id: number) => { x: number; z: number } | undefined = () => undefined,
  ) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    this.root.className = 'ft-hud';
    const arc =
      '<div class="arc"><svg viewBox="-100 -100 200 200"><path d="M -38 -84 A 92 92 0 0 1 38 -84"/><path class="tip" d="M -7 -97 L 0 -106 L 7 -97"/></svg></div>';
    this.root.innerHTML = `<div class="vig"></div><div class="arcs">${arc.repeat(4)}</div><div class="cross"></div><div class="hitm"></div>
      <div class="score"></div><div class="feed"></div>
      <div class="health"><div class="k">Vitals</div><div class="hp-row"><b class="hp-n"></b><div class="segs">${'<i></i>'.repeat(10)}</div></div></div>
      <div class="ammo"><div class="cue"></div><div><b class="ammo-n"></b><span class="ammo-m"></span></div><div class="wname"></div></div><div class="msg"></div>`;
    const q = (s: string) => this.root.querySelector(s) as HTMLElement;
    this.el = {
      cross: q('.cross'),
      hitm: q('.hitm'),
      hp: q('.hp-n'),
      segs: q('.segs'),
      health: q('.health'),
      ammo: q('.ammo'),
      an: q('.ammo-n'),
      am: q('.ammo-m'),
      cue: q('.cue'),
      wname: q('.wname'),
      feed: q('.feed'),
      score: q('.score'),
      msg: q('.msg'),
      vig: q('.vig'),
    };
    this.segEls.push(...(this.el.segs.children as unknown as HTMLElement[]));
    this.arcEls.push(...(this.root.querySelectorAll('.arc') as unknown as HTMLElement[]));
    document.body.appendChild(this.root);
  }

  /** React to the events of a frame. */
  onEvents(events: readonly GameEvent[]) {
    this.heads.clear();
    for (const e of events) {
      if (e.type === 'hit') {
        if (e.shooter === this.selfId) {
          if (e.headshot) this.heads.add(e.target);
          this.showHit(hitMarkerKind(!!e.headshot, false));
        }
        if (e.target === this.selfId) this.dmg.hit(e.damage, this.posOf(e.shooter));
      } else if (e.type === 'kill') {
        if (e.killer === this.selfId) this.showHit('kill');
        if (e.victim === this.selfId) this.dmg.reset();
        this.feed.push({
          name: killFeedLine(e, this.nameOf),
          extra: e.killer === this.selfId && this.heads.has(e.victim) ? 'Headshot' : '',
          ttl: FEED_SECONDS,
        });
        if (this.feed.length > FEED_MAX) this.feed.shift();
      }
    }
  }

  private showHit(kind: HitKind) {
    this.el.hitm.className = `hitm on ${kind}`;
    this.hitTimer = HIT_MARKER_MS[kind] / 1000;
  }

  update(dt: number, me: PlayerState, state: MatchState | null, ads: boolean) {
    this.hitTimer -= dt;
    if (this.hitTimer <= 0) this.el.hitm.classList.remove('on');

    // red screen edge: hurt pulse plus a steady glow at low health
    this.low +=
      (lowHealth(me.alive ? me.health / MAX_HEALTH : 1) - this.low) * (1 - Math.exp(-4 * dt));
    const arcs = this.dmg.update(dt, me.pos, me.yaw);
    this.el.vig.style.opacity = String(Math.max(this.dmg.pulse, this.low * 0.65));
    arcs.forEach((a, i) => {
      const el = this.arcEls[i] as HTMLElement;
      el.style.opacity = String(a.opacity);
      if (a.opacity > 0)
        el.style.transform = `translate(-50%,-50%) rotate(${Math.round(a.deg)}deg)`;
    });

    for (const f of this.feed) f.ttl -= dt;
    this.feed = this.feed.filter((f) => f.ttl > 0);
    this.el.feed.textContent = '';
    for (const f of this.feed) {
      const d = document.createElement('div');
      d.textContent = f.name;
      if (f.extra) {
        const em = document.createElement('em');
        em.textContent = f.extra;
        d.appendChild(em);
      }
      if (f.ttl < 0.6) d.className = 'out';
      this.el.feed.appendChild(d);
    }

    this.el.cross.classList.toggle('ads', ads && me.alive);
    const hp = Math.ceil(Math.max(0, me.health));
    this.el.hp.textContent = String(hp);
    const seg = healthSegments(me.health, MAX_HEALTH, this.segEls.length);
    if (seg.lit !== this.last.segs) {
      this.last.segs = seg.lit;
      this.segEls.forEach((e, i) => {
        e.classList.toggle('off', i >= seg.lit);
      });
      this.el.health.classList.toggle('crit', seg.crit);
    }
    const w = WEAPONS[me.weapon];
    const ammo = me.ammo[me.weapon];
    const cue = ammoCue(ammo, w.mag, me.reloadLeft > 0);
    this.el.an.textContent = String(ammo).padStart(2, '0');
    if (w.mag !== this.last.mag) {
      this.last.mag = w.mag;
      this.el.am.textContent = String(w.mag);
    }
    if (me.weapon !== this.last.weapon) {
      this.last.weapon = me.weapon;
      this.el.wname.textContent = me.weapon;
    }
    this.el.cue.textContent = cue.text;
    this.el.cue.className = `cue${cue.level === 'empty' ? ' empty' : ''}`;
    this.el.ammo.classList.toggle('low', cue.level === 'low' || cue.level === 'empty');

    if (state) {
      const mode =
        state.config.mode === 'tdm'
          ? `Team ${state.teamScores[0]} : ${state.teamScores[1]}   `
          : '';
      this.el.score.textContent = `${mode}Kills ${me.kills}   Deaths ${me.deaths}   ${formatClock(state.config.timeLimit - state.time)}`;
      if (state.ended) {
        const won = state.config.mode === 'tdm' ? state.winner === me.team : state.winner === me.id;
        this.el.msg.textContent = state.winner === null ? 'Draw' : won ? 'Victory' : 'Defeat';
        return;
      }
    }
    this.el.msg.textContent = me.alive ? '' : `Respawning in ${Math.ceil(me.respawnIn)}`;
  }
}
