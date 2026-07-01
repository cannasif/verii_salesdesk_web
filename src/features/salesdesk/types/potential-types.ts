import { z } from 'zod';
import type { SalesDeskPotentialCustomerDto, SalesDeskPotentialStatus } from '../api/salesdesk-api';

export const SALES_DESK_POTENTIAL_STATUS_LABELS: Record<SalesDeskPotentialStatus, string> = {
  1: 'Bekliyor',
  2: 'Bulundu',
  3: 'Supheli',
  4: 'Guclu',
  5: 'Donusturuldu',
  6: 'Bulunamadi',
};

export const salesDeskPotentialFormSchema = z.object({
  code: z.string().max(32).optional(),
  companyName: z.string().trim().min(1, 'Firma adi zorunludur').max(220),
  contactName: z.string().max(160).optional(),
  phone: z.string().max(40).optional(),
  email: z
    .string()
    .max(160)
    .optional()
    .refine((value) => !value || value.trim() === '' || z.string().email().safeParse(value).success, {
      message: 'Gecerli bir e-posta girin',
    }),
  city: z.string().max(80).optional(),
  district: z.string().max(80).optional(),
  status: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  matchScore: z.number().min(0).max(100),
});

export type SalesDeskPotentialFormValues = z.infer<typeof salesDeskPotentialFormSchema>;

export function toPotentialFormValues(
  potential?: SalesDeskPotentialCustomerDto | null
): SalesDeskPotentialFormValues {
  return {
    code: potential?.code ?? '',
    companyName: potential?.companyName ?? '',
    contactName: potential?.contactName ?? '',
    phone: potential?.phone ?? '',
    email: potential?.email ?? '',
    city: potential?.city ?? '',
    district: potential?.district ?? '',
    status: potential?.status ?? 1,
    matchScore: potential?.matchScore ?? 0,
  };
}

export function toPotentialUpsertPayload(
  values: SalesDeskPotentialFormValues
): Partial<SalesDeskPotentialCustomerDto> {
  return {
    code: values.code?.trim() || undefined,
    companyName: values.companyName.trim(),
    contactName: values.contactName?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    email: values.email?.trim() || undefined,
    city: values.city?.trim() || undefined,
    district: values.district?.trim() || undefined,
    status: values.status,
    matchScore: values.matchScore,
  };
}
