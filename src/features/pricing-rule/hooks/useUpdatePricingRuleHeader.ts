import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { pricingRuleApi } from '../api/pricing-rule-api';
import { pricingRuleQueryKeys } from '../utils/query-keys';
import type { PricingRuleHeaderUpdateDto, PricingRuleHeaderGetDto } from '../types/pricing-rule-types';

export const useUpdatePricingRuleHeader = (): UseMutationResult<PricingRuleHeaderGetDto, Error, { id: number; data: PricingRuleHeaderUpdateDto }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PricingRuleHeaderUpdateDto }) => pricingRuleApi.updateHeader(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.headers() });
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.header(variables.id) });
    },
  });
};
