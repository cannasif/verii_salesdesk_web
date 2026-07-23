import { type ReactElement } from 'react';
import { Check, Palette } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Switch } from '@/components/ui/switch';
import { brandThemes } from '@/lib/brand-themes';
import { cn } from '@/lib/utils';

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function ThemeColorPill({ swatches }: { swatches: readonly [string, string, string] }): ReactElement {
  return (
    <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200/50 bg-slate-50/90 p-1.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="flex h-full w-full overflow-hidden rounded-full">
        {swatches.map((color) => (
          <span
            key={color}
            aria-hidden
            className="h-full flex-1 opacity-90"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeSelectionIndicator({
  selected,
  accentColor,
}: {
  selected: boolean;
  accentColor: string;
}): ReactElement {
  if (selected) {
    return (
      <span
        className="flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: withAlpha(accentColor, 0.88) }}
        aria-hidden
      >
        <Check size={10} className="text-white/95" strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span
      className="h-[1.125rem] w-[1.125rem] shrink-0 rounded-full border border-slate-300/40 dark:border-white/15"
      aria-hidden
    />
  );
}

export function BrandThemeSettings(): ReactElement {
  const { brandTheme, setBrandTheme, isBrandThemeActive, setIsBrandThemeActive } = useTheme();

  return (
    <div
      className={cn(
        'group w-full border rounded-[1.5rem] md:rounded-[2rem] transition-all',
        'border-slate-100/80 bg-slate-50/40 dark:border-white/[0.06] dark:bg-white/[0.03]',
      )}
    >
      <div className="flex items-center justify-between p-2 md:p-3 lg:p-4">
        <div className="flex flex-1 items-center gap-3 md:gap-4">
          <div
            className={cn(
              'rounded-2xl p-2.5 shadow-sm md:p-4',
              'bg-[var(--crm-brand-soft)] text-[var(--crm-brand-primary)]',
            )}
          >
            <Palette size={18} className="md:h-6 md:w-6" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold md:text-base lg:text-lg">Özel temaları kullan</p>
            <p className="hidden text-[10px] text-slate-500/80 sm:block md:text-xs dark:text-white/40">
              Açıldığında V3RII kurumsal temalarından birini seçebilirsiniz
            </p>
          </div>
        </div>
        <Switch
          checked={isBrandThemeActive}
          onCheckedChange={setIsBrandThemeActive}
          className="scale-75 md:scale-100"
        />
      </div>

      {isBrandThemeActive ? (
        <div className="max-h-[min(28rem,52vh)] space-y-2 overflow-y-auto border-t border-slate-200/70 px-2 pb-2 pt-2.5 dark:border-white/[0.06] md:px-3 md:pb-3 md:pt-3 lg:px-4 lg:pb-4">
          {brandThemes.map((theme) => {
            const selected = brandTheme === theme.id;
            const accentColor = theme.swatches[1];

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setBrandTheme(theme.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-[1.15rem] border px-3 py-2.5 text-left transition-all duration-300 ease-out md:gap-3.5 md:px-3.5 md:py-3',
                  selected
                    ? 'border-transparent'
                    : 'border-transparent bg-slate-100/50 hover:bg-slate-100/80 dark:bg-white/[0.025] dark:hover:bg-white/[0.05]',
                )}
                style={
                  selected
                    ? {
                        backgroundColor: withAlpha(accentColor, 0.08),
                        borderColor: withAlpha(accentColor, 0.28),
                        boxShadow: `inset 0 0 0 1px ${withAlpha(accentColor, 0.22)}, 0 6px 18px -14px ${withAlpha(accentColor, 0.45)}`,
                      }
                    : undefined
                }
              >
                <ThemeColorPill swatches={theme.swatches} />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white/95">{theme.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500/90 dark:text-white/38">
                    {theme.description}
                  </p>
                </div>

                <ThemeSelectionIndicator selected={selected} accentColor={accentColor} />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
