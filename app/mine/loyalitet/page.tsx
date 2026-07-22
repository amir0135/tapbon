import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { LoyaltyCards } from './loyalty-cards';
import { BottomNav } from '../bottom-nav';

export const metadata: Metadata = {
  title: 'Loyalitetskort — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/** "Mine kort" — stempelkort samlet ét sted (Receiptile-mønster). */
export default async function LoyaltyPage() {
  const t = await getTranslations('loyaltyPage');
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
        <LoyaltyCards />
      </div>
      <BottomNav />
    </main>
  );
}
