import { z } from 'zod';
import type {
  SalesDeskDocumentStatus,
  SalesDeskErpNewsItemDto,
  SalesDeskFixedAssetDto,
  SalesDeskFixedAssetStatus,
  SalesDeskGmailMessageDto,
  SalesDeskInvoiceDto,
  SalesDeskInvoiceCreateBody,
  SalesDeskInvoiceType,
  SalesDeskPriority,
  SalesDeskProductCustomerDto,
  SalesDeskProductDto,
  SalesDeskQuoteDto,
  SalesDeskQuoteCreateBody,
  SalesDeskRecurringPaymentDto,
  SalesDeskRecurringPaymentType,
  SalesDeskSoftwareResearchDto,
  SalesDeskTaskDto,
  SalesDeskTaskStatus,
  SalesDeskVisitDto,
  SalesDeskVisitFormDto,
  SalesDeskVisitStatus,
} from '../api/salesdesk-api';
import type { SalesDeskPotentialStatus } from '../api/salesdesk-api';
import { buildSalesDeskActivityGroupName, parseSalesDeskActivityType } from '../lib/salesdesk-activities';
import { buildSalesDeskProjectGroupName, parseSalesDeskProjectPhase } from '../lib/salesdesk-project-tracking';
import { idToSelectValue, NONE_SELECT_VALUE, optionalGroupNameFromSelect, optionalIdFromSelect, requiredIdFromSelect, toDateInputValue, toTimeInputValue, toTimePayloadValue } from '../lib/salesdesk-shared';
import { buildDefaultVisitFormTitle, parseVisitFormContent, serializeVisitFormContent } from '../lib/visit-form-content';

const documentStatusSchema = z
  .string()
  .min(1, 'Durum secin')
  .transform((value) => Number(value) as SalesDeskDocumentStatus);

const prioritySchema = z
  .string()
  .min(1, 'Oncelik secin')
  .transform((value) => Number(value) as SalesDeskPriority);

const taskStatusSchema = z
  .string()
  .min(1, 'Durum secin')
  .transform((value) => Number(value) as SalesDeskTaskStatus);

const visitStatusSchema = z
  .string()
  .min(1, 'Durum secin')
  .transform((value) => Number(value) as SalesDeskVisitStatus);

const assetStatusSchema = z
  .string()
  .min(1, 'Durum secin')
  .transform((value) => Number(value) as SalesDeskFixedAssetStatus);

const paymentTypeSchema = z
  .string()
  .min(1, 'Tip secin')
  .transform((value) => Number(value) as SalesDeskRecurringPaymentType);

const customerIdSchema = z.string().min(1, 'Cari secin').transform((value) => requiredIdFromSelect(value, 'Cari'));

const optionalCustomerIdSchema = z
  .string()
  .optional()
  .transform((value) => optionalIdFromSelect(value));

const optionalPotentialIdSchema = z
  .string()
  .optional()
  .transform((value) => optionalIdFromSelect(value));

const optionalQuoteIdSchema = z
  .string()
  .optional()
  .transform((value) => optionalIdFromSelect(value));

