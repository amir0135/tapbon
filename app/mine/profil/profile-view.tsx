'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Globe,
  KeyRound,
  Landmark,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Send,
  Shield,
  Sparkles,
  User,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  readAutoSave,
  setAutoSave,
  readSaveConfirm,
  setSaveConfirm,
  readSaveSound,
  setSaveSound,
} from '@/lib/archive/local';
import { BottomNav } from '../bottom-nav';
import {
  requestCustomerLogin,
  customerLogout,
  customerPasswordLogin,
  deleteCustomerAccount,
  updateCustomerProfile,
  setLocalePreference,
  setCustomerPassword,
  setAccountingForwards,
} from '../actions';

type Customer = {
  email: string;
  name: string | null;
  phone: string | null;
  hasPassword: boolean;
  forwards: { economic?: string; dinero?: string; billy?: string };
};

function initials(customer: Customer) {
  const source = customer.name?.trim() || customer.email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
      {children}
    </h2>
  );
}

function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-tint">
      {children}
    </span>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        on ? 'bg-mint' : 'bg-border'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-paper shadow transition-all ${
          on ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

/** Kundeprofil — konto, plan, præferencer, privatliv (specs/customer-profile.md). */
export function ProfileView({
  customer,
  locale,
  version,
}: {
  customer: Customer | null;
  locale: string;
  version: string;
}) {
  const t = useTranslations('profile');
  const tSync = useTranslations('customerSync');
  const router = useRouter();
  const [busy, startTransition] = useTransition();

  const [autoSave, setAutoSaveState] = useState(true);
  const [saveConfirm, setSaveConfirmState] = useState(true);
  const [saveSound, setSaveSoundState] = useState(true);
  useEffect(() => {
    setAutoSaveState(readAutoSave());
    setSaveConfirmState(readSaveConfirm());
    setSaveSoundState(readSaveSound());
  }, []);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [usePasswordLogin, setUsePasswordLogin] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [showAccounting, setShowAccounting] = useState(false);

  const [profileState, profileAction, profilePending] = useActionState<
    { error?: string; success?: string },
    FormData
  >(updateCustomerProfile, {});
  const [loginState, loginAction, loginPending] = useActionState<
    { error?: string; success?: string },
    FormData
  >(requestCustomerLogin, {});
  const [pwLoginState, pwLoginAction, pwLoginPending] = useActionState<
    { error?: string; success?: string },
    FormData
  >(async (prev, formData) => {
    const result = await customerPasswordLogin(prev, formData);
    if (result.success) router.refresh();
    return result;
  }, {});
  const [passwordState, passwordAction, passwordPending] = useActionState<
    { error?: string; success?: string },
    FormData
  >(setCustomerPassword, {});
  const [forwardsState, forwardsAction, forwardsPending] = useActionState<
    { error?: string; success?: string },
    FormData
  >(setAccountingForwards, {});

  // Luk redigér-formen når gem lykkes
  useEffect(() => {
    if (profileState.success) setEditingAccount(false);
  }, [profileState]);

  const forwardsCount = customer
    ? [customer.forwards.economic, customer.forwards.dinero, customer.forwards.billy].filter(Boolean).length
    : 0;

  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-md p-4 pb-28 space-y-5">
        <header className="relative pt-4 space-y-1">
          <Link
            href="/mine/mere"
            aria-label={t('back')}
            className="absolute right-0 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper shadow-sm text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('kicker')}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        </header>

        {customer ? (
          <>
            {/* Konto */}
            <section className="space-y-2">
              <SectionLabel>{t('accountSection')}</SectionLabel>
              <div className="bg-paper rounded-2xl shadow-sm divide-y divide-border/60">
                <div className="flex items-center gap-3 p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-paper font-semibold">
                    {initials(customer)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">
                      {customer.name || t('noName')}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {customer.email}
                    </p>
                  </div>
                </div>
                {editingAccount ? (
                  <form action={profileAction} className="p-4 space-y-3">
                    <label className="block space-y-1">
                      <span className="text-sm font-medium text-ink">{t('nameLabel')}</span>
                      <input
                        name="name"
                        defaultValue={customer.name ?? ''}
                        maxLength={100}
                        autoFocus
                        placeholder={t('namePlaceholder')}
                        className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-sm font-medium text-ink">{t('phoneLabel')}</span>
                      <input
                        name="phone"
                        type="tel"
                        defaultValue={customer.phone ?? ''}
                        maxLength={30}
                        placeholder={t('phonePlaceholder')}
                        className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={profilePending}
                        className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-60 inline-flex items-center gap-2"
                      >
                        {profilePending && (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        )}
                        {t('save')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAccount(false)}
                        className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-ink"
                      >
                        {t('cancel')}
                      </button>
                      {profileState.error && (
                        <p className="text-sm text-red-500">{profileState.error}</p>
                      )}
                    </div>
                  </form>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingAccount(true)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <IconTile>
                        <User className="h-4 w-4 text-forest" aria-hidden="true" />
                      </IconTile>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-ink">{t('nameLabel')}</span>
                        <span className="block text-sm text-muted-foreground truncate">
                          {customer.name || t('namePlaceholder')}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setEditingAccount(true)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <IconTile>
                        <Phone className="h-4 w-4 text-forest" aria-hidden="true" />
                      </IconTile>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-ink">{t('phoneLabel')}</span>
                        <span className="block text-sm text-muted-foreground truncate">
                          {customer.phone || t('phonePlaceholder')}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </>
                )}
                <div className="flex items-center gap-3 p-4">
                  <IconTile>
                    <Mail className="h-4 w-4 text-forest" aria-hidden="true" />
                  </IconTile>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{t('emailLabel')}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {customer.email}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Plan */}
            <section className="space-y-2">
              <SectionLabel>{t('planSection')}</SectionLabel>
              <div className="rounded-2xl bg-forest text-paper shadow-sm p-5">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/60">
                  {t('planLabel')}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {t('planName')}
                </p>
                <p className="mt-1 text-sm text-paper/80">{t('planBody')}</p>
              </div>
            </section>

            {/* Sikkerhed — valgfri adgangskode oven på magic link */}
            <section className="space-y-2">
              <SectionLabel>{t('securitySection')}</SectionLabel>
              <div className="bg-paper rounded-2xl shadow-sm">
                <button
                  onClick={() => setShowPasswordForm((v) => !v)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <IconTile>
                    <KeyRound className="h-4 w-4 text-forest" aria-hidden="true" />
                  </IconTile>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-ink">
                      {customer.hasPassword ? t('changePasswordLabel') : t('setPasswordLabel')}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {t('setPasswordSub')}
                    </span>
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      showPasswordForm ? 'rotate-90' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {showPasswordForm && (
                  <form action={passwordAction} className="border-t border-border/60 p-4 space-y-3">
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={8}
                      maxLength={100}
                      autoComplete="new-password"
                      placeholder={t('passwordPlaceholder')}
                      aria-label={t('passwordPlaceholder')}
                      className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <input
                      type="password"
                      name="confirm"
                      required
                      minLength={8}
                      maxLength={100}
                      autoComplete="new-password"
                      placeholder={t('passwordConfirmPlaceholder')}
                      aria-label={t('passwordConfirmPlaceholder')}
                      className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={passwordPending}
                        className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-60 inline-flex items-center gap-2"
                      >
                        {passwordPending && (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        )}
                        {t('save')}
                      </button>
                      {passwordState.success && (
                        <p className="text-sm text-forest">{passwordState.success}</p>
                      )}
                      {passwordState.error && (
                        <p className="text-sm text-red-500">{passwordState.error}</p>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* Regnskab — auto-forward til e-conomic/Dinero/Billy */}
            <section className="space-y-2">
              <SectionLabel>{t('accountingSection')}</SectionLabel>
              <div className="bg-paper rounded-2xl shadow-sm">
                <button
                  onClick={() => setShowAccounting((v) => !v)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <IconTile>
                    <Landmark className="h-4 w-4 text-forest" aria-hidden="true" />
                  </IconTile>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-ink">
                      {t('accountingLabel')}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {t('accountingSub')}
                    </span>
                  </span>
                  {forwardsCount > 0 ? (
                    <span className="shrink-0 rounded-full bg-mint-tint px-2.5 py-1 text-xs font-semibold text-forest">
                      {t('accountingConnected', { count: forwardsCount })}
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {t('accountingNotConnected')}
                    </span>
                  )}
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      showAccounting ? 'rotate-90' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {showAccounting && (
                  <form
                    action={forwardsAction}
                    className="border-t border-border/60 p-4 space-y-3"
                  >
                    <p className="text-sm text-muted-foreground">{t('accountingIntro')}</p>
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-ink">e-conomic</span>
                  <input
                    type="email"
                    name="economic"
                    defaultValue={customer.forwards.economic ?? ''}
                    placeholder={t('economicPlaceholder')}
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <span className="block text-xs text-muted-foreground">
                    {t('economicHint')}
                  </span>
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-ink">Dinero</span>
                  <input
                    type="email"
                    name="dinero"
                    defaultValue={customer.forwards.dinero ?? ''}
                    placeholder={t('dineroPlaceholder')}
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <span className="block text-xs text-muted-foreground">
                    {t('dineroHint')}
                  </span>
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-ink">Billy</span>
                  <input
                    type="email"
                    name="billy"
                    defaultValue={customer.forwards.billy ?? ''}
                    placeholder={t('billyPlaceholder')}
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <span className="block text-xs text-muted-foreground">
                    {t('billyHint')}
                  </span>
                </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={forwardsPending}
                        className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-60 inline-flex items-center gap-2"
                      >
                        {forwardsPending && (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        )}
                        {t('save')}
                      </button>
                      {forwardsState.success && (
                        <p className="text-sm text-forest">{forwardsState.success}</p>
                      )}
                      {forwardsState.error && (
                        <p className="text-sm text-red-500">{forwardsState.error}</p>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </section>
          </>
        ) : (
          /* Logget ud — magic-link pitch (genbruger customerSync-flowet) */
          <section className="bg-paper rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              <IconTile>
                <User className="h-4 w-4 text-forest" aria-hidden="true" />
              </IconTile>
              <div>
                <p className="font-semibold text-ink">{tSync('pitchTitle')}</p>
                <p className="text-sm text-muted-foreground">{tSync('pitchSub')}</p>
              </div>
            </div>
            {loginState.success ? (
              <p className="rounded-xl bg-mint-tint p-3 text-sm text-forest">
                {loginState.success}
              </p>
            ) : (
              <form action={loginAction} className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={tSync('emailPlaceholder')}
                  aria-label={tSync('emailPlaceholder')}
                  className="min-w-0 flex-1 rounded-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button
                  type="submit"
                  disabled={loginPending}
                  className="shrink-0 rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {loginPending && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {tSync('sendLink')}
                </button>
              </form>
            )}
            {loginState.error && (
              <p className="text-sm text-red-500">{loginState.error}</p>
            )}
            {/* Alternativ: log ind med adgangskode (hvis man har sat en) */}
            {!loginState.success && (
              <button
                onClick={() => setUsePasswordLogin((v) => !v)}
                className="text-sm font-medium text-forest underline-offset-2 hover:underline"
              >
                {usePasswordLogin ? t('useMagicLink') : t('usePassword')}
              </button>
            )}
            {usePasswordLogin && !loginState.success && (
              <form action={pwLoginAction} className="space-y-2">
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
                  disabled={pwLoginPending}
                  className="w-full rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {pwLoginPending && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {t('loginButton')}
                </button>
                {pwLoginState.error && (
                  <p className="text-sm text-red-500">{pwLoginState.error}</p>
                )}
              </form>
            )}
          </section>
        )}

        {/* Præferencer */}
        <section className="space-y-2">
          <SectionLabel>{t('preferencesSection')}</SectionLabel>
          <div className="bg-paper rounded-2xl shadow-sm divide-y divide-border/60">
            <div className="flex items-center gap-3 p-4">
              <IconTile>
                <Globe className="h-4 w-4 text-forest" aria-hidden="true" />
              </IconTile>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{t('languageLabel')}</p>
                <p className="text-sm text-muted-foreground">{t('languageSub')}</p>
              </div>
              <div
                className="grid grid-cols-2 gap-1 rounded-full bg-canvas p-1"
                role="radiogroup"
                aria-label={t('languageLabel')}
              >
                {(['da', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    role="radio"
                    aria-checked={locale === l}
                    disabled={busy}
                    onClick={() =>
                      startTransition(async () => {
                        await setLocalePreference(l);
                        router.refresh();
                      })
                    }
                    className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                      locale === l
                        ? 'bg-ink text-paper'
                        : 'text-muted-foreground hover:text-ink'
                    }`}
                  >
                    {l === 'da' ? 'DA' : 'EN'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <IconTile>
                <Zap className="h-4 w-4 text-forest" aria-hidden="true" />
              </IconTile>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{t('autoSaveLabel')}</p>
                <p className="text-sm text-muted-foreground">{t('autoSaveSub')}</p>
              </div>
              <Toggle
                on={autoSave}
                label={t('autoSaveLabel')}
                onChange={(next) => {
                  setAutoSave(next);
                  setAutoSaveState(next);
                }}
              />
            </div>
            <div className="flex items-center gap-3 p-4">
              <IconTile>
                <Sparkles className="h-4 w-4 text-forest" aria-hidden="true" />
              </IconTile>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{t('saveConfirmLabel')}</p>
                <p className="text-sm text-muted-foreground">{t('saveConfirmSub')}</p>
              </div>
              <Toggle
                on={saveConfirm}
                label={t('saveConfirmLabel')}
                onChange={(next) => {
                  setSaveConfirm(next);
                  setSaveConfirmState(next);
                }}
              />
            </div>
            <div className="flex items-center gap-3 p-4">
              <IconTile>
                <Volume2 className="h-4 w-4 text-forest" aria-hidden="true" />
              </IconTile>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{t('saveSoundLabel')}</p>
                <p className="text-sm text-muted-foreground">{t('saveSoundSub')}</p>
              </div>
              <Toggle
                on={saveSound}
                label={t('saveSoundLabel')}
                onChange={(next) => {
                  setSaveSound(next);
                  setSaveSoundState(next);
                }}
              />
            </div>
          </div>
        </section>

        {/* Data & privatliv */}
        <section className="space-y-2">
          <SectionLabel>{t('privacySection')}</SectionLabel>
          <div className="bg-paper rounded-2xl shadow-sm divide-y divide-border/60">
            <a href="mailto:hej@tapbon.dk" className="flex items-center gap-3 p-4">
              <IconTile>
                <Send className="h-4 w-4 text-forest" aria-hidden="true" />
              </IconTile>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{t('supportLabel')}</p>
                <p className="text-sm text-muted-foreground">hej@tapbon.dk</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </a>
            <Link href="/privatliv" className="flex items-center gap-3 p-4">
              <IconTile>
                <Shield className="h-4 w-4 text-forest" aria-hidden="true" />
              </IconTile>
              <p className="flex-1 text-sm font-medium text-ink">{t('privacyLabel')}</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Link>
            <Link href="/vilkaar" className="flex items-center gap-3 p-4">
              <IconTile>
                <FileText className="h-4 w-4 text-forest" aria-hidden="true" />
              </IconTile>
              <p className="flex-1 text-sm font-medium text-ink">{t('termsLabel')}</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Om + handlinger */}
        <section className="space-y-2">
          <SectionLabel>{t('aboutSection')}</SectionLabel>
          <div className="bg-paper rounded-2xl shadow-sm divide-y divide-border/60">
            <div className="flex items-center gap-3 p-4">
              <IconTile>
                <Sparkles className="h-4 w-4 text-forest" aria-hidden="true" />
              </IconTile>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Tapbon</p>
                <p className="text-sm text-muted-foreground">{t('aboutTagline')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('versionLabel', { version })}
                </p>
              </div>
            </div>
            {customer && (
              <>
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await customerLogout();
                      router.push('/mine');
                      router.refresh();
                    })
                  }
                  disabled={busy}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <IconTile>
                    <LogOut className="h-4 w-4 text-forest" aria-hidden="true" />
                  </IconTile>
                  <p className="text-sm font-medium text-ink">{tSync('logout')}</p>
                </button>
                <button
                  onClick={() => {
                    if (!window.confirm(tSync('deleteConfirm'))) return;
                    startTransition(async () => {
                      await deleteCustomerAccount();
                      router.push('/mine');
                      router.refresh();
                    });
                  }}
                  disabled={busy}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <LogOut className="h-4 w-4 text-red-500" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-medium text-red-500">
                    {tSync('deleteAccount')}
                  </p>
                </button>
              </>
            )}
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground">{t('footer')}</p>
      </div>
      <BottomNav />
    </main>
  );
}
