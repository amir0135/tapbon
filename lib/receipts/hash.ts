import crypto from 'node:crypto';
import type { VatBreakdownEntry } from '@/lib/db/schema';

// SHA-256 over a canonical JSON of the receipt at issue time. This is the
// "cannot be altered after issue" guarantee — recompute and compare to verify.

export type HashableReceipt = {
  merchantId: number;
  issuedAt: string; // ISO
  currency: string;
  totalGross: number;
  totalNet: number;
  totalVat: number;
  vatBreakdown: VatBreakdownEntry[];
  items: {
    name: string;
    qty: number;
    unitPriceGross: number;
    vatRate: number;
  }[];
};

export function hashReceipt(receipt: HashableReceipt): string {
  const canonical = JSON.stringify(receipt, [
    'merchantId',
    'issuedAt',
    'currency',
    'totalGross',
    'totalNet',
    'totalVat',
    'vatBreakdown',
    'items',
    'name',
    'qty',
    'unitPriceGross',
    'vatRate',
    'rate',
    'gross',
    'net',
    'vat',
  ]);
  return crypto.createHash('sha256').update(canonical).digest('hex');
}
