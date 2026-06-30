import { useQuery } from '@tanstack/react-query';
import { shippingAddressApi } from '../api/shipping-address-api';
import { queryKeys } from '../utils/query-keys';
import type { ShippingAddressDto } from '../types/shipping-address-types';

export const useShippingAddressesByCustomer = (customerId: number): ReturnType<typeof useQuery<ShippingAddressDto[]>> => {
  return useQuery({
    queryKey: queryKeys.byCustomerId(customerId),
    queryFn: () => shippingAddressApi.getByCustomerId(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
};
