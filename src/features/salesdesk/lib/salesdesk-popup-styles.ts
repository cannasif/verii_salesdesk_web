/** SalesDesk popup / dialog / toolbar — kurumsal slate-mavi token'lari. */

export const SD_BRAND_PRIMARY = 'sd-brand-primary';

export const SD_BRAND_SECONDARY = 'sd-brand-secondary';

export const SD_SURFACE_DIALOG =
  'border border-[var(--crm-app-border)] bg-[var(--crm-app-dialog)] text-slate-900 shadow-xl dark:text-slate-100';

export const SD_SURFACE_PANEL =
  'border border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel-strong)_68%,transparent)] backdrop-blur-xl';

export const SD_FORM_LABEL =
  'mb-1.5 ml-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-app-text-muted)]';

/** Popup input focus — sari/altin parlama (Navy Gold). */
export const SD_FORM_FOCUS_GLOW = [
  'focus-visible:!border-[var(--crm-brand-accent)] focus-visible:!ring-0 focus-visible:!ring-offset-0',
  'focus-visible:!shadow-[0_0_0_3px_var(--crm-brand-focus-glow)]',
  'focus:!border-[var(--crm-brand-accent)] focus:!shadow-[0_0_0_3px_var(--crm-brand-focus-glow)]',
].join(' ');

export const SD_FORM_INPUT = [
  'h-9 rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] text-sm text-slate-100',
  'placeholder:text-[var(--crm-app-text-muted)]',
  SD_FORM_FOCUS_GLOW,
  'transition-[color,box-shadow,border-color] duration-150',
].join(' ');

export const SD_FORM_SECTION =
  'col-span-full mb-0.5 mt-2 border-b border-[var(--crm-app-border)] pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--crm-brand-text)] first:mt-0';

export const SD_FORM_GRID = 'grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2';

export const SD_DIALOG_CONTENT_COMPACT = [
  'flex !max-h-[min(88vh,640px)] w-[calc(100%-1.5rem)] max-w-[520px] !flex-col !gap-0 overflow-hidden !p-0',
  'rounded-xl shadow-2xl shadow-black/30',
  SD_SURFACE_DIALOG,
].join(' ');

/** Form dialog — CRM duzeni, SalesDesk renk token'lari. */
export const SD_DIALOG_CONTENT_FORM = [
  'flex !max-h-[90vh] w-[95%] !max-w-[900px] !flex-col !gap-0 overflow-hidden !p-0',
  'rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-dialog)] text-slate-900 shadow-2xl dark:text-white',
  'sm:w-full',
].join(' ');

export const SD_DIALOG_HEADER_FORM = [
  'sticky top-0 z-10 flex shrink-0 flex-col gap-5 border-b border-[var(--crm-app-border)]',
  'bg-[color-mix(in_srgb,var(--crm-app-dialog)_95%,transparent)] px-6 py-5 backdrop-blur-md',
].join(' ');

export const SD_DIALOG_HEADER_ROW =
  'flex w-full flex-row items-center justify-between gap-4';

export const SD_DIALOG_BODY_FORM =
  'custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6 sm:p-8';

export const SD_DELETE_FOOTER = 'border-t border-[var(--crm-app-border)] bg-[var(--crm-app-dialog-footer)]';

export const SD_DIALOG_FOOTER_FORM = [
  SD_DELETE_FOOTER,
  'flex shrink-0 flex-row items-center justify-end gap-3 px-6 py-4 sm:px-8',
].join(' ');

/** Gradient ikon kutusu — CRM basligi, marka gradyani. */
export const SD_DIALOG_ICON_GRADIENT = [
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
  'bg-[image:var(--crm-brand-gradient)] shadow-[0_10px_20px_-10px_var(--crm-brand-shadow)]',
].join(' ');

export const SD_DIALOG_ICON_RING_FORM = SD_DIALOG_ICON_GRADIENT;

export const SD_FORM_INPUT_MD = [
  'h-12 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] text-sm text-slate-900 dark:text-slate-100',
  'placeholder:text-[var(--crm-app-text-muted)]',
  SD_FORM_FOCUS_GLOW,
  'transition-[color,box-shadow,border-color] duration-200',
].join(' ');

export const SD_FORM_LABEL_ICON =
  'mb-2 ml-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--crm-app-text-muted)]';

export const SD_FORM_LABEL_ICON_SVG = 'shrink-0 text-[var(--crm-brand-primary)]';

export const SD_FORM_GRID_MD = 'grid grid-cols-1 items-start gap-x-5 gap-y-5 sm:grid-cols-2';

export const SD_FORM_HINT =
  'mt-1.5 text-[11px] leading-relaxed text-[var(--crm-app-text-muted)]';

export const SD_PRIMARY_BUTTON_FORM = [
  SD_BRAND_PRIMARY,
  'h-12 min-w-[140px] rounded-xl px-10 text-sm font-bold',
  'shadow-[0_10px_20px_-10px_var(--crm-brand-shadow)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)]',
  'transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
].join(' ');

export const SD_SECONDARY_BUTTON_FORM = [
  SD_BRAND_SECONDARY,
  'h-12 rounded-xl px-6 text-sm font-medium text-slate-600 dark:text-slate-300',
  'transition-all duration-200 hover:scale-[1.01]',
].join(' ');

export const SD_DIALOG_HEADER_COMPACT =
  'flex shrink-0 flex-row items-center justify-between space-y-0 border-b border-[var(--crm-app-border)] bg-[var(--crm-app-dialog)] px-5 py-3.5';

export const SD_DIALOG_BODY_COMPACT = 'custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4';

export const SD_DIALOG_FOOTER_COMPACT = [
  SD_DELETE_FOOTER,
  'flex shrink-0 flex-row items-center justify-end gap-2 px-5 py-3',
].join(' ');

