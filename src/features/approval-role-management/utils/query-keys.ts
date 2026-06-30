export const APPROVAL_ROLE_QUERY_KEYS = {
  LIST: 'approval-roles',
  DETAIL: 'approval-role',
  OPTIONS: 'approval-role-options',
} as const;

export const approvalRoleQueryKeys = {
  list: (params?: unknown) => [APPROVAL_ROLE_QUERY_KEYS.LIST, params],
  detail: (id: number) => [APPROVAL_ROLE_QUERY_KEYS.DETAIL, id],
  options: () => [APPROVAL_ROLE_QUERY_KEYS.OPTIONS],
};
