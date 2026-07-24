import 'server-only';
import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
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
import { ensureCustomerSession } from '@/lib/auth/customer';
import { getMerchantForUser } from '@/lib/receipts/queries';

// Fælles afslutning for alle OAuth-providere (Google/Microsoft/Apple):
// verificeret profil → find/opret bruger → merchant- + kunde-session → redirect.

export type OAuthProfile = {
  email: string;
  emailVerified: boolean;
  name: string | null;
};

export async function completeOAuthLogin(
  profile: OAuthProfile,
  base: string
): Promise<NextResponse> {
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
    // /mine kører på customer_session — sæt den ALTID ved OAuth-login, så
    // også butiksbrugere kan skifte til privat-visning uden nyt login.
    await ensureCustomerSession(existing[0].email, existing[0].name, {
      emailVerified: true, // provideren har verificeret e-mailen (tjekket i callback)
    });
    return NextResponse.redirect(`${base}${dest}`);
  }

  // Ny bruger → opret (tilfældig adgangskode-hash; login sker via OAuth)
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
