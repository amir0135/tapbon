import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  exchangeCodeForProfile,
  microsoftConfigured,
} from '@/lib/auth/microsoft';
import { completeOAuthLogin } from '@/lib/auth/oauth-login';

// Microsoft-callback: verificér state + id_token → fælles OAuth-login.

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const base = process.env.BASE_URL ?? request.nextUrl.origin;
  if (!microsoftConfigured()) {
    return NextResponse.redirect(`${base}/sign-in?microsoft=unavailable`);
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('microsoft_oauth_state')?.value;
  cookieStore.delete('microsoft_oauth_state');

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${base}/sign-in?microsoft=failed`);
  }

  const profile = await exchangeCodeForProfile(code);
  if (!profile || !profile.emailVerified) {
    return NextResponse.redirect(`${base}/sign-in?microsoft=failed`);
  }

  return completeOAuthLogin(profile, base);
}
