import { MOVEMENT, ROUND, SIM } from '../config/tuning';
import { Rng, hashString } from '../core/rng';
import { faceEachOther } from './axis';
import { cloneFighter, createFighter, type FighterState } from './fighter';

/** Whole simulation state. Serializable and deterministic (SPEC §2.1). */
export interface MatchState {
  frame: number;
  round: number;
  /** Remaining round time in frames. */
  timerFrames: number;
  fighters: [FighterState, FighterState];
  rngState: number;
}

export interface MatchConfig {
  p1Character: string;
  p2Character: string;
  seed?: number;
}

export function createMatch(cfg: MatchConfig): MatchState {
  const half = MOVEMENT.START_DISTANCE / 2;
  const p1 = createFighter(0, cfg.p1Character, { x: -half, z: 0 });
  const p2 = createFighter(1, cfg.p2Character, { x: half, z: 0 });
  faceEachOther(p1, p2);
  return {
    frame: 0,
    round: 1,
    timerFrames: ROUND.TIME_S * SIM.FPS,
    fighters: [p1, p2],
    rngState: new Rng(cfg.seed).getState(),
  };
}

export function cloneMatch(s: MatchState): MatchState {
  return { ...s, fighters: [cloneFighter(s.fighters[0]), cloneFighter(s.fighters[1])] };
}

/**
 * One 60 Hz simulation step. Step 1 only advances time and keeps fighters facing each other;
 * the per-frame order from SPEC §2.2 (input → commands → state → movement → hits → gauges)
 * is filled in from step 3.
 */
export function stepMatch(s: MatchState): void {
  const [a, b] = s.fighters;
  s.frame++;
  if (s.timerFrames > 0) s.timerFrames--;
  a.stateFrame++;
  b.stateFrame++;
  faceEachOther(a, b);
}

/** Stable hash of the sim state for determinism tests and replays. */
export function stateHash(s: MatchState): number {
  // Round floats so representation noise never changes the hash.
  return hashString(JSON.stringify(s, (_k, v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v)));
}
