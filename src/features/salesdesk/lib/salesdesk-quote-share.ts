import { toast } from 'sonner';
import { blobToBase64, blobToFile } from '@/features/quotation/utils/quotation-share-utils';
import { exportSheetsToXlsx } from '@/lib/xlsx-export';
import type { SalesDeskQuoteDto } from '../api/salesdesk-api';
import {
  buildSalesDeskQuotePreviewDataFromDto,
  type SalesDeskQuotePreviewData,
} from './build-salesdesk-quote-preview-data';
import {
  buildSalesDeskQuotePdfBlob,
  buildSalesDeskQuotePdfFileName,
  downloadBlob,
  type BuildSalesDeskQuotePdfOptions,
} from './export-salesdesk-quote-pdf';
import { formatMoney } from './salesdesk-shared';
import { isValidEmail } from './visit-form-recipient';

export interface QuoteShareContact {
  email?: string | null;
  phone?: string | null;
}

const MAIL_STATUS_TIMEOUT_MS = 12_000;
const LOCAL_QUOTE_ID_START = 900_000;

function buildGmailComposeUrl(to: string | undefined, subject: string, body: string): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    su: subject,
    body,
  });
  if (to?.trim()) {
    params.set('to', to.trim());
  }
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function normalizePhone(value?: string | null): string {
  return (value ?? '').replace(/\D/g, '');
}

function buildQuoteShareMessage(data: SalesDeskQuotePreviewData): string {
  return [
    `Sayın ${data.customerName},`,
    '',
    `${data.quoteNumber} numaralı teklifimiz ekte sunulmuştur.`,
    data.quoteDateLabel ? `Teklif tarihi: ${data.quoteDateLabel}` : '',
    '',
    'Saygılarımızla,',
    'V3RII Teknoloji',
  ]
    .filter(Boolean)
    .join('\n');
}

function openExternalUrl(url: string): void {
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.href = url;
  }
}

async function getGoogleMailConnected(): Promise<boolean> {
  try {
    const { googleIntegrationApi } = await import('@/features/google-integration/api/google-integration.api');
    const status = await Promise.race([
      googleIntegrationApi.getStatus(),
      new Promise<null>((resolve) => window.setTimeout(() => resolve(null), MAIL_STATUS_TIMEOUT_MS)),
    ]);
    return Boolean(status?.isConnected);
  } catch {
    return false;
  }
}

type QuoteMailContext = Pick<SalesDeskQuoteDto, 'id' | 'customerId' | 'quoteNumber'>;

async function sendQuoteViaGoogleIntegration(params: {
  quote: QuoteMailContext;
  toEmail: string;
  subject: string;
  body: string;
  fileName: string;
  pdfBlob: Blob;
}): Promise<void> {
  const attachment = {
    fileName: params.fileName,
    contentType: 'application/pdf',
    base64Content: await blobToBase64(params.pdfBlob),
  };

  const payload = {
    customerId: params.quote.customerId,
    to: params.toEmail,
    subject: params.subject,
    body: params.body,
    isHtml: false,
    moduleKey: 'quotation' as const,
    recordId: params.quote.id >= LOCAL_QUOTE_ID_START ? undefined : params.quote.id,
    recordNo: params.quote.quoteNumber,
    contextTitle: params.quote.quoteNumber,
    createActivityLog: true,
    attachments: [attachment],
  };

  const { googleIntegrationApi } = await import('@/features/google-integration/api/google-integration.api');
  await googleIntegrationApi.sendCustomerMail(payload);
}

async function tryWebSharePdf(params: { file: File; text: string; title: string }): Promise<boolean> {
  if (typeof navigator.share !== 'function') return false;

  const shareData: ShareData = {
    files: [params.file],
    text: params.text,
    title: params.title,
  };

  if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
    return false;
  }

  await navigator.share(shareData);
  return true;
}

export async function buildQuotePreviewPdf(
  data: SalesDeskQuotePreviewData,
  options?: BuildSalesDeskQuotePdfOptions,
): Promise<{ blob: Blob; fileName: string; url: string }> {
  const blob = await buildSalesDeskQuotePdfBlob(data, options);
  const fileName = buildSalesDeskQuotePdfFileName(data);
  const url = URL.createObjectURL(blob);
  return { blob, fileName, url };
}

export async function downloadQuotePreviewPdf(
  data: SalesDeskQuotePreviewData,
  options?: BuildSalesDeskQuotePdfOptions,
): Promise<void> {
  const { blob, fileName } = await buildQuotePreviewPdf(data, options);
  downloadBlob(blob, fileName);
  toast.success('PDF indirildi.');
}

export async function downloadQuotePdf(quote: SalesDeskQuoteDto): Promise<void> {
  const data = buildSalesDeskQuotePreviewDataFromDto(quote);
  await downloadQuotePreviewPdf(data);
}

export async function exportQuotePreviewToExcel(data: SalesDeskQuotePreviewData): Promise<void> {
  const summaryRows = [
    ['Teklif No', data.quoteNumber],
    ['Cari', data.customerName],
    ['Tarih', data.quoteDateLabel],
    ['Ara Toplam', formatMoney(data.subTotal)],
    ['KDV', formatMoney(data.vatTotal)],
    ['Genel Toplam', data.grandTotalLabel],
  ];

  const lineRows = [
    ['Hizmet / Ürün', 'Kapsam Açıklaması', 'Bedel'],
    ...data.lines.map((line) => [line.title, line.description, line.amountLabel]),
  ];

  await exportSheetsToXlsx(`teklif-${data.quoteNumber}.xlsx`, [
    { name: 'Ozet', rows: summaryRows },
    { name: 'Kalemler', rows: lineRows.length > 1 ? lineRows : [['Kalem bulunmuyor']] },
  ]);
  toast.success('Teklif Excel olarak indirildi.');
}

