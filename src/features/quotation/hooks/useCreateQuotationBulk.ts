import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiResponse } from '@/types/api';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';
import type { QuotationBulkCreateDto, QuotationGetDto } from '../types/quotation-types';

export const useCreateQuotationBulk = (): UseMutationResult<ApiResponse<QuotationGetDto>, Error, QuotationBulkCreateDto, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuotationBulkCreateDto) => quotationApi.createBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotations() });
    },
  });
};
