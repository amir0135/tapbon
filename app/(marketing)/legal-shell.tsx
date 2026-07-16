import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

/** Delt skal for legal-sider (specs/legal-pages.md) */
export function LegalShell({
  title,
  updated,
  children,
  crossLink,
}: {
  title: string;
  updated: string;
  children: ReactNode;
  crossLink: { href: string; label: string };
}) {
  return (
    <main className="min-h-dvh bg-paper">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Tapbon
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{updated}</p>
        <div className="prose-tapbon mt-8 space-y-8">{children}</div>
        <footer className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
          <Link href={crossLink.href} className="text-accent underline underline-offset-2">
            {crossLink.label}
          </Link>
        </footer>
      </article>
    </main>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-ink/80">{children}</div>
    </section>
  );
}

export async function currentLocale(): Promise<'da' | 'en'> {
  const locale = await getLocale();
  return locale === 'en' ? 'en' : 'da';
}