export async function exportQuoteToExcel(quote: SalesDeskQuoteDto): Promise<void> {
  const summaryRows = [
    ['Teklif No', quote.quoteNumber],
    ['Cari', quote.customerName],
    ['Tarih', quote.quoteDate],
    ['Ara Toplam', formatMoney(quote.subTotal)],
    ['KDV', formatMoney(quote.vatTotal)],
    ['Genel Toplam', formatMoney(quote.grandTotal)],
  ];

  const lineRows = [
    ['Sira', 'Urun', 'Kod', 'Miktar', 'Birim Fiyat', 'KDV %', 'Tutar'],
    ...(quote.lines ?? []).map((line, index) => [
      index + 1,
      line.productName ?? '',
      line.productCode ?? '',
      line.quantity,
      line.unitPrice,
      line.vatRate,
      line.lineTotal,
    ]),
  ];

  await exportSheetsToXlsx(`teklif-${quote.quoteNumber}.xlsx`, [
    { name: 'Ozet', rows: summaryRows },
    { name: 'Kalemler', rows: lineRows.length > 1 ? lineRows : [['Kalem bulunmuyor']] },
  ]);
  toast.success('Teklif Excel olarak indirildi.');
}

export async function shareQuotePreviewViaGmail(
  data: SalesDeskQuotePreviewData,
  contact?: QuoteShareContact | null,
  options?: BuildSalesDeskQuotePdfOptions & { quote?: QuoteMailContext | null },
): Promise<void> {
  const email = contact?.email?.trim() || '';
  const subject = `Teklif - ${data.quoteNumber} | ${data.customerName}`;
  const body = `${buildQuoteShareMessage(data)}\n`;
  const { blob, fileName } = await buildQuotePreviewPdf(data, options);
  const quote = options?.quote;

  // 1) Google entegrasyonu — PDF otomatik ekli gider (Windows paylasim menusu Gmail gostermez)
  if (quote?.customerId && email && isValidEmail(email) && (await getGoogleMailConnected())) {
    try {
      await sendQuoteViaGoogleIntegration({
        quote,
        toEmail: email,
        subject,
        body,
        fileName,
        pdfBlob: blob,
      });
      toast.success('Teklif Gmail ile PDF ekiyle gönderildi.');
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gmail gönderimi başarısız.';
      toast.error(message);
    }
  }

  // 2) Gmail web taslağı + indirilen PDF (ek elle)
  downloadBlob(blob, fileName);
  window.setTimeout(() => {
    openExternalUrl(buildGmailComposeUrl(email || undefined, subject, body));
  }, 400);

  if (!email || !isValidEmail(email)) {
    toast.message('PDF indirildi. Gmail açıldı; alıcıyı ve indirilen PDF ekini siz seçin.', { duration: 8000 });
    return;
  }

  toast.message(
    'PDF indirildi ve Gmail açıldı. İndirilen dosyayı e-postaya sürükleyin veya ekle. Otomatik gönderim için Ayarlar → Google entegrasyonunu bağlayın.',
    { duration: 10000 },
  );
}

export async function shareQuotePreviewViaWhatsApp(
  data: SalesDeskQuotePreviewData,
  contact?: QuoteShareContact | null,
  options?: BuildSalesDeskQuotePdfOptions,
): Promise<void> {
  const phone = normalizePhone(contact?.phone);
  const message = buildQuoteShareMessage(data);
  const { blob, fileName } = await buildQuotePreviewPdf(data, options);
  const file = blobToFile(blob, fileName);

  try {
    const shared = await tryWebSharePdf({
      file,
      text: message,
      title: fileName,
    });
    if (shared) {
      toast.success('WhatsApp paylaşım menüsü açıldı.');
      return;
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
  }

  downloadBlob(blob, fileName);
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
  openExternalUrl(url);
  toast.success('PDF indirildi. WhatsApp\'ta dosyayı ekleyin.');
}

export async function shareQuoteViaGmail(
  quote: SalesDeskQuoteDto,
  contact?: QuoteShareContact | null,
): Promise<void> {
  const data = buildSalesDeskQuotePreviewDataFromDto(quote);
  await shareQuotePreviewViaGmail(data, contact, { quote });
}

export async function shareQuoteViaWhatsApp(
  quote: SalesDeskQuoteDto,
  contact?: QuoteShareContact | null,
): Promise<void> {
  const data = buildSalesDeskQuotePreviewDataFromDto(quote);
  await shareQuotePreviewViaWhatsApp(data, contact);
}

export async function previewQuotePdf(quote: SalesDeskQuoteDto): Promise<{
  blob: Blob;
  fileName: string;
  url: string;
  data: SalesDeskQuotePreviewData;
}> {
  const data = buildSalesDeskQuotePreviewDataFromDto(quote);
  const result = await buildQuotePreviewPdf(data);
  return { ...result, data };
}
