import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { getLocale } from 'next-intl/server';
import { getCustomerSession } from '@/lib/auth/customer';
import { db } from '@/lib/db/drizzle';
import { customers } from '@/lib/db/schema';
import { ProfileView } from './profile-view';

export const metadata: Metadata = {
  title: 'Profil — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/** Kundeprofil (specs/customer-profile.md). */
export default async function ProfilePage() {
  const [session, locale] = await Promise.all([getCustomerSession(), getLocale()]);

  let customer: { email: string; name: string | null; phone: string | null } | null =
    null;
  if (session) {
    const rows = await db
      .select({
        email: customers.email,
        name: customers.name,
        phone: customers.phone,
      })
      .from(customers)
      .where(eq(customers.id, session.customerId))
      .limit(1);
    customer = rows[0] ?? null;
  }

  return <ProfileView customer={customer} locale={locale} />;
}
