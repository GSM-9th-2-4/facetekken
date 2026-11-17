---
description: Build the whole game — run every unchecked step in PROGRESS.md in order without stopping
---

Run the full build autonomously.

Loop until every Claude Code step in `PROGRESS.md` is ticked:

1. Take the first unchecked step owned by CC. Skip App / Me steps (step 2 assets is non-blocking; step 10 is for the human).
2. Follow the "How to work" procedure in `CLAUDE.md`: delegate to the owning subagent → run `qa-verifier` → fix until verdict READY → tick the box → commit.
3. Print a 3-line checkpoint: step done, what the human can test now, any Claude app task due (`docs/WEB_TASKS.md`).
4. Continue to the next step immediately. Do not wait for confirmation.

Rules:
- If a step fails QA three times on the same problem, record it in `PROGRESS.md` "Decisions log", choose the simplest working fallback, and move on.
- If `public/assets/` is empty at step 9, keep primitive fighters and finish the rest of step 9.
- At the end, print: summary of all steps, how to run (`npm install && npm run fetch-models && npm run dev`), and the full test list for the human.
