import { Code2, FolderKanban, Headphones, type LucideIcon } from 'lucide-react';
import type { SalesDeskTaskStatus } from '../api/salesdesk-api';
import type { SalesDeskProjectTeamId } from './salesdesk-project-tracking';
import { TASK_STATUS_LABELS } from './salesdesk-labels';

export interface ProjectTrelloTeamBoardDef {
  id: SalesDeskProjectTeamId;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  headerGradient: string;
  iconClassName: string;
  accentClassName: string;
}

export interface ProjectTrelloListDef {
  status: SalesDeskTaskStatus;
  title: string;
  headerClass: string;
  dropClass: string;
}

export const PROJECT_TRELLO_TEAM_BOARDS: ProjectTrelloTeamBoardDef[] = [
  {
    id: 'Yazilim',
    title: 'Yazilim Ekibi',
    subtitle: 'Gelistirme, entegrasyon ve urun isleri',
    icon: Code2,
    headerGradient: 'from-violet-500/12 to-transparent',
    iconClassName: 'bg-gradient-to-br from-violet-500/30 to-violet-500/5 text-violet-200 ring-violet-500/30',
    accentClassName: 'text-violet-300',
  },
  {
    id: 'Destek',
    title: 'Destek Ekibi',
    subtitle: 'Musteri destek ve bakim talepleri',
    icon: Headphones,
    headerGradient: 'from-sky-500/12 to-transparent',
    iconClassName: 'bg-gradient-to-br from-sky-500/30 to-sky-500/5 text-sky-200 ring-sky-500/30',
    accentClassName: 'text-sky-300',
  },
  {
    id: 'Proje',
    title: 'Proje Ekibi',
    subtitle: 'Proje yonetimi ve teslim surecleri',
    icon: FolderKanban,
    headerGradient: 'from-indigo-500/12 to-transparent',
    iconClassName: 'bg-gradient-to-br from-indigo-500/30 to-indigo-500/5 text-indigo-200 ring-indigo-500/30',
    accentClassName: 'text-indigo-300',
  },
];

export const PROJECT_TRELLO_LISTS: ProjectTrelloListDef[] = [
  {
    status: 1,
    title: 'Yapilacak',
    headerClass: 'border-sky-500/25 bg-sky-500/10 text-sky-100',
    dropClass: 'from-sky-500/6',
  },
  {
    status: 2,
    title: TASK_STATUS_LABELS[2],
    headerClass: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
    dropClass: 'from-amber-500/6',
  },
  {
    status: 3,
    title: 'Tamamlandi',
    headerClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
    dropClass: 'from-emerald-500/6',
  },
  {
    status: 4,
    title: TASK_STATUS_LABELS[4],
    headerClass: 'border-slate-500/25 bg-slate-500/10 text-slate-300',
    dropClass: 'from-slate-500/6',
  },
];

export function buildTrelloDropId(teamId: SalesDeskProjectTeamId, status: SalesDeskTaskStatus): string {
  return `trello:${teamId}:${status}`;
}

export function parseTrelloDropId(
  dropId: string
): { teamId: SalesDeskProjectTeamId; status: SalesDeskTaskStatus } | null {
  const match = /^trello:(Yazilim|Destek|Proje):([1-4])$/.exec(dropId);
  if (!match) return null;
  return {
    teamId: match[1] as SalesDeskProjectTeamId,
    status: Number(match[2]) as SalesDeskTaskStatus,
  };
}

export function buildTrelloCardId(projectId: number): string {
  return `project-card-${projectId}`;
}

export function parseTrelloCardId(cardId: string): number | null {
  const match = /^project-card-(\d+)$/.exec(cardId);
  if (!match) return null;
  return Number(match[1]);
}
