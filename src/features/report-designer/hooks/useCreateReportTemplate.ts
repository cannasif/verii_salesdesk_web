import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportTemplateApi } from '../api/report-template-api';
import { reportTemplateQueryKeys } from '../utils/query-keys';
import type { ReportTemplateCreateDto, ReportTemplateGetDto } from '../types/report-template-types';

export function useCreateReportTemplate(): ReturnType<
  typeof useMutation<ReportTemplateGetDto, Error, ReportTemplateCreateDto>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportTemplateCreateDto) => reportTemplateApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportTemplateQueryKeys.list() });
    },
  });
}
