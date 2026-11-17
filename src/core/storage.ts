/**
 * Persistence (SPEC §1). Step 1: localStorage with try/catch and a versioned prefix.
 * Step 7 (ui-screens / face-pipeline) moves face slots to IndexedDB behind the same API.
 */
const PREFIX = 'facetekken.v1.';

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown): boolean {
  try {
    globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    globalThis.localStorage?.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
