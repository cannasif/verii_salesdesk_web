/** Tablo listeleri: hata sonrasi otomatik yeniden deneme/refetch dongusunu engeller. */
export const DATA_TABLE_QUERY_OPTIONS = {
  retry: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
} as const;
