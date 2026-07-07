import { type ReactElement, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentBackButton } from './DocumentBackButton';

export interface ManagementListPageHeaderProps {
  title: string;
  description: string;
  backLabel: string;
  actions?: ReactNode;
  showStats?: boolean;
  onToggleStats?: () => void;
  showStatsLabel?: string;
  hideStatsLabel?: string;
}

export function ManagementListPageHeader({
  title,
  description,
  backLabel,
  actions,
  showStats,
  onToggleStats,
  showStatsLabel = 'İstatistikleri Göster',
  hideStatsLabel = 'İstatistikleri Gizle',
}: ManagementListPageHeaderProps): ReactElement {
  const navigate = useNavigate();

  const handleBack = (): void => {
    navigate(-1);
  };

  const statsVisible = showStats ?? true;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between md:items-center md:gap-6 pt-2">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <DocumentBackButton onBack={handleBack} backLabel={backLabel} />
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white transition-colors sm:text-3xl">
            {title}
          </h1>
          <p className="text-zinc-500 dark:text-muted-foreground text-sm flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
            {description}
          </p>
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
        {onToggleStats != null ? (
          <Button
            variant="outline"
            onClick={onToggleStats}
            className="h-11 min-h-[44px] w-full px-5 border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all duration-300 active:scale-[0.98] sm:w-auto"
          >
            {statsVisible ? <EyeOff size={18} className="mr-2" /> : <Eye size={18} className="mr-2" />}
            {statsVisible ? hideStatsLabel : showStatsLabel}
          </Button>
        ) : null}
        {actions}
      </div>
    </div>
  );
}
