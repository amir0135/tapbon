import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { buildReceipt, kronerToOre } from "../../../lib/receipt";
import { addReceipt } from "../../../lib/store";

export async function POST(req) {
  const body = await req.json();

  const items = (body.items ?? []).map((i) => ({
    name: String(i.name ?? "").slice(0, 60),
    qty: Math.max(1, parseInt(i.qty ?? 1, 10) || 1),
    unitPriceOre: kronerToOre(i.unitPrice),
    vatRate: parseInt(i.vatRate ?? 25, 10) || 0,
  }));

  if (!items.length || items.every((i) => !i.name)) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  const merchant = {
    name: String(body.merchant?.name || "Demo Café").slice(0, 60),
    cvr: String(body.merchant?.cvr || "12345678").slice(0, 12),
    address: String(body.merchant?.address || "Elmegade 5").slice(0, 80),
    city: String(body.merchant?.city || "2200 København N").slice(0, 60),
    logoEmoji: String(body.merchant?.logoEmoji || "☕").slice(0, 4),
    reviewUrl: String(body.merchant?.reviewUrl || "https://g.page/r/demo/review").slice(0, 200),
  };

  const receipt = buildReceipt({ merchant, items, terminalId: "demo" });
  addReceipt(receipt, "demo");

  const origin = req.headers.get("origin") ?? `http://${req.headers.get("host")}`;
  const receiptUrl = `${origin}/r/${receipt.id}`;
  const terminalUrl = `${origin}/t/demo`;
  const qr = await QRCode.toDataURL(terminalUrl, { margin: 1, width: 240, color: { dark: "#232B38" } });

  return NextResponse.json({ id: receipt.id, receiptUrl, terminalUrl, qr });
}
