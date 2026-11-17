import type { FighterState, Vec2 } from './fighter';

/** Yaw (radians) that points from `from` toward `to` on the ground plane. */
export function yawToward(from: Vec2, to: Vec2): number {
  return Math.atan2(to.z - from.z, to.x - from.x);
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.z - a.z);
}

export function midpoint(a: Vec2, b: Vec2): Vec2 {
  return { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
}

/**
 * SPEC §4.1: fighters turn to face each other every frame,
 * except while executing a move (that is what lets sidesteps make moves whiff).
 */
export function faceEachOther(a: FighterState, b: FighterState): void {
  if (a.moveId === null) a.yaw = yawToward(a.pos, b.pos);
  if (b.moveId === null) b.yaw = yawToward(b.pos, a.pos);
}

/** Shortest signed difference between two angles, in (-PI, PI]. */
export function angleDelta(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

/** Interpolate angles the short way round (for rendering). */
export function lerpAngle(a: number, b: number, t: number): number {
  return a + angleDelta(a, b) * t;
}
