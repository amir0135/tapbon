/* Geometric product mockups — pure CSS, locally generated, no photos.
   All mocks are decorative: wrap usages with aria-hidden="true". */

import { cn } from '@/lib/utils';
import {
  Check,
  Download,
  Image as ImageIcon,
  Forward,
  Star,
  Leaf,
  Hammer,
  Cog,
  Hand,
  Phone,
  Globe,
  Lock
} from 'lucide-react';

/** NFC-style tap arcs */
export function TapArcs({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex h-14 w-14 items-center justify-center', className)}>
      <span className="absolute inset-0 rounded-full border-2 border-mint [clip-path:polygon(0_18%,38%_18%,38%_82%,0_82%)]" />
      <span className="absolute inset-0 rounded-full border-2 border-mint [clip-path:polygon(62%_18%,100%_18%,100%_82%,62%_82%)]" />
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-ink" />
    </span>
  );
}

/** The Tapbon counter tile */
export function TileMock({
  color = 'light',
  title,
  sub,
  className
}: {
  color?: 'light' | 'dark';
  title: string;
  sub: string;
  className?: string;
}) {
  const light = color === 'light';
  return (
    <div
      className={cn(
        'flex aspect-square w-full max-w-[300px] flex-col items-center justify-center gap-3 rounded-[28px] shadow-[0_24px_60px_-24px_rgb(16_21_29/0.35)]',
        light
          ? 'bg-gradient-to-br from-white to-[#eef1f4] border border-black/5'
          : 'bg-gradient-to-br from-[#2a3342] to-ink-deep border border-white/10',
        className
      )}
    >
      <TapArcs />
      <p className={cn('text-[22px] font-semibold tracking-tight', light ? 'text-ink' : 'text-paper')}>
        {title}
      </p>
      <p className={cn('font-mono text-[11px]', light ? 'text-muted-foreground' : 'text-paper/60')}>
        {sub}
      </p>
      <span className="relative mt-1 inline-flex h-3 w-3">
        <span className="dot-ping absolute inset-0" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-mint" />
      </span>
    </div>
  );
}

/** Phone frame; children fill the screen */
export function PhoneMock({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-[290px] rounded-[2.8rem] bg-ink-deep p-[10px] shadow-[0_40px_80px_-32px_rgb(16_21_29/0.5)] ring-1 ring-black/20',
        className
      )}
    >
      <div className="relative overflow-hidden rounded-[2.2rem] bg-canvas">
        <div className="absolute left-1/2 top-2 z-10 h-[22px] w-24 -translate-x-1/2 rounded-full bg-ink-deep" />
        <div className="h-[560px] pt-10">{children}</div>
      </div>
    </div>
  );
}

/* ── Screen contents (decorative receipt scenes) ──────────────────────── */

function ReceiptHeader({ full = false }: { full?: boolean }) {
  return (
    <div className="space-y-1.5 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-forest">
        <Leaf className="h-4 w-4 text-forest" aria-hidden="true" />
      </span>
      <p className="text-[13px] font-semibold tracking-[0.22em] text-ink">HOLM ISENKRAM</p>
      {full && (
        <>
          <div className="flex items-center justify-center gap-2 whitespace-nowrap text-[8px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Phone className="h-2.5 w-2.5" aria-hidden="true" /> 38 12 90 45
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe className="h-2.5 w-2.5" aria-hidden="true" /> holmisenkram.dk
            </span>
          </div>
          <p className="whitespace-nowrap text-[8px] text-muted-foreground">Jægersborggade 14, 2200 Kbh N</p>
        </>
      )}
      <p className="font-mono text-[9px] text-muted-foreground">CVR-nr. 12345678</p>
    </div>
  );
}

function Dashed() {
  return <div className="border-t border-dashed border-border" />;
}

function ItemRow({
  icon: Icon,
  name,
  variant,
  qty,
  price
}: {
  icon: typeof Hammer;
  name: string;
  variant: string;
  qty: number;
  price: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f1efe9]">
        <Icon className="h-3.5 w-3.5 text-ink/60" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block whitespace-nowrap font-sans text-[10.5px] font-semibold text-ink">{name}</span>
        <span className="block whitespace-nowrap text-[8px] text-muted-foreground">{variant}</span>
      </span>
      <span className="w-3 shrink-0 text-center text-[9px] text-muted-foreground">{qty}</span>
      <span className="w-11 shrink-0 text-right text-[10.5px] font-medium text-ink">{price}</span>
    </div>
  );
}

function Barcode() {
  const widths = [2, 1, 3, 1, 2, 2, 1, 3, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 1, 3, 2];
  return (
    <div className="space-y-1" aria-hidden="true">
      <div className="flex h-7 items-stretch justify-center gap-[2px]">
        {widths.map((w, i) => (
          <span key={i} className="bg-ink" style={{ width: w }} />
        ))}
      </div>
      <p className="text-center font-mono text-[8px] tracking-[0.5em] text-ink">A1042</p>
    </div>
  );
}

