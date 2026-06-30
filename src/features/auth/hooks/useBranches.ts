import { useQuery } from '@tanstack/react-query';
import { erpCommonApi } from '@/services/erp-common-api';
import type { Branch } from '../types/auth';
import { AUTH_QUERY_KEYS } from '../utils/query-keys';

const FALLBACK_BRANCHES: Branch[] = [
  { id: 'MAIN', name: 'Merkez', code: 'MAIN' },
];

export const useBranches = () => {
  return useQuery<Branch[]>({
    queryKey: [AUTH_QUERY_KEYS.BRANCHES],
    queryFn: async (): Promise<Branch[]> => {
      try {
        const data = await erpCommonApi.getBranches();
        const branches = data.map((branch) => ({
          id: String(branch.subeKodu),
          name: branch.unvan && branch.unvan.trim().length > 0 ? branch.unvan : '-',
          code: String(branch.subeKodu),
        }));

        return branches.length > 0 ? branches : FALLBACK_BRANCHES;
      } catch {
        return FALLBACK_BRANCHES;
      }
    },
    staleTime: Infinity,
  });
};
