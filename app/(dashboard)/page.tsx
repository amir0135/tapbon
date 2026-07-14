import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  FileDown,
  Star,
  Stamp,
  ShieldCheck,
  Check,
} from 'lucide-react';

// Receipt mockup — pure CSS, monospace, leans into the receipt metaphor
function ReceiptMockup() {
  return (
    <div className="relative mx-auto w-72">
      <div className="bg-paper rounded-2xl shadow-lg p-6 font-mono text-sm space-y-3 rotate-1">
        <div className="text-center space-y-1">
          <div className="h-8 w-8 rounded-lg bg-accent mx-auto flex items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-paper" />
          </div>
          <p className="font-semibold tracking-tight font-sans text-base">
            Café Solsort
          </p>
          <p className="text-[10px] text-muted-foreground">CVR-nr. 12345678</p>
        </div>
        <div className="border-t border-dashed" />
        <div className="space-y-1 text-xs">
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
        <div className="flex justify-between font-semibold">
          <span>TOTAL DKK</span>
          <span>122,00</span>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Heraf moms 25%</span>
          <span>24,40</span>
        </div>
        <div className="border-t border-dashed" />
        <div className="flex gap-1.5 justify-center pt-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full ${i < 4 ? 'bg-accent' : 'border border-border'}`}
            />
          ))}
        </div>
      </div>
      <div className="absolute -bottom-3 -right-3 h-16 w-16 rounded-2xl bg-forest shadow-md -rotate-6 flex items-center justify-center">
        <span className="h-4 w-4 rounded-full bg-accent animate-pulse" />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  kicker,
  title,
  bullets,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  bullets: string[];
}) {
  return (
    <div className="bg-paper rounded-2xl p-6 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground">
          {kicker}
        </span>
      </div>
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <ul className="space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function HomePage() {
  const t = await getTranslations('landing');

  return (
    <main className="bg-secondary">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
              {t('heroA')}
              <br />
              <span className="text-accent">{t('heroB')}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
              {t('heroSub')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button asChild size="lg" className="rounded-full text-base">
                <Link href="/sign-up">
                  {t('ctaPilot')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          <ReceiptMockup />
        </div>
      </section>

      {/* Tap. Gem. Færdig. */}
      <section className="py-16 bg-forest text-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-[11px] font-mono tracking-widest text-accent">
            {t('how')}
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {t('tapTitle')}
          </h2>
          <ol className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-4">
            {[t('tap1'), t('tap2'), t('tap3')].map((step, i) => (
              <li key={step} className="space-y-2">
                <span className="h-10 w-10 rounded-full bg-accent text-forest font-mono font-bold inline-flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-paper/80">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 gap-6">
          <FeatureCard
            icon={<FileDown className="h-5 w-5 text-accent" />}
            kicker={t('forBusiness')}
            title={t('pdfTitle')}
            bullets={[t('pdf1'), t('pdf2'), t('pdf3')]}
          />
          <FeatureCard
            icon={<Star className="h-5 w-5 text-accent" />}
            kicker={t('forBusiness')}
            title={t('reviewTitle')}
            bullets={[t('review1'), t('review2'), t('review3')]}
          />
          <FeatureCard
            icon={<Stamp className="h-5 w-5 text-accent" />}
            kicker={t('forBusiness')}
            title={t('loyaltyTitle')}
            bullets={[t('loyalty1'), t('loyalty2'), t('loyalty3')]}
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5 text-accent" />}
            kicker={t('forBusiness')}
            title={t('vatTitle')}
            bullets={[t('vat1'), t('vat2'), t('vat3')]}
          />
        </div>
      </section>

      {/* Old way / new way + price */}
      <section className="py-16 bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-8 space-y-2">
            <h3 className="text-2xl font-semibold tracking-tight text-muted-foreground line-through decoration-destructive/60">
              {t('oldWay')}
            </h3>
            <p className="text-muted-foreground">{t('oldWayBody')}</p>
          </div>
          <div className="rounded-2xl bg-forest text-paper p-8 space-y-4">
            <h3 className="text-2xl font-semibold tracking-tight">
              {t('newWay')}
            </h3>
            <p className="text-paper/80">{t('newWayBody')}</p>
            <div>
              <p className="text-[11px] font-mono tracking-widest text-accent">
                {t('pricePilot')}
              </p>
              <p className="text-4xl font-bold tracking-tight">
                {t('priceAmount')}
              </p>
              <p className="text-sm text-paper/70 mt-1">{t('priceNote')}</p>
            </div>
            <Button
              asChild
              size="lg"
              className="rounded-full bg-accent text-forest hover:bg-accent/90"
            >
              <Link href="/sign-up">
                {t('ctaPilot')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* EU/GDPR */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">{t('euTitle')}</h2>
          <p className="text-muted-foreground">{t('euBody')}</p>
        </div>
      </section>

      <footer className="py-10 border-t bg-paper">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-mono">© {new Date().getFullYear()} Tapbon</span>
          <div className="flex gap-4">
            <Link href="/sign-in" className="hover:text-foreground">
              {t('footerLogin')}
            </Link>
            <Link href="/sign-up" className="hover:text-foreground">
              {t('footerSignup')}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
