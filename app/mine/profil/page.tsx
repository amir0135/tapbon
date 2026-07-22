import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getCustomerSession } from '@/lib/auth/customer';
import { db } from '@/lib/db/drizzle';
import { customers } from '@/lib/db/schema';
import { ProfileView } from './profile-view';
import pkg from '@/package.json';

export const metadata: Metadata = {
  title: 'Profil — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/** Kundeprofil (specs/customer-profile.md) — konto-først: kræver login. */
export default async function ProfilePage() {
  const [session, locale] = await Promise.all([
    getCustomerSession(),
    getLocale(),
  ]);

  if (!session) redirect('/mine');

  let customer:
    | {
        email: string;
        name: string | null;
        phone: string | null;
        hasPassword: boolean;
        forwards: { economic?: string; dinero?: string; billy?: string };
      }
    | null = null;
  if (session) {
    const rows = await db
      .select({
        email: customers.email,
        name: customers.name,
        phone: customers.phone,
        passwordHash: customers.passwordHash,
        accountingForwards: customers.accountingForwards,
      })
      .from(customers)
      .where(eq(customers.id, session.customerId))
      .limit(1);
    const row = rows[0];
    if (row) {
      customer = {
        email: row.email,
        name: row.name,
        phone: row.phone,
        hasPassword: Boolean(row.passwordHash),
        forwards: row.accountingForwards ?? {},
      };
    }
  }

  return (
    <ProfileView
      customer={customer}
      locale={locale}
      version={pkg.version}
    />
  );
}
