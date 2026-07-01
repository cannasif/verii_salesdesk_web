/** Auth sayfalari — SalesDesk Navy Gold token'lari ile uyumlu. */

export const AUTH_SHELL =
  'auth-shell theme-v3rii dark relative w-full min-h-dvh h-[100dvh] overflow-hidden bg-[var(--crm-app-background)] text-slate-100 font-[\'Outfit\']';

export const AUTH_CARD =
  'w-full max-w-md rounded-xl border border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel)_88%,transparent)] p-8 backdrop-blur-xl shadow-[0_20px_40px_rgb(0_0_0_/38%)] md:p-10';

export const AUTH_CARD_ANIMATE = 'animate-[fadeIn_0.8s_ease-out]';

export const AUTH_INPUT =
  'w-full rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-4 py-6 pl-12 pr-10 text-base text-white placeholder-[var(--crm-app-text-muted)] transition-colors duration-150 focus-visible:border-[var(--crm-brand-primary)] focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-[color-mix(in_srgb,var(--crm-app-input)_88%,black)] md:text-sm';

export const AUTH_SELECT_TRIGGER =
  'h-auto w-full min-w-0 overflow-hidden rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] py-6 pl-12 pr-4 text-base text-white transition-colors duration-150 focus:border-[var(--crm-brand-primary)] focus:bg-[color-mix(in_srgb,var(--crm-app-input)_88%,black)] focus:ring-0 focus:ring-offset-0 md:text-sm [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left';

export const AUTH_INPUT_INVALID =
  'border-red-500/80 bg-red-950/10 text-red-100 placeholder-red-300/50 focus-visible:border-red-500';

export const AUTH_ICON =
  'text-[var(--crm-app-text-muted)] transition-colors duration-150 group-focus-within:text-[var(--crm-brand-text)]';

export const AUTH_ICON_INVALID = 'text-red-500';

export const AUTH_PRIMARY_BUTTON =
  'sd-brand-primary flex w-full items-center justify-center rounded-lg py-3.5 text-sm font-semibold uppercase tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70';

export const AUTH_SECONDARY_BUTTON =
  'sd-brand-secondary w-full rounded-lg py-3 text-sm transition-colors duration-150';

export const AUTH_LINK = 'transition-colors duration-150 hover:text-[var(--crm-brand-text)]';

export const AUTH_CHECKBOX_LABEL = 'flex cursor-pointer items-center gap-2 transition-colors hover:text-[var(--crm-brand-text)]';

export const AUTH_SOCIAL_BUTTON =
  'flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] text-slate-300 shadow-sm transition-colors duration-150 hover:border-[var(--crm-brand-primary)] hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-text)]';

export const AUTH_TOGGLE_ACTIVE =
  'border-[color-mix(in_srgb,var(--crm-brand-primary)_40%,transparent)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-text)]';

export const AUTH_TOGGLE_IDLE =
  'border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel)_82%,transparent)] text-slate-300 hover:border-[var(--crm-brand-primary)] hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-text)]';

export const AUTH_SLOGAN_ACCENT =
  'border-b border-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)] font-semibold text-[var(--crm-brand-text)]';

export const AUTH_SELECT_CONTENT =
  'max-h-60 w-[var(--radix-select-trigger-width)] border border-[var(--crm-app-border)] bg-[var(--crm-app-popover)] text-white backdrop-blur-xl';

export const AUTH_SELECT_ITEM =
  'cursor-pointer items-start py-3 focus:bg-[var(--crm-brand-soft)] focus:text-[var(--crm-brand-on-soft)]';

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
