import { type ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2, Mail, MessageCircle, Printer } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SD_DIALOG_DESC, SD_DIALOG_TITLE, SD_SURFACE_DIALOG } from '../../lib/salesdesk-popup-styles';
import type { SalesDeskQuotePreviewData } from '../../lib/build-salesdesk-quote-preview-data';
import {
  buildSalesDeskQuotePdfBlob,
  buildSalesDeskQuotePdfFileName,
  downloadBlob,
} from '../../lib/export-salesdesk-quote-pdf';
import type { QuoteShareContact } from '../../lib/salesdesk-quote-share';
import {
  exportQuotePreviewToExcel,
  exportQuoteToExcel,
  shareQuotePreviewViaGmail,
  shareQuotePreviewViaWhatsApp,
} from '../../lib/salesdesk-quote-share';
import type { InvoiceShareContact } from '../../lib/salesdesk-invoice-share';
import {
  exportInvoicePreviewToExcel,
  exportInvoiceToExcel,
  shareInvoicePreviewViaGmail,
  shareInvoicePreviewViaWhatsApp,
} from '../../lib/salesdesk-invoice-share';
import type { SalesDeskInvoiceDto, SalesDeskQuoteDto } from '../../api/salesdesk-api';
import { SalesDeskQuotePreviewDocument } from './SalesDeskQuotePreviewDocument';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SalesDeskQuotePreviewDialogProps {
  open: boolean;
  data: SalesDeskQuotePreviewData | null;
  onOpenChange: (open: boolean) => void;
  variant?: 'quote' | 'invoice';
  quote?: Pick<SalesDeskQuoteDto, 'id' | 'customerId' | 'quoteNumber' | 'customerName'> | null;
  invoice?: Pick<SalesDeskInvoiceDto, 'id' | 'customerId' | 'invoiceNumber' | 'customerName'> | null;
  contact?: QuoteShareContact | InvoiceShareContact | null;
  quoteForExcel?: SalesDeskQuoteDto | null;
  invoiceForExcel?: SalesDeskInvoiceDto | null;
}

type ShareAction = 'pdf' | 'excel' | 'gmail' | 'whatsapp' | null;

