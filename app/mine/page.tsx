import type { Metadata } from 'next';
import { getCustomerSession } from '@/lib/auth/customer';
import { getUser } from '@/lib/db/queries';
import { ArchiveList } from './archive-list';

export const metadata: Metadata = {
  title: 'Mine kvitteringer — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function MinePage() {
  const [session, merchantUser] = await Promise.all([
    getCustomerSession(),
    getUser().catch(() => null),
  ]);
  return (
    <ArchiveList
      customerEmail={session?.email ?? null}
      hasBusiness={Boolean(merchantUser)}
    />
  );
}
