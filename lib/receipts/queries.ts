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

/** Salgsrapport (specs/merchant-reports.md). Alle beløb heltal-øre;
 *  omsætning = kun structured (fil-boner har totalGross 0). */
export async function getSalesReport(merchantId: number) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const days14 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
  const days30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  // Date-params fejler i postgres-js select-kontekst — ISO + ::timestamp
  const monthIso = monthStart.toISOString();
  const days14Iso = days14.toISOString();
  const days30Iso = days30.toISOString();

  const [totals] = await db
    .select({
      monthTotal: sql<number>`coalesce(sum(total_gross) filter (where issued_at >= ${monthIso}::timestamp), 0)::bigint`,
      monthCount: sql<number>`count(*) filter (where issued_at >= ${monthIso}::timestamp)::int`,
    })
    .from(receipts)
    .where(eq(receipts.merchantId, merchantId));

  const dayRows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', issued_at), 'YYYY-MM-DD')`,
      total: sql<number>`coalesce(sum(total_gross), 0)::bigint`,
      count: sql<number>`count(*)::int`,
    })
    .from(receipts)
    .where(
      sql`${receipts.merchantId} = ${merchantId} and issued_at >= ${days14Iso}::timestamp`
    )
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  // Udfyld tomme dage, så diagrammet altid viser 14 søjler
  const byDay = new Map(dayRows.map((r) => [r.day, r]));
  const days: { date: string; total: number; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const row = byDay.get(key);
    days.push({ date: key, total: Number(row?.total ?? 0), count: Number(row?.count ?? 0) });
  }

  const topItems = await db
    .select({
      name: receiptItems.name,
      qty: sql<number>`sum(${receiptItems.qty})::int`,
      total: sql<number>`sum(${receiptItems.lineTotalGross})::bigint`,
    })
    .from(receiptItems)
    .innerJoin(receipts, eq(receipts.id, receiptItems.receiptId))
    .where(
      sql`${receipts.merchantId} = ${merchantId} and ${receipts.issuedAt} >= ${days30Iso}::timestamp`
    )
    .groupBy(receiptItems.name)
    .orderBy(sql`3 desc`)
    .limit(8);

  // Moms pr. sats denne måned — vat_breakdown er allerede afrundet pr. sats
  // ved udstedelse (lib/vat); her summeres kun (heltal-øre).
  const vatRows = await db.execute<{
    rate: number;
    vat: number;
    gross: number;
  }>(sql`
    select (e->>'rate')::int as rate,
           sum((e->>'vat')::bigint)::bigint as vat,
           sum((e->>'gross')::bigint)::bigint as gross
    from receipts, jsonb_array_elements(vat_breakdown) e
    where merchant_id = ${merchantId}
      and issued_at >= ${monthIso}::timestamp
      and kind = 'structured'
    group by 1
    order by 1 desc
  `);

  return {
    monthTotal: Number(totals?.monthTotal ?? 0),
    monthCount: Number(totals?.monthCount ?? 0),
    days,
    topItems: topItems.map((r) => ({
      name: r.name,
      qty: Number(r.qty),
      total: Number(r.total),
    })),
    vatByRate: [...vatRows].map((r) => ({
      rate: Number(r.rate),
      vat: Number(r.vat),
      gross: Number(r.gross),
    })),
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

/** Merchantens terminaler til Enheder-siden (specs/merchant-devices.md). */
export async function listTerminals(merchantId: number) {
  const rows = await db
    .select({
      id: terminals.id,
      name: terminals.name,
      publicId: terminals.publicId,
      lastSeenAt: terminals.lastSeenAt,
      hasToken: sql<boolean>`${terminals.deviceTokenHash} is not null`,
      // PITFALL: ${terminals.id} renderes ukvalificeret ("id") og fanges af
      // subqueryens scope (r.id er uuid) — kvalificér identifieren råt.
      receiptCount: sql<number>`(select count(*) from receipts r where r.terminal_id = "terminals"."id")::int`,
    })
    .from(terminals)
    .where(eq(terminals.merchantId, merchantId))
    .orderBy(terminals.createdAt);

  return rows.map((r) => ({
    ...r,
    hasToken: Boolean(r.hasToken),
    receiptCount: Number(r.receiptCount),
    lastSeenAt: r.lastSeenAt ? r.lastSeenAt.toISOString() : null,
  }));
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
