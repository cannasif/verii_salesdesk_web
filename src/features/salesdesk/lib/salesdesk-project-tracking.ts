import type { SalesDeskTaskDto, SalesDeskTaskStatus } from '../api/salesdesk-api';
import { normalizeOpenItemGroupKey } from './salesdesk-open-item-categories';

/** Proje takibi kayitlari (groupName: Proje veya Proje|asama). */
export const SALESDESK_PROJECT_GROUP = 'Proje';

export const SALESDESK_PROJECT_GROUP_PREFIX = `${SALESDESK_PROJECT_GROUP}|`;

export const PROJECT_PHASE_OPTIONS = [
  { value: 'Analiz', label: 'Analiz / Planlama' },
  { value: 'Gelistirme', label: 'Gelistirme' },
  { value: 'Test', label: 'Test / QA' },
  { value: 'Teslim', label: 'Teslim / Kapanis' },
  { value: 'Bakim', label: 'Bakim / Destek' },
] as const;

export function isSalesDeskProjectTask(task: SalesDeskTaskDto): boolean {
  const normalized = normalizeOpenItemGroupKey(task.groupName);
  if (normalized === 'proje') return true;
  return normalized.startsWith('proje|');
}

export function buildSalesDeskProjectGroupName(projectPhase?: string | null): string {
  const trimmed = projectPhase?.trim();
  if (!trimmed) return SALESDESK_PROJECT_GROUP;
  return `${SALESDESK_PROJECT_GROUP}|${trimmed}`;
}

export function parseSalesDeskProjectPhase(groupName?: string | null): string {
  if (!groupName) return '';
  if (groupName === SALESDESK_PROJECT_GROUP) return '';
  if (!groupName.startsWith(SALESDESK_PROJECT_GROUP_PREFIX)) return '';
  return groupName.slice(SALESDESK_PROJECT_GROUP_PREFIX.length).trim();
}

export function getSalesDeskProjectPhaseLabel(phase?: string | null): string {
  if (!phase) return '-';
  const match = PROJECT_PHASE_OPTIONS.find((item) => item.value === phase);
  return match?.label ?? phase;
}

export function getSalesDeskProjectPhaseOptions(): Array<{ value: string; label: string }> {
  return PROJECT_PHASE_OPTIONS.map((item) => ({ value: item.value, label: item.label }));
}

export function isProjectTaskOverdue(task: SalesDeskTaskDto, todayKey = new Date().toISOString().slice(0, 10)): boolean {
  if (!task.dueDate || task.status === 3 || task.status === 4) return false;
  return task.dueDate.slice(0, 10) < todayKey;
}

export interface ProjectStatusCounts {
  open: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export function computeProjectStatusCounts(rows: SalesDeskTaskDto[]): ProjectStatusCounts {
  return {
    open: rows.filter((item) => item.status === 1).length,
    inProgress: rows.filter((item) => item.status === 2).length,
    completed: rows.filter((item) => item.status === 3).length,
    cancelled: rows.filter((item) => item.status === 4).length,
  };
}

export function groupProjectsByStatus(rows: SalesDeskTaskDto[]): Record<SalesDeskTaskStatus, SalesDeskTaskDto[]> {
  return {
    1: rows.filter((item) => item.status === 1),
    2: rows.filter((item) => item.status === 2),
    3: rows.filter((item) => item.status === 3),
    4: rows.filter((item) => item.status === 4),
  };
}
