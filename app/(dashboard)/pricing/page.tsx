import { Check } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { checkoutAction } from '@/lib/payments/actions';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { formatMoney } from '@/lib/receipts/format';
import { SubmitButton } from './submit-button';

// Render at request time — Stripe prices are fetched live.
export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const [t, locale, prices, products] = await Promise.all([
    getTranslations('pricing'),
    getLocale(),
    getStripePrices(),
    getStripeProducts(),
  ]);

  const basisPlan = products.find((p) => p.name === 'Tapbon Basis');
  const proPlan = products.find((p) => p.name === 'Tapbon Pro');
  const basisPrice = prices.find((p) => p.productId === basisPlan?.id);
  const proPrice = prices.find((p) => p.productId === proPlan?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        <PricingCard
          name={t('basisName')}
          price={basisPrice?.unitAmount ?? 19900}
          trialText={t('trial', { days: basisPrice?.trialPeriodDays ?? 30 })}
          features={[t('basisF1'), t('basisF2'), t('basisF3')]}
          priceId={basisPrice?.id}
          locale={locale}
          perMonth={t('perMonth')}
          unavailable={t('unavailable')}
        />
        <PricingCard
          name={t('proName')}
          price={proPrice?.unitAmount ?? 24900}
          trialText={t('trial', { days: proPrice?.trialPeriodDays ?? 30 })}
          features={[t('proF1'), t('proF2'), t('proF3')]}
          priceId={proPrice?.id}
          highlighted
          locale={locale}
          perMonth={t('perMonth')}
          unavailable={t('unavailable')}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  trialText,
  features,
  priceId,
  locale,
  highlighted = false,
  perMonth,
  unavailable,
}: {
  name: string;
  price: number;
  trialText: string;
  features: string[];
  priceId?: string;
  locale: string;
  highlighted?: boolean;
  perMonth: string;
  unavailable: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlighted ? 'border-accent shadow-md' : 'border-border'
      }`}
    >
      <h2 className="text-2xl font-medium text-gray-900 mb-1">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">{trialText}</p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        {formatMoney(price, 'DKK', locale)}{' '}
        <span className="text-xl font-normal text-gray-600">{perMonth}</span>
      </p>
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start">
            <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      {priceId ? (
        <form action={checkoutAction}>
          <input type="hidden" name="priceId" value={priceId} />
          <SubmitButton />
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">{unavailable}</p>
      )}
    </div>
  );
}
