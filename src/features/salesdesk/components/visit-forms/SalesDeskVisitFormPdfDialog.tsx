import { type ReactElement, useEffect } from 'react';
import { Download, Loader2, Printer, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SD_DIALOG_DESC, SD_DIALOG_TITLE, SD_SURFACE_DIALOG } from '../../lib/salesdesk-popup-styles';
import { downloadBlob } from '../../lib/visit-form-pdf';

interface SalesDeskVisitFormPdfDialogProps {
  open: boolean;
  title: string;
  fileName: string;
  previewUrl: string | null;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SalesDeskVisitFormPdfDialog({
  open,
  title,
  fileName,
  previewUrl,
  isLoading = false,
  onOpenChange,
}: SalesDeskVisitFormPdfDialogProps): ReactElement {
  useEffect(() => {
    if (!open && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [open, previewUrl]);

  const handlePrint = (): void => {
    if (!previewUrl) return;
    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    frame.src = previewUrl;
    document.body.appendChild(frame);
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      window.setTimeout(() => frame.remove(), 1000);
    };
  };

  const handleDownload = async (): Promise<void> => {
    if (!previewUrl) return;
    const response = await fetch(previewUrl);
    const blob = await response.blob();
    downloadBlob(blob, fileName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex h-[min(92vh,820px)] w-[calc(100%-1.5rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl p-0 ${SD_SURFACE_DIALOG}`}
      >
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-[var(--crm-app-border)] px-5 py-4">
          <div className="min-w-0">
            <DialogTitle className={SD_DIALOG_TITLE}>PDF Onizleme</DialogTitle>
            <DialogDescription className={SD_DIALOG_DESC}>{title}</DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={!previewUrl || isLoading} onClick={() => void handleDownload()}>
              <Download size={15} />
              Indir
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={!previewUrl || isLoading} onClick={handlePrint}>
              <Printer size={15} />
              Yazdir
            </Button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--crm-app-border)] text-slate-500 hover:bg-[var(--crm-app-panel-muted)]"
              aria-label="Kapat"
            >
              <X size={16} />
            </button>
          </div>
        </DialogHeader>

        <div className="relative min-h-0 flex-1 bg-slate-100 dark:bg-slate-950">
          {isLoading ? (
            <div className="flex h-full min-h-[420px] items-center justify-center gap-2 text-sm text-[var(--crm-app-text-muted)]">
              <Loader2 size={18} className="animate-spin" />
              PDF hazirlaniyor...
            </div>
          ) : previewUrl ? (
            <iframe title="Ziyaret formu PDF" src={previewUrl} className="h-full min-h-[420px] w-full border-0 bg-white" />
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-[var(--crm-app-text-muted)]">
              PDF olusturulamadi.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
