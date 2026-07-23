import { type ComponentType, type ReactElement } from 'react';
import { Coins, DollarSign, Euro, PoundSterling } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAVBAR_LIVE_RATE_DISPLAY, type NavbarLiveRateCode } from '@/lib/live-exchange-rates';
import { useNavbarLiveExchangeRates, LIVE_RATE_REFRESH_MS } from '@/hooks/useNavbarLiveExchangeRates';

interface NavbarLiveExchangeRatesProps {
  codes?: readonly NavbarLiveRateCode[];
  className?: string;
}

const RATE_ICON_META: Record<
  NavbarLiveRateCode,
  {
    Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    iconClass: string;
    chipClass: string;
    iconBgClass: string;
  }
> = {
  USD: {
    Icon: DollarSign,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    iconBgClass: 'bg-emerald-500/12 dark:bg-emerald-500/15',
    chipClass: 'from-emerald-500/8 to-emerald-500/4 border-emerald-500/25',
  },
  EUR: {
    Icon: Euro,
    iconClass: 'text-sky-600 dark:text-sky-400',
    iconBgClass: 'bg-sky-500/12 dark:bg-sky-500/15',
    chipClass: 'from-sky-500/8 to-sky-500/4 border-sky-500/25',
  },
  GBP: {
    Icon: PoundSterling,
    iconClass: 'text-orange-600 dark:text-orange-400',
    iconBgClass: 'bg-orange-500/12 dark:bg-orange-500/15',
    chipClass: 'from-orange-500/8 to-orange-500/4 border-orange-500/25',
  },
  ALTIN: {
    Icon: Coins,
    iconClass: 'text-amber-600 dark:text-amber-400',
    iconBgClass: 'bg-amber-500/14 dark:bg-amber-500/18',
    chipClass: 'from-amber-500/10 to-amber-500/4 border-amber-500/30',
  },
};

function formatUpdatedAt(value: Date | null): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

export function NavbarLiveExchangeRates({
  codes,
  className,
}: NavbarLiveExchangeRatesProps): ReactElement {
  const { displayRates, isLoading, updatedAt } = useNavbarLiveExchangeRates();
  const updatedLabel = formatUpdatedAt(updatedAt);
  const visibleRates = codes?.length
    ? displayRates.filter((rate) => codes.includes(rate.code))
    : displayRates;

  return (
    <div
      className={cn(
        'scrollbar-hide flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-1.5',
        className
      )}
      title={
        updatedLabel
          ? `Canli kurlar · Son guncelleme ${updatedLabel} · ${Math.round(LIVE_RATE_REFRESH_MS / 60_000)} dk'da bir yenilenir`
          : 'Canli kurlar'
      }
    >
      {visibleRates.map((rate) => {
        const pending = 'pending' in rate && rate.pending;
        const meta = RATE_ICON_META[rate.code];
        const display = NAVBAR_LIVE_RATE_DISPLAY[rate.code];
        const Icon = meta.Icon;
        const valueLabel = pending && isLoading ? 'Yükleniyor' : rate.formatted;

        return (
          <div
            key={rate.code}
            aria-label={`${display.label}: ${valueLabel}`}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-xl border bg-gradient-to-b px-1.5 py-1 shadow-sm sm:gap-2 sm:px-2.5 sm:py-1.5',
              meta.chipClass,
              (isLoading || pending) && 'animate-pulse opacity-90'
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/[0.06] shadow-sm dark:border-white/10 sm:h-8 sm:w-8',
                meta.iconBgClass,
                meta.iconClass
              )}
              aria-hidden
            >
              <Icon className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[10px] font-semibold tracking-wide text-slate-600 dark:text-slate-300 sm:text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-200">{display.shortCode}</span>
                <span className="mx-1 hidden xl:inline text-slate-400 dark:text-slate-500">·</span>
                <span className="hidden xl:inline">{display.label}</span>
              </span>
              <span className="mt-0.5 text-[11px] font-bold tabular-nums tracking-tight text-slate-900 antialiased dark:text-white sm:text-xs">
                {pending && isLoading ? '...' : rate.formatted}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
