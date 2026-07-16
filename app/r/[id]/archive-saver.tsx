'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookMarked } from 'lucide-react';
import { saveToArchive, type ArchiveEntry } from '@/lib/archive/local';

/** Gemmer kvitteringen i telefonens arkiv ved visning + link til /mine. */
export function ArchiveSaver({ entry }: { entry: ArchiveEntry }) {
  const t = useTranslations('archive');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(saveToArchive(entry).length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id]);

  if (count === null || count < 1) return null;

  return (
    <Link
      href="/mine"
      className="w-full bg-paper rounded-2xl shadow-sm p-4 flex items-center gap-3 active:scale-[0.99] transition print:hidden"
    >
      <BookMarked className="h-5 w-5 text-accent shrink-0" aria-hidden="true" />
      <span className="font-medium">{t('viewAll', { count })}</span>
    </Link>
  );
}
