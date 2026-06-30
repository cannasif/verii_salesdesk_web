import { z } from 'zod';

export interface PowerBIConfigurationGetDto {
  id: number;
  tenantId: string;
  clientId: string;
  workspaceId: string;
  apiBaseUrl?: string;
  scope?: string;
  createdDate: string;
  updatedDate?: string;
}

export interface CreatePowerBIConfigurationDto {
  tenantId: string;
  clientId: string;
  workspaceId: string;
  apiBaseUrl?: string;
  scope?: string;
}

export type UpdatePowerBIConfigurationDto = CreatePowerBIConfigurationDto;

export const powerbiConfigurationFormSchema = z.object({
  tenantId: z.string().min(1, 'powerbiConfiguration.tenantIdRequired'),
  clientId: z.string().min(1, 'powerbiConfiguration.clientIdRequired'),
  workspaceId: z.string().uuid('powerbiConfiguration.workspaceIdInvalid'),
  apiBaseUrl: z.union([z.string().url(), z.literal('')]).optional(),
  scope: z.string().optional().or(z.literal('')),
});

export type PowerBIConfigurationFormSchema = z.infer<typeof powerbiConfigurationFormSchema>;

export const DEFAULT_API_BASE_URL = 'https://api.powerbi.com';
export const DEFAULT_SCOPE = 'https://analysis.windows.net/powerbi/api/.default';
