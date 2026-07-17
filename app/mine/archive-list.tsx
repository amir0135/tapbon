'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, ReceiptText, Stamp, Trash2 } from 'lucide-react';
import {
  readArchive,
  removeFromArchive,
  type ArchiveEntry,
} from '@/lib/archive/local';
import { formatMoney } from '@/lib/receipts/format';

type LoyaltyCard = {
  cardToken: string;
  stamps: number;
  stampsRequired: number;
  merchantId: number;
  merchantName: string | null;
};

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

function readLoyaltyTokens(): string[] {
  const tokens: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('tapbon-loyalty-')) {
      const v = localStorage.getItem(key);
      if (v) tokens.push(v);
    }
  }
  return tokens;
}

/** Personligt dashboard — arkiv, forbrug og loyalitet, alt fra enheden (specs/customer-archive.md v2). */
export function ArchiveList() {
  const t = useTranslations('archive');
  const locale = useLocale();
  const [entries, setEntries] = useState<ArchiveEntry[] | null>(null);
  const [cards, setCards] = useState<LoyaltyCard[]>([]);

  useEffect(() => {
    setEntries(readArchive());
    Promise.all(
      readLoyaltyTokens().map((token) =>
        fetch(`/api/loyalty?token=${encodeURIComponent(token)}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => setCards(results.filter(Boolean)));
  }, []);

  if (entries === null) return null;

  const stats = monthStats(entries);

  return (
    <main className="min-h-dvh bg-secondary">
      <div className="mx-auto max-w-md p-4 pb-12 space-y-4">
        <header className="pt-4 text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
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

        {/* Loyalitetskort */}
        {cards.length > 0 && (
          <section className="space-y-2">
            <h2 className="px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {t('loyaltyTitle')}
            </h2>
            {cards.map((card) => (
              <div
                key={card.cardToken}
                className="bg-paper rounded-2xl shadow-sm p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <Stamp className="h-5 w-5 text-accent shrink-0" aria-hidden="true" />
                  <span className="font-medium truncate">
                    {card.merchantName ?? t('loyaltyUnknown')}
                  </span>
                  <span className="ml-auto text-sm text-muted-foreground font-mono shrink-0">
                    {card.stamps}/{card.stampsRequired}
                  </span>
                </div>
                <div className="grid grid-cols-10 gap-1.5">
                  {Array.from({ length: card.stampsRequired }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-full border-2 ${
                        i < card.stamps ? 'bg-accent border-accent' : 'border-border'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Kvitteringer */}
        <section className="space-y-2">
          <h2 className="px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('allReceipts')}
          </h2>
          {entries.length === 0 ? (
            <div className="bg-paper rounded-2xl shadow-sm p-8 text-center space-y-2">
              <ReceiptText className="h-8 w-8 text-accent mx-auto" aria-hidden="true" />
              <h3 className="font-medium">{t('emptyTitle')}</h3>
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
        </section>

        <p className="text-center text-xs text-muted-foreground">{t('localNote')}</p>
      </div>
    </main>
  );
}
