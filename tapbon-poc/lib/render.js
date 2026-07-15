// Receipt body rendering via receiptline (never hand-roll the renderer).
// Mirrors the main app's lib/receipts/render.ts.
import receiptline from "receiptline";

function money(ore) {
  return (ore / 100).toFixed(2).replace(".", ",");
}

// Escape receiptline special characters in free text (item names etc.)
function esc(s) {
  return String(s).replace(/[\\|{}\-=~_"`^]/g, (c) => `\\${c}`);
}

export function renderReceiptSvg(r) {
  const d = new Date(r.issuedAt);
  const dateStr = d.toLocaleDateString("da-DK", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });

  const lines = [];
  lines.push(`${dateStr} ${timeStr} | Bon #${esc(r.id)}`);
  lines.push("-");
  for (const l of r.lines) {
    const label = l.qty > 1 ? `${esc(l.name)} x${l.qty}` : esc(l.name);
    lines.push(`${label} | ${money(l.totalOre)}`);
  }
  lines.push("-");
  lines.push(`^TOTAL ${r.currency} | ^${money(r.totalOre)}`);
  lines.push("-");
  for (const [rate, vat] of Object.entries(r.vatBreakdown)) {
    lines.push(`Heraf moms ${rate}% | ${money(vat)}`);
  }

  return receiptline.transform(lines.join("\n"), {
    cpl: 40,
    encoding: "multilingual",
    spacing: true,
    command: "svg",
  });
}
