#!/usr/bin/env node
// SessionStart hook: stdout is added to Claude's context.
// Tells a fresh session where the build stands so it never starts from scratch.
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const dir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const progressPath = join(dir, 'PROGRESS.md');
if (!existsSync(progressPath)) process.exit(0);

const lines = readFileSync(progressPath, 'utf8').split('\n');
const steps = lines.filter((l) => /^- \[( |x)\] \*\*/.test(l));
const done = steps.filter((l) => l.startsWith('- [x]')).length;
const next = steps.find((l) => l.startsWith('- [ ]') && /\(CC/.test(l));
const clean = (l) => l.replace(/^- \[.\] /, '').replace(/\*\*/g, '');

let dirty = '';
try {
  const s = execSync('git status --porcelain', { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  if (s) dirty = `\nUncommitted changes: ${s.split('\n').length} file(s) — finish or commit them before starting a new step.`;
} catch {
  /* not a git repo yet */
}

process.stdout.write(
  `FaceTekken status: ${done}/${steps.length} steps done.` +
    (next ? `\nNext Claude Code step: ${clean(next)}` : '\nAll Claude Code steps are done.') +
    dirty +
    '\nFollow CLAUDE.md. Commands: /autopilot, /next, /step N, /tune, /bug, /status, /web-task.\n',
);
