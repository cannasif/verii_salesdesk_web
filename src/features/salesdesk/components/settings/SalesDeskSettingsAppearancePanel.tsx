import { type ReactElement } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { salesDeskSectionTitleClass } from '../../lib/salesdesk-shared';

const THEME_OPTIONS = [
  { id: 'light' as const, label: 'Acik', description: 'Acik arka plan', icon: Sun },
  { id: 'dark' as const, label: 'Koyu', description: 'Koyu arka plan', icon: Moon },
];

export function SalesDeskSettingsAppearancePanel(): ReactElement {
  const { theme, setTheme } = useTheme();
  const resolvedTheme = theme === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : theme;

  return (
    <div className="space-y-4">
      <section className="space-y-4">
        <h3 className={salesDeskSectionTitleClass}>Renk Modu</h3>
        <p className="text-sm text-[var(--crm-app-text-muted)]">
          Arayuz su anda <strong>{resolvedTheme === 'dark' ? 'koyu' : 'acik'}</strong> modda goruntuleniyor.
        </p>
        <div className="grid max-w-lg gap-3 sm:grid-cols-2">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = resolvedTheme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition',
                  active
                    ? 'border-[var(--crm-brand-ring)] bg-[var(--crm-brand-soft)]'
                    : 'border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] hover:border-[var(--crm-brand-ring)]'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    active
                      ? 'bg-[image:var(--crm-brand-gradient)] text-white'
                      : 'bg-[var(--crm-app-panel)] text-slate-500 dark:text-slate-300'
                  )}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{option.label}</p>
                  <p className="text-xs text-[var(--crm-app-text-muted)]">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
