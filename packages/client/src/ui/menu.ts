import { type Difficulty, MAX_BOTS, type MatchMode, type MatchState } from '@folktown/shared';

const PARAMS = ['mode', 'diff', 'bots'];

/** The menu shows only when the URL carries none of the match parameters. */
export const needsMenu = (search: string): boolean => {
  const q = new URLSearchParams(search);
  return !PARAMS.some((k) => q.has(k));
};

export function menuQuery(mode: MatchMode, diff: Difficulty, bots: number): string {
  const n = Math.min(MAX_BOTS, Math.max(1, Math.round(bots) || 7));
  return `?mode=${mode}&diff=${diff}&bots=${n}`;
}

const BOX =
  'position:fixed;inset:0;display:flex;flex-direction:column;gap:14px;align-items:center;justify-content:center;color:#fff;font:600 18px system-ui;background:rgba(10,14,10,.85);z-index:10';
const BTN =
  'font:inherit;padding:8px 22px;border:0;border-radius:5px;background:#e8c36a;color:#222;cursor:pointer';

/** Start menu: choosing reloads the page with the match parameters, so the game starts as before. */
export function showMenu() {
  const el = document.createElement('div');
  el.style.cssText = BOX;
  el.innerHTML = `<div style="font-size:38px">FolkTown</div>
    <label>Mode <select id="m"><option value="ffa">Free for all</option><option value="tdm">Team deathmatch</option></select></label>
    <label>Bot difficulty <select id="d"><option>easy</option><option selected value="normal">medium</option><option>hard</option></select></label>
    <label>Bots <input id="b" type="number" min="1" max="${MAX_BOTS}" value="7" style="width:60px"></label>
    <button id="go" style="${BTN}">Play</button>`;
  document.body.appendChild(el);
  const v = (id: string) => (el.querySelector(`#${id}`) as HTMLInputElement).value;
  el.querySelector('#go')?.addEventListener('click', () => {
    location.search = menuQuery(v('m') as MatchMode, v('d') as Difficulty, Number(v('b')));
  });
}

/** Match-over panel with a replay button (same settings) and a link back to the menu. */
export class MatchOver {
  private readonly el = document.createElement('div');
  private shown = false;
  constructor() {
    this.el.style.cssText = `${BOX};display:none`;
    document.body.appendChild(this.el);
  }
  update(state: MatchState | null, selfId: number, selfTeam: number) {
    if (!state?.ended || this.shown) return;
    this.shown = true;
    document.exitPointerLock();
    const won = state.config.mode === 'tdm' ? state.winner === selfTeam : state.winner === selfId;
    this.el.innerHTML = `<div style="font-size:42px">${state.winner === null ? 'Draw' : won ? 'Victory' : 'Defeat'}</div>
      <button id="again" style="${BTN}">Play again</button><button id="menu" style="${BTN}">Menu</button>`;
    this.el.style.display = 'flex';
    this.el.querySelector('#again')?.addEventListener('click', () => location.reload());
    this.el.querySelector('#menu')?.addEventListener('click', () => {
      location.search = '';
    });
  }
}
