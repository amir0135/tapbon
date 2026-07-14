'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import QRCode from 'qrcode';
import { issueReceipt } from '@/lib/receipts/actions';
import { formatMoney, parsePriceToMinor } from '@/lib/receipts/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

type Row = { name: string; qty: string; price: string; vatRate: number };

const VAT_RATES = [2500, 1200, 600, 0];
const EMPTY_ROW: Row = { name: '', qty: '1', price: '', vatRate: 2500 };

export function IssueForm({
  currency,
  locale,
}: {
  currency: string;
  locale: string;
}) {
  const t = useTranslations('issue');
  const [rows, setRows] = useState<Row[]>([{ ...EMPTY_ROW }]);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ url: string; qr: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  const runningTotal = rows.reduce((sum, r) => {
    const price = parsePriceToMinor(r.price);
    const qty = parseInt(r.qty, 10);
    return price !== null && qty > 0 ? sum + price * qty : sum;
  }, 0);

  function onSubmit() {
    setError(null);
    const items: {
      name: string;
      qty: number;
      unitPriceGross: number;
      vatRate: number;
    }[] = [];
    for (const r of rows) {
      const unitPriceGross = parsePriceToMinor(r.price);
      const qty = parseInt(r.qty, 10);
      if (!r.name.trim() || unitPriceGross === null || !(qty >= 1)) {
        setError(t('invalidInput'));
        return;
      }
      items.push({ name: r.name.trim(), qty, unitPriceGross, vatRate: r.vatRate });
    }
    startTransition(async () => {
      const result = await issueReceipt({ items });
      if ('error' in result) {
        setError(t('invalidInput'));
        return;
      }
      const url = `${window.location.origin}/r/${result.receiptId}`;
      const qr = await QRCode.toDataURL(url, { margin: 1, width: 220 });
      setIssued({ url, qr });
    });
  }

  if (issued) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <p className="font-medium text-accent">{t('issued')}</p>
        <p className="text-sm text-muted-foreground">{t('scanQr')}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={issued.qr} alt="QR" className="rounded-lg" />
        <a
          href={issued.url}
          target="_blank"
          className="text-accent underline underline-offset-2 font-mono text-sm break-all"
        >
          {issued.url}
        </a>
        <Button
          className="rounded-full"
          onClick={() => {
            setIssued(null);
            setRows([{ ...EMPTY_ROW }]);
          }}
        >
          {t('issueNext')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden sm:grid grid-cols-[1fr_70px_120px_90px_36px] gap-2 text-xs text-muted-foreground">
        <span>{t('itemName')}</span>
        <span>{t('qty')}</span>
        <span>{t('unitPrice')}</span>
        <span>{t('vatRate')}</span>
        <span />
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-2 sm:grid-cols-[1fr_70px_120px_90px_36px] gap-2 items-center"
        >
          <Input
            className="col-span-2 sm:col-span-1"
            placeholder={t('itemName')}
            value={row.name}
            onChange={(e) => updateRow(i, { name: e.target.value })}
          />
          <Input
            inputMode="numeric"
            placeholder={t('qty')}
            value={row.qty}
            onChange={(e) => updateRow(i, { qty: e.target.value })}
          />
          <Input
            inputMode="decimal"
            placeholder="0,00"
            value={row.price}
            onChange={(e) => updateRow(i, { price: e.target.value })}
          />
          <select
            value={row.vatRate}
            onChange={(e) => updateRow(i, { vatRate: parseInt(e.target.value, 10) })}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
          >
            {VAT_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate / 100}%
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('removeRow')}
            disabled={rows.length === 1}
            onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setRows((rs) => [...rs, { ...EMPTY_ROW }])}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('addRow')}
        </Button>
        <span className="font-mono text-sm">
          {t('runningTotal', {
            amount: formatMoney(runningTotal, currency, locale),
          })}
        </span>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        className="w-full rounded-full"
        disabled={pending}
        onClick={onSubmit}
      >
        {pending ? t('submitting') : t('submit')}
      </Button>
    </div>
  );
}
