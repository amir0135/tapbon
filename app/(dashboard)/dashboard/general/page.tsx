import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { getMerchantForUser } from '@/lib/receipts/queries';
import { customerPortalAction } from '@/lib/payments/actions';
import { AccountSettingsForm, BusinessSettingsForm } from './settings-forms';

export const dynamic = 'force-dynamic';

export default async function GeneralPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  const [t, merchant, team] = await Promise.all([
    getTranslations('settings'),
    getMerchantForUser(user.id),
    getTeamForUser(),
  ]);

  const hasSubscription =
    team?.subscriptionStatus === 'active' || team?.subscriptionStatus === 'trialing';

  return (
    <section className="flex-1 p-4 lg:p-8 space-y-8 max-w-xl">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900">
        {t('title')}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('subscriptionTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <p className="font-medium">
              {team?.planName ?? t('noPlan')}
            </p>
            <p className="text-muted-foreground">
              {team?.subscriptionStatus === 'trialing'
                ? t('statusTrialing')
                : team?.subscriptionStatus === 'active'
                  ? t('statusActive')
                  : t('statusNone')}
            </p>
          </div>
          {hasSubscription ? (
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                {t('manageSubscription')}
              </Button>
            </form>
          ) : (
            <Button asChild variant="outline">
              <Link href="/pricing">{t('choosePlan')}</Link>
            </Button>
          )}
        </CardContent>
      </Card>

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
