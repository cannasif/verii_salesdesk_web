import { z } from 'zod';

export interface CityDto {
  id: number;
  name: string;
  erpCode?: string;
  countryId: number;
  countryName?: string;
  createdDate: string;
  updatedDate?: string;
  isDeleted: boolean;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
}

export interface CreateCityDto {
  name: string;
  erpCode?: string;
  countryId: number;
}

export interface UpdateCityDto {
  name: string;
  erpCode?: string;
  countryId: number;
}

export interface CityListFilters {
  name?: string;
  erpCode?: string;
  countryId?: number;
}

export interface CityFormData {
  name: string;
  erpCode?: string;
  countryId: number;
}

export const cityFormSchema = z.object({
  name: z
    .string()
    .min(1, 'cityManagement.form.nameRequired')
    .max(100, 'cityManagement.form.nameMaxLength'),
  erpCode: z
    .string()
    .max(10, 'cityManagement.form.erpCodeMaxLength')
    .optional()
    .or(z.literal('')),
  countryId: z
    .number()
    .min(1, 'cityManagement.form.countryRequired'),
});

export type CityFormSchema = z.infer<typeof cityFormSchema>;
