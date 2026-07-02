import { io, type Socket } from 'socket.io-client';
import { useSalesDeskChatStore, type ChatMessage } from '../stores/salesdesk-chat-store';

let socket: Socket | null = null;

export function getChatServerUrl(): string {
  const raw =
    (import.meta.env.VITE_CHAT_SERVER_URL as string | undefined) ||
    (import.meta.env.VITE_GMAIL_BRIDGE_URL as string | undefined);
  return (raw?.trim() || 'http://localhost:8787').replace(/\/$/, '');
}

export function isChatConnected(): boolean {
  return Boolean(socket?.connected);
}

export function connectChat(user: { id: number; name: string }): void {
  if (socket) {
    if (socket.connected) socket.emit('identify', user);
    return;
  }

  const instance = io(getChatServerUrl(), {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 2000,
  });
  socket = instance;

  const store = useSalesDeskChatStore;

  instance.on('connect', () => {
    instance.emit('identify', user);
    const selected = store.getState().selectedUserId;
    if (selected != null) requestHistory(selected);
  });

  instance.on('presence', (ids: number[]) => {
    store.getState().setPresence(ids ?? []);
  });

  instance.on('dm', (message: ChatMessage) => {
    store.getState().ingestMessage(message);
  });

  instance.on('dm:ack', ({ tempId, message }: { tempId?: string; message: ChatMessage }) => {
    store.getState().reconcileAck(tempId, message);
  });

  instance.on('typing', ({ fromUserId, typing }: { fromUserId: number; typing: boolean }) => {
    store.getState().setTyping(fromUserId, typing);
  });
}

export function disconnectChat(): void {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

export function sendDm(toUserId: number, text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const me = useSalesDeskChatStore.getState().currentUserId;
  if (me == null) return;

  const tempId = `t${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  useSalesDeskChatStore.getState().addPendingMessage({
    id: tempId,
    fromUserId: me,
    toUserId,
    text: trimmed,
    createdAt: new Date().toISOString(),
    pending: true,
  });
  socket?.emit('dm', { toUserId, text: trimmed, tempId });
}

export function requestHistory(withUserId: number): void {
  socket?.emit('history', { withUserId }, (messages: ChatMessage[]) => {
    useSalesDeskChatStore.getState().setHistory(withUserId, messages ?? []);
  });
}

export function sendTyping(toUserId: number, typing: boolean): void {
  socket?.emit('typing', { toUserId, typing });
}
