import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import {
  requestNotificationPermission,
  showLocalNotification,
} from '@/features/notification/utils/web-notifications';
import { useNotificationStore } from '@/features/notification/stores/notification-store';
import type { NotificationDto } from '@/features/notification/types/notification';
import { salesDeskApi } from '../api/salesdesk-api';
import { useSalesDeskMeetingStore, type SalesDeskMeetingLike } from '../stores/salesdesk-meeting-store';
import { useSalesDeskGmailConnectionStore } from '../stores/salesdesk-gmail-connection-store';
import { useGmailInbox } from './useSalesDeskGmailBridge';

const POLL_INTERVAL_MS = 30000;

function hashId(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function buildMeetingNotification(meeting: SalesDeskMeetingLike, isRead: boolean): NotificationDto {
  const nowIso = new Date().toISOString();
  return {
    id: -Math.abs(hashId(meeting.id)),
    titleKey: '',
    titleArgs: null,
    title: `Yeni toplanti: ${meeting.subject}`,
    messageKey: '',
    messageArgs: null,
    message: meeting.sender,
    isRead,
    userId: 0,
    relatedEntityName: 'Meeting',
    relatedEntityId: null,
    relatedEntityType: meeting.id,
    notificationType: 'Meeting',
    createdDate: meeting.receivedAt || nowIso,
    timestamp: meeting.receivedAt || nowIso,
    actionUrl: '/salesdesk/gmail',
  };
}

/**
 * Toplanti e-postalarini periyodik izler.
 * - Gmail hesabi bagliysa GERCEK gelen kutusundan (Gmail API) toplanti tespit eder.
 * - Bagli degilse SalesDesk'e kayitli gmail verisi uzerinden calisir.
 * Yeni toplantida toast + tarayici bildirimi verir ve meeting store'u gunceller.
 */
export function useSalesDeskGmailMeetingWatcher(): void {
  const token = useAuthStore((state) => state.token);
  const connected = useSalesDeskGmailConnectionStore((state) => state.connected);
  const registerMeetings = useSalesDeskMeetingStore((state) => state.registerMeetings);
  const addRealTimeNotification = useNotificationStore((state) => state.addRealTimeNotification);
  const permissionRequested = useRef(false);
  const rehydrated = useRef(false);

  useEffect(() => {
    if (token && !permissionRequested.current) {
      permissionRequested.current = true;
      void requestNotificationPermission();
    }
  }, [token]);

  // Kalici toplanti uyarilarini bildirim kutusuna geri yukle (yeniden yuklemede kaybolmasin).
  useEffect(() => {
    if (rehydrated.current) return;
    rehydrated.current = true;
    const { alerts, readIds } = useSalesDeskMeetingStore.getState();
    const readSet = new Set(readIds);
    alerts.forEach((alert) => {
      addRealTimeNotification(buildMeetingNotification(alert, readSet.has(alert.id)));
    });
  }, [addRealTimeNotification]);

  const gmailInbox = useGmailInbox();

  const recordQuery = useQuery({
    queryKey: ['salesdesk', 'gmail', 'meeting-watch'],
    queryFn: () =>
      salesDeskApi.gmail.list({
        pageNumber: 1,
        pageSize: 50,
        sortBy: 'ReceivedAt',
        sortDirection: 'desc',
      }),
    enabled: !!token && !connected,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const gmailData = gmailInbox.data;
  const recordData = recordQuery.data;

  useEffect(() => {
    let meetings: SalesDeskMeetingLike[] = [];

    if (connected) {
      if (!gmailData) return;
      meetings = gmailData
        .filter((message) => message.isMeeting)
        .map((message) => ({
          id: message.id,
          subject: message.subject,
          sender: message.sender,
          receivedAt: message.receivedAt,
        }));
    } else {
      if (!recordData?.data) return;
      meetings = recordData.data
        .filter((message) => message.isMeeting)
        .map((message) => ({
          id: `record-${message.id}`,
          subject: message.subject,
          sender: message.sender,
          receivedAt: message.receivedAt,
        }));
    }

    const freshMeetings = registerMeetings(meetings);

    freshMeetings.forEach((meeting) => {
      toast.message(`Yeni toplanti: ${meeting.subject}`, {
        description: meeting.sender,
      });
      showLocalNotification({
        id: Math.abs(hashId(meeting.id)),
        title: `Yeni toplanti: ${meeting.subject}`,
        message: meeting.sender,
      });
      addRealTimeNotification(buildMeetingNotification(meeting, false));
    });
  }, [connected, gmailData, recordData, registerMeetings, addRealTimeNotification]);
}
