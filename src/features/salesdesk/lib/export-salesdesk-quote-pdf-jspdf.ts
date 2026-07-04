import { jsPDF } from 'jspdf';
import { resolveAppPath } from '@/lib/api-config';
import {
  QUOTATION_EXPORT_PDF_FONT,
  registerQuotationExportPdfFont,
} from '@/features/quotation/utils/quotation-export-pdf-font';
import type { SalesDeskQuotePreviewData } from './build-salesdesk-quote-preview-data';
import { SALESDESK_QUOTE_TEMPLATE } from './salesdesk-quote-template';

const MARGIN = 16;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

type PdfFont = typeof QUOTATION_EXPORT_PDF_FONT | 'helvetica';

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch(resolveAppPath(SALESDESK_QUOTE_TEMPLATE.logoPath), { cache: 'force-cache' });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function wrapText(doc: jsPDF, text: string, maxWidth: number, font: PdfFont): string[] {
  doc.setFont(font, 'normal');
  return doc.splitTextToSize(text, maxWidth);
}

function setFont(doc: jsPDF, font: PdfFont, style: 'normal' | 'bold'): void {
  doc.setFont(font, style);
}

function drawFooter(doc: jsPDF, pageNumber: number, font: PdfFont): void {
  const y = PAGE_H - 10;
  doc.setFontSize(8);
  setFont(doc, font, 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(SALESDESK_QUOTE_TEMPLATE.footerLine, MARGIN, y);
  doc.setTextColor(51, 65, 85);
  doc.text(String(pageNumber).padStart(2, '0'), PAGE_W - MARGIN, y, { align: 'right' });
  doc.setTextColor(15, 23, 42);
}

function ensureSpace(doc: jsPDF, y: number, needed: number, font: PdfFont): number {
  if (y + needed <= PAGE_H - 18) return y;
  doc.addPage();
  drawFooter(doc, doc.getNumberOfPages(), font);
  return MARGIN;
}

function drawParagraph(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, font: PdfFont, fontSize = 10, lineHeight = 4.8): number {
  doc.setFontSize(fontSize);
  setFont(doc, font, 'normal');
  for (const line of wrapText(doc, text, maxWidth, font)) {
    y = ensureSpace(doc, y, lineHeight + 2, font);
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function drawLogo(doc: jsPDF, logoDataUrl: string | null, x: number, y: number, height = 12): void {
  if (!logoDataUrl) return;
  try {
    doc.addImage(logoDataUrl, 'PNG', x, y, height * 2.8, height);
  } catch {
    // logo yuklenemezse devam et
  }
}

export async function buildSalesDeskQuotePdfBlobWithJsPdf(data: SalesDeskQuotePreviewData): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const fontRegistered = await registerQuotationExportPdfFont(doc);
  const font: PdfFont = fontRegistered ? QUOTATION_EXPORT_PDF_FONT : 'helvetica';
  const template = SALESDESK_QUOTE_TEMPLATE;
  const allNotes = data.notes.length > 0 ? data.notes : [...template.defaultNotes];
  const logoDataUrl = await loadLogoDataUrl();

  // —— Sayfa 1: Kapak ——
  drawFooter(doc, 1, font);
  drawLogo(doc, logoDataUrl, MARGIN, MARGIN, 14);
  let y = PAGE_H / 2 - 18;
  doc.setFontSize(24);
  setFont(doc, font, 'bold');
  for (const line of wrapText(doc, data.customerName, CONTENT_W * 0.85, font)) {
    doc.text(line, MARGIN, y);
    y += 11;
  }
  doc.setFontSize(12);
  setFont(doc, font, 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(template.coverTagline, MARGIN, y + 4);
  doc.setTextColor(15, 23, 42);

  // —— Sayfa 2: Tanitim ——
  doc.addPage();
  drawFooter(doc, 2, font);
  y = MARGIN;
  drawLogo(doc, logoDataUrl, MARGIN, y, 10);
  doc.setFontSize(8);
  setFont(doc, font, 'normal');
  doc.setTextColor(100, 116, 139);
  const subtitleLines = wrapText(doc, template.introSubtitle, CONTENT_W * 0.45, font);
  doc.text(subtitleLines, PAGE_W - MARGIN, y + 4, { align: 'right' });
  doc.setTextColor(15, 23, 42);
  y += 18;

  doc.setFontSize(14);
  setFont(doc, font, 'bold');
  doc.text(template.introTitle, MARGIN, y);
  y += 8;
  y = drawParagraph(doc, template.introLead, MARGIN, y, CONTENT_W, font, 10, 4.8);
  y += 2;
  y = drawParagraph(doc, template.introSecondary, MARGIN, y, CONTENT_W, font, 10, 4.8);
  y += 6;

  doc.setFontSize(12);
  setFont(doc, font, 'bold');
  doc.text(template.principlesTitle, MARGIN, y);
  y += 7;

  const cardW = (CONTENT_W - 4) / 2;
  const cardH = 28;
  template.principles.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = MARGIN + col * (cardW + 4);
    const cardY = y + row * (cardH + 4);
    doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFontSize(9);
    setFont(doc, font, 'bold');
    doc.text(item.title, x + 3, cardY + 6);
    doc.setFontSize(8);
    setFont(doc, font, 'normal');
    doc.setTextColor(71, 85, 105);
    let textY = cardY + 11;
    for (const line of wrapText(doc, item.description, cardW - 6, font)) {
      doc.text(line, x + 3, textY);
      textY += 3.8;
    }
    doc.setTextColor(15, 23, 42);
  });
  y += Math.ceil(template.principles.length / 2) * (cardH + 4) + 6;

  doc.setFontSize(12);
  setFont(doc, font, 'bold');
  doc.text(template.expertiseTitle, MARGIN, y);
  y += 7;

  const expW = (CONTENT_W - 8) / 3;
  const expH = 30;
  template.expertise.forEach((item, index) => {
    const x = MARGIN + index * (expW + 4);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, expW, expH, 2, 2, 'S');
    doc.setFontSize(9);
    setFont(doc, font, 'bold');
    doc.text(item.title.toUpperCase(), x + 3, y + 6);
    doc.setFontSize(7.5);
    setFont(doc, font, 'normal');
    doc.setTextColor(71, 85, 105);
    let textY = y + 11;
    for (const line of wrapText(doc, item.description, expW - 6, font)) {
      doc.text(line, x + 3, textY);
      textY += 3.6;
    }
    doc.setTextColor(15, 23, 42);
  });
  y += expH + 8;

  // —— Sayfa 3: Fiyat ——
  doc.addPage();
  drawFooter(doc, 3, font);
  y = MARGIN;
  doc.setFontSize(18);
  setFont(doc, font, 'bold');
  doc.text('Fiyat Teklifi', MARGIN, y);
  drawLogo(doc, logoDataUrl, PAGE_W - MARGIN - 28, MARGIN - 2, 10);
  y += 8;
  doc.setFontSize(10);
  setFont(doc, font, 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${data.customerName} · ${data.quoteNumber} · ${data.quoteDateLabel}`, MARGIN, y);
  doc.setTextColor(15, 23, 42);
  y += 10;

  const col1 = 44;
  const col3 = 36;
  const col2 = CONTENT_W - col1 - col3;

  doc.setFillColor(15, 23, 42);
  doc.rect(MARGIN, y, CONTENT_W, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  setFont(doc, font, 'bold');
  doc.text('Hizmet / Ürün', MARGIN + 2, y + 5.5);
  doc.text('Kapsam Açıklaması', MARGIN + col1 + 2, y + 5.5);
  doc.text('Bedel', MARGIN + col1 + col2 + col3 - 2, y + 5.5, { align: 'right' });
  doc.setTextColor(15, 23, 42);
  y += 10;

  for (const line of data.lines) {
    const titleLines = wrapText(doc, line.title, col1 - 4, font);
    const descLines = wrapText(doc, line.description, col2 - 4, font);
    const rowH = Math.max(titleLines.length, descLines.length, 1) * 4.5 + 6;

    y = ensureSpace(doc, y, rowH + 4, font);
    doc.setDrawColor(226, 232, 240);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);

    let rowY = y + 5;
    doc.setFontSize(9);
    setFont(doc, font, 'bold');
    for (const titleLine of titleLines) {
      doc.text(titleLine, MARGIN + 2, rowY);
      rowY += 4.5;
    }

    rowY = y + 5;
    setFont(doc, font, 'normal');
    doc.setTextColor(51, 65, 85);
    for (const descLine of descLines) {
      doc.text(descLine, MARGIN + col1 + 2, rowY);
      rowY += 4.5;
    }
    doc.setTextColor(15, 23, 42);
    setFont(doc, font, 'bold');
    doc.text(line.amountLabel, MARGIN + col1 + col2 + col3 - 2, y + 5, { align: 'right' });
    setFont(doc, font, 'normal');
    y += rowH;
  }

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.rect(MARGIN, y - 4, CONTENT_W, 10, 'F');
  setFont(doc, font, 'bold');
  doc.text('Genel Toplam', MARGIN + col1 + col2 - 2, y + 2, { align: 'right' });
  doc.text(data.grandTotalLabel, MARGIN + col1 + col2 + col3 - 2, y + 2, { align: 'right' });
  y += 14;

  doc.setFontSize(11);
  setFont(doc, font, 'bold');
  doc.text('Teklif Notları', MARGIN, y);
  y += 6;
  doc.setFontSize(9);
  setFont(doc, font, 'normal');
  for (const note of allNotes) {
    y = drawParagraph(doc, note, MARGIN, y, CONTENT_W, font, 9, 4.5);
    y += 1;
  }
  y += 4;

  const infoW = (CONTENT_W - 8) / 3;
  const infoH = 22;
  template.infoCards.forEach((card, index) => {
    const x = MARGIN + index * (infoW + 4);
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, infoW, infoH, 2, 2, 'FD');
    doc.setFontSize(8.5);
    setFont(doc, font, 'bold');
    doc.text(card.title, x + 3, y + 6);
    doc.setFontSize(7.5);
    setFont(doc, font, 'normal');
    doc.setTextColor(71, 85, 105);
    let textY = y + 10;
    for (const line of wrapText(doc, card.description, infoW - 6, font)) {
      doc.text(line, x + 3, textY);
      textY += 3.5;
    }
    doc.setTextColor(15, 23, 42);
  });

  return doc.output('blob');
}
