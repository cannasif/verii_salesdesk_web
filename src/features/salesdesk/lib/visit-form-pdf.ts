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

const MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

type PdfFont = typeof QUOTATION_EXPORT_PDF_FONT | 'helvetica';
type Rgb = readonly [number, number, number];

/** Sade palet: altın vurgu + gri tonları */
const C = {
  gold: [201, 162, 39] as Rgb,
  text: [15, 23, 42] as Rgb,
  muted: [71, 85, 105] as Rgb,
  light: [100, 116, 139] as Rgb,
  border: [226, 232, 240] as Rgb,
  fill: [248, 250, 252] as Rgb,
  white: [255, 255, 255] as Rgb,
};

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

function drawFooter(doc: jsPDF, pageNumber: number, font: PdfFont, documentRef?: string): void {
  const y = PAGE_H - 10;
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.25);
  doc.line(MARGIN, y - 4, PAGE_W - MARGIN, y - 4);

  doc.setFontSize(7);
  setFont(doc, font, 'normal');
  setColor(doc, C.light);
  const footerLeft = documentRef
    ? `${SALESDESK_QUOTE_TEMPLATE.footerLine}  ·  ${documentRef}`
    : SALESDESK_QUOTE_TEMPLATE.footerLine;
  doc.text(footerLeft, MARGIN, y);

  doc.setFontSize(6.5);
  setColor(doc, C.light);
  doc.text('Bu belge elektronik ortamda oluşturulmuştur.', MARGIN, y + 3.5);

  setColor(doc, C.muted);
  doc.setFontSize(7.5);
  doc.text(String(pageNumber).padStart(2, '0'), PAGE_W - MARGIN, y, { align: 'right' });
  setColor(doc, C.text);
}

function ensureSpace(doc: jsPDF, y: number, needed: number, font: PdfFont, documentRef?: string): number {
  if (y + needed <= PAGE_H - 22) return y;
  drawFooter(doc, doc.getNumberOfPages(), font, documentRef);
  doc.addPage();
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

function drawDocumentMetaStrip(
  doc: jsPDF,
  form: SalesDeskVisitFormDto,
  customerName: string,
  y: number,
  font: PdfFont,
): number {
  const stripH = 10;
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.border);
  doc.roundedRect(MARGIN, y, CONTENT_W, stripH, 2, 2, 'FD');

  doc.setFontSize(8);
  setFont(doc, font, 'bold');
  setColor(doc, C.text);
  doc.text(`Belge No: ${buildDocumentRef(form)}`, MARGIN + 5, y + 6.5);

  doc.setFontSize(8);
  setFont(doc, font, 'normal');
  setColor(doc, C.muted);
  doc.text(customerName || '-', MARGIN + 52, y + 6.5);

  doc.setFontSize(7.5);
  setColor(doc, C.light);
  doc.text(`Oluşturulma: ${formatGeneratedDate()}`, PAGE_W - MARGIN - 5, y + 6.5, { align: 'right' });

  setColor(doc, C.text);
  return y + stripH + 8;
}

function drawBrandedHeader(doc: jsPDF, logoDataUrl: string | null, font: PdfFont): number {
  const template = SALESDESK_QUOTE_TEMPLATE;
  let y = MARGIN;

  drawLogo(doc, logoDataUrl, MARGIN, y, 13);

  doc.setFontSize(12);
  setFont(doc, font, 'bold');
  setColor(doc, C.text);
  doc.text(template.issuerName, PAGE_W - MARGIN, y + 5, { align: 'right' });

  doc.setFontSize(8);
  setFont(doc, font, 'normal');
  setColor(doc, C.muted);
  doc.text(template.issuerTagline, PAGE_W - MARGIN, y + 11, { align: 'right' });

  doc.setFontSize(7.5);
  setColor(doc, C.light);
  doc.text('Kurumsal Ziyaret Raporu', PAGE_W - MARGIN, y + 16, { align: 'right' });

  y += 22;
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);

  setColor(doc, C.text);
  return y + 8;
}

