export const APPROVAL_USER_ROLE_QUERY_KEYS = {
  LIST: 'approval-user-roles',
  DETAIL: 'approval-user-role',
} as const;

export const approvalUserRoleQueryKeys = {
  list: (params?: unknown) => [APPROVAL_USER_ROLE_QUERY_KEYS.LIST, params],
  detail: (id: number) => [APPROVAL_USER_ROLE_QUERY_KEYS.DETAIL, id],
};
