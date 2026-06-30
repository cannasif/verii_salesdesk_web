import { z } from 'zod';

export interface TitleDto {
  id: number;
  titleName: string;
  code?: string;
  createdDate: string;
  updatedDate?: string;
  createdBy?: string;
  createdByFullName?: string;
  createdByFullUser?: string;
}

export interface CreateTitleDto {
  titleName: string;
  code?: string;
}

export interface UpdateTitleDto {
  titleName: string;
  code?: string;
}

export interface TitleListFilters {
  titleName?: string;
  code?: string;
}

export interface TitleFormData {
  titleName: string;
  code?: string;
}

export const titleFormSchema = z.object({
  titleName: z
    .string()
    .min(1, 'titleManagement.form.titleName.required')
    .max(100, 'titleManagement.form.titleName.maxLength'),
  code: z
    .string()
    .max(10, 'titleManagement.form.code.maxLength')
    .optional()
    .nullable(),
});

export type TitleFormSchema = z.infer<typeof titleFormSchema>;
