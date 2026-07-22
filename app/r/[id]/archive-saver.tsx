'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookMarked, ArrowRight, BookmarkPlus, Check, UserPlus } from 'lucide-react';
import { readAutoSave, readSaveConfirm, readSaveSound } from '@/lib/archive/local';

function saveToAccount(id: string) {
  return fetch('/api/archive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiptIds: [id] }),
  });
}

/** Kort „kvitteringsprinter“-klik via WebAudio — ingen lyd-asset nødvendig. */
function playPrinterClick() {
  try {
    const Ctx = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 950 + i * 180;
      gain.gain.setValueAtTime(0.06, now + i * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.045 + 0.04);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.045);
      osc.stop(now + i * 0.045 + 0.05);
    }
    setTimeout(() => void ctx.close(), 400);
  } catch {
    // Lyd er best effort
  }
}

/** Konto-først (specs/customer-account.md v3): logget ind ⇒ gem på kontoen
 *  (auto eller manuelt efter præference); logget ud ⇒ konto-pitch → /mine. */
export function ArchiveSaver({
  receiptId,
  signedIn,
}: {
  receiptId: string;
  signedIn: boolean;
}) {
  const t = useTranslations('archive');
  const [saved, setSaved] = useState(false);
  const [needsSave, setNeedsSave] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Gem-bekræftelse + printerlyd (specs/customer-profile.md) — respekterer præferencer
  const celebrate = () => {
    if (readSaveSound()) playPrinterClick();
    if (readSaveConfirm()) {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 2000);
    }
  };

  const doSave = () => {
    saveToAccount(receiptId)
      .then((r) => {
        if (r.ok) {
          setSaved(true);
          setNeedsSave(false);
          celebrate();
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!signedIn) return;
    if (readAutoSave()) doSave();
    else setNeedsSave(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptId, signedIn]);

  const toast = confirmed ? (
    <div
      role="status"
      className="fixed inset-x-0 top-4 z-50 mx-auto w-fit rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-lg print:hidden flex items-center gap-2"
    >
      <Check className="h-4 w-4 text-mint" aria-hidden="true" />
      {t('savedToast')}
    </div>
  ) : null;

  if (!signedIn) {
    // Konto-pitch — bonen er set, men gem kræver konto (Receiptile-vejen)
    return (
      <Link
        href="/mine"
        className="w-full bg-paper rounded-2xl shadow-sm p-3.5 flex items-center gap-3 active:scale-[0.99] transition print:hidden"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
          <UserPlus className="h-4 w-4 text-forest" aria-hidden="true" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-ink">
            {t('accountPitchTitle')}
          </span>
          <span className="block text-sm text-muted-foreground">
            {t('accountPitchSub')}
          </span>
        </span>
        <ArrowRight className="h-5 w-5 text-forest shrink-0" aria-hidden="true" />
      </Link>
    );
  }

  if (needsSave) {
    return (
      <>
        {toast}
        <button
          onClick={doSave}
          className="w-full bg-paper rounded-2xl shadow-sm p-3.5 flex items-center gap-3 active:scale-[0.99] transition print:hidden text-left"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
            <BookmarkPlus className="h-4 w-4 text-forest" aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-ink">{t('saveManualTitle')}</span>
            <span className="block text-sm text-muted-foreground">{t('saveManualSub')}</span>
          </span>
          <ArrowRight className="h-5 w-5 text-forest shrink-0" aria-hidden="true" />
        </button>
      </>
    );
  }

  if (!saved) return toast;

  return (
    <>
      {toast}
      <Link
        href="/mine"
        className="w-full bg-paper rounded-2xl shadow-sm p-3.5 flex items-center gap-3 active:scale-[0.99] transition print:hidden"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
          <BookMarked className="h-4 w-4 text-forest" aria-hidden="true" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-ink">{t('pitchTitle')}</span>
          <span className="block text-sm text-muted-foreground">{t('savedSub')}</span>
        </span>
        <ArrowRight className="h-5 w-5 text-forest shrink-0" aria-hidden="true" />
      </Link>
    </>
  );
}
