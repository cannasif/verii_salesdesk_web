import { type ReactElement, Suspense, useMemo } from 'react';
import { PageLoader } from './PageLoader';
import { RouteNamespaceLoader } from './RouteNamespaceLoader';
import { Navbar } from './Navbar';
import { TopMegaMenuNav } from './TopMegaMenuNav';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RoutePermissionGuard } from '@/features/access-control/components/RoutePermissionGuard';
import { useMyPermissionsQuery } from '@/features/access-control/hooks/useMyPermissionsQuery';
import { filterNavItemsByPermission } from '@/features/access-control/utils/filterNavItems';
import { salesDeskNavItems } from '@/features/salesdesk';
import { APP_SHELL_GUTTER } from '@/lib/app-shell-layout';

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
    <div className="salesdesk-shell theme-v3rii relative flex min-h-dvh h-[100dvh] w-full flex-col overflow-hidden bg-[var(--crm-app-background)] font-['Outfit'] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 z-0 w-full overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] aspect-square w-[80vw] max-w-[800px] rounded-full bg-[var(--crm-app-aura-start)] blur-[80px] opacity-0 mix-blend-normal transition-colors duration-500 dark:opacity-70 md:blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] aspect-square w-[60vw] max-w-[600px] rounded-full bg-[var(--crm-app-aura-end)] blur-[60px] opacity-0 mix-blend-normal transition-colors duration-500 dark:opacity-70 md:blur-[100px]" />
      </div>

      {/* Mobil sidebar (overlay) */}
      <Sidebar items={items} />

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-40 w-full shrink-0">
          <Navbar />
          <TopMegaMenuNav items={items} />
        </div>

        <TooltipProvider delayDuration={200}>
          <div className="relative min-h-0 flex-1 w-full">
            <main className="absolute inset-0 w-full overflow-y-auto overflow-x-hidden text-foreground scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent touch-pan-y overscroll-contain [-webkit-overflow-scrolling:touch]">
              <div className={`${APP_SHELL_GUTTER} min-h-full w-full max-w-none pb-20 md:pb-20`}>
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
