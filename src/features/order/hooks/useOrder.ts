import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';
import type { OrderGetDto } from '../types/order-types';

export const useOrder = (id: number): UseQueryResult<OrderGetDto, Error> => {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
