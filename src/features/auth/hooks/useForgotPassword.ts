import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/api';
import { authApi } from '../api/auth-api';

const AUTH_TOAST_SUCCESS = {
  style: {
    background: 'var(--crm-app-panel)',
    borderColor: 'rgb(212 175 55 / 22%)',
    color: '#fff',
    backdropFilter: 'blur(10px)',
  },
  className: 'text-white border-[color-mix(in_srgb,var(--crm-brand-primary)_22%,transparent)] shadow-xl shadow-black/20',
};

const AUTH_TOAST_ERROR = {
  style: {
    background: 'var(--crm-app-panel)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    color: '#fff',
    backdropFilter: 'blur(10px)',
  },
  className: 'text-white border-red-500/20 shadow-xl shadow-red-500/10',
};

function isSuccessfulAuthResponse(response: Partial<ApiResponse<unknown>>): boolean {
  if (response.success === false) return false;
  if (response.success === true) return true;

  const statusCode = response.statusCode;
  if (typeof statusCode === 'number') {
    return statusCode >= 200 && statusCode < 300;
  }

  return true;
}

export const useForgotPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onSuccess: (response) => {
      if (isSuccessfulAuthResponse(response)) {
        const message =
          response.message ||
          t('auth.forgotPassword.successMessage', {
            defaultValue:
              'Şifre sıfırlama linki e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.',
          });
        toast.success(message, AUTH_TOAST_SUCCESS);
        setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 2500);
        return;
      }

      const errorMessage =
        response.message ||
        response.exceptionMessage ||
        t('auth.forgotPassword.failed', {
          defaultValue: 'İşlem tamamlanamadı. E-posta adresinizi kontrol edip tekrar deneyin.',
        });
      toast.error(errorMessage, AUTH_TOAST_ERROR);
    },
    onError: (error: Error) => {
      console.error('Forgot password error:', error);
      toast.error(
        error.message ||
          t('auth.forgotPassword.error', {
            defaultValue: 'Şifre sıfırlama isteği gönderilemedi. Lütfen tekrar deneyin.',
          }),
        AUTH_TOAST_ERROR
      );
    },
  });
};
