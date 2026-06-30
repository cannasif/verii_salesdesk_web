import { api } from '@/lib/axios';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type {
  DocumentRuleType,
  ReportTemplateDataDto,
  ReportTemplateFieldsDto,
  ReportTemplateGetDto,
  ReportTemplateCreateDto,
  ReportTemplateUpdateDto,
} from '../types/report-template-types';

function isSuccess(response: unknown): boolean {
  if (response == null || typeof response !== 'object') return false;
  const r = response as Record<string, unknown>;
  return r.success === true || r.Success === true;
}

function getResponseData<T>(response: unknown): T | null {
  if (response == null || typeof response !== 'object') return null;
  const r = response as Record<string, unknown>;
  return (r.data ?? r.Data ?? null) as T | null;
}

function normalizeTemplateItem(item: unknown): ReportTemplateGetDto {
  const r = item != null && typeof item === 'object' ? (item as Record<string, unknown>) : {};
  const id = r.id ?? r.Id ?? 0;
  const ruleType = r.ruleType ?? r.RuleType ?? 0;
  const title = r.title ?? r.Title ?? '';
  const isActive = r.isActive ?? r.IsActive ?? false;
  let templateData = (r.templateData ?? r.TemplateData) as ReportTemplateDataDto | undefined;
  if (templateData == null) {
    const templateJson = r.templateJson ?? r.TemplateJson;
    if (typeof templateJson === 'string') {
      try {
        templateData = JSON.parse(templateJson) as ReportTemplateDataDto;
      } catch {
        templateData = { page: { width: 794, height: 1123, unit: 'px' }, elements: [] };
      }
    } else if (templateJson != null && typeof templateJson === 'object') {
      templateData = templateJson as ReportTemplateDataDto;
    } else {
      templateData = { page: { width: 794, height: 1123, unit: 'px' }, elements: [] };
    }
  }
  const elements =
    templateData.elements ??
    (templateData as unknown as Record<string, unknown>).Elements ??
    [];
  const page =
    templateData.page ?? (templateData as unknown as Record<string, unknown>).Page ?? {
      width: 794,
      height: 1123,
      unit: 'px',
    };
  const normalizedData: ReportTemplateDataDto = {
    page: page as ReportTemplateDataDto['page'],
    elements: Array.isArray(elements) ? elements : [],
  };
  const isDefault = Boolean(r.default ?? r.Default ?? false);
  return {
    id: Number(id),
    ruleType: Number(ruleType) as DocumentRuleType,
    title: String(title),
    templateData: normalizedData,
    isActive: Boolean(isActive),
    default: isDefault,
  };
}

function toTemplateList(raw: unknown): ReportTemplateGetDto[] {
  if (Array.isArray(raw)) return raw.map(normalizeTemplateItem);
  if (raw == null || typeof raw !== 'object') return [];
  const paged = raw as Record<string, unknown>;
  const arr = (paged.items ?? paged.Items ?? paged.data ?? paged.Data) as unknown;
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeTemplateItem);
}

export const reportTemplateApi = {
  getFields: async (ruleType: DocumentRuleType | number): Promise<ReportTemplateFieldsDto> => {
    const response = await api.get<ApiResponse<ReportTemplateFieldsDto>>(
      `/api/ReportTemplate/fields/${ruleType}`
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Alan listesi yüklenemedi');
  },

  getList: async (): Promise<ReportTemplateGetDto[]> => {
    const response = await api.get<unknown>('/api/ReportTemplate');
    if (!isSuccess(response)) {
      const r = response as Record<string, unknown>;
      throw new Error((r.message ?? r.Message ?? 'Şablon listesi yüklenemedi') as string);
    }
    const raw = getResponseData<ReportTemplateGetDto[] | PagedResponse<ReportTemplateGetDto>>(
      response
    );
    return raw != null ? toTemplateList(raw) : [];
  },

  getById: async (id: number): Promise<ReportTemplateGetDto> => {
    const response = await api.get<unknown>(`/api/ReportTemplate/${id}`);
    if (!isSuccess(response)) {
      const r = response as Record<string, unknown>;
      throw new Error((r.message ?? r.Message ?? 'Şablon yüklenemedi') as string);
    }
    const raw = getResponseData<ReportTemplateGetDto>(response);
    if (raw == null) throw new Error('Şablon yüklenemedi');
    return normalizeTemplateItem(raw);
  },

  create: async (data: ReportTemplateCreateDto): Promise<ReportTemplateGetDto> => {
    const response = await api.post<ApiResponse<ReportTemplateGetDto>>('/api/ReportTemplate', data);
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Şablon kaydedilemedi');
  },

  update: async (id: number, data: ReportTemplateUpdateDto): Promise<ReportTemplateGetDto> => {
    const response = await api.put<ApiResponse<ReportTemplateGetDto>>(
      `/api/ReportTemplate/${id}`,
      data
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Şablon güncellenemedi');
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<unknown>>(`/api/ReportTemplate/${id}`);
    if (!response.success) throw new Error(response.message ?? 'Şablon silinemedi');
  },

  generatePdf: async (templateId: number, entityId: number): Promise<Blob> => {
    const response = await api.post<Blob>(
      '/api/ReportTemplate/generate-pdf',
      { templateId, entityId },
      { responseType: 'blob' }
    );
    return response as unknown as Blob;
  },
};
