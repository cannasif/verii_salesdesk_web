import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchGmailMessages, type GmailMessage } from '../api/gmail-bridge-api';
import { useSalesDeskGmailConnectionStore } from '../stores/salesdesk-gmail-connection-store';

/**
 * Bagli Gmail hesabinin gelen kutusunu yerel IMAP koprusu uzerinden ceker.
 * Periyodik yenileme ile toplantilar near-real-time yakalanir.
 */
export function useGmailInbox(): UseQueryResult<GmailMessage[]> {
  const connected = useSalesDeskGmailConnectionStore((state) => state.connected);
  const email = useSalesDeskGmailConnectionStore((state) => state.email);
  const appPassword = useSalesDeskGmailConnectionStore((state) => state.appPassword);
  const count = useSalesDeskGmailConnectionStore((state) => state.count);

  return useQuery({
    queryKey: ['salesdesk', 'gmail-bridge', 'inbox', email, count],
    queryFn: () => fetchGmailMessages({ email: email!, appPassword: appPassword! }, count),
    enabled: connected && Boolean(email) && Boolean(appPassword),
    refetchInterval: 45000,
    refetchIntervalInBackground: true,
    staleTime: 30000,
    retry: false,
  });
}
