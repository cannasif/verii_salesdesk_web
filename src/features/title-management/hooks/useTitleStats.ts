import { useQuery } from '@tanstack/react-query';
import { titleApi } from '../api/title-api';
import { queryKeys } from '../utils/query-keys';
import type { TitleDto } from '../types/title-types';

export interface TitleStats {
  totalTitles: number;
  activeTitles: number;
  newThisMonth: number;
  totalContacts: number;
}

export const useTitleStats = (): ReturnType<typeof useQuery<TitleStats>> => {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: async (): Promise<TitleStats> => {
      const allTitlesResponse = await titleApi.getList({
        pageNumber: 1,
        pageSize: 1000,
      });

      const allTitles = allTitlesResponse.data || [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalTitles = allTitlesResponse.totalCount || 0;
      const activeTitles = allTitles.length;
      const newThisMonth = allTitles.filter(
        (title: TitleDto) => new Date(title.createdDate) >= startOfMonth
      ).length;
      const totalContacts = 0;

      return {
        totalTitles,
        activeTitles,
        newThisMonth,
        totalContacts,
      };
    },
    staleTime: 60000,
  });
};
