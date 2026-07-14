'use client';

import { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll
} from 'motion/react';
import { PillLink } from './pill-link';
import { Kicker } from './kicker';
import { PhoneMock, TileMock, panelScreens, type ScreenKey } from './mocks';

export type HeroPanel = {
  kicker: string;
  title: string;
  points: string[];
  screen: ScreenKey;
};

export type HeroStrings = {
  h1a: string;
  h1b: string;
  sub: string;
  bullets: string[];
  ctaGetStarted: string;
  ctaStartNow: string;
  tileTitle: string;
  tileSub: string;
};

const EASE = [0.32, 0.72, 0, 1] as const;

function PanelText({ panel }: { panel: HeroPanel }) {
  return (
    <div className="space-y-4">
      <Kicker>{panel.kicker}</Kicker>
      <h2 className="text-[40px] font-semibold leading-[1.06] tracking-[-0.022em] text-ink">
        {panel.title}
      </h2>
      <ul className="list-disc space-y-1.5 pl-5 text-[17px] leading-relaxed text-ink/80">
        {panel.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

function PhoneScreens({ step, panels }: { step: number; panels: HeroPanel[] }) {
  const idx = Math.max(0, step - 1);
  return (
    <div className="h-full overflow-hidden" aria-hidden="true">
      <motion.div
        animate={{ y: `-${idx * 100}%` }}
        transition={{ duration: 0.6, ease: EASE }}
        className="h-full"
      >
        {panels.map((panel) => {
          const Screen = panelScreens[panel.screen];
          return (
            <div key={panel.screen} className="flex h-full items-center">
              <div className="w-full">
                <Screen />
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function ScrollyHero({
  strings,
  panels
}: {
  strings: HeroStrings;
  panels: HeroPanel[];
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const steps = panels.length + 1; // intro + one step per panel
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end']
  });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setStep(Math.min(steps - 1, Math.max(0, Math.floor(v * steps))));
  });

  const intro = step === 0;

  return (
    <section ref={ref} aria-label={`${strings.h1a} ${strings.h1b}`}>
      {/* ── Desktop: pinned scrollytelling ── */}
      <div
        className="hidden md:block"
        style={{ height: `calc(${steps + 1} * var(--stagevh, 100vh))` }}
      >
        <div className="sticky top-0 mx-auto grid h-[var(--stagevh,100vh)] max-w-[1440px] grid-cols-[minmax(0,400px)_1fr_minmax(0,300px)] items-center gap-10 overflow-hidden px-[86px]">
          {/* Left rail */}
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              {intro ? (
                <motion.div
                  key="intro"
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -24 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="space-y-5"
                >
                  <h1 className="text-[46px] font-semibold leading-[1.06] tracking-[-0.022em] text-ink">
                    {strings.h1a}
                    <br />
                    {strings.h1b}
                  </h1>
                  <p className="max-w-[346px] text-[17px] leading-[1.55] text-ink/75">
                    {strings.sub}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={`panel-${step}`}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -24 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <PanelText panel={panels[step - 1]} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center device */}
          <div className="relative flex h-full items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 mx-auto h-[80%] w-[min(640px,100%)] -translate-y-1/2 rounded-[32px] bg-[radial-gradient(ellipse_at_center,#eef2f5_0%,rgba(248,250,251,0)_70%)]"
            />
            <AnimatePresence mode="wait" initial={false}>
              {intro ? (
                <motion.div
                  key="tile"
                  aria-hidden="true"
                  initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, y: 80, scale: 0.94 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="relative w-[300px]"
                >
                  <div className="[transform:scale(var(--devfit,1))]">
                    <TileMock title={strings.tileTitle} sub={strings.tileSub} />
                    {/* reflection */}
                    <div className="mt-1 h-24 w-full scale-y-[-1] overflow-hidden opacity-[0.08] [mask-image:linear-gradient(to_top,black,transparent)]">
                      <TileMock title={strings.tileTitle} sub={strings.tileSub} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="phone"
                  aria-hidden="true"
                  initial={reduce ? false : { opacity: 0, y: 160 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="relative"
                >
                  <div className="[transform:scale(var(--devfit,1))]">
                    <PhoneMock>
                      <PhoneScreens step={step} panels={panels} />
                    </PhoneMock>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right rail */}
          <div className="relative flex justify-center">
            <AnimatePresence mode="wait" initial={false}>
              {intro ? (
                <motion.div
                  key="benefits"
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -24 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="space-y-6"
                >
                  <ul className="list-disc space-y-2 pl-5 text-[17px] leading-relaxed text-ink/85">
                    {strings.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <PillLink href="#kom-i-gang" variant="outline-ink">
                    {strings.ctaGetStarted}
                  </PillLink>
                </motion.div>
              ) : (
                <motion.div
                  key="startnow"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <PillLink href="#kom-i-gang" variant="outline-ink" arrow>
                    {strings.ctaStartNow}
                  </PillLink>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Mobile / tablet: stacked panels ── */}
      <div className="space-y-20 px-6 pb-24 pt-8 md:hidden">
        <div className="space-y-5">
          <h1 className="text-[38px] font-semibold leading-[1.08] tracking-[-0.022em] text-ink">
            {strings.h1a} {strings.h1b}
          </h1>
          <p className="text-[16px] leading-[1.55] text-ink/75">{strings.sub}</p>
          <div aria-hidden="true" className="flex justify-center rounded-[32px] bg-[#eef2f5] px-8 py-12">
            <TileMock title={strings.tileTitle} sub={strings.tileSub} className="max-w-[240px]" />
          </div>
          <ul className="list-disc space-y-1.5 pl-5 text-[16px] text-ink/85">
            {strings.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        {panels.map((panel) => {
          const Screen = panelScreens[panel.screen];
          return (
            <div key={panel.screen} className="space-y-6">
              <div aria-hidden="true" className="mx-auto w-[250px] rounded-[2.4rem] bg-ink-deep p-2 shadow-xl">
                <div className="overflow-hidden rounded-[2rem] bg-canvas py-6">
                  <Screen />
                </div>
              </div>
              <PanelText panel={panel} />
              <PillLink href="#kom-i-gang" variant="outline-ink" arrow>
                {strings.ctaGetStarted}
              </PillLink>
            </div>
          );
        })}
      </div>
    </section>
  );
}
