import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  fromUserId: number;
  toUserId: number;
  text: string;
  createdAt: string;
  pending?: boolean;
}

export type ChatConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface SalesDeskChatState {
  currentUserId: number | null;
  isOpen: boolean;
  selectedUserId: number | null;
  onlineUserIds: number[];
  messagesByUser: Record<number, ChatMessage[]>;
  unreadByUser: Record<number, number>;
  typingByUser: Record<number, boolean>;
  connectionStatus: ChatConnectionStatus;

  setCurrentUserId: (id: number | null) => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setSelectedUserId: (id: number | null) => void;
  setPresence: (ids: number[]) => void;
  setHistory: (partnerId: number, messages: ChatMessage[]) => void;
  addPendingMessage: (message: ChatMessage) => void;
  reconcileAck: (tempId: string | undefined, message: ChatMessage) => void;
  ingestMessage: (message: ChatMessage) => void;
  setTyping: (fromUserId: number, typing: boolean) => void;
  setConnectionStatus: (status: ChatConnectionStatus) => void;
  reset: () => void;
}

function partnerOf(message: ChatMessage, me: number | null): number {
  return message.fromUserId === me ? message.toUserId : message.fromUserId;
}

export const useSalesDeskChatStore = create<SalesDeskChatState>((set) => ({
  currentUserId: null,
  isOpen: false,
  selectedUserId: null,
  onlineUserIds: [],
  messagesByUser: {},
  unreadByUser: {},
  typingByUser: {},
  connectionStatus: 'disconnected',

  setCurrentUserId: (id) => set({ currentUserId: id }),

  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  setSelectedUserId: (id) =>
    set((state) => ({
      selectedUserId: id,
      unreadByUser:
        id == null ? state.unreadByUser : { ...state.unreadByUser, [id]: 0 },
    })),

  setPresence: (ids) => set({ onlineUserIds: ids.map(Number) }),

  setHistory: (partnerId, messages) =>
    set((state) => {
      const pending = (state.messagesByUser[partnerId] ?? []).filter(
        (m) => m.pending && !messages.some((sm) => sm.id === m.id)
      );
      return {
        messagesByUser: { ...state.messagesByUser, [partnerId]: [...messages, ...pending] },
      };
    }),

  addPendingMessage: (message) =>
    set((state) => {
      const partner = partnerOf(message, state.currentUserId);
      const existing = state.messagesByUser[partner] ?? [];
      return {
        messagesByUser: { ...state.messagesByUser, [partner]: [...existing, message] },
      };
    }),

  reconcileAck: (tempId, message) =>
    set((state) => {
      const me = state.currentUserId;
      const partner = partnerOf(message, me);
      const existing = state.messagesByUser[partner] ?? [];
      let replaced = false;
      const next = existing.map((m) => {
        if (tempId && m.id === tempId) {
          replaced = true;
          return { ...message, pending: false };
        }
        return m;
      });
      if (!replaced && !next.some((m) => m.id === message.id)) {
        next.push({ ...message, pending: false });
      }
      return { messagesByUser: { ...state.messagesByUser, [partner]: next } };
    }),

  ingestMessage: (message) =>
    set((state) => {
      const me = state.currentUserId;
      const partner = partnerOf(message, me);
      const existing = state.messagesByUser[partner] ?? [];
      if (existing.some((m) => m.id === message.id)) {
        return state;
      }
      const isIncoming = message.fromUserId !== me;
      const isActiveConversation = state.isOpen && state.selectedUserId === partner;
      const unread =
        isIncoming && !isActiveConversation
          ? { ...state.unreadByUser, [partner]: (state.unreadByUser[partner] ?? 0) + 1 }
          : state.unreadByUser;
      return {
        messagesByUser: { ...state.messagesByUser, [partner]: [...existing, message] },
        unreadByUser: unread,
      };
    }),

  setTyping: (fromUserId, typing) =>
    set((state) => ({ typingByUser: { ...state.typingByUser, [fromUserId]: typing } })),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  reset: () =>
    set({
      selectedUserId: null,
      onlineUserIds: [],
      messagesByUser: {},
      unreadByUser: {},
      typingByUser: {},
      connectionStatus: 'disconnected',
    }),
}));
