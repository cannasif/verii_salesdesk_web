import type { SalesDeskTaskDto, SalesDeskTaskStatus } from '../api/salesdesk-api';
import { normalizeOpenItemGroupKey } from './salesdesk-open-item-categories';

/** Proje takibi kayitlari (groupName: Proje|ekip veya Proje|ekip|asama). */
export const SALESDESK_PROJECT_GROUP = 'Proje';

export const SALESDESK_PROJECT_GROUP_PREFIX = `${SALESDESK_PROJECT_GROUP}|`;

export type SalesDeskProjectTeamId = 'Yazilim' | 'Destek' | 'Proje';

export const PROJECT_TEAM_IDS: SalesDeskProjectTeamId[] = ['Yazilim', 'Destek', 'Proje'];

export const PROJECT_TEAM_OPTIONS = [
  { value: 'Yazilim' as const, label: 'Yazilim Ekibi' },
  { value: 'Destek' as const, label: 'Destek Ekibi' },
  { value: 'Proje' as const, label: 'Proje Ekibi' },
] as const;

const PROJECT_TEAM_SET = new Set<string>(PROJECT_TEAM_IDS);

export const PROJECT_PHASE_OPTIONS = [
  { value: 'Analiz', label: 'Analiz / Planlama' },
  { value: 'Gelistirme', label: 'Gelistirme' },
  { value: 'Test', label: 'Test / QA' },
  { value: 'Teslim', label: 'Teslim / Kapanis' },
  { value: 'Bakim', label: 'Bakim / Destek' },
] as const;

const PROJECT_PHASE_SET = new Set<string>(PROJECT_PHASE_OPTIONS.map((item) => item.value));

export function isSalesDeskProjectTeam(value?: string | null): value is SalesDeskProjectTeamId {
  return value != null && PROJECT_TEAM_SET.has(value);
}

export function isSalesDeskProjectTask(task: SalesDeskTaskDto): boolean {
  const normalized = normalizeOpenItemGroupKey(task.groupName);
  if (normalized === 'proje') return true;
  return normalized.startsWith('proje|');
}

export function parseSalesDeskProjectTeam(groupName?: string | null): SalesDeskProjectTeamId {
  if (!groupName?.startsWith(SALESDESK_PROJECT_GROUP_PREFIX)) return 'Proje';
  const segment = groupName.slice(SALESDESK_PROJECT_GROUP_PREFIX.length).split('|')[0]?.trim();
  if (isSalesDeskProjectTeam(segment)) return segment;
  return 'Proje';
}

export function parseSalesDeskProjectPhase(groupName?: string | null): string {
  if (!groupName) return '';
  if (groupName === SALESDESK_PROJECT_GROUP) return '';

  if (!groupName.startsWith(SALESDESK_PROJECT_GROUP_PREFIX)) return '';

  const segments = groupName
    .slice(SALESDESK_PROJECT_GROUP_PREFIX.length)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  if (segments.length === 0) return '';

  if (isSalesDeskProjectTeam(segments[0])) {
    const phase = segments[1];
    return phase && PROJECT_PHASE_SET.has(phase) ? phase : '';
  }

  const legacyPhase = segments[0];
  return PROJECT_PHASE_SET.has(legacyPhase) ? legacyPhase : '';
}

export function buildSalesDeskProjectGroupName(
  projectTeam?: string | null,
  projectPhase?: string | null
): string {
  const team = isSalesDeskProjectTeam(projectTeam?.trim()) ? projectTeam!.trim() : 'Proje';
  const phase = projectPhase?.trim();

  if (phase && PROJECT_PHASE_SET.has(phase)) {
    return `${SALESDESK_PROJECT_GROUP}|${team}|${phase}`;
  }

  if (team !== 'Proje') {
    return `${SALESDESK_PROJECT_GROUP}|${team}`;
  }

  return SALESDESK_PROJECT_GROUP;
}

/** @deprecated Use buildSalesDeskProjectGroupName(team, phase) */
export function buildSalesDeskProjectGroupNameLegacy(projectPhase?: string | null): string {
  return buildSalesDeskProjectGroupName('Proje', projectPhase);
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

export function groupProjectsByTeam(rows: SalesDeskTaskDto[]): Record<SalesDeskProjectTeamId, SalesDeskTaskDto[]> {
  const grouped: Record<SalesDeskProjectTeamId, SalesDeskTaskDto[]> = {
    Yazilim: [],
    Destek: [],
    Proje: [],
  };

  for (const row of rows) {
    const team = parseSalesDeskProjectTeam(row.groupName);
    grouped[team].push(row);
  }

  return grouped;
}

export function getSalesDeskProjectTeamLabel(team?: SalesDeskProjectTeamId | string | null): string {
  if (!team) return 'Proje Ekibi';
  const match = PROJECT_TEAM_OPTIONS.find((item) => item.value === team);
  return match?.label ?? String(team);
}

export function getSalesDeskProjectTeamOptions(): Array<{ value: string; label: string }> {
  return PROJECT_TEAM_OPTIONS.map((item) => ({ value: item.value, label: item.label }));
}
