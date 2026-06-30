import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiResponse } from '@/types/api';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { DemandBulkCreateDto, DemandGetDto } from '../types/demand-types';

export const useCreateDemandBulk = (): UseMutationResult<ApiResponse<DemandGetDto>, Error, DemandBulkCreateDto, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DemandBulkCreateDto) => demandApi.createBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.demands() });
    },
  });
};
