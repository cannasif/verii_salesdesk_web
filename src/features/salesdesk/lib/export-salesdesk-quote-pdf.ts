import type { SalesDeskQuotePreviewData } from './build-salesdesk-quote-preview-data';
import { buildSalesDeskQuotePdfBlobWithJsPdf } from './export-salesdesk-quote-pdf-jspdf';

export interface BuildSalesDeskQuotePdfOptions {
  /** Geriye uyumluluk — jsPDF kullanilir (html2canvas bos sayfa uretiyordu). */
  sourceElement?: HTMLElement | null;
}

export async function buildSalesDeskQuotePdfBlob(
  data: SalesDeskQuotePreviewData,
  _options?: BuildSalesDeskQuotePdfOptions,
): Promise<Blob> {
  return buildSalesDeskQuotePdfBlobWithJsPdf(data);
}

export function buildSalesDeskQuotePdfFileName(data: SalesDeskQuotePreviewData): string {
  const slug = data.customerName
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40);
  const quotePart = data.quoteNumber.replace(/[^\w-]/g, '-').slice(0, 20);
  return `${slug || 'teklif'}-${quotePart || 'taslak'}.pdf`;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
