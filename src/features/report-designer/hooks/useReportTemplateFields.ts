import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { reportTemplateApi } from '../api/report-template-api';
import { reportTemplateQueryKeys } from '../utils/query-keys';
import type { ReportTemplateFieldsDto } from '../types/report-template-types';

export function useReportTemplateFields(
  ruleType: number | null
): UseQueryResult<ReportTemplateFieldsDto, Error> {
  return useQuery({
    queryKey: reportTemplateQueryKeys.fields(ruleType ?? 0),
    queryFn: () => reportTemplateApi.getFields(ruleType!),
    enabled: ruleType != null,
    staleTime: 5 * 60 * 1000,
  });
}
