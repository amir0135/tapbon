'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  Check,
  CloudUpload,
  Loader2,
  LogOut,
  ReceiptText,
  Stamp,
  Store,
  Trash2,
  User,
} from 'lucide-react';
import {
  mergeIntoArchive,
  readArchive,
  removeFromArchive,
  type ArchiveEntry,
} from '@/lib/archive/local';
import { formatMoney } from '@/lib/receipts/format';
import {
  requestCustomerLogin,
  customerLogout,
  deleteCustomerAccount,
} from './actions';

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

/** Konto-sektion: magic-link login / synk-status (specs/customer-account.md). */
function SyncCard({ customerEmail }: { customerEmail: string | null }) {
  const t = useTranslations('customerSync');
  const [state, formAction, pending] = useActionState<
    { error?: string; success?: string },
    FormData
  >(requestCustomerLogin, {});
  const [busy, startTransition] = useTransition();

  if (customerEmail) {
    return (
      <div className="bg-paper rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
            <CloudUpload className="h-4 w-4 text-forest" aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink">{t('syncedTitle')}</p>
            <p className="text-sm text-muted-foreground truncate">{customerEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() =>
              startTransition(async () => {
                await customerLogout();
                window.location.reload();
              })
            }
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-ink"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t('logout')}
          </button>
          <button
            onClick={() => {
              if (!window.confirm(t('deleteConfirm'))) return;
              startTransition(async () => {
                await deleteCustomerAccount();
                window.location.reload();
              });
            }}
            disabled={busy}
            className="text-muted-foreground/60 hover:text-red-500"
          >
            {t('deleteAccount')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
          <CloudUpload className="h-4 w-4 text-forest" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-ink">{t('pitchTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('pitchSub')}</p>
        </div>
      </div>
      {state.success ? (
        <p className="rounded-xl bg-mint-tint p-3 text-sm text-forest">{state.success}</p>
      ) : (
        <form action={formAction} className="flex gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder={t('emailPlaceholder')}
            aria-label={t('emailPlaceholder')}
            className="min-w-0 flex-1 rounded-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60 inline-flex items-center gap-2"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {t('sendLink')}
          </button>
        </form>
      )}
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
    </div>
  );
}

/** Personligt dashboard — arkiv, forbrug og loyalitet, alt fra enheden (specs/customer-archive.md v2). */
export function ArchiveList({
  customerEmail,
  hasBusiness = false,
}: {
  customerEmail: string | null;
  hasBusiness?: boolean;
}) {
  const t = useTranslations('archive');
  const locale = useLocale();
  const [entries, setEntries] = useState<ArchiveEntry[] | null>(null);
  const [cards, setCards] = useState<LoyaltyCard[]>([]);

  useEffect(() => {
    const local = readArchive();
    setEntries(local);

    if (customerEmail) {
      // PULL: server-arkiv → merge lokalt; PUSH: lokale ids op
      fetch('/api/archive')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.entries) setEntries(mergeIntoArchive(data.entries));
        })
        .catch(() => {});
      if (local.length > 0) {
        fetch('/api/archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiptIds: local.map((e) => e.id) }),
        }).catch(() => {});
      }
    }

    Promise.all(
      readLoyaltyTokens().map((token) =>
        fetch(`/api/loyalty?token=${encodeURIComponent(token)}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => setCards(results.filter(Boolean)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (entries === null) return null;

  const stats = monthStats(entries);

  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-md p-4 pb-12 space-y-4">
        <header className="pt-4 text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </header>

        {/* Personlig/Forretning-skifter (Receiptile-mønster) — kun når begge findes */}
        {hasBusiness && (
          <div className="grid grid-cols-2 gap-1 rounded-full bg-paper p-1 shadow-sm" role="navigation" aria-label={t('viewToggle')}>
            <span className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-paper py-2 text-sm font-medium">
              <User className="h-4 w-4" aria-hidden="true" />
              {t('viewPersonal')}
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full py-2 text-sm font-medium text-muted-foreground hover:text-ink"
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              {t('viewBusiness')}
            </Link>
          </div>
        )}

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

        {/* Synk-konto (valgfri) */}
        <SyncCard customerEmail={customerEmail} />

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
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
                    <Stamp className="h-4 w-4 text-forest" aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-ink truncate">
                    {card.merchantName ?? t('loyaltyUnknown')}
                  </span>
                  <span className="ml-auto text-sm text-muted-foreground font-mono shrink-0">
                    {card.stamps}/{card.stampsRequired}
                  </span>
                </div>
                <div className="grid grid-cols-10 gap-1.5">
                  {Array.from({ length: card.stampsRequired }).map((_, i) => (
                    <span
                      key={i}
                      className={`flex aspect-square items-center justify-center rounded-full ${
                        i < card.stamps ? 'bg-mint' : 'border-2 border-dashed border-border'
                      }`}
                    >
                      {i < card.stamps && (
                        <Check className="h-3 w-3 text-paper" aria-hidden="true" />
                      )}
                    </span>
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
