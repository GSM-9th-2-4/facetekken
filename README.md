# FaceTekken

A Tekken-style 3D browser fighting game where **your photo becomes the fighter's face**.
Personal fun project — not distributed.

| Doc | What |
|---|---|
| [SPEC.md](SPEC.md) | Full implementation spec (controls, frame data, Heat / Rage, face pipeline, milestones) |
| [PROGRESS.md](PROGRESS.md) | Step checklist the Claude Code harness works through |
| [CLAUDE.md](CLAUDE.md) | Rules for Claude Code |
| [docs/DESIGN.md](docs/DESIGN.md) | Design system (colors, type, screen specs) |
| [docs/design/mockups.html](docs/design/mockups.html) | Clickable UI mockups of every screen |
| [docs/REFERENCES.md](docs/REFERENCES.md) | System, visual, face-mapping, asset references |
| [docs/WEB_TASKS.md](docs/WEB_TASKS.md) | Prompts for the Claude app (assets, QA, design pass) |

## Run

```bash
npm install
npm run fetch-models   # MediaPipe face model + wasm (needed from step 7)
npm run dev            # http://localhost:5173
npm test               # Vitest
npm run build
```

Controls (default): P1 `WASD` + `U I J K` (1 2 3 4), `O` Heat, `L` Rage · P2 arrows + `Numpad 4 5 1 2`, `Numpad 6` Heat, `Numpad 3` Rage · `F1` debug overlay.

## Develop with Claude Code

```bash
claude
> /status      # where the build stands
> /next        # do the next step (subagent → QA → commit)
> /autopilot   # run all remaining steps
> /tune ...    # feel / balance feedback
> /bug ...     # paste an error or QA report
> /web-task    # prompt to run in the Claude app (assets / QA)
```

Harness (agents, commands, hooks) ported from [`GSM-9th-2-4/facekart`](https://github.com/GSM-9th-2-4/facekart).
