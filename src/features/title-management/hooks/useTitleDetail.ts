import { useQuery } from '@tanstack/react-query';
import { titleApi } from '../api/title-api';
import { queryKeys } from '../utils/query-keys';
import type { TitleDto } from '../types/title-types';

export const useTitleDetail = (
  id: number | null
): ReturnType<typeof useQuery<TitleDto>> => {
  return useQuery({
    queryKey: queryKeys.detail(id ?? 0),
    queryFn: () => titleApi.getById(id!),
    enabled: id !== null && id > 0,
    staleTime: 60000,
  });
};
