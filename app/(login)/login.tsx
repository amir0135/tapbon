'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';

/** Receiptile-style dark auth card — spec: specs/auth-pages.md */
export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  const switchHref = `${mode === 'signin' ? '/sign-up' : '/sign-in'}${
    redirect ? `?redirect=${redirect}` : ''
  }${priceId ? `&priceId=${priceId}` : ''}`;

  const inputClass =
    'block w-full rounded-2xl border border-white/12 bg-ink-deep px-5 py-4 text-base text-paper placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-mint/60 focus:border-transparent';

  const ssoButtonClass =
    'flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-white/10';

  return (
    <main className="min-h-dvh bg-ink-deep flex items-center justify-center sm:p-6">
      <div className="w-full max-w-xl bg-ink-raised sm:rounded-3xl sm:ring-1 sm:ring-white/10 px-6 py-12 sm:px-14 sm:py-14">
        {/* Wordmark */}
        <div className="text-center space-y-1">
          <Link
            href="/"
            className="font-sans text-3xl font-bold tracking-tight text-paper"
          >
            {tc('appName')}
          </Link>
        </div>

        {/* Kicker + heading */}
        <div className="mt-8 text-center space-y-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            {mode === 'signin' ? t('signInKicker') : t('signUpKicker')}
          </p>
          <h1 className="font-sans text-3xl font-bold text-paper">
            {mode === 'signin' ? t('signInTitle') : t('signUpTitle')}
          </h1>
          <p className="text-sm text-white/50">
            {mode === 'signin' ? t('signInSub') : t('signUpSub')}
          </p>
        </div>

        <form className="mt-10 space-y-6" action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ''} />
          <input type="hidden" name="priceId" value={priceId || ''} />
          <input type="hidden" name="inviteId" value={inviteId || ''} />

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-white/40"
            >
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.email}
              required
              maxLength={50}
              className={inputClass}
              placeholder={t('emailPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-white/40"
              >
                {t('password')}
              </label>
              {mode === 'signin' && (
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-mint hover:text-mint/80"
                >
                  {t('forgotPassword')}
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                defaultValue={state.password}
                required
                minLength={8}
                maxLength={100}
                className={`${inputClass} pr-14`}
                placeholder={t('passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                className="absolute inset-y-0 right-0 flex items-center px-5 text-white/40 hover:text-white/70"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {state?.error && (
            <div className="space-y-1" role="alert">
              <p className="text-sm text-red-400">{state.error}</p>
              {mode === 'signin' && (
                <p className="text-sm text-white/50">
                  {t('signInFailHint')}{' '}
                  <Link
                    href={switchHref}
                    className="font-semibold text-mint hover:text-mint/80"
                  >
                    {t('createLink')}
                  </Link>
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-forest py-4 text-base font-semibold text-paper transition-colors hover:bg-forest/85 focus:outline-none focus:ring-2 focus:ring-mint/60 disabled:opacity-60 flex items-center justify-center"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                {t('loading')}
              </>
            ) : mode === 'signin' ? (
              t('submitSignIn')
            ) : (
              t('submitSignUp')
            )}
          </button>
        </form>

        {/* Divider + SSO-providere + switch */}
        <div className="mt-10 flex items-center gap-4" aria-hidden="true">
          <div className="h-px flex-1 bg-white/10" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/30">
            {t('or')}
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="mt-6 space-y-3">
          <a href="/api/auth/google" className={ssoButtonClass}>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {t('continueGoogle')}
          </a>

          <a href="/api/auth/microsoft" className={ssoButtonClass}>
            <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true">
              <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
              <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
              <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
              <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
            </svg>
            {t('continueMicrosoft')}
          </a>
        </div>

        <p className="mt-8 text-center text-sm text-white/50">
          {mode === 'signin' ? t('noAccount') : t('hasAccount')}{' '}
          <Link
            href={switchHref}
            className="font-semibold text-mint hover:text-mint/80"
          >
            {mode === 'signin' ? t('createLink') : t('signInLink')}
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-white/35">
          {t.rich('legalLine', {
            terms: (chunks) => (
              <Link href="/vilkaar" className="underline underline-offset-2 hover:text-white/60">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privatliv" className="underline underline-offset-2 hover:text-white/60">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </main>
  );
}
