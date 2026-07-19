import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Database, ExternalLink, Shield, Users } from 'lucide-react';
import { getApiUrl } from '@/lib/axios';
import {
  salesDeskSectionTitleClass,
  salesDeskStatValueClass,
  surfaceClass,
} from '../../lib/salesdesk-shared';
import { SD_ADD_BUTTON, SD_SECONDARY_BUTTON } from '../../lib/salesdesk-popup-styles';

export function SalesDeskSettingsAdminPanel(): ReactElement {
  const apiUrl = getApiUrl();

  return (
    <div className="space-y-5">
      <section className={`rounded-xl p-5 ${surfaceClass}`}>
        <h3 className={salesDeskSectionTitleClass}>
          <Database size={18} className="mr-2 inline" />
          Ortam Bilgileri
        </h3>
        <div className="mt-4 space-y-3 rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] p-4 text-sm">
          <p className="flex flex-wrap items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="text-[var(--crm-app-text-muted)]">Veritabani:</span>
            <span className={salesDeskStatValueClass}>YAZIHANE</span>
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            <span className="text-[var(--crm-app-text-muted)]">API URL:</span>{' '}
            <span className="break-all font-semibold text-[var(--crm-brand-text)]">{apiUrl}</span>
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            <span className="text-[var(--crm-app-text-muted)]">Surum:</span>{' '}
            <span className={salesDeskStatValueClass}>1.0.0</span>
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className={`rounded-xl p-5 ${surfaceClass}`}>
          <h3 className={salesDeskSectionTitleClass}>
            <Users size={18} className="mr-2 inline" />
            Kullanici Yonetimi
          </h3>
          <p className="mt-2 text-sm text-[var(--crm-app-text-muted)]">
            Kullanici ekleme, duzenleme ve hesap yonetimi islemleri.
          </p>
          <Link to="/user-management" className={`${SD_ADD_BUTTON} mt-4 inline-flex`}>
            <ExternalLink size={16} />
            Kullanicilar
          </Link>
        </section>

        <section className={`rounded-xl p-5 ${surfaceClass}`}>
          <h3 className={salesDeskSectionTitleClass}>
            <Shield size={18} className="mr-2 inline" />
            Yetkilendirme
          </h3>
          <p className="mt-2 text-sm text-[var(--crm-app-text-muted)]">
            Izin gruplari ve kullanici yetki atamalari.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/access-control/permission-groups" className={SD_SECONDARY_BUTTON}>
              Izin Gruplari
            </Link>
            <Link to="/access-control/user-authorization" className={SD_SECONDARY_BUTTON}>
              Kullanici Yetkileri
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
