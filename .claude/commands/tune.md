---
description: Apply feel / balance feedback from a play session
argument-hint: <what felt wrong, e.g. "sidestep too slow, kang df1 should be +1 on block, juggles drop too early">
---

The human played the game. Their feedback:

> $ARGUMENTS

Use the `fight-engine` subagent (and `character-builder` for move data):
1. Map each piece of feedback to specific values: system constants in `src/config/tuning.ts`, or move frame data / damage in `src/data/characters/<id>.json` if it is about one move or character.
2. Change them in small steps (10–25%, or 1–2 frames). Only add new logic if no value can express the fix. Don't change `[T8]` values unless the feedback explicitly asks for it.
3. Update `SPEC.md` if a `[tune]` value listed there changed.
4. Log every change in `PROGRESS.md` → "Tuning log" (value, old → new, reason).
5. `npx tsc --noEmit`, `npx vitest run` (frame-advantage tests must still match the data), commit as `tune: <summary>`.

Report the changes as a short table and tell the human exactly what to try again in practice mode.
