import { type ReactElement, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings } from 'lucide-react';
import {
  salesDeskPageShellClass,
  salesDeskPageSubtitleClass,
  salesDeskPageTitleClass,
  surfaceClass,
} from '../../lib/salesdesk-shared';
import { SD_PAGE_ICON_BOX } from '../../lib/salesdesk-popup-styles';
import { SalesDeskSettingsNav } from '../settings/SalesDeskSettingsNav';
import { SalesDeskSettingsProfilePanel } from '../settings/SalesDeskSettingsProfilePanel';
import { SalesDeskSettingsAppearancePanel } from '../settings/SalesDeskSettingsAppearancePanel';
import { SalesDeskSettingsMailPanel } from '../settings/SalesDeskSettingsMailPanel';
import { SalesDeskSettingsAdminPanel } from '../settings/SalesDeskSettingsAdminPanel';
import { parseSettingsTab, type SalesDeskSettingsTab } from '../settings/settings-types';
import { SETTINGS_TABS } from '../settings/settings-types';

function SettingsPanel({ tab }: { tab: SalesDeskSettingsTab }): ReactElement {
  switch (tab) {
    case 'profile':
      return <SalesDeskSettingsProfilePanel />;
    case 'appearance':
      return <SalesDeskSettingsAppearancePanel />;
    case 'mail':
      return <SalesDeskSettingsMailPanel />;
    case 'admin':
      return <SalesDeskSettingsAdminPanel />;
    default:
      return <SalesDeskSettingsProfilePanel />;
  }
}

export function SalesDeskSettingsPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(() => parseSettingsTab(searchParams.get('tab')), [searchParams]);

  const handleTabChange = useCallback(
    (tab: SalesDeskSettingsTab) => {
      setSearchParams(tab === 'profile' ? {} : { tab }, { replace: true });
    },
    [setSearchParams]
  );

  const activeMeta = SETTINGS_TABS.find((item) => item.id === activeTab) ?? SETTINGS_TABS[0];

  return (
    <div className={salesDeskPageShellClass}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className={SD_PAGE_ICON_BOX}>
            <Settings size={22} />
          </div>
          <div>
            <h1 className={salesDeskPageTitleClass}>Sistem Ayarlari</h1>
            <p className={salesDeskPageSubtitleClass}>
              Profil, gorunum ve yonetim ayarlarinizi tek merkezden yonetin
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <SalesDeskSettingsNav activeTab={activeTab} onTabChange={handleTabChange} />

        <section className={`rounded-xl p-5 sm:p-6 ${surfaceClass}`}>
          <div className="mb-5 border-b border-[var(--crm-app-border)] pb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{activeMeta.label}</h2>
            <p className="mt-1 text-sm text-[var(--crm-app-text-muted)]">{activeMeta.description}</p>
          </div>
          <SettingsPanel tab={activeTab} />
        </section>
      </div>
    </div>
  );
}
