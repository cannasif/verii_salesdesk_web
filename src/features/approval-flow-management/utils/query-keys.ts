export const APPROVAL_FLOW_QUERY_KEYS = {
  LIST: 'approvalFlow.list',
  DETAIL: 'approvalFlow.detail',
  STEPS: 'approvalFlow.steps',
} as const;

export const queryKeys = {
  list: (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
    filters?: unknown;
  }) => [APPROVAL_FLOW_QUERY_KEYS.LIST, params] as const,
  detail: (id: number) => [APPROVAL_FLOW_QUERY_KEYS.DETAIL, id] as const,
  steps: (approvalFlowId: number) => [APPROVAL_FLOW_QUERY_KEYS.STEPS, approvalFlowId] as const,
};
