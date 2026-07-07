import { type ReactElement } from 'react';
import {
  Building2,
  Mail,
  MonitorSmartphone,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SalesDeskSettingsTab } from './settings-types';
import { SETTINGS_TABS } from './settings-types';

const TAB_ICONS: Record<SalesDeskSettingsTab, React.ElementType> = {
  profile: UserRound,
  appearance: MonitorSmartphone,
  mail: Mail,
  admin: Building2,
};

interface SalesDeskSettingsNavProps {
  activeTab: SalesDeskSettingsTab;
  onTabChange: (tab: SalesDeskSettingsTab) => void;
}

export function SalesDeskSettingsNav({ activeTab, onTabChange }: SalesDeskSettingsNavProps): ReactElement {
  return (
    <>
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {SETTINGS_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition',
                active
                  ? 'border-[var(--crm-brand-ring)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-text)]'
                  : 'border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] text-slate-600 dark:text-slate-300'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <nav className="hidden flex-col gap-1 lg:flex">
        {SETTINGS_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition',
                active
                  ? 'border-[var(--crm-brand-ring)] bg-[var(--crm-brand-soft)]'
                  : 'border-transparent hover:border-[var(--crm-app-border)] hover:bg-[var(--crm-app-panel-muted)]'
              )}
            >
              <div
                className={cn(
                  'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  active
                    ? 'bg-[image:var(--crm-brand-gradient)] text-white'
                    : 'bg-[var(--crm-app-panel-muted)] text-slate-500 dark:text-slate-300'
                )}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    active ? 'text-[var(--crm-brand-text)]' : 'text-slate-900 dark:text-slate-100'
                  )}
                >
                  {tab.label}
                </p>
                <p className="mt-0.5 text-xs text-[var(--crm-app-text-muted)]">{tab.description}</p>
              </div>
            </button>
          );
        })}
      </nav>
    </>
  );
}
