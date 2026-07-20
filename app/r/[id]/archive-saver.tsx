'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookMarked, ArrowRight, BookmarkPlus } from 'lucide-react';
import { readAutoSave, saveToArchive, type ArchiveEntry } from '@/lib/archive/local';

function pushToAccount(id: string) {
  // Synk til kunde-konto hvis logget ind (no-op ellers — 401 ignoreres)
  fetch('/api/archive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiptIds: [id] }),
  }).catch(() => {});
}

/** Gemmer kvitteringen i telefonens arkiv ved visning + tilbud om "alle ét sted".
 *  Respekterer auto-gem-præferencen (specs/customer-profile.md) — fra ⇒ manuel Gem-knap. */
export function ArchiveSaver({ entry }: { entry: ArchiveEntry }) {
  const t = useTranslations('archive');
  const [count, setCount] = useState<number | null>(null);
  const [needsSave, setNeedsSave] = useState(false);

  useEffect(() => {
    if (readAutoSave()) {
      setCount(saveToArchive(entry).length);
      pushToAccount(entry.id);
    } else {
      setNeedsSave(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id]);

  if (needsSave) {
    return (
      <button
        onClick={() => {
          setCount(saveToArchive(entry).length);
          pushToAccount(entry.id);
          setNeedsSave(false);
        }}
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
    );
  }

  if (count === null || count < 1) return null;

  return (
    <Link
      href="/mine"
      className="w-full bg-paper rounded-2xl shadow-sm p-3.5 flex items-center gap-3 active:scale-[0.99] transition print:hidden"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
        <BookMarked className="h-4 w-4 text-forest" aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-ink">{t('pitchTitle')}</span>
        <span className="block text-sm text-muted-foreground">
          {t('pitchSub', { count })}
        </span>
      </span>
      <ArrowRight className="h-5 w-5 text-forest shrink-0" aria-hidden="true" />
    </Link>
  );
}
