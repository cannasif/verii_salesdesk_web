import { type ReactElement } from 'react';
import type {
  SalesDeskDocumentStatus,
  SalesDeskFixedAssetStatus,
  SalesDeskInvoiceType,
  SalesDeskPotentialStatus,
  SalesDeskPriority,
  SalesDeskTaskStatus,
  SalesDeskVisitStatus,
} from '../../api/salesdesk-api';
import {
  ASSET_STATUS_LABELS,
  DOCUMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  POTENTIAL_STATUS_LABELS,
  PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  VISIT_STATUS_LABELS,
} from '../../lib/salesdesk-labels';
import { SALES_DESK_INVOICE_TYPE_LABELS } from '../../types/invoice-types';
import type { SalesDeskRecurringPaymentType } from '../../api/salesdesk-api';

type BadgeTone = 'green' | 'yellow' | 'red' | 'purple' | 'cyan' | 'pink';

const toneClasses: Record<BadgeTone, string> = {
  green: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300',
  yellow: 'border-amber-400/50 bg-amber-500/10 text-amber-300',
  red: 'border-rose-400/50 bg-rose-500/10 text-rose-300',
  purple: 'border-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-on-soft)]',
  cyan: 'border-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-on-soft)]',
  pink: 'border-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)] bg-[var(--crm-brand-soft)] text-[var(--crm-brand-on-soft)]',
};

function Badge({ children, tone = 'purple' }: { children: string; tone?: BadgeTone }): ReactElement {
  return (
    <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{children}</span>
  );
}

export function DocumentStatusBadge({ status }: { status: SalesDeskDocumentStatus }): ReactElement {
  const label = DOCUMENT_STATUS_LABELS[status];
  const tone: BadgeTone =
    status === 3 || status === 6 ? 'green' : status === 4 || status === 5 ? 'yellow' : status === 7 ? 'red' : 'purple';
  return <Badge tone={tone}>{label}</Badge>;
}

export function TaskStatusBadge({ status }: { status: SalesDeskTaskStatus }): ReactElement {
  const label = TASK_STATUS_LABELS[status];
  const tone: BadgeTone = status === 3 ? 'green' : status === 4 ? 'red' : status === 2 ? 'yellow' : 'purple';
  return <Badge tone={tone}>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: SalesDeskPriority }): ReactElement {
  const label = PRIORITY_LABELS[priority];
  const tone: BadgeTone = priority === 4 ? 'red' : priority === 3 ? 'yellow' : priority === 2 ? 'cyan' : 'purple';
  return <Badge tone={tone}>{label}</Badge>;
}

export function VisitStatusBadge({ status }: { status: SalesDeskVisitStatus }): ReactElement {
  const label = VISIT_STATUS_LABELS[status];
  const tone: BadgeTone = status === 2 ? 'green' : status === 3 ? 'red' : 'purple';
  return <Badge tone={tone}>{label}</Badge>;
}

export function AssetStatusBadge({ status }: { status: SalesDeskFixedAssetStatus }): ReactElement {
  const label = ASSET_STATUS_LABELS[status];
  const tone: BadgeTone = status === 1 ? 'green' : status === 2 ? 'yellow' : 'red';
  return <Badge tone={tone}>{label}</Badge>;
}

export function PaymentTypeBadge({ type }: { type: SalesDeskRecurringPaymentType }): ReactElement {
  const label = PAYMENT_TYPE_LABELS[type];
  return <Badge tone={type === 2 ? 'green' : 'yellow'}>{label}</Badge>;
}

export function PotentialStatusBadge({ status }: { status: SalesDeskPotentialStatus }): ReactElement {
  const label = POTENTIAL_STATUS_LABELS[status];
  const tone: BadgeTone =
    status === 2 || status === 4 ? 'green' : status === 3 ? 'yellow' : status === 6 ? 'red' : 'purple';
  return <Badge tone={tone}>{label}</Badge>;
}

export function InvoiceTypeBadge({ type }: { type: SalesDeskInvoiceType }): ReactElement {
  const label = SALES_DESK_INVOICE_TYPE_LABELS[type];
  const tone: BadgeTone = type === 2 ? 'yellow' : 'green';
  return <Badge tone={tone}>{label}</Badge>;
}

export function LowStockBadge({ isLowStock }: { isLowStock: boolean }): ReactElement {
  if (!isLowStock) return <span>-</span>;
  return <Badge tone="red">Dusuk Stok</Badge>;
}

export function ActiveBadge({ isActive }: { isActive: boolean }): ReactElement {
  return <Badge tone={isActive ? 'green' : 'red'}>{isActive ? 'Aktif' : 'Pasif'}</Badge>;
}

export function UnreadBadge({ isUnread }: { isUnread: boolean }): ReactElement {
  return <Badge tone={isUnread ? 'yellow' : 'green'}>{isUnread ? 'Okunmadi' : 'Okundu'}</Badge>;
}
