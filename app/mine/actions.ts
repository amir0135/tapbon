'use server';

import { z } from 'zod';
import { createHash, randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/request';
import { db } from '@/lib/db/drizzle';
import {
  customers,
  customerReceipts,
  customerProjects,
  type AccountingForwards,
} from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/send';
import { hashPassword, comparePasswords } from '@/lib/auth/session';
import {
  getCustomerSession,
  setCustomerSession,
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
    await tx
      .delete(customerProjects)
      .where(eq(customerProjects.customerId, session.customerId));
    await tx.delete(customers).where(eq(customers.id, session.customerId));
  });
  await clearCustomerSession();
  return { success: true as const };
}

// ── Adgangskode (specs/customer-profile.md) — valgfrit lag oven på magic link ──

const passwordSchema = z.object({
  password: z.string().min(8).max(100),
  confirm: z.string(),
});

export async function setCustomerPassword(prevState: unknown, formData: FormData) {
  const t = await getTranslations('profile');
  const session = await getCustomerSession();
  if (!session) return { error: t('notSignedIn') };

  const parsed = passwordSchema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  });
  if (!parsed.success) return { error: t('passwordTooShort') };
  if (parsed.data.password !== parsed.data.confirm)
    return { error: t('passwordMismatch') };

  await db
    .update(customers)
    .set({ passwordHash: await hashPassword(parsed.data.password) })
    .where(eq(customers.id, session.customerId));
  revalidatePath('/mine/profil');
  return { success: t('passwordSet') };
}

/** Login med e-mail + adgangskode — enumeration-sikker (én fejlbesked). */
export async function customerPasswordLogin(prevState: unknown, formData: FormData) {
  const t = await getTranslations('profile');
  const parsed = z
    .object({ email: z.string().email().max(255), password: z.string().min(1).max(100) })
    .safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { error: t('loginFailed') };

  const rows = await db
    .select({ id: customers.id, email: customers.email, hash: customers.passwordHash })
    .from(customers)
    .where(eq(customers.email, parsed.data.email.toLowerCase()))
    .limit(1);
  const found = rows[0];
  if (!found?.hash) return { error: t('loginFailed') };
  if (!(await comparePasswords(parsed.data.password, found.hash)))
    return { error: t('loginFailed') };

  await setCustomerSession({ customerId: found.id, email: found.email });
  revalidatePath('/mine');
  return { success: t('loginOk') };
}

// ── Regnskabs-forwarding (e-conomic/Dinero/Billy indbakke-e-mails) ──────────

const forwardEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(255)
  .email()
  .or(z.literal(''));

const forwardsSchema = z.object({
  economic: forwardEmail,
  dinero: forwardEmail,
  billy: forwardEmail,
});

export async function setAccountingForwards(prevState: unknown, formData: FormData) {
  const t = await getTranslations('profile');
  const session = await getCustomerSession();
  if (!session) return { error: t('notSignedIn') };

  const parsed = forwardsSchema.safeParse({
    economic: formData.get('economic') ?? '',
    dinero: formData.get('dinero') ?? '',
    billy: formData.get('billy') ?? '',
  });
  if (!parsed.success) return { error: t('invalidInput') };

  const forwards: AccountingForwards = {};
  if (parsed.data.economic) forwards.economic = parsed.data.economic;
  if (parsed.data.dinero) forwards.dinero = parsed.data.dinero;
  if (parsed.data.billy) forwards.billy = parsed.data.billy;

  await db
    .update(customers)
    .set({ accountingForwards: Object.keys(forwards).length ? forwards : null })
    .where(eq(customers.id, session.customerId));
  revalidatePath('/mine/profil');
  return { success: t('saved') };
}

// ── Projekter: gruppér boner pr. job/kunde/momsperiode ────────────────────

export async function createProject(prevState: unknown, formData: FormData) {
  const t = await getTranslations('projects');
  const session = await getCustomerSession();
  if (!session) return { error: t('notSignedIn') };

  const parsed = z
    .object({ name: z.string().trim().min(1).max(80) })
    .safeParse({ name: formData.get('name') });
  if (!parsed.success) return { error: t('invalidName') };

  await db.insert(customerProjects).values({
    customerId: session.customerId,
    name: parsed.data.name,
  });
  revalidatePath('/mine/projekter');
  return { success: t('created') };
}

/** Slet projekt — boner består (immutabilitet), de mister kun projekt-linket. */
export async function deleteProject(projectId: number) {
  const session = await getCustomerSession();
  if (!session) return;

  await db.transaction(async (tx) => {
    const owned = await tx
      .select({ id: customerProjects.id })
      .from(customerProjects)
      .where(
        and(
          eq(customerProjects.id, projectId),
          eq(customerProjects.customerId, session.customerId)
        )
      )
      .limit(1);
    if (!owned[0]) return;
    await tx
      .update(customerReceipts)
      .set({ projectId: null })
      .where(eq(customerReceipts.projectId, projectId));
    await tx.delete(customerProjects).where(eq(customerProjects.id, projectId));
  });
  revalidatePath('/mine/projekter');
}

/** Flyt en gemt bon ind i (eller ud af) et projekt. */
export async function assignReceiptToProject(
  receiptId: string,
  projectId: number | null
) {
  const session = await getCustomerSession();
  if (!session) return;

  if (projectId !== null) {
    const owned = await db
      .select({ id: customerProjects.id })
      .from(customerProjects)
      .where(
        and(
          eq(customerProjects.id, projectId),
          eq(customerProjects.customerId, session.customerId)
        )
      )
      .limit(1);
    if (!owned[0]) return;
  }

  await db
    .update(customerReceipts)
    .set({ projectId })
    .where(
      and(
        eq(customerReceipts.customerId, session.customerId),
        eq(customerReceipts.receiptId, receiptId)
      )
    );
  revalidatePath('/mine/projekter');
}
