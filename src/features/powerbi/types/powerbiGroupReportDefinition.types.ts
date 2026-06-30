import { z } from 'zod';

export interface CreatePowerBIGroupReportDefinitionDto {
  groupId: number;
  reportDefinitionId: number;
}

export type UpdatePowerBIGroupReportDefinitionDto = CreatePowerBIGroupReportDefinitionDto;

export interface PowerBIGroupReportDefinitionGetDto {
  id: number;
  groupId: number;
  groupName?: string;
  reportDefinitionId: number;
  reportDefinitionName?: string;
  createdBy?: string;
  updatedBy?: string;
  createdDate: string;
  updatedDate?: string;
  deletedDate?: string;
  isDeleted: boolean;
}

export const powerbiGroupReportDefinitionFormSchema = z.object({
  groupId: z.number().int().refine((v) => v > 0, { message: 'powerbi.groupReportDefinition.groupIdRequired' }),
  reportDefinitionId: z.number().int().refine((v) => v > 0, { message: 'powerbi.groupReportDefinition.reportDefinitionIdRequired' }),
});

export type PowerBIGroupReportDefinitionFormSchema = z.infer<typeof powerbiGroupReportDefinitionFormSchema>;
