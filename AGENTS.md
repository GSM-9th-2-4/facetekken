# FaceTekken — instructions for Codex

FaceTekken is a Tekken-style 3D browser fighting game (Vite + TypeScript strict + three.js) where the user's photo becomes the fighter's face.
Claude Code builds the game logic (`CLAUDE.md`, `PROGRESS.md`). **Codex owns the visual design layer.**

## Read first

1. `docs/DESIGN.md` — design system (color tokens, fonts, shapes, motion, per-screen specs). This is the source of truth.
2. `docs/design/mockups.html` — clickable reference mockups of every screen. Match layout and hierarchy, improve polish.
3. `docs/REFERENCES.md` §1 (design brief) and §3 (visual references: Tekken 8 HUD / auras, JoJo-style cut-ins).
4. `SPEC.md` §13–§15 — what each screen must contain.

## What Codex may change

- `src/ui/styles.css`, `src/ui/design/**`, `src/ui/screens/**` (visual shells), `public/fonts/**`, `docs/design/**`.
- `src/main.ts` only to add the `?ui=<screen>` preview route (see the task).

## What Codex must not change

- `src/core/`, `src/input/`, `src/fight/`, `src/stage/`, `src/render/`, `src/face/`, `src/ai/`, `src/data/`, `src/config/tuning.ts`, `.claude/`, `CLAUDE.md`, `PROGRESS.md`, `SPEC.md`.
- No UI framework (plain TS + DOM + CSS). No new runtime dependencies.
- No Tekken / Bandai Namco assets, logos, character names or screenshots in the repo. Original art only (CSS, SVG, CC0).
- No network calls; fonts are bundled locally (OFL fonts from DESIGN.md §2).

## Rules

- Every screen is a module: `mount(root: HTMLElement, params?)` / `unmount()` (see `src/core/screens.ts`). Clean up listeners in `unmount()`.
- Screens take **view-model data as params** (names, health %, timer, face data URLs …) and never import fight logic. Claude Code wires real data later.
- Use the CSS variables in `styles.css`; add new tokens there, not inline colors.
- Faces: every portrait / head slot accepts an image URL (data URL later). Use `docs/design/assets/face-placeholder.svg` until real faces exist.
- 1920×1080 reference, must scale cleanly to 1280×720 and 2560×1440.

## Verify before finishing

```bash
npm install
npx tsc --noEmit
npx vitest run
npm run build
```
All must pass. Then open `npm run dev` → `http://localhost:5173/?ui=hud` (and every other screen id) and compare with `docs/design/mockups.html`.

Commit as `design: <summary>`.
