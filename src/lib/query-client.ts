import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return true;
    if (!error.response) return true;
  }
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: shouldRetryQuery,
      retryDelay: 1000,
    },
  },
});

