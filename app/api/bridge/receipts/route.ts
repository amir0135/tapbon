import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomInt } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { receipts, receiptFiles, terminals } from '@/lib/db/schema';
import { getTerminalByDeviceTokenHash } from '@/lib/receipts/queries';

// Tapbon Bridge upload (specs/printer-emulation.md): the virtual printer /
// hardware box POSTs a captured print job (PDF/PNG) here. Same endpoint for
// every source — Windows app, laptop emulator, Pi, future hardware.

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024;
const BRIDGE_CLAIM_WINDOW_MS = 90 * 1000;

function sniffMimeType(buf: Buffer): 'image/png' | 'application/pdf' | null {
  if (
    buf.length > 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return 'image/png';
  }
  if (buf.length > 4 && buf.subarray(0, 4).toString('latin1') === '%PDF') {
    return 'application/pdf';
  }
  return null;
}

function receiptResponse(receipt: {
  id: string;
  confirmationCode: string | null;
  expiresAt: Date | null;
}) {
  return NextResponse.json({
    receiptId: receipt.id,
    status: 'ready',
    confirmationCode: receipt.confirmationCode,
    expiresAt: receipt.expiresAt?.toISOString() ?? null,
    receiptUrl: `${process.env.BASE_URL ?? ''}/r/${receipt.id}`,
  });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const device = await getTerminalByDeviceTokenHash(tokenHash);
  if (!device) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { terminal, merchant } = device;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file_required' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 413 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const mimeType = sniffMimeType(buf);
  if (!mimeType) {
    return NextResponse.json({ error: 'unsupported_format' }, { status: 415 });
  }

  const printJobId =
    String(form.get('printJobId') ?? '').slice(0, 100) || null;

  // Idempotency: same terminal + printJobId → return the existing receipt.
  if (printJobId) {
    const existing = await db
      .select()
      .from(receipts)
      .where(
        and(
          eq(receipts.terminalId, terminal.id),
          eq(receipts.printJobId, printJobId)
        )
      )
      .limit(1);
    if (existing[0]) return receiptResponse(existing[0]);
  }

  const now = new Date();
  const values = {
    merchantId: merchant.id,
    terminalId: terminal.id,
    issuedAt: now,
    currency: merchant.currency,
    // File receipts carry no structured totals — the amounts/VAT/CVR are on
    // the captured print itself. Structured parse is the upgrade path.
    totalGross: 0,
    totalNet: 0,
    totalVat: 0,
    vatBreakdown: [],
    kind: 'file',
    hash: createHash('sha256').update(buf).digest('hex'),
    status: 'pending',
    confirmationCode: String(randomInt(0, 10_000)).padStart(4, '0'),
    expiresAt: new Date(now.getTime() + BRIDGE_CLAIM_WINDOW_MS),
    printJobId,
  };

  try {
    const receipt = await db.transaction(async (tx) => {
      // A new print job supersedes older unclaimed jobs on this terminal
      // (delivery metadata only — receipt content stays immutable).
      await tx
        .update(receipts)
        .set({ status: 'expired' })
        .where(
          and(eq(receipts.terminalId, terminal.id), eq(receipts.status, 'pending'))
        );

      const [inserted] = await tx.insert(receipts).values(values).returning({
        id: receipts.id,
        confirmationCode: receipts.confirmationCode,
        expiresAt: receipts.expiresAt,
      });

      await tx.insert(receiptFiles).values({
        receiptId: inserted.id,
        mimeType,
        byteSize: buf.length,
        data: buf,
      });

      await tx
        .update(terminals)
        .set({ lastSeenAt: now })
        .where(eq(terminals.id, terminal.id));

      return inserted;
    });

    return receiptResponse(receipt);
  } catch (err: unknown) {
    // Unique (terminal, printJobId) race — another upload won; return it.
    if (printJobId && err instanceof Error && err.message.includes('receipts_terminal_print_job_idx')) {
      const existing = await db
        .select()
        .from(receipts)
        .where(
          and(
            eq(receipts.terminalId, terminal.id),
            eq(receipts.printJobId, printJobId)
          )
        )
        .limit(1);
      if (existing[0]) return receiptResponse(existing[0]);
    }
    throw err;
  }
}