export const SD_DIALOG_TITLE = 'text-xl font-bold tracking-tight text-slate-900 dark:text-white';

export const SD_DIALOG_DESC = 'text-sm text-[var(--crm-app-text-muted)]';

export const SD_DIALOG_ICON_RING_COMPACT =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-brand-soft)]';

export const SD_SELECT_CONTENT =
  'border border-[var(--crm-app-border)] bg-[var(--crm-app-popover)] text-slate-100';

export const SD_PRIMARY_BUTTON_COMPACT = [
  SD_BRAND_PRIMARY,
  'h-9 rounded-lg px-5 text-xs font-semibold',
  'transition-colors duration-150',
].join(' ');

export const SD_SECONDARY_BUTTON_COMPACT = [
  SD_BRAND_SECONDARY,
  'h-9 rounded-lg px-4 text-xs font-medium text-slate-300',
  'transition-colors duration-150',
].join(' ');

export const SD_FORM_MESSAGE = 'mt-1 text-[10px] text-red-400';

export const SD_DIALOG_ICON_RING =
  'flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-brand-soft)]';

export const SD_DIALOG_ICON_INNER = 'flex items-center justify-center';

export const SD_DIALOG_ICON = 'text-[var(--crm-brand-primary)]';

export const SD_DIALOG_CLOSE = [
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
  'bg-[var(--crm-app-panel-muted)] text-[var(--crm-app-text-muted)] shadow-sm',
  'transition-all duration-300 hover:scale-110 hover:bg-[var(--crm-brand-primary)] hover:text-[var(--crm-brand-on-primary)]',
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
  SD_BRAND_PRIMARY,
  'inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-bold',
  'shadow-[0_10px_20px_-10px_var(--crm-brand-shadow)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)]',
  'transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
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
  'focus:border-[var(--crm-brand-accent)] focus:shadow-[0_0_0_3px_var(--crm-brand-focus-glow)]',
  'focus-visible:border-[var(--crm-brand-accent)] focus-visible:shadow-[0_0_0_3px_var(--crm-brand-focus-glow)]',
].join(' ');

export const SD_SEARCH_ICON_FOCUS =
  'group-focus-within/search:text-[var(--crm-brand-primary)]';

export const SD_FILTER_BADGE =
  'crm-ms-auto inline-flex min-w-5 items-center justify-center rounded-md bg-[var(--crm-brand-soft)] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[var(--crm-brand-text)]';

export const SD_METRIC_CARD = `${SD_SURFACE_PANEL} min-h-[108px] rounded-xl p-5`;

/** KPI istatistik kartlari — Navy Gold token'lari. */
export const SD_KPI_CARD = [
  'group relative overflow-hidden rounded-xl border border-[var(--crm-app-border)]',
  'bg-[var(--crm-app-list-card)] shadow-sm ring-1 ring-[var(--crm-app-border)] backdrop-blur-xl',
  'transition-all duration-300',
  'hover:border-[color-mix(in_srgb,var(--crm-brand-primary)_32%,transparent)]',
  'hover:shadow-[0_10px_28px_rgb(0_0_0_/24%)]',
].join(' ');

export const SD_KPI_CARD_GLOW = [
  'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100',
  'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--crm-brand-primary)_8%,transparent)_0%,transparent_58%)]',
].join(' ');

export const SD_KPI_ICON_BRAND = [
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
  'border-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)]',
  'bg-[var(--crm-brand-soft)] text-[var(--crm-brand-primary)] shadow-sm',
].join(' ');

export const SD_KPI_ICON_EMERALD = [
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
  'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 shadow-sm',
].join(' ');

export const SD_KPI_ICON_AMBER = [
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
  'border-amber-500/25 bg-amber-500/10 text-amber-400 shadow-sm',
].join(' ');

export const SD_KPI_ICON_SKY = [
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
  'border-sky-500/25 bg-sky-500/10 text-sky-400 shadow-sm',
].join(' ');

export const SD_KPI_ICON_ROSE = [
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
  'border-rose-500/25 bg-rose-500/10 text-rose-400 shadow-sm',
].join(' ');

export const SD_KPI_ACCENT_BRAND =
  'absolute inset-y-0 left-0 w-1 bg-[var(--crm-brand-primary)] opacity-80';

export const SD_KPI_ACCENT_EMERALD = 'absolute inset-y-0 left-0 w-1 bg-emerald-500 opacity-80';

export const SD_KPI_ACCENT_AMBER = 'absolute inset-y-0 left-0 w-1 bg-amber-500 opacity-80';

export const SD_KPI_ACCENT_SKY = 'absolute inset-y-0 left-0 w-1 bg-sky-500 opacity-80';

export const SD_KPI_ACCENT_ROSE = 'absolute inset-y-0 left-0 w-1 bg-rose-500 opacity-80';

export const SD_LIST_CARD =
  'gap-0 overflow-hidden rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-0 shadow-sm backdrop-blur-xl';

export const SD_LIST_CARD_HEADER =
  'space-y-3 rounded-t-xl border-b border-[var(--crm-app-border)] bg-[var(--crm-app-list-card-header)] px-4 pb-4 pt-4 sm:space-y-4 sm:px-6 sm:pb-6 sm:pt-6';

export const SD_LIST_CARD_CONTENT =
  'bg-[var(--crm-app-list-card-content)] px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-4';

export const SD_TABLE_SHELL =
  'overflow-hidden rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-table-shell)]';


export const SD_METRIC_VALUE_PRIMARY = 'text-slate-100';
export const SD_METRIC_VALUE_MUTED = 'text-slate-300';
export const SD_METRIC_VALUE_SUCCESS = 'text-emerald-400';
export const SD_METRIC_VALUE_WARNING = 'text-amber-400';
