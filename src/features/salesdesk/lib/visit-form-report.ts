import type { SalesDeskVisitFormDto } from '../api/salesdesk-api';
import type { SalesDeskUserOption } from '../hooks/useSalesDeskModules';
import { getVisitFormVisitorName } from './visit-form-content';
import {
  addDays,
  buildWeekDays,
  formatWeeklyPlanDisplayName,
  getWeekStart,
  type WeeklyDay,
} from './salesdesk-weekly-plan';

export type VisitFormReportPeriod = 'week' | 'month';

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

export interface VisitFormReportEntry {
  form: SalesDeskVisitFormDto;
  visitorKey: string;
  visitorName: string;
  dateKey: string;
  customerKey: string;
  customerName: string;
}

export interface VisitFormCustomerSummary {
  customerKey: string;
  customerName: string;
  count: number;
  lastDateKey: string;
}

export interface VisitFormVisitorRow {
  visitorKey: string;
  visitorName: string;
  userId?: number;
  totalVisits: number;
  uniqueCustomers: number;
  byDate: Map<string, VisitFormReportEntry[]>;
  byCustomer: Map<string, VisitFormCustomerSummary>;
}

export interface VisitFormReportSummary {
  totalVisits: number;
  uniqueVisitors: number;
  uniqueCustomers: number;
  avgVisitsPerVisitor: number;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase('tr-TR');
}

export function getMonthStart(reference: Date = new Date()): Date {
  return new Date(reference.getFullYear(), reference.getMonth(), 1);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function getMonthEnd(monthStart: Date): Date {
  return new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
}

export function formatMonthRange(monthStart: Date): string {
  return `${TR_MONTH_NAMES[monthStart.getMonth()]} ${monthStart.getFullYear()}`;
}

export function buildReportDateRange(
  period: VisitFormReportPeriod,
  anchor: Date
): { startKey: string; endKey: string; weekDays?: WeeklyDay[] } {
  if (period === 'week') {
    const weekStart = getWeekStart(anchor);
    const weekEnd = addDays(weekStart, 6);
    return {
      startKey: toDateKey(weekStart),
      endKey: toDateKey(weekEnd),
      weekDays: buildWeekDays(weekStart),
    };
  }

  const monthStart = getMonthStart(anchor);
  const monthEnd = getMonthEnd(monthStart);
  return {
    startKey: toDateKey(monthStart),
    endKey: toDateKey(monthEnd),
  };
}

export function isDateKeyInRange(dateKey: string, startKey: string, endKey: string): boolean {
  return dateKey >= startKey && dateKey <= endKey;
}

export function filterVisitFormsByDateRange(
  forms: SalesDeskVisitFormDto[],
  startKey: string,
  endKey: string
): SalesDeskVisitFormDto[] {
  return forms.filter((form) => {
    const dateKey = form.formDate?.slice(0, 10);
    return dateKey ? isDateKeyInRange(dateKey, startKey, endKey) : false;
  });
}

function resolveVisitorKey(
  form: SalesDeskVisitFormDto,
  users: SalesDeskUserOption[]
): { key: string; name: string; userId?: number } {
  const visitorName = getVisitFormVisitorName(form);
  const matched = users.find((user) => normalizeName(user.name) === normalizeName(visitorName));
  if (matched) {
    return {
      key: `u:${matched.id}`,
      name: formatWeeklyPlanDisplayName(matched.name),
      userId: matched.id,
    };
  }
  return {
    key: `n:${normalizeName(visitorName)}`,
    name: formatWeeklyPlanDisplayName(visitorName),
  };
}

function resolveCustomerKey(form: SalesDeskVisitFormDto): { key: string; name: string } {
  const customerName = form.customerName?.trim() || 'Bilinmeyen Cari';
  if (form.customerId && form.customerId > 0) {
    return { key: `c:${form.customerId}`, name: customerName };
  }
  return { key: `n:${normalizeName(customerName)}`, name: customerName };
}

export function buildVisitFormReportRows(
  forms: SalesDeskVisitFormDto[],
  users: SalesDeskUserOption[]
): VisitFormVisitorRow[] {
  const map = new Map<string, VisitFormVisitorRow>();

  forms.forEach((form) => {
    const dateKey = form.formDate?.slice(0, 10);
    if (!dateKey) return;

    const visitor = resolveVisitorKey(form, users);
    const customer = resolveCustomerKey(form);

    let row = map.get(visitor.key);
    if (!row) {
      row = {
        visitorKey: visitor.key,
        visitorName: visitor.name,
        userId: visitor.userId,
        totalVisits: 0,
        uniqueCustomers: 0,
        byDate: new Map(),
        byCustomer: new Map(),
      };
      map.set(visitor.key, row);
    }

    row.totalVisits += 1;

    const dateEntries = row.byDate.get(dateKey) ?? [];
    dateEntries.push({
      form,
      visitorKey: visitor.key,
      visitorName: visitor.name,
      dateKey,
      customerKey: customer.key,
      customerName: customer.name,
    });
    row.byDate.set(dateKey, dateEntries);

    const existingCustomer = row.byCustomer.get(customer.key);
    if (existingCustomer) {
      existingCustomer.count += 1;
      if (dateKey > existingCustomer.lastDateKey) {
        existingCustomer.lastDateKey = dateKey;
      }
    } else {
      row.byCustomer.set(customer.key, {
        customerKey: customer.key,
        customerName: customer.name,
        count: 1,
        lastDateKey: dateKey,
      });
    }
  });

  map.forEach((row) => {
    row.uniqueCustomers = row.byCustomer.size;
  });

  return [...map.values()].sort((left, right) =>
    left.visitorName.localeCompare(right.visitorName, 'tr')
  );
}

export function buildVisitFormReportSummary(rows: VisitFormVisitorRow[]): VisitFormReportSummary {
  const totalVisits = rows.reduce((sum, row) => sum + row.totalVisits, 0);
  const uniqueVisitors = rows.length;
  const customerKeys = new Set<string>();
  rows.forEach((row) => {
    row.byCustomer.forEach((_, key) => customerKeys.add(key));
  });

  return {
    totalVisits,
    uniqueVisitors,
    uniqueCustomers: customerKeys.size,
    avgVisitsPerVisitor: uniqueVisitors > 0 ? totalVisits / uniqueVisitors : 0,
  };
}

export function formatReportDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export interface VisitFormDayCustomerGroup {
  customerKey: string;
  customerName: string;
  count: number;
  forms: SalesDeskVisitFormDto[];
}

export function groupDayEntriesByCustomer(entries: VisitFormReportEntry[]): VisitFormDayCustomerGroup[] {
  const map = new Map<string, VisitFormDayCustomerGroup>();
  entries.forEach((entry) => {
    const existing = map.get(entry.customerKey);
    if (existing) {
      existing.count += 1;
      existing.forms.push(entry.form);
      return;
    }
    map.set(entry.customerKey, {
      customerKey: entry.customerKey,
      customerName: entry.customerName,
      count: 1,
      forms: [entry.form],
    });
  });
  return [...map.values()].sort((left, right) => {
    if (right.count !== left.count) return right.count - left.count;
    return left.customerName.localeCompare(right.customerName, 'tr');
  });
}
