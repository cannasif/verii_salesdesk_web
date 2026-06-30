import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import type { Customer } from '../types/demand-types';

interface UseCustomersReturn {
  data: Customer[];
  isLoading: boolean;
}

export const useCustomers = (): UseCustomersReturn => {
  const { data, isLoading } = useCustomerOptions();
  return {
    data: data?.map((customer) => ({
      id: customer.id,
      name: customer.name,
      customerCode: customer.customerCode,
      erpCode: customer.customerCode,
    })) || [],
    isLoading,
  };
};
