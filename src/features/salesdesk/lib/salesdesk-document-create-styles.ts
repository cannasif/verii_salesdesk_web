/** SalesDesk document create wizard — OrderCreateForm yapisina uyumlu, Navy Gold token'lari. */

export const SD_CREATE_SECTION_CARD_CLASSNAME = [
  'relative rounded-2xl overflow-hidden border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)]',
  'shadow-[0_1px_0_rgba(15,23,42,0.05),0_18px_44px_-28px_rgba(0,0,0,0.65)]',
  'ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_18%,transparent)]',
  'dark:bg-[color-mix(in_srgb,var(--crm-app-panel)_90%,transparent)]',
  'transition-shadow duration-300 hover:shadow-[0_1px_0_rgba(15,23,42,0.05),0_24px_56px_-28px_rgba(201,162,39,0.35)]',
].join(' ');

export const SD_CREATE_SECTION_HEADER_CLASSNAME = [
  'sd-doc-section-header relative px-5 py-4 flex items-center gap-3 border-b border-[var(--crm-app-border)]',
  'bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_85%,transparent)]',
  'dark:bg-[color-mix(in_srgb,var(--crm-brand-primary)_7%,transparent)]',
].join(' ');

export const SD_CREATE_HEADER_FORM_SURFACE_CLASSNAME = [
  '[&_label]:text-slate-800 dark:[&_label]:text-slate-200',
  '[&_input]:border-[var(--crm-app-border)] [&_input]:bg-[var(--crm-app-input)] [&_input]:shadow-sm',
  '[&_input]:placeholder:text-[var(--crm-app-text-muted)]',
  '[&_input]:focus-visible:border-[var(--crm-brand-accent)]',
  '[&_input]:focus-visible:ring-[3px] [&_input]:focus-visible:ring-[var(--crm-brand-focus-glow)]',
  '[&_textarea]:border-[var(--crm-app-border)] [&_textarea]:bg-[var(--crm-app-input)] [&_textarea]:shadow-sm',
  '[&_textarea]:placeholder:text-[var(--crm-app-text-muted)]',
  '[&_textarea]:focus-visible:border-[var(--crm-brand-accent)]',
  '[&_textarea]:focus-visible:ring-[3px] [&_textarea]:focus-visible:ring-[var(--crm-brand-focus-glow)]',
  '[&_[data-slot=select-trigger]]:border-[var(--crm-app-border)]',
  '[&_[data-slot=select-trigger]]:bg-[var(--crm-app-input)]',
  '[&_[data-slot=select-trigger]]:shadow-sm',
  '[&_[data-slot=select-trigger]]:focus-visible:border-[var(--crm-brand-accent)]',
  '[&_[data-slot=select-trigger]]:focus-visible:ring-[3px]',
  '[&_[data-slot=select-trigger]]:focus-visible:ring-[var(--crm-brand-focus-glow)]',
].join(' ');

export const SD_CREATE_SECTION_BODY_CLASSNAME =
  'border-t border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel)_88%,transparent)] p-5 dark:bg-[color-mix(in_srgb,var(--crm-app-background)_72%,transparent)]';

export const SD_CREATE_GLASS_CARD_CLASSNAME = [
  'sd-doc-card-sheen relative overflow-hidden rounded-2xl',
  'border border-[var(--crm-app-border)]',
  'bg-[color-mix(in_srgb,var(--crm-app-panel)_90%,transparent)] backdrop-blur-xl',
  'shadow-[0_1px_0_rgba(15,23,42,0.06),0_18px_38px_-26px_rgba(0,0,0,0.7)]',
  'ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_14%,transparent)]',
  'transition-all duration-300',
  'hover:ring-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)]',
  'hover:shadow-[0_1px_0_rgba(15,23,42,0.06),0_22px_48px_-24px_rgba(201,162,39,0.4)]',
].join(' ');

export const SD_CREATE_FORM_INPUT_CLASSNAME = [
  'h-11 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] shadow-sm',
  'text-sm text-slate-100 placeholder:text-[var(--crm-app-text-muted)]',
  'focus-visible:border-[var(--crm-brand-accent)] focus-visible:ring-4',
  'focus-visible:ring-[var(--crm-brand-focus-glow)] focus-visible:ring-offset-0',
].join(' ');

export const SD_CREATE_FORM_LABEL_CLASSNAME =
  'text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-2';

export const SD_CREATE_PAGE_CONTAINER_CLASSNAME = 'w-full max-w-[1600px] mx-auto relative pb-10 px-4 md:px-6';

export const SD_CREATE_MAIN_GRID_CLASSNAME =
  'grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 xl:gap-10 items-start mt-6';

export const SD_CREATE_ACTION_BAR_CLASSNAME =
  'flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-8 mt-8 border-t border-[var(--crm-app-border)]';

export const SD_CREATE_SECTION_BADGE_CLASSNAME =
  'sd-doc-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold';

export const SD_CREATE_SECTION_BADGE_SUMMARY_CLASSNAME =
  'sd-doc-badge-summary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold';

export const SD_CREATE_SECTION_TITLE_CLASSNAME =
  'text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide';
