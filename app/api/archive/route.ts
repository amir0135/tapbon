import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { customerReceipts, receipts } from '@/lib/db/schema';
import { getCustomerSession } from '@/lib/auth/customer';
import { getCustomerArchive } from '@/lib/receipts/customer-queries';
import { forwardReceiptToAccounting } from '@/lib/email/forward-receipt';

// Kontoens arkiv (specs/customer-account.md v3 — konto-først).
// GET: hent arkivet (joinet live — ingen snapshots).
// POST: gem receipt-ids (dedup, valideret) — bruges af /r + engangsmigrering.
// DELETE: fjern én bon fra kontoen (?id=).

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const entries = await getCustomerArchive(session.customerId);
  return NextResponse.json({ email: session.email, entries });
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

export async function DELETE(request: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = request.nextUrl.searchParams.get('id');
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  await db
    .delete(customerReceipts)
    .where(
      and(
        eq(customerReceipts.customerId, session.customerId),
        eq(customerReceipts.receiptId, parsed.data)
      )
    );

  return NextResponse.json({ removed: true });
}
