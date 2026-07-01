export interface InvoiceLineFormState {
  id: string;
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export interface InvoiceTotals {
  subTotal: number;
  vatTotal: number;
  discountTotal: number;
  grandTotal: number;
}

export function calculateInvoiceLineTotal(line: InvoiceLineFormState): number {
  return round2(line.quantity * line.unitPrice);
}

export function calculateInvoiceTotals(
  lines: InvoiceLineFormState[],
  discountRate: number
): InvoiceTotals {
  const subTotal = round2(lines.reduce((sum, line) => sum + calculateInvoiceLineTotal(line), 0));
  const vatTotal = round2(
    lines.reduce((sum, line) => sum + calculateInvoiceLineTotal(line) * (line.vatRate / 100), 0)
  );
  const discountTotal = round2(subTotal * (Math.min(100, Math.max(0, discountRate)) / 100));
  const grandTotal = round2(subTotal + vatTotal - discountTotal);
  return { subTotal, vatTotal, discountTotal, grandTotal };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function createEmptyInvoiceLine(product?: {
  id: number;
  code: string;
  name: string;
  unit: string;
  salesPrice: number;
}): InvoiceLineFormState {
  return {
    id: crypto.randomUUID(),
    productId: product?.id ?? 0,
    productCode: product?.code ?? '',
    productName: product?.name ?? '',
    unit: product?.unit ?? 'Adet',
    quantity: 1,
    unitPrice: product?.salesPrice ?? 0,
    vatRate: 20,
  };
}

export function invoiceLinesToPayload(lines: InvoiceLineFormState[]): Array<{
  productId: number;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}> {
  return lines
    .filter((line) => line.productId > 0 && line.quantity > 0)
    .map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      vatRate: line.vatRate,
    }));
}
