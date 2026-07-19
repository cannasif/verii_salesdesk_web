import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  MapPin,
  Package,
  Umbrella,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { SalesDeskTaskDto } from '../api/salesdesk-api';

/** Haftalik plan gorevlerini normal gorevlerden ayiran grup etiketi. */
export const WEEKLY_PLAN_GROUP = 'HaftalikPlan';

/** Grup satirina atanmis haftalik plan gorevleri icin groupName oneki. */
export const WEEKLY_PLAN_GROUP_ASSIGNEE_PREFIX = `${WEEKLY_PLAN_GROUP}|g|`;

export type WeeklyPlanAssignee =
  | { kind: 'user'; id: number }
  | { kind: 'group'; id: number };

export interface WeeklyPlanIndex {
  users: Map<string, SalesDeskTaskDto[]>;
  groups: Map<string, SalesDeskTaskDto[]>;
}

export function weeklyPlanGroupAssigneeTag(groupId: number): string {
  return `${WEEKLY_PLAN_GROUP_ASSIGNEE_PREFIX}${groupId}`;
}

export function parseWeeklyPlanGroupAssignee(groupName?: string | null): number | null {
  if (!groupName?.startsWith(WEEKLY_PLAN_GROUP_ASSIGNEE_PREFIX)) return null;
  const id = Number(groupName.slice(WEEKLY_PLAN_GROUP_ASSIGNEE_PREFIX.length));
  return Number.isFinite(id) && id > 0 ? Math.trunc(id) : null;
}

export function isWeeklyPlanTask(task: SalesDeskTaskDto): boolean {
  if (task.groupName === WEEKLY_PLAN_GROUP) return true;
  return parseWeeklyPlanGroupAssignee(task.groupName) != null;
}

export function weeklyPlanAssigneeKey(assignee: WeeklyPlanAssignee): string {
  return assignee.kind === 'user' ? `u:${assignee.id}` : `g:${assignee.id}`;
}

export function weeklyPlanGroupCellKey(groupId: number, dateKey: string): string {
  return `${groupId}|${dateKey}`;
}

export interface WeeklyActivityType {
  value: string;
  label: string;
  icon: LucideIcon;
  /** Chip renk tonu — salesdesk-shell override'larina takilmayan guvenli paletler. */
  chipClass: string;
  dotClass: string;
}

export const WEEKLY_ACTIVITY_TYPES: WeeklyActivityType[] = [
  {
    value: 'Toplanti',
    label: 'Toplanti',
    icon: Users,
    chipClass: 'bg-indigo-500/12 text-indigo-300 ring-indigo-500/30',
    dotClass: 'bg-indigo-400',
  },
  {
    value: 'Saha Ziyareti',
    label: 'Saha Ziyareti',
    icon: MapPin,
    chipClass: 'bg-emerald-500/12 text-emerald-300 ring-emerald-500/30',
    dotClass: 'bg-emerald-400',
  },
  {
    value: 'Rapor',
    label: 'Rapor',
    icon: FileText,
    chipClass: 'bg-amber-500/12 text-amber-300 ring-amber-500/30',
    dotClass: 'bg-amber-400',
  },
  {
    value: 'Kontrol',
    label: 'Kontrol',
    icon: ClipboardCheck,
    chipClass: 'bg-sky-500/12 text-sky-300 ring-sky-500/30',
    dotClass: 'bg-sky-400',
  },
  {
    value: 'Planlama',
    label: 'Planlama',
    icon: CalendarDays,
    chipClass: 'bg-blue-500/12 text-blue-300 ring-blue-500/30',
    dotClass: 'bg-blue-400',
  },
  {
    value: 'Teslim',
    label: 'Teslim',
    icon: Package,
    chipClass: 'bg-fuchsia-500/12 text-fuchsia-300 ring-fuchsia-500/30',
    dotClass: 'bg-fuchsia-400',
  },
  {
    value: 'Izin',
    label: 'Izin',
    icon: Umbrella,
    chipClass: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
    dotClass: 'bg-slate-400',
  },
];

const DEFAULT_ACTIVITY: WeeklyActivityType = {
  value: '',
  label: '',
  icon: ClipboardCheck,
  chipClass: 'bg-[var(--crm-brand-soft)] text-[var(--crm-brand-on-soft)] ring-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)]',
  dotClass: 'bg-[var(--crm-brand-primary)]',
};

export function resolveActivityType(title?: string | null): WeeklyActivityType {
  if (!title) return DEFAULT_ACTIVITY;
  const match = WEEKLY_ACTIVITY_TYPES.find(
    (item) => item.value.toLocaleLowerCase('tr') === title.trim().toLocaleLowerCase('tr')
  );
  return match ?? { ...DEFAULT_ACTIVITY, value: title, label: title };
}

const TR_DAY_NAMES = ['Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi', 'Pazar'];
const TR_MONTH_NAMES = [
  'Ocak',
  'Subat',
  'Mart',
  'Nisan',
  'Mayis',
  'Haziran',
  'Temmuz',
  'Agustos',
  'Eylul',
  'Ekim',
  'Kasim',
  'Aralik',
];

