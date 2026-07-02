import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PagedParams, PagedResponse } from '@/types/api';

interface SalesDeskCrudApi<TDto, TPayload> {
  list: (params?: PagedParams) => Promise<PagedResponse<TDto>>;
  create: (body: TPayload) => Promise<TDto>;
  update: (id: number, body: TPayload) => Promise<TDto>;
  delete: (id: number) => Promise<void>;
}

interface SalesDeskCrudMessages {
  createSuccess: string;
  updateSuccess: string;
  deleteSuccess: string;
  createError: string;
  updateError: string;
  deleteError: string;
}

export function createSalesDeskCrudHooks<TDto extends { id: number }, TPayload>(
  resourceKey: string,
  api: SalesDeskCrudApi<TDto, TPayload>,
  messages: SalesDeskCrudMessages
) {
  const allKey = ['salesdesk', resourceKey] as const;
  const listKey = (params: PagedParams) => [...allKey, 'list', params] as const;
  const statsKey = [...allKey, 'stats'] as const;

  const useList = (params: PagedParams): UseQueryResult<PagedResponse<TDto>> =>
    useQuery({
      queryKey: listKey(params),
      queryFn: () => api.list(params),
      staleTime: 15000,
      placeholderData: (previousData) => previousData,
    });

  const useStats = (): UseQueryResult<PagedResponse<TDto>> =>
    useQuery({
      queryKey: statsKey,
      queryFn: () => api.list({ pageNumber: 1, pageSize: 200 }),
      staleTime: 30000,
    });

  const useCreate = (): UseMutationResult<TDto, Error, TPayload> => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (body: TPayload) => api.create(body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: allKey });
        toast.success(messages.createSuccess);
      },
      onError: (error: Error) => toast.error(error.message || messages.createError),
    });
  };

  const useUpdate = (): UseMutationResult<TDto, Error, { id: number; body: TPayload }> => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, body }) => api.update(id, body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: allKey });
        toast.success(messages.updateSuccess);
      },
      onError: (error: Error) => toast.error(error.message || messages.updateError),
    });
  };

  const useDelete = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => api.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: allKey });
        toast.success(messages.deleteSuccess);
      },
      onError: (error: Error) => toast.error(error.message || messages.deleteError),
    });
  };

  return { useList, useStats, useCreate, useUpdate, useDelete, allKey };
}
