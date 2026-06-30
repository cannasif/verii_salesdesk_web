import type { ApiResponse, PagedResponse, PagedParams } from '@/types/api';

export const NotificationType = {
  DemandDetail: 'DemandDetail',
  DemandApproval: 'DemandApproval',
  QuotationDetail: 'QuotationDetail',
  QuotationApproval: 'QuotationApproval',
  OrderDetail: 'OrderDetail',
  OrderApproval: 'OrderApproval',
} as const;

export type NotificationChannel = 'Terminal' | 'Web';

export type NotificationSeverity = 'info' | 'warning' | 'error';

export interface NotificationDto {
  id: number;
  titleKey: string;
  titleArgs: string | null;
  title: string;
  messageKey: string;
  messageArgs: string | null;
  message: string;
  isRead: boolean;
  userId: number;
  relatedEntityName: string | null;
  relatedEntityId: number | null;
  notificationType: keyof typeof NotificationType;
  createdDate: string;
  updatedDate?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  channel?: NotificationChannel;
  severity?: NotificationSeverity;
  readDate?: string | null;
  timestamp?: string;
  recipientUserId?: number | null;
  recipientTerminalUserId?: number | null;
  relatedEntityType?: string | null;
  actionUrl?: string | null;
  terminalActionCode?: string | null;
}

export interface SignalRNotificationPayload {
  id: number;
  titleKey: string;
  titleArgs: string | null;
  title: string;
  messageKey: string;
  messageArgs: string | null;
  message: string;
  notificationType: keyof typeof NotificationType;
  relatedEntityName: string | null;
  relatedEntityId: number | null;
  userId: number;
  timestamp: string;
  channel?: NotificationChannel;
  type?: NotificationSeverity;
  recipientUserId?: number;
  recipientTerminalUserId?: number;
}

export type NotificationResponse = ApiResponse<NotificationDto>;
export type NotificationsResponse = ApiResponse<NotificationDto[]>;
export type PagedNotificationsResponse = ApiResponse<PagedResponse<NotificationDto>>;

export interface CreateNotificationRequest {
  title: string;
  message: string;
  channel: NotificationChannel;
  severity: NotificationSeverity;
  recipientUserId?: number;
  recipientTerminalUserId?: number;
  relatedEntityType?: string;
  relatedEntityId?: number;
  actionUrl?: string;
  terminalActionCode?: string;
}

export interface GetPagedNotificationsRequest extends PagedParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

