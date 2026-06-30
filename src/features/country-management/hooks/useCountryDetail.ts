import { useQuery } from '@tanstack/react-query';
import { countryApi } from '../api/country-api';
import { queryKeys } from '../utils/query-keys';
import type { CountryDto } from '../types/country-types';

export const useCountryDetail = (
  id: number | null
): ReturnType<typeof useQuery<CountryDto>> => {
  return useQuery({
    queryKey: queryKeys.detail(id ?? 0),
    queryFn: () => countryApi.getById(id!),
    enabled: id !== null && id > 0,
    staleTime: 5 * 60 * 1000,
  });
};
