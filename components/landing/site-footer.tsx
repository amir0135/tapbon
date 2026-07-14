import Link from 'next/link';
import { Logo } from './site-header';

export type FooterStrings = {
  tagline: string;
  company: string[];
  columns: {
    heading: string;
    links: { label: string; href: string }[];
  }[];
  disclaimer: string;
  copyright: string;
  owned: string;
};

export function SiteFooter({ s }: { s: FooterStrings }) {
  return (
    <footer data-header-dark className="bg-ink-deep text-paper">
      <div className="mx-auto max-w-[1268px] px-6 py-16 md:px-[86px] md:py-20">
        <div className="grid gap-12 md:grid-cols-[minmax(0,340px)_1fr] md:gap-24">
          <div className="space-y-5">
            <Logo onDark />
            <p className="text-[15px] leading-relaxed text-paper/70">{s.tagline}</p>
            <p className="text-[13px] leading-relaxed text-paper/40">
              {s.company.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {s.columns.map((col) => (
              <nav key={col.heading} aria-label={col.heading} className="space-y-4">
                <h4 className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-paper/45">
                  {col.heading}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="rounded text-[14.5px] text-paper/80 transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <p className="mt-14 max-w-[680px] text-[12.5px] leading-relaxed text-paper/35">
          {s.disclaimer}
        </p>
        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-[12.5px] text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <span>{s.copyright}</span>
          <span>{s.owned}</span>
        </div>
      </div>
    </footer>
  );
}
