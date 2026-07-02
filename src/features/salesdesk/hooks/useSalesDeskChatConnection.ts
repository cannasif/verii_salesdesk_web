import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useSalesDeskChatStore } from '../stores/salesdesk-chat-store';
import { connectChat, disconnectChat } from '../lib/salesdesk-chat-socket';

/**
 * Uygulama genelinde sohbet baglantisini yonetir.
 * Oturum acikken socket'e baglanir ve kullanici kimligini bildirir.
 */
export function useSalesDeskChatConnection(): void {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setCurrentUserId = useSalesDeskChatStore((state) => state.setCurrentUserId);
  const reset = useSalesDeskChatStore((state) => state.reset);

  const userId = user?.id ?? null;
  const userName = user?.name || user?.email || 'Kullanici';

  useEffect(() => {
    if (token && userId != null) {
      setCurrentUserId(userId);
      connectChat({ id: userId, name: userName });
    } else {
      disconnectChat();
      setCurrentUserId(null);
      reset();
    }
  }, [token, userId, userName, setCurrentUserId, reset]);
}
