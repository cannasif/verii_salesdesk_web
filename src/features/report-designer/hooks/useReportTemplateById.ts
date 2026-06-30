import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { reportTemplateApi } from '../api/report-template-api';
import { reportTemplateQueryKeys } from '../utils/query-keys';
import type { ReportTemplateGetDto } from '../types/report-template-types';

export function useReportTemplateById(
  id: number | null | undefined
): UseQueryResult<ReportTemplateGetDto, Error> {
  return useQuery({
    queryKey: reportTemplateQueryKeys.item(id ?? 0),
    queryFn: () => reportTemplateApi.getById(id!),
    enabled: typeof id === 'number' && id > 0,
    staleTime: 2 * 60 * 1000,
  });
}
