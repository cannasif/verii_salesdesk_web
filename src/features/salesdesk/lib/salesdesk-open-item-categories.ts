import {
  Briefcase,
  Code2,
  FolderKanban,
  Headphones,
  Layers,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';
import type { SalesDeskTaskDto } from '../api/salesdesk-api';
import { isWeeklyPlanTask } from './salesdesk-weekly-plan';
import { isSalesDeskActivityTask } from './salesdesk-activities';

export interface OpenItemCategoryDef {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  /** Form ve API'de kullanilacak grup adi */
  formGroupName: string;
  /** groupName eslesmesi (tr-TR kucuk harf) */
  groupKeys: string[];
  icon: LucideIcon;
  headerGradient: string;
  iconClassName: string;
  badgeClassName: string;
}

/** Dashboard'da gosterilecek acik madde kategorileri. */
export const OPEN_ITEM_CATEGORY_DEFS: OpenItemCategoryDef[] = [
  {
    id: 'proje',
    title: 'Proje Maddeleri',
    subtitle: 'Acik proje gorevleri',
    href: '/salesdesk/open-items?group=Proje',
    formGroupName: 'Proje',
    groupKeys: ['proje'],
    icon: FolderKanban,
    headerGradient: 'from-indigo-500/10 to-transparent',
    iconClassName: 'bg-gradient-to-br from-indigo-500/25 to-indigo-500/5 text-indigo-300 ring-indigo-500/25',
    badgeClassName: 'bg-indigo-500/12 text-indigo-300 ring-indigo-500/25',
  },
  {
    id: 'destek',
    title: 'Destek Maddeleri',
    subtitle: 'Acik destek talepleri',
    href: '/salesdesk/open-items?group=Destek',
    formGroupName: 'Destek',
    groupKeys: ['destek'],
    icon: Headphones,
    headerGradient: 'from-sky-500/10 to-transparent',
    iconClassName: 'bg-gradient-to-br from-sky-500/25 to-sky-500/5 text-sky-300 ring-sky-500/25',
    badgeClassName: 'bg-sky-500/12 text-sky-300 ring-sky-500/25',
  },
  {
    id: 'yazilim',
    title: 'Yazilim Maddeleri',
    subtitle: 'Acik yazilim isleri',
    href: '/salesdesk/open-items?group=Yazilim',
    formGroupName: 'Yazilim',
    groupKeys: ['yazilim', 'yazılım', 'software'],
    icon: Code2,
    headerGradient: 'from-violet-500/10 to-transparent',
    iconClassName: 'bg-gradient-to-br from-violet-500/25 to-violet-500/5 text-violet-300 ring-violet-500/25',
    badgeClassName: 'bg-violet-500/12 text-violet-300 ring-violet-500/25',
  },
  {
    id: 'satis',
    title: 'Satis Maddeleri',
    subtitle: 'Acik satis aksiyonlari',
    href: '/salesdesk/open-items?group=Satis',
    formGroupName: 'Satis',
    groupKeys: ['satis', 'satış', 'sales'],
    icon: ShoppingCart,
    headerGradient: 'from-emerald-500/10 to-transparent',
    iconClassName: 'bg-gradient-to-br from-emerald-500/25 to-emerald-500/5 text-emerald-300 ring-emerald-500/25',
    badgeClassName: 'bg-emerald-500/12 text-emerald-300 ring-emerald-500/25',
  },
  {
    id: 'operasyon',
    title: 'Operasyon Maddeleri',
    subtitle: 'Acik operasyon gorevleri',
    href: '/salesdesk/open-items?group=Operasyon',
    formGroupName: 'Operasyon',
    groupKeys: ['operasyon', 'operation'],
    icon: Briefcase,
    headerGradient: 'from-amber-500/10 to-transparent',
    iconClassName: 'bg-gradient-to-br from-amber-500/25 to-amber-500/5 text-amber-300 ring-amber-500/25',
    badgeClassName: 'bg-amber-500/12 text-amber-300 ring-amber-500/25',
  },
  {
    id: 'genel',
    title: 'Diger Acik Maddeler',
    subtitle: 'Grupsuz ve diger kayitlar',
    href: '/salesdesk/open-items',
    formGroupName: '',
    groupKeys: ['genel', 'diger', 'diğer', ''],
    icon: Layers,
    headerGradient: 'from-slate-500/10 to-transparent',
    iconClassName: 'bg-gradient-to-br from-slate-500/25 to-slate-500/5 text-slate-300 ring-slate-500/25',
    badgeClassName: 'bg-slate-500/12 text-slate-300 ring-slate-500/25',
  },
];

const CATEGORY_KEY_SETS = OPEN_ITEM_CATEGORY_DEFS.map((category) => ({
  id: category.id,
  keys: new Set(category.groupKeys.map((key) => normalizeOpenItemGroupKey(key))),
}));

export function normalizeOpenItemGroupKey(groupName?: string | null): string {
  return (groupName?.trim() || '').toLocaleLowerCase('tr-TR');
}

export function isWeeklyPlanTaskItem(task: SalesDeskTaskDto): boolean {
  return isWeeklyPlanTask(task);
}

export function isSalesDeskActivityTaskItem(task: SalesDeskTaskDto): boolean {
  return isSalesDeskActivityTask(task);
}

export function resolveOpenItemCategoryId(task: SalesDeskTaskDto): string {
  const key = normalizeOpenItemGroupKey(task.groupName);
  for (const category of CATEGORY_KEY_SETS) {
    if (category.id === 'genel') continue;
    if (category.keys.has(key)) return category.id;
  }
  if (!key) return 'genel';
  const knownKeys = new Set(
    CATEGORY_KEY_SETS.filter((item) => item.id !== 'genel').flatMap((item) => [...item.keys])
  );
  if (!knownKeys.has(key)) return 'genel';
  return 'genel';
}

export function groupOpenItemsByCategory(tasks: SalesDeskTaskDto[]): Record<string, SalesDeskTaskDto[]> {
  const grouped: Record<string, SalesDeskTaskDto[]> = Object.fromEntries(
    OPEN_ITEM_CATEGORY_DEFS.map((category) => [category.id, [] as SalesDeskTaskDto[]])
  );

  tasks.forEach((task) => {
    if (isWeeklyPlanTaskItem(task) || isSalesDeskActivityTaskItem(task)) return;
    const categoryId = resolveOpenItemCategoryId(task);
    grouped[categoryId]?.push(task);
  });

  return grouped;
}

export function getOpenItemGroupSelectOptions(): Array<{ value: string; label: string }> {
  return OPEN_ITEM_CATEGORY_DEFS.filter((category) => category.id !== 'genel').map((category) => ({
    value: category.formGroupName,
    label: category.formGroupName,
  }));
}

export function getOpenItemCategoryDef(id: string): OpenItemCategoryDef | undefined {
  return OPEN_ITEM_CATEGORY_DEFS.find((category) => category.id === id);
}
