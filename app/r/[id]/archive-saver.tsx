'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookMarked, ArrowRight } from 'lucide-react';
import { saveToArchive, type ArchiveEntry } from '@/lib/archive/local';

/** Gemmer kvitteringen i telefonens arkiv ved visning + tilbud om "alle ét sted". */
export function ArchiveSaver({ entry }: { entry: ArchiveEntry }) {
  const t = useTranslations('archive');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(saveToArchive(entry).length);
    // Synk til kunde-konto hvis logget ind (no-op ellers — 401 ignoreres)
    fetch('/api/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiptIds: [entry.id] }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id]);

  if (count === null || count < 1) return null;

  return (
    <Link
      href="/mine"
      className="w-full bg-paper rounded-2xl shadow-sm p-4 flex items-center gap-3 active:scale-[0.99] transition print:hidden"
    >
      <BookMarked className="h-5 w-5 text-accent shrink-0" aria-hidden="true" />
      <span className="flex-1 min-w-0">
        <span className="block font-medium">{t('pitchTitle')}</span>
        <span className="block text-sm text-muted-foreground">
          {t('pitchSub', { count })}
        </span>
      </span>
      <ArrowRight className="h-5 w-5 text-accent shrink-0" aria-hidden="true" />
    </Link>
  );
}
