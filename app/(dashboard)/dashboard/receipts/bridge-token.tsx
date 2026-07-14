'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { generateDeviceToken } from '@/lib/receipts/actions';

/** Generate/rotate the bridge device token — plaintext is shown once. */
export function BridgeToken({ hasToken }: { hasToken: boolean }) {
  const t = useTranslations('bridge');
  const [token, setToken] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onGenerate = () =>
    startTransition(async () => {
      const result = await generateDeviceToken();
      if ('token' in result && result.token) setToken(result.token);
    });

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t('intro')}</p>
      {token ? (
        <div className="space-y-2">
          <code className="block break-all rounded-lg bg-secondary p-3 text-xs font-mono select-all">
            {token}
          </code>
          <p className="text-xs text-muted-foreground">{t('tokenOnce')}</p>
        </div>
      ) : (
        <Button onClick={onGenerate} disabled={pending} variant="outline">
          {pending
            ? t('generating')
            : hasToken
              ? t('rotate')
              : t('generate')}
        </Button>
      )}
      <p className="text-xs text-muted-foreground font-mono">
        POST /api/bridge/receipts
      </p>
    </div>
  );
}
