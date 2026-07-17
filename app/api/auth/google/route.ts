import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { buildAuthUrl, googleConfigured } from '@/lib/auth/google';

// Starter Google-login: sæt CSRF-state-cookie og send til Google.

export const dynamic = 'force-dynamic';

export async function GET() {
  const base = process.env.BASE_URL ?? '';
  if (!googleConfigured()) {
    return NextResponse.redirect(`${base}/sign-in?google=unavailable`);
  }
  const state = randomBytes(16).toString('base64url');
  (await cookies()).set('google_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return NextResponse.redirect(buildAuthUrl(state));
}
