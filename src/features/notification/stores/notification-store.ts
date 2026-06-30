import { create } from 'zustand';
import type { NotificationDto } from '../types/notification';

type ConnectionState = 'connected' | 'disconnected' | 'reconnecting';

interface NotificationState {
  connectionState: ConnectionState;
  realTimeNotifications: NotificationDto[];
  setConnectionState: (state: ConnectionState) => void;
  addRealTimeNotification: (notification: NotificationDto) => void;
  clearRealTimeNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  connectionState: 'disconnected',
  realTimeNotifications: [],

  setConnectionState: (state: ConnectionState): void => {
    set({ connectionState: state });
  },

  addRealTimeNotification: (notification: NotificationDto): void => {
    const currentNotifications = get().realTimeNotifications;
    const exists = currentNotifications.some((n) => n.id === notification.id);
    
    if (!exists) {
      const updatedNotifications = [notification, ...currentNotifications].sort((a, b) => {
        const dateA = new Date(a.createdDate || a.timestamp || 0).getTime();
        const dateB = new Date(b.createdDate || b.timestamp || 0).getTime();
        return dateB - dateA;
      });
      set({ realTimeNotifications: updatedNotifications });
    }
  },

  clearRealTimeNotifications: (): void => {
    set({ realTimeNotifications: [] });
  },
}));

