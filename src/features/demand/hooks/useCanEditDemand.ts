import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';

export const useCanEditDemand = (demandId: number): UseQueryResult<boolean, Error> => {
  return useQuery({
    queryKey: queryKeys.canEdit(demandId),
    queryFn: () => demandApi.canEdit(demandId),
    enabled: !!demandId,
    staleTime: 5 * 60 * 1000,
  });
};
