import { jsPDF } from 'jspdf';
import { resolveAppPath } from '@/lib/api-config';
import {
  QUOTATION_EXPORT_PDF_FONT,
  registerQuotationExportPdfFont,
} from '@/features/quotation/utils/quotation-export-pdf-font';
import type { SalesDeskVisitFormDto } from '../api/salesdesk-api';
import { parseVisitFormContent } from './visit-form-content';
import { formatDate } from './salesdesk-shared';
import { SALESDESK_QUOTE_TEMPLATE } from './salesdesk-quote-template';

const MARGIN = 16;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const SECTION_HEADER_SPACE = 16;

type PdfFont = typeof QUOTATION_EXPORT_PDF_FONT | 'helvetica';
type Rgb = readonly [number, number, number];

/** Beyaz zemin + Minimal Masa slate gri paleti */
const C = {
  gold: [100, 116, 139] as Rgb,
  goldDark: [71, 85, 105] as Rgb,
  brandPink: [148, 163, 184] as Rgb,
  cream: [248, 250, 252] as Rgb,
  creamDeep: [226, 232, 240] as Rgb,
  border: [203, 213, 225] as Rgb,
  text: [15, 23, 42] as Rgb,
  muted: [71, 85, 105] as Rgb,
  soft: [100, 116, 139] as Rgb,
  white: [255, 255, 255] as Rgb,
};

let sectionCounter = 0;

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

function setFont(doc: jsPDF, font: PdfFont, style: 'normal' | 'bold'): void {
  doc.setFont(font, style);
}

function setColor(doc: jsPDF, color: Rgb): void {
  doc.setTextColor(...color);
}

function wrapText(doc: jsPDF, text: string, maxWidth: number, font: PdfFont): string[] {
  doc.setFont(font, 'normal');
  return doc.splitTextToSize(text, maxWidth);
}

function formatGeneratedDate(): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function buildDocumentRef(form: SalesDeskVisitFormDto): string {
  return `ZF-${String(form.id).padStart(5, '0')}`;
}

function drawPageAccent(doc: jsPDF): void {
  doc.setFillColor(...C.brandPink);
  doc.rect(0, 0, 1, PAGE_H, 'F');
  doc.setFillColor(...C.gold);
  doc.rect(1, 0, 2.2, PAGE_H, 'F');
  doc.setFillColor(...C.creamDeep);
  doc.rect(3.2, 0, 0.8, PAGE_H, 'F');
}

function drawFooter(doc: jsPDF, pageNumber: number, font: PdfFont, documentRef?: string): void {
  const y = PAGE_H - 11;
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.35);
  doc.line(MARGIN, y - 5, PAGE_W - MARGIN, y - 5);

  doc.setFontSize(7);
  setFont(doc, font, 'normal');
  setColor(doc, C.muted);
  const footerLeft = documentRef
    ? `${SALESDESK_QUOTE_TEMPLATE.footerLine}  ·  ${documentRef}`
    : SALESDESK_QUOTE_TEMPLATE.footerLine;
  doc.text(footerLeft, MARGIN, y);

  doc.setFontSize(6.5);
  setColor(doc, C.soft);
  doc.text('Bu belge elektronik ortamda oluşturulmuştur.', MARGIN, y + 3.5);

  setColor(doc, C.goldDark);
  doc.setFontSize(8);
  setFont(doc, font, 'bold');
  doc.text(String(pageNumber).padStart(2, '0'), PAGE_W - MARGIN, y, { align: 'right' });
  setColor(doc, C.text);
}

function ensureSpace(doc: jsPDF, y: number, needed: number, font: PdfFont, documentRef?: string): number {
  if (y + needed <= PAGE_H - 24) return y;
  drawFooter(doc, doc.getNumberOfPages(), font, documentRef);
  doc.addPage();
  drawPageAccent(doc);
  drawFooter(doc, doc.getNumberOfPages(), font, documentRef);
  return MARGIN;
}

function drawLogo(doc: jsPDF, logoDataUrl: string | null, x: number, y: number, height = 12): void {
  if (!logoDataUrl) return;
  try {
    doc.addImage(logoDataUrl, 'PNG', x, y, height * 2.8, height);
  } catch {
    // logo yuklenemezse devam et
  }
}

