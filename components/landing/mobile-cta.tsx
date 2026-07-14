'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/** Sticky bottom CTA bar on small screens, hidden once the order section is in view. */
export function MobileCta({ label }: { label: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById('kom-i-gang');
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: '0px 0px -40% 0px' }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-4 bottom-4 z-40 transition-all duration-300 md:hidden ${
        hidden ? 'pointer-events-none translate-y-24 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <Link
        href="#kom-i-gang"
        className="flex h-[52px] items-center justify-center rounded-full bg-ink-deep text-[15px] font-semibold text-paper shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint"
      >
        {label}
      </Link>
    </div>
  );
}
