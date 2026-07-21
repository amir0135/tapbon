import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { customers } from '@/lib/db/schema';
import type { VatBreakdownEntry } from '@/lib/db/schema';
import { getReceiptWithDetails, getReceiptFile } from '@/lib/receipts/queries';
import { formatMoney } from '@/lib/receipts/format';
import { sendEmail } from '@/lib/email/send';

// Regnskabs-forwarding (specs/customer-profile.md): når en kunde gemmer en bon,
// videresendes den til kundens e-conomic/Dinero/Billy-indbakke. Fil-boner
// vedhæftes som originalfil; strukturerede boner sendes som HTML med moms pr.
// sats + CVR (momsregler: .github/instructions/vat.instructions.md).
// Blød fejl — forwarding må aldrig blokere gem-flowet.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export async function forwardReceiptToAccounting(
  customerId: number,
  receiptId: string
): Promise<void> {
  try {
    const rows = await db
      .select({ forwards: customers.accountingForwards })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    const forwards = rows[0]?.forwards;
    if (!forwards) return;
    const targets = [forwards.economic, forwards.dinero, forwards.billy].filter(
      (t): t is string => Boolean(t)
    );
    if (targets.length === 0) return;

    const details = await getReceiptWithDetails(receiptId);
    if (!details?.merchant) return;
    const { receipt, merchant } = details;

    const issuedAt = receipt.issuedAt.toLocaleString('da-DK', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Copenhagen',
    });
    const url = `${process.env.BASE_URL ?? ''}/r/${receipt.id}`;
    const subject = `Kvittering — ${merchant.businessName} — ${issuedAt}`;

    let attachments:
      | { name: string; contentType: string; contentInBase64: string }[]
      | undefined;
    if (receipt.kind === 'file') {
      const file = await getReceiptFile(receipt.id);
      if (file) {
        const ext = EXT[file.mimeType] ?? 'bin';
        attachments = [
          {
            name: `kvittering-${receipt.id.slice(0, 8)}.${ext}`,
            contentType: file.mimeType,
            contentInBase64: Buffer.from(file.data as Buffer).toString('base64'),
          },
        ];
      }
    }

    const breakdown = (receipt.vatBreakdown ?? []) as VatBreakdownEntry[];
    const vatLines = breakdown
      .map(
        (b) =>
          `<tr><td>Heraf moms ${(b.rate / 100).toLocaleString('da-DK')}%</td><td align="right">${formatMoney(b.vat, receipt.currency)}</td></tr>`
      )
      .join('');
    const vatPlain = breakdown
      .map(
        (b) =>
          `Heraf moms ${(b.rate / 100).toLocaleString('da-DK')}%: ${formatMoney(b.vat, receipt.currency)}`
      )
      .join('\n');

    const totalLine =
      receipt.kind === 'structured'
        ? `<tr><td><strong>Total inkl. moms</strong></td><td align="right"><strong>${formatMoney(receipt.totalGross, receipt.currency)}</strong></td></tr>${vatLines}`
        : '';

    const html = `
<div style="font-family:sans-serif;max-width:480px">
  <p><strong>${escapeHtml(merchant.businessName)}</strong><br/>
  CVR: ${escapeHtml(merchant.cvrNumber)}<br/>
  ${issuedAt}</p>
  <table cellpadding="4" style="border-collapse:collapse;min-width:280px">${totalLine}</table>
  <p><a href="${url}">Se den originale kvittering</a></p>
  <p style="color:#888;font-size:12px">Videresendt automatisk af Tapbon.</p>
</div>`;
    const plainText = [
      merchant.businessName,
      `CVR: ${merchant.cvrNumber}`,
      issuedAt,
      receipt.kind === 'structured'
        ? `Total inkl. moms: ${formatMoney(receipt.totalGross, receipt.currency)}`
        : '',
      vatPlain,
      `Original: ${url}`,
    ]
      .filter(Boolean)
      .join('\n');

    await Promise.all(
      targets.map((to) => sendEmail({ to, subject, plainText, html, attachments }))
    );
  } catch (err) {
    console.error('[forward-receipt] fejlede:', err);
  }
}
