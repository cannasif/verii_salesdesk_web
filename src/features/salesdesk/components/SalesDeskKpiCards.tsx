import { type ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  SD_KPI_ACCENT_AMBER,
  SD_KPI_ACCENT_BRAND,
  SD_KPI_ACCENT_EMERALD,
  SD_KPI_ACCENT_ROSE,
  SD_KPI_ACCENT_SKY,
  SD_KPI_CARD,
  SD_KPI_CARD_GLOW,
  SD_KPI_ICON_AMBER,
  SD_KPI_ICON_BRAND,
  SD_KPI_ICON_EMERALD,
  SD_KPI_ICON_ROSE,
  SD_KPI_ICON_SKY,
} from '../lib/salesdesk-popup-styles';

export type SalesDeskKpiTone = 'brand' | 'emerald' | 'amber' | 'sky' | 'rose';

export interface SalesDeskKpiItem {
  key: string;
  label: string;
  value: string | number;
  hint?: string;
  tone?: SalesDeskKpiTone;
  icon: LucideIcon;
}

const toneAccent: Record<SalesDeskKpiTone, string> = {
  brand: SD_KPI_ACCENT_BRAND,
  emerald: SD_KPI_ACCENT_EMERALD,
  amber: SD_KPI_ACCENT_AMBER,
  sky: SD_KPI_ACCENT_SKY,
  rose: SD_KPI_ACCENT_ROSE,
};

const toneIconBox: Record<SalesDeskKpiTone, string> = {
  brand: SD_KPI_ICON_BRAND,
  emerald: SD_KPI_ICON_EMERALD,
  amber: SD_KPI_ICON_AMBER,
  sky: SD_KPI_ICON_SKY,
  rose: SD_KPI_ICON_ROSE,
};

const toneValue: Record<SalesDeskKpiTone, string> = {
  brand: 'text-slate-900 dark:text-white',
  emerald: 'text-emerald-600 dark:text-emerald-300',
  amber: 'text-amber-600 dark:text-amber-300',
  sky: 'text-sky-600 dark:text-sky-300',
  rose: 'text-rose-600 dark:text-rose-300',
};

interface SalesDeskKpiCardsProps {
  items: SalesDeskKpiItem[];
  isLoading?: boolean;
  className?: string;
}

function KpiCardSkeleton(): ReactElement {
  return (
    <div className={cn(SD_KPI_CARD, 'p-5 pl-6')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-3 w-24 bg-slate-200/60 dark:bg-white/10" />
          <Skeleton className="h-9 w-16 bg-slate-200/60 dark:bg-white/10" />
          <Skeleton className="h-3 w-32 bg-slate-200/60 dark:bg-white/10" />
        </div>
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg bg-slate-200/60 dark:bg-white/10" />
      </div>
    </div>
  );
}

export function SalesDeskKpiCards({ items, isLoading = false, className }: SalesDeskKpiCardsProps): ReactElement {
  const gridCols =
    items.length >= 4
      ? 'sm:grid-cols-2 xl:grid-cols-4'
      : items.length === 2
        ? 'sm:grid-cols-2'
        : 'sm:grid-cols-2 xl:grid-cols-3';

  if (isLoading) {
    return (
      <div className={cn('grid gap-4', gridCols, className)}>
        {items.map((item) => (
          <KpiCardSkeleton key={item.key} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', gridCols, className)}>
      {items.map((item) => {
        const tone = item.tone ?? 'brand';
        const Icon = item.icon;

        return (
          <div key={item.key} className={cn(SD_KPI_CARD, 'min-h-[120px] p-5 pl-6')}>
            <span className={toneAccent[tone]} aria-hidden />
            <div className={SD_KPI_CARD_GLOW} aria-hidden />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--crm-app-text-muted)]">
                  {item.label}
                </p>
                <p className={cn('mt-2 text-3xl font-bold tabular-nums tracking-tight', toneValue[tone])}>
                  {item.value}
                </p>
                {item.hint ? (
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{item.hint}</p>
                ) : null}
              </div>
              <div className={toneIconBox[tone]}>
                <Icon size={18} strokeWidth={2.25} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
