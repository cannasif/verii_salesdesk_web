import { useQuery } from '@tanstack/react-query';
import { shippingAddressApi } from '../api/shipping-address-api';
import { queryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import type { ShippingAddressDto } from '../types/shipping-address-types';
import type { PagedResponse } from '@/types/api';
import { normalizeQueryParams } from '@/utils/query-params';

export const useShippingAddresses = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): ReturnType<typeof useQuery<PagedResponse<ShippingAddressDto>>> => {
  return useQuery({
    queryKey: queryKeys.list(normalizeQueryParams(params)),
    queryFn: () => shippingAddressApi.getList(params),
    staleTime: 5 * 60 * 1000,
  });
};
