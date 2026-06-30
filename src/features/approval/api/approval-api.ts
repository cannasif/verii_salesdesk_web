import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  ApprovalQueueGetDto,
  ApprovalNoteDto,
  QuotationDetailDto,
  ApprovalTransactionDto,
  ApprovalStatus,
} from '../types/approval-types';

export const approvalApi = {
  getPending: async (): Promise<ApprovalQueueGetDto[]> => {
    const response = await api.get<ApiResponse<ApprovalQueueGetDto[]>>('/api/approval/pending');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Bekleyen onaylar yüklenemedi');
  },

  approve: async (queueId: number, data: ApprovalNoteDto): Promise<ApiResponse<boolean>> => {
    const response = await api.post<ApiResponse<boolean>>(`/api/approval/${queueId}/approve`, data);
    return response;
  },

  reject: async (queueId: number, data: ApprovalNoteDto): Promise<ApiResponse<boolean>> => {
    const response = await api.post<ApiResponse<boolean>>(`/api/approval/${queueId}/reject`, data);
    return response;
  },

  getQuotationStatus: async (quotationId: number): Promise<ApprovalStatus> => {
    const response = await api.get<ApiResponse<ApprovalStatus>>(`/api/approval/quotation/${quotationId}/status`);
    if (response.success && response.data !== undefined) {
      return response.data;
    }
    throw new Error(response.message || 'Teklif durumu yüklenemedi');
  },

  getQuotationDetail: async (quotationId: number): Promise<QuotationDetailDto> => {
    const response = await api.get<ApiResponse<QuotationDetailDto>>(`/api/quotation/${quotationId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Teklif detayı yüklenemedi');
  },

  getApprovalHistory: async (quotationId: number): Promise<ApprovalTransactionDto[]> => {
    const response = await api.get<ApiResponse<ApprovalTransactionDto[]>>(
      `/api/approval-transaction?documentId=${quotationId}`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Onay geçmişi yüklenemedi');
  },
};
