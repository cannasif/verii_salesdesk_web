export type BrandTheme =
  | 'v3rii-merkez'
  | 'gece-operasyonu'
  | 'canli-satis'
  | 'minimal-masa'
  | 'yonetici'
  | 'kurumsal-lacivert'
  | 'gun-batimi'
  | 'okyanus-briz'
  | 'bordo-klasik'
  | 'platin-karbon';

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
  {
    id: 'kurumsal-lacivert',
    label: 'Kurumsal Lacivert',
    description: 'Güven veren, profesyonel mavi tonlarında kurumsal görünüm.',
    className: 'theme-kurumsal-lacivert',
    swatches: ['#1e40af', '#2563eb', '#0ea5e9'],
    baseAppearance: 'light',
  },
  {
    id: 'gun-batimi',
    label: 'Gün Batımı',
    description: 'Sıcak turuncu ve kehribar aksanlı, akşam odaklı koyu tema.',
    className: 'theme-gun-batimi',
    swatches: ['#7c2d12', '#ea580c', '#f97316'],
    baseAppearance: 'dark',
  },
  {
    id: 'okyanus-briz',
    label: 'Okyanus Briz',
    description: 'Ferah turkuaz ve camgöbeği tonlarında aydınlık çalışma alanı.',
    className: 'theme-okyanus-briz',
    swatches: ['#0891b2', '#06b6d4', '#0e7490'],
    baseAppearance: 'light',
  },
  {
    id: 'bordo-klasik',
    label: 'Bordo Klasik',
    description: 'Zarif bordo ve şarap tonlarında yönetici paneli hissi.',
    className: 'theme-bordo-klasik',
    swatches: ['#881337', '#9f1239', '#be123c'],
    baseAppearance: 'dark',
  },
  {
    id: 'platin-karbon',
    label: 'Platin Karbon',
    description: 'Nötr grafit yüzeyler üzerinde camgöbeği vurgulu modern tema.',
    className: 'theme-platin-karbon',
    swatches: ['#334155', '#475569', '#22d3ee'],
    baseAppearance: 'dark',
  },
] as const;

export const DEFAULT_BRAND_THEME: BrandTheme = 'v3rii-merkez';

export function getBrandThemeDefinition(id: BrandTheme): BrandThemeDefinition {
  return brandThemes.find((theme) => theme.id === id) ?? brandThemes[0];
}
