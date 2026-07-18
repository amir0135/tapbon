import { FadeIn } from './fade-in';
import { Kicker } from './kicker';
import { PillLink } from './pill-link';

export type CompareStrings = {
  oldWay: string; oldWayBody: string;
  oldUpfront: string; oldUpfrontVal: string;
  oldOngoing: string; oldOngoingVal: string;
  oldChipPrinter: string; oldChipStamp: string; oldChipSign: string;
  newWay: string; newWayBody: string;
  newDevice: string; newDeviceVal: string;
  newMonthly: string; newMonthlyVal: string;
  newChipTile: string;
  ctaPaperless: string; ctaGetStarted: string; vsBadge: string;
};

export function CompareSection({ s }: { s: CompareStrings }) {
  return (
    <section id="sammenlign" className="bg-canvas">
      <div className="mx-auto max-w-[1268px] px-6 py-24 md:px-[86px] md:py-32">

        {/* Heading */}
        <FadeIn className="mb-12 space-y-3 text-center">
          <Kicker>Før og efter</Kicker>
          <h2 className="text-[34px] font-semibold leading-[1.06] tracking-[-0.022em] text-ink md:text-[43px]">
            Én brik erstatter det hele.
          </h2>
          <p className="mx-auto max-w-[480px] text-[17px] leading-[1.55] text-ink/60">
            Tapbon-brikken erstatter printer, papirruller, stempelkort og kvitteringsblok — og giver dine kunder en digital oplevelse de faktisk husker.
          </p>
        </FadeIn>

        {/* Full-width before/after image */}
        <FadeIn delay={0.1}>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/compare-hero_2.jpg"
              alt="Fra printer og stempelkort til én Tapbon-brik"
              className="w-full rounded-3xl object-cover"
              style={{ aspectRatio: '16/9' }}
            />
            {/* Left label — old way */}
            <div className="absolute left-6 top-5 md:left-10 md:top-8">
              <span className="rounded-full bg-black/50 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60 backdrop-blur-sm">
                {s.oldWay}
              </span>
            </div>
            {/* Right label — new way */}
            <div className="absolute right-6 top-5 md:right-10 md:top-8">
              <span className="rounded-full border border-mint/30 bg-mint/20 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mint backdrop-blur-sm">
                {s.newWay}
              </span>
            </div>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.2} className="mt-10 flex justify-center">
          <PillLink href="#kom-i-gang" arrow>{s.ctaPaperless}</PillLink>
        </FadeIn>

      </div>
    </section>
  );
}
