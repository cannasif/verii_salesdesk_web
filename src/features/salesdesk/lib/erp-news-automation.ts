import { salesDeskApi, type SalesDeskErpNewsItemDto } from '../api/salesdesk-api';
import { erpNewsMetaApi } from '../api/erp-news-meta-api';
import type { SalesDeskGroupDto } from '../types/salesdesk-group-types';
import { defaultSourceLabel, moduleToTopic } from './erp-news-normalize';
import {
  buildErpNewsTriggerKey,
  type ErpNewsMetaOverlay,
  type ErpNewsModule,
  type ErpNewsReferenceType,
} from './erp-news-types';

export interface ErpNewsAutomationCandidate {
  triggerKey: string;
  module: ErpNewsModule;
  referenceType: ErpNewsReferenceType;
  referenceId: string;
  title: string;
  sourceLabel: string;
  score: number;
  isCritical: boolean;
  targetGroupIds: number[];
  targetGroupNames: string[];
}

export interface ErpNewsAutomationResult {
  created: number;
  skipped: number;
  errors: string[];
  createdItems: SalesDeskErpNewsItemDto[];
}

function findGroupsByKeywords(groups: SalesDeskGroupDto[], keywords: string[]): SalesDeskGroupDto[] {
  const normalized = keywords.map((item) => item.toLocaleLowerCase('tr-TR'));
  return groups.filter((group) => {
    const haystack = `${group.name} ${group.description}`.toLocaleLowerCase('tr-TR');
    return normalized.some((keyword) => haystack.includes(keyword));
  });
}

function resolveTargetGroups(
  groups: SalesDeskGroupDto[],
  keywords: string[],
  fallbackToAll = false
): { ids: number[]; names: string[] } {
  const matched = findGroupsByKeywords(groups, keywords);
  if (matched.length > 0) {
    return { ids: matched.map((item) => item.id), names: matched.map((item) => item.name) };
  }
  if (fallbackToAll) {
    return { ids: [], names: ['Tum sirket'] };
  }
  return { ids: [], names: [] };
}

async function buildCandidates(groups: SalesDeskGroupDto[]): Promise<ErpNewsAutomationCandidate[]> {
  const candidates: ErpNewsAutomationCandidate[] = [];
  const today = new Date().toISOString().slice(0, 10);

  const [productsPage, potentialsPage, tasksPage, visitsPage, quotesPage] = await Promise.all([
    salesDeskApi.products.list({ pageNumber: 1, pageSize: 100, sortBy: 'Name', sortDirection: 'asc' }),
    salesDeskApi.potentials.list({ pageNumber: 1, pageSize: 100, sortBy: 'CompanyName', sortDirection: 'asc' }),
    salesDeskApi.tasks.list({ pageNumber: 1, pageSize: 100, sortBy: 'DueDate', sortDirection: 'asc' }),
    salesDeskApi.visits.list({ pageNumber: 1, pageSize: 100, sortBy: 'VisitDate', sortDirection: 'desc' }),
    salesDeskApi.quotes.list({ pageNumber: 1, pageSize: 100, sortBy: 'QuoteDate', sortDirection: 'desc' }),
  ]);

  const purchasingGroups = resolveTargetGroups(groups, ['satin', 'satın', 'tedarik', 'depo']);
  const productionGroups = resolveTargetGroups(groups, ['uretim', 'üretim', 'bakim', 'bakım', 'operasyon']);
  const crmGroups = resolveTargetGroups(groups, ['satis', 'satış', 'crm'], true);

  for (const product of productsPage.data) {
    if (!product.isLowStock) continue;
    const referenceId = String(product.id);
    candidates.push({
      triggerKey: buildErpNewsTriggerKey('DEPO', 'Product', referenceId),
      module: 'DEPO',
      referenceType: 'Product',
      referenceId,
      title: `${product.name} stok seviyesi kritik altina dustu (${product.stockQuantity} ${product.unit})`,
      sourceLabel: defaultSourceLabel('system', 'DEPO'),
      score: 9,
      isCritical: true,
      targetGroupIds: purchasingGroups.ids,
      targetGroupNames: purchasingGroups.names,
    });
  }

  for (const potential of potentialsPage.data) {
    if (potential.status !== 5) continue;
    const referenceId = String(potential.id);
    candidates.push({
      triggerKey: buildErpNewsTriggerKey('CRM', 'PotentialCustomer', referenceId),
      module: 'CRM',
      referenceType: 'PotentialCustomer',
      referenceId,
      title: `${potential.companyName} potansiyel cariden donusturuldu`,
      sourceLabel: defaultSourceLabel('system', 'CRM'),
      score: 7,
      isCritical: false,
      targetGroupIds: crmGroups.ids,
      targetGroupNames: crmGroups.names,
    });
  }

  for (const task of tasksPage.data) {
    if (task.priority !== 4 || task.status === 3) continue;
    const referenceId = String(task.id);
    candidates.push({
      triggerKey: buildErpNewsTriggerKey('URETIM', 'Task', referenceId),
      module: 'URETIM',
      referenceType: 'Task',
      referenceId,
      title: `Kritik gorev acik: ${task.title}`,
      sourceLabel: defaultSourceLabel('system', 'URETIM'),
      score: 8,
      isCritical: true,
      targetGroupIds: productionGroups.ids,
      targetGroupNames: productionGroups.names.length > 0 ? productionGroups.names : ['Uretim / Operasyon'],
    });
  }

  for (const visit of visitsPage.data) {
    if (visit.visitDate.slice(0, 10) !== today) continue;
    const referenceId = String(visit.id);
    candidates.push({
      triggerKey: buildErpNewsTriggerKey('CRM', 'Visit', referenceId),
      module: 'CRM',
      referenceType: 'Visit',
      referenceId,
      title: `Bugun planlanan ziyaret: ${visit.customerName ?? visit.title ?? 'Ziyaret'}`,
      sourceLabel: defaultSourceLabel('system', 'CRM'),
      score: 5,
      isCritical: false,
      targetGroupIds: crmGroups.ids,
      targetGroupNames: crmGroups.names,
    });
  }

  for (const quote of quotesPage.data) {
    if (quote.status !== 3) continue;
    const referenceId = String(quote.id);
    candidates.push({
      triggerKey: buildErpNewsTriggerKey('CRM', 'Quote', referenceId),
      module: 'CRM',
      referenceType: 'Quote',
      referenceId,
      title: `Onaylanan teklif: ${quote.quoteNumber}`,
      sourceLabel: defaultSourceLabel('system', 'CRM'),
      score: 6,
      isCritical: false,
      targetGroupIds: crmGroups.ids,
      targetGroupNames: crmGroups.names,
    });
  }

  return candidates;
}

