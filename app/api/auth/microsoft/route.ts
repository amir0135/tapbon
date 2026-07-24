import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { buildAuthUrl, microsoftConfigured } from '@/lib/auth/microsoft';

// Starter Microsoft-login: sæt CSRF-state-cookie og send til Entra ID.

export const dynamic = 'force-dynamic';

export async function GET() {
  const base = process.env.BASE_URL ?? '';
  if (!microsoftConfigured()) {
    return NextResponse.redirect(`${base}/sign-in?microsoft=unavailable`);
  }
  const state = randomBytes(16).toString('base64url');
  (await cookies()).set('microsoft_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return NextResponse.redirect(buildAuthUrl(state));
}
