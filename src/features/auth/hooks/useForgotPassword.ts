import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
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

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onSuccess: (response) => {
      if (response.success) {
        const message = response.message || 'Şifre sıfırlama linki e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.';
        toast.success(message, AUTH_TOAST_SUCCESS);
      } else {
        const errorMessage = response.message || 'Bu e-posta adresi sistemde kayıtlı değil.';
        toast.error(errorMessage, AUTH_TOAST_ERROR);
      }
    },
    onError: (error: Error) => {
      console.error('Forgot password error:', error);
      const errorMessage = 'Bu e-posta adresi sistemde kayıtlı değil.';
      toast.error(errorMessage, AUTH_TOAST_ERROR);
    },
  });
};
