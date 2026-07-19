import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { resetPasswordSchema, type ResetPasswordRequest } from '../types/auth';
import { useResetPassword } from '../hooks/useResetPassword';
import type React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { LockKeyIcon, ViewIcon, ViewOffIcon } from 'hugeicons-react';
import {
  AUTH_CARD,
  AUTH_CARD_ANIMATE,
  AUTH_ICON,
  AUTH_INPUT,
  AUTH_PRIMARY_BUTTON,
  AUTH_SHELL,
} from '../lib/auth-page-styles';
import { SALESDESK_LOGO_ALT, SALESDESK_LOGO_URL } from '@/lib/brand-assets';

export function ResetPasswordPage(): React.JSX.Element {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { mutate: resetPassword, isPending } = useResetPassword();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const form = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error(t('auth.resetPassword.invalidToken'));
      setTimeout(() => {
        navigate('/auth/login', { replace: true });
      }, 2000);
      return;
    }
    form.setValue('token', token);
  }, [token, form, navigate, t]);

  const onSubmit = (data: ResetPasswordRequest): void => {
    if (!token) {
      toast.error(t('auth.resetPassword.tokenNotFound'));
      return;
    }
    resetPassword({
      token: data.token,
      newPassword: data.newPassword,
    });
  };

  const onInvalidSubmit = (): void => {
    toast.error(t('auth.resetPassword.error'), {
      description: t('auth.validation.requiredFieldsNotFilled'),
    });
  };

  return (
    <div className={AUTH_SHELL}>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,var(--crm-app-panel-strong)_0%,var(--crm-app-background)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] h-[55vw] w-[55vw] rounded-full bg-[var(--crm-app-aura-end)] blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[55vw] w-[55vw] rounded-full bg-[var(--crm-app-aura-start)] blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col items-center overflow-y-auto px-4 py-8">
        <div className="absolute right-6 top-6 z-20">
          <LanguageSwitcher />
        </div>
        <div className={`${AUTH_CARD} ${AUTH_CARD_ANIMATE} my-auto`}>
          <div className="mb-8 text-center">
            <img
              src={SALESDESK_LOGO_URL}
              alt={SALESDESK_LOGO_ALT}
              className="inline-flex h-auto w-full max-w-[320px] bg-transparent object-contain p-2"
            />
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--crm-app-text-muted)]">
              {t('auth.resetPassword.title')}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="group relative">
                        <LockKeyIcon
                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${AUTH_ICON}`}
                          size={18}
                        />
                        <Input
                          {...field}
                          type={isPasswordVisible ? 'text' : 'password'}
                          placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                          className={AUTH_INPUT}
                        />
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible((v) => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--crm-app-text-muted)] hover:text-white"
                        >
                          {isPasswordVisible ? (
                            <ViewOffIcon size={20} />
                          ) : (
                            <ViewIcon size={20} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="group relative">
                        <LockKeyIcon
                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${AUTH_ICON}`}
                          size={18}
                        />
                        <Input
                          {...field}
                          type={isConfirmPasswordVisible ? 'text' : 'password'}
                          placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                          className={AUTH_INPUT}
                        />
                        <button
                          type="button"
                          onClick={() => setIsConfirmPasswordVisible((v) => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--crm-app-text-muted)] hover:text-white"
                        >
                          {isConfirmPasswordVisible ? (
                            <ViewOffIcon size={20} />
                          ) : (
                            <ViewIcon size={20} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={isPending || !token}
                className={AUTH_PRIMARY_BUTTON}
              >
                {isPending ? t('auth.resetPassword.processing') : t('auth.resetPassword.submitButton')}
              </button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
