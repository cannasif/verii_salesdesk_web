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
import type { SalesDeskInvoiceDto } from '../../api/salesdesk-api';
import type { InvoiceShareContact } from '../../lib/salesdesk-invoice-share';
import {
  downloadInvoicePdf,
  exportInvoiceToExcel,
  shareInvoiceViaGmail,
  shareInvoiceViaWhatsApp,
} from '../../lib/salesdesk-invoice-share';
import {
  buildSalesDeskInvoicePreviewDataFromDto,
} from '../../lib/build-salesdesk-invoice-preview-data';
import type { SalesDeskQuotePreviewData } from '../../lib/build-salesdesk-quote-preview-data';
import { cn } from '@/lib/utils';

type ShareAction = 'preview' | 'pdf' | 'excel' | 'gmail' | 'whatsapp';

interface SalesDeskInvoiceShareActionsProps {
  invoice: SalesDeskInvoiceDto;
  contact?: InvoiceShareContact | null;
  onPreview?: (payload: { data: SalesDeskQuotePreviewData; invoice: SalesDeskInvoiceDto }) => void;
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
          className={cn('h-8 w-8 shrink-0', toneClass)}
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

export function SalesDeskInvoiceShareActions({
  invoice,
  contact,
  onPreview,
}: SalesDeskInvoiceShareActionsProps): ReactElement {
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
        className="flex items-center justify-end gap-0.5"
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
            onPreview({ data: buildSalesDeskInvoicePreviewDataFromDto(invoice), invoice });
            toast.success('Onizleme acildi.');
          }}
        />
        <ActionIconButton
          label="PDF Indir"
          icon={FileText}
          loading={activeAction === 'pdf'}
          disabled={Boolean(activeAction)}
          onClick={() => runAction('pdf', 'PDF', () => downloadInvoicePdf(invoice))}
        />
        <ActionIconButton
          label="Excel Indir"
          icon={FileSpreadsheet}
          loading={activeAction === 'excel'}
          disabled={Boolean(activeAction)}
          onClick={() => runAction('excel', 'Excel', () => exportInvoiceToExcel(invoice))}
        />
        <ActionIconButton
          label="Gmail"
          icon={Mail}
          tone="brand"
          loading={activeAction === 'gmail'}
          disabled={Boolean(activeAction)}
          onClick={() => runAction('gmail', 'Gmail', () => shareInvoiceViaGmail(invoice, contact))}
        />
        <ActionIconButton
          label="WhatsApp"
          icon={MessageCircle}
          tone="success"
          loading={activeAction === 'whatsapp'}
          disabled={Boolean(activeAction)}
          onClick={() => runAction('whatsapp', 'WhatsApp', () => shareInvoiceViaWhatsApp(invoice, contact))}
        />
      </div>
    </TooltipProvider>
  );
}
