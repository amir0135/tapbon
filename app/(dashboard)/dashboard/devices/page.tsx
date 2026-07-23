import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getUser } from '@/lib/db/queries';
import { getMerchantForUser, listTerminals } from '@/lib/receipts/queries';
import { DevicesList } from './devices-list';

export const dynamic = 'force-dynamic';

/** Enheder — merchantens terminaler/brikker (specs/merchant-devices.md). */
export default async function DevicesPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  const [t, merchant] = await Promise.all([
    getTranslations('devices'),
    getMerchantForUser(user.id),
  ]);
  if (!merchant) redirect('/dashboard/receipts');

  const devices = await listTerminals(merchant.id);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        {t('title')}
      </h1>
      <DevicesList devices={devices} />
    </section>
  );
}
