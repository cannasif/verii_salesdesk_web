import type {
  SalesDeskDocumentStatus,
  SalesDeskFixedAssetStatus,
  SalesDeskPotentialStatus,
  SalesDeskPriority,
  SalesDeskRecurringPaymentType,
  SalesDeskTaskStatus,
  SalesDeskVisitStatus,
} from '../api/salesdesk-api';

export const DOCUMENT_STATUS_LABELS: Record<SalesDeskDocumentStatus, string> = {
  1: 'Taslak',
  2: 'Bekliyor',
  3: 'Onaylandi',
  4: 'Siparise Dondu',
  5: 'Kesilecek',
  6: 'Kesildi',
  7: 'Iptal',
};

export const PRIORITY_LABELS: Record<SalesDeskPriority, string> = {
  1: 'Dusuk',
  2: 'Orta',
  3: 'Yuksek',
  4: 'Kritik',
};

export const TASK_STATUS_LABELS: Record<SalesDeskTaskStatus, string> = {
  1: 'Acik',
  2: 'Devam Ediyor',
  3: 'Tamamlandi',
  4: 'Iptal',
};

export const VISIT_STATUS_LABELS: Record<SalesDeskVisitStatus, string> = {
  1: 'Planlandi',
  2: 'Yapildi',
  3: 'Iptal',
};

export const ASSET_STATUS_LABELS: Record<SalesDeskFixedAssetStatus, string> = {
  1: 'Aktif',
  2: 'Bakimda',
  3: 'Hurda',
};

export const PAYMENT_TYPE_LABELS: Record<SalesDeskRecurringPaymentType, string> = {
  1: 'Gider',
  2: 'Gelir',
};

export const POTENTIAL_STATUS_LABELS: Record<SalesDeskPotentialStatus, string> = {
  1: 'Bekliyor',
  2: 'Bulundu',
  3: 'Supheli',
  4: 'Guclu',
  5: 'Donusturuldu',
  6: 'Bulunamadi',
};
