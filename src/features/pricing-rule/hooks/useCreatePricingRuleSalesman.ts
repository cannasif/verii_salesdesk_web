import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { pricingRuleApi } from '../api/pricing-rule-api';
import { pricingRuleQueryKeys } from '../utils/query-keys';
import type { PricingRuleSalesmanCreateDto, PricingRuleSalesmanGetDto } from '../types/pricing-rule-types';

export const useCreatePricingRuleSalesman = (): UseMutationResult<PricingRuleSalesmanGetDto, Error, PricingRuleSalesmanCreateDto, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PricingRuleSalesmanCreateDto) => pricingRuleApi.createSalesman(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.salesmen(variables.pricingRuleHeaderId) });
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.header(variables.pricingRuleHeaderId) });
    },
  });
};
