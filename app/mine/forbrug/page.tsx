import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { getCustomerSession } from '@/lib/auth/customer';
import { getCustomerSpending } from '@/lib/receipts/customer-queries';
import { formatMoney } from '@/lib/receipts/format';
import { SignInGate } from '../sign-in-gate';

export const metadata: Metadata = {
  title: 'Dit forbrug — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/** Forbrugsoverblik (specs/customer-insights.md) — kræver kunde-login. */
export default async function SpendingPage() {
  const [session, locale, t] = await Promise.all([
    getCustomerSession(),
    getLocale(),
    getTranslations('spending'),
  ]);
  const fmtLocale = locale === 'da' ? 'da-DK' : 'en-DK';

  if (!session) {
    return (
      <SignInGate
        title={t('title')}
        message={t('signInPrompt')}
        cta={t('goToProfile')}
        backLabel={t('back')}
      />
    );
  }

  const data = await getCustomerSpending(session.customerId);
  const maxMonth = Math.max(1, ...data.months.map((m) => m.total));
  const monthName = (key: string) =>
    new Date(`${key}-01T00:00:00`).toLocaleDateString(fmtLocale, { month: 'short' });

  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-md p-4 pb-12 space-y-5">
        <header className="relative pt-4 text-center">
          <Link
            href="/mine/profil"
            aria-label={t('back')}
            className="absolute left-0 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper shadow-sm text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        </header>

        {/* Denne måned */}
        <section className="rounded-2xl bg-forest text-paper shadow-sm p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/60">
                {t('thisMonth')}
              </p>
              <p className="mt-1 font-mono text-3xl font-semibold tracking-tight">
                {formatMoney(data.monthTotal, 'DKK', fmtLocale)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/60">
                {t('receiptsLabel')}
              </p>
              <p className="mt-1 font-mono text-3xl font-semibold">{data.monthCount}</p>
            </div>
          </div>
        </section>

        {/* Sidste 6 måneder — rene CSS-søjler */}
        <section className="bg-paper rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {t('monthlySection')}
            </p>
            <p className="font-semibold text-ink">{t('lastSixMonths')}</p>
          </div>
          {data.months.every((m) => m.count === 0) ? (
            <div className="py-8 text-center space-y-2">
              <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
              <p className="text-sm font-medium text-ink">{t('emptyTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('emptySub')}</p>
            </div>
          ) : (
            <div className="flex items-end gap-2" style={{ height: 140 }}>
              {data.months.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center justify-end gap-1 h-full">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {m.total > 0 ? formatMoney(m.total, 'DKK', fmtLocale).replace(/\s?kr\.?/i, '') : ''}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-mint"
                    style={{ height: `${Math.max(m.total > 0 ? 6 : 2, Math.round((m.total / maxMonth) * 100))}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{monthName(m.month)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pr. forretning */}
        <section className="bg-paper rounded-2xl shadow-sm p-5 space-y-3">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {t('byMerchantSection')}
            </p>
            <p className="font-semibold text-ink">{t('byMerchantTitle')}</p>
          </div>
          {data.byMerchant.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{t('emptySub')}</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {data.byMerchant.map((m) => (
                <li key={m.name} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('receiptCount', { count: m.count })}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-sm font-semibold text-ink">
                    {formatMoney(m.total, 'DKK', fmtLocale)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
