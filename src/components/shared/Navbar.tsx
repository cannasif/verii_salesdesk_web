import { type ChangeEvent, type ReactElement, type RefObject, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarLeft01Icon, SearchList01Icon, Cancel01Icon, Mic01Icon } from 'hugeicons-react'
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { NotificationIcon } from '@/features/notification/components/NotificationIcon';
import { UserProfileModal } from '@/features/user-detail-management/components/UserProfileModal';
import { useAppShellStore } from '@/stores/app-shell-store';
import { getImageUrl } from '@/features/user-detail-management/utils/image-url';
import { cn } from '@/lib/utils';
import { CRM_APP_PANEL_GLASS } from '@/lib/management-list-layout';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';

const pageTitles: Record<string, string> = {
  '/': 'Ana Sayfa',
  '/salesdesk/customers': 'Cari Yonetimi',
  '/salesdesk/potentials': 'Potansiyel Cariler',
  '/salesdesk/products': 'Stok / Urunler',
  '/salesdesk/product-customers': 'Urun Bazli Musteriler',
  '/salesdesk/quotes': 'Teklifler',
  '/salesdesk/invoices': 'Faturalar',
  '/salesdesk/invoices/sales/new': 'Satis Faturasi Ekle',
  '/salesdesk/invoices/purchase/new': 'Alis Faturasi Ekle',
  '/salesdesk/invoices/new': 'Satis Faturasi Ekle',
  '/salesdesk/sales-tracking': 'Satis Takip',
  '/salesdesk/weekly-visits': 'Haftalik Ziyaretler',
  '/salesdesk/activities': 'Aktiviteler',
  '/salesdesk/proje-takibi': 'Proje Takibi',
  '/salesdesk/open-items': 'Acik Maddeler',
  '/salesdesk/weekly-plan': 'Haftalik Plan',
  '/salesdesk/visit-forms': 'Ziyaret Formu',
  '/salesdesk/visit-forms/new': 'Yeni Ziyaret Formu',
  '/salesdesk/assets': 'Demirbaslar',
  '/salesdesk/recurring-payments': 'Standart Odemeler',
  '/salesdesk/software-research': 'Yazilim Arastirma',
  '/salesdesk/software-research/new': 'Yeni Yazilim Arastirmasi',
  '/salesdesk/erp-news': 'ERP Haber Takibi',
  '/salesdesk/erp-news/new': 'Yeni ERP Haberi',
  '/salesdesk/gmail': 'Gmail',
  '/salesdesk/settings': 'Ayarlar',
  '/user-management': 'Kullanici Yonetimi',
  '/salesdesk/groups': 'Grup Yonetimi',
  '/access-control/permission-groups': 'Izin Gruplari',
  '/access-control/user-authorization': 'Kullanici Yetkileri',
};

interface NavbarSearchFieldProps {
  searchInputRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder: string;
  isSupported: boolean;
  isListening: boolean;
  onStartListening: () => void;
  voiceSearchTitle: string;
}

