import { z } from 'zod';
import { PricingRuleType } from '@/features/pricing-rule/types/pricing-rule-types';

export interface DocumentSerialTypeDto {
  id: number;
  ruleType: PricingRuleType;
  customerTypeId?: number | null;
  customerTypeName?: string | null;
  salesRepId?: number | null;
  salesRepFullName?: string | null;
  serialPrefix?: string | null;
  serialLength?: number | null;
  serialStart?: number | null;
  serialCurrent?: number | null;
  serialIncrement?: number | null;
  createdDate: string;
  updatedDate?: string | null;
  createdBy?: string;
  createdByFullName?: string;
  createdByFullUser?: string;
}

export interface CreateDocumentSerialTypeDto {
  ruleType: PricingRuleType;
  customerTypeId?: number | null;
  salesRepId?: number | null;
  serialPrefix: string;
  serialLength: number;
  serialStart: number;
  serialCurrent: number;
  serialIncrement: number;
}

export interface UpdateDocumentSerialTypeDto {
  ruleType: PricingRuleType;
  customerTypeId?: number | null;
  salesRepId?: number | null;
  serialPrefix?: string | null;
  serialLength?: number | null;
  serialStart?: number | null;
  serialCurrent?: number | null;
  serialIncrement?: number | null;
}

export interface DocumentSerialTypeFormData {
  ruleType: PricingRuleType;
  customerTypeId?: number | null;
  salesRepId?: number | null;
  serialPrefix: string;
  serialLength: number;
  serialStart: number;
  serialCurrent: number;
  serialIncrement: number;
}

export const documentSerialTypeFormSchema = z.object({
  ruleType: z
    .number()
    .min(1, 'documentSerialTypeManagement.form.ruleType.required'),
  customerTypeId: z
    .number()
    .nullable()
    .optional(),
  salesRepId: z
    .number()
    .nullable()
    .optional(),
  serialPrefix: z
    .string()
    .min(1, 'documentSerialTypeManagement.form.serialPrefix.required')
    .max(50, 'documentSerialTypeManagement.form.serialPrefix.maxLength'),
  serialLength: z
    .number()
    .min(1, 'documentSerialTypeManagement.form.serialLength.min')
    .max(100, 'documentSerialTypeManagement.form.serialLength.max'),
  serialStart: z
    .number()
    .min(0, 'documentSerialTypeManagement.form.serialStart.min'),
  serialCurrent: z
    .number()
    .min(0, 'documentSerialTypeManagement.form.serialCurrent.min'),
  serialIncrement: z
    .number()
    .min(1, 'documentSerialTypeManagement.form.serialIncrement.min'),
});

export type DocumentSerialTypeFormSchema = z.infer<typeof documentSerialTypeFormSchema>;

export interface DocumentSerialTypeGetDto {
  id: number;
  ruleType: PricingRuleType;
  customerTypeId?: number | null;
  customerTypeName?: string | null;
  salesRepId?: number | null;
  salesRepFullName?: string | null;
  serialPrefix?: string | null;
  serialLength?: number | null;
  serialStart?: number | null;
  serialCurrent?: number | null;
  serialIncrement?: number | null;
  createdDate: string;
  updatedDate?: string | null;
  createdBy?: string;
  createdByFullName?: string;
  createdByFullUser?: string;
}
