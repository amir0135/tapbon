import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft, Store, User as UserIcon } from 'lucide-react';
import { getUser } from '@/lib/db/queries';
import { getAdminOverview, isAdminEmail } from '@/lib/db/admin-queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

/** Founder-overblik (specs/admin-overview.md) — kun ADMIN_EMAILS. */
export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');
  // Siden afsløres ikke for andre — 404 i stedet for 403
  if (!isAdminEmail(user.email)) notFound();

  const [t, locale, data] = await Promise.all([
    getTranslations('admin'),
    getLocale(),
    getAdminOverview(),
  ]);

  const maxDay = Math.max(
    1,
    ...data.signupDays.map((d) => d.users + d.customers)
  );
  const dayLabel = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(locale, { day: 'numeric' });
  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const heroStats = [
    { label: t('totalUsers'), value: data.totals.users },
    { label: t('totalCustomers'), value: data.totals.customers },
    { label: t('totalMerchants'), value: data.totals.merchants },
    { label: t('totalReceipts'), value: data.totals.receipts },
  ];
  const weekStats = [
    { label: t('weekNewUsers'), value: data.week.newUsers + data.week.newCustomers },
    { label: t('weekReceipts'), value: data.week.receipts },
    { label: t('weekActiveMerchants'), value: data.week.activeMerchants },
    { label: t('bridgesOnline'), value: data.week.bridgesOnline },
  ];

  return (
    <main className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-4xl p-4 lg:p-8 space-y-4">
        <header className="space-y-1">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('kicker')}
          </p>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg lg:text-2xl font-medium text-gray-900">
              {t('title')}
            </h1>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t('backToDashboard')}
            </Link>
          </div>
        </header>

        {/* Totaler */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {heroStats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-forest text-paper shadow-sm p-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-paper/60">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Sidste 7 dage */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {weekStats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
                  {s.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Signups pr. dag, 14 dage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('signupChart')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1" style={{ height: 120 }}>
              {data.signupDays.map((d) => {
                const total = d.users + d.customers;
                return (
                  <div
                    key={d.date}
                    className="flex flex-1 flex-col items-center justify-end gap-1 h-full"
                    title={`${t('usersShort')}: ${d.users} · ${t('customersShort')}: ${d.customers}`}
                  >
                    <div
                      className="flex w-full flex-col justify-end overflow-hidden rounded-t"
                      style={{
                        height: `${Math.max(total > 0 ? 6 : 2, Math.round((total / maxDay) * 90))}px`,
                      }}
                    >
                      {total > 0 ? (
                        <>
                          <div
                            className="w-full bg-mint"
                            style={{ flexGrow: d.users || 0.0001 }}
                          />
                          <div
                            className="w-full bg-forest"
                            style={{ flexGrow: d.customers || 0.0001 }}
                          />
                        </>
                      ) : (
                        <div className="w-full flex-1 bg-border" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {dayLabel(d.date)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-mint" /> {t('usersShort')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-forest" /> {t('customersShort')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Seneste signups */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('latestSignups')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.latestSignups.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t('empty')}
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {data.latestSignups.map((s) => (
                  <li key={s.email} className="flex items-center gap-3 py-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
                      {s.businessName ? (
                        <Store className="h-4 w-4 text-forest" aria-hidden="true" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-forest" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {s.name || s.email}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.email}
                        {s.businessName ? ` · ${s.businessName}` : ''}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">
                        {dateFmt.format(s.createdAt)}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-forest">
                        {s.businessName ? t('typeBusiness') : t('typePrivate')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
