'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, ReceiptText, Trash2 } from 'lucide-react';
import {
  readArchive,
  removeFromArchive,
  type ArchiveEntry,
} from '@/lib/archive/local';
import { formatMoney } from '@/lib/receipts/format';

/** "Mine kvitteringer" — arkiv på enheden, ingen konto (specs/customer-archive.md). */
export function ArchiveList() {
  const t = useTranslations('archive');
  const locale = useLocale();
  const [entries, setEntries] = useState<ArchiveEntry[] | null>(null);

  useEffect(() => {
    setEntries(readArchive());
  }, []);

  if (entries === null) return null;

  return (
    <main className="min-h-dvh bg-secondary">
      <div className="mx-auto max-w-md p-4 pb-12 space-y-4">
        <header className="pt-4 text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </header>

        {entries.length === 0 ? (
          <div className="bg-paper rounded-2xl shadow-sm p-8 text-center space-y-2">
            <ReceiptText className="h-8 w-8 text-accent mx-auto" aria-hidden="true" />
            <h2 className="font-medium">{t('emptyTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('emptyBody')}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => (
              <li
                key={e.id}
                className="bg-paper rounded-2xl shadow-sm p-4 flex items-center gap-3"
              >
                <Link href={`/r/${e.id}`} className="flex-1 min-w-0">
                  <p className="font-medium truncate">{e.merchant}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(e.issuedAt))}
                  </p>
                </Link>
                <span className="tabular-nums text-sm font-medium shrink-0">
                  {e.kind === 'file'
                    ? t('fileReceipt')
                    : formatMoney(e.totalGross, e.currency, locale)}
                </span>
                <Link
                  href={`/r/${e.id}`}
                  aria-label={t('open')}
                  className="text-accent shrink-0"
                >
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <button
                  onClick={() => setEntries(removeFromArchive(e.id))}
                  aria-label={t('remove')}
                  className="text-muted-foreground/50 hover:text-red-500 shrink-0"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-center text-xs text-muted-foreground">{t('localNote')}</p>
      </div>
    </main>
  );
}
