import { type ReactElement, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { SalesDeskTaskStatus } from '../../api/salesdesk-api';
import type { SalesDeskProjectTeamId } from '../../lib/salesdesk-project-tracking';
import { buildTrelloDropId, type ProjectTrelloListDef } from '../../lib/salesdesk-project-trello-ui';
import { SalesDeskProjectTrelloQuickAdd } from './SalesDeskProjectTrelloQuickAdd';

interface SalesDeskProjectTrelloListProps {
  teamId: SalesDeskProjectTeamId;
  list: ProjectTrelloListDef;
  count: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onQuickAdd?: (title: string) => void | Promise<void>;
  quickAddDisabled?: boolean;
  children: ReactNode;
}

export function SalesDeskProjectTrelloList({
  teamId,
  list,
  count,
  collapsed = false,
  onToggleCollapse,
  onQuickAdd,
  quickAddDisabled = false,
  children,
}: SalesDeskProjectTrelloListProps): ReactElement {
  const dropId = buildTrelloDropId(teamId, list.status as SalesDeskTaskStatus);
  const { setNodeRef, isOver } = useDroppable({ id: dropId });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--crm-app-border)] bg-gradient-to-b to-transparent transition',
        list.dropClass,
        collapsed ? 'w-[52px]' : 'w-[220px]',
        isOver && 'ring-2 ring-[var(--crm-brand-accent)]/50'
      )}
    >
      <header
        className={cn(
          'flex items-center justify-between border-b px-2 py-2.5 text-xs font-semibold uppercase tracking-wide',
          list.headerClass
        )}
      >
        {collapsed ? (
          <button
            type="button"
            className="mx-auto flex flex-col items-center gap-1"
            onClick={onToggleCollapse}
            title={list.title}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="text-[10px]">{count}</span>
          </button>
        ) : (
          <>
            <button type="button" className="flex items-center gap-1" onClick={onToggleCollapse}>
              <ChevronDown className="h-3.5 w-3.5" />
              <span>{list.title}</span>
            </button>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px]">{count}</span>
          </>
        )}
      </header>

      {!collapsed && (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
          {children}
          {onQuickAdd ? (
            <SalesDeskProjectTrelloQuickAdd onAdd={onQuickAdd} disabled={quickAddDisabled} />
          ) : null}
        </div>
      )}
    </section>
  );
}