function drawHeroSection(doc: jsPDF, title: string, formDate: string, y: number, font: PdfFont): number {
  const heroH = 26;
  doc.setFillColor(...C.fill);
  doc.setDrawColor(...C.border);
  doc.roundedRect(MARGIN, y, CONTENT_W, heroH, 2, 2, 'FD');

  doc.setFillColor(...C.gold);
  doc.roundedRect(MARGIN, y, 2.5, heroH, 1, 1, 'F');

  const innerX = MARGIN + 7;
  doc.setFontSize(7.5);
  setFont(doc, font, 'bold');
  setColor(doc, C.light);
  doc.text('ZİYARET RAPORU', innerX, y + 8);

  doc.setFontSize(15);
  setFont(doc, font, 'bold');
  setColor(doc, C.text);
  let titleY = y + 16;
  for (const line of wrapText(doc, title, CONTENT_W * 0.65, font)) {
    doc.text(line, innerX, titleY);
    titleY += 6.5;
  }

  const dateX = PAGE_W - MARGIN - 5;
  doc.setFontSize(7);
  setFont(doc, font, 'normal');
  setColor(doc, C.light);
  doc.text('TARİH', dateX, y + 10, { align: 'right' });
  doc.setFontSize(10);
  setFont(doc, font, 'bold');
  setColor(doc, C.gold);
  doc.text(formatDate(formDate), dateX, y + 16, { align: 'right' });

  setColor(doc, C.text);
  return y + heroH + 10;
}

function drawSectionHeader(doc: jsPDF, title: string, y: number, font: PdfFont): number {
  const barH = 9;
  doc.setFillColor(...C.fill);
  doc.setDrawColor(...C.border);
  doc.roundedRect(MARGIN, y, CONTENT_W, barH, 1.5, 1.5, 'FD');

  doc.setFillColor(...C.gold);
  doc.roundedRect(MARGIN, y, 2.5, barH, 1, 1, 'F');

  doc.setFontSize(9.5);
  setFont(doc, font, 'bold');
  setColor(doc, C.text);
  doc.text(title, MARGIN + 6, y + 6);

  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.35);
  doc.line(MARGIN, y + barH + 1.5, PAGE_W - MARGIN, y + barH + 1.5);

  setColor(doc, C.text);
  return y + barH + 6;
}

function drawInfoCell(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  font: PdfFont,
): void {
  doc.setDrawColor(...C.border);
  doc.setFillColor(...C.white);
  doc.roundedRect(x, y, width, height, 2, 2, 'FD');

  doc.setFillColor(...C.gold);
  doc.roundedRect(x + 2, y + 2, width - 4, 0.6, 0.3, 0.3, 'F');

  doc.setFontSize(7);
  setFont(doc, font, 'normal');
  setColor(doc, C.light);
  doc.text(label.toLocaleUpperCase('tr-TR'), x + 4, y + 7);

  doc.setFontSize(10);
  setFont(doc, font, 'bold');
  setColor(doc, C.text);
  const valueLines = wrapText(doc, value || '-', width - 8, font);
  let valueY = y + 13;
  for (const line of valueLines.slice(0, 2)) {
    doc.text(line, x + 4, valueY);
    valueY += 4.8;
  }
}

const SECTION_HEADER_SPACE = 15;

function isEmptyContent(text?: string | null): boolean {
  const normalized = text?.trim();
  return !normalized || normalized === '-';
}

function estimateContentBoxHeight(
  doc: jsPDF,
  text: string,
  font: PdfFont,
  minHeight: number,
  useBullets: boolean,
): number {
  if (isEmptyContent(text)) return 0;

  const contentLines = useBullets ? splitContentLines(text) : wrapText(doc, text.trim(), CONTENT_W - 14, font);
  let renderedLines = 0;
  if (useBullets) {
    for (const line of contentLines) {
      renderedLines += wrapText(doc, line, CONTENT_W - 16, font).length + 0.2;
    }
  } else {
    renderedLines = contentLines.length;
  }
  return Math.max(minHeight, renderedLines * 4.8 + 12);
}

