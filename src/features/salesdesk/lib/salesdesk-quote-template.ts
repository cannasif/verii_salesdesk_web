export const SALESDESK_QUOTE_TEMPLATE = {
  issuerName: 'V3RII Teknoloji',
  issuerTagline: 'Kurumsal Yazılım ve Entegrasyon Çözümleri',
  coverTagline: 'Kurumsal Yazılım ve Entegrasyon Çözümleri',
  logoPath: '/v3rii-salesdesk-logo.png',

  introTitle: 'Biz Kimiz?',
  introLead:
    'V3RII Teknoloji olarak işletmelerin dijital dönüşüm süreçlerinde daha kontrollü, daha hızlı ve daha verimli çalışmasını sağlayan kurumsal yazılım çözümleri geliştiriyoruz. Depo yönetimi, Netsis entegrasyonları, Ürün Takip Sistemi (UTS), satış süreçleri, raporlama ve operasyonel iş akışları alanlarında firmaların günlük ihtiyaçlarına uygun, sahada kullanılabilir ve sürdürülebilir sistemler kurmayı hedefliyoruz.',
  introSecondary:
    'Yaklaşımımız yalnızca yazılım geliştirmekten ibaret değildir. Öncelikle firmanın mevcut çalışma düzenini, kullanıcı alışkanlıklarını, operasyon akışını ve raporlama ihtiyaçlarını analiz ederiz. Ardından bu yapıya uygun ekranları, entegrasyonları ve kontrol mekanizmalarını tasarlayarak süreçlerin tek bir dijital yapı üzerinden yönetilebilmesini sağlarız.',
  introSubtitle: 'V3RII Teknoloji — saha ihtiyaçlarını anlayan, ölçülebilir ve sürdürülebilir yazılım çözümleri',

  principlesTitle: 'Çalışma Prensibimiz',
  principles: [
    {
      title: '1. Analiz ve Doğru Kapsam',
      description:
        'Süreçler yerinde veya uzaktan değerlendirilir; ihtiyaçlar, öncelikler ve entegrasyon noktaları netleştirilir.',
    },
    {
      title: '2. Kullanıcı Odaklı Ekranlar',
      description:
        'Sahada hızlı işlem yapılmasını sağlayan, sade ve anlaşılır ekran akışları tasarlanır.',
    },
    {
      title: '3. Güvenilir Entegrasyon',
      description:
        'Netsis ve ilgili sistemlerle uyumlu veri akışları kurularak manuel işlem ve veri uyuşmazlığı azaltılır.',
    },
    {
      title: '4. Test ve Canlı Destek',
      description:
        'Teslim edilen yapı test edilir, kullanıcılar yönlendirilir ve canlı kullanım sonrası destek süreci yürütülür.',
    },
  ],

  expertiseTitle: 'Uzmanlık Alanlarımız',
  expertise: [
    {
      title: 'WMS',
      description: 'Mal kabul, stok, sayım, sevkiyat, depo kontrolü ve el terminali operasyonları.',
    },
    {
      title: 'CRM',
      description:
        'Müşteri yönetimi, teklif, sipariş, satış takibi, aktivite yönetimi ve raporlama süreçleri için özel CRM çözümleri.',
    },
    {
      title: 'Netsis',
      description: 'ERP entegrasyonu, veri aktarımı, kontrol raporları ve operasyonel otomasyonlar.',
    },
  ],

  defaultNotes: [
    'Fiyatlara KDV dahil değildir.',
    'Ek geliştirme, yeni modül, ilave rapor veya kapsam dışı entegrasyon talepleri ayrıca değerlendirilir ve fiyatlandırılır. Yıllık bakım ücreti ana lisans bedelinin %20’sidir.',
    'Proje sürecinde analiz, kurulum, test ve canlı kullanım desteği aşamaları planlı şekilde yürütülür.',
  ],

  infoCards: [
    {
      title: 'Kapsam',
      description: 'Kurulum, entegrasyon, test ve canlıya geçiş sürecini kapsar.',
    },
    {
      title: 'Destek',
      description: 'Yıllık destek paketi periyodik kontrol ve kullanıcı desteğini içerir.',
    },
    {
      title: 'Faturalandırma',
      description: 'Bedeller TL olarak hazırlanmıştır ve KDV ayrıca uygulanır.',
    },
  ],

  footerLine: 'V3RII Teknoloji | Kurumsal Yazılım ve Entegrasyon Çözümleri',
} as const;

export function formatQuoteAmountLabel(amount: number): string {
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} TL + KDV`;
}

export function formatQuoteDisplayDate(value?: string): string {
  if (!value) return new Intl.DateTimeFormat('tr-TR').format(new Date());
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