export type LineUpsertInput = {
  productId: number;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export const productFormSchema = z.object({
  code: z.string().max(32).optional(),
  name: z.string().trim().min(1, 'Urun adi zorunludur').max(220),
  category: z.string().max(80).optional(),
  unit: z.string().trim().min(1, 'Birim zorunludur').max(20),
  salesPrice: z.number().min(0),
  stockQuantity: z.number().min(0),
  minimumStockQuantity: z.number().min(0),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function toProductFormValues(product?: SalesDeskProductDto | null): ProductFormValues {
  return {
    code: product?.code ?? '',
    name: product?.name ?? '',
    category: product?.category ?? '',
    unit: product?.unit ?? 'Adet',
    salesPrice: product?.salesPrice ?? 0,
    stockQuantity: product?.stockQuantity ?? 0,
    minimumStockQuantity: product?.minimumStockQuantity ?? 0,
  };
}

export function toProductPayload(values: ProductFormValues): Partial<SalesDeskProductDto> {
  return {
    code: values.code?.trim() || undefined,
    name: values.name.trim(),
    category: values.category?.trim() || undefined,
    unit: values.unit.trim(),
    salesPrice: values.salesPrice,
    stockQuantity: values.stockQuantity,
    minimumStockQuantity: values.minimumStockQuantity,
  };
}

export const quoteFormSchema = z.object({
  quoteNumber: z.string().max(32).optional(),
  customerId: customerIdSchema,
  quoteDate: z.string().min(1, 'Tarih zorunludur'),
  status: documentStatusSchema,
  discountRate: z.number().min(0).max(100).default(0),
  notes: z.string().max(2000).optional(),
});

export type QuoteFormValues = z.input<typeof quoteFormSchema>;

export function toQuoteFormValues(quote?: SalesDeskQuoteDto | null): QuoteFormValues {
  return {
    quoteNumber: quote?.quoteNumber ?? '',
    customerId: String(quote?.customerId ?? ''),
    quoteDate: toDateInputValue(quote?.quoteDate),
    status: String(quote?.status ?? 1),
    discountRate: quote?.discountRate ?? 0,
    notes: quote?.notes ?? '',
  };
}

export function toQuotePayload(
  values: QuoteFormValues,
  lines: LineUpsertInput[] = []
): SalesDeskQuoteCreateBody {
  const parsed = quoteFormSchema.parse(values);
  return {
    quoteNumber: parsed.quoteNumber?.trim() || undefined,
    customerId: parsed.customerId,
    quoteDate: parsed.quoteDate,
    status: parsed.status,
    discountRate: parsed.discountRate,
    notes: parsed.notes?.trim() || undefined,
    lines,
  };
}

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().max(32).optional(),
  invoiceType: z.enum(['1', '2']).default('1'),
  customerId: customerIdSchema,
  quoteId: optionalQuoteIdSchema,
  invoiceDate: z.string().min(1, 'Fatura tarihi zorunludur'),
  dueDate: z.string().min(1, 'Vade tarihi zorunludur'),
  status: documentStatusSchema,
  discountRate: z.number().min(0).max(100),
  notes: z.string().max(2000).optional(),
});

export type InvoiceFormValues = z.input<typeof invoiceFormSchema>;

export function toInvoiceFormValues(
  invoice?: SalesDeskInvoiceDto | null,
  defaultType: SalesDeskInvoiceType = 1
): InvoiceFormValues {
  return {
    invoiceNumber: invoice?.invoiceNumber ?? '',
    invoiceType: String(invoice?.invoiceType ?? defaultType) as InvoiceFormValues['invoiceType'],
    customerId: String(invoice?.customerId ?? ''),
    quoteId: idToSelectValue(invoice?.quoteId),
    invoiceDate: toDateInputValue(invoice?.invoiceDate),
    dueDate: toDateInputValue(invoice?.dueDate),
    status: String(invoice?.status ?? 5),
    discountRate: invoice?.discountRate ?? 0,
    notes: invoice?.notes ?? '',
  };
}

export function toInvoicePayload(
  values: InvoiceFormValues,
  lines: LineUpsertInput[] = []
): SalesDeskInvoiceCreateBody {
  const parsed = invoiceFormSchema.parse(values);
  return {
    invoiceNumber: parsed.invoiceNumber?.trim() || undefined,
    invoiceType: Number(parsed.invoiceType) as SalesDeskInvoiceType,
    customerId: parsed.customerId,
    quoteId: parsed.quoteId,
    invoiceDate: parsed.invoiceDate,
    dueDate: parsed.dueDate,
    status: parsed.status,
    discountRate: parsed.discountRate,
    notes: parsed.notes?.trim() || undefined,
    lines,
  };
}

const optionalUserIdSchema = z
  .string()
  .optional()
  .transform((value) => optionalIdFromSelect(value));

const optionalGroupNameSchema = z
  .string()
  .optional()
  .transform((value) => optionalGroupNameFromSelect(value));

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Baslik zorunludur').max(220),
  description: z.string().max(2000).optional(),
  groupName: optionalGroupNameSchema,
  customerId: optionalCustomerIdSchema,
  assignedUserId: optionalUserIdSchema,
  priority: prioritySchema,
  status: taskStatusSchema,
  dueDate: z.string().optional(),
});

/** Acik maddeler formu: dashboard kartina yonlendirmek icin grup zorunlu. */
export const openItemTaskFormSchema = taskFormSchema.superRefine((data, ctx) => {
  if (!data.groupName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Grup secimi zorunludur',
      path: ['groupName'],
    });
  }
});

export type TaskFormValues = z.input<typeof taskFormSchema>;

