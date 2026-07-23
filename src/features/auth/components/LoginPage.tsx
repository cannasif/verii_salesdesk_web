import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, Trans } from 'react-i18next';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { loginRequestSchema } from '../types/auth';
import type { z } from 'zod';
import { useLogin } from '../hooks/useLogin';
import { useBranches } from '../hooks/useBranches';
import { useAuthStore } from '@/stores/auth-store';
import { isTokenValid } from '@/utils/jwt';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { clearPerfMarks, perfMark, perfMeasureOnNextPaint } from '@/lib/perf-metrics';
import {
  AUTH_AUTOFILL_CSS,
  AUTH_CARD,
  AUTH_CARD_ANIMATE,
  AUTH_CARD_EYEBROW,
  AUTH_CARD_TITLE,
  AUTH_CHECKBOX_LABEL,
  AUTH_FORM_COLUMN,
  AUTH_HERO_COLUMN,
  AUTH_ICON,
  AUTH_ICON_INVALID,
  AUTH_INPUT,
  AUTH_INPUT_INVALID,
  AUTH_LAYOUT,
  AUTH_LINK,
  AUTH_MOBILE_HERO,
  AUTH_PRIMARY_BUTTON,
  AUTH_SECURE_FOOTER,
  AUTH_SELECT_CONTENT,
  AUTH_SELECT_ITEM,
  AUTH_SELECT_TRIGGER,
  AUTH_SHELL,
  AUTH_SOCIAL_BUTTON,
  AUTH_SLOGAN_ACCENT,
  AUTH_TOGGLE_ACTIVE,
  AUTH_TOGGLE_IDLE,
} from '../lib/auth-page-styles';
import { LoginHeroPanel } from './LoginHeroPanel';
import { LoginHeroBackground } from './LoginHeroBackground';
import { LoginFormHighlights } from './LoginFormHighlights';

import {
  Location01Icon,
  Mail02Icon,
  LockKeyIcon,
  ViewIcon,
  ViewOffIcon,
  Call02Icon,
  Globe02Icon,
  WhatsappIcon,
  TelegramIcon,
  InstagramIcon,
  NewTwitterIcon,
  Alert02Icon,
  EnergyEllipseIcon,
  UnavailableIcon,
} from 'hugeicons-react';

const AUTH_BG_ANIMATION_KEY = 'auth-bg-animation';

function readBgAnimationPreference(): boolean {
  if (typeof localStorage === 'undefined') return true;
  return localStorage.getItem(AUTH_BG_ANIMATION_KEY) !== 'off';
}

