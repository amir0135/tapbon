import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { ArrowRight } from 'lucide-react';

// ── Visuals (pure CSS, our own assets — patterns from Receiptile, not copies) ──

function PhoneReceipt() {
  return (
    <div className="float-soft mx-auto w-[290px] rounded-[2.6rem] bg-primary p-3 shadow-2xl">
      <div className="rounded-[2rem] bg-secondary overflow-hidden">
        <div className="h-7 flex items-center justify-center">
          <div className="h-4 w-24 rounded-full bg-primary" />
        </div>
        <div className="p-3 pb-6">
          <div className="bg-paper rounded-2xl shadow-sm p-5 font-mono text-[13px] space-y-3">
            <div className="text-center space-y-1">
              <div className="h-9 w-9 rounded-xl bg-accent mx-auto flex items-center justify-center">
                <span className="h-3 w-3 rounded-full bg-paper" />
              </div>
              <p className="font-sans font-semibold tracking-tight text-[15px]">
                Café Solsort
              </p>
              <p className="text-[9px] text-muted-foreground">
                CVR-nr. 12345678
              </p>
            </div>
            <div className="border-t border-dashed" />
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Cappuccino x2</span>
                <span>84,00</span>
              </div>
              <div className="flex justify-between">
                <span>Kanelsnegl</span>
                <span>38,00</span>
              </div>
            </div>
            <div className="border-t border-dashed" />
            <div className="flex justify-between font-semibold text-[13px]">
              <span>TOTAL DKK</span>
              <span>122,00</span>
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>Heraf moms 25%</span>
              <span>24,40</span>
            </div>
            <div className="border-t border-dashed" />
            <div className="flex gap-1 justify-center pt-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full ${i < 4 ? 'bg-accent' : 'border border-border'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-40 w-40 rounded-[2rem]' : 'h-24 w-24 rounded-3xl';
  return (
    <div
      className={`${dim} float-tile bg-forest shadow-xl flex flex-col items-center justify-center gap-2`}
    >
      <span className="relative inline-flex h-3.5 w-3.5">
        <span className="dot-ping absolute inset-0" />
        <span className="relative h-3.5 w-3.5 rounded-full bg-accent" />
      </span>
      <span className="font-mono text-paper/90 text-[10px] tracking-widest">
        TAPBON
      </span>
    </div>
  );
}

// ── Sections ──────────────────────────────────────────────────────────────────

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-mono tracking-[0.25em] text-muted-foreground">
      {children}
    </p>
  );
}

