import { useQuery } from '@tanstack/react-query';
import { userDiscountLimitApi } from '../api/user-discount-limit-api';
import { queryKeys } from '../utils/query-keys';

export const useCheckUserDiscountLimitExists = (id: number): ReturnType<typeof useQuery<boolean>> => {
  return useQuery({
    queryKey: queryKeys.exists(id),
    queryFn: () => userDiscountLimitApi.exists(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCheckUserDiscountLimitExistsBySalespersonAndGroup = (
  salespersonId: number,
  erpProductGroupCode: string,
  enabled: boolean = true
): ReturnType<typeof useQuery<boolean>> => {
  return useQuery({
    queryKey: queryKeys.existsBySalespersonAndGroup(salespersonId, erpProductGroupCode),
    queryFn: () => userDiscountLimitApi.existsBySalespersonAndGroup(salespersonId, erpProductGroupCode),
    enabled: enabled && !!salespersonId && !!erpProductGroupCode,
    staleTime: 5 * 60 * 1000,
  });
};
