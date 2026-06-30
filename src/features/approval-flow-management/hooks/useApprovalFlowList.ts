import { useQuery } from '@tanstack/react-query';
import { approvalFlowApi } from '../api/approval-flow-api';
import { queryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter, PagedResponse } from '@/types/api';
import type { ApprovalFlowDto } from '../types/approval-flow-types';
import { normalizeQueryParams } from '@/utils/query-params';

export const useApprovalFlowList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): ReturnType<typeof useQuery<PagedResponse<ApprovalFlowDto>>> => {
  return useQuery({
    queryKey: queryKeys.list(normalizeQueryParams(params)),
    queryFn: () => approvalFlowApi.getList(params),
    staleTime: 5 * 60 * 1000,
  });
};
