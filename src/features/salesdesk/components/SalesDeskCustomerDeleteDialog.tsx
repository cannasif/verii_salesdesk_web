import { type ReactElement } from 'react';
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';
import { buildSalesDeskDeleteDescription, SalesDeskDeleteDialog } from './SalesDeskDeleteDialog';

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
    <SalesDeskDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cariyi sil"
      description={
        customer ? buildSalesDeskDeleteDescription(customer.name) : 'Bu islem geri alinamaz.'
      }
      onConfirm={onConfirm}
      isDeleting={isDeleting}
    />
  );
}
