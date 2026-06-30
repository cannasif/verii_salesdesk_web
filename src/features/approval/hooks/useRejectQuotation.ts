import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalApi } from '../api/approval-api';
import { queryKeys } from '../utils/query-keys';

export const useRejectQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ queueId, note }: { queueId: number; note?: string }) =>
      approvalApi.reject(queueId, { note: note || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pending() });
      queryClient.invalidateQueries({ queryKey: ['quotation'] });
    },
  });
};
