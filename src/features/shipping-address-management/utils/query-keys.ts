export const SHIPPING_ADDRESS_QUERY_KEYS = {
  LIST: 'shippingAddressManagement.list',
  DETAIL: 'shippingAddressManagement.detail',
  BY_CUSTOMER_ID: 'shippingAddressManagement.byCustomerId',
} as const;

export const queryKeys = {
  list: (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
    filters?: Record<string, unknown>;
  }) => [SHIPPING_ADDRESS_QUERY_KEYS.LIST, params] as const,
  detail: (id: number) => [SHIPPING_ADDRESS_QUERY_KEYS.DETAIL, id] as const,
  byCustomerId: (customerId: number) => [SHIPPING_ADDRESS_QUERY_KEYS.BY_CUSTOMER_ID, customerId] as const,
};