function drawBrandedHeader(doc: jsPDF, logoDataUrl: string | null, font: PdfFont): number {
  const template = SALESDESK_QUOTE_TEMPLATE;
  const bandH = 24;

  doc.setFillColor(...C.cream);
  doc.roundedRect(MARGIN, MARGIN, CONTENT_W, bandH, 2, 2, 'F');
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, MARGIN, CONTENT_W, bandH, 2, 2, 'S');
  doc.setFillColor(...C.gold);
  doc.roundedRect(MARGIN, MARGIN, CONTENT_W, 1.2, 1, 1, 'F');

  drawLogo(doc, logoDataUrl, MARGIN + 4, MARGIN + 5, 11);

  doc.setFontSize(11.5);
  setFont(doc, font, 'bold');
  setColor(doc, C.text);
  doc.text(template.issuerName, PAGE_W - MARGIN - 4, MARGIN + 10, { align: 'right' });

  doc.setFontSize(7.5);
  setFont(doc, font, 'normal');
  setColor(doc, C.muted);
  doc.text(template.issuerTagline, PAGE_W - MARGIN - 4, MARGIN + 15, { align: 'right' });

  doc.setFontSize(7);
  setColor(doc, C.goldDark);
  setFont(doc, font, 'bold');
  doc.text('KURUMSAL ZİYARET RAPORU', PAGE_W - MARGIN - 4, MARGIN + 20, { align: 'right' });

  setColor(doc, C.text);
  return MARGIN + bandH + 8;
}

function drawHeroSection(
  doc: jsPDF,
  title: string,
  formDate: string,
  documentRef: string,
  y: number,
  font: PdfFont,
): number {
  const heroH = 32;

  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, CONTENT_W, heroH, 3, 3, 'FD');

  doc.setFillColor(...C.gold);
  doc.roundedRect(MARGIN, y, 3, heroH, 1.5, 1.5, 'F');

  const badgeW = 28;
  doc.setFillColor(...C.gold);
  doc.roundedRect(PAGE_W - MARGIN - badgeW, y + 4, badgeW, 7, 1.5, 1.5, 'F');
  doc.setFontSize(6.5);
  setFont(doc, font, 'bold');
  setColor(doc, C.white);
  doc.text('RAPOR', PAGE_W - MARGIN - badgeW / 2, y + 8.5, { align: 'center' });

  const innerX = MARGIN + 8;
  doc.setFontSize(7);
  setFont(doc, font, 'bold');
  setColor(doc, C.goldDark);
  doc.text(documentRef.toUpperCase(), innerX, y + 8);

  doc.setFontSize(16);
  setFont(doc, font, 'bold');
  setColor(doc, C.text);
  let titleY = y + 17;
  for (const line of wrapText(doc, title, CONTENT_W * 0.68, font)) {
    doc.text(line, innerX, titleY);
    titleY += 7;
  }

  doc.setFontSize(8);
  setFont(doc, font, 'normal');
  setColor(doc, C.soft);
  doc.text(`Ziyaret tarihi: ${formatDate(formDate)}`, innerX, y + heroH - 5);

  setColor(doc, C.text);
  return y + heroH + 8;
}

function drawMetaKpiRow(
  doc: jsPDF,
  form: SalesDeskVisitFormDto,
  customerName: string,
  y: number,
  font: PdfFont,
): number {
  const rowH = 14;
  const gap = 3;
  const colW = (CONTENT_W - gap * 2) / 3;
  const items = [
    { label: 'Belge No', value: buildDocumentRef(form) },
    { label: 'Cari', value: customerName || '-' },
    { label: 'Oluşturulma', value: formatGeneratedDate() },
  ];

  items.forEach((item, index) => {
    const x = MARGIN + index * (colW + gap);
    doc.setFillColor(...C.cream);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, colW, rowH, 1.5, 1.5, 'FD');
    doc.setFillColor(...C.gold);
    doc.roundedRect(x, y, colW, 0.8, 0.5, 0.5, 'F');

    doc.setFontSize(6.5);
    setFont(doc, font, 'bold');
    setColor(doc, C.goldDark);
    doc.text(item.label.toLocaleUpperCase('tr-TR'), x + 3, y + 5.5);

    doc.setFontSize(8.5);
    setFont(doc, font, 'bold');
    setColor(doc, C.text);
    const lines = wrapText(doc, item.value, colW - 6, font);
    doc.text(lines[0] || '-', x + 3, y + 11);
  });

  setColor(doc, C.text);
  return y + rowH + 10;
}