export function LoginPage(): React.JSX.Element {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: branches } = useBranches();
  const { mutate: login, isPending } = useLogin(branches);
  const { logout } = useAuthStore();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [didMeasureBranchesReady, setDidMeasureBranchesReady] = useState(false);
  const [bgAnimation, setBgAnimation] = useState(readBgAnimationPreference);
  const authPortalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startMark = 'login:mount:start';
    clearPerfMarks(startMark, 'login:mount_to_paint', 'login:mount_to_paint:end');
    perfMark(startMark);
    perfMeasureOnNextPaint('login:mount_to_paint', startMark);
  }, []);

  const form = useForm<z.input<typeof loginRequestSchema>>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: '',
      password: '',
      branchId: '',
      rememberMe: true,
    },
  });

  useEffect(() => {
    if (searchParams.get('sessionExpired') === 'true') {
      logout();
      toast.warning(t('login.sessionExpired'));
      setSearchParams({}, { replace: true });
      return;
    }

    const storedToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (storedToken && isTokenValid(storedToken)) {
      navigate('/', { replace: true });
    }
  }, [searchParams, setSearchParams, t, navigate, logout]);

  useEffect(() => {
    if (didMeasureBranchesReady || !branches || branches.length === 0) return;
    setDidMeasureBranchesReady(true);
    perfMeasureOnNextPaint('login:mount_to_branches_ready_paint', 'login:mount:start', `branches=${branches.length}`);
  }, [branches, didMeasureBranchesReady]);

  useEffect(() => {
    if (!branches || branches.length === 0 || form.getValues('branchId')) return;
    form.setValue('branchId', branches[0].id, { shouldDirty: false, shouldValidate: true });
  }, [branches, form]);

  const onSubmit = (data: z.output<typeof loginRequestSchema>): void => {
    login({ ...data });
  };

  const onInvalidSubmit = (): void => {
    toast.error(t('login.loginError'), {
      description: t('validation.requiredFieldsNotFilled'),
    });
  };

  const toggleBgAnimation = (): void => {
    setBgAnimation((prev) => {
      const next = !prev;
      localStorage.setItem(AUTH_BG_ANIMATION_KEY, next ? 'on' : 'off');
      return next;
    });
  };

  return (
    <div className={AUTH_SHELL} ref={authPortalRef}>
      <style>{AUTH_AUTOFILL_CSS}</style>

      <div className="pointer-events-none absolute inset-0 z-0">
        <LoginHeroBackground animated={bgAnimation} />
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 animate-[fadeIn_1s_ease-out]">
        <LanguageSwitcher variant="icon" />
        <button
          type="button"
          onClick={toggleBgAnimation}
          className={`flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-xl shadow-lg shadow-black/40 transition-all duration-300 hover:scale-110 active:scale-95 ${bgAnimation ? AUTH_TOGGLE_ACTIVE : AUTH_TOGGLE_IDLE}`}
          title={bgAnimation ? t('login.animationOff') : t('login.animationOn')}
          aria-pressed={bgAnimation}
          aria-label={bgAnimation ? t('login.animationOff') : t('login.animationOn')}
        >
          {bgAnimation ? <EnergyEllipseIcon size={20} /> : <UnavailableIcon size={20} />}
        </button>
      </div>

      <div className={AUTH_LAYOUT}>
        <aside className={AUTH_HERO_COLUMN}>
          <LoginHeroPanel className="h-full w-full" />
        </aside>

        <div className={AUTH_MOBILE_HERO}>
          <LoginHeroPanel className="py-0" />
        </div>

        <div className={AUTH_FORM_COLUMN}>
          <div className={`${AUTH_CARD} ${AUTH_CARD_ANIMATE}`}>
            <div className="mb-8">
              <p className={AUTH_CARD_EYEBROW}>{t('login.secureWorkspace')}</p>
              <h2 className={AUTH_CARD_TITLE}>{t('login.loginHeading')}</h2>
              <LoginFormHighlights />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <div className="group relative w-full min-w-0">
                          <Location01Icon
                            className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 ${fieldState.invalid ? AUTH_ICON_INVALID : AUTH_ICON}`}
                            size={18}
                          />
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger
                              className={`${AUTH_SELECT_TRIGGER} ${fieldState.invalid ? AUTH_INPUT_INVALID : ''}`}
                            >
                              <SelectValue placeholder={t('login.branchPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent portalContainer={authPortalRef} className={AUTH_SELECT_CONTENT}>
                              {branches?.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id} className={AUTH_SELECT_ITEM}>
                                  <span className="block w-full whitespace-normal break-words pr-2 text-left leading-relaxed">
                                    {branch.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      <FormMessage className="mt-1 pl-1 text-xs font-medium text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <div className="group relative">
                          <Mail02Icon
                            className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldState.invalid ? AUTH_ICON_INVALID : AUTH_ICON}`}
                            size={18}
                          />
                          <Input
                            {...field}
                            type="email"
                            autoComplete="username"
                            placeholder={t('login.emailPlaceholder')}
                            className={`${AUTH_INPUT} ${fieldState.invalid ? AUTH_INPUT_INVALID : ''}`}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="mt-1 pl-1 text-xs font-medium text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <div className="group relative">
                          <LockKeyIcon
                            className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldState.invalid ? AUTH_ICON_INVALID : AUTH_ICON}`}
                            size={18}
                          />
                          <Input
                            {...field}
                            type={isPasswordVisible ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder={t('login.passwordPlaceholder')}
                            className={`${AUTH_INPUT} ${fieldState.invalid ? AUTH_INPUT_INVALID : ''}`}
                            onKeyDown={(e) => setCapsLockActive(e.getModifierState('CapsLock'))}
                            onKeyUp={(e) => setCapsLockActive(e.getModifierState('CapsLock'))}
                          />
                          <button
                            type="button"
                            onClick={() => setIsPasswordVisible((v) => !v)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-white ${fieldState.invalid ? 'text-red-400' : 'text-slate-400'}`}
                          >
                            {isPasswordVisible ? <ViewOffIcon size={20} /> : <ViewIcon size={20} />}
                          </button>
                        </div>
                      </FormControl>

                      <div className="mt-1 min-h-[20px] pl-1">
                        {fieldState.error ? (
                          <FormMessage className="animate-in slide-in-from-top-1 text-xs font-medium text-red-500" />
                        ) : capsLockActive ? (
                          <div className="mt-2 flex w-fit animate-in slide-in-from-top-1 items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)] bg-[var(--crm-brand-soft)] px-3 py-1.5 text-xs font-medium text-[var(--crm-brand-on-soft)]">
                            <Alert02Icon size={14} />
                            {t('login.capsLockOn')}
                          </div>
                        ) : null}
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between px-1 pt-1 text-xs text-slate-400">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <label className={AUTH_CHECKBOX_LABEL}>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-3.5 w-3.5 rounded border-none bg-[var(--crm-app-input)] accent-[var(--crm-brand-primary)]"
                            />
                            {t('login.rememberMe')}
                          </label>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Link to="/auth/forgot-password" className={AUTH_LINK}>
                    {t('login.forgotPassword')}
                  </Link>
                </div>

                <button type="submit" disabled={isPending} className={AUTH_PRIMARY_BUTTON}>
                  {isPending ? t('login.processing') : t('login.submitButton')}
                </button>
              </form>
            </Form>

            <div className={AUTH_SECURE_FOOTER}>
              <Lock className="h-3.5 w-3.5" />
              {t('login.secureSession')}
            </div>
          </div>

          <div className="mt-8 flex w-full max-w-[440px] flex-col items-center gap-5">
            <p className="text-center text-sm font-light uppercase tracking-[0.2em] text-slate-500 opacity-90">
              <Trans ns="auth" i18nKey="login.slogan" components={{ 1: <span className={AUTH_SLOGAN_ACCENT} /> }} />
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 px-2">
              <a
                href="tel:+905070123018"
                className={`${AUTH_SOCIAL_BUTTON} hover:scale-110`}
              >
                <Call02Icon size={20} />
              </a>
              <a href="https://v3rii.com" target="_blank" rel="noreferrer" className={`${AUTH_SOCIAL_BUTTON} hover:scale-110`}>
                <Globe02Icon size={20} />
              </a>
              <a href="mailto:info@v3rii.com" className={`${AUTH_SOCIAL_BUTTON} hover:scale-110`}>
                <Mail02Icon size={20} />
              </a>
              <a
                href="https://wa.me/905070123018"
                target="_blank"
                rel="noreferrer"
                className={`${AUTH_SOCIAL_BUTTON} hover:scale-110`}
              >
                <WhatsappIcon size={20} />
              </a>
              <button
                type="button"
                onClick={() => toast.info(t('login.comingSoon'))}
                className={`${AUTH_SOCIAL_BUTTON} hover:scale-110`}
              >
                <TelegramIcon size={20} />
              </button>
              <button
                type="button"
                onClick={() => toast.info(t('login.comingSoon'))}
                className={`${AUTH_SOCIAL_BUTTON} hover:scale-110`}
              >
                <InstagramIcon size={20} />
              </button>
              <button
                type="button"
                onClick={() => toast.info(t('login.comingSoon'))}
                className={`${AUTH_SOCIAL_BUTTON} hover:scale-110`}
              >
                <NewTwitterIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
