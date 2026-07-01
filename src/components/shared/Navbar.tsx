import { type ReactElement, useState, useEffect, useRef } from 'react';
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
  '/salesdesk/invoices/new': 'Yeni Satis Faturasi',
  '/salesdesk/sales-tracking': 'Satis Takip',
  '/salesdesk/weekly-visits': 'Haftalik Ziyaretler',
  '/salesdesk/open-items': 'Acik Maddeler',
  '/salesdesk/weekly-plan': 'Haftalik Plan',
  '/salesdesk/visit-forms': 'Ziyaret Formu',
  '/salesdesk/assets': 'Demirbaslar',
  '/salesdesk/recurring-payments': 'Standart Odemeler',
  '/salesdesk/software-research': 'Yazilim Arastirma',
  '/salesdesk/erp-news': 'ERP Haber Takibi',
  '/salesdesk/gmail': 'Gmail',
  '/salesdesk/settings': 'Ayarlar',
};

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
  const pageTitle = pageTitles[location.pathname] ?? 'Sales Desk';

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
      <header className={cn(
        "min-h-[76px] h-auto pt-[env(safe-area-inset-top)] px-4 sm:px-6 flex items-center justify-between border-b transition-all sticky top-0 z-40",
        CRM_APP_PANEL_GLASS,
        "shadow-[0_10px_26px_rgba(0,0,0,.18)]"
      )}>
        <div className="flex h-[76px] min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-pressed={isSidebarOpen}
            className="shrink-0 rounded-xl border border-white/8 bg-white/[.03] p-2 text-slate-400 transition-all duration-300 hover:bg-violet-500/10 hover:text-violet-300 focus:outline-none"
          >
            <SidebarLeft01Icon size={21} />
          </button>

          <div className="hidden min-w-[140px] border-l border-white/10 pl-5 md:block">
            <p className="text-[11px] text-slate-500">Sales Desk</p>
            <p className="mt-1 truncate text-base font-semibold text-slate-100">{pageTitle}</p>
          </div>

          <div className="group relative mx-auto hidden w-full max-w-[760px] md:block">
            <div className="relative flex items-center">
              <SearchList01Icon className="absolute left-4 h-5 w-5 text-slate-500 transition-colors duration-300 group-focus-within:text-violet-300" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder={t('navbar.search_placeholder')}
                className={cn(
                  "h-12 w-full rounded-2xl border py-0 pl-12 pr-24 text-sm font-medium outline-none transition-all duration-300",
                  "border-white/10 bg-[#0b0d19]/90 text-white placeholder:text-slate-500",
                  "focus:border-violet-400/60 focus:bg-[#0f1222] focus:ring-4 focus:ring-violet-500/10"
                )}
              />
              <div className="absolute right-3 flex items-center gap-2">
                {isSupported && (
                  <button
                    onClick={(e) => { e.preventDefault(); startListening(); }}
                    className={cn(
                      "rounded-xl p-2 transition-all duration-300",
                      isListening
                        ? "animate-pulse bg-violet-500/10 text-violet-300"
                        : "text-slate-400 hover:bg-white/10 hover:text-violet-300"
                    )}
                    title={t('common.voiceSearchTitle')}
                  >
                    <Mic01Icon size={18} />
                  </button>
                )}

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                  >
                    <Cancel01Icon size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {isSupported && (
            <button
              onClick={(e) => { e.preventDefault(); startListening(); }}
              className={cn(
                "p-2 md:hidden rounded-xl transition-all duration-300 relative",
                isListening
                  ? "text-[var(--crm-brand-primary)] bg-[var(--crm-brand-soft)] animate-pulse shadow-[0_0_15px_var(--crm-brand-shadow)]"
                  : "text-slate-500 dark:text-slate-400 hover:text-[var(--crm-brand-primary)] hover:bg-[var(--crm-brand-soft)]"
              )}
            >
              <Mic01Icon size={24} />
              {isListening && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--crm-brand-primary)] rounded-full animate-ping" />
              )}
            </button>
          )}
        </div>

        <div className="flex h-[76px] shrink-0 items-center justify-end gap-3 sm:gap-5">
          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            <div className="group relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-violet-500/10 hover:text-violet-300">
              <NotificationIcon />
            </div>
          </div>

          {user && <div className="hidden h-8 w-px shrink-0 bg-white/10 xs:block" />}

          {user && (
            <div onClick={() => setUserProfileModalOpen(true)} className="group flex shrink-0 cursor-pointer items-center gap-2 sm:gap-3">
              <div className="text-right hidden lg:block">
                <p className="max-w-[160px] truncate text-sm font-semibold text-slate-100 transition-colors group-hover:text-violet-300">
                  {displayName}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  {t('roles.admin')}
                </p>
              </div>
              <div className="relative shrink-0">
                <div className="h-11 w-11 rounded-full bg-[image:var(--crm-brand-gradient)] p-[2px] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(115,103,255,.45)]">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-[#080915] bg-[#090b16]">
                    {userDetail?.profilePictureUrl ? (
                      <img src={getImageUrl(userDetail.profilePictureUrl) || ''} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-[var(--crm-brand-primary)]">{displayInitials}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <UserProfileModal
        open={userProfileModalOpen}
        onOpenChange={setUserProfileModalOpen}
        onOpenProfileDetails={() => {
          setUserProfileModalOpen(false);
          navigate('/profile');
        }}
      />
    </>
  );
}
