export const powerbiRlsQueryKeys = {
  all: ['powerbi', 'rls'] as const,
  list: (params?: { pageNumber?: number; pageSize?: number; sortBy?: string; sortDirection?: string }) =>
    ['powerbi', 'rls', params] as const,
  detail: (id: number) => ['powerbi', 'rls', id] as const,
};

export const userAuthorityQueryKeys = {
  all: ['user-authority'] as const,
  list: (params?: { pageNumber?: number; pageSize?: number }) => ['user-authority', params] as const,
};
