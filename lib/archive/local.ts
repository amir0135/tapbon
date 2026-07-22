'use client';

// Device-lokale rester efter konto-først-skiftet (specs/customer-account.md v3):
// arkiv-læsning bruges KUN til engangsmigrering til kontoen; præferencer
// (auto-gem, bekræftelse, lyd) er stadig lokale.
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

/** Ryd det lokale arkiv — kaldes efter vellykket migrering til kontoen. */
export function clearArchive() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
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

// Gem-bekræftelse + lydeffekt (specs/customer-profile.md) — begge default TIL.
const SAVE_CONFIRM_KEY = 'tapbon-save-confirm';
const SAVE_SOUND_KEY = 'tapbon-save-sound';

function readOnPref(key: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(key) !== 'off';
  } catch {
    return true;
  }
}

function setOnPref(key: string, on: boolean) {
  try {
    if (on) localStorage.removeItem(key);
    else localStorage.setItem(key, 'off');
  } catch {}
}

export const readSaveConfirm = () => readOnPref(SAVE_CONFIRM_KEY);
export const setSaveConfirm = (on: boolean) => setOnPref(SAVE_CONFIRM_KEY, on);
export const readSaveSound = () => readOnPref(SAVE_SOUND_KEY);
export const setSaveSound = (on: boolean) => setOnPref(SAVE_SOUND_KEY, on);
