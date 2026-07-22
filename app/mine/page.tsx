import type { Metadata } from 'next';
import { getCustomerSession } from '@/lib/auth/customer';
import { ArchiveList } from './archive-list';

export const metadata: Metadata = {
  title: 'Mine kvitteringer — Tapbon',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function MinePage() {
  const session = await getCustomerSession();
  return <ArchiveList customerEmail={session?.email ?? null} />;
}
