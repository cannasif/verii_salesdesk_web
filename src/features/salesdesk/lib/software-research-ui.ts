import type { SalesDeskPotentialStatus, SalesDeskSoftwareResearchDto } from '../api/salesdesk-api';
import { POTENTIAL_STATUS_LABELS } from './salesdesk-labels';

const STATUS_ACCENTS: Record<SalesDeskPotentialStatus, string> = {
  1: 'from-slate-500/20 via-slate-500/5 to-transparent',
  2: 'from-emerald-500/25 via-emerald-500/5 to-transparent',
  3: 'from-amber-500/25 via-amber-500/5 to-transparent',
  4: 'from-sky-500/25 via-sky-500/5 to-transparent',
  5: 'from-indigo-500/25 via-indigo-500/5 to-transparent',
  6: 'from-rose-500/25 via-rose-500/5 to-transparent',
};

const SCORE_COLORS = [
  { min: 80, className: 'text-emerald-500 dark:text-emerald-300' },
  { min: 50, className: 'text-amber-500 dark:text-amber-300' },
  { min: 0, className: 'text-slate-500 dark:text-slate-400' },
];

export function getResearchStatusAccent(status: SalesDeskPotentialStatus): string {
  return STATUS_ACCENTS[status] ?? STATUS_ACCENTS[1];
}

export function getResearchScoreColor(score: number): string {
  return SCORE_COLORS.find((item) => score >= item.min)?.className ?? SCORE_COLORS[2].className;
}

export function getResearchStatusLabel(status: SalesDeskPotentialStatus): string {
  return POTENTIAL_STATUS_LABELS[status] ?? 'Bilinmiyor';
}

export function parseResearchKeywords(keywords?: string | null): string[] {
  if (!keywords?.trim()) return [];
  return keywords
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function normalizeExternalUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getResearchCardSubtitle(item: SalesDeskSoftwareResearchDto): string {
  if (item.potentialCustomerName?.trim()) return item.potentialCustomerName.trim();
  if (item.host?.trim()) return item.host.trim();
  return 'Potansiyel cari secilmedi';
}
