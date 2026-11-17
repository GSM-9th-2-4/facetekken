import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const dir = fileURLToPath(new URL('../src/data/characters/', import.meta.url));
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

/**
 * Frame data sanity (SPEC §5). The full advantage → stun test arrives with defenderStun() in step 4.
 */
describe.each(files)('character data %s', (file) => {
  const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));

  it('has unique move ids and valid string links', () => {
    const ids = new Set<string>();
    for (const m of data.moves) {
      expect(ids.has(m.id), `duplicate ${m.id}`).toBe(false);
      ids.add(m.id);
    }
    for (const m of data.moves) for (const n of m.next) expect(ids.has(n), `${m.id} → ${n}`).toBe(true);
  });

  it('has positive integer frame counts', () => {
    for (const m of data.moves) {
      for (const k of ['startup', 'active', 'recovery']) {
        expect(Number.isInteger(m[k]) && m[k] >= 1, `${m.id}.${k}`).toBe(true);
      }
    }
  });

  it('has a 10-frame jab (SPEC §10.3)', () => {
    expect(data.moves.some((m: { startup: number; hitLevel: string[] }) => m.startup === 10)).toBe(true);
  });
});
