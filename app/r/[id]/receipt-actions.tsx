'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileDown, Star, Stamp } from 'lucide-react';

type LoyaltyState = {
  cardToken: string;
  stamps: number;
  stampsRequired: number;
};

export function ReceiptActions({
  merchantId,
  receiptId,
  googleReviewUrl,
}: {
  merchantId: number;
  receiptId: string;
  googleReviewUrl: string | null;
}) {
  const t = useTranslations();
  const [loyalty, setLoyalty] = useState<LoyaltyState | null>(null);
  const [justStamped, setJustStamped] = useState(false);

  const tokenKey = `tapbon-loyalty-${merchantId}`;
  const stampedKey = `tapbon-stamped-${receiptId}`;

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return;
    fetch(`/api/loyalty?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setLoyalty(data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function collectStamp() {
    if (localStorage.getItem(stampedKey)) return;
    const token = localStorage.getItem(tokenKey);
    const res = await fetch('/api/loyalty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantId, cardToken: token }),
    });
    if (!res.ok) return;
    const data: LoyaltyState = await res.json();
    localStorage.setItem(tokenKey, data.cardToken);
    localStorage.setItem(stampedKey, '1');
    setLoyalty(data);
    setJustStamped(true);
  }

  const alreadyStamped =
    typeof window !== 'undefined' && !!localStorage.getItem(stampedKey);
  const isFull = loyalty !== null && loyalty.stamps >= loyalty.stampsRequired;

  return (
    <div className="space-y-3 print:hidden">
      {/* PDF / print */}
      <button
        onClick={() => window.print()}
        className="w-full bg-paper rounded-2xl shadow-sm p-4 flex items-center gap-3 text-left active:scale-[0.99] transition"
      >
        <FileDown className="h-5 w-5 text-accent shrink-0" />
        <span className="font-medium">{t('receipt.downloadPdf')}</span>
      </button>

      {/* Loyalty card */}
      <div className="w-full bg-paper rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Stamp className="h-5 w-5 text-accent shrink-0" />
          <span className="font-medium">{t('loyalty.title')}</span>
          {loyalty && (
            <span className="ml-auto text-sm text-muted-foreground font-mono">
              {t('loyalty.stamps', {
                count: loyalty.stamps,
                total: loyalty.stampsRequired,
              })}
            </span>
          )}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: loyalty?.stampsRequired ?? 10 }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-full border-2 transition ${
                loyalty && i < loyalty.stamps
                  ? 'bg-accent border-accent'
                  : 'border-border'
              }`}
            />
          ))}
        </div>
        {isFull ? (
          <p className="text-sm text-forest font-medium">{t('loyalty.full')}</p>
        ) : justStamped ? (
          <p className="text-sm text-accent font-medium">{t('loyalty.added')}</p>
        ) : (
          <button
            onClick={collectStamp}
            disabled={alreadyStamped}
            className="w-full rounded-full bg-primary text-primary-foreground py-2.5 font-medium disabled:opacity-50 active:scale-[0.99] transition"
          >
            {t('loyalty.add')}
          </button>
        )}
      </div>

      {/* Google review */}
      {googleReviewUrl && (
        <a
          href={googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-paper rounded-2xl shadow-sm p-4 flex items-center gap-3 active:scale-[0.99] transition"
        >
          <Star className="h-5 w-5 text-accent shrink-0" />
          <span className="font-medium">{t('review.cta')}</span>
        </a>
      )}
    </div>
  );
}
