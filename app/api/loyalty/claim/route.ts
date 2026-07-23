import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { loyaltyCards } from '@/lib/db/schema';
import { getCustomerSession } from '@/lib/auth/customer';

// Engangsmigrering af anonyme token-kort til kontoen (specs/customer-loyalty.md).
// Pr. token: skip hvis kortet tilhører en anden konto; adopter hvis frit;
// merge (stamps = min(sum, required), token-kortet slettes) hvis kontoen
// allerede har et kort hos samme merchant.

const claimSchema = z.object({
  tokens: z.array(z.string().uuid()).min(1).max(50),
});

export async function POST(request: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const cards = await db
    .select()
    .from(loyaltyCards)
    .where(inArray(loyaltyCards.cardToken, parsed.data.tokens));

  let claimed = 0;
  for (const card of cards) {
    if (card.customerId === session.customerId) continue; // allerede min
    if (card.customerId !== null) continue; // en andens kort

    const existing = await db
      .select()
      .from(loyaltyCards)
      .where(
        sql`${loyaltyCards.customerId} = ${session.customerId} and ${loyaltyCards.merchantId} = ${card.merchantId}`
      )
      .limit(1);

    if (existing[0]) {
      // Merge: læg stamps sammen (cap ved required) og slet token-kortet
      const merged = Math.min(
        existing[0].stamps + card.stamps,
        existing[0].stampsRequired
      );
      await db
        .update(loyaltyCards)
        .set({ stamps: merged, updatedAt: sql`now()` })
        .where(eq(loyaltyCards.id, existing[0].id));
      await db.delete(loyaltyCards).where(eq(loyaltyCards.id, card.id));
    } else {
      await db
        .update(loyaltyCards)
        .set({ customerId: session.customerId, updatedAt: sql`now()` })
        .where(eq(loyaltyCards.id, card.id));
    }
    claimed += 1;
  }

  return NextResponse.json({ claimed });
}
