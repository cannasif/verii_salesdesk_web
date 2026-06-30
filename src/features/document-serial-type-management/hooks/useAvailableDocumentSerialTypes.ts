import { useQuery } from '@tanstack/react-query';
import { documentSerialTypeApi } from '../api/document-serial-type-api';
import { documentSerialTypeQueryKeys } from '../utils/query-keys';
import type { DocumentSerialTypeGetDto } from '../types/document-serial-type-types';
import type { PricingRuleType } from '@/features/pricing-rule/types/pricing-rule-types';

export const useAvailableDocumentSerialTypes = (
  customerTypeId: number | null | undefined,
  salesRepId: number | null | undefined,
  ruleType: PricingRuleType
): ReturnType<typeof useQuery<DocumentSerialTypeGetDto[]>> => {
  return useQuery({
    queryKey: documentSerialTypeQueryKeys.available(
      customerTypeId ?? 0,
      salesRepId ?? 0,
      ruleType
    ),
    queryFn: () => documentSerialTypeApi.getAvailable(customerTypeId ?? 0, salesRepId!, ruleType),
    enabled: !!salesRepId && salesRepId > 0,
    staleTime: 30000,
  });
};
