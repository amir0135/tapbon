import { getTranslations, getLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Store } from 'lucide-react';
import { getCustomerSession } from '@/lib/auth/customer';
import { getReceiptWithDetails } from '@/lib/receipts/queries';
import { renderReceiptSvg } from '@/lib/receipts/render';
import { formatMoney } from '@/lib/receipts/format';
import { ReceiptActions, DownloadPill, TrustLine, SealedChip } from './receipt-actions';
import { ArchiveSaver } from './archive-saver';

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
  const [t, locale, session] = await Promise.all([
    getTranslations(),
    getLocale(),
    getCustomerSession(),
  ]);

  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const data = uuidRe.test(id) ? await getReceiptWithDetails(id) : null;

  if (!data) {
    return (
      <main className="min-h-dvh bg-canvas flex items-center justify-center p-4">
        <div className="bg-paper rounded-2xl shadow-sm p-8 max-w-sm text-center">
          <h1 className="font-semibold text-lg mb-2 text-ink">{t('receipt.notFoundTitle')}</h1>
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
    <main className="min-h-dvh bg-canvas print:bg-paper">
      <div className="mx-auto max-w-md p-4 pb-12 space-y-3">
        {/* Receipt card — styled like the landing phone mock */}
        <div className="bg-paper rounded-2xl shadow-sm px-5 py-6 space-y-4">
          <header className="text-center space-y-1.5">
            {merchant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={merchant.logoUrl}
                alt={merchant.businessName}
                className="h-12 mx-auto object-contain"
              />
            ) : (
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-forest">
                <Store className="h-4 w-4 text-forest" aria-hidden="true" />
              </span>
            )}
            <h1 className="text-[15px] font-semibold uppercase tracking-[0.22em] text-ink">
              {merchant.businessName}
            </h1>
            <p className="font-mono text-[11px] text-muted-foreground">
              {t('receipt.cvr', { cvr: merchant.cvrNumber })}
            </p>
          </header>

          <div className="border-t border-dashed border-border" />

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
                  className="flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper active:scale-[0.99] transition"
                >
                  {t('receipt.openPdf')}
                </a>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fileHref}
                  alt={t('receipt.title')}
                  className="mx-auto max-w-full rounded-lg border border-border"
                />
              )}
              <p className="text-center text-[10px] text-muted-foreground">
                {t('receipt.rawNote')}
              </p>
            </div>
          ) : (
            <>
              <div className="text-3xl font-semibold text-center tracking-tight text-ink">
                {formatMoney(receipt.totalGross, receipt.currency, locale)}
              </div>

              <div
                className="receipt-body mx-auto [&_svg]:mx-auto [&_svg]:max-w-full"
                dangerouslySetInnerHTML={{ __html: svg! }}
              />
            </>
          )}

          <div className="border-t border-dashed border-border" />

          <SealedChip label={t('receipt.verified', { hash: receipt.hash.slice(0, 12) })} />

          <p className="text-center font-mono text-[10px] text-muted-foreground">
            {issuedAtText} · {t('receipt.receiptNumber', { number: receipt.receiptNumber })}
          </p>

          {!isFile && <DownloadPill label={t('receipt.download')} />}

          <TrustLine label={t('receipt.trustLine')} appName={t('common.appName')} />
        </div>

        {/* Actions — large tap targets, stacked */}
        <ReceiptActions
          merchantId={merchant.id}
          receiptId={receipt.id}
          googleReviewUrl={merchant.googleReviewUrl}
          signedIn={Boolean(session)}
        />

        {/* Gem på kontoen (logget ind) eller konto-pitch (logget ud) */}
        <ArchiveSaver receiptId={receipt.id} signedIn={Boolean(session)} />

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
