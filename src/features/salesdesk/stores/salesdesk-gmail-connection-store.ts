import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SalesDeskGmailConnectionState {
  connected: boolean;
  email: string | null;
  /** Gmail uygulama sifresi (yerel olarak saklanir). */
  appPassword: string | null;
  /** Cekilecek mesaj sayisi. */
  count: number;
  connectedAt: string | null;
  setConnection: (payload: { email: string; appPassword: string; count: number }) => void;
  disconnect: () => void;
}

/**
 * Gmail IMAP baglanti bilgileri. Mail adresi + uygulama sifresi + okunacak adet
 * yerel olarak (localStorage) saklanir ve her istekte yerel koprue gonderilir.
 */
export const useSalesDeskGmailConnectionStore = create<SalesDeskGmailConnectionState>()(
  persist(
    (set) => ({
      connected: false,
      email: null,
      appPassword: null,
      count: 30,
      connectedAt: null,
      setConnection: ({ email, appPassword, count }) =>
        set({
          connected: true,
          email: email.trim(),
          appPassword,
          count,
          connectedAt: new Date().toISOString(),
        }),
      disconnect: () =>
        set({ connected: false, email: null, appPassword: null, connectedAt: null }),
    }),
    {
      name: 'salesdesk-gmail-connection',
      version: 3,
      migrate: (_persisted, _version) =>
        ({
          connected: false,
          email: null,
          appPassword: null,
          count: 30,
          connectedAt: null,
        }) as unknown as SalesDeskGmailConnectionState,
    }
  )
);
