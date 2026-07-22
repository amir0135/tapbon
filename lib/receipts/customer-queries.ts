import 'server-only';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  customerProjects,
  customerReceipts,
  merchants,
  receipts,
} from '@/lib/db/schema';

// Kunde-analytics (specs/customer-insights.md) — afledt af customer_receipts.
// Alle beløb er heltal-øre; fil-boner (kind='file') har totalGross 0 og
// udelades af beløbssummer, men tælles med i antal.

export type MonthBucket = { month: string; total: number; count: number };

export async function getCustomerSpending(customerId: number) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  // Date-params fejler i postgres-js select-kontekst — brug ISO + ::timestamp
  const monthIso = monthStart.toISOString();
  const sixIso = sixMonthsAgo.toISOString();

  const [totals] = await db
    .select({
      monthTotal: sql<number>`coalesce(sum(${receipts.totalGross}) filter (where ${receipts.kind} = 'structured' and ${receipts.issuedAt} >= ${monthIso}::timestamp), 0)::bigint`,
      monthCount: sql<number>`count(*) filter (where ${receipts.issuedAt} >= ${monthIso}::timestamp)::int`,
    })
    .from(customerReceipts)
    .innerJoin(receipts, eq(receipts.id, customerReceipts.receiptId))
    .where(eq(customerReceipts.customerId, customerId));

  const monthRows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${receipts.issuedAt}), 'YYYY-MM')`,
      total: sql<number>`coalesce(sum(${receipts.totalGross}) filter (where ${receipts.kind} = 'structured'), 0)::bigint`,
      count: sql<number>`count(*)::int`,
    })
    .from(customerReceipts)
    .innerJoin(receipts, eq(receipts.id, customerReceipts.receiptId))
    .where(
      and(
        eq(customerReceipts.customerId, customerId),
        sql`${receipts.issuedAt} >= ${sixIso}::timestamp`
      )
    )
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  // Udfyld tomme måneder, så diagrammet altid viser 6 søjler
  const byMonth = new Map(monthRows.map((r) => [r.month, r]));
  const months: MonthBucket[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const row = byMonth.get(key);
    months.push({
      month: key,
      total: Number(row?.total ?? 0),
      count: Number(row?.count ?? 0),
    });
  }

  const merchantRows = await db
    .select({
      name: merchants.businessName,
      total: sql<number>`coalesce(sum(${receipts.totalGross}) filter (where ${receipts.kind} = 'structured'), 0)::bigint`,
      count: sql<number>`count(*)::int`,
    })
    .from(customerReceipts)
    .innerJoin(receipts, eq(receipts.id, customerReceipts.receiptId))
    .innerJoin(merchants, eq(merchants.id, receipts.merchantId))
    .where(eq(customerReceipts.customerId, customerId))
    .groupBy(merchants.id, merchants.businessName)
    .orderBy(sql`2 desc`)
    .limit(8);

  return {
    monthTotal: Number(totals?.monthTotal ?? 0),
    monthCount: Number(totals?.monthCount ?? 0),
    months,
    byMerchant: merchantRows.map((r) => ({
      name: r.name,
      total: Number(r.total),
      count: Number(r.count),
    })),
  };
}

/** Forhandlere betalt 2+ gange = faste betalinger/abonnementer (afledt visning). */
export async function getRecurringMerchants(customerId: number) {
  const rows = await db
    .select({
      name: merchants.businessName,
      count: sql<number>`count(*)::int`,
      lastAt: sql<string>`max(${receipts.issuedAt})::text`,
      avgTotal: sql<number>`coalesce(avg(${receipts.totalGross}) filter (where ${receipts.kind} = 'structured'), 0)::bigint`,
      currency: sql<string>`min(${receipts.currency})`,
    })
    .from(customerReceipts)
    .innerJoin(receipts, eq(receipts.id, customerReceipts.receiptId))
    .innerJoin(merchants, eq(merchants.id, receipts.merchantId))
    .where(eq(customerReceipts.customerId, customerId))
    .groupBy(merchants.id, merchants.businessName)
    .having(sql`count(*) >= 2`)
    .orderBy(sql`count(*) desc`);

  return rows.map((r) => ({
    name: r.name,
    count: Number(r.count),
    lastAt: new Date(r.lastAt),
    avgTotal: Number(r.avgTotal),
    currency: r.currency,
  }));
}

/** Kontoens arkiv (specs/customer-account.md v3) — joinet live, nyeste først. */
export async function getCustomerArchive(customerId: number) {
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
    .where(eq(customerReceipts.customerId, customerId))
    .orderBy(desc(receipts.issuedAt))
    .limit(500);

  return rows.map((r) => ({
    ...r,
    kind: (r.kind === 'file' ? 'file' : 'structured') as 'file' | 'structured',
    issuedAt: r.issuedAt.toISOString(),
  }));
}

// ── Projekter (specs/customer-projects.md) ──────────────────────────────────

export async function listProjects(customerId: number) {
  return db
    .select({
      id: customerProjects.id,
      name: customerProjects.name,
      receiptCount: sql<number>`(select count(*) from customer_receipts cr where cr.project_id = ${customerProjects.id})::int`,
    })
    .from(customerProjects)
    .where(eq(customerProjects.customerId, customerId))
    .orderBy(desc(customerProjects.createdAt));
}

export async function getProject(customerId: number, projectId: number) {
  const rows = await db
    .select()
    .from(customerProjects)
    .where(
      and(
        eq(customerProjects.id, projectId),
        eq(customerProjects.customerId, customerId)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

/** Kontoens gemte boner med projekt-status — til projekt-detaljesiden. */
export async function listReceiptsForProject(customerId: number, projectId: number) {
  const base = {
    id: receipts.id,
    merchant: merchants.businessName,
    totalGross: receipts.totalGross,
    currency: receipts.currency,
    kind: receipts.kind,
    issuedAt: receipts.issuedAt,
  };
  const [inProject, unassigned] = await Promise.all([
    db
      .select(base)
      .from(customerReceipts)
      .innerJoin(receipts, eq(receipts.id, customerReceipts.receiptId))
      .innerJoin(merchants, eq(merchants.id, receipts.merchantId))
      .where(
        and(
          eq(customerReceipts.customerId, customerId),
          eq(customerReceipts.projectId, projectId)
        )
      )
      .orderBy(desc(receipts.issuedAt))
      .limit(200),
    db
      .select(base)
      .from(customerReceipts)
      .innerJoin(receipts, eq(receipts.id, customerReceipts.receiptId))
      .innerJoin(merchants, eq(merchants.id, receipts.merchantId))
      .where(
        and(
          eq(customerReceipts.customerId, customerId),
          isNull(customerReceipts.projectId)
        )
      )
      .orderBy(desc(receipts.issuedAt))
      .limit(200),
  ]);
  return { inProject, unassigned };
}
