import { z } from 'zod';
import type { SalesDeskCustomerDto, SalesDeskCustomerKind } from '../api/salesdesk-api';

export const SALES_DESK_CUSTOMER_KIND_LABELS: Record<SalesDeskCustomerKind, string> = {
  1: 'Musteri',
  2: 'Tedarikci',
  3: 'Her Ikisi',
};

export const salesDeskCustomerFormSchema = z.object({
  code: z.string().max(32).optional(),
  name: z.string().trim().min(1, 'Cari adi zorunludur').max(220),
  contactName: z.string().max(160).optional(),
  phone: z.string().max(40).optional(),
  email: z
    .string()
    .max(160)
    .optional()
    .refine((value) => !value || value.trim() === '' || z.string().email().safeParse(value).success, {
      message: 'Gecerli bir e-posta girin',
    }),
  kind: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  balance: z.number(),
  city: z.string().max(80).optional(),
  district: z.string().max(80).optional(),
});

export type SalesDeskCustomerFormValues = z.infer<typeof salesDeskCustomerFormSchema>;

export function toCustomerFormValues(customer?: SalesDeskCustomerDto | null): SalesDeskCustomerFormValues {
  return {
    code: customer?.code ?? '',
    name: customer?.name ?? '',
    contactName: customer?.contactName ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    kind: customer?.kind ?? 1,
    balance: customer?.balance ?? 0,
    city: customer?.city ?? '',
    district: customer?.district ?? '',
  };
}

export function toCustomerUpsertPayload(values: SalesDeskCustomerFormValues): Partial<SalesDeskCustomerDto> {
  return {
    code: values.code?.trim() || undefined,
    name: values.name.trim(),
    contactName: values.contactName?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    email: values.email?.trim() || undefined,
    kind: values.kind,
    balance: values.balance,
    city: values.city?.trim() || undefined,
    district: values.district?.trim() || undefined,
  };
}

export function formatCustomerBalance(balance: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(balance);
}
