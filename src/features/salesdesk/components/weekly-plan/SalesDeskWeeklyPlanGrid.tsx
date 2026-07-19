import { type ReactElement } from 'react';
import { Plus, Users, UsersRound } from 'lucide-react';
import {
  formatWeeklyPlanAttendeeNames,
  formatWeeklyPlanDisplayName,
  getWeeklyPlanTaskTimeLabel,
  parseWeeklyPlanAttendeeIds,
  resolveActivityType,
  stripWeeklyPlanAttendeesMarker,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

const TABLE_COLUMN_COUNT = 8;

const WEEKLY_PLAN_TOOLTIP_CLASS =
  'z-[100] max-w-[300px] border border-slate-300/80 bg-white px-4 py-3.5 text-slate-900 shadow-2xl dark:border-slate-500 dark:bg-slate-950 dark:text-slate-50';

function getInitials(name: string): string {
  const displayName = formatWeeklyPlanDisplayName(name);
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr');
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase('tr');
}

function resolveAttendeeLabel(
  assignee: WeeklyPlanAssignee,
  users: SalesDeskUserOption[],
  groups: SalesDeskGroupDto[]
): string {
  if (assignee.kind === 'user') {
    const user = users.find((item) => item.id === assignee.id);
    return user ? formatWeeklyPlanDisplayName(user.name) : 'Kisi';
  }
  const group = groups.find((item) => item.id === assignee.id);
  if (!group) return 'Grup';
  const memberNames = group.memberUserIds
    .map((userId) => users.find((item) => item.id === userId)?.name)
    .filter((name): name is string => Boolean(name?.trim()))
    .map((name) => formatWeeklyPlanDisplayName(name));
  if (memberNames.length === 0) {
    return formatWeeklyPlanDisplayName(group.name);
  }
  return memberNames.join(', ');
}

interface SalesDeskWeeklyPlanGridProps {
  users: SalesDeskUserOption[];
  groups: SalesDeskGroupDto[];
  weekDays: WeeklyDay[];
  planIndex: WeeklyPlanIndex;
  currentUserId?: number | null;
  onCellClick: (assignee: WeeklyPlanAssignee, dateKey: string, task: SalesDeskTaskDto | null) => void;
}

function WeeklyPlanTaskTooltipContent({
  task,
  users,
  attendeeLabelFallback,
}: {
  task: SalesDeskTaskDto;
  users: SalesDeskUserOption[];
  attendeeLabelFallback?: string;
}): ReactElement {
  const activity = resolveActivityType(task.title);
  const timeLabel = getWeeklyPlanTaskTimeLabel(task.dueDate);
  const attendeeIds = parseWeeklyPlanAttendeeIds(task);
  const attendeeLabel =
    attendeeIds.length > 0
      ? formatWeeklyPlanAttendeeNames(attendeeIds, users)
      : attendeeLabelFallback ?? '-';
  const note = stripWeeklyPlanAttendeesMarker(task.description);

  return (
    <div className="space-y-2.5 text-left">
      <p className="text-sm font-bold leading-snug text-slate-900 dark:text-white">{activity.label}</p>
      {timeLabel ? (
        <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-100">
          <span className="font-semibold text-slate-900 dark:text-white">Saat: </span>
          {timeLabel}
        </p>
      ) : null}
      <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-100">
        <span className="font-semibold text-slate-900 dark:text-white">Kimler: </span>
        {attendeeLabel}
      </p>
      {task.customerName?.trim() ? (
        <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-100">
          <span className="font-semibold text-slate-900 dark:text-white">Cari: </span>
          {task.customerName.trim()}
        </p>
      ) : null}
      {note ? (
        <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-100">
          <span className="font-semibold text-slate-900 dark:text-white">Not: </span>
          {note}
        </p>
      ) : null}
    </div>
  );
}

function WeeklyPlanEventChip({
  task,
  users,
  attendeeLabelFallback,
  onClick,
}: {
  task: SalesDeskTaskDto;
  users: SalesDeskUserOption[];
  attendeeLabelFallback?: string;
  onClick: () => void;
}): ReactElement {
  const activity = resolveActivityType(task.title);

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'flex min-h-[36px] w-full items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-[11px] font-semibold ring-1 transition-transform hover:scale-[1.02]',
            activity.chipClass
          )}
        >
          <activity.icon className="h-3 w-3 shrink-0" />
          <span className="truncate">{activity.label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className={WEEKLY_PLAN_TOOLTIP_CLASS}>
        <WeeklyPlanTaskTooltipContent
          task={task}
          users={users}
          attendeeLabelFallback={attendeeLabelFallback}
        />
      </TooltipContent>
    </Tooltip>
  );
}