function FeatureBlock({
  kicker,
  title,
  bullets,
  visual,
  flip,
}: {
  kicker: string;
  title: string;
  bullets: string[];
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="py-14 border-t">
      <div
        className={`max-w-5xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 items-center ${
          flip ? 'lg:[&>*:first-child]:order-2' : ''
        }`}
      >
        <Reveal className="space-y-4 text-center lg:text-left">
          <Kicker>{kicker}</Kicker>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            {title}
          </h2>
          <ul className="space-y-1.5 text-muted-foreground">
            {bullets.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120} className="flex justify-center">
          {visual}
        </Reveal>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const t = await getTranslations('landing');

  const businesses = [
    { title: t('biz1'), body: t('biz1Body'), emoji: '☕' },
    { title: t('biz2'), body: t('biz2Body'), emoji: '🛍️' },
    { title: t('biz3'), body: t('biz3Body'), emoji: '💇' },
    { title: t('biz4'), body: t('biz4Body'), emoji: '🔧' },
    { title: t('biz5'), body: t('biz5Body'), emoji: '🚗' },
    { title: t('biz6'), body: t('biz6Body'), emoji: '🩺' },
  ];

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
  ];

  return (
    <main className="bg-paper">
      {/* Hero — big, centered, two-tone like Receiptile */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgb(52_201_123/0.08),transparent_70%)]"
        />
        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-8">
          <h1 className="hero-enter text-[2.9rem] leading-[1.02] sm:text-7xl font-bold tracking-tight">
            {t('heroA')}
            <br />
            <span className="text-accent">{t('heroB')}</span>
          </h1>
          <p className="hero-enter hero-enter-delay-1 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            {t('heroSub')}
          </p>
          <div className="hero-enter hero-enter-delay-2 flex justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full text-base px-8 transition-transform duration-300 hover:scale-[1.04] hover:shadow-lg"
            >
              <Link href="/sign-up">
                {t('ctaOrder')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          {/* Tile + phone scene */}
          <div className="hero-enter hero-enter-delay-3 flex items-end justify-center gap-8 pt-6">
            <div className="hidden sm:block pb-10">
              <Tile size="lg" />
            </div>
            <PhoneReceipt />
          </div>
        </div>
      </section>

      {/* Tap. Gem. Færdig. */}
      <FeatureBlock
        kicker={t('how')}
        title={t('tapTitle')}
        bullets={[t('tap1'), t('tap2'), t('tap3')]}
        visual={
          <div className="flex items-center gap-6">
            <Tile />
            <span className="text-4xl">📱</span>
          </div>
        }
      />

      {/* Feature stack — one section per feature, alternating */}
      <FeatureBlock
        kicker={t('forBusiness')}
        title={t('pdfTitle')}
        bullets={[t('pdf1'), t('pdf2'), t('pdf3')]}
        flip
        visual={
          <div className="bg-secondary rounded-2xl p-6 font-mono text-xs w-64 space-y-2">
            <div className="bg-paper rounded-xl p-3 shadow-sm flex justify-between">
              <span>kvittering.pdf</span>
              <span className="text-accent">↓</span>
            </div>
            <div className="bg-paper rounded-xl p-3 shadow-sm flex justify-between opacity-70">
              <span>Fotos</span>
              <span className="text-accent">✓</span>
            </div>
            <div className="bg-paper rounded-xl p-3 shadow-sm flex justify-between opacity-40">
              <span>bogholder@...</span>
              <span className="text-accent">→</span>
            </div>
          </div>
        }
      />
      <FeatureBlock
        kicker={t('forBusiness')}
        title={t('reviewTitle')}
        bullets={[t('review1'), t('review2'), t('review3')]}
        visual={
          <div className="bg-secondary rounded-2xl p-8 flex flex-col items-center gap-3 w-64">
            <div className="flex gap-1 text-3xl">
              {'★★★★★'.split('').map((s, i) => (
                <span key={i} className="text-accent">
                  {s}
                </span>
              ))}
            </div>
            <div className="h-2 w-32 rounded-full bg-paper" />
            <div className="h-2 w-24 rounded-full bg-paper" />
          </div>
        }
      />
      <FeatureBlock
        kicker={t('forBusiness')}
        title={t('loyaltyTitle')}
        bullets={[t('loyalty1'), t('loyalty2'), t('loyalty3')]}
        flip
        visual={
          <div className="bg-secondary rounded-2xl p-8 w-64">
            <div className="grid grid-cols-5 gap-2.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className={`aspect-square rounded-full ${
                    i < 7 ? 'bg-accent' : 'border-2 border-border bg-paper'
                  }`}
                />
              ))}
            </div>
          </div>
        }
      />
      <FeatureBlock
        kicker={t('forBusiness')}
        title={t('vatTitle')}
        bullets={[t('vat1'), t('vat2'), t('vat3')]}
        visual={
          <div className="bg-secondary rounded-2xl p-6 font-mono text-xs w-64 space-y-1.5">
            <div className="flex justify-between">
              <span>Heraf moms 25%</span>
              <span>24,40</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>CVR-nr.</span>
              <span>12345678</span>
            </div>
            <div className="border-t border-dashed my-2" />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SHA-256</span>
              <span className="text-accent">🔒 forseglet</span>
            </div>
          </div>
        }
      />

      {/* Old way / better way */}
      <section className="py-16 bg-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-6">
          <Reveal>
            <div className="card-hover bg-paper rounded-2xl p-8 space-y-3 h-full">
              <h3 className="text-2xl font-bold tracking-tight">{t('oldWay')}</h3>
              <p className="text-muted-foreground">{t('oldWayBody')}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {t('oldWayItems')}
              </p>
              <p className="font-mono text-sm line-through decoration-destructive/70">
                {t('oldWayPrice')}
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="card-hover bg-forest text-paper rounded-2xl p-8 space-y-3 h-full">
              <h3 className="text-2xl font-bold tracking-tight">{t('newWay')}</h3>
              <p className="text-paper/80">{t('newWayBody')}</p>
              <p className="font-mono text-[10px] tracking-[0.25em] text-accent pt-2">
                {t('pricePilot')}
              </p>
              <p className="text-4xl font-bold tracking-tight">
                {t('priceAmount')}
              </p>
              <p className="text-sm text-paper/70">{t('priceNote')}</p>
              <Button
                asChild
                size="lg"
                className="rounded-full bg-accent text-forest hover:bg-accent/90 mt-2 transition-transform duration-300 hover:scale-[1.04]"
              >
                <Link href="/sign-up">
                  {t('ctaPilot')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Works for every business */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 text-center">
          <Reveal className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t('businessesTitle')}
            </h2>
            <p className="text-muted-foreground">{t('businessesSub')}</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {businesses.map((b, i) => (
              <Reveal key={b.title} delay={i * 70}>
                <div className="card-hover bg-secondary rounded-2xl p-6 space-y-1 h-full">
                  <span className="text-2xl">{b.emoji}</span>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mission — full-bleed forest, like Receiptile's "300 billion is why" */}
      <section className="py-20 bg-forest text-paper">
        <Reveal className="max-w-3xl mx-auto px-4 text-center space-y-5">
          <p className="text-[11px] font-mono tracking-[0.25em] text-accent">
            {t('mission')}
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {t('missionTitle')}
          </h2>
          <p className="text-paper/80 text-lg">{t('missionBody1')}</p>
          <p className="text-paper/80 text-lg">{t('missionBody2')}</p>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 space-y-8">
          <Reveal className="text-center space-y-3">
            <p className="text-[11px] font-mono tracking-[0.25em] text-muted-foreground">
              {t('faqKicker')}
            </p>
            <h2 className="text-3xl font-bold tracking-tight">{t('faqTitle')}</h2>
          </Reveal>
          <Reveal delay={100} className="divide-y">
            {faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between font-medium list-none transition-colors hover:text-accent">
                  {f.q}
                  <span className="text-accent transition-transform duration-300 group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="pt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Footer — forest, columned like Receiptile */}
      <footer className="bg-forest text-paper py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid sm:grid-cols-4 gap-10">
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-accent inline-flex items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-forest" />
              </span>
              <span className="text-xl font-semibold tracking-tight">Tapbon</span>
            </div>
            <p className="text-sm text-paper/70 max-w-xs">{t('footerTagline')}</p>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[10px] tracking-[0.25em] text-accent">
              {t('footerProduct')}
            </p>
            <Link href="/pricing" className="block text-sm text-paper/80 hover:text-paper">
              {t('footerPricing')}
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[10px] tracking-[0.25em] text-accent">
              {t('footerAccount')}
            </p>
            <Link href="/sign-up" className="block text-sm text-paper/80 hover:text-paper">
              {t('footerSignup')}
            </Link>
            <Link href="/sign-in" className="block text-sm text-paper/80 hover:text-paper">
              {t('footerLogin')}
            </Link>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-paper/15">
          <p className="font-mono text-xs text-paper/50">
            © {new Date().getFullYear()} Tapbon
          </p>
        </div>
      </footer>
    </main>
  );
}