function drawEmptyPlaceholder(doc: jsPDF, y: number, font: PdfFont, message = 'Henüz belirtilmedi.'): number {
  doc.setFontSize(9);
  setFont(doc, font, 'normal');
  setColor(doc, C.light);
  doc.text(message, MARGIN + 2, y + 4);
  setColor(doc, C.text);
  return y + 10;
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
    y = ensureSpace(doc, y, SECTION_HEADER_SPACE + 12, font, documentRef);
    y = drawSectionHeader(doc, title, y, font);
    return drawEmptyPlaceholder(doc, y, font, options.emptyMessage);
  }

  const boxHeight = estimateContentBoxHeight(doc, text, font, minHeight, useBullets);
  y = ensureSpace(doc, y, SECTION_HEADER_SPACE + boxHeight + 4, font, documentRef);
  y = drawSectionHeader(doc, title, y, font);
  return drawContentBox(doc, text, y, font, minHeight, documentRef, useBullets, false);
}

function splitContentLines(text: string): string[] {
  const normalized = text?.trim();
  if (!normalized || normalized === '-') return [];
  return normalized
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

function drawContentBox(
  doc: jsPDF,
  text: string,
  y: number,
  font: PdfFont,
  minHeight = 28,
  documentRef?: string,
  useBullets = false,
  ensureBeforeDraw = true,
): number {
  const contentLines = useBullets ? splitContentLines(text) : wrapText(doc, text.trim(), CONTENT_W - 14, font);

  let renderedLines = 0;
  if (useBullets) {
    for (const line of contentLines) {
      renderedLines += wrapText(doc, line, CONTENT_W - 16, font).length + 0.2;
    }
  } else {
    renderedLines = contentLines.length;
  }

  const boxHeight = Math.max(minHeight, renderedLines * 4.8 + 12);

  if (ensureBeforeDraw) {
    y = ensureSpace(doc, y, boxHeight + 4, font, documentRef);
  }
  doc.setDrawColor(...C.border);
  doc.setFillColor(...C.white);
  doc.roundedRect(MARGIN, y, CONTENT_W, boxHeight, 2, 2, 'FD');

  doc.setFillColor(...C.gold);
  doc.roundedRect(MARGIN, y, 2.5, boxHeight, 1, 1, 'F');

  doc.setFontSize(10);
  setFont(doc, font, 'normal');
  setColor(doc, C.muted);

  let textY = y + 7;
  if (useBullets) {
    for (const line of contentLines) {
      doc.setFillColor(...C.gold);
      doc.circle(MARGIN + 7, textY - 1.2, 0.7, 'F');
      for (const wrapped of wrapText(doc, line, CONTENT_W - 16, font)) {
        doc.text(wrapped, MARGIN + 10, textY);
        textY += 4.8;
      }
      textY += 1;
    }
  } else {
    for (const line of contentLines) {
      doc.text(line, MARGIN + 7, textY);
      textY += 4.8;
    }
  }

  setColor(doc, C.text);
  return y + boxHeight + 8;
}

function drawAboutSection(doc: jsPDF, y: number, font: PdfFont, documentRef?: string): number {
  y = ensureSpace(doc, y, 44, font, documentRef);
  y = drawSectionHeader(doc, 'Hakkımızda', y, font);

  const boxHeight = 36;
  doc.setDrawColor(...C.border);
  doc.setFillColor(...C.fill);
  doc.roundedRect(MARGIN, y, CONTENT_W, boxHeight, 2, 2, 'FD');

  doc.setFillColor(...C.gold);
  doc.roundedRect(MARGIN, y, 2.5, boxHeight, 1, 1, 'F');

  doc.setFontSize(9);
  setFont(doc, font, 'bold');
  setColor(doc, C.text);
  doc.text(SALESDESK_QUOTE_TEMPLATE.issuerName, MARGIN + 7, y + 7);

  doc.setFontSize(8);
  setFont(doc, font, 'normal');
  setColor(doc, C.muted);
  const aboutText = `${SALESDESK_QUOTE_TEMPLATE.introLead.slice(0, 220)}...`;
  let textY = y + 12;
  for (const line of wrapText(doc, aboutText, CONTENT_W - 12, font)) {
    doc.text(line, MARGIN + 7, textY);
    textY += 3.8;
  }

  const expertiseLine = SALESDESK_QUOTE_TEMPLATE.expertise.map((item) => item.title).join('  ·  ');
  doc.setFontSize(7.5);
  setFont(doc, font, 'bold');
  setColor(doc, C.gold);
  doc.text(expertiseLine, MARGIN + 7, y + boxHeight - 4);

  setColor(doc, C.text);
  return y + boxHeight + 10;
}

function drawSignatureBlock(doc: jsPDF, y: number, visitorName: string, font: PdfFont, documentRef?: string): number {
  y = ensureSpace(doc, y, 36, font, documentRef);
  y = drawSectionHeader(doc, 'Onay ve İmza', y, font);

  const colW = (CONTENT_W - 8) / 2;
  const cardH = 20;

  const drawSignatureCard = (x: number, label: string, name?: string): void => {
    doc.setDrawColor(...C.border);
    doc.setFillColor(...C.white);
    doc.roundedRect(x, y, colW, cardH, 2, 2, 'FD');

    doc.setFillColor(...C.gold);
    doc.roundedRect(x, y, colW, 0.6, 0.3, 0.3, 'F');

    doc.setFontSize(7.5);
    setFont(doc, font, 'normal');
    setColor(doc, C.light);
    doc.text(label.toLocaleUpperCase('tr-TR'), x + 4, y + 6);

    if (name?.trim()) {
      doc.setFontSize(10);
      setFont(doc, font, 'bold');
      setColor(doc, C.text);
      doc.text(name.trim(), x + 4, y + 12);
    }

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(x + 4, y + 16, x + colW - 4, y + 16);

    doc.setFontSize(6.5);
    setFont(doc, font, 'normal');
    setColor(doc, C.light);
    doc.text('İmza', x + 4, y + 18.5);
  };

  drawSignatureCard(MARGIN, 'Ziyareti Yapan', visitorName);
  drawSignatureCard(MARGIN + colW + 8, 'Müşteri Temsilcisi / Onay');

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
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const fontRegistered = await registerQuotationExportPdfFont(doc);
  const font: PdfFont = fontRegistered ? QUOTATION_EXPORT_PDF_FONT : 'helvetica';
  const logoDataUrl = await loadLogoDataUrl();
  const data = parseVisitFormContent(form.content);
  const documentRef = buildDocumentRef(form);

  drawFooter(doc, 1, font, documentRef);

  let y = drawBrandedHeader(doc, logoDataUrl, font);
  y = drawHeroSection(doc, form.title, form.formDate, y, font);
  y = drawDocumentMetaStrip(doc, form, form.customerName || '-', y, font);

  y = drawSectionHeader(doc, 'Ziyaret Bilgileri', y, font);
  const cellW = (CONTENT_W - 4) / 2;
  const cellH = 19;
  const infoItems = [
    { label: 'Cari', value: form.customerName || '-' },
    { label: 'Tarih', value: formatDate(form.formDate) },
    { label: 'Ziyareti Yapan', value: data.visitorName || '-' },
    { label: 'Görüşülen Kişi', value: data.contactedPerson || '-' },
  ];

  if (data.recipientEmail?.trim()) {
    infoItems.push({ label: 'E-posta', value: data.recipientEmail.trim() });
  }
  if (data.recipientPhone?.trim()) {
    infoItems.push({ label: 'Telefon', value: data.recipientPhone.trim() });
  }

  const infoRows = Math.ceil(infoItems.length / 2);
  infoItems.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = MARGIN + col * (cellW + 4);
    const cellY = y + row * (cellH + 4);
    drawInfoCell(doc, item.label, item.value, x, cellY, cellW, cellH, font);
  });
  y += infoRows * (cellH + 4) + 6;

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
  y = drawAboutSection(doc, y, font, documentRef);

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
