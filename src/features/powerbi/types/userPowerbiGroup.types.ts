import { z } from 'zod';

export interface CreateUserPowerBIGroupDto {
  userId: number;
  groupId: number;
}

export type UpdateUserPowerBIGroupDto = CreateUserPowerBIGroupDto;

export interface UserPowerBIGroupGetDto {
  id: number;
  userId: number;
  userName?: string;
  groupId: number;
  groupName?: string;
  createdBy?: string;
  updatedBy?: string;
  createdDate: string;
  updatedDate?: string;
  deletedDate?: string;
  isDeleted: boolean;
}

export const userPowerbiGroupFormSchema = z.object({
  userId: z.number().int().refine((v) => v > 0, { message: 'powerbi.userGroup.userIdRequired' }),
  groupId: z.number().int().refine((v) => v > 0, { message: 'powerbi.userGroup.groupIdRequired' }),
});

export type UserPowerBIGroupFormSchema = z.infer<typeof userPowerbiGroupFormSchema>;
