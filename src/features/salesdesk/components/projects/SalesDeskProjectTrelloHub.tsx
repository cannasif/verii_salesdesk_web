import { type ReactElement, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ArrowLeft, Eye, EyeOff, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SalesDeskTaskDto, SalesDeskTaskStatus } from '../../api/salesdesk-api';
import { sortProjectsInColumn } from '../../lib/salesdesk-project-card-order';
import {
  groupProjectsByStatus,
  groupProjectsByTeam,
  parseSalesDeskProjectTeam,
  type SalesDeskProjectTeamId,
} from '../../lib/salesdesk-project-tracking';
import {
  PROJECT_TRELLO_FILTERS,
  filterProjectsForTrello,
  type ProjectTrelloFilterId,
} from '../../lib/salesdesk-project-meta';
import {
  PROJECT_TRELLO_LISTS,
  PROJECT_TRELLO_TEAM_BOARDS,
  parseTrelloCardId,
  parseTrelloDropId,
} from '../../lib/salesdesk-project-trello-ui';
import { SalesDeskProjectTrelloCard } from './SalesDeskProjectTrelloCard';
import { SalesDeskProjectTrelloList } from './SalesDeskProjectTrelloList';

export interface ProjectTrelloMoveTarget {
  status: SalesDeskTaskStatus;
  teamId: SalesDeskProjectTeamId;
}

interface SalesDeskProjectTrelloHubProps {
  rows: SalesDeskTaskDto[];
  userNameById: Map<number, string>;
  currentUserId: number | null;
  onOpenProject: (project: SalesDeskTaskDto) => void;
  onMoveProject: (project: SalesDeskTaskDto, target: ProjectTrelloMoveTarget) => void | Promise<void>;
  onQuickAddProject: (
    title: string,
    teamId: SalesDeskProjectTeamId,
    status: SalesDeskTaskStatus
  ) => void | Promise<void>;
  onAddProject: (teamId: SalesDeskProjectTeamId) => void;
  isLoading?: boolean;
  isMoving?: boolean;
  filterId?: ProjectTrelloFilterId;
  onFilterChange?: (filterId: ProjectTrelloFilterId) => void;
  hideCompleted?: boolean;
  onHideCompletedChange?: (value: boolean) => void;
}