function PlanCell({
  tasks,
  day,
  attendeeLabelFallback,
  users,
  onEditTask,
  onAddTask,
}: {
  tasks: SalesDeskTaskDto[];
  day: WeeklyDay;
  attendeeLabelFallback: string;
  users: SalesDeskUserOption[];
  onEditTask: (task: SalesDeskTaskDto) => void;
  onAddTask: () => void;
}): ReactElement {
  const hasTasks = tasks.length > 0;

  return (
    <td
      className={cn(
        'border-b border-r border-[var(--crm-app-border)] p-1.5 align-top',
        day.isWeekend && 'bg-[color-mix(in_srgb,var(--crm-brand-secondary)_5%,transparent)]'
      )}
    >
      <div className="flex min-h-[52px] flex-col gap-1">
        {tasks.map((task) => (
          <WeeklyPlanEventChip
            key={task.id}
            task={task}
            users={users}
            attendeeLabelFallback={attendeeLabelFallback}
            onClick={() => onEditTask(task)}
          />
        ))}
        <button
          type="button"
          onClick={onAddTask}
          className={cn(
            'flex min-h-[32px] w-full items-center justify-center rounded-lg px-2 py-1 text-[var(--crm-app-text-muted)]',
            hasTasks
              ? 'border border-dashed border-[var(--crm-app-border)] hover:border-[var(--crm-brand-accent)] hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]'
              : cn(
                  'opacity-0 transition-opacity hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)] group-hover/row:opacity-100'
                )
          )}
          aria-label={hasTasks ? 'Baska etkinlik ekle' : 'Etkinlik ekle'}
          title={hasTasks ? 'Baska etkinlik ekle' : 'Etkinlik ekle'}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </td>
  );
}

