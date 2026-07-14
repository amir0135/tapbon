'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { Kicker } from './kicker';
import { FadeIn } from './fade-in';
import { cn } from '@/lib/utils';

export type FaqStrings = {
  kicker: string;
  title: string;
  items: { q: string; a: string }[];
};

export function FaqSection({ s }: { s: FaqStrings }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="scroll-mt-16 bg-canvas">
      <div className="mx-auto max-w-[1268px] px-6 py-24 md:px-[86px] md:py-32">
        <FadeIn className="space-y-4">
          <Kicker>{s.kicker}</Kicker>
          <h2 className="max-w-[660px] text-[32px] font-semibold leading-[1.08] tracking-[-0.022em] text-ink md:text-[43px]">
            {s.title}
          </h2>
        </FadeIn>

        <div className="mt-12 border-t border-border">
          {s.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-border">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left text-[17px] font-semibold text-ink transition-colors hover:text-ink/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint md:text-[18px]"
                  >
                    {item.q}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        'h-5 w-5 shrink-0 text-ink/60 transition-transform duration-300',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-button-${i}`}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[720px] pb-6 text-[16px] leading-[1.6] text-ink/70">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