async function createSystemNews(candidate: ErpNewsAutomationCandidate): Promise<SalesDeskErpNewsItemDto> {
  const body: Partial<SalesDeskErpNewsItemDto> = {
    topic: moduleToTopic(candidate.module),
    title: candidate.title,
    source: candidate.sourceLabel,
    score: candidate.score,
    isCritical: candidate.isCritical,
    isRead: false,
    publishedAt: new Date().toISOString(),
  };

  const created = await salesDeskApi.erpNews.create(body);
  const overlay: Omit<ErpNewsMetaOverlay, 'newsId' | 'updatedAt'> = {
    sourceType: 'system',
    module: candidate.module,
    targetGroupIds: candidate.targetGroupIds,
    targetGroupNames: candidate.targetGroupNames,
    referenceType: candidate.referenceType,
    referenceId: candidate.referenceId,
    isAutoGenerated: true,
    triggerKey: candidate.triggerKey,
  };

  try {
    await erpNewsMetaApi.saveOverlay(created.id, overlay);
  } catch {
    // Meta store unavailable — news still created on main API.
  }

  await erpNewsMetaApi.registerTriggerKey(candidate.triggerKey).catch(() => undefined);
  return created;
}

export async function runErpNewsAutomation(groups: SalesDeskGroupDto[]): Promise<ErpNewsAutomationResult> {
  const result: ErpNewsAutomationResult = {
    created: 0,
    skipped: 0,
    errors: [],
    createdItems: [],
  };

  const bundle = await erpNewsMetaApi.getBundle();
  const existingKeys = new Set(bundle.triggerKeys);

  let candidates: ErpNewsAutomationCandidate[] = [];
  try {
    candidates = await buildCandidates(groups);
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Aday haberler olusturulamadi.');
    return result;
  }

  for (const candidate of candidates) {
    if (existingKeys.has(candidate.triggerKey)) {
      result.skipped += 1;
      continue;
    }

    try {
      const created = await createSystemNews(candidate);
      existingKeys.add(candidate.triggerKey);
      result.created += 1;
      result.createdItems.push(created);
    } catch (error) {
      result.errors.push(
        error instanceof Error ? `${candidate.title}: ${error.message}` : `${candidate.title}: kayit olusturulamadi.`
      );
    }
  }

  return result;
}

export function isNewsVisibleToUser(
  item: { targetGroupIds: number[] },
  userId: number | null | undefined,
  groups: SalesDeskGroupDto[]
): boolean {
  if (!item.targetGroupIds.length) return true;
  if (!userId) return true;
  return groups.some(
    (group) => item.targetGroupIds.includes(group.id) && group.memberUserIds.includes(userId)
  );
}
