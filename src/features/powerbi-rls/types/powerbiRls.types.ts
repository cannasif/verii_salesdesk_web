import { z } from 'zod';
import type { PagedResponse } from '@/types/api';

export interface PowerBIReportRoleMapping {
  id: number;
  powerBIReportDefinitionId: number;
  reportName: string | null;
  roleId: number;
  roleName: string | null;
  rlsRoles: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreatePowerBIReportRoleMappingDto {
  powerBIReportDefinitionId: number;
  roleId: number;
  rlsRoles: string;
}

export type UpdatePowerBIReportRoleMappingDto = CreatePowerBIReportRoleMappingDto;

export type PowerBIReportRoleMappingPagedResponse = PagedResponse<PowerBIReportRoleMapping>;

export interface UserAuthorityDto {
  id: number;
  title: string;
}

export const powerbiRlsFormSchema = z.object({
  powerBIReportDefinitionId: z.number().min(1),
  roleId: z.number().min(1),
  rlsRoles: z.string().min(1),
});

export type PowerbiRlsFormSchema = z.infer<typeof powerbiRlsFormSchema>;
