import { type ReactElement, useState } from 'react';
import {
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SalesDeskQuoteDto } from '../../api/salesdesk-api';
import type { QuoteShareContact } from '../../lib/salesdesk-quote-share';
import {
  downloadQuotePdf,
  exportQuoteToExcel,
  shareQuoteViaGmail,
  shareQuoteViaWhatsApp,
} from '../../lib/salesdesk-quote-share';
import {
  buildSalesDeskQuotePreviewDataFromDto,
  type SalesDeskQuotePreviewData,
} from '../../lib/build-salesdesk-quote-preview-data';
import { cn } from '@/lib/utils';
import { SD_TABLE_ACTION_BUTTON } from '../../lib/salesdesk-popup-styles';

type ShareAction = 'preview' | 'pdf' | 'excel' | 'gmail' | 'whatsapp';

interface SalesDeskQuoteShareActionsProps {
  quote: SalesDeskQuoteDto;
  contact?: QuoteShareContact | null;
  onPreview?: (payload: { data: SalesDeskQuotePreviewData; quote: SalesDeskQuoteDto }) => void;
}

function ActionIconButton({
  label,
  icon: Icon,
  loading,
  disabled,
  onClick,
  tone = 'default',
}: {
  label: string;
  icon: typeof FileText;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  tone?: 'default' | 'brand' | 'success';
}): ReactElement {
  const toneClass =
    tone === 'brand'
      ? 'text-sky-600 hover:bg-sky-500/10 hover:text-sky-500 dark:text-sky-400'
      : tone === 'success'
        ? 'text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-500 dark:text-emerald-400'
        : 'text-slate-500 hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled || loading}
          title={label}
          aria-label={label}
          data-no-drag-scroll="true"
          data-skip-row-double-click="true"
          className={cn(SD_TABLE_ACTION_BUTTON, toneClass)}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClick();
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export function SalesDeskQuoteShareActions({
  quote,
  contact,
  onPreview,
}: SalesDeskQuoteShareActionsProps): ReactElement {
  const [activeAction, setActiveAction] = useState<ShareAction | null>(null);

  const runAction = (action: ShareAction, label: string, task: () => Promise<void>): void => {
    if (activeAction) return;
    setActiveAction(action);
    const toastId = toast.loading(`${label} hazirlaniyor...`);
    void (async () => {
      try {
        await task();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Islem tamamlanamadi.', { id: toastId });
      } finally {
        toast.dismiss(toastId);
        setActiveAction(null);
      }
    })();
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className="flex flex-wrap items-center justify-end gap-1"
        data-no-drag-scroll="true"
        data-skip-row-double-click="true"
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <ActionIconButton
          label="Onizleme"
          icon={Eye}
          loading={activeAction === 'preview'}
          disabled={Boolean(activeAction) || !onPreview}
          onClick={() => {
            if (!onPreview) return;
            onPreview({ data: buildSalesDeskQuotePreviewDataFromDto(quote), quote });
            toast.success('Onizleme acildi.');
          }}
        />
        <ActionIconButton
          label="PDF Indir"
          icon={FileText}
          loading={activeAction === 'pdf'}
          disabled={Boolean(activeAction)}
          onClick={() => runAction('pdf', 'PDF', () => downloadQuotePdf(quote))}
        />
        <ActionIconButton
          label="Excel Indir"
          icon={FileSpreadsheet}
          loading={activeAction === 'excel'}
          disabled={Boolean(activeAction)}
          onClick={() => runAction('excel', 'Excel', () => exportQuoteToExcel(quote))}
        />
        <ActionIconButton
          label="Gmail"
          icon={Mail}
          tone="brand"
          loading={activeAction === 'gmail'}
          disabled={Boolean(activeAction)}
          onClick={() => runAction('gmail', 'Gmail', () => shareQuoteViaGmail(quote, contact))}
        />
        <ActionIconButton
          label="WhatsApp"
          icon={MessageCircle}
          tone="success"
          loading={activeAction === 'whatsapp'}
          disabled={Boolean(activeAction)}
          onClick={() => runAction('whatsapp', 'WhatsApp', () => shareQuoteViaWhatsApp(quote, contact))}
        />
      </div>
    </TooltipProvider>
  );
}
