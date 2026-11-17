import { HEALTH } from '../config/tuning';

export type PlayerIndex = 0 | 1;

/** Coarse stance; step 3+ grows this into the full state machine (SPEC §2.2). */
export type Stance = 'stand' | 'crouch' | 'air' | 'down' | 'wall';

export interface Vec2 {
  /** Ground plane x (m). */
  x: number;
  /** Ground plane z (m). */
  z: number;
}

/** Pure, serializable fighter state. No Three.js objects in here. */
export interface FighterState {
  player: PlayerIndex;
  characterId: string;
  pos: Vec2;
  /** Facing angle on the ground plane (radians, 0 = +x). */
  yaw: number;
  stance: Stance;
  /** Current move id, or null when free. */
  moveId: string | null;
  /** Frames since the current move / state started. */
  stateFrame: number;
  health: number;
  maxHealth: number;
}

export function createFighter(
  player: PlayerIndex,
  characterId: string,
  pos: Vec2,
  maxHealth: number = HEALTH.MAX_DEFAULT,
): FighterState {
  return {
    player,
    characterId,
    pos: { ...pos },
    yaw: 0,
    stance: 'stand',
    moveId: null,
    stateFrame: 0,
    health: maxHealth,
    maxHealth,
  };
}

export function cloneFighter(f: FighterState): FighterState {
  return { ...f, pos: { ...f.pos } };
}
