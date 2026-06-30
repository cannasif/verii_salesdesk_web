import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import type { CustomerDto } from '@/features/customer-management/types/customer-types';

export const useCustomersForPricingRule = (): { data: CustomerDto[]; isLoading: boolean } => {
  const { data, isLoading } = useCustomerOptions();
  return {
    data: data || [],
    isLoading,
  };
};
