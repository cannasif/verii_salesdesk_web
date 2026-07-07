import { type ReactElement } from 'react';
import { Plus, Users, UsersRound } from 'lucide-react';
import {
  resolveActivityType,
  weeklyPlanCellKey,
  weeklyPlanGroupCellKey,
  type WeeklyDay,
  type WeeklyPlanAssignee,
  type WeeklyPlanIndex,
} from '../../lib/salesdesk-weekly-plan';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import type { SalesDeskUserOption } from '../../hooks/useSalesDeskModules';
import type { SalesDeskGroupDto } from '../../types/salesdesk-group-types';
import { cn } from '@/lib/utils';

const AVATAR_TONES = [
  'bg-indigo-500/20 text-indigo-300 ring-indigo-500/30',
  'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
  'bg-blue-500/20 text-blue-300 ring-blue-500/30',
  'bg-amber-500/20 text-amber-300 ring-amber-500/30',
  'bg-fuchsia-500/20 text-fuchsia-300 ring-fuchsia-500/30',
  'bg-rose-500/20 text-rose-300 ring-rose-500/30',
  'bg-sky-500/20 text-sky-300 ring-sky-500/30',
];

const GROUP_AVATAR_TONES = [
  'bg-violet-500/25 text-violet-200 ring-violet-500/35',
  'bg-teal-500/25 text-teal-200 ring-teal-500/35',
  'bg-orange-500/25 text-orange-200 ring-orange-500/35',
  'bg-pink-500/25 text-pink-200 ring-pink-500/35',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase('tr');
}

interface SalesDeskWeeklyPlanGridProps {
  users: SalesDeskUserOption[];
  groups: SalesDeskGroupDto[];
  weekDays: WeeklyDay[];
  planIndex: WeeklyPlanIndex;
  currentUserId?: number | null;
  onCellClick: (assignee: WeeklyPlanAssignee, dateKey: string, task: SalesDeskTaskDto | null) => void;
}

function PlanCell({
  task,
  day,
  onClick,
}: {
  task: SalesDeskTaskDto | null;
  day: WeeklyDay;
  onClick: () => void;
}): ReactElement {
  const activity = task ? resolveActivityType(task.title) : null;

  return (
    <td
      className={cn(
        'border-b border-r border-[var(--crm-app-border)] p-2 align-middle',
        day.isWeekend && 'bg-[color-mix(in_srgb,var(--crm-brand-secondary)_5%,transparent)]'
      )}
    >
      {task && activity ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold ring-1 transition-transform hover:scale-[1.03]',
            activity.chipClass
          )}
          title={task.description || activity.label}
        >
          <activity.icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{activity.label}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'flex min-h-[44px] w-full items-center justify-center rounded-lg px-2 py-2 text-[var(--crm-app-text-muted)]',
            'opacity-0 transition-opacity hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)] group-hover/row:opacity-100'
          )}
          aria-label="Gorev ekle"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </td>
  );
}

function MobileDayButton({
  day,
  task,
  onClick,
}: {
  day: WeeklyDay;
  task: SalesDeskTaskDto | null;
  onClick: () => void;
}): ReactElement {
  const activity = task ? resolveActivityType(task.title) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-[44px] flex-col items-start justify-center rounded-lg border px-2.5 py-2 text-left transition-colors',
        day.isToday
          ? 'border-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)] bg-[var(--crm-brand-soft)]/30'
          : 'border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/40 hover:bg-[var(--crm-brand-soft)]/20',
        day.isWeekend && 'opacity-90'
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{day.dayName}</span>
      <span className="text-[11px] font-medium text-[var(--crm-app-text-muted)]">{day.shortLabel}</span>
      {task && activity ? (
        <span className={cn('mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1', activity.chipClass)}>
          <activity.icon className="h-3 w-3" />
          {activity.label}
        </span>
      ) : (
        <span className="mt-1 text-[10px] font-medium text-[var(--crm-brand-accent)]">+ Ekle</span>
      )}
    </button>
  );
}

function MobileAssigneeCard({
  name,
  subtitle,
  avatarTone,
  weekDays,
  getTask,
  assignee,
  onCellClick,
}: {
  name: string;
  subtitle: string;
  avatarTone: string;
  weekDays: WeeklyDay[];
  getTask: (dateKey: string) => SalesDeskTaskDto | null;
  assignee: WeeklyPlanAssignee;
  onCellClick: SalesDeskWeeklyPlanGridProps['onCellClick'];
}): ReactElement {
  return (
    <article className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1',
            avatarTone
          )}
        >
          {getInitials(name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">{name}</p>
          <p className="text-[10px] font-medium text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {weekDays.map((day) => {
          const task = getTask(day.dateKey);
          return (
            <MobileDayButton
              key={day.dateKey}
              day={day}
              task={task}
              onClick={() => onCellClick(assignee, day.dateKey, task)}
            />
          );
        })}
      </div>
    </article>
  );
}

