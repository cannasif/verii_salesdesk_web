export const CONTACT_MANAGEMENT_QUERY_KEYS = {
  LIST: 'contactManagement.list',
  DETAIL: 'contactManagement.detail',
  STATS: 'contactManagement.stats',
} as const;

export const queryKeys = {
  list: (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
    filters?: Record<string, unknown>;
  }) => [CONTACT_MANAGEMENT_QUERY_KEYS.LIST, params] as const,
  detail: (id: number) => [CONTACT_MANAGEMENT_QUERY_KEYS.DETAIL, id] as const,
  stats: () => [CONTACT_MANAGEMENT_QUERY_KEYS.STATS] as const,
};
