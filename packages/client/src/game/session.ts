import {
  type GameEvent,
  type MatchConfig,
  type PlayerInput,
  type PlayerState,
  TICK_DT,
  type Vec3,
  type ZoneData,
} from '@folktown/shared';
import { BotController, Match } from '@folktown/sim';

export const PLAYER_ID = 0;
const MAX_STEPS_PER_FRAME = 5;

/** A single-player match: the human is player 0, everyone else is a bot. Fixed 60 Hz stepping. */
export class GameSession {
  readonly match: Match;
  private readonly bots: BotController;
  private acc = 0;
  private readonly prev = new Map<number, Vec3>();
  /** Events of the steps since the last `drainEvents`. */
  private events: GameEvent[] = [];

  constructor(zone: ZoneData, config: MatchConfig, seed = Date.now() & 0xffff) {
    this.match = new Match(config, zone, seed);
    this.bots = new BotController(this.match, seed);
    this.match.addPlayer({ id: PLAYER_ID, name: 'You', team: 0, isBot: false });
    for (let i = 0; i < config.botCount; i++) {
      const id = i + 1;
      this.match.addPlayer({
        id,
        name: `Bot ${id}`,
        team: (config.mode === 'tdm' ? i % 2 : 1) as 0 | 1,
        isBot: true,
      });
      this.bots.addBot(id);
    }
    this.snapshotPrev();
  }

  get player(): PlayerState {
    return this.match.getPlayer(PLAYER_ID) as PlayerState;
  }

  private snapshotPrev() {
    for (const p of this.match.playerList) this.prev.set(p.id, { ...p.pos });
  }

  /** Advance by real time; `sample` is called once per sim tick for the human's input. */
  advance(dt: number, sample: () => PlayerInput) {
    this.acc += Math.min(dt, 0.25);
    let n = 0;
    while (this.acc >= TICK_DT && n < MAX_STEPS_PER_FRAME) {
      n++;
      this.acc -= TICK_DT;
      this.snapshotPrev();
      const inputs = this.bots.inputs();
      inputs.set(PLAYER_ID, sample());
      this.events.push(...this.match.step(inputs));
    }
    if (this.acc >= TICK_DT) this.acc = 0; // too far behind: drop the backlog
  }

  /** Position between the previous and current tick, for smooth rendering. */
  lerpPos(p: PlayerState): Vec3 {
    const a = this.prev.get(p.id) ?? p.pos;
    const t = Math.min(1, this.acc / TICK_DT);
    // a respawn teleports; do not smear across the map
    if (Math.hypot(p.pos.x - a.x, p.pos.z - a.z) > 3) return p.pos;
    return {
      x: a.x + (p.pos.x - a.x) * t,
      y: a.y + (p.pos.y - a.y) * t,
      z: a.z + (p.pos.z - a.z) * t,
    };
  }

  drainEvents(): GameEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }
}
