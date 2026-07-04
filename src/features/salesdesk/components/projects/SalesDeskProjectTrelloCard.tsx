import { type ReactElement } from 'react';
import { CalendarDays, CheckSquare, GripVertical, UserRound } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import { formatDate } from '../../lib/salesdesk-shared';
import {
  getSalesDeskProjectPhaseLabel,
  isProjectTaskOverdue,
  parseSalesDeskProjectPhase,
} from '../../lib/salesdesk-project-tracking';
import {
  getChecklistProgress,
  getProjectLabelDef,
  parseProjectCardMeta,
} from '../../lib/salesdesk-project-meta';
import { buildTrelloCardId } from '../../lib/salesdesk-project-trello-ui';
import { PriorityBadge } from '../pages/salesdesk-badges';

interface SalesDeskProjectTrelloCardProps {
  project: SalesDeskTaskDto;
  userNameById: Map<number, string>;
  onOpen: (project: SalesDeskTaskDto) => void;
  isDragOverlay?: boolean;
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return `${parts[0][0]}${parts[1][0]}`.toLocaleUpperCase('tr');
}

export function SalesDeskProjectTrelloCard({
  project,
  userNameById,
  onOpen,
  isDragOverlay = false,
}: SalesDeskProjectTrelloCardProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: buildTrelloCardId(project.id),
    data: { project },
  });

  const phase = parseSalesDeskProjectPhase(project.groupName);
  const overdue = isProjectTaskOverdue(project);
  const meta = parseProjectCardMeta(project.description);
  const checklist = getChecklistProgress(meta);
  const assigneeName = project.assignedUserId
    ? userNameById.get(project.assignedUserId) ?? `#${project.assignedUserId}`
    : null;

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <article
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        'overflow-hidden rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] shadow-sm transition',
        !isDragOverlay && 'hover:border-[var(--crm-brand-accent)]/35 hover:shadow-md',
        isDragging && !isDragOverlay && 'opacity-40',
        isDragOverlay && 'rotate-1 shadow-2xl ring-2 ring-[var(--crm-brand-accent)]/40',
        overdue && 'border-rose-400/35'
      )}
    >
      {meta.labels.length > 0 && (
        <div className="flex gap-1 px-2 pt-2">
          {meta.labels.slice(0, 4).map((labelId) => (
            <span
              key={labelId}
              className={cn('h-1.5 flex-1 rounded-full', getProjectLabelDef(labelId).barClass)}
              title={getProjectLabelDef(labelId).label}
            />
          ))}
        </div>
      )}

      <div className="flex items-start gap-2 p-3 pt-2">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab touch-none text-[var(--crm-app-text-muted)] active:cursor-grabbing"
          aria-label="Surukle"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen(project)}>
          <div className="mb-1 flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-semibold text-slate-100">{project.title}</p>
            <PriorityBadge priority={project.priority} />
          </div>

          {meta.labels.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {meta.labels.map((labelId) => (
                <span
                  key={labelId}
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1',
                    getProjectLabelDef(labelId).chipClass
                  )}
                >
                  {getProjectLabelDef(labelId).label}
                </span>
              ))}
            </div>
          )}

          {phase ? (
            <p className="mb-2 text-[11px] font-medium text-indigo-300">{getSalesDeskProjectPhaseLabel(phase)}</p>
          ) : null}

          {checklist.total > 0 && (
            <div className="mb-2 flex items-center gap-1.5 text-[11px] text-emerald-300">
              <CheckSquare className="h-3.5 w-3.5" />
              <span>
                {checklist.done}/{checklist.total} tamam
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${Math.round((checklist.done / checklist.total) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-xs text-[var(--crm-app-text-muted)]">
            <div className="flex min-w-0 items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className={cn('truncate', overdue && 'font-semibold text-rose-300')}>
                {formatDate(project.dueDate)}
              </span>
            </div>
            {assigneeName ? (
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-200"
                title={assigneeName}
              >
                {userInitials(assigneeName)}
              </span>
            ) : (
              <UserRound className="h-3.5 w-3.5 shrink-0 opacity-50" />
            )}
          </div>
        </button>
      </div>
    </article>
  );
}
