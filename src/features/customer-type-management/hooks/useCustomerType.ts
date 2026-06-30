import { useQuery } from '@tanstack/react-query';
import { customerTypeApi } from '../api/customer-type-api';
import { queryKeys } from '../utils/query-keys';
import type { CustomerTypeDto } from '../types/customer-type-types';

export const useCustomerType = (id: number) => {
  return useQuery<CustomerTypeDto>({
    queryKey: queryKeys.detail(id),
    queryFn: () => customerTypeApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
