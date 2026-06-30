import { useQuery } from '@tanstack/react-query';
import { documentSerialTypeApi } from '../api/document-serial-type-api';
import { documentSerialTypeQueryKeys } from '../utils/query-keys';
import type { DocumentSerialTypeDto } from '../types/document-serial-type-types';

export const useDocumentSerialTypeDetail = (id: number): ReturnType<typeof useQuery<DocumentSerialTypeDto>> => {
  return useQuery({
    queryKey: documentSerialTypeQueryKeys.detail(id),
    queryFn: () => documentSerialTypeApi.getById(id),
    enabled: id > 0,
    staleTime: 30000,
  });
};
