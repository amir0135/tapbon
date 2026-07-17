import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { customers } from '@/lib/db/schema';
import { setCustomerSession } from '@/lib/auth/customer';

// Magic-link-verifikation: klik i mailen → session-cookie → /mine.

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';
  const base = process.env.BASE_URL ?? request.nextUrl.origin;

  if (token.length < 20 || token.length > 100) {
    return NextResponse.redirect(`${base}/mine?login=invalid`);
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const rows = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.loginTokenHash, tokenHash),
        gt(customers.loginTokenExpires, new Date())
      )
    )
    .limit(1);
  const customer = rows[0];
  if (!customer) {
    return NextResponse.redirect(`${base}/mine?login=invalid`);
  }

  // Engangstoken — nulstil straks
  await db
    .update(customers)
    .set({ loginTokenHash: null, loginTokenExpires: null })
    .where(eq(customers.id, customer.id));

  await setCustomerSession({ customerId: customer.id, email: customer.email });
  return NextResponse.redirect(`${base}/mine?login=ok`);
}
