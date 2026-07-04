import { toast } from 'sonner';
import { blobToBase64, blobToFile } from '@/features/quotation/utils/quotation-share-utils';
import { exportSheetsToXlsx } from '@/lib/xlsx-export';
import type { SalesDeskInvoiceDto } from '../api/salesdesk-api';
import {
  buildSalesDeskInvoicePreviewDataFromDto,
} from './build-salesdesk-invoice-preview-data';
import type { SalesDeskQuotePreviewData } from './build-salesdesk-quote-preview-data';
import {
  buildSalesDeskQuotePdfBlob,
  buildSalesDeskQuotePdfFileName,
  downloadBlob,
  type BuildSalesDeskQuotePdfOptions,
} from './export-salesdesk-quote-pdf';
import { formatMoney } from './salesdesk-shared';
import { isValidEmail } from './visit-form-recipient';

export interface InvoiceShareContact {
  email?: string | null;
  phone?: string | null;
}

const MAIL_STATUS_TIMEOUT_MS = 12_000;
const LOCAL_INVOICE_ID_START = 910_000;

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

function invoiceDocumentLabel(data: SalesDeskQuotePreviewData): string {
  return data.documentTitle ?? 'Fatura';
}

function buildInvoiceShareMessage(data: SalesDeskQuotePreviewData): string {
  const docLabel = invoiceDocumentLabel(data);
  return [
    `Sayın ${data.customerName},`,
    '',
    `${data.quoteNumber} numaralı ${docLabel.toLowerCase()}mız ekte sunulmuştur.`,
    data.quoteDateLabel ? `Fatura tarihi: ${data.quoteDateLabel}` : '',
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

type InvoiceMailContext = Pick<SalesDeskInvoiceDto, 'id' | 'customerId' | 'invoiceNumber'>;

async function sendInvoiceViaGoogleIntegration(params: {
  invoice: InvoiceMailContext;
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
    customerId: params.invoice.customerId,
    to: params.toEmail,
    subject: params.subject,
    body: params.body,
    isHtml: false,
    moduleKey: 'order' as const,
    recordId: params.invoice.id >= LOCAL_INVOICE_ID_START ? undefined : params.invoice.id,
    recordNo: params.invoice.invoiceNumber,
    contextTitle: params.invoice.invoiceNumber,
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

export async function buildInvoicePreviewPdf(
  data: SalesDeskQuotePreviewData,
  options?: BuildSalesDeskQuotePdfOptions
): Promise<{ blob: Blob; fileName: string; url: string }> {
  const blob = await buildSalesDeskQuotePdfBlob(data, options);
  const fileName = buildSalesDeskQuotePdfFileName(data, 'fatura');
  const url = URL.createObjectURL(blob);
  return { blob, fileName, url };
}

export async function downloadInvoicePreviewPdf(
  data: SalesDeskQuotePreviewData,
  options?: BuildSalesDeskQuotePdfOptions
): Promise<void> {
  const { blob, fileName } = await buildInvoicePreviewPdf(data, options);
  downloadBlob(blob, fileName);
  toast.success('PDF indirildi.');
}

export async function downloadInvoicePdf(invoice: SalesDeskInvoiceDto): Promise<void> {
  const data = buildSalesDeskInvoicePreviewDataFromDto(invoice);
  await downloadInvoicePreviewPdf(data);
}

export async function exportInvoicePreviewToExcel(data: SalesDeskQuotePreviewData): Promise<void> {
  const docLabel = invoiceDocumentLabel(data);
  const summaryRows = [
    ['Fatura No', data.quoteNumber],
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

  await exportSheetsToXlsx(`fatura-${data.quoteNumber}.xlsx`, [
    { name: 'Ozet', rows: summaryRows },
    { name: 'Kalemler', rows: lineRows.length > 1 ? lineRows : [[`${docLabel} kalemi bulunmuyor`]] },
  ]);
  toast.success('Fatura Excel olarak indirildi.');
}

export async function exportInvoiceToExcel(invoice: SalesDeskInvoiceDto): Promise<void> {
  const summaryRows = [
    ['Fatura No', invoice.invoiceNumber],
    ['Cari', invoice.customerName],
    ['Tarih', invoice.invoiceDate],
    ['Ara Toplam', formatMoney(invoice.subTotal)],
    ['KDV', formatMoney(invoice.vatTotal)],
    ['Genel Toplam', formatMoney(invoice.grandTotal)],
  ];

  const lineRows = [
    ['Sira', 'Urun', 'Kod', 'Miktar', 'Birim Fiyat', 'KDV %', 'Tutar'],
    ...(invoice.lines ?? []).map((line, index) => [
      index + 1,
      line.productName ?? '',
      line.productCode ?? '',
      line.quantity,
      line.unitPrice,
      line.vatRate,
      line.lineTotal,
    ]),
  ];

  await exportSheetsToXlsx(`fatura-${invoice.invoiceNumber}.xlsx`, [
    { name: 'Ozet', rows: summaryRows },
    { name: 'Kalemler', rows: lineRows.length > 1 ? lineRows : [['Kalem bulunmuyor']] },
  ]);
  toast.success('Fatura Excel olarak indirildi.');
}

export async function shareInvoicePreviewViaGmail(
  data: SalesDeskQuotePreviewData,
  contact?: InvoiceShareContact | null,
  options?: BuildSalesDeskQuotePdfOptions & { invoice?: InvoiceMailContext | null }
): Promise<void> {
  const email = contact?.email?.trim() || '';
  const docLabel = invoiceDocumentLabel(data);
  const subject = `${docLabel} - ${data.quoteNumber} | ${data.customerName}`;
  const body = `${buildInvoiceShareMessage(data)}\n`;
  const { blob, fileName } = await buildInvoicePreviewPdf(data, options);
  const invoice = options?.invoice;

  if (invoice?.customerId && email && isValidEmail(email) && (await getGoogleMailConnected())) {
    try {
      await sendInvoiceViaGoogleIntegration({
        invoice,
        toEmail: email,
        subject,
        body,
        fileName,
        pdfBlob: blob,
      });
      toast.success('Fatura Gmail ile PDF ekiyle gönderildi.');
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gmail gönderimi başarısız.';
      toast.error(message);
    }
  }

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
    { duration: 10000 }
  );
}

export async function shareInvoicePreviewViaWhatsApp(
  data: SalesDeskQuotePreviewData,
  contact?: InvoiceShareContact | null,
  options?: BuildSalesDeskQuotePdfOptions
): Promise<void> {
  const phone = normalizePhone(contact?.phone);
  const message = buildInvoiceShareMessage(data);
  const { blob, fileName } = await buildInvoicePreviewPdf(data, options);
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
  const url = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  openExternalUrl(url);
  toast.success("PDF indirildi. WhatsApp'ta dosyayı ekleyin.");
}

export async function shareInvoiceViaGmail(
  invoice: SalesDeskInvoiceDto,
  contact?: InvoiceShareContact | null
): Promise<void> {
  const data = buildSalesDeskInvoicePreviewDataFromDto(invoice);
  await shareInvoicePreviewViaGmail(data, contact, { invoice });
}

export async function shareInvoiceViaWhatsApp(
  invoice: SalesDeskInvoiceDto,
  contact?: InvoiceShareContact | null
): Promise<void> {
  const data = buildSalesDeskInvoicePreviewDataFromDto(invoice);
  await shareInvoicePreviewViaWhatsApp(data, contact);
}
