import type { SalesDeskInvoiceDto } from '../api/salesdesk-api';
import type { InvoiceFormValues } from '../types/salesdesk-schemas';
import { type InvoiceLineFormState } from '../types/invoice-create-types';
import { resolveInvoiceType, SALES_DESK_INVOICE_TYPE } from '../types/invoice-types';
import type { SalesDeskQuotePreviewData } from './build-salesdesk-quote-preview-data';
import {
  buildSalesDeskQuotePreviewData,
} from './build-salesdesk-quote-preview-data';
import { formatQuoteAmountLabel, formatQuoteDisplayDate } from './salesdesk-quote-template';

function invoiceDocumentTitle(invoiceType: number): string {
  return invoiceType === SALES_DESK_INVOICE_TYPE.purchase ? 'Alis Faturasi' : 'Satis Faturasi';
}

function buildLineDescriptionFromDto(line: SalesDeskInvoiceDto['lines'][number]): string {
  const customDescription = line.description?.trim();
  if (customDescription) return customDescription;

  const parts = [
    line.productCode ? `Urun/Hizmet kodu: ${line.productCode}` : null,
    `Miktar: ${line.quantity}`,
    `Birim bedel: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(line.unitPrice)}`,
    line.vatRate ? `KDV orani: %${line.vatRate}` : null,
  ].filter(Boolean);

  return parts.join('. ') + '.';
}

export function buildSalesDeskInvoicePreviewDataFromDto(invoice: SalesDeskInvoiceDto): SalesDeskQuotePreviewData {
  const invoiceType = resolveInvoiceType(invoice);
  const discountTotal = invoice.discountTotal ?? 0;
  const netSubTotal = Math.max(0, invoice.subTotal - discountTotal);
  const noteLines = (invoice.notes ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    customerName: invoice.customerName || 'Cari',
    quoteNumber: invoice.invoiceNumber || 'Taslak',
    quoteDateLabel: formatQuoteDisplayDate(invoice.invoiceDate),
    documentTitle: invoiceDocumentTitle(invoiceType),
    notes: noteLines,
    lines: (invoice.lines ?? []).map((line, index) => ({
      title: line.productName || `Kalem ${index + 1}`,
      description: buildLineDescriptionFromDto(line),
      amountLabel: formatQuoteAmountLabel(line.lineTotal),
    })),
    grandTotalLabel: formatQuoteAmountLabel(netSubTotal),
    subTotal: invoice.subTotal,
    vatTotal: invoice.vatTotal,
    discountTotal,
    grandTotal: invoice.grandTotal,
  };
}

export function buildSalesDeskInvoicePreviewData(
  values: InvoiceFormValues,
  lines: InvoiceLineFormState[],
  customerName: string
): SalesDeskQuotePreviewData {
  const invoiceType = Number(values.invoiceType ?? SALES_DESK_INVOICE_TYPE.sales);
  const base = buildSalesDeskQuotePreviewData(
    {
      quoteNumber: values.invoiceNumber,
      customerId: values.customerId,
      quoteDate: values.invoiceDate,
      status: values.status,
      discountRate: values.discountRate,
      notes: values.notes,
    },
    lines,
    customerName
  );

  return {
    ...base,
    quoteNumber: values.invoiceNumber?.trim() || 'Taslak',
    quoteDateLabel: formatQuoteDisplayDate(values.invoiceDate),
    documentTitle: invoiceDocumentTitle(invoiceType),
  };
}
