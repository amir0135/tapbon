import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import QRCode from 'qrcode';
import { getTerminalWithMerchant } from '@/lib/receipts/queries';
import { PrintButton } from './print-button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false },
};

// Printable A4 counter stand (spec: qr-stand.md). Strings render in the
// MERCHANT's locale — the stand sits on their counter, not the viewer's screen.
export default async function TerminalStandPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const row = await getTerminalWithMerchant(publicId);
  if (!row) notFound();
  const { terminal, merchant } = row;

  const t = await getTranslations({ locale: merchant.locale, namespace: 'stand' });
  const tc = await getTranslations({ locale: merchant.locale, namespace: 'common' });

  const terminalUrl = `${process.env.BASE_URL ?? ''}/t/${terminal.publicId}`;
  const qr = await QRCode.toDataURL(terminalUrl, { margin: 1, width: 800 });

  return (
    <main className="min-h-dvh bg-secondary print:bg-paper flex flex-col items-center gap-6 p-6 print:p-0">
      <style>{'@page { size: A4 portrait; margin: 0; }'}</style>

      <div className="print:hidden flex items-center gap-4 pt-2">
        <PrintButton />
        <p className="text-sm text-muted-foreground">{t('printHint')}</p>
      </div>

      {/* A4 sheet: 210mm × 297mm */}
      <div className="bg-paper shadow-sm print:shadow-none w-[210mm] h-[297mm] shrink-0 flex flex-col items-center justify-between text-center px-[20mm] py-[24mm]">
        <header className="space-y-3">
          <p className="font-mono text-sm tracking-widest uppercase text-muted-foreground">
            {merchant.businessName}
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-balance">
            {t('headline')}
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            {t('explainer')}
          </p>
        </header>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qr}
          alt={t('qrAlt', { merchant: merchant.businessName })}
          className="w-[120mm] h-[120mm] rounded-2xl"
        />

        <footer className="space-y-2">
          <p className="text-lg font-medium">{t('noApp')}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {tc('appName')} · {tc('tagline')}
          </p>
        </footer>
      </div>
    </main>
  );
}
