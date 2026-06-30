import { z } from 'zod';

export interface CountryDto {
  id: number;
  name: string;
  code: string;
  erpCode?: string;
  createdDate: string;
  updatedDate?: string;
  isDeleted: boolean;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
}

export interface CreateCountryDto {
  name: string;
  code: string;
  erpCode?: string;
}

export interface UpdateCountryDto {
  name: string;
  code: string;
  erpCode?: string;
}

export interface CountryListFilters {
  name?: string;
  code?: string;
}

export interface CountryFormData {
  name: string;
  code: string;
  erpCode?: string;
}

export const countryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'countryManagement.form.nameRequired')
    .max(100, 'countryManagement.form.nameMaxLength'),
  code: z
    .string()
    .min(2, 'countryManagement.form.codeMinLength')
    .max(5, 'countryManagement.form.codeMaxLength')
    .transform((val) => val.toUpperCase()),
  erpCode: z
    .string()
    .max(10, 'countryManagement.form.erpCodeMaxLength')
    .optional()
    .or(z.literal('')),
});

export type CountryFormSchema = z.infer<typeof countryFormSchema>;
