import { jsPDF } from 'jspdf';
import type { SalesDeskVisitFormDto } from '../api/salesdesk-api';
import {
  QUOTATION_EXPORT_PDF_FONT,
  registerQuotationExportPdfFont,
} from '@/features/quotation/utils/quotation-export-pdf-font';
import { parseVisitFormContent } from './visit-form-content';
import { formatDate } from './salesdesk-shared';

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

function ensurePageSpace(doc: jsPDF, y: number, margin: number, needed = 12): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed <= pageHeight - margin) return y;
  doc.addPage();
  return margin;
}

export function buildVisitFormPdfFileName(form: SalesDeskVisitFormDto): string {
  const slug = form.title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
  return `${slug || 'ziyaret-formu'}.pdf`;
}

export async function buildVisitFormPdfBlob(form: SalesDeskVisitFormDto): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const fontRegistered = await registerQuotationExportPdfFont(doc);
  if (fontRegistered) {
    doc.setFont(QUOTATION_EXPORT_PDF_FONT, 'normal');
  }

  const data = parseVisitFormContent(form.content);
  const margin = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFontSize(18);
  doc.text(form.title, margin, y);
  y += 12;

  doc.setFontSize(11);
  const metaLines = [
    `Cari: ${form.customerName || '-'}`,
    `Tarih: ${formatDate(form.formDate)}`,
    data.visitorName ? `Ziyareti Yapan: ${data.visitorName}` : '',
    data.contactedPerson ? `Gorusulen Kisi: ${data.contactedPerson}` : '',
  ].filter(Boolean);

  for (const line of metaLines) {
    doc.text(line, margin, y);
    y += 6;
  }

  y += 6;
  doc.setFontSize(13);
  doc.text('Yapilanlar / Notlar', margin, y);
  y += 7;
  doc.setFontSize(10);
  for (const line of wrapText(doc, data.notes?.trim() || '-', contentWidth)) {
    y = ensurePageSpace(doc, y, margin);
    doc.text(line, margin, y);
    y += 5;
  }

  y += 8;
  y = ensurePageSpace(doc, y, margin, 20);
  doc.setFontSize(13);
  doc.text('Sonraki Adimlar', margin, y);
  y += 7;
  doc.setFontSize(10);
  for (const line of wrapText(doc, data.nextSteps?.trim() || '-', contentWidth)) {
    y = ensurePageSpace(doc, y, margin);
    doc.text(line, margin, y);
    y += 5;
  }

  return doc.output('blob');
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadVisitFormPdf(form: SalesDeskVisitFormDto): Promise<Blob> {
  const blob = await buildVisitFormPdfBlob(form);
  downloadBlob(blob, buildVisitFormPdfFileName(form));
  return blob;
}
