import { describe, expect, it } from 'vitest';
import { angleDelta, faceEachOther, lerpAngle, yawToward } from '../src/fight/axis';
import { createFighter } from '../src/fight/fighter';
import { cloneMatch, createMatch, stateHash, stepMatch } from '../src/fight/match';
import { HEALTH, ROUND, SIM } from '../src/config/tuning';

describe('axis', () => {
  it('fighters face each other when free', () => {
    const a = createFighter(0, 'kang', { x: -1, z: 0 });
    const b = createFighter(1, 'seo', { x: 1, z: 0 });
    faceEachOther(a, b);
    expect(a.yaw).toBeCloseTo(0);
    expect(Math.abs(b.yaw)).toBeCloseTo(Math.PI);
  });

  it('a fighter in a move keeps its facing (SPEC §4.1)', () => {
    const a = createFighter(0, 'kang', { x: -1, z: 0 });
    const b = createFighter(1, 'seo', { x: 1, z: 1 });
    a.moveId = 'df1';
    a.yaw = 0;
    faceEachOther(a, b);
    expect(a.yaw).toBe(0);
    expect(b.yaw).toBeCloseTo(yawToward(b.pos, a.pos));
  });

  it('angle helpers take the short way round', () => {
    expect(angleDelta(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(0.2);
    expect(lerpAngle(Math.PI - 0.1, -Math.PI + 0.1, 0.5)).toBeCloseTo(Math.PI);
  });
});

describe('match', () => {
  it('starts with default health 190 and a full round timer', () => {
    const m = createMatch({ p1Character: 'kang', p2Character: 'seo' });
    expect(m.fighters[0].health).toBe(HEALTH.MAX_DEFAULT);
    expect(HEALTH.MAX_DEFAULT).toBe(190);
    expect(m.timerFrames).toBe(ROUND.TIME_S * SIM.FPS);
  });

  it('advances one frame per step', () => {
    const m = createMatch({ p1Character: 'kang', p2Character: 'seo' });
    for (let i = 0; i < 120; i++) stepMatch(m);
    expect(m.frame).toBe(120);
    expect(m.timerFrames).toBe(ROUND.TIME_S * SIM.FPS - 120);
  });

  it('is deterministic: same steps → same hash', () => {
    const run = () => {
      const m = createMatch({ p1Character: 'kang', p2Character: 'seo', seed: 99 });
      for (let i = 0; i < 600; i++) stepMatch(m);
      return stateHash(m);
    };
    expect(run()).toBe(run());
  });

  it('clone does not share fighter state', () => {
    const m = createMatch({ p1Character: 'kang', p2Character: 'seo' });
    const c = cloneMatch(m);
    c.fighters[0].pos.x = 99;
    expect(m.fighters[0].pos.x).not.toBe(99);
  });
});
