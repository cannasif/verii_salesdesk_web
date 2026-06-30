import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { pricingRuleApi } from '../api/pricing-rule-api';
import { pricingRuleQueryKeys } from '../utils/query-keys';

export const useDeletePricingRuleHeader = (): UseMutationResult<void, Error, number, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pricingRuleApi.deleteHeader(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.headers() });
    },
  });
};