export function SalesDeskWeeklyPlanGrid({
  users,
  groups,
  weekDays,
  planIndex,
  currentUserId,
  onCellClick,
}: SalesDeskWeeklyPlanGridProps): ReactElement {
  return (
    <>
      <div className="space-y-3 lg:hidden">
        {users.map((user, rowIndex) => {
          const assignee: WeeklyPlanAssignee = { kind: 'user', id: user.id };
          const isCurrent = currentUserId != null && user.id === currentUserId;
          return (
            <MobileAssigneeCard
              key={`mobile-user-${user.id}`}
              name={user.name}
              subtitle={isCurrent ? 'Ben · Kisi' : 'Kisi'}
              avatarTone={AVATAR_TONES[rowIndex % AVATAR_TONES.length]}
              weekDays={weekDays}
              getTask={(dateKey) => planIndex.users.get(weeklyPlanCellKey(user.id, dateKey)) ?? null}
              assignee={assignee}
              onCellClick={onCellClick}
            />
          );
        })}

        {groups.length > 0 ? (
          <div className="flex items-center gap-2 px-1 pt-2 text-xs font-bold uppercase tracking-wide text-violet-200">
            <UsersRound className="h-3.5 w-3.5" />
            Gruplar
          </div>
        ) : null}

        {groups.map((group, rowIndex) => {
          const assignee: WeeklyPlanAssignee = { kind: 'group', id: group.id };
          return (
            <MobileAssigneeCard
              key={`mobile-group-${group.id}`}
              name={group.name}
              subtitle={`${group.memberCount} uye · Grup`}
              avatarTone={GROUP_AVATAR_TONES[rowIndex % GROUP_AVATAR_TONES.length]}
              weekDays={weekDays}
              getTask={(dateKey) => planIndex.groups.get(weeklyPlanGroupCellKey(group.id, dateKey)) ?? null}
              assignee={assignee}
              onCellClick={onCellClick}
            />
          );
        })}
      </div>

      <div className="custom-scrollbar hidden overflow-x-auto rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] shadow-sm lg:block">
        <table className="w-full min-w-[900px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-30 w-[200px] min-w-[200px] border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-brand-secondary)] px-4 py-3 text-left">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <Users className="h-4 w-4" />
                  Kisiler &amp; Gruplar
                </span>
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.dateKey}
                  className={cn(
                    'border-b border-r border-[var(--crm-app-border)] px-3 py-3 text-center',
                    day.isWeekend ? 'bg-[color-mix(in_srgb,var(--crm-brand-secondary)_10%,transparent)]' : 'bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_85%,transparent)]',
                    day.isToday && 'bg-[var(--crm-brand-soft)]'
                  )}
                >
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-200">{day.dayName}</div>
                  <div
                    className={cn(
                      'mt-0.5 text-[11px] font-medium',
                      day.isToday ? 'text-[var(--crm-brand-accent)]' : 'text-[var(--crm-app-text-muted)]'
                    )}
                  >
                    {day.shortLabel}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, rowIndex) => {
              const isCurrent = currentUserId != null && user.id === currentUserId;
              const assignee: WeeklyPlanAssignee = { kind: 'user', id: user.id };

              return (
                <tr key={`user-${user.id}`} className="group/row">
                  <td
                    className={cn(
                      'sticky left-0 z-20 border-b border-r border-[var(--crm-app-border)] px-4 py-3',
                      'bg-[var(--crm-app-list-card)] shadow-[4px_0_12px_-6px_rgba(0,0,0,0.25)]',
                      isCurrent && 'bg-[var(--crm-brand-soft)]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1',
                          AVATAR_TONES[rowIndex % AVATAR_TONES.length]
                        )}
                      >
                        {getInitials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-100">{user.name}</p>
                        {isCurrent ? (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--crm-brand-accent)]">
                            Ben
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Kisi</span>
                        )}
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const task = planIndex.users.get(weeklyPlanCellKey(user.id, day.dateKey)) ?? null;
                    return (
                      <PlanCell
                        key={day.dateKey}
                        task={task}
                        day={day}
                        onClick={() => onCellClick(assignee, day.dateKey, task)}
                      />
                    );
                  })}
                </tr>
              );
            })}

            {groups.length > 0 ? (
              <tr>
                <td
                  colSpan={weekDays.length + 1}
                  className="border-b border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-brand-secondary)_18%,transparent)] px-4 py-2"
                >
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-violet-200">
                    <UsersRound className="h-3.5 w-3.5" />
                    Gruplar
                  </span>
                </td>
              </tr>
            ) : null}

            {groups.map((group, rowIndex) => {
              const assignee: WeeklyPlanAssignee = { kind: 'group', id: group.id };

              return (
                <tr key={`group-${group.id}`} className="group/row">
                  <td
                    className={cn(
                      'sticky left-0 z-20 border-b border-r border-[var(--crm-app-border)] px-4 py-3',
                      'bg-[color-mix(in_srgb,var(--crm-brand-secondary)_8%,var(--crm-app-list-card))] shadow-[4px_0_12px_-6px_rgba(0,0,0,0.25)]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1',
                          GROUP_AVATAR_TONES[rowIndex % GROUP_AVATAR_TONES.length]
                        )}
                      >
                        {getInitials(group.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-100">{group.name}</p>
                        <span className="text-[10px] font-medium text-violet-300/90">
                          {group.memberCount} uye
                        </span>
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const task = planIndex.groups.get(weeklyPlanGroupCellKey(group.id, day.dateKey)) ?? null;
                    return (
                      <PlanCell
                        key={day.dateKey}
                        task={task}
                        day={day}
                        onClick={() => onCellClick(assignee, day.dateKey, task)}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
