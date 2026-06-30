export const APPROVAL_QUERY_KEYS = {
  PENDING: 'approval.pending',
  QUOTATION_DETAIL: 'approval.quotationDetail',
  QUOTATION_STATUS: 'approval.quotationStatus',
  APPROVAL_HISTORY: 'approval.history',
} as const;

export const queryKeys = {
  pending: () => [APPROVAL_QUERY_KEYS.PENDING] as const,
  quotationDetail: (quotationId: number) => [APPROVAL_QUERY_KEYS.QUOTATION_DETAIL, quotationId] as const,
  quotationStatus: (quotationId: number) => [APPROVAL_QUERY_KEYS.QUOTATION_STATUS, quotationId] as const,
  approvalHistory: (quotationId: number) => [APPROVAL_QUERY_KEYS.APPROVAL_HISTORY, quotationId] as const,
};
