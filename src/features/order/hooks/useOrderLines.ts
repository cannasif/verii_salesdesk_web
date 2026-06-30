import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';
import type { OrderLineGetDto } from '../types/order-types';

export const useOrderLines = (orderId: number): UseQueryResult<OrderLineGetDto[], Error> => {
  return useQuery({
    queryKey: queryKeys.orderLines(orderId),
    queryFn: () => orderApi.getOrderLinesByOrderId(orderId),
    enabled: !!orderId && orderId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
