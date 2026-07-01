import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PagedParams, PagedResponse } from '@/types/api';
import { salesDeskApi, type SalesDeskCustomerDto } from '../api/salesdesk-api';
import { salesDeskCustomerQueryKeys } from './query-keys';
import type { SalesDeskCustomerFormValues } from '../types/customer-types';
import { toCustomerUpsertPayload } from '../types/customer-types';

export function useSalesDeskCustomerList(
  params: PagedParams
): UseQueryResult<PagedResponse<SalesDeskCustomerDto>> {
  return useQuery({
    queryKey: salesDeskCustomerQueryKeys.list(params),
    queryFn: () => salesDeskApi.customers.list(params),
    staleTime: 15000,
  });
}

export function useSalesDeskCustomerStats(): UseQueryResult<PagedResponse<SalesDeskCustomerDto>> {
  return useQuery({
    queryKey: salesDeskCustomerQueryKeys.stats(),
    queryFn: () => salesDeskApi.customers.list({ pageNumber: 1, pageSize: 200 }),
    staleTime: 30000,
  });
}

export function useCreateSalesDeskCustomer(): UseMutationResult<
  SalesDeskCustomerDto,
  Error,
  SalesDeskCustomerFormValues
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SalesDeskCustomerFormValues) =>
      salesDeskApi.customers.create(toCustomerUpsertPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesDeskCustomerQueryKeys.all() });
      toast.success('Cari basariyla olusturuldu');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Cari olusturulamadi');
    },
  });
}

export function useUpdateSalesDeskCustomer(): UseMutationResult<
  SalesDeskCustomerDto,
  Error,
  { id: number; values: SalesDeskCustomerFormValues }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) =>
      salesDeskApi.customers.update(id, toCustomerUpsertPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesDeskCustomerQueryKeys.all() });
      toast.success('Cari basariyla guncellendi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Cari guncellenemedi');
    },
  });
}

export function useDeleteSalesDeskCustomer(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => salesDeskApi.customers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesDeskCustomerQueryKeys.all() });
      toast.success('Cari basariyla silindi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Cari silinemedi');
    },
  });
}
