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

type Strip = { left: number; bottom: number; w: number; h: number; rot: number; o: number; tint: boolean; z: number };
type Pixel = { left: number; bottom: number; s: number; o: number };

/** Grundbunkens profil (0–100 % højde): lav hale mod venstre, massiv ved bølgens fod. */
function ground(x: number) {
  const t = Math.min(Math.max((x - 2) / 76, 0), 1);
  const s = t * t * (3 - 2 * t);
  return 4 + 30 * Math.pow(s, 1.1);
}

/** Bølgens rygrad: kvadratisk bezier der rejser sig til højre og krøller mod venstre (brydende bølge). */
function spine(t: number) {
  const p0 = { x: 84, y: 10 };
  const p1 = { x: 78, y: 108 };
  const p2 = { x: 42, y: 62 };
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    // tangent (til rotation der følger bølgen)
    dx: 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
    dy: 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y),
  };
}

/** Brydende bølge af kvitteringer + pixel-opløsning — beregnet ved modul-load. */
const { WAVE, PIXELS } = (() => {
  const rand = rng(20260718);
  const wave: Strip[] = [];

  // 1) Grundbunke: tæt tæppe af boner langs gulvet
  for (let i = 0; i < 300; i++) {
    const x = Math.pow(rand(), 0.8) * 104 - 2;
    const h = ground(Math.max(x, 0));
    const y = Math.pow(rand(), 0.75) * h;
    wave.push({
      left: x,
      bottom: y,
      w: 20 + rand() * 34,
      h: 11 + rand() * 15,
      rot: (rand() - 0.5) * 90,
      o: 0.75 + rand() * 0.25,
      tint: false,
      z: 1,
    });
  }

  // 2) Bølgekroppen: tyk søjle langs rygraden, der krøller over mod venstre
  for (let i = 0; i < 380; i++) {
    const t = Math.pow(rand(), 0.9); // lidt tættere ved foden
    const sp = spine(t);
    const thick = 16 - 10 * t; // tykkelse i %, smaller mod spidsen
    const ox = (rand() - 0.5) * 2 * thick;
    const oy = (rand() - 0.5) * 2 * thick * 0.7;
    const angle = -Math.atan2(sp.dy, sp.dx) * (180 / Math.PI); // følger kurven (CSS-y er nedad)
    const nearTip = t > 0.62;
    wave.push({
      left: sp.x + ox,
      bottom: Math.max(0, sp.y + oy),
      w: 18 + rand() * 30,
      h: 10 + rand() * 14,
      rot: angle + (rand() - 0.5) * (nearTip ? 120 : 55),
      o: 0.7 + rand() * 0.3,
      tint: nearTip && rand() < 0.4,
      z: 2,
    });
  }

  // 3) Pixel-opløsning: langs kammens yderside, driver op og ud mod højre
  const pixels: Pixel[] = [];
  for (let i = 0; i < 150; i++) {
    const t = 0.15 + rand() * 0.75;
    const sp = spine(t);
    const drift = Math.pow(rand(), 0.7);
    pixels.push({
      left: sp.x + 6 + drift * (26 + 20 * t) + (rand() - 0.5) * 8,
      bottom: sp.y + (rand() - 0.35) * 18 + drift * 10,
      s: 3 + rand() * 7,
      o: Math.max(0.08, 0.7 - drift * 0.6) * (0.5 + rand() * 0.5),
    });
  }
  return { WAVE: wave, PIXELS: pixels };
})();

/** Brydende bølge af kvitteringer, der opløses i pixels ved kammen. */
function ReceiptWave() {
  return (
    <div aria-hidden="true" className="absolute inset-x-[-6%] bottom-0 top-0">
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
            zIndex: s.z,
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