function NavbarSearchField({
  searchInputRef,
  searchQuery,
  onSearch,
  onClear,
  placeholder,
  isSupported,
  isListening,
  onStartListening,
  voiceSearchTitle,
}: NavbarSearchFieldProps): ReactElement {
  return (
    <div className="relative flex min-w-0 items-center">
      <SearchList01Icon className="absolute left-3 h-4 w-4 text-slate-500 transition-colors duration-300 group-focus-within:text-violet-300 md:left-4 md:h-5 md:w-5" />
      <input
        ref={searchInputRef}
        type="search"
        value={searchQuery}
        onChange={onSearch}
        placeholder={placeholder}
        className={cn(
          'h-10 w-full min-w-0 rounded-xl border py-0 pl-9 pr-14 text-sm font-medium outline-none transition-all duration-300 md:h-12 md:rounded-2xl md:pl-12 md:pr-24',
          'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
          'focus:border-violet-400/60 focus:bg-white focus:ring-4 focus:ring-violet-500/10',
          'dark:border-white/10 dark:bg-[#0b0d19]/90 dark:text-white dark:placeholder:text-slate-500',
          'dark:focus:border-violet-400/60 dark:focus:bg-[#0f1222]'
        )}
      />
      <div className="absolute right-1.5 flex items-center gap-1 md:right-3 md:gap-2">
        {isSupported && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onStartListening();
            }}
            className={cn(
              'rounded-lg p-1.5 transition-all duration-300 md:rounded-xl md:p-2',
              isListening
                ? 'animate-pulse bg-violet-500/10 text-violet-300'
                : 'text-slate-400 hover:bg-white/10 hover:text-violet-300'
            )}
            title={voiceSearchTitle}
          >
            <Mic01Icon size={16} className="md:hidden" />
            <Mic01Icon size={18} className="hidden md:block" />
          </button>
        )}
        {searchQuery ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-white/20 dark:hover:text-white"
          >
            <Cancel01Icon size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function Navbar(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const { toggleSidebar, searchQuery, setSearchQuery, setSidebarOpen, isSidebarOpen } = useUIStore();
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const userDetail = useAppShellStore((state) =>
    user?.id ? state.userSummaries[String(user.id)]?.data ?? null : null
  );

  const { isListening, isSupported, startListening } = useVoiceSearch({
    onResult: (text) => {
      setSearchQuery(text);
      if (text.trim().length > 0) {
        setSidebarOpen(true);
      }
    },
  });

  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname, setSearchQuery]);

  const displayName = user?.name || user?.email || 'Kullanıcı';
  const displayInitials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'MK';
  const pageTitle =
    pageTitles[location.pathname] ??
    (location.pathname.match(/^\/salesdesk\/visit-forms\/\d+\/edit$/)
      ? 'Ziyaret Formu Duzenle'
      : location.pathname.match(/^\/salesdesk\/software-research\/\d+\/edit$/)
        ? 'Yazilim Arastirmasi Duzenle'
        : location.pathname.match(/^\/salesdesk\/erp-news\/\d+\/edit$/)
          ? 'ERP Haberi Duzenle'
          : 'Sales Desk');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 0) {
      setSidebarOpen(true);
    }
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 flex min-h-[64px] items-center justify-between gap-3 border-b px-3 pt-[env(safe-area-inset-top)] transition-all sm:min-h-[76px] sm:gap-4 sm:px-6',
          CRM_APP_PANEL_GLASS,
          'shadow-[0_10px_26px_rgba(0,0,0,.18)]'
        )}
      >
        <div className="flex h-[52px] min-w-0 flex-1 items-center gap-2 sm:h-[76px] sm:gap-4">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-pressed={isSidebarOpen}
            className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition-all duration-300 hover:bg-violet-500/10 hover:text-violet-600 focus:outline-none dark:border-white/8 dark:bg-white/[.03] dark:text-slate-400 dark:hover:text-violet-300"
          >
            <SidebarLeft01Icon size={21} />
          </button>

          <div className="hidden min-w-[140px] shrink-0 border-l border-slate-200 pl-4 dark:border-white/10 md:block">
            <p className="text-[11px] text-slate-500">Sales Desk</p>
            <p className="mt-1 truncate text-base font-semibold text-slate-900 dark:text-slate-100">{pageTitle}</p>
          </div>

          <div className="group relative min-w-0 flex-1 md:mx-auto md:max-w-[760px]">
            <NavbarSearchField
              searchInputRef={searchInputRef}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              onClear={() => setSearchQuery('')}
              placeholder={t('navbar.search_placeholder')}
              isSupported={isSupported}
              isListening={isListening}
              onStartListening={startListening}
              voiceSearchTitle={t('common.voiceSearchTitle')}
            />
          </div>
        </div>

        <div className="flex h-[52px] shrink-0 items-center gap-2 sm:h-[76px] sm:gap-4">
          <NotificationIcon />

          {user ? <div className="hidden h-8 w-px shrink-0 bg-slate-200 dark:bg-white/10 sm:block" /> : null}

          {user ? (
            <div
              onClick={() => setUserProfileModalOpen(true)}
              className="group flex shrink-0 cursor-pointer items-center gap-2 sm:gap-3"
            >
              <div className="hidden text-right lg:block">
                <p className="max-w-[160px] truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-violet-600 dark:text-slate-100 dark:group-hover:text-violet-300">
                  {displayName}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  {t('roles.admin')}
                </p>
              </div>
              <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-full bg-[image:var(--crm-brand-gradient)] p-[2px] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(115,103,255,.45)] sm:h-11 sm:w-11">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 dark:border-[#080915] dark:bg-[#090b16]">
                    {userDetail?.profilePictureUrl ? (
                      <img
                        src={getImageUrl(userDetail.profilePictureUrl) || ''}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-[var(--crm-brand-primary)]">{displayInitials}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <UserProfileModal
        open={userProfileModalOpen}
        onOpenChange={setUserProfileModalOpen}
        onOpenProfileDetails={() => {
          setUserProfileModalOpen(false);
          navigate('/salesdesk/settings?tab=profile');
        }}
      />
    </>
  );
}
