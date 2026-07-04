import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, 'data', 'salesdesk-notes.json');

/** @type {Promise<void>} */
let writeQueue = Promise.resolve();

function readStore() {
  if (!fs.existsSync(DATA_PATH)) {
    return { noteSeq: 1, notificationSeq: 1, notes: [], notifications: [] };
  }
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  return {
    noteSeq: typeof parsed.noteSeq === 'number' ? parsed.noteSeq : 1,
    notificationSeq: typeof parsed.notificationSeq === 'number' ? parsed.notificationSeq : 1,
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
  };
}

function writeStore(data) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function withLock(fn) {
  const run = writeQueue.then(fn);
  writeQueue = run.catch(() => {});
  return run;
}

function normalizeIds(ids) {
  if (!Array.isArray(ids)) return [];
  const unique = new Set();
  for (const id of ids) {
    const numeric = Number(id);
    if (Number.isFinite(numeric) && numeric > 0) unique.add(Math.trunc(numeric));
  }
  return [...unique];
}

function toNoteDto(note) {
  return {
    id: note.id,
    title: note.title ?? '',
    content: note.content ?? '',
    createdByUserId: note.createdByUserId,
    createdByName: note.createdByName ?? '',
    recipientUserIds: Array.isArray(note.recipientUserIds) ? note.recipientUserIds : [],
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

function queueNotifications(store, note, actorUserId) {
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

export function listNotesForUser(userId) {
  const numericUserId = Number(userId);
  const store = readStore();
  return store.notes
    .map(toNoteDto)
    .filter(
      (note) =>
        note.createdByUserId === numericUserId || note.recipientUserIds.includes(numericUserId)
    )
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export function getNote(id) {
  const numericId = Number(id);
  const store = readStore();
  const note = store.notes.find((item) => item.id === numericId);
  return note ? toNoteDto(note) : null;
}

export function createNote(payload) {
  const title = String(payload.title ?? '').trim();
  const content = String(payload.content ?? '').trim();
  const createdByUserId = Number(payload.createdByUserId);
  const createdByName = String(payload.createdByName ?? '').trim();
  const recipientUserIds = normalizeIds(payload.recipientUserIds);

  if (!title) throw new Error('Not basligi zorunludur.');
  if (!Number.isFinite(createdByUserId) || createdByUserId <= 0) {
    throw new Error('Olusturan kullanici gerekli.');
  }

  return withLock(() => {
    const store = readStore();
    const now = new Date().toISOString();
    const note = {
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
    return toNoteDto(note);
  });
}

export function updateNote(id, payload) {
  const numericId = Number(id);
  const title = String(payload.title ?? '').trim();
  const content = String(payload.content ?? '').trim();
  const recipientUserIds = normalizeIds(payload.recipientUserIds);
  const notifyRecipients = payload.notifyRecipients !== false;

  if (!title) throw new Error('Not basligi zorunludur.');

  return withLock(() => {
    const store = readStore();
    const index = store.notes.findIndex((item) => item.id === numericId);
    if (index === -1) throw new Error('Not bulunamadi.');

    const previous = store.notes[index];
    store.notes[index] = {
      ...previous,
      title,
      content,
      recipientUserIds,
      updatedAt: new Date().toISOString(),
    };

    if (notifyRecipients) {
      queueNotifications(store, store.notes[index], previous.createdByUserId);
    }

    writeStore(store);
    return toNoteDto(store.notes[index]);
  });
}

export function deleteNote(id) {
  const numericId = Number(id);

  return withLock(() => {
    const store = readStore();
    const before = store.notes.length;
    store.notes = store.notes.filter((item) => item.id !== numericId);
    if (store.notes.length === before) throw new Error('Not bulunamadi.');
    store.notifications = store.notifications.filter((item) => item.noteId !== numericId);
    writeStore(store);
    return { ok: true };
  });
}

export function pullPendingNotifications(userId) {
  const numericUserId = Number(userId);
  if (!Number.isFinite(numericUserId) || numericUserId <= 0) return [];

  return withLock(() => {
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
  });
}
