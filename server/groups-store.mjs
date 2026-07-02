import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, 'data', 'salesdesk-groups.json');

/** @type {Promise<void>} */
let writeQueue = Promise.resolve();

function readStore() {
  if (!fs.existsSync(DATA_PATH)) {
    return { seq: 1, groups: [] };
  }
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  return {
    seq: typeof parsed.seq === 'number' ? parsed.seq : 1,
    groups: Array.isArray(parsed.groups) ? parsed.groups : [],
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

function normalizeMemberIds(memberUserIds) {
  if (!Array.isArray(memberUserIds)) return [];
  const unique = new Set();
  for (const id of memberUserIds) {
    const numeric = Number(id);
    if (Number.isFinite(numeric) && numeric > 0) unique.add(Math.trunc(numeric));
  }
  return [...unique];
}

function toGroupDto(group) {
  return {
    id: group.id,
    name: group.name,
    description: group.description ?? '',
    memberUserIds: Array.isArray(group.memberUserIds) ? group.memberUserIds : [],
    memberCount: Array.isArray(group.memberUserIds) ? group.memberUserIds.length : 0,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

export function listGroups() {
  const store = readStore();
  return store.groups.map(toGroupDto).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

export function getGroup(id) {
  const numericId = Number(id);
  const store = readStore();
  const group = store.groups.find((item) => item.id === numericId);
  return group ? toGroupDto(group) : null;
}

export function createGroup({ name, description = '', memberUserIds = [] }) {
  const trimmedName = String(name ?? '').trim();
  if (!trimmedName) {
    throw new Error('Grup adi zorunludur.');
  }

  return withLock(() => {
    const store = readStore();
    const duplicate = store.groups.some(
      (item) => item.name.trim().toLocaleLowerCase('tr-TR') === trimmedName.toLocaleLowerCase('tr-TR')
    );
    if (duplicate) {
      throw new Error('Bu isimde bir grup zaten var.');
    }

    const now = new Date().toISOString();
    const id = store.seq;
    const group = {
      id,
      name: trimmedName,
      description: String(description ?? '').trim(),
      memberUserIds: normalizeMemberIds(memberUserIds),
      createdAt: now,
      updatedAt: now,
    };
    store.seq += 1;
    store.groups.push(group);
    writeStore(store);
    return toGroupDto(group);
  });
}

export function updateGroup(id, { name, description }) {
  const numericId = Number(id);
  const trimmedName = name != null ? String(name).trim() : null;

  return withLock(() => {
    const store = readStore();
    const index = store.groups.findIndex((item) => item.id === numericId);
    if (index === -1) {
      throw new Error('Grup bulunamadi.');
    }

    if (trimmedName != null) {
      if (!trimmedName) throw new Error('Grup adi zorunludur.');
      const duplicate = store.groups.some(
        (item, i) =>
          i !== index &&
          item.name.trim().toLocaleLowerCase('tr-TR') === trimmedName.toLocaleLowerCase('tr-TR')
      );
      if (duplicate) throw new Error('Bu isimde bir grup zaten var.');
      store.groups[index].name = trimmedName;
    }

    if (description != null) {
      store.groups[index].description = String(description).trim();
    }

    store.groups[index].updatedAt = new Date().toISOString();
    writeStore(store);
    return toGroupDto(store.groups[index]);
  });
}

export function setGroupMembers(id, memberUserIds) {
  const numericId = Number(id);

  return withLock(() => {
    const store = readStore();
    const index = store.groups.findIndex((item) => item.id === numericId);
    if (index === -1) {
      throw new Error('Grup bulunamadi.');
    }

    store.groups[index].memberUserIds = normalizeMemberIds(memberUserIds);
    store.groups[index].updatedAt = new Date().toISOString();
    writeStore(store);
    return toGroupDto(store.groups[index]);
  });
}

export function deleteGroup(id) {
  const numericId = Number(id);

  return withLock(() => {
    const store = readStore();
    const before = store.groups.length;
    store.groups = store.groups.filter((item) => item.id !== numericId);
    if (store.groups.length === before) {
      throw new Error('Grup bulunamadi.');
    }
    writeStore(store);
    return { ok: true };
  });
}
