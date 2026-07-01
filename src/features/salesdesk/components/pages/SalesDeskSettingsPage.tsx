import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { getApiUrl } from '@/lib/axios';
import { surfaceClass } from '../../lib/salesdesk-shared';
import { SD_ADD_BUTTON, SD_PAGE_ICON_BOX } from '../../lib/salesdesk-popup-styles';

export function SalesDeskSettingsPage(): ReactElement {
  const apiUrl = getApiUrl();

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex items-start gap-3">
        <div className={SD_PAGE_ICON_BOX}>
          <Settings size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Sistem Ayarlari</h1>
          <p className="mt-1 text-sm text-slate-400">Sales Desk ortam bilgileri ve yonetim baglantilari</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className={`rounded-xl p-5 ${surfaceClass}`}>
          <h2 className="text-lg font-semibold">Uygulama Bilgileri</h2>
          <div className="mt-4 space-y-3 rounded-lg bg-black/30 p-4 text-sm text-slate-300">
            <p>
              Veritabani: <span className="font-semibold text-slate-100">V3RIISALESDESK</span>
            </p>
            <p>
              API URL:{' '}
              <span className="break-all font-semibold text-[var(--crm-brand-on-soft)]">{apiUrl}</span>
            </p>
            <p>Surum: 1.0.0</p>
          </div>
        </section>

        <section className={`rounded-xl p-5 ${surfaceClass}`}>
          <h2 className="text-lg font-semibold">Kullanici Yonetimi</h2>
          <p className="mt-3 text-sm text-slate-400">
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
