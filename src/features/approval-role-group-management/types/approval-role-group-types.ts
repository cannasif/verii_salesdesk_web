import { z } from 'zod';

export interface ApprovalRoleGroupDto {
  id: number;
  name: string;
  createdDate: string;
  updatedDate?: string;
  createdBy?: string;
  createdByFullName?: string;
  createdByFullUser?: string;
}

export interface CreateApprovalRoleGroupDto {
  name: string;
}

export interface UpdateApprovalRoleGroupDto {
  name: string;
}

export interface ApprovalRoleGroupListFilters {
  name?: string;
}

export interface ApprovalRoleGroupFormData {
  name: string;
}

export const approvalRoleGroupFormSchema = z.object({
  name: z
    .string()
    .min(1, 'approvalRoleGroup.form.nameRequired')
    .max(100, 'approvalRoleGroup.form.nameMaxLength'),
});

export type ApprovalRoleGroupFormSchema = z.infer<typeof approvalRoleGroupFormSchema>;