export function SalesDeskQuotePreviewDialog({
  open,
  data,
  onOpenChange,
  variant = 'quote',
  contact,
  quoteForExcel,
  invoiceForExcel,
  quote,
  invoice,
}: SalesDeskQuotePreviewDialogProps): ReactElement {
  const printRootRef = useRef<HTMLDivElement>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [shareAction, setShareAction] = useState<ShareAction>(null);

  useEffect(() => {
    if (!open) {
      setIsPdfLoading(false);
      setShareAction(null);
    }
  }, [open]);

  const handlePrint = useCallback((): void => {
    window.print();
  }, []);

  const handleDownload = useCallback(async (): Promise<void> => {
    if (!data || isPdfLoading) return;
    setIsPdfLoading(true);
    const toastId = toast.loading('PDF hazirlaniyor (onizleme tasarimi)...');
    try {
      const blob = await buildSalesDeskQuotePdfBlob(data, {
        sourceElement: printRootRef.current,
      });
      downloadBlob(blob, buildSalesDeskQuotePdfFileName(data));
      toast.success('PDF indirildi (onizleme tasarimi).', { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'PDF olusturulamadi.', { id: toastId });
    } finally {
      setIsPdfLoading(false);
    }
  }, [data, isPdfLoading]);

  const isInvoice = variant === 'invoice';
  const dialogTitle = isInvoice ? 'Fatura Önizleme' : 'Teklif Önizleme';
  const emptyLabel = isInvoice ? 'Fatura belgesi' : 'Teklif belgesi';

  const getPdfShareOptions = useCallback(
    () => ({
      sourceElement: printRootRef.current,
      quote: quoteForExcel ?? quote ?? null,
      invoice: invoiceForExcel ?? invoice ?? null,
    }),
    [quoteForExcel, quote, invoiceForExcel, invoice],
  );

  const runShareAction = async (action: ShareAction, task: () => Promise<void>): Promise<void> => {
    if (shareAction) return;
    setShareAction(action);
    const toastId = toast.loading('Hazirlaniyor...');
    try {
      await task();
      toast.dismiss(toastId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Islem tamamlanamadi.', { id: toastId });
    } finally {
      setShareAction(null);
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #salesdesk-quote-print-root,
          #salesdesk-quote-print-root * {
            visibility: visible !important;
          }
          #salesdesk-quote-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .quote-preview-page {
            box-shadow: none !important;
            ring: none !important;
            margin: 0 !important;
            page-break-after: always;
          }
          .quote-preview-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            'flex h-[min(92vh,900px)] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl',
            SD_SURFACE_DIALOG
          )}
        >
          <div className="flex shrink-0 flex-col gap-3 border-b border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel-strong)_55%,transparent)] px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-brand-primary)_16%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)]">
                  <FileText className="h-5 w-5 text-[var(--crm-brand-accent)]" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className={cn(SD_DIALOG_TITLE, 'text-left')}>{dialogTitle}</DialogTitle>
                  <DialogDescription className={cn(SD_DIALOG_DESC, 'truncate text-left')}>
                    {data ? (
                      <>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{data.customerName}</span>
                        <span className="mx-2 text-slate-400">·</span>
                        <span>{data.quoteNumber}</span>
                        <span className="mx-2 text-slate-400">·</span>
                        <span className="text-[var(--crm-app-text-muted)]">3 sayfa</span>
                      </>
                    ) : (
                      emptyLabel
                    )}
                  </DialogDescription>
                </div>
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 border-[var(--crm-app-border)] bg-[var(--crm-app-panel)]"
                >
                  Kapat
                </Button>
              </DialogClose>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!data || isPdfLoading}
                onClick={() => void handleDownload()}
                className="h-9 gap-1.5 border-[var(--crm-app-border)] bg-[var(--crm-app-panel)]"
              >
                {isPdfLoading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!data || shareAction === 'excel'}
                onClick={() =>
                  data
                    ? void runShareAction('excel', () =>
                        isInvoice
                          ? invoiceForExcel
                            ? exportInvoiceToExcel(invoiceForExcel)
                            : exportInvoicePreviewToExcel(data)
                          : quoteForExcel
                            ? exportQuoteToExcel(quoteForExcel)
                            : exportQuotePreviewToExcel(data)
                      )
                    : undefined
                }
                className="h-9 gap-1.5 border-[var(--crm-app-border)] bg-[var(--crm-app-panel)]"
              >
                {shareAction === 'excel' ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
                Excel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!data || shareAction === 'gmail'}
                onClick={() =>
                  data
                    ? void runShareAction('gmail', () =>
                        isInvoice
                          ? shareInvoicePreviewViaGmail(data, contact, getPdfShareOptions())
                          : shareQuotePreviewViaGmail(data, contact, getPdfShareOptions())
                      )
                    : undefined
                }
                className="h-9 gap-1.5 border-[var(--crm-app-border)] bg-[var(--crm-app-panel)]"
              >
                {shareAction === 'gmail' ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                Gmail
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!data || shareAction === 'whatsapp'}
                onClick={() =>
                  data
                    ? void runShareAction('whatsapp', () =>
                        isInvoice
                          ? shareInvoicePreviewViaWhatsApp(data, contact, getPdfShareOptions())
                          : shareQuotePreviewViaWhatsApp(data, contact, getPdfShareOptions())
                      )
                    : undefined
                }
                className="h-9 gap-1.5 border-[var(--crm-app-border)] bg-[var(--crm-app-panel)]"
              >
                {shareAction === 'whatsapp' ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <MessageCircle size={15} />
                )}
                WhatsApp
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!data}
                onClick={handlePrint}
                className="h-9 gap-1.5 border-[var(--crm-app-border)] bg-[var(--crm-app-panel)]"
              >
                <Printer size={15} />
                Yazdır
              </Button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_72%,#64748b28)] px-4 py-6 sm:px-8">
            {data ? (
              <div ref={printRootRef} id="salesdesk-quote-print-root" className="mx-auto w-full max-w-[210mm]">
                <SalesDeskQuotePreviewDocument data={data} />
              </div>
            ) : (
              <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-[var(--crm-app-text-muted)]">
                Önizleme verisi bulunamadı.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
