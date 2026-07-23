/** Auth sayfalari — SalesDesk Navy Gold token'lari ile uyumlu. */

export const AUTH_SHELL =
  'auth-shell theme-v3rii theme-v3rii-merkez dark relative w-full min-h-dvh h-[100dvh] overflow-hidden bg-[#0f0b06] text-slate-100 font-[\'Outfit\']';

export const AUTH_LAYOUT =
  'relative z-10 flex min-h-dvh w-full flex-col lg:flex-row';

export const AUTH_HERO_COLUMN =
  'hidden lg:flex lg:w-[58%] xl:w-[56%] border-r border-[var(--crm-app-border)]';

export const AUTH_FORM_COLUMN =
  'flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-14';

export const AUTH_CARD =
  'w-full max-w-[440px] rounded-3xl border border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel)_78%,transparent)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-10';

export const AUTH_CARD_ANIMATE = 'animate-[fadeIn_0.8s_ease-out]';

export const AUTH_CARD_EYEBROW =
  'text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--crm-brand-on-soft)]';

export const AUTH_CARD_TITLE = 'mt-3 text-2xl font-bold tracking-tight text-white md:text-[1.75rem]';

export const AUTH_CARD_SUBTITLE = 'mt-2 text-sm leading-relaxed text-slate-400';

export const AUTH_INPUT =
  'h-12 w-full rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-4 py-3 pl-12 pr-10 text-sm text-white placeholder:text-[var(--crm-app-text-muted)] transition-colors duration-150 focus-visible:border-[var(--crm-brand-primary)] focus-visible:ring-2 focus-visible:ring-[var(--crm-brand-ring)] focus-visible:ring-offset-0';

export const AUTH_SELECT_TRIGGER =
  'h-12 w-full min-w-0 overflow-hidden rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] py-3 pl-12 pr-4 text-sm text-white transition-colors duration-150 focus:border-[var(--crm-brand-primary)] focus:ring-2 focus:ring-[var(--crm-brand-ring)] focus:ring-offset-0 [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left';

export const AUTH_INPUT_INVALID =
  'border-red-500/70 bg-red-950/20 text-red-100 placeholder-red-300/50 focus-visible:border-red-500 focus-visible:ring-red-500/20';

export const AUTH_ICON =
  'text-[var(--crm-app-text-muted)] transition-colors duration-150 group-focus-within:text-[var(--crm-brand-accent)]';

export const AUTH_ICON_INVALID = 'text-red-400';

export const AUTH_PRIMARY_BUTTON =
  'sd-brand-primary flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold uppercase tracking-wide transition-all duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70';

export const AUTH_SECONDARY_BUTTON =
  'sd-brand-secondary w-full rounded-xl py-3 text-sm transition-colors duration-150';

export const AUTH_LINK =
  'font-medium text-[var(--crm-brand-accent)] transition-colors duration-150 hover:text-[var(--crm-brand-on-soft)]';

export const AUTH_CHECKBOX_LABEL =
  'flex cursor-pointer items-center gap-2 text-slate-400 transition-colors hover:text-[var(--crm-brand-on-soft)]';

export const AUTH_SOCIAL_BUTTON =
  'flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] text-slate-300 shadow-sm transition-colors duration-150 hover:border-[var(--crm-brand-primary)] hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]';

export const AUTH_TOGGLE_ACTIVE =
  'border-[color-mix(in_srgb,var(--crm-brand-primary)_40%,transparent)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-accent)]';

export const AUTH_TOGGLE_IDLE =
  'border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] text-slate-300 hover:border-[var(--crm-brand-primary)] hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]';

export const AUTH_SLOGAN_ACCENT =
  'border-b border-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)] font-semibold text-[var(--crm-brand-accent)]';

export const AUTH_SECURE_FOOTER =
  'mt-6 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--crm-app-text-muted)]';

export const AUTH_SELECT_CONTENT =
  'z-[100] max-h-60 w-[var(--radix-select-trigger-width)] border border-[var(--crm-app-border)] !bg-[var(--crm-app-popover)] text-white shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl';

export const AUTH_SELECT_ITEM =
  'cursor-pointer items-start py-3 text-slate-200 data-[highlighted]:!bg-[var(--crm-brand-soft)] data-[highlighted]:!text-[var(--crm-brand-on-soft)] focus:!bg-[var(--crm-brand-soft)] focus:!text-[var(--crm-brand-on-soft)]';

export const AUTH_MOBILE_HERO =
  'lg:hidden border-b border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel)_60%,transparent)] px-4 py-6 backdrop-blur-md';

export const AUTH_AUTOFILL_CSS = `
  input { color-scheme: dark; }
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px var(--crm-app-input) inset !important;
    -webkit-text-fill-color: white !important;
    transition: background-color 5000s ease-in-out 0s;
    caret-color: white;
    color-scheme: dark;
  }
`;
