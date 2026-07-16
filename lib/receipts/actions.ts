'use server';

import { z } from 'zod';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { merchants, receipts, receiptItems, terminals } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { getMerchantForUser, getDefaultTerminal } from './queries';
import { computeVat, lineTotalGross } from '@/lib/vat';
import { hashReceipt } from './hash';
import { eq } from 'drizzle-orm';

// Claim window for receipts issued manually from the dashboard form. Bridge
// receipts use a much shorter window (see /api/bridge/receipts).
const FORM_CLAIM_WINDOW_MS = 15 * 60 * 1000;

const merchantSchema = z.object({
  businessName: z.string().min(1).max(200),
  cvrNumber: z.string().min(4).max(20),
  currency: z.enum(['DKK', 'SEK', 'NOK', 'EUR']),
  googleReviewUrl: z.union([z.string().url().max(500), z.literal('')]),
  // Onboarding-svar (valgfri — kommer fra wizard'en, specs/onboarding-wizard.md)
  businessType: z.string().max(30).optional(),
  posSystem: z.string().max(30).optional(),
  dailyReceipts: z.string().max(30).optional(),
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
    businessType: formData.get('businessType') ?? undefined,
    posSystem: formData.get('posSystem') ?? undefined,
    dailyReceipts: formData.get('dailyReceipts') ?? undefined,
  });
  if (!parsed.success) return { error: 'invalid_input' };

  const { businessType, posSystem, dailyReceipts } = parsed.data;
  const onboardingProfile =
    businessType || posSystem || dailyReceipts
      ? { businessType, posSystem, dailyReceipts }
      : null;

  const [merchant] = await db
    .insert(merchants)
    .values({
      userId: user.id,
      businessName: parsed.data.businessName,
      cvrNumber: parsed.data.cvrNumber,
      currency: parsed.data.currency,
      googleReviewUrl: parsed.data.googleReviewUrl || null,
      onboardingProfile,
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

const updateMerchantSchema = z.object({
  businessName: z.string().min(1).max(200),
  cvrNumber: z.string().min(4).max(20),
  logoUrl: z.union([z.string().url().max(500), z.literal('')]),
  googleReviewUrl: z.union([z.string().url().max(500), z.literal('')]),
});

/** Rediger forretningsprofil (spec: specs/settings.md). Valuta er låst. */
export async function updateMerchant(prevState: unknown, formData: FormData) {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  const merchant = await getMerchantForUser(user.id);
  if (!merchant) return { error: 'no_merchant' as const };

  const parsed = updateMerchantSchema.safeParse({
    businessName: formData.get('businessName'),
    cvrNumber: formData.get('cvrNumber'),
    logoUrl: formData.get('logoUrl') ?? '',
    googleReviewUrl: formData.get('googleReviewUrl') ?? '',
  });
  if (!parsed.success) return { error: 'invalid_input' as const };

  await db
    .update(merchants)
    .set({
      businessName: parsed.data.businessName,
      cvrNumber: parsed.data.cvrNumber,
      logoUrl: parsed.data.logoUrl || null,
      googleReviewUrl: parsed.data.googleReviewUrl || null,
    })
    .where(eq(merchants.id, merchant.id));

  revalidatePath('/dashboard/general');
  revalidatePath('/dashboard');
  return { success: true as const };
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

  // Insert receipt + items atomically. Receipts are immutable after this
  // (status/claimed_at are delivery metadata, exempt — see schema).
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
        confirmationCode: String(randomInt(0, 10_000)).padStart(4, '0'),
        expiresAt: new Date(issuedAt.getTime() + FORM_CLAIM_WINDOW_MS),
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

/**
 * Generate (or rotate) the bridge device token for the merchant's default
 * terminal. Only the SHA-256 hash is stored; the plaintext is returned once.
 */
export async function generateDeviceToken() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  const merchant = await getMerchantForUser(user.id);
  if (!merchant) return { error: 'no_merchant' as const };

  const terminal = await getDefaultTerminal(merchant.id);
  if (!terminal) return { error: 'no_terminal' as const };

  const token = `tb_${randomBytes(24).toString('base64url')}`;
  const tokenHash = createHash('sha256').update(token).digest('hex');

  await db
    .update(terminals)
    .set({ deviceTokenHash: tokenHash })
    .where(eq(terminals.id, terminal.id));

  return { success: true as const, token };
}
