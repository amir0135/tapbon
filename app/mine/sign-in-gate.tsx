import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

/** Fælles logget ud-tilstand for /mine-undersider — kort med ikon + CTA
 *  i stedet for nøgen tekst (samme kort-sprog som resten af /mine). */
export function SignInGate({
  title,
  message,
  cta,
  backLabel,
}: {
  title: string;
  message: string;
  cta: string;
  backLabel: string;
}) {
  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-md p-4 pb-12 space-y-5">
        <header className="relative pt-4 text-center">
          <Link
            href="/mine"
            aria-label={backLabel}
            className="absolute left-0 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper shadow-sm text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </header>

        <section className="bg-paper rounded-2xl shadow-sm p-8 text-center space-y-4">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-tint">
            <Lock className="h-6 w-6 text-forest" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted-foreground">{message}</p>
          <Link
            href="/mine/profil"
            className="inline-block rounded-full bg-forest px-6 py-3 text-sm font-semibold text-paper"
          >
            {cta}
          </Link>
        </section>
      </div>
    </main>
  );
}
