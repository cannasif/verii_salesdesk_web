import type { SalesDeskVisitFormDto } from '../api/salesdesk-api';
import { parseVisitFormContent } from './visit-form-content';

export interface VisitFormCustomerContact {
  email?: string | null;
  phone?: string | null;
}

export function resolveVisitFormEmail(
  form: SalesDeskVisitFormDto,
  customer?: VisitFormCustomerContact | null
): string {
  const fromContent = parseVisitFormContent(form.content).recipientEmail?.trim();
  if (fromContent) return fromContent;
  return customer?.email?.trim() || '';
}

export function resolveVisitFormPhone(
  form: SalesDeskVisitFormDto,
  customer?: VisitFormCustomerContact | null
): string {
  const fromContent = parseVisitFormContent(form.content).recipientPhone?.trim();
  if (fromContent) return fromContent.replace(/\D/g, '');
  return customer?.phone?.replace(/\D/g, '') || '';
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
