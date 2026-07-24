import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from './drizzle';

// Founder-overblik (specs/admin-overview.md). Adgang styres af ADMIN_EMAILS
// (kommasepareret env) — tjekkes i page-komponenten via isAdminEmail.

export function isAdminEmail(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export type AdminOverview = {
  totals: {
    users: number;
    customers: number;
    merchants: number;
    receipts: number;
  };
  week: {
    newUsers: number;
    newCustomers: number;
    receipts: number;
    activeMerchants: number;
    bridgesOnline: number;
  };
  signupDays: { date: string; users: number; customers: number }[];
  latestSignups: {
    name: string | null;
    email: string;
    businessName: string | null;
    createdAt: Date;
  }[];
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const now = new Date();
  const days7Iso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const days14 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
  const days14Iso = days14.toISOString();

  const [totalsRows, weekRows, signupRows, latestRows] = await Promise.all([
    db.execute<{
      users: number;
      customers: number;
      merchants: number;
      receipts: number;
    }>(sql`
      select
        (select count(*) from users where deleted_at is null)::int as users,
        (select count(*) from customers)::int as customers,
        (select count(*) from merchants)::int as merchants,
        (select count(*) from receipts)::int as receipts
    `),
    db.execute<{
      new_users: number;
      new_customers: number;
      receipts: number;
      active_merchants: number;
      bridges_online: number;
    }>(sql`
      select
        (select count(*) from users
          where deleted_at is null and created_at >= ${days7Iso}::timestamp)::int as new_users,
        (select count(*) from customers
          where created_at >= ${days7Iso}::timestamp)::int as new_customers,
        (select count(*) from receipts
          where issued_at >= ${days7Iso}::timestamp)::int as receipts,
        (select count(distinct merchant_id) from receipts
          where issued_at >= ${days7Iso}::timestamp)::int as active_merchants,
        (select count(*) from terminals
          where last_seen_at >= now() - interval '3 minutes')::int as bridges_online
    `),
    db.execute<{ day: string; users: number; customers: number }>(sql`
      select day, sum(u)::int as users, sum(c)::int as customers from (
        select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
               count(*) as u, 0 as c
        from users
        where deleted_at is null and created_at >= ${days14Iso}::timestamp
        group by 1
        union all
        select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
               0 as u, count(*) as c
        from customers
        where created_at >= ${days14Iso}::timestamp
        group by 1
      ) t
      group by 1
    `),
    // Seneste signups: merchant-brugere + rene kunde-konti (e-mail-broen kan
    // give samme e-mail i begge tabeller — kunder m/ user-match filtreres fra)
    db.execute<{
      name: string | null;
      email: string;
      business_name: string | null;
      created_at: string;
    }>(sql`
      select u.name, u.email, m.business_name, u.created_at
      from users u
      left join merchants m on m.user_id = u.id
      where u.deleted_at is null
      union all
      select c.name, c.email, null as business_name, c.created_at
      from customers c
      where not exists (select 1 from users u2 where u2.email = c.email)
      order by created_at desc
      limit 20
    `),
  ]);

  const totals = [...totalsRows][0];
  const week = [...weekRows][0];

  // Udfyld tomme dage, så grafen altid viser 14 søjler (samme mønster som rapporter)
  const byDay = new Map([...signupRows].map((r) => [r.day, r]));
  const signupDays: AdminOverview['signupDays'] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const row = byDay.get(key);
    signupDays.push({
      date: key,
      users: Number(row?.users ?? 0),
      customers: Number(row?.customers ?? 0),
    });
  }

  return {
    totals: {
      users: Number(totals?.users ?? 0),
      customers: Number(totals?.customers ?? 0),
      merchants: Number(totals?.merchants ?? 0),
      receipts: Number(totals?.receipts ?? 0),
    },
    week: {
      newUsers: Number(week?.new_users ?? 0),
      newCustomers: Number(week?.new_customers ?? 0),
      receipts: Number(week?.receipts ?? 0),
      activeMerchants: Number(week?.active_merchants ?? 0),
      bridgesOnline: Number(week?.bridges_online ?? 0),
    },
    signupDays,
    latestSignups: [...latestRows].map((r) => ({
      name: r.name,
      email: r.email,
      businessName: r.business_name,
      createdAt: new Date(r.created_at),
    })),
  };
}
