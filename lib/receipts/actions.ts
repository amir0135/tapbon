'use server';

import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { merchants, receipts, receiptItems, terminals } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { getMerchantForUser, getDefaultTerminal } from './queries';
import { computeVat, lineTotalGross } from '@/lib/vat';
import { hashReceipt } from './hash';

const merchantSchema = z.object({
  businessName: z.string().min(1).max(200),
  cvrNumber: z.string().min(4).max(20),
  currency: z.enum(['DKK', 'SEK', 'NOK', 'EUR']),
  googleReviewUrl: z.union([z.string().url().max(500), z.literal('')]),
});

export async function createMerchant(formData: FormData) {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  const existing = await getMerchantForUser(user.id);
  if (existing) return { error: 'merchant_exists' };

  const parsed = merchantSchema.safeParse({
    businessName: formData.get('businessName'),
    cvrNumber: formData.get('cvrNumber'),
    currency: formData.get('currency'),
    googleReviewUrl: formData.get('googleReviewUrl') ?? '',
  });
  if (!parsed.success) return { error: 'invalid_input' };

  const [merchant] = await db
    .insert(merchants)
    .values({
      userId: user.id,
      businessName: parsed.data.businessName,
      cvrNumber: parsed.data.cvrNumber,
      currency: parsed.data.currency,
      googleReviewUrl: parsed.data.googleReviewUrl || null,
    })
    .returning();

  // One default terminal per merchant (spec: terminal-claim.md)
  await db.insert(terminals).values({
    merchantId: merchant.id,
    publicId: randomBytes(6).toString('base64url').slice(0, 8),
    name: 'Kasse 1',
  });

  revalidatePath('/dashboard/receipts');
  return { success: true };
}

const issueSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        qty: z.number().int().min(1).max(999),
        unitPriceGross: z.number().int().min(0).max(100_000_000), // øre
        vatRate: z.union([
          z.literal(0),
          z.literal(600),
          z.literal(1200),
          z.literal(2500),
        ]),
      })
    )
    .min(1)
    .max(50),
});

export async function issueReceipt(input: unknown) {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  const merchant = await getMerchantForUser(user.id);
  if (!merchant) return { error: 'no_merchant' as const };

  const parsed = issueSchema.safeParse(input);
  if (!parsed.success) return { error: 'invalid_input' as const };
  const { items } = parsed.data;

  const totals = computeVat(items);
  const issuedAt = new Date();
  const terminal = await getDefaultTerminal(merchant.id);

  const hash = hashReceipt({
    merchantId: merchant.id,
    issuedAt: issuedAt.toISOString(),
    currency: merchant.currency,
    totalGross: totals.totalGross,
    totalNet: totals.totalNet,
    totalVat: totals.totalVat,
    vatBreakdown: totals.breakdown,
    items,
  });

  // Insert receipt + items atomically. Receipts are immutable after this.
  const receiptId = await db.transaction(async (tx) => {
    const [receipt] = await tx
      .insert(receipts)
      .values({
        merchantId: merchant.id,
        terminalId: terminal?.id ?? null,
        issuedAt,
        currency: merchant.currency,
        totalGross: totals.totalGross,
        totalNet: totals.totalNet,
        totalVat: totals.totalVat,
        vatBreakdown: totals.breakdown,
        hash,
      })
      .returning({ id: receipts.id });

    await tx.insert(receiptItems).values(
      items.map((item) => ({
        receiptId: receipt.id,
        name: item.name,
        qty: item.qty,
        unitPriceGross: item.unitPriceGross,
        vatRate: item.vatRate,
        lineTotalGross: lineTotalGross(item),
      }))
    );
    return receipt.id;
  });

  revalidatePath('/dashboard/receipts');
  return { success: true as const, receiptId };
}
