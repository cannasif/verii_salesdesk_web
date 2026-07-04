import { z } from 'zod';

export interface SalesDeskCompanyDto {
  id: number;
  name: string;
  ipAddress: string;
  ipUsername: string;
  ipPassword: string;
  vpnName: string;
  vpnUsername: string;
  vpnPassword: string;
  vpnIpAddress: string;
  vpnPort: string;
  databaseUsername: string;
  databasePassword: string;
  loginUrl: string;
  description: string;
  description1: string;
  createdAt?: string;
  updatedAt?: string;
}

export const salesDeskCompanyFormSchema = z.object({
  name: z.string().trim().min(1, 'Sirket adi zorunludur').max(220),
  ipAddress: z.string().trim().max(120).optional().or(z.literal('')),
  ipUsername: z.string().trim().max(120).optional().or(z.literal('')),
  ipPassword: z.string().trim().max(200).optional().or(z.literal('')),
  vpnName: z.string().trim().max(120).optional().or(z.literal('')),
  vpnUsername: z.string().trim().max(120).optional().or(z.literal('')),
  vpnPassword: z.string().trim().max(200).optional().or(z.literal('')),
  vpnIpAddress: z.string().trim().max(120).optional().or(z.literal('')),
  vpnPort: z.string().trim().max(20).optional().or(z.literal('')),
  databaseUsername: z.string().trim().max(120).optional().or(z.literal('')),
  databasePassword: z.string().trim().max(200).optional().or(z.literal('')),
  loginUrl: z.string().trim().max(500).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  description1: z.string().trim().max(1000).optional().or(z.literal('')),
});

export type SalesDeskCompanyFormValues = z.infer<typeof salesDeskCompanyFormSchema>;

export function toCompanyFormValues(company?: SalesDeskCompanyDto | null): SalesDeskCompanyFormValues {
  return {
    name: company?.name ?? '',
    ipAddress: company?.ipAddress ?? '',
    ipUsername: company?.ipUsername ?? '',
    ipPassword: company?.ipPassword ?? '',
    vpnName: company?.vpnName ?? '',
    vpnUsername: company?.vpnUsername ?? '',
    vpnPassword: company?.vpnPassword ?? '',
    vpnIpAddress: company?.vpnIpAddress ?? '',
    vpnPort: company?.vpnPort ?? '',
    databaseUsername: company?.databaseUsername ?? '',
    databasePassword: company?.databasePassword ?? '',
    loginUrl: company?.loginUrl ?? '',
    description: company?.description ?? '',
    description1: company?.description1 ?? '',
  };
}

export function toCompanyUpsertPayload(values: SalesDeskCompanyFormValues): Omit<SalesDeskCompanyDto, 'id'> {
  return {
    name: values.name.trim(),
    ipAddress: values.ipAddress?.trim() ?? '',
    ipUsername: values.ipUsername?.trim() ?? '',
    ipPassword: values.ipPassword?.trim() ?? '',
    vpnName: values.vpnName?.trim() ?? '',
    vpnUsername: values.vpnUsername?.trim() ?? '',
    vpnPassword: values.vpnPassword?.trim() ?? '',
    vpnIpAddress: values.vpnIpAddress?.trim() ?? '',
    vpnPort: values.vpnPort?.trim() ?? '',
    databaseUsername: values.databaseUsername?.trim() ?? '',
    databasePassword: values.databasePassword?.trim() ?? '',
    loginUrl: values.loginUrl?.trim() ?? '',
    description: values.description?.trim() ?? '',
    description1: values.description1?.trim() ?? '',
  };
}

export function maskSecret(value?: string | null): string {
  const trimmed = value?.trim();
  if (!trimmed) return '-';
  return '••••••';
}
