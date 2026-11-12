import { describe, expect, it } from 'vitest';
import { formatClock, killFeedLine } from './hud';

describe('hud helpers', () => {
  it('formats the clock', () => {
    expect(formatClock(125.2)).toBe('2:06');
    expect(formatClock(-3)).toBe('0:00');
  });
  it('formats a kill line', () => {
    const name = (id: number) => (id === 0 ? 'You' : `Bot ${id}`);
    expect(
      killFeedLine({ type: 'kill', tick: 1, killer: 0, victim: 3, weapon: 'rifle' }, name),
    ).toBe('You  [rifle]  Bot 3');
  });
});
