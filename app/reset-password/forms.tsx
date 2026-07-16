'use client';

import Link from 'next/link';
import { useActionState, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { forgotPassword, resetPassword } from '../(login)/actions';

type ActionState = { error?: string; success?: string };

const inputClass =
  'block w-full rounded-2xl border border-white/12 bg-ink-deep px-5 py-4 text-base text-paper placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-mint/60 focus:border-transparent';
const labelClass =
  'block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-white/40';

function Shell({ children }: { children: React.ReactNode }) {
  const tc = useTranslations('common');
  return (
    <main className="min-h-dvh bg-ink-deep flex items-center justify-center sm:p-6">
      <div className="w-full max-w-xl bg-ink-raised sm:rounded-3xl sm:ring-1 sm:ring-white/10 px-6 py-12 sm:px-14 sm:py-14">
        <div className="text-center">
          <Link href="/" className="font-sans text-3xl font-bold tracking-tight text-paper">
            {tc('appName')}
          </Link>
        </div>
        {children}
      </div>
    </main>
  );
}

export function ForgotPasswordForm() {
  const t = useTranslations('resetPw');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    forgotPassword,
    {}
  );

  return (
    <Shell>
      <div className="mt-8 text-center space-y-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          {t('kicker')}
        </p>
        <h1 className="font-sans text-3xl font-bold text-paper">{t('forgotTitle')}</h1>
        <p className="text-sm text-white/50">{t('forgotSub')}</p>
      </div>

      {state.success ? (
        <p className="mt-10 rounded-2xl bg-mint/10 border border-mint/30 p-5 text-center text-sm text-paper">
          {state.success}
        </p>
      ) : (
        <form className="mt-10 space-y-6" action={formAction}>
          <div className="space-y-2">
            <label htmlFor="email" className={labelClass}>
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
              placeholder={t('emailPlaceholder')}
            />
          </div>
          {state.error && (
            <p className="text-sm text-red-400" role="alert">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-forest py-4 text-base font-semibold text-paper transition-colors hover:bg-forest/85 disabled:opacity-60 flex items-center justify-center"
          >
            {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />}
            {t('sendLink')}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-white/50">
        <Link href="/sign-in" className="font-semibold text-mint hover:text-mint/80">
          {t('backToSignIn')}
        </Link>
      </p>
    </Shell>
  );
}

function ResetInner() {
  const t = useTranslations('resetPw');
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [show, setShow] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resetPassword,
    {}
  );

  return (
    <Shell>
      <div className="mt-8 text-center space-y-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          {t('kicker')}
        </p>
        <h1 className="font-sans text-3xl font-bold text-paper">{t('resetTitle')}</h1>
        <p className="text-sm text-white/50">{t('resetSub')}</p>
      </div>

      <form className="mt-10 space-y-6" action={formAction}>
        <input type="hidden" name="token" value={token} />
        <div className="space-y-2">
          <label htmlFor="password" className={labelClass}>
            {t('newPassword')}
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={100}
              className={`${inputClass} pr-14`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? t('hidePassword') : t('showPassword')}
              className="absolute inset-y-0 right-0 flex items-center px-5 text-white/40 hover:text-white/70"
            >
              {show ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className={labelClass}>
            {t('confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={100}
            className={inputClass}
          />
        </div>
        {state.error && (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-forest py-4 text-base font-semibold text-paper transition-colors hover:bg-forest/85 disabled:opacity-60 flex items-center justify-center"
        >
          {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />}
          {t('setPassword')}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-white/50">
        <Link href="/sign-in" className="font-semibold text-mint hover:text-mint/80">
          {t('backToSignIn')}
        </Link>
      </p>
    </Shell>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense>
      <ResetInner />
    </Suspense>
  );
}
