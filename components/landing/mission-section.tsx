import Image from 'next/image';

import { FadeIn } from './fade-in';
import { Kicker } from './kicker';
import { PillLink } from './pill-link';

export type MissionStrings = {
  kicker: string;
  strong: string;
  rest: string;
  paragraphs: string[];
  bold: string;
  cta: string;
};

export function MissionSection({ s }: { s: MissionStrings }) {
  return (
    <section className="overflow-hidden bg-canvas">
      <div className="mx-auto grid max-w-[1268px] items-center gap-16 px-6 py-24 md:min-h-[var(--stagevh,100vh)] md:grid-cols-[minmax(0,470px)_minmax(0,540px)] md:justify-between md:px-[86px]">
        <FadeIn className="space-y-6">
          <Kicker>{s.kicker}</Kicker>
          <h2 className="text-[34px] font-semibold leading-[1.06] tracking-[-0.022em] text-ink md:text-[43px]">
            <strong className="font-semibold">{s.strong}</strong>
            <span className="font-normal text-ink/80">{s.rest}</span>
          </h2>
          <div className="space-y-4 text-[17px] leading-[1.55] text-ink/70">
            {s.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="font-semibold text-ink">{s.bold}</p>
          </div>
          <PillLink href="#kom-i-gang" variant="outline-ink" arrow className="mt-2">
            {s.cta}
          </PillLink>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div aria-hidden="true" className="relative aspect-[4/3] w-full md:scale-[1.18]">
            <Image
              src="/images/mission-receipt-wave.webp"
              alt=""
              fill
              sizes="(min-width: 768px) 640px, 100vw"
              className="object-contain"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
