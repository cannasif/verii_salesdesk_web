export const DASHBOARD_QUERY_KEYS = {
  DATA: 'dashboard.data',
  CURRENCY_RATES: 'dashboard.currencyRates',
} as const;

export const queryKeys = {
  dashboard: () => [DASHBOARD_QUERY_KEYS.DATA] as const,
  currencyRates: () => [DASHBOARD_QUERY_KEYS.CURRENCY_RATES] as const,
};