function normalizeTaskFormInput(values: TaskFormValues): TaskFormValues {
  return {
    ...values,
    groupName: values.groupName != null ? String(values.groupName) : undefined,
    customerId: values.customerId != null ? String(values.customerId) : undefined,
    assignedUserId: values.assignedUserId != null ? String(values.assignedUserId) : undefined,
    priority: String(values.priority ?? ''),
    status: String(values.status ?? ''),
    dueDate: values.dueDate ?? '',
  };
}

export function toTaskFormValues(task?: SalesDeskTaskDto | null): TaskFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    groupName: task?.groupName ?? '',
    customerId: idToSelectValue(task?.customerId),
    assignedUserId: idToSelectValue(task?.assignedUserId),
    priority: String(task?.priority ?? 2),
    status: String(task?.status ?? 1),
    dueDate: task?.dueDate ? toDateInputValue(task.dueDate) : '',
  };
}

export function toTaskPayload(values: TaskFormValues): Partial<SalesDeskTaskDto> {
  const parsed = taskFormSchema.parse(normalizeTaskFormInput(values));
  return {
    title: parsed.title.trim(),
    description: parsed.description?.trim() || undefined,
    groupName: parsed.groupName,
    customerId: parsed.customerId,
    assignedUserId: parsed.assignedUserId,
    priority: parsed.priority,
    status: parsed.status,
    dueDate: parsed.dueDate || undefined,
  };
}

export function toOpenItemTaskPayload(values: TaskFormValues): Partial<SalesDeskTaskDto> {
  const parsed = openItemTaskFormSchema.parse(normalizeTaskFormInput(values));
  return {
    title: parsed.title.trim(),
    description: parsed.description?.trim() || undefined,
    groupName: parsed.groupName,
    customerId: parsed.customerId,
    assignedUserId: parsed.assignedUserId,
    priority: parsed.priority,
    status: parsed.status,
    dueDate: parsed.dueDate || undefined,
  };
}

export const salesDeskActivityFormSchema = z.object({
  title: z.string().trim().min(1, 'Baslik zorunludur').max(220),
  description: z.string().max(2000).optional(),
  activityType: z
    .string()
    .refine((value) => value !== NONE_SELECT_VALUE && value.trim().length > 0, {
      message: 'Tip secin',
    }),
  customerId: optionalCustomerIdSchema,
  assignedUserId: optionalUserIdSchema,
  priority: prioritySchema,
  status: taskStatusSchema,
  dueDate: z.string().optional(),
});

export type SalesDeskActivityFormValues = z.input<typeof salesDeskActivityFormSchema>;

function normalizeActivityFormInput(values: SalesDeskActivityFormValues): SalesDeskActivityFormValues {
  const activityType =
    values.activityType != null && values.activityType !== NONE_SELECT_VALUE
      ? String(values.activityType)
      : '';
  return {
    ...values,
    activityType,
    customerId: values.customerId != null ? String(values.customerId) : undefined,
    assignedUserId: values.assignedUserId != null ? String(values.assignedUserId) : undefined,
    priority: String(values.priority ?? ''),
    status: String(values.status ?? ''),
    dueDate: values.dueDate ?? '',
  };
}

export function toSalesDeskActivityFormValues(task?: SalesDeskTaskDto | null): SalesDeskActivityFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    activityType: parseSalesDeskActivityType(task?.groupName) || '',
    customerId: idToSelectValue(task?.customerId),
    assignedUserId: idToSelectValue(task?.assignedUserId),
    priority: String(task?.priority ?? 2),
    status: String(task?.status ?? 1),
    dueDate: task?.dueDate ? toDateInputValue(task.dueDate) : '',
  };
}

export function toSalesDeskActivityPayload(values: SalesDeskActivityFormValues): Partial<SalesDeskTaskDto> {
  const parsed = salesDeskActivityFormSchema.parse(normalizeActivityFormInput(values));
  return {
    title: parsed.title.trim(),
    description: parsed.description?.trim() || undefined,
    groupName: buildSalesDeskActivityGroupName(parsed.activityType),
    customerId: parsed.customerId,
    assignedUserId: parsed.assignedUserId,
    priority: parsed.priority,
    status: parsed.status,
    dueDate: parsed.dueDate || undefined,
  };
}

export const salesDeskProjectFormSchema = z.object({
  title: z.string().trim().min(1, 'Proje adi zorunludur').max(220),
  description: z.string().max(2000).optional(),
  projectPhase: z.string().optional(),
  customerId: optionalCustomerIdSchema,
  assignedUserId: optionalUserIdSchema,
  priority: prioritySchema,
  status: taskStatusSchema,
  dueDate: z.string().optional(),
});

