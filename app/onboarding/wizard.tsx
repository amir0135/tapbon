'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Coffee,
  UtensilsCrossed,
  Store,
  Scissors,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { createMerchant } from '@/lib/receipts/actions';

const BUSINESS_TYPES = [
  { id: 'cafe', icon: Coffee },
  { id: 'restaurant', icon: UtensilsCrossed },
  { id: 'retail', icon: Store },
  { id: 'salon', icon: Scissors },
  { id: 'other', icon: MoreHorizontal },
] as const;

const POS_SYSTEMS = ['zettle', 'onlinepos', 'flatpay', 'shopbox', 'otherPos', 'nonePos'] as const;
const VOLUMES = ['v25', 'v100', 'v300', 'v300plus'] as const;

/** Receiptile-style onboarding — spec: specs/onboarding-wizard.md */
export function OnboardingWizard() {
  const t = useTranslations('onboarding');
  const tc = useTranslations('common');
  const tm = useTranslations('merchantSetup');
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [posSystem, setPosSystem] = useState<string | null>(null);
  const [dailyReceipts, setDailyReceipts] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) =>
    startTransition(async () => {
      if (businessType) formData.set('businessType', businessType);
      if (posSystem) formData.set('posSystem', posSystem);
      if (dailyReceipts) formData.set('dailyReceipts', dailyReceipts);
      const result = await createMerchant(formData);
      if (result?.error) setError(true);
      else router.push('/dashboard');
    });

  const optionClass = (selected: boolean) =>
    `w-full flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
      selected
        ? 'border-mint bg-mint/10 text-paper'
        : 'border-white/12 text-paper hover:border-white/30'
    }`;

  const stepTitles = [t('step1Title'), t('step2Title'), t('step3Title'), t('step4Title')];

  return (
    <main className="min-h-dvh bg-ink-deep flex items-center justify-center sm:p-6">
      <div className="w-full max-w-xl bg-ink-raised sm:rounded-3xl sm:ring-1 sm:ring-white/10 px-6 py-12 sm:px-14 sm:py-14">
        <div className="text-center space-y-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            {t('kicker')}
          </p>
          <h1 className="font-sans text-3xl font-bold text-paper">{t('title')}</h1>
          <p className="text-sm text-white/50">{t('subtitle')}</p>
        </div>

        {/* Progress */}
        <div className="mt-8 space-y-2">
          <div className="h-1.5 w-full rounded-full bg-white/10">
            <div
              className="h-1.5 rounded-full bg-mint transition-all"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <p className="text-center font-mono text-xs text-white/40">
            {t('stepOf', { step, total: 4 })}
          </p>
        </div>

        <h2 className="mt-8 text-base font-semibold text-paper">
          {stepTitles[step - 1]}
        </h2>

        {step === 1 && (
          <div className="mt-4 space-y-3">
            {BUSINESS_TYPES.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setBusinessType(id)}
                className={optionClass(businessType === id)}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{t(`bt_${id}`)}</span>
                  <span className="block text-sm text-white/50">{t(`bt_${id}Sub`)}</span>
                </span>
                {businessType === id && (
                  <Check className="h-5 w-5 text-mint" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {POS_SYSTEMS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPosSystem(id)}
                className={optionClass(posSystem === id)}
              >
                <span className="flex-1 font-medium">{t(`pos_${id}`)}</span>
                {posSystem === id && (
                  <Check className="h-5 w-5 text-mint" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 space-y-3">
            {VOLUMES.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setDailyReceipts(id)}
                className={optionClass(dailyReceipts === id)}
              >
                <span className="flex-1 font-medium">{t(`vol_${id}`)}</span>
                {dailyReceipts === id && (
                  <Check className="h-5 w-5 text-mint" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <form className="mt-4 space-y-5" action={submit}>
            <div className="space-y-2">
              <label htmlFor="businessName" className="block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                {tm('businessName')}
              </label>
              <input
                id="businessName"
                name="businessName"
                required
                maxLength={200}
                className="block w-full rounded-2xl border border-white/12 bg-ink-deep px-5 py-4 text-base text-paper placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-mint/60 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cvrNumber" className="block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                {tm('cvrNumber')}
              </label>
              <input
                id="cvrNumber"
                name="cvrNumber"
                required
                minLength={4}
                maxLength={20}
                placeholder={tm('cvrPlaceholder')}
                className="block w-full rounded-2xl border border-white/12 bg-ink-deep px-5 py-4 text-base text-paper placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-mint/60 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="currency" className="block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                {tm('currency')}
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue="DKK"
                className="block w-full rounded-2xl border border-white/12 bg-ink-deep px-5 py-4 text-base text-paper focus:outline-none focus:ring-2 focus:ring-mint/60"
              >
                <option value="DKK">DKK</option>
                <option value="SEK">SEK</option>
                <option value="NOK">NOK</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="googleReviewUrl" className="block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                {tm('googleReviewUrl')}
              </label>
              <input
                id="googleReviewUrl"
                name="googleReviewUrl"
                type="url"
                placeholder="https://g.page/…"
                className="block w-full rounded-2xl border border-white/12 bg-ink-deep px-5 py-4 text-base text-paper placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-mint/60 focus:border-transparent"
              />
            </div>
            {error && (
              <p className="text-sm text-red-400" role="alert">
                {tc('error')}
              </p>
            )}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('back')}
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-paper hover:bg-forest/85 disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                {t('complete')}
              </button>
            </div>
          </form>
        )}

        {step < 4 && (
          <div className="mt-8 flex items-center justify-between">
            {step === 1 ? (
              <button
                type="button"
                onClick={() => router.push('/dashboard/receipts')}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/60 hover:text-white/90"
              >
                {t('skip')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('back')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !businessType) ||
                (step === 2 && !posSystem) ||
                (step === 3 && !dailyReceipts)
              }
              className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-paper hover:bg-forest/85 disabled:opacity-40"
            >
              {t('next')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
