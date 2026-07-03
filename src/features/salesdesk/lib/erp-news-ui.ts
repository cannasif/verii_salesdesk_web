import type { SalesDeskErpNewsItemEnriched, ErpNewsFeedFilter, ErpNewsModule, ErpNewsSourceType } from './erp-news-types';
import { ERP_NEWS_MODULE_LABELS, ERP_NEWS_SOURCE_TYPE_LABELS } from './erp-news-types';

const MODULE_STYLES: Record<ErpNewsModule, { badge: string; accent: string }> = {
  DEPO: {
    badge: 'bg-orange-500/10 text-orange-700 ring-1 ring-orange-400/30 dark:text-orange-300',
    accent: 'border-l-orange-500',
  },
  CRM: {
    badge: 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-400/30 dark:text-sky-300',
    accent: 'border-l-sky-500',
  },
  URETIM: {
    badge: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-400/30 dark:text-rose-300',
    accent: 'border-l-rose-500',
  },
  IK: {
    badge: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-400/30 dark:text-emerald-300',
    accent: 'border-l-emerald-500',
  },
  GIB: {
    badge: 'bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-400/30 dark:text-indigo-300',
    accent: 'border-l-indigo-500',
  },
  NETSIS: {
    badge: 'bg-violet-500/10 text-violet-700 ring-1 ring-violet-400/30 dark:text-violet-300',
    accent: 'border-l-violet-500',
  },
  ERP: {
    badge: 'bg-amber-500/10 text-amber-700 ring-1 ring-amber-400/30 dark:text-amber-300',
    accent: 'border-l-amber-500',
  },
  OTHER: {
    badge: 'bg-[var(--crm-brand-soft)] text-[var(--crm-brand-accent)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_25%,transparent)]',
    accent: 'border-l-[var(--crm-brand-primary)]',
  },
};

const SOURCE_TYPE_STYLES: Record<ErpNewsSourceType, string> = {
  manual: 'bg-slate-500/10 text-slate-600 ring-1 ring-slate-400/25 dark:text-slate-300',
  system: 'bg-cyan-500/10 text-cyan-700 ring-1 ring-cyan-400/30 dark:text-cyan-300',
  external: 'bg-purple-500/10 text-purple-700 ring-1 ring-purple-400/30 dark:text-purple-300',
};

const SCORE_LABELS = [
  { min: 8, label: 'Yuksek', className: 'text-emerald-600 dark:text-emerald-300' },
  { min: 5, label: 'Orta', className: 'text-amber-600 dark:text-amber-300' },
  { min: 0, label: 'Dusuk', className: 'text-slate-500 dark:text-slate-400' },
];

export type { ErpNewsFeedFilter };

export function normalizeNewsUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getModuleStyle(module: ErpNewsModule): { badge: string; accent: string } {
  return MODULE_STYLES[module] ?? MODULE_STYLES.OTHER;
}

export function getSourceTypeStyle(sourceType: ErpNewsSourceType): string {
  return SOURCE_TYPE_STYLES[sourceType];
}

export function getSourceTypeLabel(sourceType: ErpNewsSourceType): string {
  return ERP_NEWS_SOURCE_TYPE_LABELS[sourceType];
}

export function getModuleLabel(module: ErpNewsModule): string {
  return ERP_NEWS_MODULE_LABELS[module];
}

export function getNewsScoreMeta(score: number): { label: string; className: string } {
  return SCORE_LABELS.find((item) => score >= item.min) ?? SCORE_LABELS[2];
}

export function isNewsPublishedToday(publishedAt: string, todayKey = new Date().toISOString().slice(0, 10)): boolean {
  return publishedAt.slice(0, 10) === todayKey;
}

export function matchesNewsFeedFilter(
  item: SalesDeskErpNewsItemEnriched,
  filter: ErpNewsFeedFilter,
  todayKey = new Date().toISOString().slice(0, 10)
): boolean {
  if (filter === 'system') return item.sourceType === 'system';
  if (filter === 'manual') return item.sourceType === 'manual';
  if (filter === 'external') return item.sourceType === 'external';
  if (filter === 'unread') return !item.isRead;
  if (filter === 'critical') return item.isCritical;
  if (filter === 'today') return isNewsPublishedToday(item.publishedAt, todayKey);
  return true;
}

export function getNewsCardAccent(item: SalesDeskErpNewsItemEnriched): string {
  if (item.isCritical) return 'border-l-rose-500';
  if (item.sourceType === 'system') return getModuleStyle(item.module).accent;
  if (!item.isRead) return 'border-l-[var(--crm-brand-accent)]';
  return 'border-l-[var(--crm-app-border)]';
}

export function formatTargetGroups(names: string[]): string {
  if (!names.length) return 'Tum sirket';
  return names.join(', ');
}
