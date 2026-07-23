import { type ReactElement, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Receipt, Package, Headphones, Info, CalendarClock } from 'lucide-react';
import type { NotificationDto } from '../types/notification';
import { formatNotificationTime } from '../utils/date-utils';
import { notificationApi } from '../api/notification-api';
import { useNotificationStore } from '../stores/notification-store';
import { useAuthStore } from '@/stores/auth-store';
import { useAppShellStore } from '@/stores/app-shell-store';
import { useSalesDeskMeetingStore } from '@/features/salesdesk/stores/salesdesk-meeting-store';

interface NotificationItemProps {
  notification: NotificationDto;
  onNavigate?: (route: string) => void;
}

export function NotificationItem({ notification, onNavigate }: NotificationItemProps): ReactElement {
  const { t } = useTranslation(['notification', 'common']);
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const decrementUnreadCount = useAppShellStore((state) => state.decrementUnreadCount);
  const markRealTimeRead = useNotificationStore((state) => state.markRealTimeNotificationRead);
  const markMeetingAlertRead = useSalesDeskMeetingStore((state) => state.markAlertRead);

  // Client tarafi (backend'siz) bildirimler negatif id ile isaretlenir; API cagrisi yapilmaz.
  const isClientNotification = notification.id < 0;

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification', 'list'] });
      if (userId) {
        decrementUnreadCount(userId, 1);
      }
    },
  });

  const getRouteForNotification = useCallback((notificationType: string, entityId: number | null): string | null => {
    const typeString = String(notificationType);
    
    if (typeString.endsWith('Approval')) {
      if (typeString.startsWith('Demand')) {
        return '/demands/waiting-approvals';
      }
      if (typeString.startsWith('Quotation')) {
        return '/quotations/waiting-approvals';
      }
      if (typeString.startsWith('Order')) {
        return '/orders/waiting-approvals';
      }
    }
    
    if (typeString.endsWith('Detail')) {
      if (!entityId) return null;
      
      if (typeString.startsWith('Demand')) {
        return `/demands/${entityId}`;
      }
      if (typeString.startsWith('Quotation')) {
        return `/quotations/${entityId}`;
      }
      if (typeString.startsWith('Order')) {
        return `/orders/${entityId}`;
      }
    }

    return null;
  }, []);

  const getRouteForEntity = useCallback((entityName: string | null, entityId: number | null): string | null => {
    if (!entityName || !entityId) return null;

    const routeMap: Record<string, string> = {
      Demand: `/demands/${entityId}`,
      Quotation: `/quotations/${entityId}`,
      Order: `/orders/${entityId}`,
    };

    return routeMap[entityName] || null;
  }, []);

  const markClientRead = useCallback((): void => {
    markRealTimeRead(notification.id);
    if (notification.relatedEntityType) {
      markMeetingAlertRead(notification.relatedEntityType);
    }
  }, [markRealTimeRead, markMeetingAlertRead, notification.id, notification.relatedEntityType]);

  const handleClick = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    if (!notification.isRead) {
      if (isClientNotification) {
        markClientRead();
      } else {
        markAsReadMutation.mutate(notification.id);
      }
    }

    let route: string | null = null;

    if (notification.actionUrl) {
      route = notification.actionUrl;
    } else if (notification.notificationType) {
      route = getRouteForNotification(notification.notificationType, notification.relatedEntityId);
    } else if (notification.relatedEntityName && notification.relatedEntityId) {
      route = getRouteForEntity(notification.relatedEntityName, notification.relatedEntityId);
    }

    if (route && onNavigate) {
      onNavigate(route);
    }
  }, [notification, isClientNotification, markClientRead, markAsReadMutation, getRouteForNotification, getRouteForEntity, onNavigate]);

  const handleMarkAsRead = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    
    if (notification.isRead) return;
    if (isClientNotification) {
      markClientRead();
      return;
    }
    markAsReadMutation.mutate(notification.id);
  }, [notification, isClientNotification, markClientRead, markAsReadMutation]);

  const icon = useMemo(() => {
    const notificationType = notification.notificationType;
    const entityName = notification.relatedEntityName || '';

    if (notificationType === 'Meeting' || entityName === 'Meeting' || entityName.includes('Toplant')) {
      return <CalendarClock size={16} className="text-emerald-400" />;
    }
    if (notificationType === 'QuotationDetail' || notificationType === 'QuotationApproval' || entityName.includes('Quotation') || entityName.includes('Teklif')) {
      return <FileText size={16} className="text-[var(--crm-brand-primary)]" />;
    }
    if (notificationType === 'OrderDetail' || notificationType === 'OrderApproval' || entityName.includes('Order') || entityName.includes('Sipariş')) {
      return <Package size={16} className="text-orange-400" />;
    }
    if (notificationType === 'DemandDetail' || notificationType === 'DemandApproval' || entityName.includes('Demand') || entityName.includes('Talep')) {
      return <Receipt size={16} className="text-green-400" />;
    }
    if (entityName.includes('Support') || entityName.includes('Ticket')) {
      return <Headphones size={16} className="text-blue-400" />;
    }

    return <Info size={16} className="text-[var(--crm-brand-accent)]" />;
  }, [notification.notificationType, notification.relatedEntityName]);

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      role="button"
      tabIndex={0}
      className={`group flex cursor-pointer items-start gap-3 border-l-2 px-4 py-3 transition-colors hover:bg-[var(--crm-brand-soft)] ${
        !notification.isRead
          ? 'border-[var(--crm-brand-primary)] bg-[var(--crm-brand-soft)]/40'
          : 'border-transparent hover:border-[var(--crm-brand-ring)]'
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium leading-tight text-slate-900 dark:text-white">
          {notification.title}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {notification.message}
        </p>
        <div className="mt-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
          {formatNotificationTime(notification.timestamp || notification.createdDate)}
        </div>
      </div>

      {!notification.isRead && (
        <div 
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--crm-brand-primary)] shadow-[0_0_8px_var(--crm-brand-focus-glow)]" 
          title={t('unread')}
          onClick={handleMarkAsRead}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleMarkAsRead(e as unknown as React.MouseEvent);
            }
          }}
          role="button"
          tabIndex={0}
        />
      )}
    </div>
  );
}
