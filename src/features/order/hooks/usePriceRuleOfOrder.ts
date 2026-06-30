import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';
import type { PricingRuleLineGetDto } from '../types/order-types';

export const usePriceRuleOfOrder = (
  customerCode: string | null | undefined,
  salesmenId: number | null | undefined,
  orderDate: string | null | undefined
): UseQueryResult<PricingRuleLineGetDto[], Error> => {
  const enabled = !!customerCode && !!salesmenId && !!orderDate;

  return useQuery({
    queryKey: queryKeys.priceRuleOfOrder(
      customerCode || '',
      salesmenId || 0,
      orderDate || ''
    ),
    queryFn: () => orderApi.getPriceRuleOfOrder(
      customerCode!,
      salesmenId!,
      orderDate!
    ),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};
