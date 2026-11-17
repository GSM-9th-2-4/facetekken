---
description: Print the Claude app (browser) prompt the human should run now
argument-hint: [A | B | step number]
---

The human will paste a prompt into the Claude app (with Claude in Chrome) for browser-only work.

Read `docs/WEB_TASKS.md`. Pick the task matching `$ARGUMENTS` (default: the task due for the current step in `PROGRESS.md`). Print the prompt in a single code block, filled in with current details (dev server URL from `vite.config.ts`, screens, characters and stages that exist right now, the step just finished). Nothing else.

If the dev server is not running, tell the human to run `npm run dev` first.
