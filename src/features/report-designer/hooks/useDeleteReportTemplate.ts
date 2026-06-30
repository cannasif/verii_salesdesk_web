import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportTemplateApi } from '../api/report-template-api';
import { reportTemplateQueryKeys } from '../utils/query-keys';

export function useDeleteReportTemplate(): ReturnType<
  typeof useMutation<void, Error, number>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reportTemplateApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportTemplateQueryKeys.list() });
    },
  });
}
