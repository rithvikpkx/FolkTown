import type { MatchMode, PlayerState } from '@folktown/shared';

export interface Row {
  id: number;
  name: string;
  kills: number;
  deaths: number;
  team: number;
}

/** Kills descending, then deaths ascending, then id. In TDM, team 0 is listed before team 1. */
export function sortScores(players: readonly PlayerState[], mode: MatchMode): Row[] {
  const rows = players.map(({ id, name, kills, deaths, team }) => ({
    id,
    name,
    kills,
    deaths,
    team,
  }));
  return rows.sort(
    (a, b) =>
      (mode === 'tdm' ? a.team - b.team : 0) ||
      b.kills - a.kills ||
      a.deaths - b.deaths ||
      a.id - b.id,
  );
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** Tab-held table. */
export class Scoreboard {
  private readonly el = document.createElement('div');
  private show = false;

  constructor(private readonly selfId: number) {
    this.el.style.cssText =
      'position:fixed;left:50%;top:14%;transform:translateX(-50%);min-width:380px;padding:12px 18px;background:rgba(0,0,0,.65);color:#fff;font:600 15px system-ui;display:none;pointer-events:none;border-radius:6px';
    document.body.appendChild(this.el);
    addEventListener('keydown', (e) => {
      if (e.code !== 'Tab') return;
      e.preventDefault();
      this.show = true;
    });
    addEventListener('keyup', (e) => {
      if (e.code === 'Tab') this.show = false;
    });
    addEventListener('blur', () => {
      this.show = false;
    });
  }

  update(players: readonly PlayerState[], mode: MatchMode) {
    this.el.style.display = this.show ? 'block' : 'none';
    if (!this.show) return;
    const tdm = mode === 'tdm';
    const head = `<tr style="opacity:.7"><td>Player</td>${tdm ? '<td>Team</td>' : ''}<td>K</td><td>D</td></tr>`;
    const body = sortScores(players, mode)
      .map((r) => {
        const color = tdm ? (r.team === 0 ? '#6ab0ff' : '#ff7a6a') : '#fff';
        const me = r.id === this.selfId ? 'background:rgba(255,255,255,.15);' : '';
        return `<tr style="color:${color};${me}"><td>${esc(r.name)}</td>${tdm ? `<td>${r.team + 1}</td>` : ''}<td>${r.kills}</td><td>${r.deaths}</td></tr>`;
      })
      .join('');
    this.el.innerHTML = `<table style="width:100%;border-spacing:10px 2px;text-align:right"><style>td:first-child{text-align:left}</style>${head}${body}</table>`;
  }
}
