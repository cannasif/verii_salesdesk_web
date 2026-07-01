import { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { SalesDeskInvoiceCreateForm } from '../invoices/SalesDeskInvoiceCreateForm';
import { SALES_DESK_INVOICE_TYPE } from '../../types/invoice-types';

/** @deprecated /salesdesk/invoices/sales/new kullanin */
export function SalesDeskInvoiceCreatePage(): ReactElement {
  return <Navigate to="/salesdesk/invoices/sales/new" replace />;
}

export function SalesDeskSalesInvoiceCreatePage(): ReactElement {
  return <SalesDeskInvoiceCreateForm invoiceType={SALES_DESK_INVOICE_TYPE.sales} />;
}

export function SalesDeskPurchaseInvoiceCreatePage(): ReactElement {
  return <SalesDeskInvoiceCreateForm invoiceType={SALES_DESK_INVOICE_TYPE.purchase} />;
}
