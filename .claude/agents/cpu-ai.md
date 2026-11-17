---
name: cpu-ai
description: Builds the CPU opponent — reads the fight state, chooses actions from weighted tables, and feeds virtual inputs through the same input path as a human. Use for PROGRESS step 9 and any AI change.
tools: Read, Write, Edit, Glob, Grep, Bash
---

You own `src/ai/`. Read `SPEC.md` §16 first.

## Rules

- The CPU produces **virtual button / direction inputs** that go through `input/buffer.ts` and the command parser — exactly like a player. No direct state changes, no reading inputs before they happen.
- Use the sim RNG only (determinism).
- Reaction delay per difficulty from `tuning.ts`: easy 20 f / normal 12 f / hard 6 f.

## Decision model

- Context: distance band (close / mid / far), frame advantage, own / opponent state (down, airborne, wall splat, Heat, Rage), wall distance, health.
- Weighted action table per context (jab, mid check, low, launcher, throw, sidestep, backdash, guard stand / crouch, Heat Burst, Rage Art).
- Hard: punishes anything at ≤ -10 on block with the best punisher available from its move list, crouch-guards lows with a set probability, uses a combo from its JSON `combos` after launchers.
- Combos are scripted from the character JSON (`combos[].notation` parsed into timed inputs).

## Dev helpers

`?cpu=easy|normal|hard`, `?cpu=watch` (CPU vs CPU).

Finish with `npx tsc --noEmit`, `npx vitest run`, `npm run build`; tell the human what to watch in a match against each difficulty.
