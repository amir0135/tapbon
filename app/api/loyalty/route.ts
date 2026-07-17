import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { loyaltyCards, merchants } from '@/lib/db/schema';
import { getLoyaltyCard } from '@/lib/receipts/queries';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token || !z.string().uuid().safeParse(token).success) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
  }
  const card = await getLoyaltyCard(token);
  if (!card) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const merchantRows = await db
    .select({ businessName: merchants.businessName })
    .from(merchants)
    .where(eq(merchants.id, card.merchantId))
    .limit(1);
  return NextResponse.json({
    cardToken: card.cardToken,
    stamps: card.stamps,
    stampsRequired: card.stampsRequired,
    merchantId: card.merchantId,
    merchantName: merchantRows[0]?.businessName ?? null,
  });
}

const stampSchema = z.object({
  merchantId: z.number().int().positive(),
  cardToken: z.string().uuid().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = stampSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }
  const { merchantId, cardToken } = parsed.data;

  const merchantRows = await db
    .select({ id: merchants.id })
    .from(merchants)
    .where(eq(merchants.id, merchantId))
    .limit(1);
  if (merchantRows.length === 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  let card = cardToken ? await getLoyaltyCard(cardToken) : null;
  if (card && card.merchantId !== merchantId) card = null;

  if (!card) {
    const [created] = await db
      .insert(loyaltyCards)
      .values({ merchantId, stamps: 1 })
      .returning();
    return NextResponse.json({
      cardToken: created.cardToken,
      stamps: created.stamps,
      stampsRequired: created.stampsRequired,
    });
  }

  // Full card starts over at 1 on the next stamp
  const nextStamps = card.stamps >= card.stampsRequired ? 1 : card.stamps + 1;
  const [updated] = await db
    .update(loyaltyCards)
    .set({ stamps: nextStamps, updatedAt: sql`now()` })
    .where(eq(loyaltyCards.id, card.id))
    .returning();

  return NextResponse.json({
    cardToken: updated.cardToken,
    stamps: updated.stamps,
    stampsRequired: updated.stampsRequired,
  });
}
