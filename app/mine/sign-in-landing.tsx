'use client';

import { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, ReceiptText } from 'lucide-react';
import { requestCustomerLogin, customerPasswordLogin } from './actions';

/** Konto-først login-landing på /mine (specs/customer-account.md v3).
 *  Magic link som primær vej; adgangskode som toggle. Ingen bundnav. */
export function SignInLanding() {
  const t = useTranslations('profile');
  const tSync = useTranslations('customerSync');
  const router = useRouter();
  const [usePassword, setUsePassword] = useState(false);

  const [loginState, loginAction, loginPending] = useActionState<
    { error?: string; success?: string },
    FormData
  >(requestCustomerLogin, {});
  const [pwState, pwAction, pwPending] = useActionState<
    { error?: string; success?: string },
    FormData
  >(async (prev, formData) => {
    const result = await customerPasswordLogin(prev, formData);
    if (result.success) router.refresh();
    return result;
  }, {});

  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-md p-4 pb-12 space-y-5">
        <header className="pt-4 space-y-1">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {tSync('landingKicker')}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {tSync('landingTitle')}
          </h1>
        </header>

        <section className="bg-paper rounded-2xl shadow-sm p-6 space-y-4">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-tint">
            <ReceiptText className="h-6 w-6 text-forest" aria-hidden="true" />
          </span>
          <div className="text-center space-y-1">
            <h2 className="font-semibold text-ink">{tSync('landingCardTitle')}</h2>
            <p className="text-sm text-muted-foreground">{tSync('landingCardSub')}</p>
          </div>

          {loginState.success ? (
            <p className="rounded-xl bg-mint-tint p-3 text-sm text-forest">
              {loginState.success}
            </p>
          ) : usePassword ? (
            <form action={pwAction} className="space-y-2">
              <input
                type="email"
                name="email"
                required
                placeholder={tSync('emailPlaceholder')}
                aria-label={tSync('emailPlaceholder')}
                autoComplete="email"
                className="w-full rounded-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <input
                type="password"
                name="password"
                required
                placeholder={t('passwordPlaceholder')}
                aria-label={t('passwordPlaceholder')}
                autoComplete="current-password"
                className="w-full rounded-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button
                type="submit"
                disabled={pwPending}
                className="w-full rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {pwPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {t('loginButton')}
              </button>
              {pwState.error && (
                <p className="text-sm text-red-500">{pwState.error}</p>
              )}
            </form>
          ) : (
            <form action={loginAction} className="space-y-2">
              <input
                type="email"
                name="email"
                required
                placeholder={tSync('emailPlaceholder')}
                aria-label={tSync('emailPlaceholder')}
                autoComplete="email"
                className="w-full rounded-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button
                type="submit"
                disabled={loginPending}
                className="w-full rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {loginPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {tSync('sendLink')}
              </button>
              {loginState.error && (
                <p className="text-sm text-red-500">{loginState.error}</p>
              )}
            </form>
          )}

          {!loginState.success && (
            <button
              onClick={() => setUsePassword((v) => !v)}
              className="mx-auto block text-sm font-medium text-forest underline-offset-2 hover:underline"
            >
              {usePassword ? t('useMagicLink') : t('usePassword')}
            </button>
          )}
        </section>

        <p className="text-center text-xs text-muted-foreground">
          {tSync('landingNote')}
        </p>
      </div>
    </main>
  );
}