export type SalesDeskProjectFormValues = z.input<typeof salesDeskProjectFormSchema>;

function normalizeProjectFormInput(values: SalesDeskProjectFormValues): SalesDeskProjectFormValues {
  const projectPhase =
    values.projectPhase != null && values.projectPhase !== NONE_SELECT_VALUE
      ? String(values.projectPhase)
      : '';
  return {
    ...values,
    projectPhase,
    customerId: values.customerId != null ? String(values.customerId) : undefined,
    assignedUserId: values.assignedUserId != null ? String(values.assignedUserId) : undefined,
    priority: String(values.priority ?? ''),
    status: String(values.status ?? ''),
    dueDate: values.dueDate ?? '',
  };
}

export function toSalesDeskProjectFormValues(task?: SalesDeskTaskDto | null): SalesDeskProjectFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    projectPhase: parseSalesDeskProjectPhase(task?.groupName) || '',
    customerId: idToSelectValue(task?.customerId),
    assignedUserId: idToSelectValue(task?.assignedUserId),
    priority: String(task?.priority ?? 2),
    status: String(task?.status ?? 1),
    dueDate: task?.dueDate ? toDateInputValue(task.dueDate) : '',
  };
}

export function toSalesDeskProjectPayload(values: SalesDeskProjectFormValues): Partial<SalesDeskTaskDto> {
  const parsed = salesDeskProjectFormSchema.parse(normalizeProjectFormInput(values));
  const phase =
    parsed.projectPhase && parsed.projectPhase !== NONE_SELECT_VALUE ? parsed.projectPhase.trim() : '';
  return {
    title: parsed.title.trim(),
    description: parsed.description?.trim() || undefined,
    groupName: buildSalesDeskProjectGroupName(phase || undefined),
    customerId: parsed.customerId,
    assignedUserId: parsed.assignedUserId,
    priority: parsed.priority,
    status: parsed.status,
    dueDate: parsed.dueDate || undefined,
  };
}

export const visitFormSchema = z.object({
  visitDate: z.string().min(1, 'Tarih zorunludur'),
  visitTime: z.string().optional(),
  title: z.string().trim().min(1, 'Baslik zorunludur').max(220),
  customerId: optionalCustomerIdSchema,
  visitType: z.string().trim().min(1, 'Ziyaret tipi zorunludur').max(40),
  status: visitStatusSchema,
  notes: z.string().max(2000).optional(),
});

export type VisitFormValues = z.input<typeof visitFormSchema>;

export function toVisitFormValues(visit?: SalesDeskVisitDto | null): VisitFormValues {
  return {
    visitDate: toDateInputValue(visit?.visitDate),
    visitTime: toTimeInputValue(visit?.visitTime),
    title: visit?.title ?? '',
    customerId: idToSelectValue(visit?.customerId),
    visitType: visit?.visitType ?? 'Yuz Yuze',
    status: String(visit?.status ?? 1),
    notes: visit?.notes ?? '',
  };
}

export function toVisitPayload(values: VisitFormValues): Partial<SalesDeskVisitDto> {
  const parsed = visitFormSchema.parse(values);
  return {
    visitDate: parsed.visitDate,
    visitTime: toTimePayloadValue(parsed.visitTime),
    title: parsed.title.trim(),
    customerId: parsed.customerId,
    visitType: parsed.visitType.trim(),
    status: parsed.status,
    notes: parsed.notes?.trim() || undefined,
  };
}

export const visitFormRecordFormSchema = z.object({
  visitId: z.string().optional(),
  customerId: z.string().min(1, 'Cari secin'),
  title: z.string().trim().min(1, 'Baslik zorunludur').max(220),
  formDate: z.string().min(1, 'Tarih zorunludur'),
  visitorName: z.string().max(120).optional(),
  contactedPerson: z.string().max(120).optional(),
  recipientEmail: z.string().max(200).optional(),
  recipientPhone: z.string().max(40).optional(),
  notes: z.string().max(6000).optional(),
  nextSteps: z.string().max(2000).optional(),
});

/** @deprecated Use visitFormRecordFormSchema in forms; payload uses toVisitFormRecordPayload. */
export const visitFormRecordSchema = visitFormRecordFormSchema;

