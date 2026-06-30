import { usePaymentTypeList } from '@/features/payment-type-management/hooks/usePaymentTypeList';
import type { PaymentType } from '../types/quotation-types';

interface UsePaymentTypesReturn {
  data: PaymentType[];
  isLoading: boolean;
}

export const usePaymentTypes = (): UsePaymentTypesReturn => {
  const { data, isLoading } = usePaymentTypeList({
    pageNumber: 1,
    pageSize: 1000,
    sortBy: 'Name',
    sortDirection: 'asc',
  });
  return {
    data:
      data?.data?.map((paymentType) => ({
        id: paymentType.id,
        name: paymentType.name,
      })) || [],
    isLoading,
  };
};
