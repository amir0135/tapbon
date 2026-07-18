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

type Strip = { left: number; bottom: number; w: number; h: number; rot: number; o: number; tint: boolean };
type Pixel = { left: number; bottom: number; s: number; o: number };

/** Bølgeprofil (0–100 % højde): lav mod venstre, høj kam mod højre. */
function crest(x: number) {
  const t = Math.min(Math.max((x - 4) / 78, 0), 1);
  const s = t * t * (3 - 2 * t); // smoothstep
  return 7 + 88 * Math.pow(s, 1.35);
}

/** Bølge af bon-strimler + pixel-opløsning ved kammen — beregnet ved modul-load. */
const { WAVE, PIXELS } = (() => {
  const rand = rng(20260718);
  const wave: Strip[] = [];
  for (let i = 0; i < 520; i++) {
    const x = Math.pow(rand(), 0.85) * 100; // let bias mod højre
    const h = crest(x);
    const depth = Math.pow(rand(), 0.65); // 0 = top af bølgen, 1 = bund (tættere i bunden)
    const y = (1 - depth) * h;
    const nearTop = y > h - 14;
    wave.push({
      left: x,
      bottom: y,
      w: 18 + rand() * 34,
      h: 10 + rand() * 14,
      rot: (rand() - 0.5) * (nearTop ? 150 : 80),
      o: 0.65 + rand() * 0.35,
      tint: nearTop && x > 45 && rand() < 0.35,
    });
  }
  const pixels: Pixel[] = [];
  for (let i = 0; i < 110; i++) {
    const x = 48 + Math.pow(rand(), 0.8) * 58; // fra kammen og ud over højre kant
    const h = crest(Math.min(x, 100));
    pixels.push({
      left: x,
      bottom: h - 6 + rand() * 26,
      s: 3 + rand() * 7,
      o: 0.15 + rand() * 0.6,
    });
  }
  return { WAVE: wave, PIXELS: pixels };
})();

/** Skulpturel bølge af kvitteringer, der opløses i pixels ved kammen. */
function ReceiptWave() {
  return (
    <div aria-hidden="true" className="absolute inset-x-[-10%] bottom-0 top-0">
      {WAVE.map((s, i) => (
        <span
          key={i}
          className={`absolute rounded-[3px] border shadow-[0_2px_5px_rgb(16_21_29/0.16)] ${
            s.tint ? 'border-mint/30 bg-mint-tint' : 'border-black/10 bg-paper'
          }`}
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
          <span className="absolute left-1 right-2.5 top-[16px] h-px bg-ink/10" />
        </span>
      ))}
      {PIXELS.map((p, i) => (
        <span
          key={`px-${i}`}
          className="absolute rounded-[1.5px] bg-mint"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: p.s,
            height: p.s,
            opacity: p.o,
          }}
        />
      ))}
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
          <div aria-hidden="true" className="relative min-h-[520px] md:min-h-[660px]">
            <ReceiptWave />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
