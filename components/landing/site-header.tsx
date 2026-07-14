'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint">
        <span className="h-2.5 w-2.5 rounded-full bg-paper" />
      </span>
      <span
        className={`text-[19px] font-semibold tracking-tight transition-colors duration-300 ${onDark ? 'text-paper' : 'text-ink'}`}
      >
        Tapbon
      </span>
    </span>
  );
}

/**
 * Fixed header like the reference: transparent bar whose logo, text link and
 * CTA pill invert when the bar floats over a dark band. Dark bands opt in
 * with a `data-header-dark` attribute.
 */
export function SiteHeader({
  signup,
  order
}: {
  signup: string;
  order: string;
}) {
  const [onDark, setOnDark] = useState(false);

  useEffect(() => {
    let bands: { top: number; bottom: number }[] = [];
    let raf = 0;

    const check = () => {
      const probe = window.scrollY + 46; // vertical center of the bar
      setOnDark(bands.some((b) => probe >= b.top && probe < b.bottom));
    };

    const measure = () => {
      bands = Array.from(
        document.querySelectorAll<HTMLElement>('[data-header-dark]')
      ).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
      });
      check();
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };

    measure();
    // re-measure once layout settles (fonts/images) and on resize
    const t = setTimeout(measure, 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <header className="pointer-events-none sticky top-0 z-40 h-0">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:h-[92px] md:px-[86px]">
        <Link
          href="/"
          className="pointer-events-auto rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint"
        >
          <Logo onDark={onDark} />
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/sign-in"
            className={cn(
              'pointer-events-auto hidden rounded text-[15px] font-semibold transition-colors duration-300 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint sm:block',
              onDark ? 'text-paper' : 'text-ink'
            )}
          >
            {signup}
          </Link>
          <Link
            href="#kom-i-gang"
            className={cn(
              'pointer-events-auto inline-flex h-12 items-center justify-center rounded-full px-[22px] text-[14.5px] font-semibold tracking-[0.01em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint',
              onDark
                ? 'bg-paper text-ink hover:bg-paper/90'
                : 'bg-ink text-paper hover:bg-ink/90'
            )}
          >
            {order}
          </Link>
        </div>
      </div>
    </header>
  );
}