export type VisitFormRecordValues = z.infer<typeof visitFormRecordFormSchema>;

function normalizeVisitFormDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T12:00:00`;
  }
  return value;
}

function normalizeVisitFormRecordInput(values: VisitFormRecordValues): VisitFormRecordValues {
  return {
    ...values,
    visitId:
      values.visitId == null || values.visitId === ''
        ? NONE_SELECT_VALUE
        : String(values.visitId),
    customerId:
      typeof values.customerId === 'number'
        ? String(values.customerId)
        : values.customerId ?? '',
    title: values.title ?? '',
    formDate: values.formDate ?? '',
    visitorName: values.visitorName ?? '',
    contactedPerson: values.contactedPerson ?? '',
    recipientEmail: values.recipientEmail ?? '',
    recipientPhone: values.recipientPhone ?? '',
    notes: values.notes ?? '',
    nextSteps: values.nextSteps ?? '',
  };
}

export function createDefaultVisitFormRecordValues(visitorName?: string): VisitFormRecordValues {
  const formDate = new Date().toISOString().slice(0, 10);
  return {
    visitId: NONE_SELECT_VALUE,
    customerId: '',
    title: buildDefaultVisitFormTitle(formDate),
    formDate,
    visitorName: visitorName ?? '',
    contactedPerson: '',
    recipientEmail: '',
    recipientPhone: '',
    notes: '',
    nextSteps: '',
  };
}

export function toVisitFormRecordValues(form?: SalesDeskVisitFormDto | null): VisitFormRecordValues {
  const content = parseVisitFormContent(form?.content);
  return {
    visitId: idToSelectValue(form?.visitId),
    customerId: form?.customerId ? String(form.customerId) : '',
    title: form?.title ?? '',
    formDate: toDateInputValue(form?.formDate),
    visitorName: content.visitorName ?? '',
    contactedPerson: content.contactedPerson ?? '',
    recipientEmail: content.recipientEmail ?? '',
    recipientPhone: content.recipientPhone ?? '',
    notes: content.notes ?? '',
    nextSteps: content.nextSteps ?? '',
  };
}

export function toVisitFormRecordPayload(values: VisitFormRecordValues): Partial<SalesDeskVisitFormDto> {
  const parsed = visitFormRecordFormSchema.parse(normalizeVisitFormRecordInput(values));
  const visitId = optionalIdFromSelect(parsed.visitId);
  return {
    visitId,
    customerId: requiredIdFromSelect(parsed.customerId, 'Cari'),
    title: parsed.title.trim(),
    formDate: normalizeVisitFormDate(parsed.formDate),
    content: serializeVisitFormContent({
      visitorName: parsed.visitorName,
      contactedPerson: parsed.contactedPerson,
      recipientEmail: parsed.recipientEmail,
      recipientPhone: parsed.recipientPhone,
      notes: parsed.notes,
      nextSteps: parsed.nextSteps,
    }),
  };
}

export const assetFormSchema = z.object({
  code: z.string().trim().min(1, 'Kod zorunludur').max(32),
  name: z.string().trim().min(1, 'Ad zorunludur').max(220),
  category: z.string().max(80).optional(),
  purchaseDate: z.string().min(1, 'Alis tarihi zorunludur'),
  value: z.number().min(0),
  status: assetStatusSchema,
});

export type AssetFormValues = z.input<typeof assetFormSchema>;

export function toAssetFormValues(asset?: SalesDeskFixedAssetDto | null): AssetFormValues {
  return {
    code: asset?.code ?? '',
    name: asset?.name ?? '',
    category: asset?.category ?? '',
    purchaseDate: toDateInputValue(asset?.purchaseDate),
    value: asset?.value ?? 0,
    status: String(asset?.status ?? 1),
  };
}

export function toAssetPayload(values: AssetFormValues): Partial<SalesDeskFixedAssetDto> {
  const parsed = assetFormSchema.parse(values);
  return {
    code: parsed.code.trim(),
    name: parsed.name.trim(),
    category: parsed.category?.trim() || undefined,
    purchaseDate: parsed.purchaseDate,
    value: parsed.value,
    status: parsed.status,
  };
}

export const recurringPaymentFormSchema = z.object({
  name: z.string().trim().min(1, 'Ad zorunludur').max(220),
  type: paymentTypeSchema,
  category: z.string().max(80).optional(),
  dayOfMonth: z.number().int().min(1).max(31),
  amount: z.number().min(0),
  customerId: optionalCustomerIdSchema,
  isActive: z.boolean(),
});

export type RecurringPaymentFormValues = z.input<typeof recurringPaymentFormSchema>;

export function toRecurringPaymentFormValues(
  payment?: SalesDeskRecurringPaymentDto | null
): RecurringPaymentFormValues {
  return {
    name: payment?.name ?? '',
    type: String(payment?.type ?? 1),
    category: payment?.category ?? '',
    dayOfMonth: payment?.dayOfMonth ?? 1,
    amount: payment?.amount ?? 0,
    customerId: idToSelectValue(payment?.customerId),
    isActive: payment?.isActive ?? true,
  };
}

export function toRecurringPaymentPayload(
  values: RecurringPaymentFormValues
): Partial<SalesDeskRecurringPaymentDto> {
  const parsed = recurringPaymentFormSchema.parse(values);
  return {
    name: parsed.name.trim(),
    type: parsed.type,
    category: parsed.category?.trim() || undefined,
    dayOfMonth: parsed.dayOfMonth,
    amount: parsed.amount,
    customerId: parsed.customerId,
    isActive: parsed.isActive,
  };
}

export const softwareResearchFormSchema = z.object({
  potentialCustomerId: z.string().optional(),
  provider: z.string().trim().min(1, 'Saglayici zorunludur').max(80),
  keywords: z.string().max(500).optional(),
  host: z.string().max(220).optional(),
  sourceUrl: z.string().max(500).optional(),
  score: z.number().min(0, 'Skor 0-100 arasi olmali').max(100, 'Skor 0-100 arasi olmali'),
  status: z.string().min(1, 'Durum secin'),
});

export type SoftwareResearchFormValues = z.infer<typeof softwareResearchFormSchema>;

export function createDefaultSoftwareResearchFormValues(): SoftwareResearchFormValues {
  return {
    potentialCustomerId: NONE_SELECT_VALUE,
    provider: '',
    keywords: '',
    host: '',
    sourceUrl: '',
    score: 0,
    status: '1',
  };
}

export function toSoftwareResearchFormValues(
  item?: SalesDeskSoftwareResearchDto | null
): SoftwareResearchFormValues {
  return {
    potentialCustomerId: idToSelectValue(item?.potentialCustomerId),
    provider: item?.provider ?? '',
    keywords: item?.keywords ?? '',
    host: item?.host ?? '',
    sourceUrl: item?.sourceUrl ?? '',
    score: item?.score ?? 0,
    status: String(item?.status ?? 1),
  };
}

export function toSoftwareResearchPayload(
  values: SoftwareResearchFormValues
): Partial<SalesDeskSoftwareResearchDto> {
  const parsed = softwareResearchFormSchema.parse({
    ...values,
    potentialCustomerId:
      values.potentialCustomerId == null || values.potentialCustomerId === ''
        ? NONE_SELECT_VALUE
        : String(values.potentialCustomerId),
    score: Number(values.score),
  });

  return {
    potentialCustomerId: optionalIdFromSelect(parsed.potentialCustomerId),
    provider: parsed.provider.trim(),
    keywords: parsed.keywords?.trim() || undefined,
    host: parsed.host?.trim() || undefined,
    sourceUrl: parsed.sourceUrl?.trim() || undefined,
    score: parsed.score,
    status: Number(parsed.status) as SalesDeskPotentialStatus,
  };
}

export const erpNewsFormSchema = z.object({
  module: z.enum(['DEPO', 'CRM', 'URETIM', 'IK', 'GIB', 'NETSIS', 'ERP', 'OTHER']),
  title: z.string().trim().min(1, 'Baslik zorunludur').max(220),
  source: z.string().max(120).optional(),
  sourceUrl: z.string().max(500).optional(),
  score: z.number().min(0).max(10),
  isCritical: z.boolean(),
  isRead: z.boolean(),
  publishedAt: z.string().min(1, 'Yayin tarihi zorunludur'),
  targetGroupIds: z.array(z.number().int().positive()),
  sourceType: z.enum(['manual', 'external']),
});

export type ErpNewsFormValues = z.infer<typeof erpNewsFormSchema>;

export function createDefaultErpNewsFormValues(): ErpNewsFormValues {
  return {
    module: 'ERP',
    title: '',
    source: '',
    sourceUrl: '',
    score: 0,
    isCritical: false,
    isRead: false,
    publishedAt: toDateInputValue(new Date().toISOString()),
    targetGroupIds: [],
    sourceType: 'manual',
  };
}

export function toErpNewsFormValues(
  item?: SalesDeskErpNewsItemDto | null,
  overlay?: { module?: string; targetGroupIds?: number[]; sourceType?: string } | null
): ErpNewsFormValues {
  const moduleValue = overlay?.module ?? item?.topic ?? 'ERP';
  const normalizedModule = [
    'DEPO',
    'CRM',
    'URETIM',
    'IK',
    'GIB',
    'NETSIS',
    'ERP',
    'OTHER',
  ].includes(moduleValue.toUpperCase())
    ? (moduleValue.toUpperCase() as ErpNewsFormValues['module'])
    : 'OTHER';

  return {
    module: normalizedModule,
    title: item?.title ?? '',
    source: item?.source ?? '',
    sourceUrl: item?.sourceUrl ?? '',
    score: item?.score ?? 0,
    isCritical: item?.isCritical ?? false,
    isRead: item?.isRead ?? false,
    publishedAt: item?.publishedAt ? toDateInputValue(item.publishedAt) : toDateInputValue(new Date().toISOString()),
    targetGroupIds: overlay?.targetGroupIds ?? [],
    sourceType: overlay?.sourceType === 'external' ? 'external' : 'manual',
  };
}

export function toErpNewsPayload(values: ErpNewsFormValues): Partial<SalesDeskErpNewsItemDto> {
  return {
    topic: values.module,
    title: values.title.trim(),
    source: values.source?.trim() || undefined,
    sourceUrl: values.sourceUrl?.trim() || undefined,
    score: values.score,
    isCritical: values.isCritical,
    isRead: values.isRead,
    publishedAt: values.publishedAt,
  };
}

export const gmailFormSchema = z.object({
  gmailMessageId: z.string().trim().min(1, 'Mesaj ID zorunludur').max(120),
  sender: z.string().trim().min(1, 'Gonderen zorunludur').max(220),
  subject: z.string().trim().min(1, 'Konu zorunludur').max(220),
  preview: z.string().max(500).optional(),
  receivedAt: z.string().min(1, 'Alim tarihi zorunludur'),
  isUnread: z.boolean(),
  isMeeting: z.boolean(),
  threadId: z.string().max(120).optional(),
});

export type GmailFormValues = z.infer<typeof gmailFormSchema>;

export function toGmailFormValues(item?: SalesDeskGmailMessageDto | null): GmailFormValues {
  return {
    gmailMessageId: item?.gmailMessageId ?? '',
    sender: item?.sender ?? '',
    subject: item?.subject ?? '',
    preview: item?.preview ?? '',
    receivedAt: item?.receivedAt ? item.receivedAt.slice(0, 16) : new Date().toISOString().slice(0, 16),
    isUnread: item?.isUnread ?? true,
    isMeeting: item?.isMeeting ?? false,
    threadId: item?.threadId ?? '',
  };
}

export function toGmailPayload(values: GmailFormValues): Partial<SalesDeskGmailMessageDto> {
  return {
    gmailMessageId: values.gmailMessageId.trim(),
    sender: values.sender.trim(),
    subject: values.subject.trim(),
    preview: values.preview?.trim() || undefined,
    receivedAt: values.receivedAt,
    isUnread: values.isUnread,
    isMeeting: values.isMeeting,
    threadId: values.threadId?.trim() || undefined,
  };
}

export const productCustomerFormSchema = z.object({
  productId: customerIdSchema,
  customerId: optionalCustomerIdSchema,
  potentialCustomerId: optionalPotentialIdSchema,
});

export type ProductCustomerFormValues = z.input<typeof productCustomerFormSchema>;

export function toProductCustomerFormValues(
  productId: number,
  link?: SalesDeskProductCustomerDto | null
): ProductCustomerFormValues {
  return {
    productId: String(link?.productId ?? productId),
    customerId: idToSelectValue(link?.customerId),
    potentialCustomerId: idToSelectValue(link?.potentialCustomerId),
  };
}

export function toProductCustomerPayload(
  values: ProductCustomerFormValues
): Partial<SalesDeskProductCustomerDto> {
  const parsed = productCustomerFormSchema.parse(values);
  return {
    productId: parsed.productId,
    customerId: parsed.customerId,
    potentialCustomerId: parsed.potentialCustomerId,
  };
}
