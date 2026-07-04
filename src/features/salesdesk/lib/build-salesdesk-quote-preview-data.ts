import type { SalesDeskQuoteDto } from '../api/salesdesk-api';
import type { QuoteFormValues } from '../types/salesdesk-schemas';
import {
  calculateInvoiceLineTotal,
  calculateInvoiceTotals,
  type InvoiceLineFormState,
} from '../types/invoice-create-types';
import { formatQuoteAmountLabel, formatQuoteDisplayDate } from './salesdesk-quote-template';

export interface SalesDeskQuotePreviewLine {
  title: string;
  description: string;
  amountLabel: string;
}

export interface SalesDeskQuotePreviewData {
  customerName: string;
  quoteNumber: string;
  quoteDateLabel: string;
  /** Sayfa 3 basligi — varsayilan: Fiyat Teklifi */
  documentTitle?: string;
  notes: string[];
  lines: SalesDeskQuotePreviewLine[];
  grandTotalLabel: string;
  subTotal: number;
  vatTotal: number;
  discountTotal: number;
  grandTotal: number;
}

function buildLineDescription(line: InvoiceLineFormState, formNotes?: string): string {
  const parts = [
    line.productCode ? `Urun/Hizmet kodu: ${line.productCode}` : null,
    `Miktar: ${line.quantity} ${line.unit}`,
    `Birim bedel: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(line.unitPrice)}`,
    line.vatRate ? `KDV orani: %${line.vatRate}` : null,
  ].filter(Boolean);

  if (formNotes?.trim() && parts.length < 3) {
    parts.push(formNotes.trim());
  }

  return parts.join('. ') + '.';
}

function buildLineDescriptionFromDto(line: SalesDeskQuoteDto['lines'][number]): string {
  const parts = [
    line.productCode ? `Urun/Hizmet kodu: ${line.productCode}` : null,
    `Miktar: ${line.quantity}`,
    `Birim bedel: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(line.unitPrice)}`,
    line.vatRate ? `KDV orani: %${line.vatRate}` : null,
  ].filter(Boolean);

  return parts.join('. ') + '.';
}

export function buildSalesDeskQuotePreviewDataFromDto(quote: SalesDeskQuoteDto): SalesDeskQuotePreviewData {
  const discountTotal = quote.discountTotal ?? 0;
  const netSubTotal = Math.max(0, quote.subTotal - discountTotal);
  const noteLines = (quote.notes ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    customerName: quote.customerName || 'Musteri',
    quoteNumber: quote.quoteNumber || 'Taslak',
    quoteDateLabel: formatQuoteDisplayDate(quote.quoteDate),
    notes: noteLines,
    lines: (quote.lines ?? []).map((line, index) => ({
      title: line.productName || `Kalem ${index + 1}`,
      description: buildLineDescriptionFromDto(line),
      amountLabel: formatQuoteAmountLabel(line.lineTotal),
    })),
    grandTotalLabel: formatQuoteAmountLabel(netSubTotal),
    subTotal: quote.subTotal,
    vatTotal: quote.vatTotal,
    discountTotal,
    grandTotal: quote.grandTotal,
  };
}

export function buildSalesDeskQuotePreviewData(
  values: QuoteFormValues,
  lines: InvoiceLineFormState[],
  customerName: string
): SalesDeskQuotePreviewData {
  const discountRate = Number(values.discountRate ?? 0);
  const totals = calculateInvoiceTotals(lines, discountRate);
  const netSubTotal = Math.max(0, totals.subTotal - totals.discountTotal);

  const previewLines = lines.map((line, index) => ({
    title: line.productName || `Kalem ${index + 1}`,
    description: buildLineDescription(line, index === 0 ? values.notes : undefined),
    amountLabel: formatQuoteAmountLabel(calculateInvoiceLineTotal(line)),
  }));

  const noteLines = (values.notes ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    customerName: customerName || 'Musteri',
    quoteNumber: values.quoteNumber?.trim() || 'Taslak',
    quoteDateLabel: formatQuoteDisplayDate(values.quoteDate),
    notes: noteLines,
    lines: previewLines,
    grandTotalLabel: formatQuoteAmountLabel(netSubTotal),
    subTotal: totals.subTotal,
    vatTotal: totals.vatTotal,
    discountTotal: totals.discountTotal,
    grandTotal: totals.grandTotal,
  };
}
