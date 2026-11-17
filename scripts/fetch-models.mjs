#!/usr/bin/env node
// Downloads the MediaPipe Face Landmarker model and copies the tasks-vision wasm into public/.
// Both destinations are gitignored. Safe to re-run: existing files are skipped.
// Used from step 7 (face-pipeline). Requires `npm i @mediapipe/tasks-vision` for the wasm copy.
import { createWriteStream, existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const modelPath = join(root, 'public', 'models', 'face_landmarker.task');

async function download(url, dest) {
  if (existsSync(dest) && statSync(dest).size > 0) {
    console.log(`✓ ${dest.replace(root + '/', '')} already exists`);
    return;
  }
  mkdirSync(dirname(dest), { recursive: true });
  console.log(`↓ ${url}`);
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const total = Number(res.headers.get('content-length') ?? 0);
  let got = 0;
  const body = Readable.fromWeb(res.body);
  body.on('data', (chunk) => {
    got += chunk.length;
    if (total) process.stdout.write(`\r  ${((got / total) * 100).toFixed(0)}% of ${(total / 1e6).toFixed(1)} MB`);
  });
  await pipeline(body, createWriteStream(dest));
  process.stdout.write('\n');
  console.log(`✓ saved ${dest.replace(root + '/', '')}`);
}

function copyWasm() {
  const src = join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
  const dest = join(root, 'public', 'mediapipe');
  if (!existsSync(src)) {
    console.log('… @mediapipe/tasks-vision not installed yet (step 7) — skipping wasm copy');
    return;
  }
  mkdirSync(dest, { recursive: true });
  for (const f of readdirSync(src)) copyFileSync(join(src, f), join(dest, f));
  console.log(`✓ copied wasm → public/mediapipe/`);
}

try {
  await download(MODEL_URL, modelPath);
  copyWasm();
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
