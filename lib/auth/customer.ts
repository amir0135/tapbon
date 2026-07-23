import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { customers } from '@/lib/db/schema';

// Kunde-session (specs/customer-account.md) — separat fra merchant-auth.
// Stateless JWT-cookie: hvert device logger ind med sit eget magic-link.

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const COOKIE = 'customer_session';
const MAX_AGE_DAYS = 365;

export type CustomerSession = { customerId: number; email: string };

export async function setCustomerSession(session: CustomerSession) {
  const expires = new Date(Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_DAYS}d`)
    .sign(key);
  (await cookies()).set(COOKIE, token, {
    expires,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    if (typeof payload.customerId !== 'number' || typeof payload.email !== 'string')
      return null;
    return { customerId: payload.customerId, email: payload.email };
  } catch {
    return null;
  }
}

export async function clearCustomerSession() {
  (await cookies()).delete(COOKIE);
}

/**
 * Bro fra merchant-login til kunde-arkivet: privatpersoner der logger ind med
 * Google/adgangskode og routes til /mine skal IKKE mødes af endnu et login.
 * Find/opret customers-rækken for e-mailen og sæt customer_session.
 *
 * Sikkerhed: et EKSISTERENDE arkiv adopteres kun når e-mail-ejerskab er bevist
 * (emailVerified, fx Google). Merchant-sign-up verificerer ikke e-mail, så uden
 * dette kunne man overtage en fremmed kundes arkiv ved at oprette en bruger med
 * deres e-mail. Uverificerede stier må kun oprette en NY (tom) kunde-række.
 */
export async function ensureCustomerSession(
  email: string,
  name: string | null | undefined,
  opts: { emailVerified: boolean }
) {
  const normalized = email.toLowerCase();
  const existing = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, normalized))
    .limit(1);

  if (existing[0]) {
    if (!opts.emailVerified) return; // brugeren må magic-linke sig ind
    await setCustomerSession({ customerId: existing[0].id, email: normalized });
    return;
  }

  const [created] = await db
    .insert(customers)
    .values({ email: normalized, name: name || null })
    .returning({ id: customers.id });
  await setCustomerSession({ customerId: created.id, email: normalized });
}
