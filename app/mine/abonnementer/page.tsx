import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft, Repeat } from 'lucide-react';
import { getCustomerSession } from '@/lib/auth/customer';
import { getRecurringMerchants } from '@/lib/receipts/customer-queries';
import { formatMoney } from '@/lib/receipts/format';
import { SignInGate } from '../sign-in-gate';

export const metadata: Metadata = {
  title: 'Abonnementer — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/** Faste betalinger (specs/customer-insights.md) — forhandlere betalt 2+ gange. */
export default async function SubscriptionsPage() {
  const [session, locale, t] = await Promise.all([
    getCustomerSession(),
    getLocale(),
    getTranslations('subscriptions'),
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

  const recurring = await getRecurringMerchants(session.customerId);

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
          <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
        </header>

        {recurring.length === 0 ? (
          <section className="bg-paper rounded-2xl shadow-sm p-8 text-center space-y-2">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-tint">
              <Repeat className="h-5 w-5 text-forest" aria-hidden="true" />
            </span>
            <p className="font-semibold text-ink">{t('emptyTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('emptySub')}</p>
          </section>
        ) : (
          <section className="bg-paper rounded-2xl shadow-sm divide-y divide-border/60">
            {recurring.map((m) => (
              <div key={m.name} className="flex items-center gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
                  <Repeat className="h-4 w-4 text-forest" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('timesPaid', { count: m.count })} ·{' '}
                    {t('lastPaid', {
                      date: m.lastAt.toLocaleDateString(fmtLocale, {
                        day: 'numeric',
                        month: 'short',
                      }),
                    })}
                  </p>
                </div>
                {m.avgTotal > 0 && (
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-semibold text-ink">
                      {formatMoney(m.avgTotal, m.currency, fmtLocale)}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('average')}</p>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
