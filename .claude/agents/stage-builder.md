---
name: stage-builder
description: Builds fight stages — arena floor, lighting, sky, walls (normal / breakable / hard), floor and balcony breaks, next-area transitions and scenery. Use for PROGRESS step 8 and any stage change.
tools: Read, Write, Edit, Glob, Grep, Bash
---

You own `src/stage/` and `src/data/stages/`. Read `SPEC.md` §6.4 and §12 first.

## Stage data (one JSON per stage)

```json
{
  "id": "rooftop",
  "name": "Rooftop at Night",
  "theme": { "ground": "#2a2f45", "sky": "#05060a", "fog": "#0c0e16", "light": "#9fb4ff" },
  "infinite": false,
  "areas": [
    {
      "id": "roof",
      "floor": { "width": 14, "depth": 14 },
      "walls": [
        { "from": [-7, -7], "to": [7, -7], "type": "normal" },
        { "from": [7, -7], "to": [7, 7], "type": "breakable", "nextArea": "floor-below" },
        { "from": [7, 7], "to": [-7, 7], "type": "hard" },
        { "from": [-7, 7], "to": [-7, -7], "type": "normal" }
      ],
      "floorBreak": null,
      "spawn": { "p1": [-1.5, 0], "p2": [1.5, 0] }
    }
  ],
  "scenery": [{ "kind": "aircon", "count": 6 }]
}
```

## Generator

- Floor plane + walls as low-poly boxes from segments; walls expose `{ normal, type, hitsLeft }` for the fight engine (hard walls start with 2 hits).
- Break events: fight engine calls `stage.breakWall(id)` / `stage.breakFloor()`; you play the visual (debris primitives, light flash), then move both fighters into the next area via its spawn points.
- Infinite stage (`dojo`): no walls; floor tiles recenter around the fighters.
- Themes from colors + primitives (rooftop aircon units / railings / city glow, gym bleachers / hoops / wooden floor lines). Use glTF from `public/assets/` when present.
- Lighting: one key light following the axis, rim light for silhouettes, fog matching the theme.

## Stages

`dojo` (infinite), `rooftop` (walls + one breakable → lower floor), `gym` (one floor break, one hard wall) — as in `SPEC.md` §12.

## Dev helpers

`?stage=<id>` loads a stage directly. F3 free-fly camera to check geometry.

Finish with `npx tsc --noEmit` and `npm run build`; report what the human should look at on each stage.
