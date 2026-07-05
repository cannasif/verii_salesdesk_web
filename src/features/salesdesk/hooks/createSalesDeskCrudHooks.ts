import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DATA_TABLE_QUERY_OPTIONS } from '@/lib/list-query-options';
import type { PagedParams, PagedResponse } from '@/types/api';
import { tryWithSalesDeskListTimeout } from '../lib/salesdesk-fast-timeout';
import { formatSalesDeskApiError } from '../lib/salesdesk-shared';
import {
  emptySalesDeskPagedResponse,
  readSalesDeskListCache,
  writeSalesDeskListCache,
} from '../lib/salesdesk-list-cache';

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

async function loadListWithCache<TDto extends { id: number }, TPayload>(
  resourceKey: string,
  api: SalesDeskCrudApi<TDto, TPayload>,
  params: PagedParams,
): Promise<PagedResponse<TDto>> {
  const cached = readSalesDeskListCache<TDto>(resourceKey, params);

  try {
    const remote = await tryWithSalesDeskListTimeout(api.list(params));
    if (remote) {
      writeSalesDeskListCache(resourceKey, params, remote);
      return remote;
    }
  } catch {
    // Asagida onbellek / bos liste
  }

  if (cached) {
    return cached;
  }

  return emptySalesDeskPagedResponse<TDto>(params);
}

export function createSalesDeskCrudHooks<TDto extends { id: number }, TPayload>(
  resourceKey: string,
  api: SalesDeskCrudApi<TDto, TPayload>,
  messages: SalesDeskCrudMessages,
) {
  const allKey = ['salesdesk', resourceKey] as const;
  const listKey = (params: PagedParams) => [...allKey, 'list', params] as const;
  const statsKey = [...allKey, 'stats'] as const;

  const useList = (params: PagedParams): UseQueryResult<PagedResponse<TDto>> =>
    useQuery({
      queryKey: listKey(params),
      queryFn: () => loadListWithCache(resourceKey, api, params),
      staleTime: 60_000,
      ...DATA_TABLE_QUERY_OPTIONS,
      placeholderData: (previousData) => previousData ?? readSalesDeskListCache<TDto>(resourceKey, params) ?? undefined,
    });

  const useStats = (): UseQueryResult<PagedResponse<TDto>> =>
    useQuery({
      queryKey: statsKey,
      queryFn: () => loadListWithCache(resourceKey, api, { pageNumber: 1, pageSize: 50 }),
      staleTime: 60_000,
      ...DATA_TABLE_QUERY_OPTIONS,
    });

  const useCreate = (): UseMutationResult<TDto, Error, TPayload> => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (body: TPayload) => api.create(body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: allKey });
        toast.success(messages.createSuccess);
      },
      onError: (error: Error) => toast.error(formatSalesDeskApiError(error, messages.createError)),
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
      onError: (error: Error) => toast.error(formatSalesDeskApiError(error, messages.updateError)),
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
      onError: (error: Error) => toast.error(formatSalesDeskApiError(error, messages.deleteError)),
    });
  };

  return { useList, useStats, useCreate, useUpdate, useDelete, allKey };
}
