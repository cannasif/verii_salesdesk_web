import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { MailSettingsForm } from '@/features/mail-settings/components/MailSettingsForm';
import { useSmtpSettingsQuery } from '@/features/mail-settings/hooks/useSmtpSettingsQuery';
import { useUpdateSmtpSettingsMutation } from '@/features/mail-settings/hooks/useUpdateSmtpSettingsMutation';
import type { SmtpSettingsFormSchema } from '@/features/mail-settings/types/smtpSettings';

export function SalesDeskSettingsMailPanel(): ReactElement {
  const { t } = useTranslation();
  const { data, isLoading } = useSmtpSettingsQuery();
  const updateMutation = useUpdateSmtpSettingsMutation();

  const handleSubmit = async (values: SmtpSettingsFormSchema): Promise<void> => {
    await updateMutation.mutateAsync({
      host: values.host,
      port: values.port,
      enableSsl: values.enableSsl,
      username: values.username,
      ...(values.password ? { password: values.password } : {}),
      fromEmail: values.fromEmail,
      fromName: values.fromName,
      timeout: values.timeout,
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--crm-app-text-muted)]">
        {t('mailSettings.PageDescription')}
      </p>
      <MailSettingsForm
        data={data}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        variant="salesdesk"
      />
    </div>
  );
}