export interface WeeklyDay {
  /** yyyy-mm-dd */
  dateKey: string;
  dayName: string;
  /** 29.06 */
  shortLabel: string;
  isToday: boolean;
  isWeekend: boolean;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Verilen tarihin icinde bulundugu haftanin Pazartesi'sini dondurur. */
export function getWeekStart(reference: Date = new Date()): Date {
  const date = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const day = date.getDay(); // 0=Pazar ... 6=Cumartesi
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function buildWeekDays(weekStart: Date): WeeklyDay[] {
  const todayKey = toDateKey(new Date());
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const dateKey = toDateKey(date);
    return {
      dateKey,
      dayName: TR_DAY_NAMES[index],
      shortLabel: `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`,
      isToday: dateKey === todayKey,
      isWeekend: index >= 5,
    } satisfies WeeklyDay;
  });
}

export function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const startLabel = `${weekStart.getDate()} ${TR_MONTH_NAMES[weekStart.getMonth()]}`;
  const endLabel = `${end.getDate()} ${TR_MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
  return `${startLabel} – ${endLabel}`;
}

/** Kullanici / grup adlarini her kelimenin ilk harfi buyuk olacak sekilde gosterir. */
export function formatWeeklyPlanDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR');
    })
    .join(' ');
}

export function getWeeklyPlanTaskTimeLabel(dueDate?: string | null): string | null {
  if (!dueDate?.includes('T')) return null;
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) return null;
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

const WEEKLY_PLAN_ATTENDEES_MARKER = /^\[\[wpa:([\d,]+)\]\]\n?/;

export function parseWeeklyPlanAttendeeIds(task: SalesDeskTaskDto): number[] {
  const description = task.description ?? '';
  const match = description.match(WEEKLY_PLAN_ATTENDEES_MARKER);
  if (match?.[1]) {
    const ids = match[1]
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((id) => Number.isFinite(id) && id > 0);
    if (ids.length > 0) return [...new Set(ids)];
  }
  if (task.assignedUserId && task.assignedUserId > 0) {
    return [task.assignedUserId];
  }
  return [];
}

export function stripWeeklyPlanAttendeesMarker(description?: string | null): string {
  if (!description) return '';
  return description.replace(WEEKLY_PLAN_ATTENDEES_MARKER, '').trim();
}

export function buildWeeklyPlanDescription(attendeeIds: number[], note: string): string | undefined {
  const uniqueIds = [...new Set(attendeeIds.filter((id) => Number.isFinite(id) && id > 0))];
  const trimmedNote = note.trim();
  if (uniqueIds.length === 0 && !trimmedNote) return undefined;
  if (uniqueIds.length === 0) return trimmedNote || undefined;
  const marker = `[[wpa:${uniqueIds.join(',')}]]`;
  return trimmedNote ? `${marker}\n${trimmedNote}` : marker;
}

export function formatWeeklyPlanAttendeeNames(
  attendeeIds: number[],
  users: Array<{ id: number; name: string }>
): string {
  const names = attendeeIds
    .map((id) => users.find((user) => user.id === id)?.name)
    .filter((name): name is string => Boolean(name?.trim()))
    .map((name) => formatWeeklyPlanDisplayName(name));
  return names.length > 0 ? names.join(', ') : '-';
}

function pushWeeklyPlanTask(
  map: Map<string, SalesDeskTaskDto[]>,
  key: string,
  task: SalesDeskTaskDto
): void {
  const existing = map.get(key);
  if (existing) {
    existing.push(task);
    return;
  }
  map.set(key, [task]);
}

/** Kullanici ve grup satirlari icin (id|dateKey) -> gorev listeleri olusturur. */
export function buildWeeklyPlanIndex(tasks: SalesDeskTaskDto[]): WeeklyPlanIndex {
  const users = new Map<string, SalesDeskTaskDto[]>();
  const groups = new Map<string, SalesDeskTaskDto[]>();

  tasks.forEach((task) => {
    if (!task.dueDate) return;
    const dateKey = task.dueDate.slice(0, 10);
    const groupId = parseWeeklyPlanGroupAssignee(task.groupName);
    if (groupId != null) {
      pushWeeklyPlanTask(groups, weeklyPlanGroupCellKey(groupId, dateKey), task);
      return;
    }
    if (task.groupName === WEEKLY_PLAN_GROUP && task.assignedUserId) {
      const attendeeIds = parseWeeklyPlanAttendeeIds(task);
      const targetUserIds = attendeeIds.length > 0 ? attendeeIds : [task.assignedUserId];
      targetUserIds.forEach((userId) => {
        pushWeeklyPlanTask(users, weeklyPlanCellKey(userId, dateKey), task);
      });
    }
  });

  const sortById = (list: SalesDeskTaskDto[]): SalesDeskTaskDto[] =>
    [...list].sort((a, b) => a.id - b.id);

  users.forEach((list, key) => users.set(key, sortById(list)));
  groups.forEach((list, key) => groups.set(key, sortById(list)));

  return { users, groups };
}

export function weeklyPlanCellKey(userId: number, dateKey: string): string {
  return `${userId}|${dateKey}`;
}
