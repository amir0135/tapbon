'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Download, Lock, Stamp, Star } from 'lucide-react';

/** Forest download pill — matches the landing phone mock's CTA. */
export function DownloadPill({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-semibold text-paper active:scale-[0.99] transition print:hidden"
    >
      {label} <Download className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

/** "Sikker · Privat · Papirløs · Tapbon" trust line from the mock. */
export function TrustLine({ label, appName }: { label: string; appName: string }) {
  return (
    <p className="flex items-center justify-center gap-1 whitespace-nowrap text-center text-[10px] text-muted-foreground print:hidden">
      <Lock className="h-3 w-3 shrink-0" aria-hidden="true" /> {label} ·&nbsp;
      <span className="font-semibold text-forest">{appName}</span>
    </p>
  );
}

/** Mint-tint sealed-hash chip from the mock's VAT screen. */
export function SealedChip({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-mint-tint px-3 py-2 font-mono text-[11px] text-forest">
      <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/** Mint-tint icon tile used on action cards (mock's ScreenSave rows). */
function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
      {children}
    </span>
  );
}

type LoyaltyState = {
  cardToken: string;
  stamps: number;
  stampsRequired: number;
};

export function ReceiptActions({
  merchantId,
  receiptId,
  googleReviewUrl,
  signedIn,
}: {
  merchantId: number;
  receiptId: string;
  googleReviewUrl: string | null;
  signedIn: boolean;
}) {
  const t = useTranslations();
  const [loyalty, setLoyalty] = useState<LoyaltyState | null>(null);
  const [justStamped, setJustStamped] = useState(false);

  const tokenKey = `tapbon-loyalty-${merchantId}`;
  const stampedKey = `tapbon-stamped-${receiptId}`;

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    // Lokalt token først; ellers kontoens kort (specs/customer-loyalty.md)
    const url = token
      ? `/api/loyalty?token=${encodeURIComponent(token)}`
      : signedIn
        ? `/api/loyalty?merchantId=${merchantId}`
        : null;
    if (!url) return;
    fetch(url)
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
  const stampsRequired = loyalty?.stampsRequired ?? 10;
  const stamps = loyalty?.stamps ?? 0;

  return (
    <div className="space-y-3 print:hidden">
      {/* Loyalty card — mock's ScreenLoyalty */}
      <div className="w-full bg-paper rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-3">
          <IconTile>
            <Stamp className="h-4 w-4 text-forest" aria-hidden="true" />
          </IconTile>
          <span className="text-[15px] font-semibold text-ink">{t('loyalty.title')}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: stampsRequired }).map((_, i) => (
            <span
              key={i}
              className={`mx-auto flex aspect-square w-full max-w-10 items-center justify-center rounded-full transition ${
                i < stamps ? 'bg-mint' : 'border-2 border-dashed border-border'
              }`}
            >
              {i < stamps && <Check className="h-4 w-4 text-paper" aria-hidden="true" />}
            </span>
          ))}
        </div>
        <p className="text-center font-mono text-[11px] text-muted-foreground">
          {t('loyalty.stamps', { count: stamps, total: stampsRequired })}
        </p>
        {isFull ? (
          <div className="mx-auto w-fit rounded-full bg-mint-tint px-4 py-1.5 font-mono text-xs font-semibold text-forest">
            {t('loyalty.full')}
          </div>
        ) : justStamped ? (
          <div className="mx-auto w-fit rounded-full bg-mint-tint px-4 py-1.5 font-mono text-xs font-semibold text-forest">
            {t('loyalty.added')}
          </div>
        ) : (
          <button
            onClick={collectStamp}
            disabled={alreadyStamped}
            className="w-full rounded-full bg-ink text-paper py-2.5 text-sm font-semibold disabled:opacity-50 active:scale-[0.99] transition"
          >
            {t('loyalty.add')}
          </button>
        )}
      </div>

      {/* Google review — mock's ScreenReview */}
      {googleReviewUrl && (
        <div className="w-full bg-paper rounded-2xl shadow-sm p-5 text-center space-y-3">
          <p className="text-[15px] font-semibold text-ink">{t('review.question')}</p>
          <div className="flex justify-center gap-1.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-6 w-6 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
              />
            ))}
          </div>
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto block w-fit rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper active:scale-[0.99] transition"
          >
            {t('review.cta')}
          </a>
        </div>
      )}
    </div>
  );
}
