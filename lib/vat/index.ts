// VAT ("moms") engine — all amounts in integer øre/öre/cents, rates in
// basis points (2500 = 25.00%). Prices are entered GROSS (incl. VAT), as shown
// on Danish consumer receipts. VAT rounding happens ONCE per rate, at issue
// time — never per line.

import type { VatBreakdownEntry } from '@/lib/db/schema';

export type VatableItem = {
  qty: number;
  unitPriceGross: number; // øre
  vatRate: number; // basis points
};

export type VatTotals = {
  totalGross: number;
  totalNet: number;
  totalVat: number;
  breakdown: VatBreakdownEntry[];
};

export function lineTotalGross(item: VatableItem): number {
  return item.qty * item.unitPriceGross;
}

/** Compute per-rate VAT breakdown and totals from gross line items. */
export function computeVat(items: VatableItem[]): VatTotals {
  const grossByRate = new Map<number, number>();
  for (const item of items) {
    if (!Number.isInteger(item.unitPriceGross) || !Number.isInteger(item.qty)) {
      throw new Error('Amounts must be integer øre and integer quantities');
    }
    grossByRate.set(
      item.vatRate,
      (grossByRate.get(item.vatRate) ?? 0) + lineTotalGross(item)
    );
  }

  const breakdown: VatBreakdownEntry[] = [...grossByRate.entries()]
    .sort(([a], [b]) => b - a)
    .map(([rate, gross]) => {
      // VAT included in gross: vat = gross * rate / (10000 + rate), rounded once per rate
      const vat = Math.round((gross * rate) / (10000 + rate));
      return { rate, gross, net: gross - vat, vat };
    });

  const totalGross = breakdown.reduce((s, e) => s + e.gross, 0);
  const totalVat = breakdown.reduce((s, e) => s + e.vat, 0);
  return {
    totalGross,
    totalNet: totalGross - totalVat,
    totalVat,
    breakdown,
  };
}

/** Format basis points as a display percentage, e.g. 2500 → "25%". */
export function formatVatRate(rate: number): string {
  const pct = rate / 100;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
}
