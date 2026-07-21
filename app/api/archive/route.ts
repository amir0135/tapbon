import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { customerReceipts, merchants, receipts } from '@/lib/db/schema';
import { getCustomerSession } from '@/lib/auth/customer';
import { forwardReceiptToAccounting } from '@/lib/email/forward-receipt';

// Kvitterings-sync for kunde-konti (specs/customer-account.md).
// GET: hent kontoens arkiv (joinet live — ingen snapshots).
// POST: tilføj receipt-ids fra enhedens lokale arkiv (dedup, valideret).

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const rows = await db
    .select({
      id: receipts.id,
      merchant: merchants.businessName,
      totalGross: receipts.totalGross,
      currency: receipts.currency,
      kind: receipts.kind,
      issuedAt: receipts.issuedAt,
    })
    .from(customerReceipts)
    .innerJoin(receipts, eq(receipts.id, customerReceipts.receiptId))
    .innerJoin(merchants, eq(merchants.id, receipts.merchantId))
    .where(eq(customerReceipts.customerId, session.customerId))
    .orderBy(desc(receipts.issuedAt))
    .limit(500);

  return NextResponse.json({
    email: session.email,
    entries: rows.map((r) => ({ ...r, issuedAt: r.issuedAt.toISOString() })),
  });
}

const syncSchema = z.object({
  receiptIds: z.array(z.string().uuid()).min(1).max(300),
});

export async function POST(request: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = syncSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  // Kun kvitteringer der faktisk findes
  const valid = await db
    .select({ id: receipts.id })
    .from(receipts)
    .where(inArray(receipts.id, parsed.data.receiptIds));

  if (valid.length > 0) {
    const inserted = await db
      .insert(customerReceipts)
      .values(
        valid.map((r) => ({ customerId: session.customerId, receiptId: r.id }))
      )
      .onConflictDoNothing()
      .returning({ receiptId: customerReceipts.receiptId });

    // Regnskabs-forwarding: kun NYE gem (dedup via onConflictDoNothing).
    // Fire-and-forget — må aldrig blokere gem-flowet.
    for (const row of inserted) {
      void forwardReceiptToAccounting(session.customerId, row.receiptId);
    }
  }

  return NextResponse.json({ synced: valid.length });
}
