import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ChevronRight, FolderKanban } from 'lucide-react';
import { getCustomerSession } from '@/lib/auth/customer';
import { listProjects } from '@/lib/receipts/customer-queries';
import { CreateProjectForm } from './project-forms';

export const metadata: Metadata = {
  title: 'Projekter — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/** Projekter (specs/customer-projects.md) — gruppér boner pr. job/kunde/momsperiode. */
export default async function ProjectsPage() {
  const [session, t] = await Promise.all([
    getCustomerSession(),
    getTranslations('projects'),
  ]);

  if (!session) {
    return (
      <main className="min-h-dvh bg-canvas">
        <div className="mx-auto max-w-md p-4 pt-8 space-y-4 text-center">
          <p className="text-muted-foreground">{t('signInPrompt')}</p>
          <Link href="/mine/profil" className="inline-block rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper">
            {t('goToProfile')}
          </Link>
        </div>
      </main>
    );
  }

  const projects = await listProjects(session.customerId);

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

        <CreateProjectForm />

        {projects.length === 0 ? (
          <section className="bg-paper rounded-2xl shadow-sm p-8 text-center space-y-2">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-tint">
              <FolderKanban className="h-5 w-5 text-forest" aria-hidden="true" />
            </span>
            <p className="font-semibold text-ink">{t('emptyTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('emptySub')}</p>
          </section>
        ) : (
          <section className="bg-paper rounded-2xl shadow-sm divide-y divide-border/60">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/mine/projekter/${p.id}`}
                className="flex items-center gap-3 p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
                  <FolderKanban className="h-4 w-4 text-forest" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('receiptCount', { count: p.receiptCount })}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
