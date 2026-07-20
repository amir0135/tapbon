'use server';

import { z } from 'zod';
import { createHash, randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/request';
import { db } from '@/lib/db/drizzle';
import { customers, customerReceipts } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/send';
import {
  getCustomerSession,
  clearCustomerSession,
} from '@/lib/auth/customer';

const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000;

const emailSchema = z.object({ email: z.string().email().max(255) });

/** Magic-link login til kunde-sync (specs/customer-account.md). */
export async function requestCustomerLogin(
  prevState: unknown,
  formData: FormData
) {
  const t = await getTranslations('customerSync');
  const parsed = emailSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { error: t('invalidEmail') };
  const email = parsed.data.email.toLowerCase();

  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expires = new Date(Date.now() + LOGIN_TOKEN_TTL_MS);

  const existing = await db
    .select()
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);

  if (existing[0]) {
    await db
      .update(customers)
      .set({ loginTokenHash: tokenHash, loginTokenExpires: expires })
      .where(eq(customers.id, existing[0].id));
  } else {
    await db.insert(customers).values({
      email,
      loginTokenHash: tokenHash,
      loginTokenExpires: expires,
    });
  }

  const url = `${process.env.BASE_URL ?? ''}/api/customer/verify?token=${token}`;
  await sendEmail({
    to: email,
    subject: t('emailSubject'),
    plainText: t('emailBody', { url }),
    html: `<p>${t('emailBody', { url: `<a href="${url}">${url}</a>` })}</p>`,
  });

  // Svar altid ens — afslør ikke om e-mailen fandtes i forvejen.
  return { success: t('linkSent') };
}

export async function customerLogout() {
  await clearCustomerSession();
  return { success: true as const };
}

const profileSchema = z.object({
  name: z.string().trim().max(100),
  phone: z.string().trim().max(30),
});

/** Opdater navn/telefon på kundeprofilen (specs/customer-profile.md). */
export async function updateCustomerProfile(
  prevState: unknown,
  formData: FormData
) {
  const t = await getTranslations('profile');
  const session = await getCustomerSession();
  if (!session) return { error: t('notSignedIn') };

  const parsed = profileSchema.safeParse({
    name: formData.get('name') ?? '',
    phone: formData.get('phone') ?? '',
  });
  if (!parsed.success) return { error: t('invalidInput') };

  await db
    .update(customers)
    .set({
      name: parsed.data.name || null,
      phone: parsed.data.phone || null,
    })
    .where(eq(customers.id, session.customerId));
  revalidatePath('/mine/profil');
  return { success: t('saved') };
}

/** Sprogvalg — sætter 'locale'-cookien (i18n/request.ts læser den). */
export async function setLocalePreference(locale: string) {
  if (!locales.includes(locale as Locale)) return;
  (await cookies()).set('locale', locale, {
    maxAge: 365 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
  });
  revalidatePath('/mine/profil');
}

/** GDPR: slet kundekontoen og alle kvitteringslinks. Bonerne består hos forretningen. */
export async function deleteCustomerAccount() {
  const session = await getCustomerSession();
  if (!session) return { error: 'not_signed_in' as const };

  await db.transaction(async (tx) => {
    await tx
      .delete(customerReceipts)
      .where(eq(customerReceipts.customerId, session.customerId));
    await tx.delete(customers).where(eq(customers.id, session.customerId));
  });
  await clearCustomerSession();
  return { success: true as const };
}
