'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function PrintButton() {
  const t = useTranslations('stand');
  return (
    <Button onClick={() => window.print()} className="rounded-full print:hidden">
      {t('print')}
    </Button>
  );
}
