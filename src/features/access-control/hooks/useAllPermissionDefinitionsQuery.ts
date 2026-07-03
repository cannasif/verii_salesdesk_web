import { useQuery } from '@tanstack/react-query';
import { permissionDefinitionApi } from '../api/permissionDefinitionApi';

const STALE_TIME_MS = 60_000;

export const useAllPermissionDefinitionsQuery = () =>
  useQuery({
    queryKey: ['permissions', 'definitions', 'all'],
    queryFn: () => permissionDefinitionApi.getAll(),
    staleTime: STALE_TIME_MS,
  });
