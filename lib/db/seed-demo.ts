// Demo café seed — realistic pitch content (PROGRESS.md "Next up").
// Idempotent: re-running skips everything that already exists.
// Run: npx tsx lib/db/seed-demo.ts   (or: pnpm db:seed:demo)
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import {
  users,
  teams,
  teamMembers,
  merchants,
  terminals,
  receipts,
  receiptItems,
} from './schema';
import { hashPassword } from '@/lib/auth/session';
import { computeVat, lineTotalGross } from '@/lib/vat';
import { hashReceipt } from '@/lib/receipts/hash';

const DEMO_EMAIL = 'demo@tapbon.dk';
const DEMO_PASSWORD = 'tapbon-demo1';

// Menu prices in integer øre, gross (incl. moms). Café food/drink = 25%.
const MENU = [
  { name: 'Cortado', unitPriceGross: 4200, vatRate: 2500 },
  { name: 'Cappuccino', unitPriceGross: 4500, vatRate: 2500 },
  { name: 'Filterkaffe', unitPriceGross: 3500, vatRate: 2500 },
  { name: 'Latte', unitPriceGross: 4800, vatRate: 2500 },
  { name: 'Croissant', unitPriceGross: 3800, vatRate: 2500 },
  { name: 'Kanelsnegl', unitPriceGross: 4000, vatRate: 2500 },
  { name: 'Tebirkes', unitPriceGross: 3200, vatRate: 2500 },
  { name: 'Avocadomad', unitPriceGross: 8500, vatRate: 2500 },
  { name: 'Chai latte', unitPriceGross: 5000, vatRate: 2500 },
  { name: 'Danskvand', unitPriceGross: 2500, vatRate: 2500 },
] as const;

// Deterministic-ish baskets: 1–3 items each, spread over the last 3 days.
const BASKETS: { items: { menu: number; qty: number }[]; minutesAgo: number }[] = [
  { items: [{ menu: 0, qty: 1 }, { menu: 4, qty: 1 }], minutesAgo: 5 },
  { items: [{ menu: 1, qty: 2 }], minutesAgo: 42 },
  { items: [{ menu: 3, qty: 1 }, { menu: 5, qty: 1 }], minutesAgo: 95 },
  { items: [{ menu: 7, qty: 1 }, { menu: 2, qty: 1 }, { menu: 9, qty: 1 }], minutesAgo: 60 * 5 },
  { items: [{ menu: 8, qty: 1 }], minutesAgo: 60 * 8 },
  { items: [{ menu: 0, qty: 2 }, { menu: 6, qty: 2 }], minutesAgo: 60 * 26 },
  { items: [{ menu: 2, qty: 1 }, { menu: 5, qty: 1 }], minutesAgo: 60 * 30 },
  { items: [{ menu: 1, qty: 1 }, { menu: 4, qty: 2 }], minutesAgo: 60 * 50 },
  { items: [{ menu: 3, qty: 2 }, { menu: 7, qty: 1 }], minutesAgo: 60 * 55 },
  { items: [{ menu: 9, qty: 1 }, { menu: 6, qty: 1 }], minutesAgo: 60 * 70 },
];

async function seedDemo() {
  // 1. Demo user (+ team, as the starter's sign-up flow does)
  let [user] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL));
  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        name: 'Demo Café',
        email: DEMO_EMAIL,
        passwordHash: await hashPassword(DEMO_PASSWORD),
        role: 'owner',
      })
      .returning();
    const [team] = await db
      .insert(teams)
      .values({ name: 'Kaffebar Botanik' })
      .returning();
    await db
      .insert(teamMembers)
      .values({ teamId: team.id, userId: user.id, role: 'owner' });
    console.log(`Created demo user ${DEMO_EMAIL} (password: ${DEMO_PASSWORD})`);
  } else {
    console.log(`Demo user ${DEMO_EMAIL} already exists.`);
  }

  // 2. Merchant + terminal
  let [merchant] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.userId, user.id));
  if (!merchant) {
    [merchant] = await db
      .insert(merchants)
      .values({
        userId: user.id,
        businessName: 'Kaffebar Botanik',
        cvrNumber: '12345678', // demo CVR — not a real company
        locale: 'da',
        currency: 'DKK',
        googleReviewUrl: 'https://g.page/r/tapbon-demo/review',
      })
      .returning();
    await db.insert(terminals).values({
      merchantId: merchant.id,
      publicId: randomBytes(6).toString('base64url').slice(0, 8),
      name: 'Kasse 1',
    });
    console.log('Created merchant "Kaffebar Botanik" + terminal "Kasse 1".');
  } else {
    console.log(`Merchant "${merchant.businessName}" already exists.`);
  }

  const [terminal] = await db
    .select()
    .from(terminals)
    .where(eq(terminals.merchantId, merchant.id));

  // 3. Receipts — same immutable path as real issuance: computeVat + hash,
  //    receipt + items in one transaction. Skip if demo receipts exist.
  const existing = await db
    .select({ id: receipts.id })
    .from(receipts)
    .where(eq(receipts.merchantId, merchant.id))
    .limit(1);
  if (existing.length > 0) {
    console.log('Demo receipts already exist — skipping.');
    return;
  }

  for (const basket of BASKETS) {
    const items = basket.items.map(({ menu, qty }) => ({
      name: MENU[menu].name,
      qty,
      unitPriceGross: MENU[menu].unitPriceGross,
      vatRate: MENU[menu].vatRate,
    }));
    const totals = computeVat(items);
    const issuedAt = new Date(Date.now() - basket.minutesAgo * 60_000);
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

    await db.transaction(async (tx) => {
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
    });
  }
  console.log(`Issued ${BASKETS.length} demo receipts.`);
  if (terminal) {
    console.log(`Terminal stand: /t/${terminal.publicId}/stand`);
  }
}

seedDemo()
  .catch((error) => {
    console.error('Demo seed failed:', error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
