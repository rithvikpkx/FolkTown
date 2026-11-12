import {
  type GameEvent,
  MAX_HEALTH,
  type MatchState,
  type PlayerState,
  WEAPONS,
} from '@folktown/shared';

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
.ft-hud{position:fixed;inset:0;pointer-events:none;font:600 16px system-ui,sans-serif;color:#fff;text-shadow:0 1px 3px #000}
.ft-hud .cross{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px}
.ft-hud .cross:before,.ft-hud .cross:after{content:"";position:absolute;background:#fff;opacity:.85}
.ft-hud .cross:before{left:6px;top:0;width:2px;height:14px}.ft-hud .cross:after{top:6px;left:0;height:2px;width:14px}
.ft-hud .cross.ads{opacity:0}
.ft-hud .hitm{position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;opacity:0;transition:opacity .25s}
.ft-hud .hitm:before,.ft-hud .hitm:after{content:"";position:absolute;left:12px;top:-4px;width:2px;height:34px;background:#fff;transform:rotate(45deg)}
.ft-hud .hitm:after{transform:rotate(-45deg)}.ft-hud .hitm.on{opacity:1;transition:none}.ft-hud .hitm.head:before,.ft-hud .hitm.head:after{background:#ff4a3a}
.ft-hud .health{position:absolute;left:24px;bottom:24px;width:220px}
.ft-hud .bar{height:10px;background:rgba(0,0,0,.5);border-radius:5px;overflow:hidden;margin-top:4px}
.ft-hud .bar i{display:block;height:100%;background:#7bd36b}
.ft-hud .ammo{position:absolute;right:28px;bottom:24px;text-align:right;font-size:34px}
.ft-hud .ammo small{display:block;font-size:14px;opacity:.8}
.ft-hud .feed{position:absolute;right:20px;top:16px;text-align:right;line-height:1.5}
.ft-hud .score{position:absolute;left:50%;top:12px;transform:translateX(-50%);text-align:center}
.ft-hud .msg{position:absolute;left:0;right:0;top:38%;text-align:center;font-size:30px}
.ft-hud .vig{position:absolute;inset:0;box-shadow:inset 0 0 140px 30px rgba(180,0,0,.9);opacity:0;transition:opacity .4s}
`;

/** DOM heads-up display: health, ammo, crosshair, hit marker, kill feed, score and clock. */
export class Hud {
  private readonly root = document.createElement('div');
  private readonly el: Record<
    'cross' | 'hitm' | 'hp' | 'bar' | 'ammo' | 'feed' | 'score' | 'msg' | 'vig',
    HTMLElement
  > = {} as never;
  private feed: { text: string; ttl: number }[] = [];
  private hitTimer = 0;
  private vigT = 0;

  constructor(
    private readonly selfId: number,
    private readonly nameOf: (id: number) => string,
  ) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    this.root.className = 'ft-hud';
    this.root.innerHTML = `<div class="vig"></div><div class="cross"></div><div class="hitm"></div>
      <div class="score"></div><div class="feed"></div>
      <div class="health"><span class="hp"></span><div class="bar"><i></i></div></div>
      <div class="ammo"></div><div class="msg"></div>`;
    const q = (s: string) => this.root.querySelector(s) as HTMLElement;
    this.el = {
      cross: q('.cross'),
      hitm: q('.hitm'),
      hp: q('.hp'),
      bar: q('.bar i'),
      ammo: q('.ammo'),
      feed: q('.feed'),
      score: q('.score'),
      msg: q('.msg'),
      vig: q('.vig'),
    };
    document.body.appendChild(this.root);
  }

  /** React to the events of a frame. */
  onEvents(events: readonly GameEvent[]) {
    for (const e of events) {
      if (e.type === 'kill') {
        this.feed.push({ text: killFeedLine(e, this.nameOf), ttl: FEED_SECONDS });
        if (this.feed.length > FEED_MAX) this.feed.shift();
      } else if (e.type === 'hit') {
        if (e.shooter === this.selfId) {
          this.el.hitm.classList.add('on');
          this.el.hitm.classList.toggle('head', !!e.headshot);
          this.hitTimer = 0.12;
        }
        if (e.target === this.selfId) {
          this.el.vig.style.opacity = '1';
          this.vigT = 0.15;
        }
      }
    }
  }

  update(dt: number, me: PlayerState, state: MatchState | null, ads: boolean) {
    this.hitTimer -= dt;
    if (this.hitTimer <= 0) this.el.hitm.classList.remove('on');
    this.vigT -= dt;
    if (this.vigT <= 0 && this.el.vig.style.opacity === '1') this.el.vig.style.opacity = '0';
    for (const f of this.feed) f.ttl -= dt;
    this.feed = this.feed.filter((f) => f.ttl > 0);
    this.el.feed.textContent = '';
    for (const f of this.feed) {
      const d = document.createElement('div');
      d.textContent = f.text;
      this.el.feed.appendChild(d);
    }
    this.el.cross.classList.toggle('ads', ads && me.alive);
    this.el.hp.textContent = `Health ${Math.ceil(Math.max(0, me.health))}`;
    this.el.bar.style.width = `${Math.max(0, (me.health / MAX_HEALTH) * 100)}%`;
    this.el.bar.style.background = me.health < 30 ? '#e0533d' : '#7bd36b';
    const w = WEAPONS[me.weapon];
    this.el.ammo.innerHTML = `${me.ammo[me.weapon]} / ${w.mag}<small>${me.weapon.toUpperCase()}${me.reloadLeft > 0 ? '  reloading' : ''}</small>`;
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
