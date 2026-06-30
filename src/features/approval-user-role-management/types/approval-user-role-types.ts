import { z } from 'zod';

export interface ApprovalUserRoleDto {
  id: number;
  userId: number;
  userFullName?: string;
  approvalRoleId: number;
  approvalRoleName?: string;
  createdDate: string;
  updatedDate?: string;
  createdBy?: string;
  createdByFullName?: string;
  createdByFullUser?: string;
}

export interface CreateApprovalUserRoleDto {
  userId: number;
  approvalRoleId: number;
}

export interface UpdateApprovalUserRoleDto {
  userId: number;
  approvalRoleId: number;
}

export interface ApprovalUserRoleListFilters {
  userId?: number;
  approvalRoleId?: number;
}

export interface ApprovalUserRoleFormData {
  userId: number;
  approvalRoleId: number;
}

export const approvalUserRoleFormSchema = z.object({
  userId: z
    .number()
    .min(1, 'approvalUserRole.form.userIdRequired'),
  approvalRoleId: z
    .number()
    .min(1, 'approvalUserRole.form.approvalRoleIdRequired'),
});

export type ApprovalUserRoleFormSchema = z.infer<typeof approvalUserRoleFormSchema>;
