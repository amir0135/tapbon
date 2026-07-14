import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { claimLatestReceipt } from '@/lib/receipts/queries';

export const dynamic = 'force-dynamic';

export default async function TerminalClaimPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const t = await getTranslations();

  const { merchant, receiptId } = await claimLatestReceipt(publicId);
  if (receiptId) redirect(`/r/${receiptId}`);

  return (
    <main className="min-h-dvh bg-secondary flex items-center justify-center p-4">
      <div className="bg-paper rounded-2xl shadow-sm p-8 max-w-sm text-center space-y-2">
        <h1 className="font-medium text-lg">{t('claim.noReceiptTitle')}</h1>
        <p className="text-sm text-muted-foreground">
          {merchant
            ? t('claim.noReceiptBody', { merchant: merchant.businessName })
            : t('receipt.notFoundBody')}
        </p>
      </div>
    </main>
  );
}
