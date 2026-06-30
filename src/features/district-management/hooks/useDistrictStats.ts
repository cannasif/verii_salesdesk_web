import { useQuery } from '@tanstack/react-query';
import { districtApi } from '../api/district-api';
import { queryKeys } from '../utils/query-keys';
import type { DistrictDto } from '../types/district-types';

export interface DistrictStats {
  totalDistricts: number;
  activeDistricts: number;
  newThisMonth: number;
}

export const useDistrictStats = (): ReturnType<typeof useQuery<DistrictStats>> => {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: async (): Promise<DistrictStats> => {
      const allDistrictsResponse = await districtApi.getList({
        pageNumber: 1,
        pageSize: 1000,
      });

      const allDistricts = allDistrictsResponse.data || [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalDistricts = allDistrictsResponse.totalCount || 0;
      const activeDistricts = allDistricts.filter((district: DistrictDto) => !district.isDeleted).length;
      const newThisMonth = allDistricts.filter(
        (district: DistrictDto) => district.createdDate && new Date(district.createdDate) >= startOfMonth
      ).length;

      return {
        totalDistricts,
        activeDistricts,
        newThisMonth,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};
