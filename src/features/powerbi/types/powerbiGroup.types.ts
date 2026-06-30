import { z } from 'zod';

export interface CreatePowerBIGroupDto {
  name: string;
  description?: string;
  isActive: boolean;
}

export type UpdatePowerBIGroupDto = CreatePowerBIGroupDto;

export interface PowerBIGroupGetDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdDate: string;
  updatedDate?: string;
  deletedDate?: string;
  isDeleted: boolean;
}

export const powerbiGroupFormSchema = z.object({
  name: z.string().min(1, 'powerbi.group.nameRequired').max(200, 'powerbi.group.nameMaxLength'),
  description: z.string().max(500).optional().or(z.literal('')),
  isActive: z.boolean(),
});

export type PowerBIGroupFormSchema = z.infer<typeof powerbiGroupFormSchema>;
