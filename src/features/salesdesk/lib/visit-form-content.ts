import type { SalesDeskVisitFormDto } from '../api/salesdesk-api';

const CONTENT_VERSION = 1;

export interface VisitFormContentPayload {
  v: number;
  notes?: string;
  nextSteps?: string;
  contactedPerson?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  visitorName?: string;
}

export function serializeVisitFormContent(payload: Omit<VisitFormContentPayload, 'v'>): string | undefined {
  const notes = payload.notes?.trim();
  const nextSteps = payload.nextSteps?.trim();
  const contactedPerson = payload.contactedPerson?.trim();
  const recipientEmail = payload.recipientEmail?.trim();
  const recipientPhone = payload.recipientPhone?.trim();
  const visitorName = payload.visitorName?.trim();

  if (!notes && !nextSteps && !contactedPerson && !recipientEmail && !recipientPhone && !visitorName) {
    return undefined;
  }

  return JSON.stringify({
    v: CONTENT_VERSION,
    notes: notes || undefined,
    nextSteps: nextSteps || undefined,
    contactedPerson: contactedPerson || undefined,
    recipientEmail: recipientEmail || undefined,
    recipientPhone: recipientPhone || undefined,
    visitorName: visitorName || undefined,
  });
}

export function parseVisitFormContent(content?: string | null): VisitFormContentPayload {
  if (!content?.trim()) {
    return { v: CONTENT_VERSION };
  }

  try {
    const parsed = JSON.parse(content) as VisitFormContentPayload;
    if (parsed && typeof parsed === 'object' && parsed.v === CONTENT_VERSION) {
      return parsed;
    }
  } catch {
    // Legacy plain-text content
  }

  return { v: CONTENT_VERSION, notes: content };
}

export function getVisitFormPreview(form: SalesDeskVisitFormDto): string {
  const data = parseVisitFormContent(form.content);
  if (data.notes?.trim()) return data.notes.trim();
  if (data.nextSteps?.trim()) return data.nextSteps.trim();
  return '(Icerik girilmemis)';
}

export function getVisitFormVisitorName(form: SalesDeskVisitFormDto): string {
  const data = parseVisitFormContent(form.content);
  return data.visitorName?.trim() || 'Sistem Yoneticisi';
}

export function buildDefaultVisitFormTitle(formDate: string): string {
  const date = new Date(`${formDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'Ziyaret Formu';
  const formatted = new Intl.DateTimeFormat('tr-TR').format(date);
  return `Ziyaret Formu - ${formatted}`;
}

export function buildVisitFormMailBody(form: SalesDeskVisitFormDto): string {
  const data = parseVisitFormContent(form.content);
  const lines = [
    form.title,
    `Cari: ${form.customerName || '-'}`,
    `Tarih: ${form.formDate}`,
    '',
    data.notes ? `Yapilanlar / Notlar:\n${data.notes}` : '',
    data.nextSteps ? `Sonraki Adimlar:\n${data.nextSteps}` : '',
  ].filter(Boolean);
  return lines.join('\n');
}

export function buildVisitFormWhatsAppText(form: SalesDeskVisitFormDto): string {
  return buildVisitFormMailBody(form);
}
