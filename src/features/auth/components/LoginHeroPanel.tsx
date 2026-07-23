import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_DISPLAY_NAME, SALESDESK_LOGO_ALT, SALESDESK_LOGO_URL } from '@/lib/brand-assets';

const FLOW_STEPS = [
  { key: 'customers', icon: BriefcaseBusiness, labelKey: 'login.flowStepCustomers' as const },
  { key: 'stock', icon: Package, labelKey: 'login.flowStepStock' as const },
  { key: 'sales', icon: FileSpreadsheet, labelKey: 'login.flowStepSales' as const },
  { key: 'visits', icon: MapPin, labelKey: 'login.flowStepVisits' as const },
] as const;

const HIGHLIGHT_KEYS = [
  { key: 'highlight1', icon: Users },
  { key: 'highlight2', icon: TrendingUp },
  { key: 'highlight3', icon: ShieldCheck },
] as const;

const DIFF_KEYS = ['diff1', 'diff2', 'diff3'] as const;

export function LoginHeroPanel({ className }: { className?: string }): ReactElement {
  const { t } = useTranslation(['auth']);

  return (
    <div className={cn('relative flex h-full flex-col justify-center overflow-hidden px-6 py-10 lg:px-12 xl:px-16', className)}>
      <div className="relative z-10 mx-auto w-full max-w-2xl space-y-7">
        <div className="flex items-center gap-4">
          <img
            src={SALESDESK_LOGO_URL}
            alt={SALESDESK_LOGO_ALT}
            className="h-12 w-auto max-w-[140px] object-contain object-left sm:h-14 sm:max-w-[160px]"
          />
          <div className="hidden h-10 w-px bg-[color-mix(in_srgb,var(--crm-brand-primary)_25%,transparent)] sm:block" />
          <p className="hidden max-w-[220px] text-xs leading-relaxed text-slate-400 sm:block">
            {t('login.heroTagline')}
          </p>
        </div>

        <span className="inline-flex max-w-full items-start gap-2 rounded-2xl border border-[color-mix(in_srgb,#fbbf24_50%,transparent)] bg-[color-mix(in_srgb,#fbbf24_14%,var(--crm-app-panel))] px-4 py-2.5 text-[11px] font-semibold leading-relaxed tracking-wide text-[#fde68a] shadow-[0_0_32px_color-mix(in_srgb,#fbbf24_18%,transparent)] sm:text-xs">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--crm-brand-accent)]" />
          <span>{t('login.heroBadge')}</span>
        </span>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-[2.75rem]">
            {t('login.heroTitle')}{' '}
            <span className="text-[#fbbf24] drop-shadow-[0_0_24px_rgba(251,191,36,0.5)]">
              {APP_DISPLAY_NAME}
            </span>
            {t('login.heroTitleSuffix')}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-300">{t('login.heroDescription')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {HIGHLIGHT_KEYS.map(({ key, icon: Icon }) => (
            <span
              key={key}
              className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--crm-brand-primary)_30%,var(--crm-app-border))] bg-[color-mix(in_srgb,var(--crm-app-panel)_88%,black)] px-3 py-1.5 text-xs font-medium text-slate-200"
            >
              <Icon className="h-3.5 w-3.5 text-[var(--crm-brand-primary)]" />
              {t(`login.${key}`)}
            </span>
          ))}
        </div>

        <div className="rounded-2xl border border-[color-mix(in_srgb,#fbbf24_38%,var(--crm-app-border))] bg-[color-mix(in_srgb,var(--crm-app-panel)_92%,black)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_color-mix(in_srgb,#fbbf24_16%,transparent)]">
          <div className="mb-4 space-y-1">
            <p className="text-sm font-bold text-white">{t('login.flowTitle')}</p>
            <p className="text-xs leading-relaxed text-slate-400">{t('login.flowSubtitle')}</p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            {FLOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-[color-mix(in_srgb,#fbbf24_32%,var(--crm-app-border))] bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_90%,black)] p-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[color-mix(in_srgb,#fbbf24_45%,transparent)] bg-[color-mix(in_srgb,#fbbf24_12%,black)] text-[#fbbf24] shadow-[0_0_20px_color-mix(in_srgb,#fbbf24_20%,transparent)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold leading-snug text-slate-100">{t(step.labelKey)}</span>
                    <span className="w-fit rounded-full bg-[color-mix(in_srgb,var(--crm-brand-primary)_14%,black)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--crm-brand-primary)] ring-1 ring-[var(--crm-brand-ring)]">
                      {t('login.flowLive')}
                    </span>
                  </div>
                  {index < FLOW_STEPS.length - 1 ? (
                    <ChevronRight
                      className="hidden h-7 w-7 shrink-0 text-[#fbbf24] drop-shadow-[0_0_8px_#fbbf24] lg:block"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {DIFF_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-start gap-2 rounded-xl border border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel)_80%,transparent)] px-3 py-2.5"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--crm-brand-primary)]" />
              <span className="text-[11px] leading-relaxed text-slate-300">{t(`login.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