export function SalesDeskProjectTrelloHub({
  rows,
  userNameById,
  currentUserId,
  onOpenProject,
  onMoveProject,
  onQuickAddProject,
  onAddProject,
  isLoading = false,
  isMoving = false,
  filterId = 'all',
  onFilterChange,
  hideCompleted = false,
  onHideCompletedChange,
}: SalesDeskProjectTrelloHubProps): ReactElement {
  const [activeProject, setActiveProject] = useState<SalesDeskTaskDto | null>(null);
  const [focusedTeamId, setFocusedTeamId] = useState<SalesDeskProjectTeamId | null>(null);
  const [collapsedLists, setCollapsedLists] = useState<Record<string, boolean>>({});

  const filteredRows = useMemo(
    () => filterProjectsForTrello(rows, filterId, currentUserId),
    [rows, filterId, currentUserId]
  );

  const groupedByTeam = useMemo(() => groupProjectsByTeam(filteredRows), [filteredRows]);

  const visibleBoards = useMemo(
    () =>
      focusedTeamId
        ? PROJECT_TRELLO_TEAM_BOARDS.filter((board) => board.id === focusedTeamId)
        : PROJECT_TRELLO_TEAM_BOARDS,
    [focusedTeamId]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent): void => {
    const projectId = parseTrelloCardId(String(event.active.id));
    if (projectId == null) return;
    setActiveProject(rows.find((item) => item.id === projectId) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    setActiveProject(null);
    const projectId = parseTrelloCardId(String(event.active.id));
    const dropTarget = event.over ? parseTrelloDropId(String(event.over.id)) : null;
    if (projectId == null || !dropTarget) return;

    const project = rows.find((item) => item.id === projectId);
    if (!project) return;

    const currentTeam = parseSalesDeskProjectTeam(project.groupName);
    if (project.status === dropTarget.status && currentTeam === dropTarget.teamId) return;

    void onMoveProject(project, dropTarget);
  };

  const toggleListCollapse = (teamId: SalesDeskProjectTeamId, status: SalesDeskTaskStatus): void => {
    const key = `${teamId}:${status}`;
    setCollapsedLists((current) => ({ ...current, [key]: !current[key] }));
  };

  if (isLoading) {
    return (
      <div className={cn('grid min-h-[420px] gap-4', focusedTeamId ? 'grid-cols-1' : 'xl:grid-cols-3')}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="min-h-[420px] animate-pulse rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {PROJECT_TRELLO_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange?.(filter.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition',
              filterId === filter.id
                ? 'bg-[var(--crm-brand-soft)] text-[var(--crm-brand-text)] ring-[var(--crm-brand-primary)]/40'
                : 'bg-[var(--crm-app-panel-muted)] text-[var(--crm-app-text-muted)] ring-[var(--crm-app-border)] hover:text-slate-200'
            )}
          >
            {filter.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onHideCompletedChange?.(!hideCompleted)}
          className={cn(
            'ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition',
            hideCompleted
              ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
              : 'bg-[var(--crm-app-panel-muted)] text-[var(--crm-app-text-muted)] ring-[var(--crm-app-border)]'
          )}
        >
          {hideCompleted ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          Tamamlananlari gizle
        </button>
        {focusedTeamId ? (
          <button
            type="button"
            onClick={() => setFocusedTeamId(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--crm-app-panel-muted)] px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-[var(--crm-app-border)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tum panolara don
          </button>
        ) : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={cn('grid gap-5', focusedTeamId ? 'grid-cols-1' : 'xl:grid-cols-3')}>
          {visibleBoards.map((board) => {
            const teamProjects = groupedByTeam[board.id];
            const byStatus = groupProjectsByStatus(teamProjects);
            const Icon = board.icon;
            const visibleLists = PROJECT_TRELLO_LISTS.filter(
              (list) => !(hideCompleted && list.status === 3) && !(hideCompleted && list.status === 4)
            );

            return (
              <section
                key={board.id}
                className={cn(
                  'relative flex min-h-[540px] flex-col overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] shadow-lg shadow-black/10',
                  isMoving && 'pointer-events-none opacity-90'
                )}
              >
                <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b', board.headerGradient)} />

                <header className="relative border-b border-[var(--crm-app-border)] px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl ring-1', board.iconClassName)}>
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-50">{board.title}</h2>
                        <span className="rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-bold text-slate-200">
                          {teamProjects.length}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--crm-app-text-muted)]">{board.subtitle}</p>
                    </div>
                    {!focusedTeamId && (
                      <button
                        type="button"
                        onClick={() => setFocusedTeamId(board.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--crm-brand-accent)] transition hover:bg-[var(--crm-brand-soft)]"
                        title="Pane odakla"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddProject(board.id)}
                    className={cn(
                      'mt-3 w-full rounded-lg border border-dashed border-[var(--crm-app-border)] px-3 py-2 text-xs font-semibold transition hover:bg-[var(--crm-brand-soft)]',
                      board.accentClassName
                    )}
                  >
                    + Bu ekibe proje ekle
                  </button>
                </header>

                <div className="relative flex-1 overflow-x-auto p-4">
                  <div className="flex min-h-full gap-3">
                    {visibleLists.map((list) => {
                      const rawItems = byStatus[list.status];
                      const items = sortProjectsInColumn(rawItems, board.id, list.status);
                      const listKey = `${board.id}:${list.status}`;
                      const collapsed = collapsedLists[listKey] ?? false;

                      return (
                        <SalesDeskProjectTrelloList
                          key={list.status}
                          teamId={board.id}
                          list={list}
                          count={items.length}
                          collapsed={collapsed}
                          onToggleCollapse={() => toggleListCollapse(board.id, list.status)}
                          onQuickAdd={(title) => onQuickAddProject(title, board.id, list.status)}
                          quickAddDisabled={isMoving}
                        >
                          {items.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-[var(--crm-app-border)] px-2 py-6 text-center text-[10px] text-[var(--crm-app-text-muted)]">
                              Kart yok
                            </div>
                          ) : (
                            items.map((project) => (
                              <SalesDeskProjectTrelloCard
                                key={project.id}
                                project={project}
                                userNameById={userNameById}
                                onOpen={onOpenProject}
                              />
                            ))
                          )}
                        </SalesDeskProjectTrelloList>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <DragOverlay>
          {activeProject ? (
            <SalesDeskProjectTrelloCard
              project={activeProject}
              userNameById={userNameById}
              onOpen={() => undefined}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
