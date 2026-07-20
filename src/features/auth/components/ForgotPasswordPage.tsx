import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { forgotPasswordSchema, type ForgotPasswordRequest } from '../types/auth';
import { useForgotPassword } from '../hooks/useForgotPassword';
import type React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Mail02Icon } from 'hugeicons-react';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import {
  AUTH_CARD,
  AUTH_CARD_ANIMATE,
  AUTH_ICON,
  AUTH_INPUT,
  AUTH_PRIMARY_BUTTON,
  AUTH_SECONDARY_BUTTON,
  AUTH_SHELL,
} from '../lib/auth-page-styles';
import { SALESDESK_LOGO_ALT, SALESDESK_LOGO_AUTH_CLASS, SALESDESK_LOGO_URL } from '@/lib/brand-assets';

export function ForgotPasswordPage(): React.JSX.Element {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { mutate: requestPasswordReset, isPending } = useForgotPassword();

  const form = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordRequest): void => {
    requestPasswordReset(data.email);
  };

  const onInvalidSubmit = (): void => {
    toast.error(t('auth.forgotPassword.title'), {
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

      <div className="fixed bottom-6 right-6 z-50 flex animate-[fadeIn_1s_ease-out] flex-col gap-3">
        <LanguageSwitcher variant="icon" />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col items-center overflow-y-auto px-4 py-8">
        <div className={`${AUTH_CARD} ${AUTH_CARD_ANIMATE} my-auto`}>
          <div className="mb-8 text-center">
            <img
              src={SALESDESK_LOGO_URL}
              alt={SALESDESK_LOGO_ALT}
              className={SALESDESK_LOGO_AUTH_CLASS}
            />
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--crm-app-text-muted)]">
              {t('auth.forgotPassword.title')}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-center text-sm text-slate-300">
              {t('auth.forgotPassword.description')}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="group relative">
                        <Mail02Icon
                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${AUTH_ICON}`}
                          size={18}
                        />
                        <Input
                          {...field}
                          type="email"
                          placeholder={t('auth.forgotPassword.emailPlaceholder')}
                          className={AUTH_INPUT}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={isPending}
                className={AUTH_PRIMARY_BUTTON}
              >
                {isPending ? t('auth.forgotPassword.processing') : t('auth.forgotPassword.submitButton')}
              </button>

              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className={AUTH_SECONDARY_BUTTON}
              >
                {t('auth.forgotPassword.backToLogin')}
              </button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
