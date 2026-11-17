# Progress

Claude Code: work top to bottom. Tick a step only when every "Done when" item is true and `npx tsc --noEmit`, `npx vitest run` and `npm run build` pass.
Owner legend: CC = Claude Code · App = Claude app (browser) · Me = human.
Spec milestones (SPEC §19) in brackets.

## Steps

- [x] **0. Spec + harness in repo** (App) — `SPEC.md`, `docs/`, `.claude/` exist.

- [x] **1. Project setup** (CC) [M0]
  - Done when: Vite + TS strict + Three.js project runs with `npm run dev`; fixed 60 Hz loop with interpolation; two primitive fighters stand on the `dojo` floor with lighting and a side camera; F1 debug overlay shows frame counter and both fighters' state; `src/config/tuning.ts` exists; Vitest runs; `npm run build` passes; folder layout from `CLAUDE.md` exists.

- [ ] **2. Free assets** (App — runs in parallel, not blocking)
  - Done when: the human has downloaded assets into `public/assets/` (or says to skip). Prompt: `docs/WEB_TASKS.md` → Task A.

- [ ] **2b. UI design** (Codex — runs in parallel, not blocking)
  - Done when: Codex finished `docs/CODEX_DESIGN_TASK.md`: fonts in `public/fonts/`, full design system in `src/ui/styles.css`, screen shells in `src/ui/screens/*.ts` with view-model params, `?ui=<screen>` preview route. Claude Code wires these shells instead of restyling them.

- [ ] **3. Movement + camera** (CC → `fight-engine`, `character-builder`) [M1]
  - Done when: keyboard 2P input with remappable bindings (SPEC §3.1) and Gamepad API; fighter-relative directions; walk forward / back, dash `f,f`, backdash `b,b`, run, crouch (D / DB / DF), sidestep (tap u / d) and sidewalk (hold), jumps; fighters face each other except during moves; camera follows the axis smoothly; pushbox keeps fighters from overlapping; F1 overlay shows input history.

- [ ] **4. Moves + hit detection + guard** (CC → `fight-engine`, `character-builder`) [M2]
  - Done when: input buffer + command parser (SPEC §3.3) with unit tests; moves load from `src/data/characters/*.json`; `kang` and `seo` have the SPEC §10.3 minimum move sets; hurt / hit capsules per bone; guard table (SPEC §5.2), counter hits, crush / power crush, tracking vs sidestep; `defenderStun()` produces exact `onBlock` / `onHit` advantage (unit tested); F2 hitbox debug; practice overlay shows startup / block / hit and live advantage.

- [ ] **5. Reactions, juggles, throws** (CC → `fight-engine`) [M3]
  - Done when: stagger / crumple / launch / juggle / tailspin / knockdown reactions; juggle gravity + damage scaling (SPEC §6.2, unit tested); down options, tech roll, wake-up kicks, ground hits; throws 1+3 / 2+4 / command throw with breaks (SPEC §7); each character's basic combo from its JSON connects; hitstop.

- [ ] **6. Gauges, rounds, HUD** (CC → `fight-engine`, `ui-screens`) [M4]
  - Done when: health 190 (setting 180 / 190 / 200); white health from chip damage that only recovers by attacking; Rage under 25% with Rage Art (armor, scaling damage, removes white health, timer freeze); Heat Burst (10 s) / Engager (15 s) / Smash / Dash, timer pauses, chip damage; rounds, 60 s timer, time over, KO / PERFECT / DOUBLE K.O., slow-mo on crossing final blows; HUD matches `docs/DESIGN.md` §4.1; all gauge rules unit tested; determinism test passes.

- [ ] **7. Face Lab** (CC → `face-pipeline`, `ui-screens`) [M5]
  - Done when: `@mediapipe/tasks-vision` installed; `npm run fetch-models` puts the model + wasm in `public/`; a photo (file / drag-drop / webcam) → detection (0 / 1 / many faces, yaw check) → canonical-UV warped 512×512 face texture → applied on the fighter's head bone with skin-tone tint; Lv1 decal fallback; HUD portraits use the face; up to 8 named slots in IndexedDB; nothing is uploaded anywhere.

- [ ] **8. Stages + presentation** (CC → `stage-builder`, `fight-engine`) [M6]
  - Done when: `dojo`, `rooftop`, `gym` from `src/data/stages/*.json`; wall collision, wall splat (damage scaling), breakable / hard walls, floor and balcony breaks moving the fight to the next area; Heat Smash breaks hard walls in one hit; hit sparks by level, Heat / Rage auras, camera shake, Rage Art / Heat Smash / break camera cuts; `?stage=<id>` works.

- [ ] **9. Full game** (CC → `ui-screens`, `character-builder`, `cpu-ai`) [M7]
  - Done when: Title → Menu → (Face Lab, Settings) → Character select (character + face slot + color) → VS → Fight → Results → Rematch / select works by keyboard, pad and mouse; `bae` and `yun` added; CPU easy / normal / hard; full practice mode (dummy actions, record / playback, frame display, hitboxes, infinite health); CC0 sound effects; assets from `public/assets/` replace primitives where available; no console errors in a full match on every stage.

- [ ] **10. Final QA** (App + Me)
  - Done when: Claude app ran `docs/WEB_TASKS.md` Task B on every screen and stage; the human played every character; all reported bugs fixed.

## Tuning log

| Date | Value | Old → New | Reason |
| --- | --- | --- | --- |

## Decisions log

Record any choice made without asking (one line each).

- Step 1: fighters are primitives (sphere head + capsules) with rig-style joint names so the Quaternius model can replace them later without changing hit capsules or the face mount.
- Step 1: health default 190 (Tekken 8 patch 3.02.01), selectable 180 / 190 / 200.
