/**
 * localStorage persistence for the workspace. Stores the plain array produced by
 * `workspace('serialize')` under a versioned key. All access is guarded so a
 * disabled/full/corrupt store degrades to "no persistence" rather than throwing.
 */
const KEY = 'similex.workspace.v1';

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable or full — ignore */
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
