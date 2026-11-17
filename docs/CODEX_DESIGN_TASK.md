# Codex task — build the FaceTekken UI design

Paste the block below into Codex (cloud task or CLI) with this repo selected.

```
Build the visual design layer of FaceTekken exactly following AGENTS.md.

Sources of truth (read all before coding):
- docs/DESIGN.md (tokens, type, shapes, motion, screen specs §4.1–4.6)
- docs/design/mockups.html (reference layout for every screen — match it, then polish)
- docs/REFERENCES.md §1 design brief and §3 visual references (Tekken 8 HUD and Heat/Rage auras, JoJo-style cut-ins and ゴゴゴ lettering)
- SPEC.md §13–15 (required content per screen)

Deliverables:
1. public/fonts/: Anton, Oswald, Chakra Petch, Inter, Dela Gothic One (OFL, woff2) + @font-face in src/ui/styles.css. Include each font's OFL license file.
2. src/ui/styles.css: complete design system — all tokens from DESIGN.md §1, typography classes, chamfered panels, buttons (default / primary / focused / disabled), skewed health bars with yellow / white (recoverable) / red (Rage) / damage-ghost layers, Heat gauge with glow, callouts (COUNTER / PUNISH / HEAT), stamps (K.O. / PERFECT / DOUBLE K.O.), cut-in animation keyframes.
3. docs/design/assets/face-placeholder.svg: neutral original face placeholder.
4. src/ui/screens/*.ts — one module per screen, each exporting a Screen ({ mount, unmount }) that renders from a typed view-model param with mock defaults:
   title, menu, settings, faceLab, characterSelect, vs, hud, pause, results, practice.
   - hud: portraits (face image), health bars driven by fractions (health, recoverable, ghost, rage flag), Heat gauge fraction + active flag, timer, round pips, combo counter, callout queue. Expose update(vm) that only touches changed nodes (no per-frame allocations).
   - faceLab: drop zone + Upload / Webcam buttons (emit events, no logic), detected-photo panel with clickable face boxes, preview area container, 8 slots, error banner variants (no-face, turn-to-front, pick-one).
   - characterSelect: 2×2 roster, P1 / P2 panels with face slot row, color A/B, READY stamp; keyboard focus states.
   - vs, results (winner cut-in with ゴゴゴ / ドドド lettering), practice overlay (input history, frame panel with PUNISHABLE state, toggles), pause, settings (key-binding rows), title, menu.
5. src/ui/design/preview.ts + a `?ui=<screenId>` route in src/main.ts that mounts any screen with mock data over a dark animated background (don't start the fight scene in this mode). `?ui=index` lists all screens as links.
6. Keyboard / mouse focus styles on every interactive element; screens readable at 1280×720.

Constraints: plain TS + DOM + CSS, no new runtime dependencies, no network calls, no Tekken / Bandai Namco assets or names, don't touch files AGENTS.md marks as off-limits.

Verify: npx tsc --noEmit, npx vitest run, npm run build all pass. Take screenshots of every ?ui= screen at 1920×1080 and 1280×720, compare to docs/design/mockups.html, fix overlaps / cut-off text, and attach the screenshots to the task result. Commit as "design: UI design system and screen shells".
```

After Codex finishes: in Claude Code, run `/status` — steps 6, 7 and 9 (`ui-screens`) will wire these shells to real game data instead of building screens from scratch.