function drawSectionHeader(doc: jsPDF, title: string, y: number, font: PdfFont): number {
  sectionCounter += 1;
  const num = String(sectionCounter).padStart(2, '0');
  const barH = 10;

  doc.setFillColor(...C.creamDeep);
  doc.roundedRect(MARGIN, y, CONTENT_W, barH, 1.5, 1.5, 'F');
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, CONTENT_W, barH, 1.5, 1.5, 'S');

  doc.setFillColor(...C.gold);
  doc.circle(MARGIN + 6, y + barH / 2, 3.2, 'F');
  doc.setFontSize(7);
  setFont(doc, font, 'bold');
  setColor(doc, C.white);
  doc.text(num, MARGIN + 6, y + barH / 2 + 0.8, { align: 'center' });

  doc.setFontSize(10);
  setFont(doc, font, 'bold');
  setColor(doc, C.text);
  doc.text(title, MARGIN + 12, y + 6.5);

  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 12, y + barH + 1.2, PAGE_W - MARGIN, y + barH + 1.2);

  setColor(doc, C.text);
  return y + barH + 5;
}

function drawInfoTable(
  doc: jsPDF,
  items: Array<{ label: string; value: string }>,
  y: number,
  font: PdfFont,
): number {
  const colW = (CONTENT_W - 3) / 2;
  const rowH = 16;
  const rows = Math.ceil(items.length / 2);

  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGIN, y, CONTENT_W, rows * rowH + 8, 2, 2, 'S');

  doc.setFillColor(...C.cream);
  doc.rect(MARGIN + 0.5, y + 0.5, CONTENT_W - 1, 7, 'F');
  doc.setFontSize(7);
  setFont(doc, font, 'bold');
  setColor(doc, C.goldDark);
  doc.text('ALAN', MARGIN + 4, y + 5);
  doc.text('DEĞER', MARGIN + colW + 4, y + 5);

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + 7.5, MARGIN + CONTENT_W, y + 7.5);

  const rowY = y + 8;
  items.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = MARGIN + col * (colW + 3);
    const cellY = rowY + row * rowH;

    if (col === 0 && row > 0) {
      doc.line(MARGIN, cellY, MARGIN + CONTENT_W, cellY);
    }

    doc.setFontSize(7);
    setFont(doc, font, 'normal');
    setColor(doc, C.soft);
    doc.text(item.label.toLocaleUpperCase('tr-TR'), x + 4, cellY + 5);

    doc.setFontSize(9.5);
    setFont(doc, font, 'bold');
    setColor(doc, C.text);
    const valueLines = wrapText(doc, item.value || '-', colW - 8, font);
    doc.text(valueLines[0] || '-', x + 4, cellY + 11);
  });

  setColor(doc, C.text);
  return y + rows * rowH + 12;
}

function isEmptyContent(text?: string | null): boolean {
  const normalized = text?.trim();
  return !normalized || normalized === '-';
}

function splitContentLines(text: string): string[] {
  const normalized = text?.trim();
  if (!normalized || normalized === '-') return [];
  return normalized
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

function estimateContentBoxHeight(
  doc: jsPDF,
  text: string,
  font: PdfFont,
  minHeight: number,
  useBullets: boolean,
): number {
  if (isEmptyContent(text)) return 0;
  const contentLines = useBullets ? splitContentLines(text) : wrapText(doc, text.trim(), CONTENT_W - 18, font);
  let renderedLines = 0;
  if (useBullets) {
    for (const line of contentLines) {
      renderedLines += wrapText(doc, line, CONTENT_W - 20, font).length + 0.3;
    }
  } else {
    renderedLines = contentLines.length;
  }
  return Math.max(minHeight, renderedLines * 4.8 + 14);
}

function drawEmptyPlaceholder(doc: jsPDF, y: number, font: PdfFont, message: string): number {
  doc.setFillColor(...C.cream);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, CONTENT_W, 10, 1.5, 1.5, 'FD');
  doc.setFontSize(8.5);
  setFont(doc, font, 'normal');
  setColor(doc, C.soft);
  doc.text(message, MARGIN + 5, y + 6.5);
  setFont(doc, font, 'normal');
  setColor(doc, C.text);
  return y + 14;
}

