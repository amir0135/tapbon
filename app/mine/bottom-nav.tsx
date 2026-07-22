'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ReceiptText, Ellipsis } from 'lucide-react';

/** Fast bund-navigation på /mine (Receiptile-mønster): flydende pille m/ to
 *  faner — Boner (arkivet) og Mere (hub). Capture er ikke relevant for Tapbon
 *  (boner kommer fra tap/print, ikke foto). */
export function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const onArchive = pathname === '/mine';

  const tab = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-1 rounded-full py-2.5 text-[10px] font-medium transition-colors ${
      active ? 'bg-mint-tint text-forest' : 'text-muted-foreground'
    }`;

  return (
    <nav
      aria-label={t('label')}
      className="fixed inset-x-0 bottom-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-xs print:hidden"
    >
      <div className="flex rounded-full bg-paper p-1.5 shadow-lg ring-1 ring-border/50">
        <Link href="/mine" className={tab(onArchive)}>
          <ReceiptText className="h-5 w-5" aria-hidden="true" />
          {t('receipts')}
        </Link>
        <Link href="/mine/mere" className={tab(!onArchive)}>
          <Ellipsis className="h-5 w-5" aria-hidden="true" />
          {t('more')}
        </Link>
      </div>
    </nav>
  );
}
