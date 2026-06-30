export const REPORT_TEMPLATE_QUERY_KEYS = {
  LIST: 'report-template.list',
  ITEM: 'report-template.item',
  FIELDS: 'report-template.fields',
} as const;

export const reportTemplateQueryKeys = {
  list: () => [REPORT_TEMPLATE_QUERY_KEYS.LIST] as const,
  item: (id: number) => [REPORT_TEMPLATE_QUERY_KEYS.ITEM, id] as const,
  fields: (ruleType: number) => [REPORT_TEMPLATE_QUERY_KEYS.FIELDS, ruleType] as const,
};
