import type { Metadata } from 'next';
import { getCustomerSession } from '@/lib/auth/customer';
import { getCustomerArchive } from '@/lib/receipts/customer-queries';
import { ArchiveList } from './archive-list';
import { SignInLanding } from './sign-in-landing';

export const metadata: Metadata = {
  title: 'Mine kvitteringer — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/** Konto-først (specs/customer-account.md v3): logget ud ⇒ login-landing;
 *  logget ind ⇒ arkivet hentes server-side. */
export default async function MinePage() {
  const session = await getCustomerSession();
  if (!session) return <SignInLanding />;

  const entries = await getCustomerArchive(session.customerId);
  return <ArchiveList customerEmail={session.email} entries={entries} />;
}
