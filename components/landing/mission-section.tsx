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

/** Geometric globe — layered gradients + slowly drifting longitude bands (CSS only). */
function Globe() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[520px]">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,#7fe0ac_0%,#34c97b_34%,#3e624c_72%,#233a2c_100%)] shadow-[inset_-40px_-32px_80px_rgb(0_0_0/0.35),0_40px_80px_-40px_rgb(62_98_76/0.5)]" />
      {/* drifting longitude bands */}
      <div className="globe-spin absolute inset-0 overflow-hidden rounded-full">
        <div className="absolute inset-y-0 -left-full flex w-[300%]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-full flex-1 border-r border-white/15" />
          ))}
        </div>
      </div>
      {/* latitude lines */}
      {[20, 40, 60, 80].map((t) => (
        <div
          key={t}
          className="absolute inset-x-[6%] rounded-[50%] border-t border-white/10"
          style={{ top: `${t}%` }}
        />
      ))}
      {/* cloud blobs */}
      <div className="absolute left-[18%] top-[24%] h-[10%] w-[34%] rounded-full bg-white/25 blur-md" />
      <div className="absolute left-[48%] top-[58%] h-[9%] w-[28%] rounded-full bg-white/20 blur-md" />
      <div className="absolute left-[30%] top-[74%] h-[7%] w-[20%] rounded-full bg-white/15 blur-md" />
      {/* atmosphere */}
      <div className="absolute -inset-3 rounded-full border border-mint/20 blur-[1px]" />
    </div>
  );
}

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
          <Globe />
        </FadeIn>
      </div>
    </section>
  );
}
