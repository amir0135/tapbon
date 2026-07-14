'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, Lock } from 'lucide-react';
import { FadeIn } from './fade-in';
import { TileMock } from './mocks';
import { cn } from '@/lib/utils';

export type OrderStrings = {
  badge: string;
  title: string;
  body1: string;
  body2: string;
  tabAria: string;
  tabMonthly: string;
  tabAnnual: string;
  tabBest: string;
  deviceLabel: string;
  deviceValMonthly: string;
  deviceValAnnual: string;
  deviceNoteMonthly: string;
  deviceNoteAnnual: string;
  ongoingLabel: string;
  ongoingValMonthly: string;
  ongoingValAnnual: string;
  ongoingUnitMonthly: string;
  ongoingUnitAnnual: string;
  ongoingNoteMonthly: string;
  ongoingNoteAnnual: string;
  startNote: string;
  productName: string;
  inStock: string;
  chooseColour: string;
  colourLight: string;
  colourDark: string;
  required: string;
  formBusiness: string;
  formBusinessPh: string;
  formEmail: string;
  formEmailPh: string;
  formPos: string;
  formPosPh: string;
  formPosOther: string;
  formTiles: string;
  checkout: string;
  expandCta: string;
  cancelAnytime: string;
  posRow: string;
  tileTitle: string;
  tileSub: string;
};

const POS_OPTIONS = ['Zettle', 'SumUp', 'OnlinePOS', 'Flatpay', 'Shopify POS'];

