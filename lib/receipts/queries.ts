import { desc, eq, gte, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  merchants,
  receipts,
  receiptItems,
  terminals,
  loyaltyCards,
} from '@/lib/db/schema';
import type { Merchant, Receipt, Terminal } from '@/lib/db/schema';

export async function getMerchantForUser(userId: number) {
  const rows = await db
    .select()
    .from(merchants)
    .where(eq(merchants.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getReceiptWithDetails(id: string) {
  const receiptRows = await db
    .select()
    .from(receipts)
    .where(eq(receipts.id, id))
    .limit(1);
  const receipt = receiptRows[0];
  if (!receipt) return null;

  const [merchantRows, items] = await Promise.all([
    db
      .select()
      .from(merchants)
      .where(eq(merchants.id, receipt.merchantId))
      .limit(1),
    db
      .select()
      .from(receiptItems)
      .where(eq(receiptItems.receiptId, id))
      .orderBy(receiptItems.id),
  ]);

  return { receipt, merchant: merchantRows[0], items };
}

export async function listRecentReceipts(merchantId: number, limit = 10) {
  return db
    .select()
    .from(receipts)
    .where(eq(receipts.merchantId, merchantId))
    .orderBy(desc(receipts.issuedAt))
    .limit(limit);
}

export async function getDefaultTerminal(merchantId: number) {
  const rows = await db
    .select()
    .from(terminals)
    .where(eq(terminals.merchantId, merchantId))
    .limit(1);
  return rows[0] ?? null;
}

/** Terminal + its merchant by public slug (QR stand, claim page). */
export async function getTerminalWithMerchant(publicId: string) {
  const rows = await db
    .select({ terminal: terminals, merchant: merchants })
    .from(terminals)
    .innerJoin(merchants, eq(merchants.id, terminals.merchantId))
    .where(eq(terminals.publicId, publicId))
    .limit(1);
  return rows[0] ?? null;
}

const CLAIM_WINDOW_MS = 15 * 60 * 1000;

/** Latest receipt for a terminal's merchant within the claim window. */
export async function claimLatestReceipt(publicId: string): Promise<{
  terminal: Terminal | null;
  merchant: Merchant | null;
  receipt: Receipt | null;
}> {
  const terminalRows = await db
    .select()
    .from(terminals)
    .where(eq(terminals.publicId, publicId))
    .limit(1);
  const terminal = terminalRows[0];
  if (!terminal) return { terminal: null, merchant: null, receipt: null };

  const merchantRows = await db
    .select()
    .from(merchants)
    .where(eq(merchants.id, terminal.merchantId))
    .limit(1);

  const cutoff = new Date(Date.now() - CLAIM_WINDOW_MS);
  const receiptRows = await db
    .select()
    .from(receipts)
    .where(
      and(eq(receipts.merchantId, terminal.merchantId), gte(receipts.issuedAt, cutoff))
    )
    .orderBy(desc(receipts.issuedAt))
    .limit(1);

  return {
    terminal,
    merchant: merchantRows[0] ?? null,
    receipt: receiptRows[0] ?? null,
  };
}

export async function getLoyaltyCard(cardToken: string) {
  const rows = await db
    .select()
    .from(loyaltyCards)
    .where(eq(loyaltyCards.cardToken, cardToken))
    .limit(1);
  return rows[0] ?? null;
}
