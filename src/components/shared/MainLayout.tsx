import { type ReactElement, Suspense, useMemo } from 'react';
import { PageLoader } from './PageLoader';
import { RouteNamespaceLoader } from './RouteNamespaceLoader';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RoutePermissionGuard } from '@/features/access-control/components/RoutePermissionGuard';
import { useMyPermissionsQuery } from '@/features/access-control/hooks/useMyPermissionsQuery';
import { filterNavItemsByPermission } from '@/features/access-control/utils/filterNavItems';
import { salesDeskNavItems } from '@/features/salesdesk';

interface NavItem {
  title: string;
  href?: string;
  icon?: ReactElement;
  children?: NavItem[];
  defaultExpanded?: boolean;
}
interface MainLayoutProps {
  navItems?: NavItem[];
}

export function MainLayout({ navItems }: MainLayoutProps): ReactElement {
  const { data: permissions, isLoading, isError } = useMyPermissionsQuery();

  const defaultNavItems: NavItem[] = useMemo(() => {
    return salesDeskNavItems;
  }, []);

  const items = useMemo(() => {
    const normalized = navItems ?? defaultNavItems;

    if (isLoading) return normalized;
    if (permissions) return filterNavItemsByPermission(normalized, permissions);
    if (isError) return normalized;
    return normalized;
  }, [navItems, defaultNavItems, permissions, isLoading, isError]);

  return (
    <div className="salesdesk-shell dark relative flex min-h-dvh h-[100dvh] w-full overflow-hidden bg-[var(--crm-app-background)] font-['Outfit'] text-slate-100 transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(14,165,233,.08),transparent_26%,rgba(124,58,237,.08)_72%,transparent)]" />
        <div className="absolute inset-0 opacity-[.18] [background-image:linear-gradient(120deg,transparent_0_38%,rgba(255,255,255,.08)_38.2%,transparent_58%),linear-gradient(62deg,transparent_0_63%,rgba(34,211,238,.08)_63.2%,transparent_79%)]" />
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(18deg,transparent_0_48%,rgba(15,23,42,.72)_48.2%_63%,transparent_63.2%),linear-gradient(143deg,transparent_0_55%,rgba(88,28,135,.24)_55.2%_68%,transparent_68.2%)]" />
      </div>

      {/* Sidebar - Mobile handles itself with fixed position, Desktop uses sticky/relative */}
      <Sidebar items={items} />

      <div className="flex flex-1 flex-col h-full min-h-0 overflow-hidden relative z-10">
        <Navbar />
        <TooltipProvider delayDuration={200}>
          <div className="flex-1 min-h-0 relative">
            <main className="absolute inset-0 overflow-y-auto overflow-x-hidden p-4 pb-20 md:p-6 md:pb-20 text-foreground scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent touch-pan-y overscroll-contain [-webkit-overflow-scrolling:touch]">
              <div className="w-full min-h-full max-w-[1920px] mx-auto">
                <Suspense fallback={<PageLoader />}>
                  <RouteNamespaceLoader>
                    <RoutePermissionGuard />
                  </RouteNamespaceLoader>
                </Suspense>
              </div>
            </main>
          </div>
        </TooltipProvider>
        <Footer />
      </div>
    </div>
  );
}
