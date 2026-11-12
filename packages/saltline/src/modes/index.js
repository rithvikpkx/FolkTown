// Match modes for the Mall: free-for-all and team deathmatch against Saltline's machines ("bots").
// Rules ported from packages/sim Match (kill limit, timer, respawn, team balance); bodies and AI are Saltline's own hounds.
// Shortcut: Saltline machines only ever fight the player. Up to CAP bots are physical hounds; the rest (and allied
// TDM bots) are scoreboard-only and trade ambient kills, so a 31-bot match scores like a full lobby.
export const MODES = {
  ffa: { label: 'Free-for-all', killLimit: 30 },
  tdm: { label: 'Team deathmatch', killLimit: 50 },
};
export const MAX_BOTS = 31;
const CAP = 8, RESPAWN = 3, PROTECT = 2, TEAMS = ['Old Gold', 'Black'];
// URL difficulty names -> Saltline tuning keys
export const DIFFICULTY = { easy: 'standard', normal: 'hard', hard: 'brutal' };

const fmt = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, '0')}`;

export function createModes(G) {
  let m = null; // current match
  let board = null;
  const hud = () => G.hud || {};

  const rand = () => G.rng();
  const teamOf = (e) => (m.id === 'tdm' ? e.team : e.id);
  const hostile = (e) => m.id === 'ffa' || e.team !== m.player.team;
  const pickSpawn = (from, list, minDist = 25) => {
    let best = null, bs = -1e9;
    for (let k = 0; k < 8; k++) {
      const s = list[(rand() * list.length) | 0], d = Math.hypot(s.pos.x - from.x, s.pos.z - from.z);
      let sc = Math.min(d, 90) + rand() * 10 - (d < minDist ? 100 : 0);
      try { if (!G.physics.lineOfSight(s.pos.clone().setY(1), G.player.eye)) sc += 30; } catch { /* no LOS query */ }
      if (sc > bs) { bs = sc; best = s; }
    }
    return best;
  };

  function spawnBot(b) {
    const list = (G.level && G.level.enemySpawns) || [];
    if (!list.length || !G.enemies.spawn) return;
    const s = pickSpawn(G.player.pos, list);
    const e = G.enemies.spawn('hound', s.pos.clone(), { state: 'alert', target: G.player.pos });
    if (!e) { b.respawnAt = m.t + 1.5; return; }
    e.bot = b; b.enemy = e; b.respawnAt = Infinity;
  }

  function scoreOf(e) { return e.kills; }
  function teamScore(t) { return m.ents.reduce((a, e) => a + (e.team === t ? e.kills : 0), 0); }

  function start(id, opts = {}) {
    stop();
    const n = Math.max(0, Math.min(MAX_BOTS, Math.floor(+opts.bots >= 0 ? +opts.bots : 8)));
    const def = MODES[id] || MODES.ffa;
    m = {
      id: MODES[id] ? id : 'ffa', t: 0, over: false, ents: [], ambient: 3, alertT: 4, hudT: 0, shown: '',
      timeLimit: +opts.time > 0 ? +opts.time : 600, killLimit: +opts.killLimit > 0 ? +opts.killLimit : def.killLimit,
    };
    const player = { id: 0, name: 'You', team: 0, kills: 0, deaths: 0, isPlayer: true, respawnAt: Infinity, protectUntil: 0 };
    m.player = player; m.ents.push(player);
    const count = [1, 0];
    for (let i = 1; i <= n; i++) {
      const team = count[0] <= count[1] ? 0 : 1; // keep TDM balanced
      count[team]++;
      m.ents.push({ id: i, name: `Unit ${String(i).padStart(2, '0')}`, team: m.id === 'tdm' ? team : 1, kills: 0, deaths: 0, enemy: null, respawnAt: 0.5 + i * 0.45, physical: false });
    }
    m.ents.filter((e) => !e.isPlayer && hostile(e)).slice(0, CAP).forEach((e) => (e.physical = true));
    ensureBoard();
    refreshHud(true);
    G.events.emit('match:start', { mode: m.id, bots: n });
  }

  function stop() {
    if (board) board.hidden = true;
    m = null;
  }

  function credit(killer, victim) {
    killer.kills++; victim.deaths++;
    G.events.emit('match:kill', { killer: killer.name, victim: victim.name });
  }

  G.events.on('enemy:killed', (ev) => {
    if (!m || m.over || !ev || !ev.enemy || !ev.enemy.bot) return;
    const b = ev.enemy.bot;
    if (b.enemy !== ev.enemy) return;
    b.enemy = null; b.respawnAt = m.t + RESPAWN + rand() * 2;
    credit(m.player, b);
    checkEnd();
  });

  // hook called by loop.js when the player's health hits zero
  function onPlayerDead() {
    if (!m || m.over) return;
    const p = m.player;
    let killer = null, bd = 1e9;
    for (const e of m.ents) {
      if (e.isPlayer || !hostile(e)) continue;
      const d = e.enemy && e.enemy.alive ? Math.hypot(e.enemy.pos.x - G.player.pos.x, e.enemy.pos.z - G.player.pos.z) : 1e8 + rand();
      if (d < bd) { bd = d; killer = e; }
    }
    if (killer) credit(killer, p); else p.deaths++;
    p.respawnAt = m.t + RESPAWN;
    hud().message && hud().message(`Down. Respawning in ${RESPAWN}`, RESPAWN);
    checkEnd();
  }

  function respawnPlayer() {
    const p = m.player, sp = (G.level.spawns || []).filter((s) => s.team === p.team);
    const bots = m.ents.filter((e) => e.enemy && e.enemy.alive).map((e) => e.enemy.pos);
    let best = null, bs = -1;
    for (const s of sp.length ? sp : G.level.spawns || []) {
      const d = bots.reduce((a, q) => Math.min(a, Math.hypot(q.x - s.x, q.z - s.z)), 1e9);
      if (d > bs) { bs = d; best = s; }
    }
    if (best) G.player.reset({ pos: G.player.pos.clone().set(best.x, 0, best.z), yaw: best.yaw || 0 });
    else G.player.reset();
    if (G.weapon && G.weapon.reset) G.weapon.reset();
    G.player.invulnerable = true; p.protectUntil = m.t + PROTECT; p.respawnAt = Infinity;
  }

  function checkEnd() {
    if (m.over) return;
    let done = false;
    if (m.id === 'tdm') done = teamScore(0) >= m.killLimit || teamScore(1) >= m.killLimit;
    else done = m.ents.some((e) => e.kills >= m.killLimit);
    if (done || m.t >= m.timeLimit) finish();
  }

  function finish() {
    m.over = true;
    const top = [...m.ents].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
    if (m.id === 'tdm') {
      const a = teamScore(0), b = teamScore(1);
      m.winner = a === b ? 'Draw' : `${TEAMS[a > b ? 0 : 1]} win`;
    } else m.winner = top[0].isPlayer ? 'You win' : `${top[0].name} wins`;
    G.enemies.clear && G.enemies.clear();
    renderBoard(true);
    G.events.emit('match:end', { mode: m.id, winner: m.winner });
    if (G.modes.onEnd) G.modes.onEnd(m);
  }

  function update(dt) {
    if (!m || m.over) return;
    m.t += dt;
    const p = m.player;
    if (G.player.invulnerable && p.protectUntil && m.t > p.protectUntil) { G.player.invulnerable = false; p.protectUntil = 0; }
    if (!G.player.alive && p.respawnAt === Infinity) onPlayerDead(); // missed event (e.g. killed during a pause)
    if (p.respawnAt <= m.t) respawnPlayer();
    for (const b of m.ents) {
      if (b.isPlayer || !b.physical) continue;
      if (b.enemy && (b.enemy.bot !== b || !b.enemy.active)) { b.enemy = null; b.respawnAt = m.t + 1; }
      if (!b.enemy && b.respawnAt <= m.t && G.player.alive) spawnBot(b);
    }
    // keep the machines converging on the player (the Mall is big)
    if ((m.alertT -= dt) <= 0) { m.alertT = 5; G.enemies.alert && G.enemies.alert(G.player.pos, 600); }
    // ambient kills among the scoreboard-only bots
    if ((m.ambient -= dt) <= 0) {
      m.ambient = 2 + 8 / Math.max(1, m.ents.length - 1) + rand() * 2;
      const bots = m.ents.filter((e) => !e.isPlayer);
      const a = bots[(rand() * bots.length) | 0];
      const victims = bots.filter((e) => !e.physical && teamOf(e) !== teamOf(a));
      if (a && victims.length) credit(a, victims[(rand() * victims.length) | 0]);
    }
    checkEnd();
    refreshHud(false);
    if (board && !board.hidden && !m.over) renderBoard(false);
  }

  function rank() {
    const s = [...m.ents].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
    return s.indexOf(m.player) + 1;
  }

  function refreshHud(force) {
    const left = m.timeLimit - m.t, p = m.player;
    const tally = m.id === 'tdm'
      ? `${TEAMS[0]} ${teamScore(0)} - ${teamScore(1)} ${TEAMS[1]} · ${fmt(left)}`
      : `Kills ${p.kills} · Deaths ${p.deaths} · Rank ${rank()}/${m.ents.length} · ${fmt(left)}`;
    const obj = `${MODES[m.id].label}: first to ${m.killLimit}`;
    if (!force && tally === m.shown) return;
    m.shown = tally;
    const h = hud();
    h.setObjective && h.setObjective(obj);
    h.setTally && h.setTally(tally);
  }

  // ---- scoreboard (hold Tab; also the end screen) ----
  function ensureBoard() {
    if (board) return;
    const st = document.createElement('style');
    st.textContent = `.sl-board{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:60;background:rgba(0,0,0,.55);pointer-events:none;font:13px/1.35 var(--f-mono,monospace);color:#e8e4da}
.sl-board[hidden]{display:none}.sl-board.end{pointer-events:auto;background:rgba(0,0,0,.78)}
.sl-board>div{min-width:min(560px,92vw);max-height:86vh;overflow:auto;padding:18px 22px;background:rgba(14,15,16,.94);border:1px solid rgba(232,228,218,.25)}
.sl-board h2{margin:0 0 4px;font:700 22px var(--f-label,sans-serif);letter-spacing:.14em;text-transform:uppercase}.sl-board p{margin:0 0 10px;opacity:.7}
.sl-board table{width:100%;border-collapse:collapse}.sl-board td,.sl-board th{padding:2px 8px;text-align:right}.sl-board td:nth-child(-n+2),.sl-board th:nth-child(-n+2){text-align:left}
.sl-board tr.me{color:#ffd24a;font-weight:700}.sl-board tr.t1 td:nth-child(2){opacity:.6}.sl-board button{margin-top:14px;margin-right:8px}`;
    document.head.appendChild(st);
    board = document.createElement('div');
    board.className = 'sl-board'; board.hidden = true;
    document.body.appendChild(board);
    addEventListener('keydown', (e) => { if (e.code === 'Tab' && m && !m.over) { e.preventDefault(); renderBoard(false); board.hidden = false; } });
    addEventListener('keyup', (e) => { if (e.code === 'Tab' && m && !m.over) board.hidden = true; });
  }

  function renderBoard(end) {
    if (!m || !board) return;
    const rows = [...m.ents].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
    const head = m.id === 'tdm' ? `${TEAMS[0]} ${teamScore(0)} - ${teamScore(1)} ${TEAMS[1]}` : `${MODES.ffa.label}`;
    board.className = 'sl-board' + (end ? ' end' : '');
    board.innerHTML = `<div><h2>${end ? m.winner : head}</h2><p>${end ? head + ' · ' : ''}${fmt(m.t)} elapsed · first to ${m.killLimit}</p>
<table><tr><th>#</th><th>Name</th><th>Team</th><th>Kills</th><th>Deaths</th></tr>${rows
      .map((e, i) => `<tr class="${e.isPlayer ? 'me' : ''} t${e.team}"><td>${i + 1}</td><td>${e.name}</td><td>${m.id === 'tdm' ? TEAMS[e.team] : ''}</td><td>${e.kills}</td><td>${e.deaths}</td></tr>`)
      .join('')}</table>${end ? '<button class="btn primary" data-a="again">Play again</button><button class="btn" data-a="menu">Menu</button>' : ''}</div>`;
    board.hidden = false;
    if (end)
      board.onclick = (ev) => {
        const a = ev.target && ev.target.dataset && ev.target.dataset.a;
        if (a === 'again') { board.hidden = true; G.game.start({ skipIntro: true }); }
        else if (a === 'menu') { const u = new URL(location.href); ['autostart', 'shot'].forEach((k) => u.searchParams.delete(k)); location.href = u.href; }
      };
  }

  return {
    get active() { return !!m; },
    get over() { return !!m && m.over; },
    get state() { return m; },
    start, stop, update, onPlayerDead, scoreOf,
    objective: () => (m ? `${MODES[m.id].label}: first to ${m.killLimit}` : ''),
    onEnd: null,
    // test hook: force-score a bot (headless match test)
    _credit: (killerId, victimId) => m && credit(m.ents[killerId], m.ents[victimId]),
  };
}
