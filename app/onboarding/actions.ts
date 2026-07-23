'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { ensureCustomerSession } from '@/lib/auth/customer';

/**
 * Husk rollevalget fra onboarding-step 0 (specs/onboarding-wizard.md):
 * 'private' → fremtidige logins lander på /mine, 'business' → wizard/dashboard.
 */
export async function setPreferredMode(mode: 'private' | 'business') {
  if (mode !== 'private' && mode !== 'business') return;
  const user = await getUser();
  if (!user) return;
  await db.update(users).set({ preferredMode: mode }).where(eq(users.id, user.id));
  // Privat-valg sender brugeren til /mine — sørg for at customer_session er sat,
  // så de ikke mødes af endnu et login (specs/customer-account.md).
  // Sign-up verificerer ikke e-mail → eksisterende arkiver adopteres IKKE her.
  if (mode === 'private') {
    await ensureCustomerSession(user.email, user.name, { emailVerified: false });
  }
}
