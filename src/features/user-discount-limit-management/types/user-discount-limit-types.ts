import { z } from 'zod';

export interface UserDiscountLimitDto {
  id: number;
  erpProductGroupCode: string;
  salespersonId: number;
  salespersonName: string;
  maxDiscount1: number;
  maxDiscount2?: number;
  maxDiscount3?: number;
  createdDate: string;
  updatedDate?: string;
  deletedDate?: string;
  isDeleted: boolean;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
}

export interface CreateUserDiscountLimitDto {
  erpProductGroupCode: string;
  salespersonId: number;
  maxDiscount1: number;
  maxDiscount2?: number;
  maxDiscount3?: number;
}

export interface UpdateUserDiscountLimitDto {
  erpProductGroupCode: string;
  salespersonId: number;
  maxDiscount1: number;
  maxDiscount2?: number;
  maxDiscount3?: number;
}

export interface UserDiscountLimitListFilters {
  salespersonId?: number;
  erpProductGroupCode?: string;
  minDiscount?: number;
  maxDiscount?: number;
}

export interface UserDiscountLimitFormData {
  erpProductGroupCode: string;
  salespersonId: number;
  maxDiscount1: number;
  maxDiscount2?: number;
  maxDiscount3?: number;
}

export const userDiscountLimitFormSchema = z.object({
  erpProductGroupCode: z
    .string()
    .min(1, 'userDiscountLimitManagement.erpProductGroupCodeRequired')
    .max(50, 'userDiscountLimitManagement.erpProductGroupCodeMaxLength'),
  salespersonId: z
    .number()
    .min(1, 'userDiscountLimitManagement.salespersonRequired'),
  maxDiscount1: z
    .number()
    .min(0, 'userDiscountLimitManagement.maxDiscount1Range')
    .max(100, 'userDiscountLimitManagement.maxDiscount1Range'),
  maxDiscount2: z
    .number()
    .min(0, 'userDiscountLimitManagement.maxDiscount2Range')
    .max(100, 'userDiscountLimitManagement.maxDiscount2Range')
    .optional()
    .nullable(),
  maxDiscount3: z
    .number()
    .min(0, 'userDiscountLimitManagement.maxDiscount3Range')
    .max(100, 'userDiscountLimitManagement.maxDiscount3Range')
    .optional()
    .nullable(),
});

export type UserDiscountLimitFormSchema = z.infer<typeof userDiscountLimitFormSchema>;
