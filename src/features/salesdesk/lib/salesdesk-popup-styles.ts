/** SalesDesk popup / dialog / toolbar — kurumsal slate-mavi token'lari. */

export const SD_BRAND_PRIMARY = 'sd-brand-primary';

export const SD_BRAND_SECONDARY = 'sd-brand-secondary';

export const SD_SURFACE_DIALOG =
  'border border-[var(--crm-app-border)] bg-[var(--crm-app-dialog)] text-slate-900 shadow-xl dark:text-slate-100';

export const SD_SURFACE_PANEL =
  'border border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel-strong)_68%,transparent)] backdrop-blur-xl';

export const SD_FORM_LABEL =
  'mb-1.5 ml-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-app-text-muted)]';

export const SD_FORM_INPUT = [
  'h-11 rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] text-sm text-slate-100',
  'placeholder:text-[var(--crm-app-text-muted)]',
  'focus-visible:border-[var(--crm-brand-primary)] focus-visible:ring-0 focus-visible:ring-offset-0',
  'focus:border-[var(--crm-brand-primary)] focus:shadow-[0_0_0_2px_var(--crm-brand-ring)]',
  'transition-colors duration-150',
].join(' ');

export const SD_FORM_MESSAGE = 'mt-1 text-[10px] text-red-400';

export const SD_DIALOG_ICON_RING =
  'flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-brand-soft)]';

export const SD_DIALOG_ICON_INNER = 'flex items-center justify-center';

export const SD_DIALOG_ICON = 'text-[var(--crm-brand-primary)]';

export const SD_DIALOG_CLOSE = [
  'flex h-9 w-9 items-center justify-center rounded-lg',
  'border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] text-[var(--crm-app-text-muted)]',
  'transition-colors duration-150 hover:border-[var(--crm-brand-primary)] hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-text)]',
].join(' ');

export const SD_PRIMARY_BUTTON = [
  SD_BRAND_PRIMARY,
  'h-11 rounded-lg px-8 text-sm font-semibold',
  'transition-colors duration-150',
].join(' ');

export const SD_SECONDARY_BUTTON = [
  SD_BRAND_SECONDARY,
  'h-11 rounded-lg px-6 text-sm font-medium text-slate-300',
  'transition-colors duration-150',
].join(' ');

export const SD_ADD_BUTTON = [
  'h-10 inline-flex items-center gap-2 rounded-lg px-4 text-sm font-medium',
  'border border-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)]',
  'bg-[var(--crm-brand-soft)] text-[var(--crm-brand-text)]',
  'hover:border-[var(--crm-brand-primary)] hover:bg-[color-mix(in_srgb,var(--crm-brand-primary)_16%,transparent)] hover:text-[var(--crm-brand-on-soft)]',
  'transition-colors duration-150',
].join(' ');

export const SD_PAGE_PULSE = 'bg-[var(--crm-brand-primary)]';

export const SD_PAGE_TITLE_BAR = 'h-6 w-0.5 rounded-full bg-[var(--crm-brand-primary)]';

export const SD_PAGE_ICON_BOX = [
  'flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--crm-app-border)]',
  'bg-[var(--crm-app-panel-muted)] text-[var(--crm-brand-primary)]',
].join(' ');

export const SD_TOOLBAR_ACTIVE = [
  'bg-[var(--crm-brand-soft)] text-slate-200',
  'border-[var(--crm-brand-primary)]',
  'hover:bg-[color-mix(in_srgb,var(--crm-brand-primary)_12%,transparent)]',
].join(' ');

export const SD_SEARCH_FOCUS = [
  'focus:border-[var(--crm-brand-primary)] focus:ring-[2px] focus:ring-[var(--crm-brand-ring)]',
  'focus-visible:border-[var(--crm-brand-primary)] focus-visible:ring-[2px] focus-visible:ring-[var(--crm-brand-ring)]',
].join(' ');

export const SD_SEARCH_ICON_FOCUS =
  'group-focus-within/search:text-[var(--crm-brand-primary)]';

export const SD_FILTER_BADGE =
  'crm-ms-auto inline-flex min-w-5 items-center justify-center rounded-md bg-[var(--crm-brand-soft)] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[var(--crm-brand-text)]';

export const SD_METRIC_CARD = `${SD_SURFACE_PANEL} min-h-[108px] rounded-xl p-5`;

export const SD_LIST_CARD =
  'gap-0 overflow-hidden rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-0 shadow-sm backdrop-blur-xl';

export const SD_LIST_CARD_HEADER =
  'space-y-3 rounded-t-xl border-b border-[var(--crm-app-border)] bg-[var(--crm-app-list-card-header)] px-4 pb-4 pt-4 sm:space-y-4 sm:px-6 sm:pb-6 sm:pt-6';

export const SD_LIST_CARD_CONTENT =
  'bg-[var(--crm-app-list-card-content)] px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-4';

export const SD_TABLE_SHELL =
  'overflow-hidden rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-table-shell)]';

export const SD_DELETE_FOOTER = 'border-t border-[var(--crm-app-border)] bg-[var(--crm-app-dialog-footer)]';

export const SD_METRIC_VALUE_PRIMARY = 'text-slate-100';
export const SD_METRIC_VALUE_MUTED = 'text-slate-300';
export const SD_METRIC_VALUE_SUCCESS = 'text-emerald-400';
export const SD_METRIC_VALUE_WARNING = 'text-amber-400';
