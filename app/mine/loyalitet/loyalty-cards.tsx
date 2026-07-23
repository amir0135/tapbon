'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, Stamp } from 'lucide-react';

type LoyaltyCard = {
  cardToken: string;
  stamps: number;
  stampsRequired: number;
  merchantId: number;
  merchantName: string | null;
};

function readLoyaltyTokenKeys(): { key: string; token: string }[] {
  const out: { key: string; token: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('tapbon-loyalty-')) {
      const v = localStorage.getItem(key);
      if (v) out.push({ key, token: v });
    }
  }
  return out;
}

/** Kontoens stempelkort, server-fed (specs/customer-loyalty.md).
 *  Engangsmigrering: anonyme localStorage-tokens claimes til kontoen. */
export function LoyaltyCards({ cards }: { cards: LoyaltyCard[] }) {
  const t = useTranslations('loyaltyPage');
  const router = useRouter();

  useEffect(() => {
    const local = readLoyaltyTokenKeys();
    if (local.length === 0) return;
    fetch('/api/loyalty/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens: local.map((l) => l.token) }),
    })
      .then((r) => {
        if (r.ok) {
          for (const { key } of local) localStorage.removeItem(key);
          router.refresh();
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cards.length === 0) {
    return (
      <section className="bg-paper rounded-2xl shadow-sm p-8 text-center space-y-3">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-tint">
          <Stamp className="h-6 w-6 text-forest" aria-hidden="true" />
        </span>
        <p className="font-semibold text-ink">{t('emptyTitle')}</p>
        <p className="text-sm text-muted-foreground">{t('emptySub')}</p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <div key={card.cardToken} className="bg-paper rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
              <Stamp className="h-4 w-4 text-forest" aria-hidden="true" />
            </span>
            <span className="font-semibold text-ink truncate">
              {card.merchantName ?? t('unknownMerchant')}
            </span>
            <span className="ml-auto text-sm text-muted-foreground font-mono shrink-0">
              {card.stamps}/{card.stampsRequired}
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: card.stampsRequired }).map((_, i) => (
              <span
                key={i}
                className={`flex aspect-square items-center justify-center rounded-full ${
                  i < card.stamps ? 'bg-mint' : 'border-2 border-dashed border-border'
                }`}
              >
                {i < card.stamps && (
                  <Check className="h-3 w-3 text-paper" aria-hidden="true" />
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
