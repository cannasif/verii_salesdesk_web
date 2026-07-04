import { createSalesDeskCrudHooks } from './createSalesDeskCrudHooks';
import { salesDeskCompaniesApi } from '../api/salesdesk-companies-api';
import type { SalesDeskCompanyFormValues } from '../types/company-management-types';
import { toCompanyUpsertPayload } from '../types/company-management-types';

const companyHooks = createSalesDeskCrudHooks(
  'companies',
  salesDeskCompaniesApi,
  {
    createSuccess: 'Sirket basariyla olusturuldu.',
    updateSuccess: 'Sirket basariyla guncellendi.',
    deleteSuccess: 'Sirket basariyla silindi.',
    createError: 'Sirket olusturulamadi.',
    updateError: 'Sirket guncellenemedi.',
    deleteError: 'Sirket silinemedi.',
  }
);

export const useSalesDeskCompanyList = companyHooks.useList;
export const useSalesDeskCompanyStats = companyHooks.useStats;
export const useCreateSalesDeskCompany = () => {
  const mutation = companyHooks.useCreate();
  return {
    ...mutation,
    mutateAsync: (values: SalesDeskCompanyFormValues) =>
      mutation.mutateAsync(toCompanyUpsertPayload(values)),
  };
};
export const useUpdateSalesDeskCompany = () => {
  const mutation = companyHooks.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: SalesDeskCompanyFormValues }) =>
      mutation.mutateAsync({ id, body: toCompanyUpsertPayload(values) }),
  };
};
export const useDeleteSalesDeskCompany = companyHooks.useDelete;
