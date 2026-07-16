import { getTranslations, getLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getReceiptWithDetails } from '@/lib/receipts/queries';
import { renderReceiptSvg } from '@/lib/receipts/render';
import { formatMoney } from '@/lib/receipts/format';
import { ReceiptActions } from './receipt-actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false },
};

export default async function PublicReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);

  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const data = uuidRe.test(id) ? await getReceiptWithDetails(id) : null;

  if (!data) {
    return (
      <main className="min-h-dvh bg-secondary flex items-center justify-center p-4">
        <div className="bg-paper rounded-2xl shadow-sm p-8 max-w-sm text-center">
          <h1 className="font-medium text-lg mb-2">{t('receipt.notFoundTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('receipt.notFoundBody')}</p>
        </div>
      </main>
    );
  }

  const { receipt, merchant, items, file } = data;
  const isFile = receipt.kind === 'file';
  const svg = isFile ? null : renderReceiptSvg({ merchant, receipt, items });
  const fileHref = `/api/receipts/${receipt.id}/file`;
  const issuedAtText = new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(receipt.issuedAt);

  return (
    <main className="min-h-dvh bg-secondary print:bg-paper">
      <div className="mx-auto max-w-md p-4 pb-12 space-y-4">
        {/* Receipt card */}
        <div className="bg-paper rounded-2xl shadow-sm p-6 space-y-4">
          <header className="text-center space-y-1">
            {merchant.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={merchant.logoUrl}
                alt={merchant.businessName}
                className="h-12 mx-auto object-contain"
              />
            )}
            <h1 className="text-xl font-semibold tracking-tight">
              {merchant.businessName}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {t('receipt.cvr', { cvr: merchant.cvrNumber })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('receipt.issuedAt', { date: issuedAtText })}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {t('receipt.receiptNumber', { number: receipt.receiptNumber })}
            </p>
          </header>

          {receipt.confirmationCode && (
            <p className="text-center text-sm font-mono text-muted-foreground">
              {t('receipt.confirmationCode', { code: receipt.confirmationCode })}
            </p>
          )}

          {isFile ? (
            <div className="space-y-2">
              {file?.mimeType === 'application/pdf' ? (
                <a
                  href={fileHref}
                  target="_blank"
                  rel="noopener"
                  className="block text-center rounded-xl border py-3 text-sm font-medium"
                >
                  {t('receipt.openPdf')}
                </a>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fileHref}
                  alt={t('receipt.title')}
                  className="mx-auto max-w-full rounded-lg border"
                />
              )}
              <p className="text-center text-[10px] text-muted-foreground">
                {t('receipt.rawNote')}
              </p>
            </div>
          ) : (
            <>
              <div className="text-3xl font-semibold text-center tracking-tight">
                {formatMoney(receipt.totalGross, receipt.currency, locale)}
              </div>

              <div
                className="receipt-body mx-auto [&_svg]:mx-auto [&_svg]:max-w-full"
                dangerouslySetInnerHTML={{ __html: svg! }}
              />
            </>
          )}

          <footer className="text-center">
            <p className="text-[10px] text-muted-foreground font-mono">
              {t('receipt.verified', { hash: receipt.hash.slice(0, 12) })}
            </p>
          </footer>
        </div>

        {/* Actions — large tap targets, stacked */}
        <ReceiptActions
          merchantId={merchant.id}
          receiptId={receipt.id}
          googleReviewUrl={merchant.googleReviewUrl}
        />

        <p className="text-center text-xs text-muted-foreground print:hidden">
          {t('common.appName')} · {t('common.tagline')}
          {' · '}
          <a href="/privatliv" className="underline underline-offset-2">
            {t('receipt.privacyLink')}
          </a>
        </p>
      </div>
    </main>
  );
}
