export const pricingRuleQueryKeys = {
  all: ['pricing-rule'] as const,
  headers: () => [...pricingRuleQueryKeys.all, 'headers'] as const,
  header: (id: number) => [...pricingRuleQueryKeys.headers(), id] as const,
  headerList: (params?: unknown) => [...pricingRuleQueryKeys.headers(), 'list', params] as const,
  lines: (headerId: number) => [...pricingRuleQueryKeys.header(headerId), 'lines'] as const,
  salesmen: (headerId: number) => [...pricingRuleQueryKeys.header(headerId), 'salesmen'] as const,
};
