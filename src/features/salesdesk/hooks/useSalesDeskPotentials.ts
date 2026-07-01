import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PagedParams, PagedResponse } from '@/types/api';
import { salesDeskApi, type SalesDeskPotentialCustomerDto } from '../api/salesdesk-api';
import { salesDeskPotentialQueryKeys } from './query-keys';
import type { SalesDeskPotentialFormValues } from '../types/potential-types';
import { toPotentialUpsertPayload } from '../types/potential-types';

export function useSalesDeskPotentialList(
  params: PagedParams
): UseQueryResult<PagedResponse<SalesDeskPotentialCustomerDto>> {
  return useQuery({
    queryKey: salesDeskPotentialQueryKeys.list(params),
    queryFn: () => salesDeskApi.potentials.list(params),
    staleTime: 15000,
  });
}

export function useSalesDeskPotentialStats(): UseQueryResult<PagedResponse<SalesDeskPotentialCustomerDto>> {
  return useQuery({
    queryKey: salesDeskPotentialQueryKeys.stats(),
    queryFn: () => salesDeskApi.potentials.list({ pageNumber: 1, pageSize: 200 }),
    staleTime: 30000,
  });
}

export function useCreateSalesDeskPotential(): UseMutationResult<
  SalesDeskPotentialCustomerDto,
  Error,
  SalesDeskPotentialFormValues
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SalesDeskPotentialFormValues) =>
      salesDeskApi.potentials.create(toPotentialUpsertPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesDeskPotentialQueryKeys.all() });
      toast.success('Potansiyel cari basariyla olusturuldu');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Potansiyel cari olusturulamadi');
    },
  });
}

export function useUpdateSalesDeskPotential(): UseMutationResult<
  SalesDeskPotentialCustomerDto,
  Error,
  { id: number; values: SalesDeskPotentialFormValues }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) =>
      salesDeskApi.potentials.update(id, toPotentialUpsertPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesDeskPotentialQueryKeys.all() });
      toast.success('Potansiyel cari basariyla guncellendi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Potansiyel cari guncellenemedi');
    },
  });
}

export function useDeleteSalesDeskPotential(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => salesDeskApi.potentials.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesDeskPotentialQueryKeys.all() });
      toast.success('Potansiyel cari basariyla silindi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Potansiyel cari silinemedi');
    },
  });
}
