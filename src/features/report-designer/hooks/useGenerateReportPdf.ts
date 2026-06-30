import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { reportTemplateApi } from '../api/report-template-api';

export function useGenerateReportPdf(): UseMutationResult<
  Blob,
  Error,
  { templateId: number; entityId: number }
> {
  return useMutation({
    mutationFn: ({ templateId, entityId }) =>
      reportTemplateApi.generatePdf(templateId, entityId),
  });
}
