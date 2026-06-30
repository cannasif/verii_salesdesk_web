import { useQuery } from '@tanstack/react-query';
import { powerbiViewerApi } from '../api/powerbiViewer.api';

const REPORTS_LIST_KEY = ['powerbi', 'viewer', 'reports-list'] as const;
const EMBED_CONFIG_KEY = ['powerbi', 'viewer', 'embed-config'] as const;
const STALE_LIST_MS = 30 * 1000;
const STALE_EMBED_MS = 55 * 1000;

export function usePowerbiReportsList() {
  return useQuery({
    queryKey: REPORTS_LIST_KEY,
    queryFn: () => powerbiViewerApi.getList(),
    staleTime: STALE_LIST_MS,
  });
}

export function usePowerbiEmbedConfig(id: number | null) {
  return useQuery({
    queryKey: [...EMBED_CONFIG_KEY, id],
    queryFn: () => powerbiViewerApi.getEmbedConfig(id!),
    enabled: id != null && id > 0,
    staleTime: STALE_EMBED_MS,
  });
}

export function getEmbedConfigQueryKey(id: number): readonly [string, string, string, number] {
  return [...EMBED_CONFIG_KEY, id];
}
