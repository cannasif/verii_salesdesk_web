import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { pricingRuleApi } from '../api/pricing-rule-api';
import { pricingRuleQueryKeys } from '../utils/query-keys';
import type { PricingRuleHeaderCreateDto, PricingRuleHeaderGetDto } from '../types/pricing-rule-types';

export const useCreatePricingRuleHeader = (): UseMutationResult<PricingRuleHeaderGetDto, Error, PricingRuleHeaderCreateDto, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PricingRuleHeaderCreateDto) => pricingRuleApi.createHeader(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.headers() });
    },
  });
};
