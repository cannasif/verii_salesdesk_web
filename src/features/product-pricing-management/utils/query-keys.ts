export const PRODUCT_PRICING_QUERY_KEYS = {
  LIST: 'productPricingManagement.list',
  DETAIL: 'productPricingManagement.detail',
} as const;

export const queryKeys = {
  list: (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
    filters?: Record<string, unknown> | unknown[];
  }) => [PRODUCT_PRICING_QUERY_KEYS.LIST, params] as const,
  detail: (id: number) => [PRODUCT_PRICING_QUERY_KEYS.DETAIL, id] as const,
};
