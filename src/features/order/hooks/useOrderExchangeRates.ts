import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';
import type { OrderExchangeRateGetDto } from '../types/order-types';

export const useOrderExchangeRates = (orderId: number): UseQueryResult<OrderExchangeRateGetDto[], Error> => {
  return useQuery({
    queryKey: queryKeys.orderExchangeRates(orderId),
    queryFn: () => orderApi.getOrderExchangeRatesByOrderId(orderId),
    enabled: !!orderId && orderId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
