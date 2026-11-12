import { describe, expect, it } from 'vitest';
import { orientListener, placeNode } from './audio';

const param = () => ({ value: 0 });

describe('Safari audio fallback', () => {
  it('writes AudioParams when the browser has them', () => {
    const n = { positionX: param(), positionY: param(), positionZ: param() };
    placeNode(n as never, 1, 2, 3);
    expect([n.positionX.value, n.positionY.value, n.positionZ.value]).toEqual([1, 2, 3]);
  });

  it('uses setPosition/setOrientation when positionX is missing instead of throwing', () => {
    const calls: number[][] = [];
    const l = {
      setPosition: (...a: number[]) => calls.push(a),
      setOrientation: (...a: number[]) => calls.push(a),
    };
    expect(() => placeNode(l as never, 1, 2, 3)).not.toThrow();
    expect(() => orientListener(l as never, 0)).not.toThrow();
    expect(calls[0]).toEqual([1, 2, 3]);
    expect(calls[1]?.map((v) => Math.abs(v))).toEqual([0, 0, 1, 0, 1, 0]);
  });
});
