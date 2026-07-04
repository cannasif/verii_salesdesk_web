export interface SalesDeskNoteDto {
  id: number;
  title: string;
  content: string;
  createdByUserId: number;
  createdByName: string;
  recipientUserIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesDeskNoteFormValues {
  title: string;
  content: string;
  recipientUserIds: number[];
}

export interface SalesDeskNoteNotificationPayload {
  id: number;
  noteId: number;
  recipientUserId: number;
  title: string;
  message: string;
  createdByUserId: number;
  createdByName: string;
  createdAt: string;
}

export interface UpsertSalesDeskNoteInput {
  title: string;
  content: string;
  recipientUserIds: number[];
  createdByUserId: number;
  createdByName: string;
  notifyRecipients?: boolean;
}
