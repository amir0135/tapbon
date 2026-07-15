import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  merchants,
  receipts,
  receiptItems,
  receiptFiles,
  terminals,
  loyaltyCards,
} from '@/lib/db/schema';
import type { Merchant, Terminal } from '@/lib/db/schema';

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

  const [merchantRows, items, fileRows] = await Promise.all([
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
    db
      .select({ mimeType: receiptFiles.mimeType })
      .from(receiptFiles)
      .where(eq(receiptFiles.receiptId, id))
      .limit(1),
  ]);

  return { receipt, merchant: merchantRows[0], items, file: fileRows[0] ?? null };
}

/** File bytes for a captured print job (kind='file'), for streaming. */
export async function getReceiptFile(receiptId: string) {
  const rows = await db
    .select()
    .from(receiptFiles)
    .where(eq(receiptFiles.receiptId, receiptId))
    .limit(1);
  return rows[0] ?? null;
}

/** Terminal + merchant matching a bridge device token hash. */
export async function getTerminalByDeviceTokenHash(tokenHash: string) {
  const rows = await db
    .select({ terminal: terminals, merchant: merchants })
    .from(terminals)
    .innerJoin(merchants, eq(merchants.id, terminals.merchantId))
    .where(eq(terminals.deviceTokenHash, tokenHash))
    .limit(1);
  return rows[0] ?? null;
}

export async function listRecentReceipts(merchantId: number, limit = 10) {
  return db
    .select()
    .from(receipts)
    .where(eq(receipts.merchantId, merchantId))
    .orderBy(desc(receipts.issuedAt))
    .limit(limit);
}

/** Nøgletal til dashboardets oversigt (spec: specs/dashboard.md). */
export async function getDashboardStats(merchantId: number) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  // postgres-js in this select context rejects Date params — pass ISO (UTC,
  // matching stored timestamps)
  const dayIso = startOfDay.toISOString();
  const weekIso = weekAgo.toISOString();

  const [row] = await db
    .select({
      todayCount: sql<number>`count(*) filter (where issued_at >= ${dayIso}::timestamp)::int`,
      // Omsætning = kun structured (fil-boner har totalGross 0)
      todayRevenue: sql<number>`coalesce(sum(total_gross) filter (where issued_at >= ${dayIso}::timestamp), 0)::bigint`,
      weekCount: sql<number>`count(*) filter (where issued_at >= ${weekIso}::timestamp)::int`,
      weekRevenue: sql<number>`coalesce(sum(total_gross) filter (where issued_at >= ${weekIso}::timestamp), 0)::bigint`,
    })
    .from(receipts)
    .where(eq(receipts.merchantId, merchantId));

  return {
    todayCount: Number(row?.todayCount ?? 0),
    todayRevenue: Number(row?.todayRevenue ?? 0),
    weekCount: Number(row?.weekCount ?? 0),
    weekRevenue: Number(row?.weekRevenue ?? 0),
  };
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

/**
 * Atomically claim the terminal's latest pending receipt (first tap wins).
 * Only delivery metadata (status/claimed_at) is updated — receipt content
 * stays immutable. Returns the claimed receipt id, or null if none pending.
 */
export async function claimLatestReceipt(publicId: string): Promise<{
  terminal: Terminal | null;
  merchant: Merchant | null;
  receiptId: string | null;
}> {
  const row = await getTerminalWithMerchant(publicId);
  if (!row) return { terminal: null, merchant: null, receiptId: null };
  const { terminal, merchant } = row;

  const claimed = await db.execute<{ id: string }>(sql`
    UPDATE receipts
    SET status = 'claimed', claimed_at = now()
    WHERE id = (
      SELECT id FROM receipts
      WHERE merchant_id = ${terminal.merchantId}
        AND (terminal_id = ${terminal.id} OR terminal_id IS NULL)
        AND status = 'pending'
        AND expires_at > now()
      ORDER BY issued_at DESC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id
  `);

  return { terminal, merchant, receiptId: claimed[0]?.id ?? null };
}

export async function getLoyaltyCard(cardToken: string) {
  const rows = await db
    .select()
    .from(loyaltyCards)
    .where(eq(loyaltyCards.cardToken, cardToken))
    .limit(1);
  return rows[0] ?? null;
}
