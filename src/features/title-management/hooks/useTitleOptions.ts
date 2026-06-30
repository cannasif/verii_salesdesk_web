import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { titleApi } from '../api/title-api';
import type { TitleDto } from '../types/title-types';

export const useTitleOptions = (): UseQueryResult<TitleDto[], Error> => {
  return useQuery({
    queryKey: ['titleOptions'],
    queryFn: async (): Promise<TitleDto[]> => {
      const response = await titleApi.getList({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'TitleName',
        sortDirection: 'asc',
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