function Field({
  label,
  required,
  requiredLabel,
  htmlFor,
  children
}: {
  label: string;
  required?: boolean;
  requiredLabel: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center gap-2 text-[13px] font-medium text-paper/80">
        {label}
        {required && (
          <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-paper/60">
            {requiredLabel}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[15px] text-paper placeholder:text-paper/35 focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint';

export function OrderSection({ s }: { s: OrderStrings }) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [colour, setColour] = useState<'light' | 'dark'>('light');
  const [expanded, setExpanded] = useState(false);
  const [business, setBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [pos, setPos] = useState('');
  const reduce = useReducedMotion();

  const monthly = billing === 'monthly';
  const valid = useMemo(
    () => business.trim().length > 1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && pos !== '',
    [business, email, pos]
  );

  return (
    <section id="kom-i-gang" data-header-dark className="scroll-mt-8 bg-ink-deep text-paper">
      <div className="mx-auto max-w-[1268px] px-6 py-24 md:min-h-[var(--stagevh,100vh)] md:content-center md:px-[86px]">
        <div className="grid items-center gap-16 md:grid-cols-[minmax(0,480px)_minmax(0,420px)] md:justify-between md:gap-24">
          {/* Left column */}
          <FadeIn className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />
              {s.badge}
            </span>
            <h2 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.022em] md:text-[43px]">
              {s.title}
            </h2>
            <div className="space-y-3 text-[16px] leading-[1.55] text-paper/70">
              <p>{s.body1}</p>
              <p>{s.body2}</p>
            </div>

            {/* Billing toggle */}
            <div
              role="tablist"
              aria-label={s.tabAria}
              className="flex w-full max-w-[440px] rounded-full border border-white/15 bg-white/[0.04] p-1.5"
            >
              <button
                role="tab"
                aria-selected={monthly}
                onClick={() => setBilling('monthly')}
                className={cn(
                  'h-11 flex-1 rounded-full text-[14.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint',
                  monthly ? 'bg-paper text-ink shadow' : 'text-paper/70 hover:text-paper'
                )}
              >
                {s.tabMonthly}
              </button>
              <button
                role="tab"
                aria-selected={!monthly}
                onClick={() => setBilling('annual')}
                className={cn(
                  'flex h-11 flex-1 flex-col items-center justify-center rounded-full leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint',
                  !monthly ? 'bg-paper text-ink shadow' : 'text-paper/70 hover:text-paper'
                )}
              >
                <span className="text-[14.5px] font-semibold">{s.tabAnnual}</span>
                <span className={cn('text-[10.5px] font-semibold', !monthly ? 'text-mint' : 'text-mint/80')}>
                  {s.tabBest}
                </span>
              </button>
            </div>

            {/* Price grid */}
            <div className="grid max-w-[440px] grid-cols-2 gap-8 pt-2">
              <div className="space-y-1">
                <p className="text-[14px] text-paper/60">{s.deviceLabel}</p>
                <p className="text-[28px] font-semibold text-mint">
                  {monthly ? s.deviceValMonthly : s.deviceValAnnual}
                </p>
                <p className="text-[13px] text-paper/50">
                  {monthly ? s.deviceNoteMonthly : s.deviceNoteAnnual}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[14px] text-paper/60">{s.ongoingLabel}</p>
                <p className="text-[28px] font-semibold text-mint">
                  {monthly ? s.ongoingValMonthly : s.ongoingValAnnual}
                  <span className="ml-1 text-[15px] font-normal text-paper/60">
                    {monthly ? s.ongoingUnitMonthly : s.ongoingUnitAnnual}
                  </span>
                </p>
                <p className="text-[13px] text-paper/50">
                  {monthly ? s.ongoingNoteMonthly : s.ongoingNoteAnnual}
                </p>
                <p className="text-[13px] text-mint/90">{s.startNote}</p>
              </div>
            </div>
          </FadeIn>

          {/* Right column — product card */}
          <FadeIn delay={0.12}>
            <div className="rounded-[20px] bg-ink-raised p-6 shadow-2xl ring-1 ring-white/10">
              <div aria-hidden="true" className="flex justify-center rounded-2xl bg-gradient-to-b from-[#e9edf1] to-[#dde2e8] px-8 py-10">
                <TileMock color={colour} title={s.tileTitle} sub={s.tileSub} className="max-w-[190px] rounded-3xl" />
              </div>
              <div className="mt-5 flex items-center justify-between">
                <h3 className="text-[19px] font-semibold">{s.productName}</h3>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-mint">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />
                  {s.inStock}
                </span>
              </div>

              <fieldset className="mt-4">
                <legend className="mb-2 text-[13px] text-paper/70">{s.chooseColour}</legend>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ['light', s.colourLight, 'bg-paper'],
                      ['dark', s.colourDark, 'bg-ink border border-white/30']
                    ] as const
                  ).map(([val, label, swatch]) => (
                    <label
                      key={val}
                      className={cn(
                        'flex h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-[14px] font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-mint',
                        colour === val
                          ? 'border-mint bg-mint/10 text-paper'
                          : 'border-white/15 text-paper/75 hover:border-white/35'
                      )}
                    >
                      <input
                        type="radio"
                        name="tile-colour"
                        value={val}
                        checked={colour === val}
                        onChange={() => setColour(val)}
                        className="sr-only"
                      />
                      <span className={cn('h-5 w-5 rounded-full', swatch)} aria-hidden="true" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {!expanded && (
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls="order-form"
                  onClick={() => setExpanded(true)}
                  className="mt-5 h-12 w-full rounded-full bg-mint text-[15px] font-semibold text-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint"
                >
                  {s.expandCta}
                </button>
              )}

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    key="order-form"
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    className="overflow-hidden"
                  >
                    <form id="order-form" className="mt-5 space-y-4" action="/sign-up" method="GET">
                <Field label={s.formBusiness} required requiredLabel={s.required} htmlFor="order-business">
                  <input
                    id="order-business"
                    name="business"
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    placeholder={s.formBusinessPh}
                    className={inputCls}
                    autoComplete="organization"
                  />
                </Field>
                <Field label={s.formEmail} required requiredLabel={s.required} htmlFor="order-email">
                  <input
                    id="order-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={s.formEmailPh}
                    className={inputCls}
                    autoComplete="email"
                  />
                </Field>
                <Field label={s.formPos} required requiredLabel={s.required} htmlFor="order-pos">
                  <div className="relative">
                    <select
                      id="order-pos"
                      name="pos"
                      value={pos}
                      onChange={(e) => setPos(e.target.value)}
                      className={cn(inputCls, 'appearance-none pr-10', pos === '' && 'text-paper/35')}
                    >
                      <option value="" disabled>
                        {s.formPosPh}
                      </option>
                      {POS_OPTIONS.map((o) => (
                        <option key={o} value={o} className="text-ink">
                          {o}
                        </option>
                      ))}
                      <option value="other" className="text-ink">
                        {s.formPosOther}
                      </option>
                    </select>
                    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/50" />
                  </div>
                </Field>
                <Field label={s.formTiles} requiredLabel={s.required} htmlFor="order-tiles">
                  <div className="relative">
                    <select id="order-tiles" name="tiles" defaultValue="1" className={cn(inputCls, 'appearance-none pr-10')}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n} className="text-ink">
                          {n}
                        </option>
                      ))}
                    </select>
                    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/50" />
                  </div>
                </Field>
                <button
                  type="submit"
                  disabled={!valid}
                  className="h-12 w-full rounded-full bg-mint text-[15px] font-semibold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint"
                >
                  {s.checkout}
                </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-paper/50">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                {s.cancelAnytime}
              </p>
            </div>
          </FadeIn>
        </div>

        {/* POS compatibility row */}
        <FadeIn className="mt-20 space-y-6 text-center md:mt-24">
          <p className="text-[14px] text-paper/50">{s.posRow}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[...POS_OPTIONS, 'Square'].map((name) => (
              <li key={name} className="font-mono text-[15px] font-semibold tracking-wide text-paper/35">
                {name}
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  );
}
