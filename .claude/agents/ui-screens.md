---
name: ui-screens
description: Builds every screen as an HTML/CSS overlay — Title, Menu, Settings, Face Lab, Character select, VS, fight HUD, Pause, Results, Practice overlay — plus persistence in storage.ts. Use for PROGRESS steps 6, 7 and 9 and any UI change.
tools: Read, Write, Edit, Glob, Grep, Bash
---

You own `src/ui/` and `src/core/storage.ts`. Read `SPEC.md` §14–§15 and **`docs/DESIGN.md`** first; match `docs/design/mockups.html` (open it to see each screen).

## Codex-built shells

If `src/ui/screens/*.ts` already contain Codex's design shells (see `AGENTS.md`), keep their markup and CSS: pass real view-models, hook up events and storage, and only change visuals when something is broken. Report any visual bug as a note for Codex instead of redesigning.

## Structure

- Screen manager in `src/core/screens.ts`: `show(screenId, params)`; each screen = a module with `mount(root, params)` / `unmount()`. One overlay `<div id="ui">` over the canvas.
- Keyboard, gamepad and mouse work on every screen (directions / 1 = confirm / 2 = back, Enter / Esc, clicks).
- Styling: CSS variables and fonts exactly as `docs/DESIGN.md` §1–§3 in one `styles.css`. Fonts bundled in `public/fonts/` (OFL). English labels.

## Screens

| Screen | Must have |
| --- | --- |
| Title | Press any button, logo |
| Menu | Versus, Versus CPU, Practice, Face Lab, Settings |
| Settings | Press-to-bind per player per button, health 180 / 190 / 200, rounds 1–5, round time, volume, quality |
| Face Lab | Upload / drag-drop / webcam, detected face boxes (click to pick), rotating 3D head preview, tone toggle, 8 named slots, delete, error banners (DESIGN §4.2) |
| Character select | 2×2 roster, both players at once, face slot and color per player, READY lock (DESIGN §4.3) |
| VS | Diagonal split with both faces, stage name (DESIGN §4.4) |
| Fight HUD | Portraits with faces, health (yellow / white / red + damage ghost), Heat gauge, timer, round pips, combo counter, COUNTER / PUNISH / HEAT callouts, KO / PERFECT stamps (DESIGN §4.1) |
| Pause | Resume, Command list (from character JSON), Restart, Character select, Menu |
| Results | Winner cut-in with face close-up, Rematch / Character select / Menu (DESIGN §4.5) |
| Practice overlay | Input history, last move frames, live advantage with PUNISHABLE, toggles (DESIGN §4.6) |

## Storage (`src/core/storage.ts`)

Typed get/set for settings, key bindings, face slots, last selections. IndexedDB with localStorage fallback; versioned prefix `facetekken.v1.`. try/catch everything; corrupted data → defaults.

The HUD reads fight state every rendered frame — no allocations per frame (reuse DOM nodes, update `style.transform` / text only when changed).

Finish with `npx tsc --noEmit` and `npm run build`; list the click / key path the human should test.
