import { toast } from 'sonner';
import { googleIntegrationApi } from '@/features/google-integration/api/google-integration.api';
import { outlookIntegrationApi } from '@/features/outlook-integration/api/outlook-integration.api';
import { blobToBase64 } from '@/features/quotation/utils/quotation-share-utils';
import type { SalesDeskVisitFormDto } from '../api/salesdesk-api';
import { buildVisitFormMailBody } from './visit-form-content';
import {
  buildVisitFormPdfBlob,
  buildVisitFormPdfFileName,
  downloadBlob,
  downloadVisitFormPdf,
} from './visit-form-pdf';
import {
  isValidEmail,
  resolveVisitFormEmail,
  resolveVisitFormPhone,
  type VisitFormCustomerContact,
} from './visit-form-recipient';

type ConnectedMailProvider = 'outlook' | 'google';

function buildGmailComposeUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

async function getConnectedMailProvider(): Promise<ConnectedMailProvider | null> {
  const [outlookResult, googleResult] = await Promise.allSettled([
    outlookIntegrationApi.getStatus(),
    googleIntegrationApi.getStatus(),
  ]);

  const outlookConnected =
    outlookResult.status === 'fulfilled' && outlookResult.value.isConnected === true;
  const googleConnected =
    googleResult.status === 'fulfilled' && googleResult.value.isConnected === true;

  if (outlookConnected) return 'outlook';
  if (googleConnected) return 'google';
  return null;
}

async function sendViaIntegration(params: {
  provider: ConnectedMailProvider;
  form: SalesDeskVisitFormDto;
  toEmail: string;
  subject: string;
  body: string;
  pdfBlob: Blob;
  fileName: string;
}): Promise<void> {
  const attachment = {
    fileName: params.fileName,
    contentType: 'application/pdf',
    base64Content: await blobToBase64(params.pdfBlob),
  };

  const payload = {
    customerId: params.form.customerId!,
    to: params.toEmail,
    subject: params.subject,
    body: params.body,
    isHtml: false,
    moduleKey: 'activity' as const,
    recordId: params.form.id,
    contextTitle: params.form.title,
    createActivityLog: true,
    attachments: [attachment],
  };

  if (params.provider === 'outlook') {
    await outlookIntegrationApi.sendCustomerMail(payload);
    return;
  }

  await googleIntegrationApi.sendCustomerMail(payload);
}

export async function previewVisitFormPdf(form: SalesDeskVisitFormDto): Promise<{ blob: Blob; fileName: string; url: string }> {
  const blob = await buildVisitFormPdfBlob(form);
  const fileName = buildVisitFormPdfFileName(form);
  const url = URL.createObjectURL(blob);
  return { blob, fileName, url };
}

export async function openVisitFormPdfDownload(form: SalesDeskVisitFormDto): Promise<void> {
  await downloadVisitFormPdf(form);
  toast.success('PDF indirildi.');
}

export async function shareVisitFormViaGmail(
  form: SalesDeskVisitFormDto,
  customer?: VisitFormCustomerContact | null
): Promise<void> {
  const email = resolveVisitFormEmail(form, customer);
  if (!email || !isValidEmail(email)) {
    toast.error('Alici e-posta bulunamadi. Formu duzenleyin veya cari kartina e-posta ekleyin.');
    return;
  }

  const subject = form.title;
  const body = `${buildVisitFormMailBody(form)}\n\nSaygilarimizla.`;
  const fileName = buildVisitFormPdfFileName(form);
  const pdfBlob = await buildVisitFormPdfBlob(form);

  if (form.customerId) {
    const provider = await getConnectedMailProvider();
    if (provider) {
      try {
        await sendViaIntegration({
          provider,
          form,
          toEmail: email,
          subject,
          body,
          pdfBlob,
          fileName,
        });
        toast.success('Ziyaret formu e-posta ile gonderildi (PDF eklendi).');
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Entegrasyon maili gonderilemedi.';
        toast.message(`${message} Gmail taslagina yonlendiriliyorsunuz.`);
      }
    }
  }

  downloadBlob(pdfBlob, fileName);
  const composeUrl = buildGmailComposeUrl(email, subject, body);
  const opened = window.open(composeUrl, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.href = composeUrl;
  }
  toast.success('PDF indirildi. Gmail acildi; PDF dosyasini ek olarak ekleyin.');
}

export async function shareVisitFormViaWhatsApp(
  form: SalesDeskVisitFormDto,
  customer?: VisitFormCustomerContact | null
): Promise<void> {
  const phone = resolveVisitFormPhone(form, customer);
  if (!phone) {
    toast.error('Alici telefon bulunamadi. Formu duzenleyin veya cari kartina telefon ekleyin.');
    return;
  }

  const text = encodeURIComponent(buildVisitFormMailBody(form));
  const url = `https://wa.me/${phone}?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
