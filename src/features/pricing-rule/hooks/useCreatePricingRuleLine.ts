import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { pricingRuleApi } from '../api/pricing-rule-api';
import { pricingRuleQueryKeys } from '../utils/query-keys';
import type { PricingRuleLineCreateDto, PricingRuleLineGetDto } from '../types/pricing-rule-types';

export const useCreatePricingRuleLine = (): UseMutationResult<PricingRuleLineGetDto, Error, PricingRuleLineCreateDto, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PricingRuleLineCreateDto) => pricingRuleApi.createLine(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.lines(variables.pricingRuleHeaderId) });
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.header(variables.pricingRuleHeaderId) });
    },
  });
};
