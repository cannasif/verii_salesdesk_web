import { type ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CalendarPlus,
  Eye,
  FilePlus,
  Pencil,
  Receipt,
  UserPlus,
  UsersRound,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatSystemDate } from '@/lib/system-settings';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { SD_PRIMARY_BUTTON, SD_SECONDARY_BUTTON } from '../../lib/salesdesk-popup-styles';
import { SalesDeskMeetingsCard } from '../dashboard/SalesDeskMeetingsCard';
import { SalesDeskNotesDashboardCard } from '../dashboard/SalesDeskNotesDashboardCard';
import { SalesDeskOpenItemsDashboardSection } from '../dashboard/SalesDeskOpenItemsDashboardSection';

export function SalesDeskDashboardPage(): ReactElement {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();

  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [dashboardMode, setDashboardMode] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  useEffect(() => {
    setPageTitle(t('title'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const getUserDisplayName = (): string => {
    if (!user) return t('user');
    return user.name || user.email || t('user');
  };

  const displayName = getUserDisplayName();
  const firstName = displayName.trim().split(' ')[0];

  return (
    <div className="flex w-full flex-col gap-6 overflow-x-hidden p-1 pb-10 md:p-4">
      <div className="flex-none flex-col justify-between gap-4 px-1 flex md:flex-row md:items-center">
        <div>
          <h1 className="mb-1 flex flex-wrap items-center gap-2 text-2xl font-bold text-white md:text-3xl">
            <span>{t(`greeting.${timeOfDay}`)},</span>
            <span className="text-[var(--crm-brand-text)]">
              <span className="md:hidden">{firstName}</span>
              <span className="hidden md:inline">{displayName}</span>
            </span>
          </h1>
          <p className="flex items-center gap-2 text-sm font-medium text-[var(--crm-app-text-muted)]">
            <CalendarDays size={15} />
            {formatSystemDate(new Date())}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDashboardMode((current) => (current === 'view' ? 'edit' : 'view'))}
            className={`${SD_SECONDARY_BUTTON} hidden h-10 px-4 md:inline-flex`}
          >
            {dashboardMode === 'view' ? (
              <>
                <Pencil size={16} className="mr-2" />
                {tCommon('common.reportBuilder.dashboardTabEdit')}
              </>
            ) : (
              <>
                <Eye size={16} className="mr-2" />
                {tCommon('common.reportBuilder.dashboardTabView')}
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`${SD_PRIMARY_BUTTON} h-10 flex-1 px-6 md:flex-none`}>
                <Zap size={16} className="mr-2" />
                {t('quickAction')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-popover)] p-1.5 shadow-xl"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--crm-app-text-muted)] opacity-80">
                Cari & Potansiyel
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => navigate('/salesdesk/customers')}
                className="group mb-1 cursor-pointer rounded-lg px-2 py-2.5 outline-none transition-colors duration-150 hover:bg-[var(--crm-brand-soft)] focus:bg-[var(--crm-brand-soft)]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-[var(--crm-app-panel-muted)] p-1.5 text-[var(--crm-app-text-muted)] transition-colors group-hover:text-[var(--crm-brand-text)]">
                    <UserPlus size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">Cari Yonetimi</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate('/salesdesk/potentials')}
                className="group mb-1 cursor-pointer rounded-lg px-2 py-2.5 outline-none transition-colors duration-150 hover:bg-[var(--crm-brand-soft)] focus:bg-[var(--crm-brand-soft)]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-[var(--crm-app-panel-muted)] p-1.5 text-[var(--crm-app-text-muted)] transition-colors group-hover:text-[var(--crm-brand-text)]">
                    <UsersRound size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">Potansiyel Cariler</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-[var(--crm-app-border)]" />

              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--crm-app-text-muted)] opacity-80">
                Satis & Finans
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => navigate('/salesdesk/quotes')}
                className="group mb-1 cursor-pointer rounded-lg px-2 py-2.5 outline-none transition-colors duration-150 hover:bg-[var(--crm-brand-soft)] focus:bg-[var(--crm-brand-soft)]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-[var(--crm-app-panel-muted)] p-1.5 text-[var(--crm-app-text-muted)] transition-colors group-hover:text-[var(--crm-brand-text)]">
                    <FilePlus size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">Teklifler</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate('/salesdesk/invoices/sales/new')}
                className="group mb-1 cursor-pointer rounded-lg px-2 py-2.5 outline-none transition-colors duration-150 hover:bg-[var(--crm-brand-soft)] focus:bg-[var(--crm-brand-soft)]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-[var(--crm-app-panel-muted)] p-1.5 text-[var(--crm-app-text-muted)] transition-colors group-hover:text-[var(--crm-brand-text)]">
                    <Receipt size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">Yeni Satis Faturasi</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-[var(--crm-app-border)]" />

              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--crm-app-text-muted)] opacity-80">
                Operasyon
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => navigate('/salesdesk/weekly-plan')}
                className="group cursor-pointer rounded-lg px-2 py-2.5 outline-none transition-colors duration-150 hover:bg-[var(--crm-brand-soft)] focus:bg-[var(--crm-brand-soft)]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-[var(--crm-app-panel-muted)] p-1.5 text-[var(--crm-app-text-muted)] transition-colors group-hover:text-[var(--crm-brand-text)]">
                    <CalendarPlus size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">Haftalik Plan</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {dashboardMode === 'edit' ? (
        <div
          className="min-h-[320px] rounded-xl border border-dashed border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel)_40%,transparent)] px-6 py-10 text-center"
          aria-hidden
        >
          <p className="text-sm text-[var(--crm-app-text-muted)]">
            Dashboard widget düzenleme yakında eklenecek.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <SalesDeskMeetingsCard />
          <SalesDeskNotesDashboardCard />
          <SalesDeskOpenItemsDashboardSection />
        </div>
      )}
    </div>
  );
}
