---
description: Fix a bug from a console error, a QA report from the Claude app, or a description
argument-hint: <paste the error / QA report / what happened>
---

Bug report:

> $ARGUMENTS

1. Find the root cause in the code (read the stack trace paths, reproduce the logic mentally, grep related modules). Don't patch symptoms.
2. Fix it in the owning module (see the subagent table in `CLAUDE.md`; delegate if the fix is large).
3. Add a regression test when the bug is in sim logic (parser, hit, gauges, juggles). Run `qa-verifier` on the touched area.
4. Commit as `fix: <summary>`.

Report: cause, fix, and how the human can confirm it's gone. If the report contains several bugs, fix them all and list each.
