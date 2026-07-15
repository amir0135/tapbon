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
            <label
              htmlFor="password"
              className="block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-white/40"
            >
              {t('password')}
            </label>
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
            <p className="text-sm text-red-400" role="alert">
              {state.error}
            </p>
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

        {/* Divider + switch */}
        <div className="mt-10 flex items-center gap-4" aria-hidden="true">
          <div className="h-px flex-1 bg-white/10" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/30">
            {t('or')}
          </span>
          <div className="h-px flex-1 bg-white/10" />
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
      </div>
    </main>
  );
}
