export const DOCUMENT_SERIAL_TYPE_QUERY_KEYS = {
  LIST: 'document-serial-types',
  DETAIL: 'document-serial-type',
  OPTIONS: 'document-serial-type-options',
  AVAILABLE: 'document-serial-type-available',
} as const;

export const documentSerialTypeQueryKeys = {
  list: (params?: unknown) => [DOCUMENT_SERIAL_TYPE_QUERY_KEYS.LIST, params],
  detail: (id: number) => [DOCUMENT_SERIAL_TYPE_QUERY_KEYS.DETAIL, id],
  options: () => [DOCUMENT_SERIAL_TYPE_QUERY_KEYS.OPTIONS],
  available: (customerTypeId: number, salesRepId: number, ruleType: number) => [
    DOCUMENT_SERIAL_TYPE_QUERY_KEYS.AVAILABLE,
    customerTypeId,
    salesRepId,
    ruleType,
  ],
};
