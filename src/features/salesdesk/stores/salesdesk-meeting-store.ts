import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SalesDeskMeetingLike {
  id: string;
  subject: string;
  sender: string;
  receivedAt: string;
}

interface SalesDeskMeetingState {
  /** Daha once uyari verilmis toplanti id'leri (tekrar uyari vermemek icin). */
  seenIds: string[];
  /** Bildirim kutusunda okundu isaretlenen toplanti id'leri. */
  readIds: string[];
  /** Ilk yukleme yapildi mi? Ilk seferde mevcut toplantilar sessizce tohumlanir. */
  initialized: boolean;
  /** Bildirim kutusu / kartta gosterilecek son toplanti uyarilari. */
  alerts: SalesDeskMeetingLike[];
  /** Kullanicinin henuz gormedigi yeni toplanti sayaci (rozet icin). */
  unseenCount: number;
  /**
   * Guncel toplanti listesini kaydeder, DAHA ONCE gorulmemis olanlari dondurur.
   * Ilk cagride (initialized=false) sessizce tohumlar ve bos dizi dondurur.
   */
  registerMeetings: (meetings: SalesDeskMeetingLike[]) => SalesDeskMeetingLike[];
  markAllSeen: () => void;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
}

const MAX_ALERTS = 30;

export const useSalesDeskMeetingStore = create<SalesDeskMeetingState>()(
  persist(
    (set, get) => ({
      seenIds: [],
      readIds: [],
      initialized: false,
      alerts: [],
      unseenCount: 0,
      registerMeetings: (meetings) => {
        const { seenIds, initialized } = get();

        if (!initialized) {
          set({
            initialized: true,
            seenIds: meetings.map((meeting) => meeting.id),
          });
          return [];
        }

        const seen = new Set(seenIds);
        const fresh = meetings.filter((meeting) => !seen.has(meeting.id));
        if (fresh.length === 0) {
          return [];
        }

        set((state) => ({
          seenIds: [...state.seenIds, ...fresh.map((meeting) => meeting.id)],
          alerts: [...fresh, ...state.alerts].slice(0, MAX_ALERTS),
          unseenCount: state.unseenCount + fresh.length,
        }));

        return fresh;
      },
      markAllSeen: () => set({ unseenCount: 0 }),
      markAlertRead: (id) =>
        set((state) => ({
          readIds: state.readIds.includes(id) ? state.readIds : [...state.readIds, id],
          unseenCount: Math.max(0, state.unseenCount - 1),
        })),
      markAllAlertsRead: () =>
        set((state) => ({
          readIds: Array.from(new Set([...state.readIds, ...state.alerts.map((alert) => alert.id)])),
          unseenCount: 0,
        })),
    }),
    {
      name: 'salesdesk-meeting-alerts',
      version: 3,
      migrate: (_persisted, _version) =>
        ({
          seenIds: [],
          readIds: [],
          initialized: false,
          alerts: [],
          unseenCount: 0,
        }) as unknown as SalesDeskMeetingState,
      partialize: (state) => ({
        seenIds: state.seenIds,
        readIds: state.readIds,
        initialized: state.initialized,
        alerts: state.alerts,
      }),
    }
  )
);
