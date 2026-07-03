import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import {
  requestNotificationPermission,
  showLocalNotification,
} from '@/features/notification/utils/web-notifications';
import { useNotificationStore } from '@/features/notification/stores/notification-store';
import type { NotificationDto } from '@/features/notification/types/notification';
import { runErpNewsAutomation } from '../lib/erp-news-automation';
import { useSalesDeskGroupList } from './useSalesDeskGroups';
import { ERP_NEWS_META_QUERY_KEY } from './useErpNewsMeta';

const POLL_INTERVAL_MS = 5 * 60 * 1000;
const INITIAL_DELAY_MS = 30_000;

function hashId(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function buildErpNewsNotification(newsId: number, title: string): NotificationDto {
  const nowIso = new Date().toISOString();
  return {
    id: -Math.abs(hashId(`erp-news-${newsId}`)),
    titleKey: '',
    titleArgs: null,
    title: `Yeni sistem haberi: ${title}`,
    messageKey: '',
    messageArgs: null,
    message: 'Modul tetikleyicisi yeni bir haber olusturdu.',
    isRead: false,
    userId: 0,
    relatedEntityName: 'ErpNews',
    relatedEntityId: newsId,
    relatedEntityType: String(newsId),
    notificationType: 'Meeting',
    createdDate: nowIso,
    timestamp: nowIso,
    actionUrl: '/salesdesk/erp-news',
  };
}

export function useSalesDeskErpNewsWatcher(): void {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const addRealTimeNotification = useNotificationStore((state) => state.addRealTimeNotification);
  const { data: groups = [] } = useSalesDeskGroupList();
  const seenIdsRef = useRef<Set<number>>(new Set());
  const permissionRequested = useRef(false);
  const runningRef = useRef(false);
  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  useEffect(() => {
    if (token && !permissionRequested.current) {
      permissionRequested.current = true;
      void requestNotificationPermission();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;

    const runSilent = (): void => {
      if (runningRef.current) return;
      runningRef.current = true;

      void runErpNewsAutomation(groupsRef.current)
        .then((result) => {
          if (result.created > 0) {
            void queryClient.invalidateQueries({ queryKey: ['salesdesk', 'erp-news'] });
            void queryClient.invalidateQueries({ queryKey: ERP_NEWS_META_QUERY_KEY });
          }

          for (const item of result.createdItems) {
            if (seenIdsRef.current.has(item.id)) continue;
            seenIdsRef.current.add(item.id);
            if (window.location.pathname.includes('/salesdesk/erp-news')) continue;
            showLocalNotification({
              id: Math.abs(hashId(`erp-news-${item.id}`)),
              title: item.title,
              message: 'ERP haber akisiniza yeni sistem kaydi dusdu.',
            });
            addRealTimeNotification(buildErpNewsNotification(item.id, item.title));
          }
        })
        .finally(() => {
          runningRef.current = false;
        });
    };

    const initialTimer = window.setTimeout(runSilent, INITIAL_DELAY_MS);
    const intervalTimer = window.setInterval(runSilent, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalTimer);
    };
  }, [token, addRealTimeNotification, queryClient]);
}
