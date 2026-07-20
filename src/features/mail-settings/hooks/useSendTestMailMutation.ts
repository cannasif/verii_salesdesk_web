import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { smtpSettingsApi } from '../api/smtpSettingsApi';

interface SendTestMailVars {
  to?: string;
}

export function useSendTestMailMutation() {
  const { t } = useTranslation();

  return useMutation<boolean, Error, SendTestMailVars>({
    mutationFn: (vars: SendTestMailVars) => smtpSettingsApi.sendTest(vars.to),
    onSuccess: () => {
      toast.success(t('mailSettings.TestMail.Success'));
    },
    onError: (error: Error) => {
      const rawMessage = error.message?.trim() ?? '';
      const translated = rawMessage ? t(rawMessage) : '';
      const message =
        rawMessage &&
        translated &&
        translated !== rawMessage &&
        translated !== 'Çeviri eksik'
          ? translated
          : rawMessage || t('common.UnexpectedError');
      toast.error(message);
    },
  });
}

