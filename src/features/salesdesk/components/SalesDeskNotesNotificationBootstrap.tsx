import { type ReactElement, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { useAppShellStore } from '@/stores/app-shell-store';
import { useNotificationStore } from '@/features/notification/stores/notification-store';
import type { NotificationDto } from '@/features/notification/types/notification';
import {
  requestNotificationPermission,
  showLocalNotification,
} from '@/features/notification/utils/web-notifications';
import { salesDeskNotesApi } from '../api/salesdesk-notes-api';
import { SALESDESK_NOTES_QUERY_KEY } from '../hooks/useSalesDeskNotes';
import { sendBackendNoteNotification } from '../lib/send-note-backend-notification';

const POLL_INTERVAL_MS = 20_000;
const INITIAL_DELAY_MS = 5_000;

function buildNoteNotification(
  payload: Awaited<ReturnType<typeof salesDeskNotesApi.pullPendingNotifications>>[number],
  recipientUserId: number
): NotificationDto {
  const nowIso = payload.createdAt || new Date().toISOString();
  return {
    id: -Math.abs(payload.id),
    titleKey: '',
    titleArgs: null,
    title: payload.createdByName
      ? `${payload.createdByName} size not paylasti: ${payload.title}`
      : `Yeni not: ${payload.title}`,
    messageKey: '',
    messageArgs: null,
    message: payload.message,
    isRead: false,
    userId: recipientUserId,
    recipientUserId,
    relatedEntityName: 'SalesDeskNote',
    relatedEntityId: payload.noteId,
    relatedEntityType: 'SalesDeskNote',
    notificationType: 'Meeting',
    createdDate: nowIso,
    timestamp: nowIso,
    channel: 'Web',
    severity: 'info',
    actionUrl: '/salesdesk/notes',
  };
}

async function tryBackendNotifications(
  payload: Awaited<ReturnType<typeof salesDeskNotesApi.pullPendingNotifications>>[number]
): Promise<void> {
  await sendBackendNoteNotification({
    title: payload.createdByName
      ? `${payload.createdByName} size not paylasti`
      : 'Yeni not paylasildi',
    message: `${payload.title}: ${payload.message}`,
    channel: 'Web',
    severity: 'info',
    recipientUserId: payload.recipientUserId,
    relatedEntityType: 'SalesDeskNote',
    relatedEntityId: payload.noteId,
    actionUrl: '/salesdesk/notes',
  });
}

export function SalesDeskNotesNotificationBootstrap(): ReactElement | null {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const addRealTimeNotification = useNotificationStore((state) => state.addRealTimeNotification);
  const permissionRequested = useRef(false);
  const seenIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (token && !permissionRequested.current) {
      permissionRequested.current = true;
      void requestNotificationPermission();
    }
  }, [token]);

  useEffect(() => {
    if (!token || !userId) return undefined;

    const syncNotifications = async (): Promise<void> => {
      try {
        const pending = await salesDeskNotesApi.pullPendingNotifications(userId);
        if (pending.length > 0) {
          void queryClient.invalidateQueries({ queryKey: SALESDESK_NOTES_QUERY_KEY });
        }
        for (const item of pending) {
          if (seenIdsRef.current.has(item.id)) continue;
          seenIdsRef.current.add(item.id);

          const notification = buildNoteNotification(item, userId);
          addRealTimeNotification(notification);

          const unreadEntry = useAppShellStore.getState().unreadCounts[String(userId)];
          useAppShellStore.getState().setUnreadCount(userId, (unreadEntry?.data ?? 0) + 1);

          showLocalNotification({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            relatedEntityName: notification.relatedEntityName,
            relatedEntityId: notification.relatedEntityId,
          });

          void tryBackendNotifications(item);
          void salesDeskNotesApi.ackNotification(item.id).catch(() => undefined);
        }
      } catch {
        // Not sunucusu kapaliysa sessizce gec.
      }
    };

    const initialTimer = window.setTimeout(() => {
      void syncNotifications();
    }, INITIAL_DELAY_MS);

    const intervalId = window.setInterval(() => {
      void syncNotifications();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalId);
    };
  }, [addRealTimeNotification, queryClient, token, userId]);

  return null;
}
