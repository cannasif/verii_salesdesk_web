import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportTemplateApi } from '../api/report-template-api';
import { reportTemplateQueryKeys } from '../utils/query-keys';
import type { ReportTemplateGetDto, ReportTemplateUpdateDto } from '../types/report-template-types';

export function useUpdateReportTemplate(): ReturnType<
  typeof useMutation<ReportTemplateGetDto, Error, { id: number; data: ReportTemplateUpdateDto }>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReportTemplateUpdateDto }) =>
      reportTemplateApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: reportTemplateQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: reportTemplateQueryKeys.item(updated.id) });
    },
  });
}
