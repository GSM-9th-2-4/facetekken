import { describe, expect, it } from 'vitest';
import { FixedStepClock } from '../src/core/loop';
import { Rng } from '../src/core/rng';
import { FRAME_MS } from '../src/config/tuning';

describe('FixedStepClock', () => {
  it('runs exactly 60 steps per simulated second', () => {
    const clock = new FixedStepClock();
    let steps = 0;
    for (let i = 0; i < 144; i++) steps += clock.advance(1000 / 144).steps; // 144 Hz display
    expect(steps).toBe(60);
  });

  it('carries the remainder as interpolation alpha', () => {
    const clock = new FixedStepClock();
    const r = clock.advance(FRAME_MS * 1.5);
    expect(r.steps).toBe(1);
    expect(r.alpha).toBeCloseTo(0.5, 6);
  });

  it('caps steps and drops the backlog after a long stall', () => {
    const clock = new FixedStepClock(FRAME_MS, 5);
    expect(clock.advance(1000).steps).toBe(5);
    expect(clock.advance(0).steps).toBe(0);
  });

  it('timeScale 0 pauses, 0.25 slows down', () => {
    const clock = new FixedStepClock();
    clock.timeScale = 0;
    expect(clock.advance(1000 / 2).steps).toBe(0);
    clock.timeScale = 0.25;
    let steps = 0;
    for (let i = 0; i < 60; i++) steps += clock.advance(FRAME_MS).steps;
    expect(steps).toBe(15);
  });

  it('ignores negative / NaN elapsed time', () => {
    const clock = new FixedStepClock();
    expect(clock.advance(-50).steps).toBe(0);
    expect(clock.advance(Number.NaN).steps).toBe(0);
  });
});

describe('Rng', () => {
  it('is deterministic for a seed and restorable from state', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    const seqA = Array.from({ length: 10 }, () => a.next());
    expect(Array.from({ length: 10 }, () => b.next())).toEqual(seqA);

    const c = new Rng(42);
    c.next();
    const saved = c.getState();
    const x = c.next();
    c.setState(saved);
    expect(c.next()).toBe(x);
  });

  it('stays in range', () => {
    const r = new Rng(7);
    for (let i = 0; i < 1000; i++) {
      const f = r.next();
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
      const n = r.int(3, 5);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(5);
    }
  });
});
