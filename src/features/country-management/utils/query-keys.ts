export const COUNTRY_MANAGEMENT_QUERY_KEYS = {
  LIST: 'countryManagement.list',
  DETAIL: 'countryManagement.detail',
  STATS: 'countryManagement.stats',
} as const;

export const queryKeys = {
  list: (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
    filters?: Record<string, unknown>;
  }) => [COUNTRY_MANAGEMENT_QUERY_KEYS.LIST, params] as const,
  detail: (id: number) => [COUNTRY_MANAGEMENT_QUERY_KEYS.DETAIL, id] as const,
  stats: () => [COUNTRY_MANAGEMENT_QUERY_KEYS.STATS] as const,
};
