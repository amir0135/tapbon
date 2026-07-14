import {
  Coffee,
  ShoppingBag,
  Scissors,
  Wrench,
  Car,
  Stethoscope,
  CircleCheck
} from 'lucide-react';
import { FadeIn } from './fade-in';
import { Kicker } from './kicker';
import { PillLink } from './pill-link';

export type BusinessStrings = {
  kicker: string;
  title: string;
  sub: string;
  cta: string;
  guarantee: string;
  items: { title: string; body: string }[];
};

const icons = [Coffee, ShoppingBag, Scissors, Wrench, Car, Stethoscope];

export function BusinessSection({ s }: { s: BusinessStrings }) {
  return (
    <section className="bg-canvas">
      <div className="mx-auto grid max-w-[1268px] items-center gap-14 px-6 py-24 md:min-h-[var(--stagevh,100vh)] md:grid-cols-[minmax(0,420px)_minmax(0,630px)] md:justify-between md:px-[86px]">
        <FadeIn className="space-y-6">
          <Kicker>{s.kicker}</Kicker>
          <h2 className="text-[34px] font-semibold leading-[1.06] tracking-[-0.022em] text-ink md:text-[43px]">
            {s.title}
          </h2>
          <p className="max-w-[360px] text-[17px] leading-[1.55] text-ink/70">{s.sub}</p>
          <div className="space-y-4 pt-2">
            <PillLink href="#kom-i-gang" variant="solid-ink" arrow>
              {s.cta}
            </PillLink>
            <p className="flex items-center gap-2 text-[14px] text-ink/60">
              <CircleCheck className="h-4 w-4 text-mint" aria-hidden="true" />
              {s.guarantee}
            </p>
          </div>
        </FadeIn>

        <ul className="space-y-4">
          {s.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <FadeIn key={item.title} delay={i * 0.06}>
                <li className="flex items-center gap-5 rounded-2xl border border-black/[0.04] bg-paper px-6 py-5 shadow-[0_1px_2px_rgb(16_21_29/0.04),0_8px_24px_-16px_rgb(16_21_29/0.1)]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
                    <Icon className="h-5 w-5 text-forest" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold text-ink">{item.title}</h3>
                    <p className="text-[15px] text-ink/60">{item.body}</p>
                  </div>
                </li>
              </FadeIn>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
