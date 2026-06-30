import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';

export const useCanEditOrder = (orderId: number): UseQueryResult<boolean, Error> => {
  return useQuery({
    queryKey: queryKeys.canEdit(orderId),
    queryFn: () => orderApi.canEdit(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });
};
