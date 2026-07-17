import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

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
