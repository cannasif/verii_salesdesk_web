const STALE_TIME_MS = 2 * 60 * 1000;

export const reportBuilderQueryKeys = {
  list: (search?: string) => ['report-builder', 'reports', search ?? ''] as const,
};

export const REPORTS_LIST_STALE_TIME_MS = STALE_TIME_MS;
