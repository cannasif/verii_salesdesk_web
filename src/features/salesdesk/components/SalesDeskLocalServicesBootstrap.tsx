import { type ReactElement, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { pingLocalServerHealth } from '../lib/local-server-health';

/**
 * Oturum acildiginda yerel yardimci sunucuyu (8787) kontrol eder.
 * Basarisizsa bir kez uyarir — gruplar/sohbet/Gmail/ERP meta etkilenir.
 */
export function SalesDeskLocalServicesBootstrap(): ReactElement | null {
  const token = useAuthStore((state) => state.token);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      warnedRef.current = false;
      return;
    }

    if (warnedRef.current) return;

    void pingLocalServerHealth().then((health) => {
      if (health.ok || warnedRef.current) return;
      warnedRef.current = true;
      toast.warning(health.message ?? 'Yerel yardimci sunucuya ulasilamadi.', {
        duration: 8000,
      });
    });
  }, [token]);

  return null;
}
