export interface PowerBIReportSyncResultDto {
  totalRemote: number;
  created: number;
  updated: number;
  reactivated: number;
  deleted: number;
}

export interface PowerBIReportSyncResponse {
  success: boolean;
  message: string;
  data: PowerBIReportSyncResultDto;
  statusCode: number;
}