function drawContentBox(
  doc: jsPDF,
  text: string,
  y: number,
  font: PdfFont,
  minHeight: number,
  useBullets: boolean,
): number {
  const contentLines = useBullets ? splitContentLines(text) : wrapText(doc, text.trim(), CONTENT_W - 18, font);
  let renderedLines = 0;
  if (useBullets) {
    for (const line of contentLines) {
      renderedLines += wrapText(doc, line, CONTENT_W - 20, font).length + 0.3;
    }
  } else {
    renderedLines = contentLines.length;
  }
  const boxHeight = Math.max(minHeight, renderedLines * 4.8 + 14);

  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.25);
  doc.roundedRect(MARGIN, y, CONTENT_W, boxHeight, 2, 2, 'FD');

  doc.setFillColor(...C.gold);
  doc.roundedRect(MARGIN, y, 2.5, boxHeight, 1, 1, 'F');

  doc.setFontSize(10);
  setFont(doc, font, 'normal');
  setColor(doc, C.muted);

  let textY = y + 8;
  if (useBullets) {
    for (const line of contentLines) {
      doc.setDrawColor(...C.gold);
      doc.setLineWidth(0.35);
      doc.line(MARGIN + 8, textY - 2, MARGIN + 11, textY - 2);
      doc.circle(MARGIN + 9.5, textY - 2, 0.6, 'F');
      for (const wrapped of wrapText(doc, line, CONTENT_W - 20, font)) {
        doc.text(wrapped, MARGIN + 13, textY);
        textY += 4.8;
      }
      textY += 1.5;
    }
  } else {
    for (const line of contentLines) {
      doc.text(line, MARGIN + 8, textY);
      textY += 4.8;
    }
  }

  setColor(doc, C.text);
  return y + boxHeight + 8;
}

function drawSectionWithContent(
  doc: jsPDF,
  title: string,
  text: string,
  y: number,
  font: PdfFont,
  documentRef: string | undefined,
  options: { minHeight?: number; useBullets?: boolean; emptyMessage?: string },
): number {
  const useBullets = options.useBullets ?? false;
  const minHeight = options.minHeight ?? 28;
  const empty = isEmptyContent(text);

  if (empty) {
    y = ensureSpace(doc, y, SECTION_HEADER_SPACE + 16, font, documentRef);
    y = drawSectionHeader(doc, title, y, font);
    return drawEmptyPlaceholder(doc, y, font, options.emptyMessage ?? 'Henüz belirtilmedi.');
  }

  const boxHeight = estimateContentBoxHeight(doc, text, font, minHeight, useBullets);
  y = ensureSpace(doc, y, SECTION_HEADER_SPACE + boxHeight + 4, font, documentRef);
  y = drawSectionHeader(doc, title, y, font);
  return drawContentBox(doc, text, y, font, minHeight, useBullets);
}

function drawAboutSection(doc: jsPDF, y: number, font: PdfFont, documentRef?: string): number {
  y = ensureSpace(doc, y, 48, font, documentRef);
  y = drawSectionHeader(doc, 'Hakkımızda', y, font);

  const boxHeight = 38;
  doc.setFillColor(...C.cream);
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGIN, y, CONTENT_W, boxHeight, 2, 2, 'FD');

  const leftW = CONTENT_W * 0.32;
  doc.setFillColor(...C.white);
  doc.roundedRect(MARGIN + 1, y + 1, leftW - 1, boxHeight - 2, 1.5, 1.5, 'F');
  doc.setDrawColor(...C.gold);
  doc.line(MARGIN + leftW, y + 2, MARGIN + leftW, y + boxHeight - 2);

  doc.setFontSize(10);
  setFont(doc, font, 'bold');
  setColor(doc, C.text);
  doc.text(SALESDESK_QUOTE_TEMPLATE.issuerName, MARGIN + 5, y + 9);

  doc.setFontSize(7);
  setFont(doc, font, 'normal');
  setColor(doc, C.goldDark);
  let tagY = y + 14;
  for (const line of wrapText(doc, SALESDESK_QUOTE_TEMPLATE.introSubtitle, leftW - 10, font)) {
    doc.text(line, MARGIN + 5, tagY);
    tagY += 3.5;
  }

  const rightX = MARGIN + leftW + 5;
  doc.setFontSize(8);
  setFont(doc, font, 'normal');
  setColor(doc, C.muted);
  const aboutText = `${SALESDESK_QUOTE_TEMPLATE.introLead.slice(0, 200)}...`;
  let textY = y + 8;
  for (const line of wrapText(doc, aboutText, CONTENT_W - leftW - 10, font)) {
    doc.text(line, rightX, textY);
    textY += 3.6;
  }

  let pillX = rightX;
  const pillY = y + boxHeight - 6;
  doc.setFontSize(6.5);
  setFont(doc, font, 'bold');
  for (const item of SALESDESK_QUOTE_TEMPLATE.expertise) {
    const pillText = item.title;
    const pillW = doc.getTextWidth(pillText) + 7;
    doc.setFillColor(...C.white);
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.25);
    doc.roundedRect(pillX, pillY - 4, pillW, 5.5, 1.5, 1.5, 'FD');
    setColor(doc, C.goldDark);
    doc.text(pillText, pillX + 3.5, pillY);
    pillX += pillW + 2.5;
  }

  setColor(doc, C.text);
  return y + boxHeight + 10;
}

