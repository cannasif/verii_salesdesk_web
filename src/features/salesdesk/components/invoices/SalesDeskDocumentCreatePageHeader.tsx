import { type ReactElement } from 'react';
import { ArrowLeft, CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SalesDeskDocumentCreatePageHeaderProps {
  title: string;
  description: string;
  onBack: () => void;
  backLabel?: string;
  helpTitle: string;
  helpSteps: string[];
  helpTriggerLabel?: string;
}

export function SalesDeskDocumentCreatePageHeader({
  title,
  description,
  onBack,
  backLabel = 'Geri',
  helpTitle,
  helpSteps,
  helpTriggerLabel = 'Yardim',
}: SalesDeskDocumentCreatePageHeaderProps): ReactElement {
  return (
    <header className="relative pb-4 pt-0 sm:pt-0.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onBack}
            title={backLabel}
            aria-label={backLabel}
            className={cn(
              'h-10 w-10 shrink-0 rounded-xl border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] shadow-sm',
              'hover:border-[color-mix(in_srgb,var(--crm-brand-primary)_45%,transparent)]',
              'hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-on-soft)]',
              'transition-colors duration-200'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm font-medium leading-relaxed text-zinc-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 justify-end sm:pt-1">
          <button
            type="button"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--crm-app-border)]',
              'bg-[var(--crm-app-panel)] text-[var(--crm-app-text-muted)] shadow-sm outline-none transition-all',
              'hover:border-[color-mix(in_srgb,var(--crm-brand-primary)_40%,transparent)]',
              'hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-on-soft)]',
              'focus-visible:border-[var(--crm-brand-accent)] focus-visible:ring-2 focus-visible:ring-[var(--crm-brand-focus-glow)]'
            )}
            aria-label={helpTriggerLabel}
            title={[helpTitle, ...helpSteps.map((step, index) => `${index + 1}. ${step}`)].join('\n')}
          >
            <CircleHelp className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
