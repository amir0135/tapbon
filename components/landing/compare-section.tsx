import { CircleCheck, CircleX, Printer, Stamp, Star, QrCode } from 'lucide-react';
import { FadeIn } from './fade-in';
import { PillLink } from './pill-link';
import { TapArcs } from './mocks';

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
      className={`absolute rounded-lg bg-ink-deep/90 px-2.5 py-1 font-mono text-[12px] font-semibold text-paper shadow-lg ring-1 ring-white/10 ${className}`}
    >
      {children}
    </span>
  );
}

/** Cluttered counter — geometric scene */
function OldCounter({ s }: { s: CompareStrings }) {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-[16/9] overflow-hidden rounded-[20px] bg-gradient-to-b from-[#39404d] to-[#252b36]"
    >
      {/* counter surface */}
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-[#c9ccd2] to-[#b4b8bf]" />
      {/* printer */}
      <div className="absolute bottom-[30%] left-[46%] h-[34%] w-[26%] rounded-lg bg-[#191d25] shadow-xl">
        <div className="absolute left-1/2 top-1.5 h-2 w-3/5 -translate-x-1/2 rounded-sm bg-[#0e1117]" />
        <div className="absolute -top-9 left-1/2 h-10 w-2/5 -translate-x-1/2 rounded-t-sm bg-paper [clip-path:polygon(0_0,100%_8%,92%_100%,8%_96%)]" />
        <Printer className="absolute bottom-2 left-1/2 h-5 w-5 -translate-x-1/2 text-white/30" />
      </div>
      {/* review stand */}
      <div className="absolute bottom-[32%] left-[12%] h-[30%] w-[16%] rounded-md bg-[#1f242e] shadow-lg ring-1 ring-white/10">
        <Star className="absolute left-1/2 top-2.5 h-4 w-4 -translate-x-1/2 fill-amber-400 text-amber-400" />
        <QrCode className="absolute bottom-2 left-1/2 h-6 w-6 -translate-x-1/2 text-white/50" />
      </div>
      {/* stamp */}
      <div className="absolute bottom-[31%] left-[33%] h-[18%] w-[9%]">
        <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-[#2b323e]" />
        <div className="absolute inset-x-1 bottom-0 h-1/2 rounded-sm bg-[#1c212a]" />
        <Stamp className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white/30" />
      </div>
      <PriceChip className="left-[10%] top-[22%]">{s.oldChipSign}</PriceChip>
      <PriceChip className="left-[31%] top-[46%]">{s.oldChipStamp}</PriceChip>
      <PriceChip className="right-[18%] top-[14%]">{s.oldChipPrinter}</PriceChip>
    </div>
  );
}

/** Clean counter with a single tile */
function NewCounter({ s }: { s: CompareStrings }) {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-[16/9] overflow-hidden rounded-[20px] bg-gradient-to-b from-[#3d444f] to-[#272d38]"
    >
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-[#d3d6db] to-[#bec2c9]" />
      <div className="absolute bottom-[26%] left-1/2 flex h-[42%] w-[30%] -translate-x-1/2 -rotate-3 flex-col items-center justify-center gap-1.5 rounded-2xl border border-black/5 bg-gradient-to-br from-white to-[#eef1f4] shadow-2xl">
        <TapArcs className="h-8 w-8 scale-75" />
        <span className="text-[11px] font-semibold text-ink">Kvittering?</span>
        <span className="h-1.5 w-1.5 rounded-full bg-mint" />
      </div>
      <PriceChip className="right-[22%] top-[26%]">{s.newChipTile}</PriceChip>
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
          className="absolute left-1/2 top-1/2 z-10 hidden h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-[17px] font-semibold text-ink shadow-xl md:flex"
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
