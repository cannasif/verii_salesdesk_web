import { type ReactElement, Suspense, useMemo } from 'react';
import { PageLoader } from './PageLoader';
import { RouteNamespaceLoader } from './RouteNamespaceLoader';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AiAssistantWidget } from '@/features/ai-assistant';
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
    <div className="relative flex min-h-dvh h-[100dvh] w-full overflow-hidden bg-[var(--crm-app-background)] font-['Outfit'] transition-colors duration-300">
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[80vw] max-w-[800px] aspect-square rounded-full bg-[var(--crm-app-aura-start)] blur-[80px] md:blur-[120px] mix-blend-multiply dark:mix-blend-normal transition-colors duration-500" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] max-w-[600px] aspect-square rounded-full bg-[var(--crm-app-aura-end)] blur-[60px] md:blur-[100px] mix-blend-multiply dark:mix-blend-normal transition-colors duration-500" />
      </div>

      {/* Sidebar - Mobile handles itself with fixed position, Desktop uses sticky/relative */}
      <Sidebar items={items} />

      <div className="flex flex-1 flex-col h-full min-h-0 overflow-hidden relative z-10">
        <Navbar />
        <TooltipProvider delayDuration={200}>
          <div className="flex-1 min-h-0 relative">
            <main className="absolute inset-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 text-foreground scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent touch-pan-y overscroll-contain [-webkit-overflow-scrolling:touch]">
              <div className="w-full min-h-full max-w-[1920px] mx-auto pb-8">
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
      <AiAssistantWidget />
      
    </div>
  );
}
