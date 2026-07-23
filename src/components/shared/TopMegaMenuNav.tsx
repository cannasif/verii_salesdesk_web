import { type ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_SHELL_GUTTER_X } from '@/lib/app-shell-layout';

export interface TopNavItem {
  title: string;
  href?: string;
  icon?: ReactElement;
  children?: TopNavItem[];
}

interface TopMegaMenuNavProps {
  items: TopNavItem[];
}

function chunkIntoColumns<T>(items: T[], columnCount: number): T[][] {
  if (items.length === 0) return [];
  const count = Math.min(columnCount, items.length);
  const perColumn = Math.ceil(items.length / count);
  const columns: T[][] = [];
  for (let index = 0; index < items.length; index += perColumn) {
    columns.push(items.slice(index, index + perColumn));
  }
  return columns;
}

function resolveColumnCount(childCount: number): number {
  if (childCount <= 3) return 1;
  if (childCount <= 6) return 2;
  return 3;
}

const NAV_TAB_BASE = cn(
  'relative inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 xl:px-4',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crm-brand-primary)]/40'
);

const NAV_ICON_BOX = cn(
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200',
  'border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]',
  '[&_svg]:h-[18px] [&_svg]:w-[18px]'
);

export function TopMegaMenuNav({ items }: TopMegaMenuNavProps): ReactElement {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [overlayTop, setOverlayTop] = useState(0);

  const openItem = items.find((item) => (item.href || item.title) === openKey) ?? null;

  const isItemActive = useCallback(
    (item: TopNavItem): boolean => {
      if (item.href === location.pathname) return true;
      return item.children?.some((child) => child.href === location.pathname) ?? false;
    },
    [location.pathname]
  );

  useEffect(() => {
    setOpenKey(null);
  }, [location.pathname]);

  const syncOverlayTop = useCallback((): void => {
    if (!navRef.current) return;
    setOverlayTop(navRef.current.getBoundingClientRect().bottom);
  }, []);

  useEffect(() => {
    if (!openKey) return undefined;

    syncOverlayTop();
    window.addEventListener('resize', syncOverlayTop);
    window.addEventListener('scroll', syncOverlayTop, true);

    return () => {
      window.removeEventListener('resize', syncOverlayTop);
      window.removeEventListener('scroll', syncOverlayTop, true);
    };
  }, [openKey, syncOverlayTop]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpenKey(null);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleCategory = (key: string): void => {
    setOpenKey((current) => (current === key ? null : key));
  };

  const renderTabState = (isOpen: boolean, isActive: boolean): string =>
    cn(
      isOpen || isActive
        ? 'bg-[var(--crm-brand-soft)] text-[var(--crm-brand-on-soft)] shadow-[inset_0_-2px_0_var(--crm-brand-primary)]'
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[.05] dark:hover:text-white'
    );

  return (
    <div
      ref={navRef}
      className="relative hidden shrink-0 border-b border-[var(--crm-app-border)] bg-[var(--crm-app-panel)]/95 backdrop-blur-xl lg:block"
    >
      <div className={cn('overflow-x-auto py-2 scrollbar-hide', APP_SHELL_GUTTER_X)}>
        <div className="mx-auto flex w-max max-w-full items-center justify-center gap-1">
        {items.map((item) => {
          const itemKey = item.href || item.title;
          const hasChildren = Boolean(item.children?.length);
          const isOpen = openKey === itemKey;
          const isActive = isItemActive(item);

          if (!hasChildren && item.href) {
            return (
              <Link
                key={itemKey}
                to={item.href}
                className={cn(NAV_TAB_BASE, renderTabState(false, isActive))}
              >
                {item.icon ? <span className={NAV_ICON_BOX}>{item.icon}</span> : null}
                <span className="whitespace-nowrap">{item.title}</span>
              </Link>
            );
          }

          if (!hasChildren) return null;

          return (
            <button
              key={itemKey}
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggleCategory(itemKey)}
              className={cn(NAV_TAB_BASE, renderTabState(isOpen, isActive))}
            >
              {item.icon ? <span className={NAV_ICON_BOX}>{item.icon}</span> : null}
              <span className="whitespace-nowrap">{item.title}</span>
              <ChevronDown
                size={14}
                className={cn('shrink-0 opacity-70 transition-transform duration-200', isOpen && 'rotate-180')}
              />
            </button>
          );
        })}
        </div>
      </div>

      {openItem?.children?.length ? (
        <>
          <button
            type="button"
            aria-label="Menuyu kapat"
            className="fixed inset-x-0 bottom-0 z-40 bg-black/45 backdrop-blur-[2px] dark:bg-black/60"
            style={{ top: overlayTop }}
            onClick={() => setOpenKey(null)}
          />

          <div className={cn('absolute left-0 right-0 top-full z-50 px-4 pb-4 pt-2 sm:px-6 lg:px-10 xl:px-12 2xl:px-16')}>
            <div
              className={cn(
                'overflow-hidden rounded-2xl border border-[var(--crm-app-border)] shadow-[0_24px_60px_rgba(0,0,0,.35)]',
                'bg-[var(--crm-app-popover)] text-slate-900 dark:text-slate-100',
                'animate-in fade-in-0 slide-in-from-top-2 duration-200'
              )}
            >
              <div className="relative border-b border-[var(--crm-app-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--crm-brand-primary)_10%,transparent)_0%,transparent_55%)] px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex items-center gap-4">
                  {openItem.icon ? (
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] shadow-sm [&_svg]:h-5 [&_svg]:w-5">
                      {openItem.icon}
                    </span>
                  ) : null}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--crm-app-text-muted)]">
                      Menu
                    </p>
                    <h2 className="mt-0.5 text-lg font-bold text-[var(--crm-brand-text)]">{openItem.title}</h2>
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6 sm:py-6">
                <div
                  className={cn(
                    'grid gap-4',
                    resolveColumnCount(openItem.children.length) === 1 && 'grid-cols-1',
                    resolveColumnCount(openItem.children.length) === 2 && 'grid-cols-1 sm:grid-cols-2',
                    resolveColumnCount(openItem.children.length) === 3 && 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                  )}
                >
                  {chunkIntoColumns(openItem.children, resolveColumnCount(openItem.children.length)).map(
                    (columnItems, columnIndex) => (
                      <div key={`${openItem.title}-col-${columnIndex}`} className="space-y-2">
                        {columnItems.map((child) => {
                          const isChildActive = child.href === location.pathname;
                          return (
                            <Link
                              key={child.href || child.title}
                              to={child.href || '#'}
                              onClick={() => setOpenKey(null)}
                              className={cn(
                                'group flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-sm transition-all duration-200',
                                isChildActive
                                  ? 'border-[color-mix(in_srgb,var(--crm-brand-primary)_45%,transparent)] bg-[var(--crm-brand-soft)] font-semibold text-[var(--crm-brand-on-soft)] shadow-sm'
                                  : 'border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/50 text-slate-700 hover:border-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)] hover:bg-[var(--crm-brand-soft)]/35 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
                              )}
                            >
                              <span className="leading-snug">{child.title}</span>
                              <ChevronRight
                                size={16}
                                className={cn(
                                  'shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-70',
                                  isChildActive && 'opacity-100 text-[var(--crm-brand-primary)]'
                                )}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
