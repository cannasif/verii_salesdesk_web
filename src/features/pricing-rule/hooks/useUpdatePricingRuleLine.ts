import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { pricingRuleApi } from '../api/pricing-rule-api';
import { pricingRuleQueryKeys } from '../utils/query-keys';
import type { PricingRuleLineUpdateDto, PricingRuleLineGetDto } from '../types/pricing-rule-types';

export const useUpdatePricingRuleLine = (): UseMutationResult<PricingRuleLineGetDto, Error, { id: number; data: PricingRuleLineUpdateDto }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PricingRuleLineUpdateDto }) => pricingRuleApi.updateLine(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.lines(variables.data.pricingRuleHeaderId) });
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.header(variables.data.pricingRuleHeaderId) });
    },
  });
};
