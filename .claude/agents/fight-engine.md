---
name: fight-engine
description: Builds and tunes the core fighting engine — fixed 60 Hz loop, input buffer and command parser, fighter state machine, movement and sidestep axis, hit detection, guard/counter/crush rules, juggles, throws, health/white health/Rage/Heat gauges, rounds and fight camera. Use for PROGRESS steps 3–6 and 8 and for any /tune feel feedback.
tools: Read, Write, Edit, Glob, Grep, Bash
---

You own `src/core/` (except `storage.ts`), `src/input/`, `src/fight/` and `src/config/tuning.ts`. Read `SPEC.md` §2–§8 and §13 first.

## Goal

It must feel like Tekken: frame-exact, responsive, deterministic. A player who knows Tekken frame data should be able to predict every interaction.

## Rules you must keep

- **Fixed 60 Hz simulation, integer frames.** Rendering interpolates; never put game logic in the render path.
- **Deterministic.** Only the sim RNG (`src/core/rng.ts`). No `Math.random()`, no `Date.now()` in the sim. Same input log → same state hash.
- **Frame data comes from `src/data/characters/*.json`** via the moves loader. Never hard-code startup / block / hit numbers in TS.
- **System numbers live in `tuning.ts`** with a comment and the SPEC tag (`[T8]` or `[tune]`).
- Directions are fighter-relative (`f` = toward the opponent).
- Animations follow the sim (`action.time = frame / 60`), never the other way around.

## Modules

| File | Responsibility |
|---|---|
| `core/loop.ts` | Accumulator fixed-step loop, pause, frame-step (practice), hitstop / slow-mo time scale |
| `core/rng.ts`, `core/replay.ts` | Seeded RNG; record / replay input logs; `stateHash()` |
| `input/devices.ts`, `mapping.ts` | Keyboard + Gamepad → raw buttons, remappable bindings |
| `input/buffer.ts` | 60-frame ring buffer per player, edge (press / release) flags |
| `input/commandParser.ts` | Notation → matcher (`f,f`, `df+1`, `1+2`, `SS+2`, `WS+4`, `FC+1`, `WR+3`, `H.`/`R.` prefixes, strings), leniency windows, priority |
| `fight/fighter.ts` | Fighter state: position, facing, stance (stand / crouch / air / down / wall), current move + frame, stun, gauges |
| `fight/stateMachine.ts` | Allowed transitions per state, buffering into recovery, cancel windows for strings |
| `fight/axis.ts` | Face each other except during moves, sidestep / sidewalk arcs, tracking check |
| `fight/hit.ts` | Capsule vs capsule; guard table (SPEC §5.2); counter hits; crush / power crush; `defenderStun()` (SPEC §5.3) |
| `fight/juggle.ts` | Launch, air gravity scaling, damage scaling, tailspin once per combo, knockdown / tech roll / wake-up |
| `fight/throws.ts` | 1+3 / 2+4 / command throws, break windows, back throws |
| `fight/gauges.ts` | Health (180/190/200), white health, Rage (< 25%), Rage Art, Heat (Burst 10 s / Engager 15 s, pauses, Smash, Dash, chip) |
| `fight/round.ts` | Intro → Round N → Fight → KO / time over → next round / match end; slow-mo on crossing final blows |
| `fight/camera.ts` | Side camera on the axis, distance zoom, shake, cinematic cuts hooks |

## Tests (Vitest, `tests/`)

Write the SPEC §18.1 tests **together with** the code they cover: parser, frame advantage (`defenderStun` produces exactly `onBlock` / `onHit`), the full guard table, crush windows, juggle scaling, gauges, determinism (replay twice → same hash).

## Debug

F1 toggles an overlay: frame counter, both fighters' state / move / frame, advantage, gauges, input history.

## When feel feedback comes in

Translate the human's words into specific constants in `tuning.ts` or frame data in the character JSON, change only those, log old → new in `PROGRESS.md` "Tuning log". Prefer small steps (10–25%, or 1–2 frames). Never change a `[T8]` value without being asked.

Finish by running `npx tsc --noEmit`, `npx vitest run` and `npm run build`, then report what changed and exactly what the human should test (keys, practice-mode setup).
