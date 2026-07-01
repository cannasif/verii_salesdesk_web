import { z } from 'zod';
import type {
  SalesDeskDocumentStatus,
  SalesDeskErpNewsItemDto,
  SalesDeskFixedAssetDto,
  SalesDeskFixedAssetStatus,
  SalesDeskGmailMessageDto,
  SalesDeskInvoiceDto,
  SalesDeskPriority,
  SalesDeskProductCustomerDto,
  SalesDeskProductDto,
  SalesDeskQuoteDto,
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
import { idToSelectValue, optionalIdFromSelect, requiredIdFromSelect, toDateInputValue, toTimeInputValue } from '../lib/salesdesk-shared';

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

const potentialStatusSchema = z
  .string()
  .min(1, 'Durum secin')
  .transform((value) => Number(value) as SalesDeskPotentialStatus);

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

const optionalVisitIdSchema = z
  .string()
  .optional()
  .transform((value) => optionalIdFromSelect(value));

const lineUpsertSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  vatRate: z.number().min(0).max(100),
});

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
  notes: z.string().max(2000).optional(),
});

export type QuoteFormValues = z.input<typeof quoteFormSchema>;

export function toQuoteFormValues(quote?: SalesDeskQuoteDto | null): QuoteFormValues {
  return {
    quoteNumber: quote?.quoteNumber ?? '',
    customerId: String(quote?.customerId ?? ''),
    quoteDate: toDateInputValue(quote?.quoteDate),
    status: String(quote?.status ?? 1),
    notes: quote?.notes ?? '',
  };
}

export function toQuotePayload(values: QuoteFormValues): Partial<SalesDeskQuoteDto> & { lines?: z.infer<typeof lineUpsertSchema>[] } {
  const parsed = quoteFormSchema.parse(values);
  return {
    quoteNumber: parsed.quoteNumber?.trim() || undefined,
    customerId: parsed.customerId,
    quoteDate: parsed.quoteDate,
    status: parsed.status,
    notes: parsed.notes?.trim() || undefined,
    lines: [],
  };
}

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().max(32).optional(),
  customerId: customerIdSchema,
  quoteId: optionalQuoteIdSchema,
  invoiceDate: z.string().min(1, 'Fatura tarihi zorunludur'),
  dueDate: z.string().min(1, 'Vade tarihi zorunludur'),
  status: documentStatusSchema,
  discountRate: z.number().min(0).max(100),
  notes: z.string().max(2000).optional(),
});

export type InvoiceFormValues = z.input<typeof invoiceFormSchema>;

export function toInvoiceFormValues(invoice?: SalesDeskInvoiceDto | null): InvoiceFormValues {
  return {
    invoiceNumber: invoice?.invoiceNumber ?? '',
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
  values: InvoiceFormValues
): Partial<SalesDeskInvoiceDto> & { lines?: z.infer<typeof lineUpsertSchema>[] } {
  const parsed = invoiceFormSchema.parse(values);
  return {
    invoiceNumber: parsed.invoiceNumber?.trim() || undefined,
    customerId: parsed.customerId,
    quoteId: parsed.quoteId,
    invoiceDate: parsed.invoiceDate,
    dueDate: parsed.dueDate,
    status: parsed.status,
    discountRate: parsed.discountRate,
    notes: parsed.notes?.trim() || undefined,
    lines: [],
  };
}

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Baslik zorunludur').max(220),
  description: z.string().max(2000).optional(),
  groupName: z.string().max(80).optional(),
  customerId: optionalCustomerIdSchema,
  priority: prioritySchema,
  status: taskStatusSchema,
  dueDate: z.string().optional(),
});

export type TaskFormValues = z.input<typeof taskFormSchema>;

export function toTaskFormValues(task?: SalesDeskTaskDto | null): TaskFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    groupName: task?.groupName ?? '',
    customerId: idToSelectValue(task?.customerId),
    priority: String(task?.priority ?? 2),
    status: String(task?.status ?? 1),
    dueDate: task?.dueDate ? toDateInputValue(task.dueDate) : '',
  };
}

