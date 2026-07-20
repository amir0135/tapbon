'use client';

// Kunde-arkiv på telefonen — uden konto, nul PII (specs/customer-archive.md).
// localStorage 'tapbon-archive': [{id, merchant, totalGross, currency, kind, issuedAt}]

export type ArchiveEntry = {
  id: string;
  merchant: string;
  totalGross: number;
  currency: string;
  kind: 'structured' | 'file';
  issuedAt: string; // ISO
};

const KEY = 'tapbon-archive';
const MAX_ENTRIES = 300;

export function readArchive(): ArchiveEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveToArchive(entry: ArchiveEntry): ArchiveEntry[] {
  const rest = readArchive().filter((e) => e.id !== entry.id);
  const next = [entry, ...rest].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage fuld/blokeret — arkivet er best effort
  }
  return next;
}

export function removeFromArchive(id: string): ArchiveEntry[] {
  const next = readArchive().filter((e) => e.id !== id);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

/** Merge server-entries ind (sync) — union på id, nyeste først. */
export function mergeIntoArchive(incoming: ArchiveEntry[]): ArchiveEntry[] {
  const byId = new Map<string, ArchiveEntry>();
  for (const e of [...incoming, ...readArchive()]) {
    if (!byId.has(e.id)) byId.set(e.id, e);
  }
  const next = [...byId.values()]
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
    .slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

// Auto-gem-præference (specs/customer-profile.md) — default TIL.
const AUTOSAVE_KEY = 'tapbon-autosave';

export function readAutoSave(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(AUTOSAVE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setAutoSave(on: boolean) {
  try {
    if (on) localStorage.removeItem(AUTOSAVE_KEY);
    else localStorage.setItem(AUTOSAVE_KEY, 'off');
  } catch {}
}
