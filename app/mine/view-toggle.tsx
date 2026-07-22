'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Store, User } from 'lucide-react';
import { setPreferredMode } from '@/app/onboarding/actions';

/** Privat ↔ Forretning-skifter (Receiptile "View"). Privat er aktiv på /mine;
 *  Forretning hopper til dashboardet (eller sign-up uden merchant-konto). */
export function ViewToggle({ hasBusiness }: { hasBusiness: boolean }) {
  const t = useTranslations('profile');
  const router = useRouter();
  const [busy, startTransition] = useTransition();

  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-full bg-paper p-1 shadow-sm"
      role="radiogroup"
      aria-label={t('viewSection')}
    >
      <button
        role="radio"
        aria-checked="true"
        className="flex items-center justify-center gap-2 rounded-full bg-ink px-3 py-2 text-sm font-semibold text-paper"
      >
        <User className="h-4 w-4" aria-hidden="true" />
        {t('viewPersonal')}
      </button>
      <button
        role="radio"
        aria-checked="false"
        disabled={busy}
        onClick={() =>
          startTransition(async () => {
            if (hasBusiness) {
              await setPreferredMode('business');
              router.push('/dashboard');
            } else {
              router.push('/sign-up');
            }
          })
        }
        className="flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-ink"
      >
        <Store className="h-4 w-4" aria-hidden="true" />
        {t('viewBusiness')}
      </button>
    </div>
  );
}
