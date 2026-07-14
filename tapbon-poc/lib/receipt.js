// Receipt construction: money as integer øre, VAT (moms) per rate, SHA-256 hash at issue.
import crypto from "crypto";

export function kronerToOre(v) {
  // "12,50" or "12.50" -> 1250 øre
  const n = parseFloat(String(v).replace(",", "."));
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export function formatOre(ore, currency = "DKK") {
  const kr = (ore / 100).toFixed(2).replace(".", ",");
  return `${kr} kr.`;
}

// items: [{ name, qty, unitPriceOre, vatRate }] — prices are incl. moms (Danish retail convention)
export function buildReceipt({ merchant, items, terminalId = "demo" }) {
  const lines = items
    .filter((i) => i.name && i.qty > 0)
    .map((i) => ({
      name: i.name,
      qty: i.qty,
      unitPriceOre: i.unitPriceOre,
      vatRate: i.vatRate,
      totalOre: i.qty * i.unitPriceOre,
    }));

  const totalOre = lines.reduce((s, l) => s + l.totalOre, 0);

  // VAT portion of an incl-price: total * r / (100 + r), per rate
  const vatBreakdown = {};
  for (const l of lines) {
    const vat = Math.round((l.totalOre * l.vatRate) / (100 + l.vatRate));
    vatBreakdown[l.vatRate] = (vatBreakdown[l.vatRate] ?? 0) + vat;
  }

  const receipt = {
    id: crypto.randomUUID().slice(0, 8),
    issuedAt: new Date().toISOString(),
    currency: "DKK",
    merchant, // { name, cvr, address, city, logoEmoji, reviewUrl }
    lines,
    totalOre,
    vatBreakdown,
    terminalId,
  };

  // Immutability claim: hash of the canonical receipt JSON at issue time.
  receipt.hash = crypto.createHash("sha256").update(JSON.stringify(receipt)).digest("hex");
  return receipt;
}
