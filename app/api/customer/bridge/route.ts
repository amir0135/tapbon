import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { ensureCustomerSession } from '@/lib/auth/customer';

// E-mail-bro (ROADMAP Fase 6 trin 2): merchant-bruger uden customer_session
// rammer /mine → vi forsøger at bridge til en kunde-session med samme e-mail.
// Uverificeret sti: ensureCustomerSession opretter kun en NY tom kunde —
// eksisterende arkiver adopteres ikke (magic link kræves). Redirect m/
// ?bridged=1 så /mine ikke sender os i loop.

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const base = new URL(request.url).origin;
  const user = await getUser().catch(() => null);
  if (user) {
    await ensureCustomerSession(user.email, user.name, { emailVerified: false });
  }
  return NextResponse.redirect(`${base}/mine?bridged=1`);
}
