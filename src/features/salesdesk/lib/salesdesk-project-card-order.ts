import type { SalesDeskProjectTeamId } from './salesdesk-project-tracking';
import type { SalesDeskTaskStatus } from '../api/salesdesk-api';

const ORDER_STORAGE_KEY = 'salesdesk-project-card-order-v1';

type OrderStore = Record<string, number[]>;

function columnKey(teamId: SalesDeskProjectTeamId, status: SalesDeskTaskStatus): string {
  return `${teamId}:${status}`;
}

function readStore(): OrderStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as OrderStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: OrderStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(store));
}

export function sortProjectsInColumn<T extends { id: number }>(
  items: T[],
  teamId: SalesDeskProjectTeamId,
  status: SalesDeskTaskStatus
): T[] {
  const store = readStore();
  const order = store[columnKey(teamId, status)];
  if (!order?.length) return items;

  const rank = new Map(order.map((id, index) => [id, index]));
  return [...items].sort((a, b) => {
    const left = rank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const right = rank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    if (left !== right) return left - right;
    return a.id - b.id;
  });
}

export function appendProjectToColumnOrder(
  teamId: SalesDeskProjectTeamId,
  status: SalesDeskTaskStatus,
  projectId: number
): void {
  const store = readStore();
  const key = columnKey(teamId, status);
  const without = (store[key] ?? []).filter((id) => id !== projectId);
  store[key] = [...without, projectId];
  writeStore(store);
}

export function removeProjectFromAllColumnOrders(projectId: number): void {
  const store = readStore();
  let changed = false;
  for (const key of Object.keys(store)) {
    const filtered = store[key].filter((id) => id !== projectId);
    if (filtered.length !== store[key].length) {
      store[key] = filtered;
      changed = true;
    }
  }
  if (changed) writeStore(store);
}
