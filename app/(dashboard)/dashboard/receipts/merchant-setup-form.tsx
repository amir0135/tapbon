'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { createMerchant } from '@/lib/receipts/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const CURRENCIES = ['DKK', 'SEK', 'NOK', 'EUR'] as const;

export function MerchantSetupForm() {
  const t = useTranslations('merchantSetup');
  const tc = useTranslations('common');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createMerchant(formData);
      if (result?.error) setError(tc('error'));
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-4">{t('intro')}</p>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="businessName">{t('businessName')}</Label>
            <Input id="businessName" name="businessName" required maxLength={200} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cvrNumber">{t('cvrNumber')}</Label>
            <Input
              id="cvrNumber"
              name="cvrNumber"
              required
              maxLength={20}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="currency">{t('currency')}</Label>
            <select
              id="currency"
              name="currency"
              defaultValue="DKK"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="googleReviewUrl">{t('googleReviewUrl')}</Label>
            <Input id="googleReviewUrl" name="googleReviewUrl" type="url" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending} className="rounded-full">
            {pending ? tc('loading') : t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
