'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { updateAccount } from '@/app/(login)/actions';
import { updateMerchant } from '@/lib/receipts/actions';
import type { Merchant } from '@/lib/db/schema';

type AccountState = { name?: string; error?: string; success?: string };

export function AccountSettingsForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const t = useTranslations('settings');
  const [state, formAction, pending] = useActionState<AccountState, FormData>(
    updateAccount,
    {}
  );

  return (
    <form className="space-y-4" action={formAction}>
      <div>
        <Label htmlFor="name" className="mb-2">
          {t('name')}
        </Label>
        <Input
          id="name"
          name="name"
          placeholder={t('namePlaceholder')}
          defaultValue={state.name || name}
          required
        />
      </div>
      <div>
        <Label htmlFor="email" className="mb-2">
          {t('email')}
        </Label>
        <Input id="email" name="email" type="email" defaultValue={email} required />
      </div>
      {state.error && <p className="text-red-500 text-sm">{state.error}</p>}
      {state.success && <p className="text-forest text-sm">{state.success}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('saving')}
          </>
        ) : (
          t('save')
        )}
      </Button>
    </form>
  );
}

type MerchantState = { error?: string; success?: boolean };

export function BusinessSettingsForm({ merchant }: { merchant: Merchant }) {
  const t = useTranslations('settings');
  const [state, formAction, pending] = useActionState<MerchantState, FormData>(
    updateMerchant,
    {}
  );

  return (
    <form className="space-y-4" action={formAction}>
      <div>
        <Label htmlFor="businessName" className="mb-2">
          {t('businessName')}
        </Label>
        <Input
          id="businessName"
          name="businessName"
          defaultValue={merchant.businessName}
          required
          maxLength={200}
        />
      </div>
      <div>
        <Label htmlFor="cvrNumber" className="mb-2">
          {t('cvrNumber')}
        </Label>
        <Input
          id="cvrNumber"
          name="cvrNumber"
          defaultValue={merchant.cvrNumber}
          required
          maxLength={20}
        />
      </div>
      <div>
        <Label htmlFor="logoUrl" className="mb-2">
          {t('logoUrl')}
        </Label>
        <Input
          id="logoUrl"
          name="logoUrl"
          type="url"
          placeholder="https://…"
          defaultValue={merchant.logoUrl ?? ''}
        />
        <p className="mt-1 text-xs text-muted-foreground">{t('logoHint')}</p>
      </div>
      <div>
        <Label htmlFor="googleReviewUrl" className="mb-2">
          {t('googleReviewUrl')}
        </Label>
        <Input
          id="googleReviewUrl"
          name="googleReviewUrl"
          type="url"
          placeholder="https://g.page/…"
          defaultValue={merchant.googleReviewUrl ?? ''}
        />
      </div>
      <div>
        <Label className="mb-2">{t('currency')}</Label>
        <Input value={merchant.currency} disabled aria-readonly />
        <p className="mt-1 text-xs text-muted-foreground">{t('currencyLocked')}</p>
      </div>
      {state.error && (
        <p className="text-red-500 text-sm">{t('invalidInput')}</p>
      )}
      {state.success && <p className="text-forest text-sm">{t('saved')}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('saving')}
          </>
        ) : (
          t('save')
        )}
      </Button>
    </form>
  );
}
