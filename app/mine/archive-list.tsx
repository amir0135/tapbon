'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, ReceiptText, Trash2 } from 'lucide-react';
import { clearArchive, readArchive, type ArchiveEntry } from '@/lib/archive/local';
import { formatMoney } from '@/lib/receipts/format';
import { BottomNav } from './bottom-nav';

function monthStats(entries: ArchiveEntry[]) {
  const now = new Date();
  const inMonth = entries.filter((e) => {
    const d = new Date(e.issuedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  // Sum pr. valuta; vis den dominerende (flest boner)
  const byCurrency = new Map<string, { total: number; count: number }>();
  for (const e of inMonth) {
    const cur = byCurrency.get(e.currency) ?? { total: 0, count: 0 };
    cur.count += 1;
    if (e.kind === 'structured') cur.total += e.totalGross;
    byCurrency.set(e.currency, cur);
  }
  const dominant =
    [...byCurrency.entries()].sort((a, b) => b[1].count - a[1].count)[0] ?? null;
  return {
    count: inMonth.length,
    currency: dominant?.[0] ?? 'DKK',
    total: dominant?.[1].total ?? 0,
  };
}

/** Personligt dashboard — kontoens arkiv, server-fed (specs/customer-account.md v3). */
export function ArchiveList({
  customerEmail,
  entries: serverEntries,
}: {
  customerEmail: string;
  entries: ArchiveEntry[];
}) {
  const t = useTranslations('archive');
  const locale = useLocale();
  const router = useRouter();
  const [entries, setEntries] = useState<ArchiveEntry[]>(serverEntries);
  useEffect(() => setEntries(serverEntries), [serverEntries]);

  // Engangsmigrering: gammelt localStorage-arkiv → kontoen, ryd, refresh.
  useEffect(() => {
    const local = readArchive();
    if (local.length === 0) return;
    fetch('/api/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiptIds: local.map((e) => e.id) }),
    })
      .then((r) => {
        if (r.ok) {
          clearArchive();
          router.refresh();
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    fetch(`/api/archive?id=${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const stats = monthStats(entries);

  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-md p-4 pb-28 space-y-4">
        <header className="pt-4 space-y-1">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('kicker')}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        </header>

        {/* Denne måned */}
        <div className="rounded-2xl bg-forest text-paper shadow-sm p-5 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/60">
              {t('thisMonth')}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
              {formatMoney(stats.total, stats.currency, locale)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/60">
              {t('receiptsLabel')}
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{stats.count}</p>
          </div>
        </div>

        {/* Diskret synk-linje — alle er logget ind i konto-først-modellen */}
        <p className="px-1 text-center text-xs text-muted-foreground">
          {t('syncedAs', { email: customerEmail })}
        </p>

        {/* Kvitteringer */}
        <section className="space-y-2">
          <h2 className="px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('allReceipts')}
          </h2>
          {entries.length === 0 ? (
            <div className="bg-paper rounded-2xl shadow-sm p-8 text-center space-y-2">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-forest">
                <ReceiptText className="h-4 w-4 text-forest" aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-ink">{t('emptyTitle')}</h3>
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
                    className="text-forest shrink-0"
                  >
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                  <button
                    onClick={() => remove(e.id)}
                    aria-label={t('remove')}
                    className="text-muted-foreground/50 hover:text-red-500 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
