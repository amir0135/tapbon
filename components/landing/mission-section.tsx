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
  factsHeader: string;
  facts: { value: string; label: string }[];
};

/* Deterministisk pseudo-random (mulberry32) — identisk på server og klient */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Strip = { left: number; bottom: number; w: number; h: number; rot: number; o: number };

/** Bølge/bunke af små bon-strimler — positioner beregnet én gang ved modul-load. */
const PILE: Strip[] = (() => {
  const rand = rng(20260718);
  const strips: Strip[] = [];
  for (let i = 0; i < 130; i++) {
    const x = rand() * 100; // 0–100 %
    // bølgeprofil: højere mod midten/højre, ebber ud mod venstre
    const crest = 26 + 20 * Math.sin((x / 100) * Math.PI * 1.15 + 0.35);
    strips.push({
      left: x,
      bottom: rand() * rand() * crest,
      w: 22 + rand() * 34,
      h: 7 + rand() * 9,
      rot: (rand() - 0.5) * 70,
      o: 0.45 + rand() * 0.55,
    });
  }
  return strips;
})();

function ReceiptPile() {
  return (
    <div aria-hidden="true" className="absolute inset-x-[-8%] bottom-0 h-[46%]">
      {PILE.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-[3px] border border-black/[0.07] bg-paper shadow-[0_1px_2px_rgb(16_21_29/0.10)]"
          style={{
            left: `${s.left}%`,
            bottom: `${s.bottom}%`,
            width: s.w,
            height: s.h,
            opacity: s.o,
            transform: `rotate(${s.rot}deg)`,
          }}
        >
          <span className="absolute inset-x-1 top-1 h-px bg-ink/15" />
          <span className="absolute inset-x-1 top-2.5 h-px bg-ink/10" />
        </span>
      ))}
    </div>
  );
}

/** Lodret bon-strimmel der stikker ud over sektionen, med store fakta printet på. */
function FactStrip({ header, facts }: { header: string; facts: MissionStrings['facts'] }) {
  return (
    <div className="relative mx-auto w-[240px] md:w-[260px]">
      <div
        className="relative z-10 -mt-24 -mb-24 bg-paper px-6 pb-14 pt-16 font-mono text-ink shadow-[0_32px_64px_-32px_rgb(16_21_29/0.35)] ring-1 ring-black/5 [clip-path:polygon(0_0,100%_0,100%_calc(100%-10px),96%_100%,88%_calc(100%-9px),79%_100%,71%_calc(100%-10px),62%_100%,54%_calc(100%-9px),46%_100%,38%_calc(100%-10px),29%_100%,21%_calc(100%-9px),12%_100%,4%_calc(100%-10px),0_100%)]"
      >
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-ink/40">
          {header}
        </p>
        <div className="mt-4 border-t border-dashed border-ink/15" />
        {facts.map((f) => (
          <div key={f.value} className="border-b border-dashed border-ink/15 py-6 text-center">
            <p className="text-[34px] font-bold leading-none tracking-tight md:text-[38px]">
              {f.value}
            </p>
            <p className="mt-2 text-[11px] leading-snug text-ink/55">{f.label}</p>
          </div>
        ))}
        <p className="mt-5 text-center text-[9px] uppercase tracking-[0.3em] text-ink/30">
          Tapbon
        </p>
      </div>
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
          <div aria-hidden="true" className="relative min-h-[560px] md:min-h-[640px]">
            {/* Svævende tal — delvist bag strimlen */}
            <p className="pointer-events-none absolute left-1/2 top-[16%] z-0 -translate-x-[72%] whitespace-nowrap font-sans text-[88px] font-bold leading-none tracking-[-0.04em] text-ink/[0.08] md:text-[120px]">
              {s.strong}
            </p>
            <ReceiptPile />
            <div className="absolute inset-x-0 top-0 z-10 flex justify-center">
              <FactStrip header={s.factsHeader} facts={s.facts} />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
