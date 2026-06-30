import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { reportTemplateApi } from '../api/report-template-api';
import { reportTemplateQueryKeys } from '../utils/query-keys';
import type { ReportTemplateGetDto } from '../types/report-template-types';

export function useReportTemplateList(): UseQueryResult<ReportTemplateGetDto[], Error> {
  return useQuery({
    queryKey: reportTemplateQueryKeys.list(),
    queryFn: () => reportTemplateApi.getList(),
    staleTime: 2 * 60 * 1000,
  });
}
