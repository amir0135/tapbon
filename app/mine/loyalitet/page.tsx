import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { getCustomerSession } from '@/lib/auth/customer';
import { listCustomerLoyaltyCards } from '@/lib/receipts/customer-queries';
import { LoyaltyCards } from './loyalty-cards';
import { BottomNav } from '../bottom-nav';

export const metadata: Metadata = {
  title: 'Loyalitetskort — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/** "Mine kort" — kontoens stempelkort (specs/customer-loyalty.md). */
export default async function LoyaltyPage() {
  const [session, t] = await Promise.all([
    getCustomerSession(),
    getTranslations('loyaltyPage'),
  ]);

  if (!session) redirect('/mine');

  const cards = await listCustomerLoyaltyCards(session.customerId);

  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-md p-4 pb-28 space-y-5">
        <header className="relative pt-4 space-y-1">
          <Link
            href="/mine/mere"
            aria-label={t('back')}
            className="absolute right-0 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper shadow-sm text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('kicker')}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        </header>
        <LoyaltyCards cards={cards} />
      </div>
      <BottomNav />
    </main>
  );
}
