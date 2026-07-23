import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { loyaltyCards, merchants } from '@/lib/db/schema';
import { getLoyaltyCard } from '@/lib/receipts/queries';
import { getCustomerLoyaltyCard } from '@/lib/receipts/customer-queries';
import { getCustomerSession } from '@/lib/auth/customer';

// Stempelkort (specs/customer-loyalty.md): anonyme token-kort + konto-kort.
// GET ?token=      — slå kort op via token (anonymt flow)
// GET ?merchantId= — kontoens kort hos merchanten (kræver session)
// POST             — stempl; logget ind binder kortet til kontoen

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (token) {
    if (!z.string().uuid().safeParse(token).success) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
    }
    const card = await getLoyaltyCard(token);
    if (!card) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(await withMerchantName(card));
  }

  // Konto-branch: ?merchantId= + session
  const merchantIdRaw = request.nextUrl.searchParams.get('merchantId');
  const merchantId = Number(merchantIdRaw);
  if (!merchantIdRaw || !Number.isInteger(merchantId) || merchantId <= 0) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const card = await getCustomerLoyaltyCard(session.customerId, merchantId);
  if (!card) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(await withMerchantName(card));
}

async function withMerchantName(card: {
  cardToken: string;
  stamps: number;
  stampsRequired: number;
  merchantId: number;
}) {
  const merchantRows = await db
    .select({ businessName: merchants.businessName })
    .from(merchants)
    .where(eq(merchants.id, card.merchantId))
    .limit(1);
  return {
    cardToken: card.cardToken,
    stamps: card.stamps,
    stampsRequired: card.stampsRequired,
    merchantId: card.merchantId,
    merchantName: merchantRows[0]?.businessName ?? null,
  };
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
  const session = await getCustomerSession();

  const merchantRows = await db
    .select({ id: merchants.id })
    .from(merchants)
    .where(eq(merchants.id, merchantId))
    .limit(1);
  if (merchantRows.length === 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Kontoens kort hos merchanten vinder over token (specs/customer-loyalty.md)
  let card = session
    ? await getCustomerLoyaltyCard(session.customerId, merchantId)
    : null;
  if (!card && cardToken) {
    const byToken = await getLoyaltyCard(cardToken);
    // Kun eget/frit kort hos samme merchant
    if (
      byToken &&
      byToken.merchantId === merchantId &&
      (byToken.customerId === null || byToken.customerId === session?.customerId)
    ) {
      card = byToken;
    }
  }

  if (!card) {
    const [created] = await db
      .insert(loyaltyCards)
      .values({ merchantId, stamps: 1, customerId: session?.customerId ?? null })
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
    .set({
      stamps: nextStamps,
      // Logget ind adopterer anonyme kort ved stempling
      customerId: card.customerId ?? session?.customerId ?? null,
      updatedAt: sql`now()`,
    })
    .where(eq(loyaltyCards.id, card.id))
    .returning();

  return NextResponse.json({
    cardToken: updated.cardToken,
    stamps: updated.stamps,
    stampsRequired: updated.stampsRequired,
  });
}
