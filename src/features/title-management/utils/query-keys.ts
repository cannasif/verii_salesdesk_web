export const TITLE_MANAGEMENT_QUERY_KEYS = {
  LIST: 'titleManagement.list',
  DETAIL: 'titleManagement.detail',
  STATS: 'titleManagement.stats',
} as const;

export const queryKeys = {
  list: (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
    filters?: Record<string, unknown>;
  }) => [TITLE_MANAGEMENT_QUERY_KEYS.LIST, params] as const,
  detail: (id: number) => [TITLE_MANAGEMENT_QUERY_KEYS.DETAIL, id] as const,
  stats: () => [TITLE_MANAGEMENT_QUERY_KEYS.STATS] as const,
};
