import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  users,
  teams,
  teamMembers,
  activityLogs,
  ActivityType,
} from '@/lib/db/schema';
import { hashPassword, setSession } from '@/lib/auth/session';
import { exchangeCodeForProfile, googleConfigured } from '@/lib/auth/google';
import { getMerchantForUser } from '@/lib/receipts/queries';

// Google-callback: verificér state + id_token → find/opret bruger → session.

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const base = process.env.BASE_URL ?? request.nextUrl.origin;
  if (!googleConfigured()) {
    return NextResponse.redirect(`${base}/sign-in?google=unavailable`);
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('google_oauth_state')?.value;
  cookieStore.delete('google_oauth_state');

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${base}/sign-in?google=failed`);
  }

  const profile = await exchangeCodeForProfile(code);
  if (!profile || !profile.emailVerified) {
    return NextResponse.redirect(`${base}/sign-in?google=failed`);
  }

  // Findes brugeren? → log ind
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, profile.email))
    .limit(1);

  if (existing[0] && !existing[0].deletedAt) {
    await setSession(existing[0]);
    const merchant = await getMerchantForUser(existing[0].id);
    // Privatpersoner (onboarding-valg) skal ikke spørges igen → /mine
    const dest = merchant
      ? '/dashboard'
      : existing[0].preferredMode === 'private'
        ? '/mine'
        : '/onboarding';
    return NextResponse.redirect(`${base}${dest}`);
  }

  // Ny bruger → opret (tilfældig adgangskode-hash; login sker via Google)
  const [createdUser] = await db
    .insert(users)
    .values({
      email: profile.email,
      name: profile.name,
      passwordHash: await hashPassword(randomBytes(32).toString('base64url')),
      role: 'owner',
    })
    .returning();

  const [createdTeam] = await db
    .insert(teams)
    .values({ name: `${profile.email}'s Team` })
    .returning();

  await Promise.all([
    db.insert(teamMembers).values({
      userId: createdUser.id,
      teamId: createdTeam.id,
      role: 'owner',
    }),
    db.insert(activityLogs).values({
      teamId: createdTeam.id,
      userId: createdUser.id,
      action: ActivityType.SIGN_UP,
      ipAddress: '',
    }),
    setSession(createdUser),
  ]);

  return NextResponse.redirect(`${base}/onboarding`);
}
