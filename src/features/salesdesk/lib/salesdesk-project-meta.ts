export type ProjectLabelId = 'urgent' | 'customer' | 'bug' | 'integration' | 'internal';

export interface ProjectLabelDef {
  id: ProjectLabelId;
  label: string;
  chipClass: string;
  barClass: string;
}

export interface ProjectChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ProjectCardMeta {
  labels: ProjectLabelId[];
  checklist: ProjectChecklistItem[];
}

export const PROJECT_LABEL_DEFS: ProjectLabelDef[] = [
  { id: 'urgent', label: 'Acil', chipClass: 'bg-red-500/20 text-red-200 ring-red-500/30', barClass: 'bg-red-500' },
  { id: 'customer', label: 'Musteri', chipClass: 'bg-sky-500/20 text-sky-200 ring-sky-500/30', barClass: 'bg-sky-500' },
  { id: 'bug', label: 'Bug', chipClass: 'bg-orange-500/20 text-orange-200 ring-orange-500/30', barClass: 'bg-orange-500' },
  {
    id: 'integration',
    label: 'Entegrasyon',
    chipClass: 'bg-violet-500/20 text-violet-200 ring-violet-500/30',
    barClass: 'bg-violet-500',
  },
  {
    id: 'internal',
    label: 'Ic Is',
    chipClass: 'bg-emerald-500/20 text-emerald-200 ring-emerald-500/30',
    barClass: 'bg-emerald-500',
  },
];

const META_REGEX = /<!--sdmeta:([\s\S]*?)-->/;

export function emptyProjectCardMeta(): ProjectCardMeta {
  return { labels: [], checklist: [] };
}

export function parseProjectCardMeta(description?: string | null): ProjectCardMeta {
  if (!description) return emptyProjectCardMeta();
  const match = META_REGEX.exec(description);
  if (!match?.[1]) return emptyProjectCardMeta();

  try {
    const parsed = JSON.parse(match[1]) as Partial<ProjectCardMeta>;
    return {
      labels: Array.isArray(parsed.labels)
        ? parsed.labels.filter((item): item is ProjectLabelId =>
            PROJECT_LABEL_DEFS.some((def) => def.id === item)
          )
        : [],
      checklist: Array.isArray(parsed.checklist)
        ? parsed.checklist
            .filter((item) => item && typeof item.text === 'string')
            .map((item, index) => ({
              id: String(item.id ?? `chk-${index}-${Date.now()}`),
              text: String(item.text),
              done: Boolean(item.done),
            }))
        : [],
    };
  } catch {
    return emptyProjectCardMeta();
  }
}

export function stripProjectCardMeta(description?: string | null): string {
  if (!description) return '';
  return description.replace(META_REGEX, '').trimEnd();
}

export function embedProjectCardMeta(description: string, meta: ProjectCardMeta): string {
  const visible = stripProjectCardMeta(description).trim();
  const payload = JSON.stringify({
    labels: meta.labels,
    checklist: meta.checklist,
  });
  const block = `<!--sdmeta:${payload}-->`;
  return visible ? `${visible}\n\n${block}` : block;
}

export function getProjectLabelDef(id: ProjectLabelId): ProjectLabelDef {
  return PROJECT_LABEL_DEFS.find((item) => item.id === id) ?? PROJECT_LABEL_DEFS[0];
}

export function getChecklistProgress(meta: ProjectCardMeta): { done: number; total: number } {
  const total = meta.checklist.length;
  const done = meta.checklist.filter((item) => item.done).length;
  return { done, total };
}

export type ProjectTrelloFilterId = 'all' | 'mine' | 'overdue' | 'high-priority' | 'due-week';

export const PROJECT_TRELLO_FILTERS: Array<{ id: ProjectTrelloFilterId; label: string }> = [
  { id: 'all', label: 'Tumu' },
  { id: 'mine', label: 'Bana atanan' },
  { id: 'overdue', label: 'Gecikmis' },
  { id: 'high-priority', label: 'Yuksek oncelik' },
  { id: 'due-week', label: 'Bu hafta teslim' },
];

export function filterProjectsForTrello(
  rows: import('../api/salesdesk-api').SalesDeskTaskDto[],
  filterId: ProjectTrelloFilterId,
  currentUserId: number | null
): import('../api/salesdesk-api').SalesDeskTaskDto[] {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndKey = weekEnd.toISOString().slice(0, 10);

  return rows.filter((project) => {
    switch (filterId) {
      case 'mine':
        return currentUserId != null && project.assignedUserId === currentUserId;
      case 'overdue':
        return (
          Boolean(project.dueDate) &&
          project.dueDate!.slice(0, 10) < todayKey &&
          project.status !== 3 &&
          project.status !== 4
        );
      case 'high-priority':
        return project.priority >= 3;
      case 'due-week':
        if (!project.dueDate) return false;
        const due = project.dueDate.slice(0, 10);
        return due >= todayKey && due <= weekEndKey;
      default:
        return true;
    }
  });
}
