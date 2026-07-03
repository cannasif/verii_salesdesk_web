export type SalesDeskSettingsTab = 'profile' | 'appearance' | 'mail' | 'admin';

export const SETTINGS_TABS: {
  id: SalesDeskSettingsTab;
  label: string;
  description: string;
}[] = [
  { id: 'profile', label: 'Profilim', description: 'Hesap bilgileri ve sifre' },
  { id: 'appearance', label: 'Gorunum', description: 'Acik ve koyu tema' },
  { id: 'mail', label: 'E-posta', description: 'SMTP ve bildirim postasi' },
  { id: 'admin', label: 'Yonetim', description: 'Ortam bilgileri ve baglantilar' },
];

export function parseSettingsTab(value: string | null): SalesDeskSettingsTab {
  if (value === 'appearance' || value === 'mail' || value === 'admin') {
    return value;
  }
  return 'profile';
}
