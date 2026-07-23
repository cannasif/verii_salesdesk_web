import { type ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Notification01Icon } from 'hugeicons-react';
import { NotificationDropdown } from './NotificationDropdown';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useAppShellStore } from '@/stores/app-shell-store';
import { useSalesDeskMeetingStore } from '@/features/salesdesk/stores/salesdesk-meeting-store';

export function NotificationIcon(): ReactElement {
  const { t } = useTranslation(['notification', 'common']);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [shouldFetchUnread, setShouldFetchUnread] = useState(false);
  const unreadCount = useAppShellStore((state) =>
    userId ? state.unreadCounts[String(userId)]?.data ?? 0 : 0
  );
  const refreshUnreadCount = useAppShellStore((state) => state.refreshUnreadCount);
  const meetingUnseen = useSalesDeskMeetingStore((state) => state.unseenCount);
  const totalUnread = unreadCount + meetingUnseen;
  const hasUnread = totalUnread > 0;

  useEffect(() => {
    const timer = window.setTimeout(() => setShouldFetchUnread(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shouldFetchUnread || !userId) return;
    void refreshUnreadCount(userId);
  }, [refreshUnreadCount, shouldFetchUnread, userId]);

  return (
    <NotificationDropdown>
      <button
        className={cn(
          'group relative rounded-xl p-2 outline-none transition-all duration-300',
          'hover:bg-[var(--crm-brand-soft)] active:scale-95'
        )}
        aria-label={`${t('notifications')}${hasUnread ? ` (${totalUnread} ${t('new')})` : ''}`}
      >
        <Notification01Icon
          size={20}
          className={cn(
            'transition-colors duration-300',
            'text-slate-500 group-hover:text-[var(--crm-brand-accent)] dark:text-slate-400 dark:group-hover:text-[var(--crm-brand-primary)]'
          )}
        />

        {hasUnread ? (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--crm-brand-primary)] opacity-75" />
            <span
              className={cn(
                'relative inline-flex h-2 w-2 rounded-full border border-white bg-[var(--crm-brand-primary)] dark:border-[var(--crm-app-background)]'
              )}
            />
          </span>
        ) : null}
      </button>
    </NotificationDropdown>
  );
}
