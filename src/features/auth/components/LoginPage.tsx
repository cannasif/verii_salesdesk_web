import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, Trans } from 'react-i18next';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
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
  AUTH_CHECKBOX_LABEL,
  AUTH_ICON,
  AUTH_ICON_INVALID,
  AUTH_INPUT,
  AUTH_INPUT_INVALID,
  AUTH_LINK,
  AUTH_PRIMARY_BUTTON,
  AUTH_SELECT_CONTENT,
  AUTH_SELECT_ITEM,
  AUTH_SELECT_TRIGGER,
  AUTH_SHELL,
  AUTH_SOCIAL_BUTTON,
  AUTH_SLOGAN_ACCENT,
  AUTH_TOGGLE_ACTIVE,
  AUTH_TOGGLE_IDLE,
} from '../lib/auth-page-styles';
const loginImage = '/veriicrmlogo-sm.png';
const AuthBackground = lazy(async () => import('./AuthBackground').then((mod) => ({ default: mod.AuthBackground })));

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
  EnergyEllipseIcon, 
  UnavailableIcon,
  Alert02Icon 
} from 'hugeicons-react';

export function LoginPage(): React.JSX.Element {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: branches } = useBranches();
  const { mutate: login, isPending } = useLogin(branches);
  const { logout } = useAuthStore();
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  
  const [showAnimation, setShowAnimation] = useState(true);
  const [didMeasureBranchesReady, setDidMeasureBranchesReady] = useState(false);

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
      toast.warning(t('auth.login.sessionExpired'));
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
    toast.error(t('auth.login.loginError'), {
      description: t('auth.validation.requiredFieldsNotFilled'),
    });
  };

  return (
    <div className={AUTH_SHELL}>
      
      <style>{AUTH_AUTOFILL_CSS}</style>

      <div 
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${showAnimation ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="absolute top-[-10%] right-[-10%] h-[60vw] w-[60vw] rounded-full bg-[var(--crm-app-aura-end)] blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[60vw] w-[60vw] rounded-full bg-[var(--crm-app-aura-start)] blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[color-mix(in_srgb,var(--crm-app-background)_60%,transparent)] to-[var(--crm-app-background)]" />
      </div>

      <Suspense fallback={null}>
        <AuthBackground isActive={showAnimation} />
      </Suspense>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 animate-[fadeIn_1s_ease-out]">
        
        <LanguageSwitcher variant="icon" />

        <button
          onClick={() => setShowAnimation(!showAnimation)}
          className={`
            flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-xl shadow-lg shadow-black/40
            transition-all duration-300 hover:scale-110 active:scale-95
            ${showAnimation ? AUTH_TOGGLE_ACTIVE : AUTH_TOGGLE_IDLE}
          `}
          title={showAnimation ? t('auth.login.animationOff') : t('auth.login.animationOn')}
        >
          {showAnimation ? (
            <EnergyEllipseIcon size={20} />
          ) : (
            <UnavailableIcon size={20} />
          )}
        </button>

      </div>

      <div className="relative z-10 w-full h-full flex flex-col justify-between items-center px-4 py-8 overflow-y-auto">

        <div className={`${AUTH_CARD} ${AUTH_CARD_ANIMATE} mb-auto mt-10 md:mt-auto`}>
          <div className="text-center mb-8">
            <img
              src={loginImage}
              alt="Logo"
              className="inline-flex items-center justify-center w-80 h-50 object-contain p-2"
            />
            <p className="text-slate-400 text-xs uppercase tracking-[0.15em] mt-2 font-medium">
              {t('auth.login.title')}
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-5" noValidate>
              
              <FormField
                control={form.control}
                name="branchId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                     <div className="relative group w-full min-w-0">
                      <Location01Icon 
                        className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 ${fieldState.invalid ? AUTH_ICON_INVALID : AUTH_ICON}`} 
                        size={18} 
                      />
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger 
                          className={`${AUTH_SELECT_TRIGGER} ${fieldState.invalid ? AUTH_INPUT_INVALID : ''}`}
                        >
                          <SelectValue placeholder={t('auth.login.branchPlaceholder')} />
                        </SelectTrigger>

                        <SelectContent className={AUTH_SELECT_CONTENT}>
  {branches?.map((branch) => (
    <SelectItem 
      key={branch.id} 
      value={branch.id} 
      className={AUTH_SELECT_ITEM}
    >
      {/* Satır atlamasını sağlayan sihirli classlar: whitespace-normal ve break-words */}
      <span className="whitespace-normal break-words text-left block w-full pr-2 leading-relaxed">
        {branch.name}
      </span>
    </SelectItem>
  ))}
</SelectContent>
                      </Select>
                          </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs font-medium pl-1 mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Mail02Icon 
                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldState.invalid ? AUTH_ICON_INVALID : AUTH_ICON}`} 
                          size={18} 
                        />
                        <Input
                              {...field}
                              type="email"
                              autoComplete="username" 
                              placeholder={t('auth.login.emailPlaceholder')}
                              className={`${AUTH_INPUT} ${fieldState.invalid ? AUTH_INPUT_INVALID : ''}`}
                            />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs font-medium pl-1 mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <LockKeyIcon 
                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${fieldState.invalid ? AUTH_ICON_INVALID : AUTH_ICON}`} 
                          size={18} 
                        />
                        <Input
                              {...field}
                              type={isPasswordVisible ? 'text' : 'password'}
                              autoComplete="current-password" 
                              placeholder={t('auth.login.passwordPlaceholder')}
                              className={`${AUTH_INPUT} ${fieldState.invalid ? AUTH_INPUT_INVALID : ''}`}
                              onKeyDown={(e) => setCapsLockActive(e.getModifierState('CapsLock'))}
                              onKeyUp={(e) => setCapsLockActive(e.getModifierState('CapsLock'))}
                        />
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible(v => !v)}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-white ${fieldState.invalid ? 'text-red-400' : 'text-slate-400'}`}
                        >
                          {isPasswordVisible ? <ViewOffIcon size={20} /> : <ViewIcon size={20} />}
                        </button>
                      </div>
                    </FormControl>
        
                    <div className="min-h-[20px] mt-1 pl-1">
                      {fieldState.error ? (
                   
                        <FormMessage className="text-red-500 text-xs font-medium animate-in slide-in-from-top-1" />
                      ) : capsLockActive ? (
                        <div className="mt-2 flex w-fit animate-in slide-in-from-top-1 items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)] bg-[var(--crm-brand-soft)] px-3 py-1.5 text-xs font-medium text-[var(--crm-brand-text)]">
                          <Alert02Icon size={14} />
                          {t('auth.login.capsLockOn')}
                        </div>
                      ) : null}
                    </div>

                  </FormItem>
                )}
              />
            
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
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
                          {t('auth.login.rememberMe')}
                        </label>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Link to="/auth/forgot-password" className={AUTH_LINK}>{t('auth.login.forgotPassword')}</Link>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className={AUTH_PRIMARY_BUTTON}
              >
                {isPending ? t('auth.login.processing') : t('auth.login.submitButton')}
              </button>
            </form>
          </Form>
        </div>

        <div className="w-full max-w-4xl z-20 mt-8 flex flex-col items-center gap-6 pb-6">
          <p className="text-slate-400 text-sm font-light tracking-[0.2em] uppercase opacity-80 text-center">
            <Trans
              i18nKey="auth.login.slogan"
              components={{ 1: <span className={AUTH_SLOGAN_ACCENT} /> }}
            />
          </p>
          
           <div className="flex flex-wrap items-center justify-center gap-4 px-4">
            <a href="tel:+905070123018" className={`${AUTH_SOCIAL_BUTTON} hover:scale-110 hover:text-lime-400 hover:border-lime-500/30`}>
              <Call02Icon size={20} />
            </a>

            <a href="https://v3rii.com" target="_blank" rel="noreferrer" className={`${AUTH_SOCIAL_BUTTON} hover:scale-110`}>
              <Globe02Icon size={20} />
            </a>

            <a href="mailto:info@v3rii.com" className={`${AUTH_SOCIAL_BUTTON} hover:scale-110`}>
              <Mail02Icon size={20} />
            </a>

            <a href="https://wa.me/905070123018" target="_blank" rel="noreferrer" className={`${AUTH_SOCIAL_BUTTON} hover:scale-110 hover:text-emerald-400 hover:border-emerald-500/30`}>
              <WhatsappIcon size={20} />
            </a>

           <button 
              type="button"
              onClick={() => toast.info(t('auth.login.comingSoon', 'Çok yakında!'))} 
              className={`${AUTH_SOCIAL_BUTTON} hover:scale-110 hover:text-sky-400 hover:border-sky-500/30`}
            >
              <TelegramIcon size={20} />
            </button>

            <button 
              type="button"
              onClick={() => toast.info(t('auth.login.comingSoon', 'Çok yakında!'))} 
              className={`${AUTH_SOCIAL_BUTTON} hover:scale-110 hover:text-fuchsia-400 hover:border-fuchsia-500/30`}
            >
              <InstagramIcon size={20} />
            </button>

            <button 
              type="button"
              onClick={() => toast.info(t('auth.login.comingSoon', 'Çok yakında!'))} 
              className={`${AUTH_SOCIAL_BUTTON} hover:scale-110 hover:text-white hover:border-white/30`}
            >
              <NewTwitterIcon size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