function MobileDayButton({
  day,
  tasks,
  attendeeLabelFallback,
  users,
  onEditTask,
  onAddTask,
}: {
  day: WeeklyDay;
  tasks: SalesDeskTaskDto[];
  attendeeLabelFallback: string;
  users: SalesDeskUserOption[];
  onEditTask: (task: SalesDeskTaskDto) => void;
  onAddTask: () => void;
}): ReactElement {
  return (
    <div
      className={cn(
        'flex min-h-[44px] flex-col gap-1 rounded-lg border px-2.5 py-2',
        day.isToday
          ? 'border-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)] bg-[var(--crm-brand-soft)]/30'
          : 'border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/40',
        day.isWeekend && 'opacity-90'
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{day.dayName}</span>
          <span className="ml-1 text-[11px] font-medium text-[var(--crm-app-text-muted)]">{day.shortLabel}</span>
        </div>
        <button
          type="button"
          onClick={onAddTask}
          className="rounded-md p-1 text-[var(--crm-brand-accent)] hover:bg-[var(--crm-brand-soft)]"
          aria-label="Etkinlik ekle"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {tasks.length === 0 ? (
        <span className="text-[10px] font-medium text-[var(--crm-app-text-muted)]">Etkinlik yok</span>
      ) : (
        tasks.map((task) => {
          const activity = resolveActivityType(task.title);
          return (
            <Tooltip key={task.id} delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onEditTask(task)}
                  className={cn(
                    'inline-flex w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1',
                    activity.chipClass
                  )}
                >
                  <activity.icon className="h-3 w-3" />
                  <span className="truncate text-left">{activity.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className={WEEKLY_PLAN_TOOLTIP_CLASS}>
                <WeeklyPlanTaskTooltipContent
                  task={task}
                  users={users}
                  attendeeLabelFallback={attendeeLabelFallback}
                />
              </TooltipContent>
            </Tooltip>
          );
        })
      )}
    </div>
  );
}

function MobileAssigneeCard({
  name,
  subtitle,
  avatarTone,
  weekDays,
  getTasks,
  assignee,
  users,
  groups,
  onCellClick,
}: {
  name: string;
  subtitle: string;
  avatarTone: string;
  weekDays: WeeklyDay[];
  getTasks: (dateKey: string) => SalesDeskTaskDto[];
  assignee: WeeklyPlanAssignee;
  users: SalesDeskUserOption[];
  groups: SalesDeskGroupDto[];
  onCellClick: SalesDeskWeeklyPlanGridProps['onCellClick'];
}): ReactElement {
  const displayName = formatWeeklyPlanDisplayName(name);
  const attendeeLabelFallback = resolveAttendeeLabel(assignee, users, groups);

  return (
    <article className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1',
            avatarTone
          )}
        >
          {getInitials(displayName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">{displayName}</p>
          <p className="text-[10px] font-medium text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {weekDays.map((day) => {
          const tasks = getTasks(day.dateKey);
          return (
            <MobileDayButton
              key={day.dateKey}
              day={day}
              tasks={tasks}
              attendeeLabelFallback={attendeeLabelFallback}
              users={users}
              onEditTask={(task) => onCellClick(assignee, day.dateKey, task)}
              onAddTask={() => onCellClick(assignee, day.dateKey, null)}
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
    <TooltipProvider delayDuration={200}>
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
              getTasks={(dateKey) => planIndex.users.get(weeklyPlanCellKey(user.id, dateKey)) ?? []}
              assignee={assignee}
              users={users}
              groups={groups}
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
              getTasks={(dateKey) => planIndex.groups.get(weeklyPlanGroupCellKey(group.id, dateKey)) ?? []}
              assignee={assignee}
              users={users}
              groups={groups}
              onCellClick={onCellClick}
            />
          );
        })}
      </div>

      <div className="custom-scrollbar hidden overflow-x-auto rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] shadow-sm lg:block">
        <table className="w-full min-w-[960px] table-fixed border-separate border-spacing-0">
          <colgroup>
            {Array.from({ length: TABLE_COLUMN_COUNT }).map((_, index) => (
              <col key={`col-${index}`} style={{ width: `${100 / TABLE_COLUMN_COUNT}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="sticky left-0 z-30 border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-brand-secondary)] px-3 py-3 text-left">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="truncate">Kisiler &amp; Gruplar</span>
                </span>
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.dateKey}
                  className={cn(
                    'border-b border-r border-[var(--crm-app-border)] px-2 py-3 text-center',
                    day.isWeekend
                      ? 'bg-[color-mix(in_srgb,var(--crm-brand-secondary)_10%,transparent)]'
                      : 'bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_85%,transparent)]',
                    day.isToday && 'bg-[var(--crm-brand-soft)]'
                  )}
                >
                  <div className="truncate text-xs font-bold uppercase tracking-wide text-slate-200">{day.dayName}</div>
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
              const displayName = formatWeeklyPlanDisplayName(user.name);
              const attendeeLabelFallback = resolveAttendeeLabel(assignee, users, groups);

              return (
                <tr key={`user-${user.id}`} className="group/row">
                  <td
                    className={cn(
                      'sticky left-0 z-20 border-b border-r border-[var(--crm-app-border)] px-3 py-3',
                      'bg-[var(--crm-app-list-card)] shadow-[4px_0_12px_-6px_rgba(0,0,0,0.25)]',
                      isCurrent && 'bg-[var(--crm-brand-soft)]'
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1',
                          AVATAR_TONES[rowIndex % AVATAR_TONES.length]
                        )}
                      >
                        {getInitials(displayName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-100">{displayName}</p>
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
                    const tasks = planIndex.users.get(weeklyPlanCellKey(user.id, day.dateKey)) ?? [];
                    return (
                      <PlanCell
                        key={day.dateKey}
                        tasks={tasks}
                        day={day}
                        attendeeLabelFallback={attendeeLabelFallback}
                        users={users}
                        onEditTask={(task) => onCellClick(assignee, day.dateKey, task)}
                        onAddTask={() => onCellClick(assignee, day.dateKey, null)}
                      />
                    );
                  })}
                </tr>
              );
            })}

            {groups.length > 0 ? (
              <tr>
                <td
                  colSpan={TABLE_COLUMN_COUNT}
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
              const displayName = formatWeeklyPlanDisplayName(group.name);
              const attendeeLabelFallback = resolveAttendeeLabel(assignee, users, groups);

              return (
                <tr key={`group-${group.id}`} className="group/row">
                  <td
                    className={cn(
                      'sticky left-0 z-20 border-b border-r border-[var(--crm-app-border)] px-3 py-3',
                      'bg-[color-mix(in_srgb,var(--crm-brand-secondary)_8%,var(--crm-app-list-card))] shadow-[4px_0_12px_-6px_rgba(0,0,0,0.25)]'
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1',
                          GROUP_AVATAR_TONES[rowIndex % GROUP_AVATAR_TONES.length]
                        )}
                      >
                        {getInitials(displayName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-100">{displayName}</p>
                        <span className="text-[10px] font-medium text-violet-300/90">{group.memberCount} uye</span>
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const tasks = planIndex.groups.get(weeklyPlanGroupCellKey(group.id, day.dateKey)) ?? [];
                    return (
                      <PlanCell
                        key={day.dateKey}
                        tasks={tasks}
                        day={day}
                        attendeeLabelFallback={attendeeLabelFallback}
                        users={users}
                        onEditTask={(task) => onCellClick(assignee, day.dateKey, task)}
                        onAddTask={() => onCellClick(assignee, day.dateKey, null)}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
