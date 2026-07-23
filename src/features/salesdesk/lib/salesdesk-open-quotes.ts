import type { SalesDeskInvoiceDto, SalesDeskLineDto, SalesDeskProductDto, SalesDeskQuoteDto } from '../api/salesdesk-api';
import type { SalesDeskDocumentStatus } from '../api/salesdesk-api';
import type { InvoiceLineFormState } from '../types/invoice-create-types';
import { createEmptyInvoiceLine } from '../types/invoice-create-types';

/** Faturaya donusturulebilir teklif durumlari (iptal / kesildi haric). */
export const INVOICEABLE_QUOTE_STATUSES: SalesDeskDocumentStatus[] = [2, 3, 4, 5];

export function getLinkedQuoteIds(invoices: SalesDeskInvoiceDto[]): Set<number> {
  return new Set(
    invoices
      .map((invoice) => invoice.quoteId)
      .filter((id): id is number => typeof id === 'number' && id > 0)
  );
}

export function getOpenQuotesForInvoice(
  quotes: SalesDeskQuoteDto[],
  invoices: SalesDeskInvoiceDto[],
  customerId?: number | null
): SalesDeskQuoteDto[] {
  const linkedQuoteIds = getLinkedQuoteIds(invoices);

  return quotes
    .filter((quote) => INVOICEABLE_QUOTE_STATUSES.includes(quote.status))
    .filter((quote) => !linkedQuoteIds.has(quote.id))
    .filter((quote) => !customerId || quote.customerId === customerId)
    .sort((left, right) => right.quoteDate.localeCompare(left.quoteDate) || right.id - left.id);
}

export function quoteLineToInvoiceLine(
  line: SalesDeskLineDto,
  products: SalesDeskProductDto[]
): InvoiceLineFormState {
  const product = products.find((item) => item.id === line.productId);

  return {
    ...createEmptyInvoiceLine(
      product ?? {
        id: line.productId,
        code: line.productCode ?? '',
        name: line.productName ?? '',
        unit: 'Adet',
        salesPrice: line.unitPrice,
      }
    ),
    id: crypto.randomUUID(),
    productId: line.productId,
    productCode: line.productCode ?? product?.code ?? '',
    productName: line.productName ?? product?.name ?? '',
    unit: product?.unit ?? 'Adet',
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    vatRate: line.vatRate,
    description: line.description?.trim() ?? '',
  };
}

export function quoteToInvoiceLines(
  quote: SalesDeskQuoteDto,
  products: SalesDeskProductDto[]
): InvoiceLineFormState[] {
  return (quote.lines ?? [])
    .filter((line) => line.productId > 0 && line.quantity > 0)
    .map((line) => quoteLineToInvoiceLine(line, products));
}
