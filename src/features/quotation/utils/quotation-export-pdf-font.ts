import { resolveAppPath } from '@/lib/api-config';
import type { jsPDF } from 'jspdf';

const FONT_PUBLIC_PATH = '/assets/fonts/Montserrat-Regular.ttf';
const FONT_VFS_NAME = 'QuotationExport-Montserrat.ttf';

export const QUOTATION_EXPORT_PDF_FONT = 'QuotationExportMontserrat';

export async function registerQuotationExportPdfFont(doc: jsPDF): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4_000);
    const response = await fetch(resolveAppPath(FONT_PUBLIC_PATH), {
      cache: 'force-cache',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      return false;
    }
    const fontBytes = await response.arrayBuffer();
    const fontBinary = Array.from(new Uint8Array(fontBytes), (byte) => String.fromCharCode(byte)).join(
      '',
    );
    doc.addFileToVFS(FONT_VFS_NAME, fontBinary);
    doc.addFont(FONT_VFS_NAME, QUOTATION_EXPORT_PDF_FONT, 'normal');
    doc.addFont(FONT_VFS_NAME, QUOTATION_EXPORT_PDF_FONT, 'bold');
    doc.setFont(QUOTATION_EXPORT_PDF_FONT, 'normal');
    return true;
  } catch {
    return false;
  }
}
