export const CITY_MANAGEMENT_QUERY_KEYS = {
  LIST: 'cityManagement.list',
  DETAIL: 'cityManagement.detail',
  STATS: 'cityManagement.stats',
} as const;

export const queryKeys = {
  list: (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
    filters?: Record<string, unknown>;
  }) => [CITY_MANAGEMENT_QUERY_KEYS.LIST, params] as const,
  detail: (id: number) => [CITY_MANAGEMENT_QUERY_KEYS.DETAIL, id] as const,
  stats: () => [CITY_MANAGEMENT_QUERY_KEYS.STATS] as const,
};