export function toTaskPayload(values: TaskFormValues): Partial<SalesDeskTaskDto> {
  const parsed = taskFormSchema.parse(values);
  return {
    title: parsed.title.trim(),
    description: parsed.description?.trim() || undefined,
    groupName: parsed.groupName?.trim() || undefined,
    customerId: parsed.customerId,
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
    visitTime: parsed.visitTime || undefined,
    title: parsed.title.trim(),
    customerId: parsed.customerId,
    visitType: parsed.visitType.trim(),
    status: parsed.status,
    notes: parsed.notes?.trim() || undefined,
  };
}

export const visitFormRecordSchema = z.object({
  visitId: optionalVisitIdSchema,
  customerId: optionalCustomerIdSchema,
  title: z.string().trim().min(1, 'Baslik zorunludur').max(220),
  formDate: z.string().min(1, 'Tarih zorunludur'),
  content: z.string().max(8000).optional(),
});

export type VisitFormRecordValues = z.input<typeof visitFormRecordSchema>;

export function toVisitFormRecordValues(form?: SalesDeskVisitFormDto | null): VisitFormRecordValues {
  return {
    visitId: idToSelectValue(form?.visitId),
    customerId: idToSelectValue(form?.customerId),
    title: form?.title ?? '',
    formDate: toDateInputValue(form?.formDate),
    content: form?.content ?? '',
  };
}

export function toVisitFormRecordPayload(values: VisitFormRecordValues): Partial<SalesDeskVisitFormDto> {
  const parsed = visitFormRecordSchema.parse(values);
  return {
    visitId: parsed.visitId,
    customerId: parsed.customerId,
    title: parsed.title.trim(),
    formDate: parsed.formDate,
    content: parsed.content?.trim() || undefined,
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
  potentialCustomerId: optionalPotentialIdSchema,
  provider: z.string().trim().min(1, 'Saglayici zorunludur').max(80),
  keywords: z.string().max(500).optional(),
  host: z.string().max(220).optional(),
  sourceUrl: z.string().max(500).optional(),
  score: z.number().min(0).max(100),
  status: potentialStatusSchema,
});

export type SoftwareResearchFormValues = z.input<typeof softwareResearchFormSchema>;

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
  const parsed = softwareResearchFormSchema.parse(values);
  return {
    potentialCustomerId: parsed.potentialCustomerId,
    provider: parsed.provider.trim(),
    keywords: parsed.keywords?.trim() || undefined,
    host: parsed.host?.trim() || undefined,
    sourceUrl: parsed.sourceUrl?.trim() || undefined,
    score: parsed.score,
    status: parsed.status,
  };
}

export const erpNewsFormSchema = z.object({
  topic: z.string().trim().min(1, 'Konu zorunludur').max(80),
  title: z.string().trim().min(1, 'Baslik zorunludur').max(220),
  source: z.string().max(120).optional(),
  sourceUrl: z.string().max(500).optional(),
  score: z.number().min(0).max(10),
  isCritical: z.boolean(),
  isRead: z.boolean(),
  publishedAt: z.string().min(1, 'Yayin tarihi zorunludur'),
});

export type ErpNewsFormValues = z.infer<typeof erpNewsFormSchema>;

export function toErpNewsFormValues(item?: SalesDeskErpNewsItemDto | null): ErpNewsFormValues {
  return {
    topic: item?.topic ?? '',
    title: item?.title ?? '',
    source: item?.source ?? '',
    sourceUrl: item?.sourceUrl ?? '',
    score: item?.score ?? 0,
    isCritical: item?.isCritical ?? false,
    isRead: item?.isRead ?? false,
    publishedAt: item?.publishedAt ? toDateInputValue(item.publishedAt) : toDateInputValue(new Date().toISOString()),
  };
}

export function toErpNewsPayload(values: ErpNewsFormValues): Partial<SalesDeskErpNewsItemDto> {
  return {
    topic: values.topic.trim(),
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
