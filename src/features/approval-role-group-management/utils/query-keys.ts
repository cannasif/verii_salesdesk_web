export const APPROVAL_ROLE_GROUP_QUERY_KEYS = {
  LIST: 'approval-role-groups',
  DETAIL: 'approval-role-group',
  STATS: 'approval-role-group-stats',
} as const;

export const approvalRoleGroupQueryKeys = {
  list: (params?: unknown) => [APPROVAL_ROLE_GROUP_QUERY_KEYS.LIST, params],
  detail: (id: number) => [APPROVAL_ROLE_GROUP_QUERY_KEYS.DETAIL, id],
  stats: () => [APPROVAL_ROLE_GROUP_QUERY_KEYS.STATS],
};
