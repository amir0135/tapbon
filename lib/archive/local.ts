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
