import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/auth/customer';
import { getUser } from '@/lib/db/queries';
import { getCustomerArchive } from '@/lib/receipts/customer-queries';
import { ArchiveList } from './archive-list';
import { SignInLanding } from './sign-in-landing';

export const metadata: Metadata = {
  title: 'Mine kvitteringer — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/** Konto-først (specs/customer-account.md v3): logget ud ⇒ login-landing;
 *  logget ind ⇒ arkivet hentes server-side. Merchant-bruger uden kunde-
 *  session sendes gennem e-mail-broen (én gang — ?bridged=1 er loop-værn). */
export default async function MinePage({
  searchParams,
}: {
  searchParams: Promise<{ bridged?: string }>;
}) {
  const session = await getCustomerSession();
  if (!session) {
    const { bridged } = await searchParams;
    if (!bridged) {
      const merchantUser = await getUser().catch(() => null);
      if (merchantUser) redirect('/api/customer/bridge');
    }
    return <SignInLanding />;
  }

  const entries = await getCustomerArchive(session.customerId);
  return <ArchiveList customerEmail={session.email} entries={entries} />;
}
