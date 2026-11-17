# FaceTekken — Claude Code instructions

You are building **FaceTekken**, a Tekken-style 3D browser fighting game where the character's face comes from a user photo.
The full spec is in `@SPEC.md`. Progress and the step-by-step checklist are in `@PROGRESS.md`. Read both before doing anything.
References (design brief, system sources, assets): `docs/REFERENCES.md`.

Harness ported from `GSM-9th-2-4/facekart` (same workflow, agents and hooks, adapted to a fighting game).

## How to work

1. Find the first unchecked step in `PROGRESS.md` (or the step the user names).
2. Delegate the work to the matching subagent in `.claude/agents/` (see table below). Do small glue edits yourself.
3. When the step is coded, run the **qa-verifier** subagent. Fix everything it reports before moving on.
4. Check the step's "Done when" criteria. Only then tick the box in `PROGRESS.md`.
5. Commit: `git add -A && git commit -m "step N: <short summary>"`. One commit per step (fix-up commits allowed).
6. End with a short report: what was built, what the human should test (keys to press, what to look for), and whether a Claude app task is due (see `docs/WEB_TASKS.md`).

Never stop halfway through a step to ask about small choices. Pick the option most consistent with `SPEC.md`, note it in the report, and continue. Ask only when the spec truly contradicts itself.

## Subagents

| Agent | Owns |
| --- | --- |
| `fight-engine` | `src/core/`, `src/input/`, `src/fight/`, `src/config/tuning.ts` — 60 Hz loop, input buffer & command parser, state machine, movement & sidestep axis, hit detection, guard/counter/crush, juggles, throws, gauges (health, recoverable, Rage, Heat), rounds, camera |
| `character-builder` | `src/data/characters/`, `src/render/character.ts`, `scripts/` (retarget/anim tools) — move lists & frame data JSON, animation mapping, base models, hurt/hit capsules per bone |
| `stage-builder` | `src/stage/`, `src/data/stages/` — arenas, walls (breakable / hard), floor & balcony breaks, lighting, scenery |
| `face-pipeline` | `src/face/` — MediaPipe face landmarker, canonical-UV warp, face mesh on the head bone, HUD portrait |
| `ui-screens` | `src/ui/`, `src/core/storage.ts` — Title, Menu, Face Lab, Character select, VS, HUD, Pause, Results, Practice overlay, Settings |
| `cpu-ai` | `src/ai/` — CPU opponent using the same input path as a player |
| `qa-verifier` | read-only review: typecheck, tests, build, spec compliance, runtime-risk scan |

## Tech rules

- Vite + TypeScript (strict) + Three.js. No backend. `npm run dev` must always work.
- **Fixed 60 Hz simulation, integer frames.** All game logic is deterministic; rendering interpolates. Animations are driven by the sim (`action.time = frame / 60`) and never decide hits.
- **Frame data lives in `src/data/characters/*.json`.** No startup / block / hit numbers hard-coded in TS. Adding a move or character must not require code changes.
- **System tuning numbers live in `src/config/tuning.ts`** (buffer windows, gravity, damage scaling, hitstop, camera). Values marked `[T8]` in `SPEC.md` are original-game values — keep them unless the human says otherwise.
- Face processing runs in the browser with `@mediapipe/tasks-vision`. Model file in `public/models/` via `npm run fetch-models` (gitignored). Photos never leave the browser.
- UI screens are an HTML/CSS overlay on top of the Three.js canvas (no UI framework).
- Persist settings, key bindings, face slots (data-URL PNG ≤ 512×512) through `src/core/storage.ts` only (IndexedDB, fallback localStorage). Wrap reads/writes in try/catch.
- Primitives first (capsule-body fighters) until `public/assets/` has models / animations. Never commit Mixamo files (`public/animations/licensed/` is gitignored).
- No Tekken assets, names, music or logos. Systems and controls only.
- Unit tests with Vitest for parser, frame advantage, guard table, crush, juggle scaling, gauges, determinism (`SPEC.md` §18.1).

## Suggested layout

```
src/
  main.ts
  core/      loop (fixed step), rng, replay, scene manager, storage
  config/    tuning.ts
  input/     devices, mapping (remappable), buffer, commandParser
  fight/     fighter, stateMachine, moves loader, hit, throws, juggle, gauges, round, axis, camera
  stage/     stage, walls, breakables
  render/    scene, character, effects, hitboxDebug
  face/      landmarker, faceWarp, faceMaterial, faceStore
  ui/        screens/*.ts + styles.css
  ai/        cpu
  data/      characters/*.json, stages/*.json
tests/       *.test.ts
```

## Verification commands

- `npx tsc --noEmit` — must pass (a hook runs it after every TS edit and reports errors to you; fix them right away).
- `npx vitest run` — must pass before ticking a step (once tests exist).
- `npm run build` — must pass before ticking a step.
- You cannot see the screen. For visual / feel checks, tell the human exactly what to test (practice mode, frame display), and point to the Claude app QA prompt in `docs/WEB_TASKS.md`.

## Handling feedback

When the human gives feel / balance feedback (`/tune ...`), change only values in `src/config/tuning.ts` or move frame data in `src/data/characters/*.json` unless the feedback needs new logic. Log every change in the "Tuning log" section of `PROGRESS.md` (old → new, reason).

## Don'ts

- Don't commit anything in `test-photos/`, generated face textures, licensed animations, or `.env` files.
- Don't add online play, accounts, or a backend.
- Don't rewrite working systems while doing an unrelated step.
- Don't `git push --force` or `git reset --hard`.
