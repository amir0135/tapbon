import Image from 'next/image';
import { CircleCheck, CircleX } from 'lucide-react';
import { FadeIn } from './fade-in';
import { PillLink } from './pill-link';

export type CompareStrings = {
  oldWay: string;
  oldWayBody: string;
  oldUpfront: string;
  oldUpfrontVal: string;
  oldOngoing: string;
  oldOngoingVal: string;
  oldChipPrinter: string;
  oldChipStamp: string;
  oldChipSign: string;
  newWay: string;
  newWayBody: string;
  newDevice: string;
  newDeviceVal: string;
  newMonthly: string;
  newMonthlyVal: string;
  newChipTile: string;
  ctaPaperless: string;
  ctaGetStarted: string;
  vsBadge: string;
};

function PriceChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink-deep px-2.5 py-1.5 font-mono text-[12px] font-semibold text-paper shadow-lg ring-1 ring-white/20 ${className}`}
    >
      {children}
    </span>
  );
}

/** Cluttered counter — printer, stamp, review stand (photo). Chips are localized overlays. */
function OldCounter({ s }: { s: CompareStrings }) {
  return (
    <div aria-hidden="true" className="relative aspect-[1043/658] overflow-hidden rounded-[20px]">
      <Image
        src="/images/compare-old.webp"
        alt=""
        fill
        sizes="(min-width: 768px) 543px, 100vw"
        className="object-cover"
      />
      <PriceChip className="left-[15.9%] top-[17%]">{s.oldChipSign}</PriceChip>
      <PriceChip className="left-[51.4%] top-[14.9%]">{s.oldChipPrinter}</PriceChip>
      <PriceChip className="left-[41.1%] top-[72.4%] py-2">{s.oldChipStamp}</PriceChip>
    </div>
  );
}

/** Clean counter with a single tile (photo). */
function NewCounter({ s }: { s: CompareStrings }) {
  return (
    <div aria-hidden="true" className="relative aspect-[1074/658] overflow-hidden rounded-[20px]">
      <Image
        src="/images/compare-new.webp"
        alt=""
        fill
        sizes="(min-width: 768px) 543px, 100vw"
        className="object-cover"
      />
      <PriceChip className="left-[58.7%] top-[44.2%]">{s.newChipTile}</PriceChip>
    </div>
  );
}

function StatCard({
  ok,
  aLabel,
  aVal,
  bLabel,
  bVal
}: {
  ok: boolean;
  aLabel: string;
  aVal: string;
  bLabel: string;
  bVal: string;
}) {
  const Icon = ok ? CircleCheck : CircleX;
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/[0.06] px-5 py-4 ring-1 ring-white/10">
      <Icon className={`h-6 w-6 shrink-0 ${ok ? 'text-mint' : 'text-negative'}`} aria-hidden="true" />
      <div className="flex items-center gap-5">
        <div>
          <p className="text-[13px] text-paper/60">{aLabel}</p>
          <p className={`text-[19px] font-semibold ${ok ? 'text-mint' : 'text-negative'}`}>{aVal}</p>
        </div>
        <div className="h-8 w-px bg-white/15" aria-hidden="true" />
        <div>
          <p className="text-[13px] text-paper/60">{bLabel}</p>
          <p className={`text-[19px] font-semibold ${ok ? 'text-mint' : 'text-negative'}`}>{bVal}</p>
        </div>
      </div>
    </div>
  );
}

export function CompareSection({ s }: { s: CompareStrings }) {
  return (
    <section data-header-dark className="bg-ink-deep text-paper">
      <div className="relative mx-auto grid max-w-[1268px] gap-16 px-6 py-20 md:min-h-[var(--stagevh,100vh)] md:grid-cols-2 md:content-center md:gap-x-24 md:px-[86px] md:py-28">
        {/* center divider + VS */}
        <div aria-hidden="true" className="absolute inset-y-24 left-1/2 hidden border-l border-dashed border-white/15 md:block" />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper px-7 py-4 text-[17px] font-semibold text-ink shadow-xl md:flex"
        >
          {s.vsBadge}
        </div>

        <FadeIn className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-[30px] font-semibold leading-[1.05] tracking-[-0.022em] md:text-[40px]">
              {s.oldWay}
            </h2>
            <p className="text-[17px] text-paper/60">{s.oldWayBody}</p>
          </div>
          <OldCounter s={s} />
          <div className="flex flex-wrap items-center gap-5">
            <StatCard ok={false} aLabel={s.oldUpfront} aVal={s.oldUpfrontVal} bLabel={s.oldOngoing} bVal={s.oldOngoingVal} />
            <PillLink href="#kom-i-gang" variant="outline-paper" arrow>
              {s.ctaPaperless}
            </PillLink>
          </div>
        </FadeIn>

        <FadeIn delay={0.12} className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-[30px] font-semibold leading-[1.05] tracking-[-0.022em] md:text-[40px]">
              {s.newWay}
            </h2>
            <p className="text-[17px] text-paper/60">{s.newWayBody}</p>
          </div>
          <NewCounter s={s} />
          <div className="flex flex-wrap items-center gap-5">
            <StatCard ok aLabel={s.newDevice} aVal={s.newDeviceVal} bLabel={s.newMonthly} bVal={s.newMonthlyVal} />
            <PillLink href="#kom-i-gang" variant="outline-paper" arrow>
              {s.ctaGetStarted}
            </PillLink>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
