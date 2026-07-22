import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft, ReceiptText } from 'lucide-react';
import { getCustomerSession } from '@/lib/auth/customer';
import {
  getProject,
  listReceiptsForProject,
} from '@/lib/receipts/customer-queries';
import { formatMoney } from '@/lib/receipts/format';
import { AssignButton, DeleteProjectButton } from '../project-forms';

export const metadata: Metadata = {
  title: 'Projekt — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

type ReceiptRow = {
  id: string;
  merchant: string;
  totalGross: number;
  currency: string;
  kind: string;
  issuedAt: Date;
};

function ReceiptLine({
  r,
  fmtLocale,
  action,
}: {
  r: ReceiptRow;
  fmtLocale: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
        <ReceiptText className="h-4 w-4 text-forest" aria-hidden="true" />
      </span>
      <Link href={`/r/${r.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{r.merchant}</p>
        <p className="text-xs text-muted-foreground">
          {r.issuedAt.toLocaleDateString(fmtLocale, { day: 'numeric', month: 'short', year: 'numeric' })}
          {r.kind === 'structured' && <> · {formatMoney(r.totalGross, r.currency, fmtLocale)}</>}
        </p>
      </Link>
      {action}
    </div>
  );
}

/** Projekt-detalje: boner i projektet + tilføj fra kontoens øvrige boner. */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) notFound();

  const [session, locale, t] = await Promise.all([
    getCustomerSession(),
    getLocale(),
    getTranslations('projects'),
  ]);
  if (!session) redirect('/mine');
  const fmtLocale = locale === 'da' ? 'da-DK' : 'en-DK';

  const project = await getProject(session.customerId, projectId);
  if (!project) notFound();

  const { inProject, unassigned } = await listReceiptsForProject(
    session.customerId,
    projectId
  );
  const total = inProject
    .filter((r) => r.kind === 'structured')
    .reduce((sum, r) => sum + r.totalGross, 0);

  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-md p-4 pb-12 space-y-5">
        <header className="relative pt-4 text-center">
          <Link
            href="/mine/projekter"
            aria-label={t('back')}
            className="absolute left-0 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper shadow-sm text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('receiptCount', { count: inProject.length })}
            {total > 0 && <> · {formatMoney(total, 'DKK', fmtLocale)}</>}
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('inProjectSection')}
          </h2>
          {inProject.length === 0 ? (
            <p className="bg-paper rounded-2xl shadow-sm p-6 text-center text-sm text-muted-foreground">
              {t('inProjectEmpty')}
            </p>
          ) : (
            <div className="bg-paper rounded-2xl shadow-sm divide-y divide-border/60">
              {inProject.map((r) => (
                <ReceiptLine
                  key={r.id}
                  r={r}
                  fmtLocale={fmtLocale}
                  action={<AssignButton receiptId={r.id} projectId={projectId} mode="remove" />}
                />
              ))}
            </div>
          )}
        </section>

        {unassigned.length > 0 && (
          <section className="space-y-2">
            <h2 className="px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {t('unassignedSection')}
            </h2>
            <div className="bg-paper rounded-2xl shadow-sm divide-y divide-border/60">
              {unassigned.map((r) => (
                <ReceiptLine
                  key={r.id}
                  r={r}
                  fmtLocale={fmtLocale}
                  action={<AssignButton receiptId={r.id} projectId={projectId} mode="add" />}
                />
              ))}
            </div>
          </section>
        )}

        <div className="text-center">
          <DeleteProjectButton projectId={projectId} />
        </div>
      </div>
    </main>
  );
}
