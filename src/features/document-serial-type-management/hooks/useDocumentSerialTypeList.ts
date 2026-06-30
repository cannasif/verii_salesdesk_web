import { useQuery } from '@tanstack/react-query';
import { documentSerialTypeApi } from '../api/document-serial-type-api';
import { documentSerialTypeQueryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import type { DocumentSerialTypeDto } from '../types/document-serial-type-types';
import type { PagedResponse } from '@/types/api';
import { normalizeQueryParams } from '@/utils/query-params';

export const useDocumentSerialTypeList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): ReturnType<typeof useQuery<PagedResponse<DocumentSerialTypeDto>>> => {
  return useQuery({
    queryKey: documentSerialTypeQueryKeys.list(normalizeQueryParams(params)),
    queryFn: () => documentSerialTypeApi.getList(params),
    staleTime: 30000,
  });
};
