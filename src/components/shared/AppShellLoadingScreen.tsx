import { type ReactElement } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AppShellLoadingScreen(): ReactElement {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/90 px-6 py-4 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--crm-brand-text)]" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t('loading', { defaultValue: 'Yükleniyor...' })}
        </span>
      </div>
    </div>
  );
}
