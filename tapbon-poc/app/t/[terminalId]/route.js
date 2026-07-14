// The QR/NFC target: a stable per-terminal URL that always opens the latest receipt.
// In the real build this gets a claim window (only the most recent, short-lived).
import { NextResponse } from "next/server";
import { latestForTerminal } from "../../../lib/store";

export async function GET(req, { params }) {
  const { terminalId } = await params;
  const latest = latestForTerminal(terminalId);
  const origin = `http://${req.headers.get("host")}`;
  if (!latest) return NextResponse.redirect(`${origin}/?empty=1`);
  return NextResponse.redirect(`${origin}/r/${latest}`);
}
