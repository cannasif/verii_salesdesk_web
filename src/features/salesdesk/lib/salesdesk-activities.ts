import type { SalesDeskTaskDto } from '../api/salesdesk-api';
import { WEEKLY_ACTIVITY_TYPES } from './salesdesk-weekly-plan';

/** Aktiviteler sayfasindaki kayitlari diger gorevlerden ayirir. */
export const SALESDESK_ACTIVITY_GROUP = 'Aktivite';

export const SALESDESK_ACTIVITY_GROUP_PREFIX = `${SALESDESK_ACTIVITY_GROUP}|`;

export function isSalesDeskActivityTask(task: SalesDeskTaskDto): boolean {
  const group = task.groupName?.trim();
  if (!group) return false;
  const normalized = group.toLocaleLowerCase('tr-TR');
  if (normalized === 'aktivite') return true;
  return normalized.startsWith('aktivite|');
}

export function buildSalesDeskActivityGroupName(activityType: string): string {
  const trimmed = activityType.trim();
  if (!trimmed) return SALESDESK_ACTIVITY_GROUP;
  return `${SALESDESK_ACTIVITY_GROUP}|${trimmed}`;
}

export function parseSalesDeskActivityType(groupName?: string | null): string {
  if (!groupName) return '';
  if (groupName === SALESDESK_ACTIVITY_GROUP) return '';
  if (!groupName.startsWith(SALESDESK_ACTIVITY_GROUP_PREFIX)) return '';
  return groupName.slice(SALESDESK_ACTIVITY_GROUP_PREFIX.length).trim();
}

export function getSalesDeskActivityTypeOptions(): Array<{ value: string; label: string }> {
  return WEEKLY_ACTIVITY_TYPES.map((item) => ({
    value: item.value,
    label: item.label,
  }));
}
