export const DISTRICT_MANAGEMENT_QUERY_KEYS = {
  LIST: 'districtManagement.list',
  DETAIL: 'districtManagement.detail',
  STATS: 'districtManagement.stats',
} as const;

export const queryKeys = {
  list: (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
    filters?: unknown;
  }) => [DISTRICT_MANAGEMENT_QUERY_KEYS.LIST, params] as const,
  detail: (id: number) => [DISTRICT_MANAGEMENT_QUERY_KEYS.DETAIL, id] as const,
  stats: () => [DISTRICT_MANAGEMENT_QUERY_KEYS.STATS] as const,
};
