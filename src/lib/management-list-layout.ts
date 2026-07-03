import { cn } from '@/lib/utils';

/** Liste karti — --crm-app-* token'lari (light/dark otomatik). */
export const MANAGEMENT_LIST_CARD_CLASSNAME =
  'gap-0 overflow-hidden border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-0 shadow-md ring-1 ring-[var(--crm-app-border)] backdrop-blur-xl dark:shadow-sm dark:ring-0';

export const MANAGEMENT_LIST_CARD_HEADER_CLASSNAME =
  'space-y-3 rounded-t-xl border-b border-[var(--crm-app-border)] bg-[var(--crm-app-list-card-header)] px-4 pb-4 pt-4 sm:space-y-4 sm:px-6 sm:pb-6 sm:pt-6';

export const MANAGEMENT_LIST_CARD_TITLE_CLASSNAME = 'text-slate-900 dark:text-white';

export const MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME =
  'bg-[var(--crm-app-list-card-content)] px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-4';

/** Tablo alaninin ic cercevesi (toolbar ile grid arasi). */
export const MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME =
  'overflow-hidden rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-table-shell)] shadow-sm dark:shadow-none';

export const MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME =
  'border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] shadow-sm hover:bg-[var(--crm-app-panel-muted)] dark:bg-transparent dark:shadow-none';

export const MANAGEMENT_LIST_ID_COLUMN_HEAD_CLASSNAME = cn(
  'bg-slate-200/70 dark:bg-white/[0.07] border-r border-[var(--crm-app-border)]',
  'w-[84px] min-w-[84px] max-w-[84px] sm:w-[96px] sm:min-w-[96px] sm:max-w-[96px] md:w-auto md:min-w-[104px] md:max-w-none text-center'
);

export const MANAGEMENT_LIST_ID_COLUMN_CELL_CLASSNAME = cn(
  'text-center font-medium w-[84px] min-w-[84px] max-w-[84px] sm:w-[96px] sm:min-w-[96px] sm:max-w-[96px] md:w-auto md:min-w-[104px] md:max-w-none',
  'bg-slate-100/80 dark:bg-white/[0.04]',
  'border-r border-[var(--crm-app-border)]'
);

export const MANAGEMENT_LIST_ID_COLUMN_DEF = {
  headClassName: MANAGEMENT_LIST_ID_COLUMN_HEAD_CLASSNAME,
  className: MANAGEMENT_LIST_ID_COLUMN_CELL_CLASSNAME,
} as const;

export const ADD_BUTTON_CLASS = [
  'sd-brand-primary',
  'h-10 px-5 rounded-lg text-sm font-semibold',
  'transition-colors duration-150',
].join(' ');

/** DataTableGrid sarmalayici — thead / hucre border ve hover. */
export const MANAGEMENT_DATA_GRID_CLASSNAME = cn(
  'management-data-grid rounded-md',
  '[&_[data-slot=table-container]]:rounded-md',
  '[&_table]:border-collapse [&_thead_tr]:bg-[var(--crm-app-table-head)]',
  '[&_th]:border-b [&_th]:border-r [&_th]:border-[var(--crm-app-border)] [&_th]:font-semibold [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-slate-600 dark:[&_th]:text-slate-300',
  '[&_th:last-child]:border-r-0',
  '[&_td]:border-b [&_td]:border-r [&_td]:border-[var(--crm-app-border)]',
  '[&_td:last-child]:border-r-0',
  '[&_tbody_tr:hover_td]:bg-[var(--crm-app-table-row-hover)]',
  '[&_tbody_tr:hover_td:first-child]:bg-[var(--crm-app-table-head)]'
);

/** Sidebar / navbar cam panel formulü. */
export const CRM_APP_PANEL_GLASS =
  'border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] shadow-sm dark:bg-[color-mix(in_srgb,var(--crm-app-panel)_82%,transparent)] dark:backdrop-blur-xl';

/** Popover / sutun secici arka plani. */
export const CRM_APP_POPOVER_SURFACE =
  'border border-[var(--crm-app-border)] bg-[var(--crm-app-popover)] backdrop-blur-xl shadow-xl rounded-xl';
