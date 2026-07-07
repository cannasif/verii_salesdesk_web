import { type ReactElement } from 'react';
import { Alert02Icon } from 'hugeicons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  SD_DELETE_FOOTER,
  SD_SECONDARY_BUTTON,
  SD_SURFACE_DIALOG,
} from '../lib/salesdesk-popup-styles';

export interface SalesDeskDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
}

export function SalesDeskDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isDeleting = false,
  cancelLabel = 'Iptal',
  confirmLabel = 'Sil',
}: SalesDeskDeleteDialogProps): ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`w-[calc(100%-1rem)] max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:w-[90%] sm:max-w-md ${SD_SURFACE_DIALOG}`}>
        <DialogHeader className="flex flex-col items-center gap-4 px-4 pb-6 pt-8 text-center sm:px-6 sm:pt-10">
          <div className="mb-2 flex h-20 w-20 animate-in items-center justify-center rounded-full bg-red-50 duration-300 zoom-in dark:bg-red-500/10">
            <Alert02Icon size={36} className="text-red-600 dark:text-red-500" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">{title}</DialogTitle>
            <DialogDescription className="mx-auto max-w-[280px] text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className={`flex flex-col-reverse gap-3 p-4 sm:flex-row sm:justify-center sm:p-6 ${SD_DELETE_FOOTER}`}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className={`h-12 w-full sm:flex-1 ${SD_SECONDARY_BUTTON}`}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-12 w-full flex-1 rounded-xl border-0 bg-linear-to-r from-red-600 to-red-700 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] hover:from-red-700 hover:to-red-800 sm:w-auto"
          >
            {isDeleting ? <span className="animate-pulse">Yukleniyor...</span> : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function buildSalesDeskDeleteDescription(itemName: string): string {
  return `"${itemName}" kaydini silmek istediginize emin misiniz? Bu islem geri alinamaz.`;
}
