// Money display helper — amounts are integer øre/öre/cents.
export function formatMoney(
  amountMinor: number,
  currency: string,
  locale: string = 'da-DK'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amountMinor / 100);
}

/** Parse a user-entered price like "25,50" or "25.50" into øre. Returns null if invalid. */
export function parsePriceToMinor(input: string): number | null {
  const normalized = input.trim().replace(/\./g, '.').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(parseFloat(normalized) * 100);
}
