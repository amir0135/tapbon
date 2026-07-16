import { db, client } from './lib/db/drizzle';
import { merchants, terminals, users, teamMembers, teams } from '@/lib/db/schema';
import { eq, like } from 'drizzle-orm';
async function main() {
  const m = await db.select().from(merchants).where(eq(merchants.businessName, 'Test Café Onboarding'));
  console.log('profil:', JSON.stringify(m[0]?.onboardingProfile));
  if (m[0]) {
    await db.delete(terminals).where(eq(terminals.merchantId, m[0].id));
    await db.delete(merchants).where(eq(merchants.id, m[0].id));
    const us = await db.select().from(users).where(like(users.email, 'onboard-%@tapbon.dk'));
    for (const u of us) {
      const tm = await db.select().from(teamMembers).where(eq(teamMembers.userId, u.id));
      await db.delete(teamMembers).where(eq(teamMembers.userId, u.id));
      for (const t of tm) await db.delete(teams).where(eq(teams.id, t.teamId));
      await db.delete(users).where(eq(users.id, u.id));
    }
    console.log('testdata slettet:', us.length, 'brugere');
  }
  await client.end();
}
main();
