import { useQuery } from '@tanstack/react-query';
import { customerTypeApi } from '../api/customer-type-api';
import { queryKeys } from '../utils/query-keys';
import type { CustomerTypeDto } from '../types/customer-type-types';

export interface CustomerTypeStats {
  totalCustomerTypes: number;
  activeCustomerTypes: number;
  newThisMonth: number;
}

export const useCustomerTypeStats = () => {
  return useQuery<CustomerTypeStats>({
    queryKey: queryKeys.stats(),
    queryFn: async (): Promise<CustomerTypeStats> => {
      const allCustomerTypesResponse = await customerTypeApi.getList({
        pageNumber: 1,
        pageSize: 1000,
      });

      const allCustomerTypes = allCustomerTypesResponse.data || [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalCustomerTypes = allCustomerTypesResponse.totalCount || 0;
      const activeCustomerTypes = allCustomerTypes.filter((customerType: CustomerTypeDto) => !customerType.isDeleted).length;
      const newThisMonth = allCustomerTypes.filter(
        (customerType: CustomerTypeDto) => customerType.createdDate && new Date(customerType.createdDate) >= startOfMonth
      ).length;

      return {
        totalCustomerTypes,
        activeCustomerTypes,
        newThisMonth,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};
