import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/lib/db/queries';
import { getMerchantForUser } from '@/lib/receipts/queries';
import { AccountSettingsForm, BusinessSettingsForm } from './settings-forms';

export const dynamic = 'force-dynamic';

export default async function GeneralPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  const [t, merchant] = await Promise.all([
    getTranslations('settings'),
    getMerchantForUser(user.id),
  ]);

  return (
    <section className="flex-1 p-4 lg:p-8 space-y-8 max-w-xl">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900">
        {t('title')}
      </h1>

      {merchant && (
        <Card>
          <CardHeader>
            <CardTitle>{t('businessTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessSettingsForm merchant={merchant} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('accountTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountSettingsForm name={user.name ?? ''} email={user.email} />
        </CardContent>
      </Card>
    </section>
  );
}
