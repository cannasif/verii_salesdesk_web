import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiResponse } from '@/types/api';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';
import type { OrderBulkCreateDto, OrderGetDto } from '../types/order-types';

export const useCreateOrderBulk = (): UseMutationResult<ApiResponse<OrderGetDto>, Error, OrderBulkCreateDto, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrderBulkCreateDto) => orderApi.createBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders() });
    },
  });
};
