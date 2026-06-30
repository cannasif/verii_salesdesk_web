import { z } from 'zod';

export interface ApprovalRoleDto {
  id: number;
  approvalRoleGroupId: number;
  approvalRoleGroupName?: string;
  name: string;
  maxAmount: number;
  createdDate: string;
  updatedDate?: string;
  createdBy?: string;
  createdByFullName?: string;
  createdByFullUser?: string;
}

export interface CreateApprovalRoleDto {
  approvalRoleGroupId: number;
  name: string;
  maxAmount: number;
}

export interface UpdateApprovalRoleDto {
  approvalRoleGroupId: number;
  name: string;
  maxAmount: number;
}

export interface ApprovalRoleListFilters {
  approvalRoleGroupId?: number;
  name?: string;
}

export interface ApprovalRoleFormData {
  approvalRoleGroupId: number;
  name: string;
  maxAmount: number;
}

export const approvalRoleFormSchema = z.object({
  approvalRoleGroupId: z
    .number()
    .min(1, 'approvalRole.form.approvalRoleGroupIdRequired'),
  name: z
    .string()
    .min(1, 'approvalRole.form.nameRequired')
    .max(100, 'approvalRole.form.nameMaxLength'),
  maxAmount: z
    .number()
    .min(0, 'approvalRole.form.maxAmountMin'),
});

export type ApprovalRoleFormSchema = z.infer<typeof approvalRoleFormSchema>;
