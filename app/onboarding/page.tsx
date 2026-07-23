import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { getMerchantForUser } from '@/lib/receipts/queries';
import { OnboardingWizard } from './wizard';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  // Allerede onboardet → direkte til dashboard
  const merchant = await getMerchantForUser(user.id);
  if (merchant) redirect('/dashboard');

  // Har tidligere valgt "privatperson" → spørg ikke igen (migration 0008)
  if (user.preferredMode === 'private') redirect('/mine');

  // Har allerede valgt "Erhverv" → spring rollevalget over, direkte til opret
  return <OnboardingWizard skipRoleStep={user.preferredMode === 'business'} />;
}