function drawSignatureBlock(doc: jsPDF, y: number, visitorName: string, font: PdfFont, documentRef?: string): number {
  y = ensureSpace(doc, y, 38, font, documentRef);
  y = drawSectionHeader(doc, 'Onay ve İmza', y, font);

  const colW = (CONTENT_W - 6) / 2;
  const cardH = 22;

  const drawSignatureCard = (x: number, label: string, name?: string): void => {
    doc.setFillColor(...C.white);
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y, colW, cardH, 2, 2, 'FD');
    doc.setFillColor(...C.cream);
    doc.roundedRect(x + 1, y + 1, colW - 2, 6, 1.5, 1.5, 'F');

    doc.setFontSize(7);
    setFont(doc, font, 'bold');
    setColor(doc, C.goldDark);
    doc.text(label.toLocaleUpperCase('tr-TR'), x + 4, y + 5);

    if (name?.trim()) {
      doc.setFontSize(10);
      setFont(doc, font, 'bold');
      setColor(doc, C.text);
      doc.text(name.trim(), x + 4, y + 12);
    }

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(x + 4, y + 17, x + colW - 4, y + 17);

    doc.setFontSize(6.5);
    setFont(doc, font, 'normal');
    setColor(doc, C.soft);
    doc.text('İmza / Kaşe', x + 4, y + 20);
  };

  drawSignatureCard(MARGIN, 'Ziyareti Yapan', visitorName);
  drawSignatureCard(MARGIN + colW + 6, 'Müşteri Temsilcisi / Onay');

  return y + cardH + 8;
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
  sectionCounter = 0;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const fontRegistered = await registerQuotationExportPdfFont(doc);
  const font: PdfFont = fontRegistered ? QUOTATION_EXPORT_PDF_FONT : 'helvetica';
  const logoDataUrl = await loadLogoDataUrl();
  const data = parseVisitFormContent(form.content);
  const documentRef = buildDocumentRef(form);

  drawPageAccent(doc);
  drawFooter(doc, 1, font, documentRef);

  let y = drawBrandedHeader(doc, logoDataUrl, font);
  y = drawHeroSection(doc, form.title, form.formDate, documentRef, y, font);
  y = drawMetaKpiRow(doc, form, form.customerName || '-', y, font);

  y = drawSectionHeader(doc, 'Ziyaret Bilgileri', y, font);
  const infoItems = [
    { label: 'Cari', value: form.customerName || '-' },
    { label: 'Tarih', value: formatDate(form.formDate) },
    { label: 'Ziyareti Yapan', value: data.visitorName || '-' },
    { label: 'Görüşülen Kişi', value: data.contactedPerson || '-' },
  ];
  if (data.recipientEmail?.trim()) infoItems.push({ label: 'E-posta', value: data.recipientEmail.trim() });
  if (data.recipientPhone?.trim()) infoItems.push({ label: 'Telefon', value: data.recipientPhone.trim() });
  y = drawInfoTable(doc, infoItems, y, font);

  y = drawSectionWithContent(doc, 'Yapılanlar / Notlar', data.notes?.trim() || '', y, font, documentRef, {
    minHeight: 30,
    emptyMessage: 'Not girilmemiş.',
  });

  y = drawSectionWithContent(doc, 'Sonraki Adımlar', data.nextSteps?.trim() || '', y, font, documentRef, {
    minHeight: 22,
    useBullets: true,
    emptyMessage: 'Henüz belirtilmedi.',
  });

  y = drawSignatureBlock(doc, y, data.visitorName || '', font, documentRef);
  drawAboutSection(doc, y, font, documentRef);

  drawFooter(doc, doc.getNumberOfPages(), font, documentRef);

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
