/**
 * All system tuning numbers live here (SPEC.md).
 * Tags: [T8] = Tekken 8 value (don't change without being asked), [tune] = our starting value.
 * Per-move frame data does NOT go here — it lives in src/data/characters/*.json.
 */

export const SIM = {
  /** Simulation rate. [T8] Tekken runs at 60 fps. */
  FPS: 60,
  /** Max sim steps per rendered frame before dropping time (avoids spiral of death). [tune] */
  MAX_STEPS_PER_FRAME: 5,
} as const;

export const FRAME_MS = 1000 / SIM.FPS;

export const INPUT = {
  /** Input history ring buffer length in frames. [tune] SPEC §3.3 */
  HISTORY_FRAMES: 60,
  /** Simultaneous press leniency in frames. [tune] */
  SIMULTANEOUS_LENIENCY: 2,
  /** Window for f,f / b,b / sidestep taps. [tune] */
  DOUBLE_TAP_WINDOW: 10,
  /** Accept the next move this many frames before recovery ends. [tune] */
  RECOVERY_BUFFER: 8,
} as const;

export const MOVEMENT = {
  /** m/s [tune] SPEC §4 */
  WALK_FORWARD: 1.2,
  WALK_BACKWARD: 1.0,
  /** Starting distance between fighters (m). [tune] */
  START_DISTANCE: 3.0,
  /** Minimum distance the pushboxes allow (m). [tune] */
  PUSHBOX_DISTANCE: 0.55,
} as const;

export const HEALTH = {
  /** [T8] 180 at launch → 200 (S2 emergency patch) → 190 (patch 3.02.01). SPEC §8.1 */
  MAX_DEFAULT: 190,
  MAX_OPTIONS: [180, 190, 200] as const,
  /** Rage below this fraction of max health. [T8] SPEC §8.3 */
  RAGE_THRESHOLD: 0.25,
} as const;

export const HEAT = {
  /** Seconds. [T8] SPEC §8.4 */
  BURST_DURATION_S: 10,
  ENGAGER_DURATION_S: 15,
} as const;

export const ROUND = {
  /** Seconds. [tune] SPEC §8.5 */
  TIME_S: 60,
  /** Rounds to win. [tune] */
  TO_WIN: 3,
} as const;

export const CAMERA = {
  /** Field of view in degrees. [tune] */
  FOV: 40,
  /** Distance range from the fighters' midpoint (m). [tune] SPEC §13 */
  MIN_DISTANCE: 3.5,
  MAX_DISTANCE: 7,
  /** Extra camera distance per meter of fighter separation. [tune] */
  DISTANCE_PER_SEPARATION: 1.1,
  /** Camera height and look-at height (m). [tune] */
  HEIGHT: 1.35,
  LOOK_HEIGHT: 1.0,
  /** Exponential follow speed (per second). [tune] */
  FOLLOW_SPEED: 8,
} as const;

export const DEBUG = {
  /** Idle breathing amplitude (m) for primitive fighters until animations exist. [tune] */
  IDLE_BOB: 0.015,
} as const;
