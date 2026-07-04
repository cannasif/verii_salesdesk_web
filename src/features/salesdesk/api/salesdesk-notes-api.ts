import type {
  SalesDeskNoteDto,
  SalesDeskNoteNotificationPayload,
  UpsertSalesDeskNoteInput,
} from '../types/notes-types';

const STORAGE_KEY = 'salesdesk-notes-v1';

interface StoredNotification {
  id: number;
  noteId: number;
  recipientUserId: number;
  title: string;
  message: string;
  createdByUserId: number;
  createdByName: string;
  createdAt: string;
  deliveredAt: string | null;
}

interface NotesStore {
  noteSeq: number;
  notificationSeq: number;
  notes: SalesDeskNoteDto[];
  notifications: StoredNotification[];
}

function emptyStore(): NotesStore {
  return { noteSeq: 1, notificationSeq: 1, notes: [], notifications: [] };
}

function readStore(): NotesStore {
  if (typeof window === 'undefined') return emptyStore();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<NotesStore>;
    return {
      noteSeq: typeof parsed.noteSeq === 'number' ? parsed.noteSeq : 1,
      notificationSeq: typeof parsed.notificationSeq === 'number' ? parsed.notificationSeq : 1,
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: NotesStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('salesdesk-notes-changed'));
}

function normalizeIds(ids: number[] | undefined): number[] {
  if (!Array.isArray(ids)) return [];
  const unique = new Set<number>();
  for (const id of ids) {
    const numeric = Number(id);
    if (Number.isFinite(numeric) && numeric > 0) unique.add(Math.trunc(numeric));
  }
  return [...unique];
}

function queueNotifications(store: NotesStore, note: SalesDeskNoteDto, actorUserId: number): void {
  const recipients = normalizeIds(note.recipientUserIds).filter((id) => id !== actorUserId);
  const preview = String(note.content ?? '').trim().slice(0, 160);
  const now = new Date().toISOString();

  for (const recipientUserId of recipients) {
    store.notifications.push({
      id: store.notificationSeq,
      noteId: note.id,
      recipientUserId,
      title: note.title,
      message: preview || 'Yeni bir not paylasildi.',
      createdByUserId: note.createdByUserId,
      createdByName: note.createdByName ?? '',
      createdAt: now,
      deliveredAt: null,
    });
    store.notificationSeq += 1;
  }
}

export const salesDeskNotesApi = {
  listForUser: async (userId: number): Promise<SalesDeskNoteDto[]> => {
    const store = readStore();
    return store.notes
      .filter(
        (note) => note.createdByUserId === userId || note.recipientUserIds.includes(userId)
      )
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  },

  get: async (id: number): Promise<SalesDeskNoteDto> => {
    const store = readStore();
    const note = store.notes.find((item) => item.id === id);
    if (!note) throw new Error('Not bulunamadi.');
    return note;
  },

  create: async (input: UpsertSalesDeskNoteInput): Promise<SalesDeskNoteDto> => {
    const title = String(input.title ?? '').trim();
    const content = String(input.content ?? '').trim();
    const createdByUserId = Number(input.createdByUserId);
    const createdByName = String(input.createdByName ?? '').trim();
    const recipientUserIds = normalizeIds(input.recipientUserIds);

    if (!title) throw new Error('Not basligi zorunludur.');
    if (!Number.isFinite(createdByUserId) || createdByUserId <= 0) {
      throw new Error('Olusturan kullanici gerekli.');
    }

    const store = readStore();
    const now = new Date().toISOString();
    const note: SalesDeskNoteDto = {
      id: store.noteSeq,
      title,
      content,
      createdByUserId,
      createdByName,
      recipientUserIds,
      createdAt: now,
      updatedAt: now,
    };

    store.noteSeq += 1;
    store.notes.unshift(note);
    queueNotifications(store, note, createdByUserId);
    writeStore(store);
    return note;
  },

  update: async (
    id: number,
    input: Omit<UpsertSalesDeskNoteInput, 'createdByUserId' | 'createdByName'>
  ): Promise<SalesDeskNoteDto> => {
    const title = String(input.title ?? '').trim();
    const content = String(input.content ?? '').trim();
    const recipientUserIds = normalizeIds(input.recipientUserIds);
    const notifyRecipients = input.notifyRecipients !== false;

    if (!title) throw new Error('Not basligi zorunludur.');

    const store = readStore();
    const index = store.notes.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Not bulunamadi.');

    const previous = store.notes[index];
    const updated: SalesDeskNoteDto = {
      ...previous,
      title,
      content,
      recipientUserIds,
      updatedAt: new Date().toISOString(),
    };

    store.notes[index] = updated;
    if (notifyRecipients) {
      queueNotifications(store, updated, previous.createdByUserId);
    }
    writeStore(store);
    return updated;
  },

  delete: async (id: number): Promise<void> => {
    const store = readStore();
    const before = store.notes.length;
    store.notes = store.notes.filter((item) => item.id !== id);
    if (store.notes.length === before) throw new Error('Not bulunamadi.');
    store.notifications = store.notifications.filter((item) => item.noteId !== id);
    writeStore(store);
  },

  pullPendingNotifications: async (userId: number): Promise<SalesDeskNoteNotificationPayload[]> => {
    const numericUserId = Number(userId);
    if (!Number.isFinite(numericUserId) || numericUserId <= 0) return [];

    const store = readStore();
    const now = new Date().toISOString();
    const pending = store.notifications.filter(
      (item) => item.recipientUserId === numericUserId && !item.deliveredAt
    );

    for (const item of pending) {
      item.deliveredAt = now;
    }

    if (pending.length > 0) {
      writeStore(store);
    }

    return pending.map((item) => ({
      id: item.id,
      noteId: item.noteId,
      recipientUserId: item.recipientUserId,
      title: item.title,
      message: item.message,
      createdByUserId: item.createdByUserId,
      createdByName: item.createdByName,
      createdAt: item.createdAt,
    }));
  },
};
