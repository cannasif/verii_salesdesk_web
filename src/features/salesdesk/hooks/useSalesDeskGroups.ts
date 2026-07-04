import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DATA_TABLE_QUERY_OPTIONS } from '@/lib/list-query-options';
import { salesDeskGroupsApi } from '../api/salesdesk-groups-api';
import type { SalesDeskGroupDto, SalesDeskGroupFormSchema } from '../types/salesdesk-group-types';

export const SALESDESK_GROUPS_QUERY_KEY = ['salesdesk', 'groups'] as const;

export function useSalesDeskGroupList(): UseQueryResult<SalesDeskGroupDto[]> {
  return useQuery({
    queryKey: SALESDESK_GROUPS_QUERY_KEY,
    queryFn: () => salesDeskGroupsApi.list(),
    staleTime: 30_000,
    ...DATA_TABLE_QUERY_OPTIONS,
  });
}

export function useCreateSalesDeskGroup(): UseMutationResult<SalesDeskGroupDto, Error, SalesDeskGroupFormSchema> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto) => salesDeskGroupsApi.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SALESDESK_GROUPS_QUERY_KEY });
      toast.success('Grup olusturuldu.');
    },
    onError: (error) => toast.error(error.message || 'Grup olusturulamadi.'),
  });
}

export function useUpdateSalesDeskGroup(): UseMutationResult<
  SalesDeskGroupDto,
  Error,
  { id: number; dto: Pick<SalesDeskGroupFormSchema, 'name' | 'description'> }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }) => salesDeskGroupsApi.update(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SALESDESK_GROUPS_QUERY_KEY });
      toast.success('Grup guncellendi.');
    },
    onError: (error) => toast.error(error.message || 'Grup guncellenemedi.'),
  });
}

export function useSetSalesDeskGroupMembers(): UseMutationResult<
  SalesDeskGroupDto,
  Error,
  { id: number; memberUserIds: number[] }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, memberUserIds }) => salesDeskGroupsApi.setMembers(id, memberUserIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SALESDESK_GROUPS_QUERY_KEY });
      toast.success('Grup uyeleri guncellendi.');
    },
    onError: (error) => toast.error(error.message || 'Grup uyeleri guncellenemedi.'),
  });
}

export function useDeleteSalesDeskGroup(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => salesDeskGroupsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SALESDESK_GROUPS_QUERY_KEY });
      toast.success('Grup silindi.');
    },
    onError: (error) => toast.error(error.message || 'Grup silinemedi.'),
  });
}
