// Receipt body rendering via receiptline (never hand-roll the renderer).
import receiptline from 'receiptline';
import { formatVatRate } from '@/lib/vat';
import type { Merchant, Receipt, ReceiptItem, VatBreakdownEntry } from '@/lib/db/schema';

function money(minor: number): string {
  // Monospace receipt body: plain decimal with comma, currency shown elsewhere
  return (minor / 100).toFixed(2).replace('.', ',');
}

export function renderReceiptSvg({
  merchant,
  receipt,
  items,
}: {
  merchant: Merchant;
  receipt: Receipt;
  items: ReceiptItem[];
}): string {
  const breakdown = receipt.vatBreakdown as VatBreakdownEntry[];

  const lines: string[] = [];
  for (const item of items) {
    const label = item.qty > 1 ? `${item.name} x${item.qty}` : item.name;
    lines.push(`${label} | ${money(item.lineTotalGross)}`);
  }
  lines.push('-');
  lines.push(`^TOTAL ${receipt.currency} | ^${money(receipt.totalGross)}`);
  lines.push('-');
  for (const entry of breakdown) {
    lines.push(`Heraf moms ${formatVatRate(entry.rate)} | ${money(entry.vat)}`);
  }

  const doc = lines.join('\n');
  return receiptline.transform(doc, {
    cpl: 42, // 32 wraps two-column lines (e.g. "TOTAL DKK") at this font size
    encoding: 'multilingual',
    spacing: true,
    command: 'svg',
  });
}
