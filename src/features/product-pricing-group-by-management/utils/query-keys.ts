export const PRODUCT_PRICING_GROUP_BY_QUERY_KEYS = {
  LIST: 'productPricingGroupByManagement.list',
  DETAIL: 'productPricingGroupByManagement.detail',
} as const;

export const queryKeys = {
  list: (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
    filters?: Record<string, unknown>;
  }) => [PRODUCT_PRICING_GROUP_BY_QUERY_KEYS.LIST, params] as const,
  detail: (id: number) => [PRODUCT_PRICING_GROUP_BY_QUERY_KEYS.DETAIL, id] as const,
};
