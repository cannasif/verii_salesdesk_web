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
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';
import {
  SD_DELETE_FOOTER,
  SD_SECONDARY_BUTTON,
  SD_SURFACE_DIALOG,
} from '../lib/salesdesk-popup-styles';

interface SalesDeskCustomerDeleteDialogProps {
  customer: SalesDeskCustomerDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
}

export function SalesDeskCustomerDeleteDialog({
  customer,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: SalesDeskCustomerDeleteDialogProps): ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`w-[90%] max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:w-full ${SD_SURFACE_DIALOG}`}>
        <DialogHeader className="flex flex-col items-center gap-4 px-6 pb-6 pt-10 text-center">
          <div className="mb-2 flex h-20 w-20 animate-in items-center justify-center rounded-full bg-red-50 duration-300 zoom-in dark:bg-red-500/10">
            <Alert02Icon size={36} className="text-red-600 dark:text-red-500" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">Cariyi sil</DialogTitle>
            <DialogDescription className="mx-auto max-w-[280px] text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {customer
                ? `"${customer.name}" kaydini silmek istediginize emin misiniz? Bu islem geri alinamaz.`
                : 'Bu islem geri alinamaz.'}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className={`flex flex-row justify-center gap-3 p-6 ${SD_DELETE_FOOTER}`}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className={`flex-1 ${SD_SECONDARY_BUTTON}`}
          >
            Iptal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-12 flex-1 rounded-xl border-0 bg-linear-to-r from-red-600 to-red-700 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] hover:from-red-700 hover:to-red-800"
          >
            {isDeleting ? <span className="animate-pulse">Yukleniyor...</span> : 'Sil'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
