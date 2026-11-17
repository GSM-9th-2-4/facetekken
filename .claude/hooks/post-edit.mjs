#!/usr/bin/env node
// PostToolUse hook: after Claude edits a file, give it immediate feedback.
// - src/data/**/*.json -> must parse; characters/*.json and stages/*.json must match the schema
// - *.ts / *.tsx       -> tsc --noEmit (only once the project is set up)
// Exit 2 + stderr = Claude sees the problem and fixes it. Exit 0 = silent.
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, relative, sep } from 'node:path';

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

const input = readStdin();
const filePath = input?.tool_input?.file_path;
if (!filePath) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const rel = relative(projectDir, filePath).split(sep).join('/');
const fail = (msg) => {
  process.stderr.write(`[post-edit hook] ${msg}\n`);
  process.exit(2);
};

// ---- data files -----------------------------------------------------------
if (rel.startsWith('src/data/') && rel.endsWith('.json')) {
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (e) {
    fail(`${rel} is not valid JSON: ${e.message}`);
  }

  if (rel.startsWith('src/data/characters/')) {
    const problems = [];
    for (const key of ['id', 'name', 'style']) {
      if (typeof data?.[key] !== 'string' || !data[key]) problems.push(`missing string "${key}"`);
    }
    if (!data?.faceAnchor || typeof data.faceAnchor.bone !== 'string') problems.push('"faceAnchor.bone" is required');
    if (!Array.isArray(data?.moves) || data.moves.length === 0) problems.push('"moves" must be a non-empty array');
    const ids = new Set();
    const LEVELS = new Set(['h', 'm', 'l', 'sm', 't']);
    const TRACK = new Set(['linear', 'trackLeft', 'trackRight', 'homing']);
    const isAdv = (v) => v === null || Number.isInteger(v) || (typeof v === 'string' && v.length > 0);
    for (const [i, m] of (data?.moves ?? []).entries()) {
      const where = `moves[${i}]${m?.id ? ` (${m.id})` : ''}`;
      if (typeof m?.id !== 'string' || !m.id) problems.push(`${where}: missing "id"`);
      else if (ids.has(m.id)) problems.push(`${where}: duplicate id`);
      else ids.add(m.id);
      if (typeof m?.input !== 'string' || !m.input) problems.push(`${where}: missing "input"`);
      if (!Array.isArray(m?.hitLevel) || !m.hitLevel.length || !m.hitLevel.every((h) => LEVELS.has(h)))
        problems.push(`${where}: hitLevel must be a non-empty array of h|m|l|sm|t`);
      if (!Array.isArray(m?.damage) || !m.damage.every((d) => typeof d === 'number' && d >= 0))
        problems.push(`${where}: damage must be an array of numbers >= 0`);
      for (const k of ['startup', 'active', 'recovery']) {
        if (!Number.isInteger(m?.[k]) || m[k] < 1) problems.push(`${where}: ${k} must be an integer >= 1 frame`);
      }
      for (const k of ['onBlock', 'onHit', 'onCounter']) {
        if (!isAdv(m?.[k])) problems.push(`${where}: ${k} must be an integer, a reaction keyword, or null`);
      }
      if (!TRACK.has(m?.tracking)) problems.push(`${where}: tracking must be linear|trackLeft|trackRight|homing`);
      if (!Array.isArray(m?.next)) problems.push(`${where}: "next" must be an array`);
    }
    for (const [i, m] of (data?.moves ?? []).entries()) {
      for (const n of m?.next ?? []) if (!ids.has(n)) problems.push(`moves[${i}] (${m.id}): next "${n}" does not exist`);
    }
    if (problems.length) fail(`${rel} problems:\n- ${problems.join('\n- ')}`);
  }

  if (rel.startsWith('src/data/stages/')) {
    const problems = [];
    for (const key of ['id', 'name']) {
      if (typeof data?.[key] !== 'string') problems.push(`missing string "${key}"`);
    }
    if (!Array.isArray(data?.areas) || !data.areas.length) problems.push('"areas" must be a non-empty array');
    const areaIds = new Set((data?.areas ?? []).map((a) => a?.id));
    for (const [i, a] of (data?.areas ?? []).entries()) {
      if (!(a?.floor?.width > 0 && a?.floor?.depth > 0)) problems.push(`areas[${i}]: floor.width/depth must be > 0`);
      for (const [j, w] of (a?.walls ?? []).entries()) {
        const ok = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
        if (!ok(w?.from) || !ok(w?.to)) problems.push(`areas[${i}].walls[${j}]: from/to must be [x, z]`);
        if (!['normal', 'breakable', 'hard'].includes(w?.type)) problems.push(`areas[${i}].walls[${j}]: type must be normal|breakable|hard`);
        if (w?.nextArea && !areaIds.has(w.nextArea)) problems.push(`areas[${i}].walls[${j}]: nextArea "${w.nextArea}" not found`);
      }
    }
    if (problems.length) fail(`${rel} problems:\n- ${problems.join('\n- ')}`);
  }
  process.exit(0);
}

// ---- TypeScript -----------------------------------------------------------
if (!/\.(ts|tsx|mts)$/.test(rel) || rel.startsWith('node_modules/')) process.exit(0);

const hasTs = existsSync(join(projectDir, 'node_modules', 'typescript'));
const tsconfig = ['tsconfig.app.json', 'tsconfig.json'].find((f) => existsSync(join(projectDir, f)));
if (!hasTs || !tsconfig) process.exit(0); // project not set up yet

try {
  execSync(`npx --no-install tsc --noEmit -p ${tsconfig}`, {
    cwd: projectDir,
    stdio: 'pipe',
    timeout: 80_000,
    encoding: 'utf8',
  });
} catch (e) {
  if (e.code === 'ETIMEDOUT' || e.signal) process.exit(0); // don't block on a slow machine
  const out = `${e.stdout || ''}${e.stderr || ''}`.trim().split('\n');
  const shown = out.slice(0, 30).join('\n');
  const more = out.length > 30 ? `\n... ${out.length - 30} more lines` : '';
  fail(`TypeScript errors after editing ${rel} — fix them now:\n${shown}${more}`);
}
process.exit(0);
