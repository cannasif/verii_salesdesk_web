export interface PowerBIReportListItemDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface EmbedConfigDto {
  reportId: string;
  embedUrl: string;
  accessToken: string;
  expiration: string;
}
