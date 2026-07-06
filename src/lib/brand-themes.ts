export type BrandTheme = 'v3rii-merkez' | 'gece-operasyonu' | 'canli-satis' | 'minimal-masa' | 'yonetici';

export type BrandThemeDefinition = {
  id: BrandTheme;
  label: string;
  description: string;
  className: string;
  swatches: readonly [string, string, string];
  baseAppearance: 'light' | 'dark';
};

export const brandThemes: readonly BrandThemeDefinition[] = [
  {
    id: 'v3rii-merkez',
    label: 'V3RII Merkez',
    description: 'Orijinal V3RII sarı ve koyu füme marka kimliği.',
    className: 'theme-v3rii-merkez',
    swatches: ['#fbbf24', '#f59e0b', '#d97706'],
    baseAppearance: 'dark',
  },
  {
    id: 'gece-operasyonu',
    label: 'Gece Operasyonu',
    description: 'Göz yormayan, düşük kontrastlı koyu mavi ve gri tonları.',
    className: 'theme-gece-operasyonu',
    swatches: ['#1e293b', '#334155', '#3b82f6'],
    baseAppearance: 'dark',
  },
  {
    id: 'canli-satis',
    label: 'Canlı Satış',
    description: 'Enerjik, dikkat çekici ve aydınlık zümrüt yeşili teması.',
    className: 'theme-canli-satis',
    swatches: ['#10b981', '#059669', '#047857'],
    baseAppearance: 'light',
  },
  {
    id: 'minimal-masa',
    label: 'Minimal Masa',
    description: 'Odaklanmayı artıran, sadeleştirilmiş aydınlık ofis görünümü.',
    className: 'theme-minimal-masa',
    swatches: ['#f8fafc', '#e2e8f0', '#94a3b8'],
    baseAppearance: 'light',
  },
  {
    id: 'yonetici',
    label: 'Yönetici',
    description: 'Premium hissi veren mor ve lacivert ağırlıklı yönetim paneli.',
    className: 'theme-yonetici',
    swatches: ['#312e81', '#4f46e5', '#6366f1'],
    baseAppearance: 'dark',
  },
] as const;

export const DEFAULT_BRAND_THEME: BrandTheme = 'v3rii-merkez';
