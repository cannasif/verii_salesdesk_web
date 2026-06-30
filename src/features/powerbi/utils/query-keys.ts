export const powerbiQueryKeys = {
  reportDefinitions: {
    all: ['powerbi', 'report-definitions'] as const,
    list: (params?: { pageNumber?: number; pageSize?: number; sortBy?: string; sortDirection?: string; filters?: Record<string, unknown> }) =>
      ['powerbi', 'report-definitions', params] as const,
    detail: (id: number) => ['powerbi', 'report-definitions', id] as const,
  },
  groups: {
    all: ['powerbi', 'groups'] as const,
    list: (params?: { pageNumber?: number; pageSize?: number; filters?: Record<string, unknown> }) =>
      ['powerbi', 'groups', params] as const,
    detail: (id: number) => ['powerbi', 'groups', id] as const,
  },
  groupReportDefinitions: {
    all: ['powerbi', 'group-report-definitions'] as const,
    list: (params?: { pageNumber?: number; pageSize?: number; filters?: Record<string, unknown> }) =>
      ['powerbi', 'group-report-definitions', params] as const,
    detail: (id: number) => ['powerbi', 'group-report-definitions', id] as const,
  },
  userGroups: {
    all: ['powerbi', 'user-groups'] as const,
    list: (params?: { pageNumber?: number; pageSize?: number; filters?: Record<string, unknown> }) =>
      ['powerbi', 'user-groups', params] as const,
    detail: (id: number) => ['powerbi', 'user-groups', id] as const,
  },
};
