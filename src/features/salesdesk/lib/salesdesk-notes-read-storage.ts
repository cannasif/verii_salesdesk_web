const READ_STORAGE_KEY = 'salesdesk-notes-read-v1';

type ReadStore = Record<string, number[]>;

function readStore(): ReadStore {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReadStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: ReadStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(store));
}

export function isNoteReadByUser(userId: number, noteId: number): boolean {
  const store = readStore();
  return (store[String(userId)] ?? []).includes(noteId);
}

export function markNoteReadForUser(userId: number, noteId: number): void {
  const store = readStore();
  const key = String(userId);
  const current = store[key] ?? [];
  if (current.includes(noteId)) return;
  store[key] = [...current, noteId];
  writeStore(store);
}

export function countUnreadSharedNotes(
  userId: number,
  noteIds: number[]
): number {
  const store = readStore();
  const readIds = new Set(store[String(userId)] ?? []);
  return noteIds.filter((id) => !readIds.has(id)).length;
}
