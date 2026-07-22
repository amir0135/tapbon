import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  BarChart3,
  ChevronRight,
  FolderKanban,
  Repeat,
  Settings,
  Stamp,
} from 'lucide-react';
import { getCustomerSession } from '@/lib/auth/customer';
import { getUser } from '@/lib/db/queries';
import { ViewToggle } from '../view-toggle';
import { BottomNav } from '../bottom-nav';

export const metadata: Metadata = {
  title: 'Mere — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/** "Mere"-hub (Receiptile-mønster): view-skifter + genveje + indstillinger. */
export default async function MorePage() {
  const [session, t, merchantUser] = await Promise.all([
    getCustomerSession(),
    getTranslations('more'),
    getUser().catch(() => null),
  ]);

  if (!session) redirect('/mine');

  const rows = [
    { href: '/mine/projekter', icon: FolderKanban, label: t('projects') },
    { href: '/mine/loyalitet', icon: Stamp, label: t('loyalty') },
    { href: '/mine/forbrug', icon: BarChart3, label: t('spending') },
    { href: '/mine/abonnementer', icon: Repeat, label: t('subscriptions') },
    { href: '/mine/profil', icon: Settings, label: t('settings') },
  ];

  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-md p-4 pb-28 space-y-5">
        <header className="pt-4 space-y-1">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('kicker')}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        </header>

        <section className="space-y-2">
          <h2 className="px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('viewSection')}
          </h2>
          <ViewToggle hasBusiness={Boolean(merchantUser)} />
        </section>

        <section className="space-y-2">
          <h2 className="px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('generalSection')}
          </h2>
          <div className="space-y-3">
            {rows.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl bg-paper p-4 shadow-sm active:scale-[0.99] transition"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
                  <Icon className="h-4 w-4 text-forest" aria-hidden="true" />
                </span>
                <span className="flex-1 text-sm font-semibold text-ink">{label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
