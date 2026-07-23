import { type ReactElement } from 'react';
import { Eye, X } from 'lucide-react';
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
  formatCustomerBalance,
  SALES_DESK_CUSTOMER_KIND_LABELS,
} from '../types/customer-types';
import {
  SD_DIALOG_BODY_FORM,
  SD_DIALOG_CLOSE,
  SD_DIALOG_CONTENT_FORM,
  SD_DIALOG_DESC,
  SD_DIALOG_FOOTER_FORM,
  SD_DIALOG_HEADER_FORM,
  SD_DIALOG_HEADER_ROW,
  SD_DIALOG_ICON_GRADIENT,
  SD_DIALOG_TITLE,
  SD_SECONDARY_BUTTON_FORM,
} from '../lib/salesdesk-popup-styles';

interface DetailFieldProps {
  label: string;
  value: string;
}

function DetailField({ label, value }: DetailFieldProps): ReactElement {
  return (
    <div className="space-y-1.5">
      <p className="ml-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-app-text-muted)]">
        {label}
      </p>
      <p className="min-h-9 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-3 py-2 text-sm text-slate-900 dark:text-slate-100">
        {value || '-'}
      </p>
    </div>
  );
}

interface SalesDeskCustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: SalesDeskCustomerDto | null;
}

export function SalesDeskCustomerDetailDialog({
  open,
  onOpenChange,
  customer,
}: SalesDeskCustomerDetailDialogProps): ReactElement {
  if (!customer) {
    return <></>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent className={SD_DIALOG_CONTENT_FORM} showCloseButton={false}>
          <DialogHeader className={SD_DIALOG_HEADER_FORM}>
            <div className={SD_DIALOG_HEADER_ROW}>
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className={SD_DIALOG_ICON_GRADIENT}>
                  <Eye size={24} className="text-white" strokeWidth={2.2} aria-hidden />
                </div>
                <div className="min-w-0 space-y-1">
                  <DialogTitle className={SD_DIALOG_TITLE}>Cari Detay</DialogTitle>
                  <DialogDescription className={SD_DIALOG_DESC}>
                    {customer.name} — kayit bilgilerini goruntuluyorsunuz.
                  </DialogDescription>
                </div>
              </div>
              <button
                type="button"
                className={SD_DIALOG_CLOSE}
                onClick={() => onOpenChange(false)}
                aria-label="Kapat"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
          </DialogHeader>

          <div className={SD_DIALOG_BODY_FORM}>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <DetailField label="Cari Adi" value={customer.name} />
              <DetailField label="Kod" value={customer.code} />
              <DetailField label="Tip" value={SALES_DESK_CUSTOMER_KIND_LABELS[customer.kind]} />
              <DetailField label="Yetkili" value={customer.contactName ?? ''} />
              <DetailField label="Telefon" value={customer.phone ?? ''} />
              <DetailField label="E-posta" value={customer.email ?? ''} />
              <DetailField label="İl" value={customer.city ?? ''} />
              <DetailField label="İlçe" value={customer.district ?? ''} />
              <DetailField label="Bakiye (TRY)" value={formatCustomerBalance(customer.balance)} />
            </div>
          </div>

          <DialogFooter className={SD_DIALOG_FOOTER_FORM}>
            <div className="flex w-full justify-end sm:ml-auto sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                className={SD_SECONDARY_BUTTON_FORM}
                onClick={() => onOpenChange(false)}
              >
                Kapat
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
