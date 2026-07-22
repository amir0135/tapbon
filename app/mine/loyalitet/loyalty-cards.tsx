'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Stamp } from 'lucide-react';

type LoyaltyCard = {
  cardToken: string;
  stamps: number;
  stampsRequired: number;
  merchantId: number;
  merchantName: string | null;
};

function readLoyaltyTokens(): string[] {
  const tokens: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('tapbon-loyalty-')) {
      const v = localStorage.getItem(key);
      if (v) tokens.push(v);
    }
  }
  return tokens;
}

/** Stempelkort fra enhedens tokens (specs/customer-archive.md). */
export function LoyaltyCards() {
  const t = useTranslations('loyaltyPage');
  const [cards, setCards] = useState<LoyaltyCard[] | null>(null);

  useEffect(() => {
    Promise.all(
      readLoyaltyTokens().map((token) =>
        fetch(`/api/loyalty?token=${encodeURIComponent(token)}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => setCards(results.filter(Boolean)));
  }, []);

  if (cards === null) return null;

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
