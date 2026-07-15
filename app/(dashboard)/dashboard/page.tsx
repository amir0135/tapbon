import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { ReceiptText, Printer, ArrowRight } from 'lucide-react';
import { getUser } from '@/lib/db/queries';
import {
  getMerchantForUser,
  getDefaultTerminal,
  getDashboardStats,
  listRecentReceipts,
} from '@/lib/receipts/queries';
import { formatMoney } from '@/lib/receipts/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

const BRIDGE_ONLINE_MS = 3 * 60 * 1000;

function StatusBadge({
  status,
  labels,
}: {
  status: string;
  labels: { pending: string; claimed: string; expired: string };
}) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    claimed: 'bg-mint-tint text-forest',
    expired: 'bg-gray-100 text-gray-500',
  };
  const label = labels[status as keyof typeof labels] ?? status;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.expired}`}
    >
      {label}
    </span>
  );
}

export default async function DashboardOverviewPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  const [t, locale, merchant] = await Promise.all([
    getTranslations('dash'),
    getLocale(),
    getMerchantForUser(user.id),
  ]);

  if (!merchant) redirect('/dashboard/receipts');

  const [stats, terminal, recent] = await Promise.all([
    getDashboardStats(merchant.id),
    getDefaultTerminal(merchant.id),
    listRecentReceipts(merchant.id, 5),
  ]);

  const bridgeOnline =
    terminal?.lastSeenAt &&
    Date.now() - terminal.lastSeenAt.getTime() < BRIDGE_ONLINE_MS;
  const bridgeConfigured = Boolean(terminal?.deviceTokenHash);

  const statCards = [
    { label: t('todayReceipts'), value: String(stats.todayCount) },
    {
      label: t('todayRevenue'),
      value: formatMoney(stats.todayRevenue, merchant.currency, locale),
    },
    { label: t('weekReceipts'), value: String(stats.weekCount) },
  ];

  const statusLabels = {
    pending: t('statusPending'),
    claimed: t('statusClaimed'),
    expired: t('statusExpired'),
  };

  return (
    <section className="flex-1 p-4 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg lg:text-2xl font-medium">
          {t('overviewTitle', { business: merchant.businessName })}
        </h1>
        <Link
          href="/dashboard/receipts"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-paper hover:bg-accent/90"
        >
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          {t('issueCta')}
        </Link>
      </div>

      {/* Nøgletal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Terminal / Bridge status */}
      {terminal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{terminal.name}</span>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                  bridgeOnline
                    ? 'bg-mint-tint text-forest'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${bridgeOnline ? 'bg-mint' : 'bg-gray-400'}`}
                  aria-hidden="true"
                />
                {bridgeOnline
                  ? t('bridgeOnline')
                  : bridgeConfigured
                    ? t('bridgeOffline')
                    : t('bridgeNotConfigured')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-muted-foreground break-all">
              {process.env.BASE_URL ?? ''}/t/{terminal.publicId}
            </p>
            <Link
              href={`/t/${terminal.publicId}/stand`}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm text-accent underline underline-offset-2"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              {t('printStand')}
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Seneste kvitteringer */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('recentEmpty')}</p>
          ) : (
            <ul className="divide-y">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-sm"
                >
                  <span className="font-mono shrink-0">#{r.receiptNumber}</span>
                  <span className="text-muted-foreground shrink-0">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(r.issuedAt)}
                  </span>
                  <span className="ml-auto tabular-nums">
                    {r.kind === 'file'
                      ? t('fileReceipt')
                      : formatMoney(r.totalGross, r.currency, locale)}
                  </span>
                  <StatusBadge status={r.status} labels={statusLabels} />
                  <Link
                    href={`/r/${r.id}`}
                    target="_blank"
                    className="text-accent"
                    aria-label={t('openReceipt')}
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
