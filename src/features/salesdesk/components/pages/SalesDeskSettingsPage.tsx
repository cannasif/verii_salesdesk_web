import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { getApiUrl } from '@/lib/axios';
import {
  salesDeskPageShellClass,
  salesDeskPageSubtitleClass,
  salesDeskPageTitleClass,
  salesDeskSectionTitleClass,
  salesDeskStatValueClass,
  surfaceClass,
} from '../../lib/salesdesk-shared';
import { SD_ADD_BUTTON, SD_PAGE_ICON_BOX } from '../../lib/salesdesk-popup-styles';

export function SalesDeskSettingsPage(): ReactElement {
  const apiUrl = getApiUrl();

  return (
    <div className={salesDeskPageShellClass}>
      <div className="flex items-start gap-3">
        <div className={SD_PAGE_ICON_BOX}>
          <Settings size={22} />
        </div>
        <div>
          <h1 className={salesDeskPageTitleClass}>Sistem Ayarlari</h1>
          <p className={salesDeskPageSubtitleClass}>Sales Desk ortam bilgileri ve yonetim baglantilari</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className={`rounded-xl p-5 ${surfaceClass}`}>
          <h2 className={salesDeskSectionTitleClass}>Uygulama Bilgileri</h2>
          <div className="mt-4 space-y-3 rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] p-4 text-sm text-slate-700 dark:bg-black/30 dark:text-slate-300">
            <p>
              Veritabani: <span className={`${salesDeskStatValueClass} font-semibold`}>V3RIISALESDESK</span>
            </p>
            <p>
              API URL:{' '}
              <span className="break-all font-semibold text-[var(--crm-brand-text)]">{apiUrl}</span>
            </p>
            <p>Surum: 1.0.0</p>
          </div>
        </section>

        <section className={`rounded-xl p-5 ${surfaceClass}`}>
          <h2 className={salesDeskSectionTitleClass}>Kullanici Yonetimi</h2>
          <p className={`${salesDeskPageSubtitleClass} mt-3`}>
            Kullanici ekleme, duzenleme ve yetkilendirme islemleri icin kullanici yonetimi modulunu kullanin.
          </p>
          <Link
            to="/user-management"
            className={SD_ADD_BUTTON}
          >
            Kullanici Yonetimine Git
          </Link>
        </section>
      </div>
    </div>
  );
}
