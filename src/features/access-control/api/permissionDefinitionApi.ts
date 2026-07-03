import type { AxiosRequestConfig } from 'axios';
import { api } from '@/lib/axios';
import { extractData } from '../utils/extract-api-data';
import type {
  ApiResponse,
  PagedRequest,
  PagedResponse,
  PermissionDefinitionDto,
  CreatePermissionDefinitionDto,
  UpdatePermissionDefinitionDto,
  SyncPermissionDefinitionsDto,
  PermissionDefinitionSyncResultDto,
} from '../types/access-control.types';

export const permissionDefinitionApi = {
  getList: async (params: PagedRequest): Promise<PagedResponse<PermissionDefinitionDto>> => {
    const response = await api.post<ApiResponse<PagedResponse<PermissionDefinitionDto>>>(
      '/api/permission-definitions/query',
      {
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 10,
        search: params.search ?? '',
        sortBy: params.sortBy ?? 'id',
        sortDirection: params.sortDirection ?? 'asc',
        filterLogic: params.filterLogic ?? 'and',
        filters: params.filters ?? [],
      }
    );
    const data = extractData(response as ApiResponse<PagedResponse<PermissionDefinitionDto>>);
    const rawData = data as unknown as { items?: PermissionDefinitionDto[]; data?: PermissionDefinitionDto[] };
    if (rawData.items && !rawData.data) {
      return { ...data, data: rawData.items };
    }
    return data;
  },

  // The API clamps server-side page size (max 200), and definitions are sorted by
  // code so salesdesk.* entries fall late. Loop every page to get the full set.
  getAll: async (): Promise<PermissionDefinitionDto[]> => {
    const all: PermissionDefinitionDto[] = [];
    let pageNumber = 1;
    const pageSize = 200;
    // Hard cap to avoid an accidental infinite loop if the API misreports paging.
    const maxPages = 50;
    for (let i = 0; i < maxPages; i += 1) {
      const page = await permissionDefinitionApi.getList({
        pageNumber,
        pageSize,
        sortBy: 'code',
        sortDirection: 'asc',
      });
      all.push(...page.data);
      if (!page.hasNextPage || page.data.length === 0) break;
      pageNumber += 1;
    }
    return all;
  },

  getById: async (id: number): Promise<PermissionDefinitionDto> => {
    const response = await api.get<ApiResponse<PermissionDefinitionDto>>(
      `/api/permission-definitions/${id}`
    );
    return extractData(response as ApiResponse<PermissionDefinitionDto>);
  },

  create: async (dto: CreatePermissionDefinitionDto): Promise<PermissionDefinitionDto> => {
    const response = await api.post<ApiResponse<PermissionDefinitionDto>>(
      '/api/permission-definitions',
      dto
    );
    return extractData(response as ApiResponse<PermissionDefinitionDto>);
  },

  update: async (
    id: number,
    dto: UpdatePermissionDefinitionDto
  ): Promise<PermissionDefinitionDto> => {
    const response = await api.put<ApiResponse<PermissionDefinitionDto>>(
      `/api/permission-definitions/${id}`,
      dto
    );
    return extractData(response as ApiResponse<PermissionDefinitionDto>);
  },



  sync: async (
    dto: SyncPermissionDefinitionsDto,
    config?: AxiosRequestConfig
  ): Promise<PermissionDefinitionSyncResultDto> => {
    const response = await api.post<ApiResponse<PermissionDefinitionSyncResultDto>>(
      '/api/permission-definitions/sync',
      dto,
      config
    );
    return extractData(response as ApiResponse<PermissionDefinitionSyncResultDto>);
  },
  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<object>>(`/api/permission-definitions/${id}`);
    if (!(response as ApiResponse<object>).success) {
      throw new Error((response as ApiResponse<object>).message || 'Delete failed');
    }
  },
};
