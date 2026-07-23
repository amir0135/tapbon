'use client';

import { useState, useActionState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  Loader2,
  Nfc,
  Pencil,
  Plus,
  QrCode,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createTerminal,
  generateDeviceToken,
  renameTerminal,
} from '@/lib/receipts/actions';

const ONLINE_MS = 3 * 60 * 1000;

type Device = {
  id: number;
  name: string;
  publicId: string;
  lastSeenAt: string | null;
  hasToken: boolean;
  receiptCount: number;
};

function StatusChip({ lastSeenAt }: { lastSeenAt: string | null }) {
  const t = useTranslations('devices');
  const locale = useLocale();
  if (!lastSeenAt) {
    return (
      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
        {t('neverSeen')}
      </span>
    );
  }
  const seen = new Date(lastSeenAt);
  if (Date.now() - seen.getTime() < ONLINE_MS) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-mint-tint px-2 py-0.5 text-xs font-medium text-forest">
        <span className="h-1.5 w-1.5 rounded-full bg-mint" />
        {t('online')}
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
      {t('lastSeen', {
        time: new Intl.DateTimeFormat(locale, {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(seen),
      })}
    </span>
  );
}

function DeviceCard({ device }: { device: Device }) {
  const t = useTranslations('devices');
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tokenPending, startToken] = useTransition();

  const [renameState, renameAction, renamePending] = useActionState<
    { error?: string; success?: boolean },
    FormData
  >(async (prev, formData) => {
    const result = await renameTerminal(prev, formData);
    if (result.success) setEditing(false);
    return result;
  }, {});

  const rotate = () => {
    if (device.hasToken && !window.confirm(t('rotateConfirm'))) return;
    startToken(async () => {
      const result = await generateDeviceToken(device.id);
      if (result.success) {
        setToken(result.token);
        router.refresh();
      }
    });
  };

  const copy = () => {
    if (!token) return;
    navigator.clipboard?.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
            <Nfc className="h-4 w-4 text-forest" aria-hidden="true" />
          </span>
          {editing ? (
            <form action={renameAction} className="flex flex-1 items-center gap-2">
              <input type="hidden" name="terminalId" value={device.id} />
              <Input
                name="name"
                defaultValue={device.name}
                maxLength={100}
                autoFocus
                className="h-9"
              />
              <Button type="submit" size="sm" disabled={renamePending}>
                {renamePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  t('save')
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditing(false)}
              >
                {t('cancel')}
              </Button>
            </form>
          ) : (
            <>
              <CardTitle className="flex-1 text-base">{device.name}</CardTitle>
              <button
                onClick={() => setEditing(true)}
                aria-label={t('rename')}
                className="text-muted-foreground hover:text-ink"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <StatusChip lastSeenAt={device.lastSeenAt} />
            </>
          )}
        </div>
        {renameState.error && (
          <p className="text-sm text-red-500">{t('invalidName')}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-mono text-xs text-muted-foreground">
          {device.publicId} · {t('receiptCount', { count: device.receiptCount })}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/t/${device.publicId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            {t('openTapPage')}
          </Link>
          <Link
            href={`/t/${device.publicId}/stand`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          >
            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
            {t('openStand')}
          </Link>
          <span className="ml-auto inline-flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                device.hasToken
                  ? 'bg-mint-tint text-forest'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {device.hasToken ? t('tokenSet') : t('noToken')}
            </span>
            <Button size="sm" variant="outline" onClick={rotate} disabled={tokenPending}>
              {tokenPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <KeyRound className="h-4 w-4" aria-hidden="true" />
              )}
              {device.hasToken ? t('rotateToken') : t('generateToken')}
            </Button>
          </span>
        </div>

        {token && (
          <div className="rounded-xl bg-gray-50 border border-border p-3 space-y-1.5">
            <p className="text-xs font-medium text-ink">{t('tokenOnce')}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all font-mono text-xs">{token}</code>
              <Button size="sm" variant="ghost" onClick={copy} aria-label={t('copy')}>
                {copied ? (
                  <Check className="h-4 w-4 text-forest" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Enheder-listen + opret-formular (specs/merchant-devices.md). */
export function DevicesList({ devices }: { devices: Device[] }) {
  const t = useTranslations('devices');
  const [createState, createAction, createPending] = useActionState<
    { error?: string; success?: boolean },
    FormData
  >(createTerminal, {});

  return (
    <div className="space-y-4 max-w-2xl">
      {devices.map((d) => (
        <DeviceCard key={d.id} device={d} />
      ))}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('addTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="flex items-center gap-2">
            <Input
              name="name"
              required
              maxLength={100}
              placeholder={t('namePlaceholder')}
              className="h-9 max-w-xs"
            />
            <Button type="submit" size="sm" disabled={createPending}>
              {createPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              {t('add')}
            </Button>
          </form>
          {createState.error && (
            <p className="mt-2 text-sm text-red-500">{t('invalidName')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