export function ScreenReceipt() {
  return (
    <div className="mx-4 rounded-2xl bg-paper px-4 py-4 font-mono text-[11px] text-ink shadow-sm space-y-2.5">
      <ReceiptHeader full />
      <Dashed />
      <div className="space-y-2">
        <ItemRow icon={Hammer} name="Hammer" variant="Glasfiber 450 g" qty={1} price="129,00" />
        <ItemRow icon={Cog} name="Skruer 4×40" variant="200 stk." qty={1} price="89,00" />
        <ItemRow icon={Hand} name="Handsker" variant="Str. 9, læder" qty={1} price="49,00" />
      </div>
      <Dashed />
      <div className="space-y-0.5">
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>Heraf moms 25%</span><span>53,40</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-[15px] font-bold">Total</span>
          <span className="font-sans text-[15px] font-bold">267,00 kr.</span>
        </div>
      </div>
      <Dashed />
      <div className="space-y-0.5 text-[9px]">
        <div className="flex justify-between"><span className="text-muted-foreground">Betaling</span><span>Dankort •••• 4321</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Betalt</span><span>267,00</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Godkendt</span><span>008812</span></div>
      </div>
      <Barcode />
      <p className="text-center text-[8.5px] text-muted-foreground">14.07.2026 · 10:24 · Bon #A1042</p>
      <div className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-2.5 font-sans text-[11px] font-semibold text-paper">
        Hent kvittering <Download className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
      <p className="flex items-center justify-center gap-1 whitespace-nowrap text-center text-[8px] text-muted-foreground">
        <Lock className="h-2.5 w-2.5 shrink-0" aria-hidden="true" /> Sikker · Privat · Papirløs ·&nbsp;<span className="font-semibold text-forest">Tapbon</span>
      </p>
    </div>
  );
}

export function ScreenSave() {
  const rows = [
    { icon: ImageIcon, label: 'Gem som billede' },
    { icon: Download, label: 'Hent som PDF' },
    { icon: Forward, label: 'Send til bogholder' }
  ];
  return (
    <div className="mx-4 space-y-3">
      <div className="rounded-2xl bg-paper p-4 shadow-sm">
        <ReceiptHeader />
      </div>
      {rows.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-3 rounded-2xl bg-paper p-3.5 shadow-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-tint">
            <Icon className="h-4 w-4 text-forest" />
          </span>
          <span className="text-[12px] font-semibold text-ink">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function ScreenReview() {
  return (
    <div className="mx-4 space-y-3">
      <div className="rounded-2xl bg-paper p-5 text-center shadow-sm space-y-3">
        <p className="text-[13px] font-semibold text-ink">Hvordan var dit besøg?</p>
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn('h-6 w-6', i < 4 ? 'fill-amber-400 text-amber-400' : 'text-border')} />
          ))}
        </div>
        <div className="mx-auto w-fit rounded-full bg-ink px-5 py-2 text-[11px] font-semibold text-paper">
          Anmeld på Google
        </div>
      </div>
      <div className="rounded-2xl bg-paper p-4 shadow-sm">
        <ReceiptHeader />
      </div>
    </div>
  );
}

export function ScreenLoyalty() {
  return (
    <div className="mx-4 space-y-3">
      <div className="rounded-2xl bg-paper p-5 shadow-sm space-y-3">
        <p className="text-center text-[13px] font-semibold text-ink">Dit loyalitetskort</p>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'mx-auto flex h-8 w-8 items-center justify-center rounded-full',
                i < 6 ? 'bg-mint' : 'border-2 border-dashed border-border'
              )}
            >
              {i < 6 && <Check className="h-4 w-4 text-paper" />}
            </span>
          ))}
        </div>
        <p className="text-center font-mono text-[10px] text-muted-foreground">6 af 10 stempler</p>
        <div className="mx-auto w-fit rounded-full bg-mint-tint px-4 py-1.5 font-mono text-[10px] font-semibold text-forest">
          4 køb til 10 % rabat
        </div>
      </div>
    </div>
  );
}

export function ScreenVat() {
  return (
    <div className="mx-4 rounded-2xl bg-paper p-4 font-mono text-[11px] text-ink shadow-sm space-y-2.5">
      <ReceiptHeader />
      <Dashed />
      <div className="space-y-1">
        <div className="flex justify-between"><span>Moms 25%</span><span>53,40</span></div>
        <div className="flex justify-between"><span>Moms 0%</span><span>0,00</span></div>
        <div className="flex justify-between font-semibold"><span>Total moms</span><span>53,40</span></div>
      </div>
      <Dashed />
      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-mint-tint px-3 py-2 text-[9px] text-forest">
        <Check className="h-3 w-3" />
        <span>Forseglet · SHA-256 · a91f…c04e</span>
      </div>
    </div>
  );
}

export function ScreenBrand() {
  return (
    <div className="mx-4 space-y-3">
      <div className="rounded-2xl bg-forest p-5 text-center shadow-sm space-y-2">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-paper/40">
          <Leaf className="h-4 w-4 text-paper" />
        </span>
        <p className="text-[15px] font-semibold tracking-[0.18em] text-paper">HOLM ISENKRAM</p>
        <div className="mx-auto w-fit rounded-full bg-paper px-4 py-1.5 text-[10px] font-semibold text-forest">
          Se vores sortiment
        </div>
      </div>
      <div className="rounded-2xl bg-paper p-4 shadow-sm">
        <ReceiptHeader />
      </div>
    </div>
  );
}

export const panelScreens = {
  tap: ScreenReceipt,
  pdf: ScreenSave,
  review: ScreenReview,
  loyalty: ScreenLoyalty,
  vat: ScreenVat,
  brand: ScreenBrand
} as const;

export type ScreenKey = keyof typeof panelScreens;
