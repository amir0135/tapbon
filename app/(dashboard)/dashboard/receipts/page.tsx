import { getTranslations, getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import Link from 'next/link';
import { getUser } from '@/lib/db/queries';
import {
  getMerchantForUser,
  listRecentReceipts,
  getDefaultTerminal,
} from '@/lib/receipts/queries';
import { formatMoney } from '@/lib/receipts/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MerchantSetupForm } from './merchant-setup-form';
import { IssueForm } from './issue-form';

export const dynamic = 'force-dynamic';

export default async function ReceiptsPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  const [t, locale, merchant] = await Promise.all([
    getTranslations(),
    getLocale(),
    getMerchantForUser(user.id),
  ]);

  if (!merchant) {
    return (
      <section className="flex-1 p-4 lg:p-8 max-w-xl">
        <h1 className="text-lg lg:text-2xl font-medium mb-6">
          {t('merchantSetup.title')}
        </h1>
        <MerchantSetupForm />
      </section>
    );
  }

  const [receipts, terminal] = await Promise.all([
    listRecentReceipts(merchant.id),
    getDefaultTerminal(merchant.id),
  ]);

  const terminalUrl = terminal
    ? `${process.env.BASE_URL ?? ''}/t/${terminal.publicId}`
    : null;
  const terminalQr = terminalUrl
    ? await QRCode.toDataURL(terminalUrl, { margin: 1, width: 180 })
    : null;

  return (
    <section className="flex-1 p-4 lg:p-8 space-y-8 max-w-3xl">
      <h1 className="text-lg lg:text-2xl font-medium">{t('issue.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('issue.newReceipt')}</CardTitle>
        </CardHeader>
        <CardContent>
          <IssueForm currency={merchant.currency} locale={locale} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('issue.recent')}</CardTitle>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('issue.empty')}</p>
          ) : (
            <ul className="divide-y">
              {receipts.map((r) => (
                <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                  <span className="font-mono">
                    {t('receipt.receiptNumber', { number: r.receiptNumber })}
                  </span>
                  <span className="text-muted-foreground">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(r.issuedAt)}
                  </span>
                  <span>{formatMoney(r.totalGross, r.currency, locale)}</span>
                  <Link
                    className="text-accent underline underline-offset-2"
                    href={`/r/${r.id}`}
                    target="_blank"
                  >
                    {t('issue.openReceipt')}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {terminalQr && terminalUrl && (
        <Card>
          <CardHeader>
            <CardTitle>{terminal!.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t('issue.terminalQr')}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={terminalQr} alt="Terminal QR" className="rounded-lg" />
            <p className="font-mono text-xs break-all">{terminalUrl}</p>
            <Link
              className="inline-block text-accent underline underline-offset-2 text-sm"
              href={`/t/${terminal!.publicId}/stand`}
              target="_blank"
            >
              {t('issue.printStand')}
            </Link>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
