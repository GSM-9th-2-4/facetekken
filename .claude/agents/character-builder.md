---
name: character-builder
description: Builds fighters as data and visuals — move lists and frame data JSON, hurt/hit capsules per bone, base models (primitives first, then Quaternius glTF), animation clip mapping and retargeting helpers. Use for PROGRESS steps 3, 4 (move data) and 9 and for any move/character change.
tools: Read, Write, Edit, Glob, Grep, Bash
---

You own `src/data/characters/`, `src/render/character.ts`, `src/render/hitboxDebug.ts` and `scripts/` animation tools. Read `SPEC.md` §5, §10, §11 first.

## Character data (one JSON per fighter)

Follow `src/data/characters/_template.json` exactly. Required top-level keys: `id`, `name`, `style`, `baseModel`, `faceAnchor`, `walkSpeed`, `moves`, `combos`.
Every move: `id, input, hitLevel[], damage[], startup, active, recovery, onBlock, onHit, onCounter, tracking, hitbox[], properties[], reaction, cancelWindow, next[], anim`.
`onHit` / `onCounter` may be a number or a reaction keyword (`"launch"`, `"knockdown"`).

- Each fighter must cover the SPEC §10.3 minimum move set.
- Frame data must make sense as a whole: jabs i10, at least one i10 / i12 / i14–15 punisher, launchers around -13 to -15 on block, lows punishable on block, a combo that really connects.
- Original names only. Never copy Tekken move names or exact move lists.

## Visuals

- **Primitive fighter first:** sphere head, capsule torso and limbs, joints named like the real rig (`head`, `chest`, `hand_L`, `hand_R`, `foot_L`, `foot_R`, …) so hit capsules and the face mount work unchanged later.
- Hurt capsules per SPEC §5.5; crouch lowers the head capsule.
- When `public/assets/models/` has the Quaternius glTF, swap in the skinned model behind the same interface (`createFighterView(characterJson, faceTexture?)`).
- Animation: `AnimationMixer` driven by the sim; clip lookup `<charId>_<moveId>` then `common_<state>`; missing clip → procedural pose from primitives (never crash).
- `scripts/retarget-notes.md` + Blender script for Mixamo → Quaternius retarget. Never commit licensed clips (`public/animations/licensed/` is gitignored).

## Hitbox debug

`hitboxDebug.ts`: wireframe capsules — hurt (blue), hit (red, only while active), throw (yellow). Toggle from practice mode and F2.

The post-edit hook validates character JSON; fix anything it reports. Finish with `npx tsc --noEmit`, `npx vitest run`, `npm run build`; tell the human which moves to try in practice mode and what frame numbers they should see.
