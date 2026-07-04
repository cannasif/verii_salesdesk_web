import type { SalesDeskNoteDto } from '../types/notes-types';
import { sendBackendNoteNotification } from './send-note-backend-notification';

export async function notifyNoteRecipientsViaBackend(
  note: SalesDeskNoteDto,
  actorUserId: number
): Promise<void> {
  const preview = String(note.content ?? '').trim().slice(0, 160) || 'Yeni bir not paylasildi.';
  const recipients = note.recipientUserIds.filter((id) => id !== actorUserId);

  await Promise.allSettled(
    recipients.map((recipientUserId) =>
      sendBackendNoteNotification({
        title: note.createdByName
          ? `${note.createdByName} size not paylasti`
          : 'Yeni not paylasildi',
        message: `${note.title}: ${preview}`,
        channel: 'Web',
        severity: 'info',
        recipientUserId,
        relatedEntityType: 'SalesDeskNote',
        relatedEntityId: note.id,
        actionUrl: '/salesdesk/notes',
      })
    )
  );
}
