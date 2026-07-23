import { type ChangeEvent, type ReactElement, type RefObject, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SidebarLeft01Icon, SearchList01Icon, Cancel01Icon, Mic01Icon } from 'hugeicons-react'
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { NotificationIcon } from '@/features/notification/components/NotificationIcon';
import { NavbarLiveExchangeRates } from '@/components/shared/NavbarLiveExchangeRates';
import { UserProfileModal } from '@/features/user-detail-management/components/UserProfileModal';
import { useAppShellStore } from '@/stores/app-shell-store';
import { getImageUrl } from '@/features/user-detail-management/utils/image-url';
import { cn } from '@/lib/utils';
import { APP_DISPLAY_NAME, SALESDESK_LOGO_ALT, SALESDESK_LOGO_SIDEBAR_CLASS, SALESDESK_LOGO_URL } from '@/lib/brand-assets';
import { APP_SHELL_GUTTER_X } from '@/lib/app-shell-layout';
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
  '/salesdesk/visit-form-report': 'Ziyaret Form Raporu',
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
  const showClear = searchQuery.length > 0;
  const rightPadding = isSupported && showClear ? 'pr-[4.5rem] md:pr-[5.5rem]' : isSupported ? 'pr-12 md:pr-14' : showClear ? 'pr-10 md:pr-12' : 'pr-4 md:pr-5';

  return (
    <div className="group/search relative w-full min-w-0">
      <SearchList01Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors duration-200 group-focus-within/search:text-[var(--crm-brand-primary)] md:left-4 md:h-[18px] md:w-[18px]" />
      <input
        ref={searchInputRef}
        type="text"
        role="search"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        value={searchQuery}
        onChange={onSearch}
        placeholder={placeholder}
        className={cn(
          'h-10 w-full min-w-0 rounded-xl border py-0 pl-9 text-sm font-medium outline-none transition-all duration-200 md:h-11 md:rounded-2xl md:pl-11',
          rightPadding,
          'border-[var(--crm-app-border)] bg-[var(--crm-app-input)] text-slate-900 placeholder:text-slate-400',
          'focus:border-[var(--crm-brand-accent)] focus:ring-2 focus:ring-[var(--crm-brand-focus-glow)]',
          'dark:text-white dark:placeholder:text-slate-500'
        )}
      />
      <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5 md:right-2">
        {isSupported ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onStartListening();
            }}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200',
              isListening
                ? 'animate-pulse bg-[var(--crm-brand-soft)] text-[var(--crm-brand-text)]'
                : 'text-slate-400 hover:bg-white/10 hover:text-[var(--crm-brand-text)]'
            )}
            title={voiceSearchTitle}
            aria-label={voiceSearchTitle}
          >
            <Mic01Icon size={17} />
          </button>
        ) : null}
        {showClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Aramayi temizle"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
          >
            <Cancel01Icon size={16} />
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
      if (text.trim().length > 0 && window.innerWidth < 1024) {
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
          : APP_DISPLAY_NAME);

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
    if (val.trim().length > 0 && window.innerWidth < 1024) {
      setSidebarOpen(true);
    }
  };

  return (
    <>
      <header
        className={cn(
          'grid w-full grid-cols-1 items-center gap-3 border-b pt-[env(safe-area-inset-top)] sm:gap-3 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)_minmax(0,240px)] lg:gap-4 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,280px)]',
          'min-h-[64px] sm:min-h-[76px]',
          CRM_APP_PANEL_GLASS,
          'shadow-[0_10px_26px_rgba(0,0,0,.18)]',
          APP_SHELL_GUTTER_X
        )}
      >
        <div className="flex min-w-0 items-center justify-start gap-2 sm:gap-3 lg:order-1">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-pressed={isSidebarOpen}
            className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition-all duration-300 hover:bg-violet-500/10 hover:text-violet-600 focus:outline-none dark:border-white/8 dark:bg-white/[.03] dark:text-slate-400 dark:hover:text-violet-300 lg:hidden"
          >
            <SidebarLeft01Icon size={21} />
          </button>

          <Link
            to="/"
            className="hidden shrink-0 items-center lg:flex"
            aria-label="Ana sayfa"
          >
            <img src={SALESDESK_LOGO_URL} alt={SALESDESK_LOGO_ALT} className={cn(SALESDESK_LOGO_SIDEBAR_CLASS, 'h-9 w-auto')} />
          </Link>

          <div className="hidden min-w-0 max-w-[180px] shrink-0 border-l border-slate-200 pl-3 dark:border-white/10 xl:block xl:max-w-[220px] xl:pl-4">
            <p className="truncate text-[11px] text-slate-500">{APP_DISPLAY_NAME}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-slate-100 xl:text-base">{pageTitle}</p>
          </div>
        </div>

        <div className="order-3 flex min-w-0 flex-col gap-2 px-1 sm:px-2 lg:order-2 lg:px-4">
          <div className="hidden w-full min-w-0 items-center gap-1.5 overflow-hidden lg:flex lg:gap-2 xl:gap-4">
            <NavbarLiveExchangeRates
              codes={['USD', 'EUR']}
              className="min-w-0 flex-1 justify-end overflow-x-visible"
            />
            <div className="w-full min-w-0 max-w-[420px] shrink-0 xl:max-w-[480px]">
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
            <NavbarLiveExchangeRates
              codes={['GBP', 'ALTIN']}
              className="min-w-0 flex-1 justify-start overflow-x-visible"
            />
          </div>

          <div className="w-full min-w-0 lg:hidden">
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

          <NavbarLiveExchangeRates className="justify-center lg:hidden" />
        </div>

        <div className="order-2 flex min-w-0 items-center justify-end gap-2 sm:gap-3 lg:order-3">
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
