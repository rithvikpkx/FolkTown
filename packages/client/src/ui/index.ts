import type { MatchState, PlayerState, Vec3, ZoneData } from '@folktown/shared';
import { MatchOver } from './menu';
import { Minimap } from './minimap';
import { Scoreboard } from './scoreboard';

/** Scoreboard, minimap and match-over panel; read-only over the match snapshot. */
export function mountUi(zone: ZoneData, selfId: number) {
  const board = new Scoreboard(selfId);
  const map = new Minimap(zone);
  const over = new MatchOver();
  return (state: MatchState | null, me: PlayerState, mePos: Vec3) => {
    if (!state) return;
    board.update(state.players, state.config.mode);
    map.update(me, mePos, state.players, state.config.mode === 'tdm');
    over.update(state, selfId, me.team);
  };
}
