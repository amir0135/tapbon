import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { BarChart3 } from 'lucide-react';
import { getUser } from '@/lib/db/queries';
import { getMerchantForUser, getSalesReport } from '@/lib/receipts/queries';
import { formatMoney } from '@/lib/receipts/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

/** Rapporter — butikkens salgsoverblik (specs/merchant-reports.md). */
export default async function ReportsPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  const [t, locale, merchant] = await Promise.all([
    getTranslations('reports'),
    getLocale(),
    getMerchantForUser(user.id),
  ]);
  if (!merchant) redirect('/onboarding');

  const data = await getSalesReport(merchant.id);
  const currency = merchant.currency;
  const maxDay = Math.max(1, ...data.days.map((d) => d.total));
  const dayLabel = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(locale, { day: 'numeric' });

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        {t('title')}
      </h1>
      <div className="space-y-4 max-w-2xl">
        {/* Denne måned */}
        <div className="rounded-2xl bg-forest text-paper shadow-sm p-5 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/60">
              {t('thisMonth')}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
              {formatMoney(data.monthTotal, currency, locale)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/60">
              {t('receiptsLabel')}
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{data.monthCount}</p>
          </div>
        </div>

        {/* Sidste 14 dage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('lastDays')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.days.every((d) => d.count === 0) ? (
              <div className="py-8 text-center space-y-2">
                <BarChart3
                  className="mx-auto h-8 w-8 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-ink">{t('emptyTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('emptySub')}</p>
              </div>
            ) : (
              <div className="flex items-end gap-1" style={{ height: 120 }}>
                {data.days.map((d) => (
                  <div
                    key={d.date}
                    className="flex flex-1 flex-col items-center justify-end gap-1 h-full"
                    title={`${formatMoney(d.total, currency, locale)} · ${d.count}`}
                  >
                    <div
                      className="w-full rounded-t bg-mint"
                      style={{
                        height: `${Math.max(d.total > 0 ? 6 : 2, Math.round((d.total / maxDay) * 90))}px`,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {dayLabel(d.date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top-varer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('topItems')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t('emptySub')}
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {data.topItems.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('qtySold', { count: item.qty })}
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-sm font-semibold text-ink">
                      {formatMoney(item.total, currency, locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Moms pr. sats (denne måned) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('vatTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.vatByRate.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t('emptySub')}
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {data.vatByRate.map((v) => (
                  <li
                    key={v.rate}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {t('vatRate', { rate: v.rate })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('vatBase', {
                          amount: formatMoney(v.gross, currency, locale),
                        })}
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-sm font-semibold text-ink">
                      {formatMoney(v.vat, currency, locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
