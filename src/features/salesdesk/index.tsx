import { type ReactElement, type ReactNode, useState } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  Columns3,
  CreditCard,
  Download,
  Edit3,
  FileText,
  Filter,
  Home,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Trash2,
  UsersRound,
} from 'lucide-react';

type IconComponent = typeof Home;

type Variant = 'blue' | 'green' | 'pink' | 'yellow' | 'cyan' | 'red' | 'purple';

interface Metric {
  label: string;
  value: string;
  hint?: string;
  variant?: Variant;
}

interface Row {
  [key: string]: string | number | undefined;
}

const variantText: Record<Variant, string> = {
  blue: 'text-blue-300',
  green: 'text-emerald-300',
  pink: 'text-pink-300',
  yellow: 'text-amber-300',
  cyan: 'text-cyan-300',
  red: 'text-rose-300',
  purple: 'text-violet-300',
};

const surfaceClass = 'border border-white/10 bg-[#0d1222]/72 shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_18px_48px_rgba(0,0,0,.18)] backdrop-blur-xl';
const fieldClass = 'h-11 rounded-lg border border-white/10 bg-[#070a13]/85 px-4 text-sm text-slate-200 outline-none transition focus:border-violet-400/70 focus:ring-4 focus:ring-violet-500/10';

const customers = [
  ['CR1001', 'ABC Teknoloji A.S.', 'Ahmet Yilmaz', '0212 555 0101', 'ahmet@abctek.com', 'Musteri', '₺45.000,00', 'Istanbul'],
  ['CR1002', 'Delta Yazilim Ltd.', 'Mehmet Kaya', '0312 555 0202', 'mehmet@delta.com', 'Musteri', '₺28.500,00', 'Ankara'],
  ['CR1008', 'denem', 'efe', '13131', '31313131', 'Musteri', '₺0,00', ''],
  ['CR1007', 'efe', 'efe', '01241412421', 'alagozefe331@gmail.com', 'Tedarikci', '₺0,00', ''],
  ['CR1005', 'Global Dijital A.S.', 'Zeynep Arslan', '0242 555 0505', 'zeynep@global.com', 'Musteri', '₺67.500,00', 'Antalya'],
  ['CR1004', 'TechSupply Tedarik', 'Can Ozturk', '0216 555 0404', 'can@techsupply.com', 'Tedarikci', '-₺12.000,00', 'Istanbul'],
  ['CR1006', 'V3RII Partner Teknoloji', 'Selin Acar', '0212 555 0909', 'selin@v3partner.com', 'Musteri', '₺92.000,00', 'Istanbul'],
];

const potentials = [
  ['POT001', 'Anadolu Lojistik Ltd.', 'Burak Sen', '0332 555 0606', 'burak@anadoluloj.com', 'Konya', 'Selcuklu'],
  ['PTC0001', 'deneme', 'efe', '0553050350305', 'alagozefe331@gmail.com', 'Izmir', 'Caymahalle'],
  ['POT003', 'Ege Gida A.S.', 'Murat Aydin', '0232 555 0808', 'murat@egegida.com', 'Izmir', 'Bornova'],
  ['POT004', 'Karadeniz Orman Urunleri', 'Hakan Yildiz', '0462 555 1010', 'hakan@kador.com', 'Trabzon', 'Ortahisar'],
  ['POT002', 'Marmara Tekstil San.', 'Elif Koc', '0224 555 0707', 'elif@marmaratek.com', 'Bursa', 'Nilufer'],
  ['CR1003', 'Nova Endustri A.S.', 'Ayse Demir', '0232 555 0303', 'ayse@nova.com', 'Izmir', 'Konak'],
];

const products = [
  ['STK006', 'Bulut Yedekleme 1TB', 'Hizmet', 'Yil', '₺1.800,00', '100.00', '10.00'],
  ['STK008', 'SalesDesk Modulu Entegrasyon', 'Yazilim', 'Adet', '₺11.000,00', '18.00', '3.00'],
  ['STK009', 'deneme', '', 'Adet', '₺350,00', '0.00', '0.00'],
  ['STK003', 'J-HR Insan Kaynaklari Paketi', 'IK', 'Adet', '₺15.000,00', '30.00', '4.00'],
  ['STK002', 'Logo Tiger 3 Kurumsal', 'ERP', 'Adet', '₺26.000,00', '25.00', '3.00'],
  ['STK001', 'Netsis Wings ERP Lisansi', 'ERP', 'Adet', '₺32.000,00', '40.00', '5.00'],
  ['STK005', 'Network Switch 24 Port', 'Donanim', 'Adet', '₺5.800,00', '6.00', '10.00'],
  ['STK004', 'Sunucu Bakim Hizmeti', 'Hizmet', 'Saat', '₺1.200,00', '200.00', '20.00'],
];

const quotes = [
  ['TKL2026000011', 'Anadolu Lojistik Ltd.', '30.06.2026', 'Taslak', '₺11.000,00', '₺13.200,00'],
  ['TKL2026000009', 'Anadolu Lojistik Ltd.', '29.06.2026', 'Taslak', '₺350,00', '₺420,00'],
  ['TKL2026000010', 'efe', '29.06.2026', 'Taslak', '₺350,00', '₺420,00'],
  ['TKL2026000007', 'Anadolu Lojistik Ltd.', '28.06.2026', 'Taslak', '₺41.120,00', '₺49.344,00'],
  ['TKL2026000004', 'Nova Endustri A.S.', '27.06.2026', 'Taslak', '₺41.120,00', '₺49.344,00'],
  ['TKL2026000006', 'V3RII Partner Teknoloji', '25.06.2026', 'Onaylandi', '₺41.120,00', '₺49.344,00'],
  ['TKL2026000003', 'Global Dijital A.S.', '23.06.2026', 'Siparise Dondu', '₺41.120,00', '₺49.344,00'],
];

const invoices = [
  ['FTR2026000009', 'Delta Yazilim Ltd.', '30.06.2026', '30.07.2026', 'Kesildi', '₺62.544,00'],
  ['FTR2026000008', 'Global Dijital A.S.', '29.06.2026', '02.07.2026', 'Kesildi', '₺6.960,00'],
  ['FTR2026000007', 'Marmara Tekstil San.', '29.06.2026', '29.07.2026', 'Kesilecek', '₺49.344,00'],
  ['FTR2026000006', 'Delta Yazilim Ltd.', '28.06.2026', '04.07.2026', 'Kesilecek', '₺18.000,00'],
  ['FTR2026000005', 'V3RII Partner Teknoloji', '27.06.2026', '27.07.2026', 'Kesildi', '₺49.344,00'],
];

const tasks = [
  ['Nova demo hazirligi', 'Dusuk', 'Acik', '28.06.2026', 'Nova Endustri...'],
  ['Delta fatura kesimi', 'Kritik', 'Acik', '29.06.2026', 'Delta Yazilim L...'],
  ['ABC Teknoloji teklif takibi', 'Yuksek', 'Devam Ediyor', '01.07.2026', 'ABC Teknoloji...'],
  ['Anadolu Lojistik Netsis teklifi', 'Yuksek', 'Devam Ediyor', '02.07.2026', 'Anadolu Lojisti...'],
  ['V3RII Partner SLA yenileme', 'Orta', 'Devam Ediyor', '04.07.2026', 'V3RII Partner T...'],
];

const visits = [
  ['29.06.2026', '10:00', 'Netsis yenileme gorusmesi', 'ABC Teknoloji...', 'Yuz Yuze', 'Planlandi'],
  ['29.06.2026', '10:00', 'deneme', '', 'Yuz Yuze', 'Planlandi'],
  ['30.06.2026', '11:00', 'Potansiyel tanisma', 'Nova Endustri...', 'Telefon', 'Yapildi'],
  ['30.06.2026', '14:30', 'Logo Tiger demo', 'Delta Yazilim L...', 'Online', 'Planlandi'],
];

const assets = [
  ['DMR001', 'Dell PowerEdge R740 Sunucu', 'BT Altyapi', '29.06.2026', '₺85.000,00', 'Aktif'],
  ['DMR002', 'HP LaserJet Pro Yazici', 'Ofis', '29.06.2026', '₺12.000,00', 'Aktif'],
  ['DMR003', 'Toplanti Masasi 12 Kisilik', 'Ofis', '29.06.2026', '₺4.500,00', 'Aktif'],
  ['DMR004', 'Lenovo ThinkPad T14 (Satis)', 'BT', '29.06.2026', '₺28.000,00', 'Aktif'],
  ['DMR005', 'Eski Projeksiyon', 'Ofis', '29.06.2026', '₺3.500,00', 'Hurda'],
];

const payments = [
  ['Ofis Kira', 'Gider', 'Genel Gider', '1', '₺25.000,00', ''],
  ['Bulut Hosting', 'Gider', 'Altyapi', '15', '₺3.500,00', 'TechSupply Te...'],
  ['Microsoft 365 Abonelik', 'Gider', 'Yazilim', '20', '₺1.200,00', ''],
  ['deneme', 'Gider', 'Muhasebe', '28', '₺243,00', ''],
];

function PageShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/15 text-violet-300 shadow-[0_0_28px_rgba(124,58,237,.18)]">
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-7 w-1 rounded-full bg-violet-500 shadow-[0_0_24px_rgba(139,92,246,.7)]" />
              <h1 className="text-2xl font-semibold tracking-normal text-slate-50">{title}</h1>
            </div>
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {action && (
          <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
            <Plus size={16} />
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: Metric[] }): ReactElement {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className={`min-h-[116px] rounded-xl p-5 ${surfaceClass}`}>
          <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
          <p className={`mt-3 text-3xl font-semibold ${variantText[metric.variant ?? 'blue']}`}>{metric.value}</p>
          {metric.hint && <p className="mt-2 text-sm text-slate-400">{metric.hint}</p>}
        </div>
      ))}
    </div>
  );
}

function Toolbar({ search = 'Ara', extra }: { search?: string; extra?: React.ReactNode }): ReactElement {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0a0f1e]/70 p-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input className="h-10 w-full rounded-lg border border-white/10 bg-[#050711]/80 pl-10 pr-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/70 focus:ring-4 focus:ring-violet-500/10" placeholder={search} />
      </div>
      <div className="flex flex-wrap gap-2">
        {extra}
        <GhostButton icon={<Filter size={15} />} label="Filtreler" />
        <GhostButton icon={<Columns3 size={15} />} label="Sutunlar" />
        <GhostButton icon={<Download size={15} />} label="Cikti Al" />
        <GhostButton icon={<RefreshCw size={15} />} label="Yenile" />
      </div>
    </div>
  );
}

function GhostButton({ icon, label }: { icon: ReactNode; label: string }): ReactElement {
  return (
    <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/[.02] px-4 text-sm font-medium text-slate-200 hover:border-violet-400/60 hover:bg-violet-500/10 hover:text-white">
      {icon}
      {label}
    </button>
  );
}

function DataTable({ columns, rows, dangerIndex }: { columns: string[]; rows: Row[]; dangerIndex?: number }): ReactElement {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#070a13]/72">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[.025] text-xs uppercase text-slate-300">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-4 font-semibold">{column}</th>
              ))}
              <th className="px-4 py-4 text-right font-semibold">Islem</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={`border-b border-white/10 last:border-b-0 ${dangerIndex === rowIndex ? 'bg-rose-500/16 text-rose-100' : 'text-slate-300 hover:bg-white/[.025]'}`}>
                {columns.map((column, columnIndex) => (
                  <td key={column} className={`px-4 py-3 ${columnIndex === 1 ? 'font-semibold text-slate-100' : ''}`}>
                    {renderCell(row[column])}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-slate-500">
                    <Edit3 size={16} />
                    {columns[0] !== 'TARIH' && <Trash2 size={16} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderCell(value: string | number | undefined): React.ReactNode {
  const text = String(value ?? '');
  if (['Musteri', 'Kesildi', 'Onaylandi', 'Yapildi', 'Aktif'].includes(text)) return <Badge tone="green">{text}</Badge>;
  if (['Tedarikci', 'Kesilecek', 'Siparise Dondu'].includes(text)) return <Badge tone="yellow">{text}</Badge>;
  if (['Taslak', 'Planlandi', 'Acik', 'Devam Ediyor', 'Bakimda'].includes(text)) return <Badge>{text}</Badge>;
  if (['Kritik', 'Hurda'].includes(text)) return <Badge tone="red">{text}</Badge>;
  return text;
}

function Badge({ children, tone = 'purple' }: { children: ReactNode; tone?: 'green' | 'yellow' | 'red' | 'purple' }): ReactElement {
  const classes = {
    green: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300',
    yellow: 'border-amber-400/50 bg-amber-500/10 text-amber-300',
    red: 'border-rose-400/50 bg-rose-500/10 text-rose-300',
    purple: 'border-violet-400/40 bg-violet-500/10 text-violet-200',
  };
  return <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${classes[tone]}`}>{children}</span>;
}

function rows(source: string[][], columns: string[]): Row[] {
  return source.map((item) => Object.fromEntries(columns.map((column, index) => [column, item[index]])));
}

function QuickActionsPanel(): ReactElement {
  const groups: Array<{ title: string; items: Array<{ label: string; icon: IconComponent; tone: string }> }> = [
    {
      title: 'Musteriler',
      items: [
        { label: 'Musteri Yonetimi', icon: UsersRound, tone: 'text-cyan-300' },
        { label: 'Potansiyel Cariler', icon: Sparkles, tone: 'text-pink-300' },
      ],
    },
    {
      title: 'Satis Hunisi',
      items: [
        { label: 'Yeni Teklif Olustur', icon: Plus, tone: 'text-violet-300' },
        { label: 'Teklif Listesi', icon: FileText, tone: 'text-violet-300' },
        { label: 'Yeni Fatura Olustur', icon: CreditCard, tone: 'text-pink-300' },
        { label: 'Satis Takip', icon: Columns3, tone: 'text-emerald-300' },
      ],
    },
    {
      title: 'Planlama',
      items: [
        { label: 'Haftalik Ziyaretler', icon: CalendarDays, tone: 'text-cyan-300' },
        { label: 'Acik Maddeler', icon: FileText, tone: 'text-violet-300' },
      ],
    },
  ];

  return (
    <div className="absolute right-0 top-14 z-30 w-[310px] rounded-2xl border border-white/10 bg-[#090c18]/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,.45)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Hizli Islemler</h2>
        <span className="text-lg leading-none text-slate-500">x</span>
      </div>
      <div className="space-y-4">
        {groups.map((group, groupIndex) => (
          <div key={group.title} className={groupIndex > 0 ? 'border-t border-white/10 pt-4' : ''}>
            <p className="mb-2 text-xs font-bold uppercase text-slate-600">{group.title}</p>
            <div className="space-y-2">
              {group.items.map(({ label, icon: Icon, tone }) => (
                <button key={label} className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm text-slate-200 transition hover:bg-white/[.04]">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/14 ${tone}`}>
                    <Icon size={17} />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListPage({
  title,
  subtitle,
  action,
  metrics,
  tableTitle,
  columns,
  data,
  dangerIndex,
}: {
  title: string;
  subtitle: string;
  action: string;
  metrics: Metric[];
  tableTitle: string;
  columns: string[];
  data: string[][];
  dangerIndex?: number;
}): ReactElement {
  return (
    <PageShell title={title} subtitle={subtitle} action={action}>
      <MetricGrid metrics={metrics} />
      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4">
        <h2 className="text-xl font-semibold">{tableTitle}</h2>
        <div className="mt-3"><Toolbar /></div>
        <div className="mt-4"><DataTable columns={columns} rows={rows(data, columns)} dangerIndex={dangerIndex} /></div>
      </section>
    </PageShell>
  );
}

export function SalesDeskDashboardPage(): ReactElement {
  const [quickOpen, setQuickOpen] = useState(false);

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Iyi Aksamlar, <span className="text-violet-400">Sistem Yoneticisi</span></h1>
          <p className="mt-4 flex items-center gap-2 text-slate-400"><CalendarDays size={16} /> 30.06.2026</p>
          <p className="mt-6 text-slate-500">Dashboard verileri yuklenemedi.</p>
        </div>
        <div className="relative flex gap-3">
          <GhostButton icon={<Edit3 size={15} />} label="Duzenle" />
          <button onClick={() => setQuickOpen((value) => !value)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/50 hover:bg-violet-400"><Sparkles size={16} /> Hizli Islemler</button>
          {quickOpen && <QuickActionsPanel />}
        </div>
      </div>
      <div className={`max-w-xl rounded-xl p-5 ${surfaceClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-violet-300" size={22} />
            <div>
              <h2 className="text-lg font-semibold">Yaklasan Toplantilar</h2>
              <p className="text-sm text-slate-400">Gmail'e dusen toplanti davetleri burada listelenir.</p>
            </div>
          </div>
          <GhostButton icon={<Mail size={15} />} label="Gmail'i Ac" />
        </div>
      </div>
    </div>
  );
}

export function SalesDeskCustomersPage(): ReactElement {
  return <ListPage title="Cari Yonetimi" subtitle="Gelismis filtre, sutun tercihi ve sayfalama ile cari listesi" action="Yeni Cari Ekle" metrics={[{ label: 'Toplam Cari', value: '7' }, { label: 'Musteri', value: '5', variant: 'green' }, { label: 'Tedarikci', value: '2', variant: 'yellow' }]} tableTitle="Cari Listesi" columns={['KOD', 'CARI ADI', 'YETKILI', 'TELEFON', 'E-POSTA', 'TIP', 'BAKIYE', 'IL']} data={customers} />;
}

export function SalesDeskPotentialsPage(): ReactElement {
  return <ListPage title="Potansiyel Cariler" subtitle="Gelismis filtre, sutun tercihi ve sayfalama ile potansiyel cari listesi" action="Potansiyel Ekle" metrics={[{ label: 'Toplam Potansiyel', value: '6' }, { label: 'Listelenen', value: '6' }, { label: 'Bu Sayfa', value: '6' }]} tableTitle="Potansiyel Cari Listesi" columns={['KOD', 'CARI ADI', 'YETKILI', 'TELEFON', 'E-POSTA', 'IL', 'ILCE']} data={potentials} />;
}

export function SalesDeskProductsPage(): ReactElement {
  return <ListPage title="Stok / Urunler" subtitle="Gelismis filtre, sutun tercihi ve sayfalama ile urun listesi" action="Yeni Urun Ekle" metrics={[{ label: 'Toplam Urun', value: '9' }, { label: 'Dusuk Stok', value: '1', variant: 'red' }, { label: 'Listelenen', value: '9' }]} tableTitle="Urun Listesi" columns={['KOD', 'URUN', 'KATEGORI', 'BIRIM', 'SATIS FIYATI', 'STOK', 'MIN. STOK']} data={products} dangerIndex={6} />;
}

export function SalesDeskProductCustomersPage(): ReactElement {
  return (
    <PageShell title="Urun Bazli Musteriler" subtitle="Urun secin; o urunle iliskili carileri ve potansiyel musterileri listeleyin">
      <MetricGrid metrics={[{ label: 'Urun', value: '9', hint: 'Stok karti' }, { label: 'Cari', value: '1', hint: 'Secili urunde', variant: 'green' }, { label: 'Potansiyel', value: '0', hint: 'Aday musteri', variant: 'pink' }]} />
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <section className={`rounded-xl p-4 ${surfaceClass}`}>
          <h2 className="text-lg font-semibold">Stok Listesi</h2>
          <div className="mt-3"><Toolbar search="Stok ara..." extra={<GhostButton icon={<RefreshCw size={15} />} label="Yenile" />} /></div>
          <DataTable columns={['KOD', 'URUN', 'KATEGORI']} rows={rows(products.slice(0, 6), ['KOD', 'URUN', 'KATEGORI'])} />
        </section>
        <section className={`rounded-xl p-4 ${surfaceClass}`}>
          <h2 className="text-lg font-semibold">Bagli Cariler</h2>
          <p className="mt-1 text-sm text-slate-400">Bulut Yedekleme 1TB: 1 cari, 0 potansiyel musteri.</p>
          <div className="mt-4"><DataTable columns={['KOD', 'CARI ADI', 'YETKILI', 'TELEFON', 'IL', 'ILCE']} rows={rows([['CR1005', 'Global Dijital A.S.', 'Zeynep Arslan', '0242 555 05...', 'Antalya', 'Muratpasa']], ['KOD', 'CARI ADI', 'YETKILI', 'TELEFON', 'IL', 'ILCE'])} /></div>
        </section>
      </div>
    </PageShell>
  );
}

export function SalesDeskQuotesPage(): ReactElement {
  return <ListPage title="Teklifler" subtitle="Teklif olusturma, PDF cikti, onizleme ve WhatsApp gonderimi" action="Yeni Teklif Ekle" metrics={[{ label: 'Toplam Teklif', value: '11' }, { label: 'Bekleyen', value: '5' }, { label: 'Onayli', value: '5', variant: 'green' }]} tableTitle="Teklif Listesi" columns={['TEKLIF NO', 'CARI', 'TARIH', 'DURUM', 'ARA TOPLAM', 'GENEL TOPLAM']} data={quotes} />;
}

export function SalesDeskInvoicesPage(): ReactElement {
  return <ListPage title="Faturalar" subtitle="Satis faturasi kesimi, vade takibi ve teklif donusumu" action="Yeni Fatura Ekle" metrics={[{ label: 'Toplam Fatura', value: '8' }, { label: 'Kesilecek', value: '3', variant: 'yellow' }, { label: 'Kesildi', value: '5', variant: 'green' }, { label: 'Vadesi Yakin', value: '1', variant: 'pink' }]} tableTitle="Fatura Listesi" columns={['FATURA NO', 'CARI', 'TARIH', 'VADE', 'DURUM', 'TOPLAM']} data={invoices} />;
}

export function SalesDeskSalesTrackingPage(): ReactElement {
  return (
    <PageShell title="Satis Takip" subtitle="Aylik performans, haftalik trend ve cari / urun bazli satis analizi">
      <MetricGrid metrics={[{ label: 'Aylik Satis', value: '₺168.192,00', hint: 'Kesilen faturalar toplami' }, { label: 'Cari & Urun', value: '4', hint: '4 cari - 2 urun', variant: 'green' }, { label: 'Onayli Teklif', value: '4', hint: 'Faturaya donusturulebilir', variant: 'green' }, { label: 'Siparise Donen', value: '1', variant: 'pink' }]} />
      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-5">
        <div className="flex items-center justify-between">
          <div><h2 className="text-lg font-semibold">Haftalik Satis Trendi</h2><p className="text-sm text-slate-400">Son haftalarda kesilen fatura tutarlari</p></div>
          <span className="text-sm text-violet-300">Kesilen fatura (TL)</span>
        </div>
        <div className="mt-5 h-72 rounded-lg bg-black/35 p-6">
          <svg viewBox="0 0 900 260" className="h-full w-full">
            <line x1="40" y1="190" x2="860" y2="190" stroke="rgba(255,255,255,.55)" />
            <line x1="40" y1="90" x2="860" y2="90" stroke="rgba(255,255,255,.55)" />
            <polyline fill="none" stroke="#7167ff" strokeWidth="4" points="70,175 200,65 330,190 470,190 610,190 750,190 850,190" />
            {['Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi', 'Pazar'].map((d, i) => <text key={d} x={70 + i * 130} y="245" fill="#64748b" fontSize="14">{d}</text>)}
          </svg>
        </div>
      </section>
    </PageShell>
  );
}

export function SalesDeskVisitsPage(): ReactElement {
  return <ListPage title="Haftalik Ziyaretler" subtitle="Planlanan ve tamamlanan musteri ziyaretleri" action="Yeni Ziyaret Ekle" metrics={[{ label: 'Bugun', value: '2' }, { label: 'Bu Hafta', value: '9' }, { label: 'Gecikmis', value: '2', variant: 'red' }, { label: 'Toplam', value: '9' }]} tableTitle="Ziyaret Listesi" columns={['TARIH', 'SAAT', 'BASLIK', 'CARI', 'TIP', 'DURUM']} data={visits} dangerIndex={0} />;
}

export function SalesDeskOpenItemsPage(): ReactElement {
  return <ListPage title="Acik Maddeler" subtitle="Takip edilmesi gereken is ve aksiyonlar" action="Yeni Madde Ekle" metrics={[{ label: 'Acik', value: '11' }, { label: 'Bugun Bitmeli', value: '0' }, { label: 'Gecikmis', value: '2', variant: 'red' }, { label: 'Kritik', value: '2', variant: 'red' }]} tableTitle="Madde Listesi" columns={['BASLIK', 'ONCELIK', 'DURUM', 'SON TARIH', 'CARI']} data={tasks} dangerIndex={1} />;
}

export function SalesDeskWeeklyPlanPage(): ReactElement {
  const groups = [
    ['Proje', tasks.slice(0, 4), 'border-l-rose-400'],
    ['Yazilim', tasks.slice(1, 5), 'border-l-violet-500'],
    ['Grupsuz', tasks.slice(2, 5), 'border-l-emerald-400'],
  ];
  return (
    <PageShell title="Haftalik Plan" subtitle="Acik isleri grupla, kisilere ata ve panoda takip et" action="Yeni Madde">
      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-lg font-semibold">29 Haziran - 05 Temmuz 2026</h2><p className="text-sm text-slate-400">12 acik is</p></div>
          <div className="flex rounded-lg bg-black/25 p-1"><button className="rounded-md px-5 py-2 text-sm text-slate-300">Tumu</button><button className="rounded-md bg-violet-500 px-5 py-2 text-sm font-semibold text-white">Gruba gore</button><button className="rounded-md px-5 py-2 text-sm text-slate-300">Duruma gore</button></div>
        </div>
      </section>
      <div className="grid gap-4 xl:grid-cols-3">
        {groups.map(([name, groupTasks, color]) => (
          <section key={String(name)} className="rounded-xl border border-white/8 bg-slate-900/35 p-4">
            <h3 className="mb-3 text-lg font-semibold">{String(name)}</h3>
            <div className="space-y-3">
              {(groupTasks as string[][]).map((task) => (
                <div key={task[0]} className={`rounded-lg border border-white/8 border-l-4 ${color} bg-slate-800/70 p-4`}>
                  <p className="font-semibold">{task[0]}</p>
                  <div className="mt-3 flex flex-wrap gap-2"><Badge>Atanmamis</Badge><Badge>{String(name)}</Badge><Badge>{task[2]}</Badge><Badge>{task[3]}</Badge></div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

export function SalesDeskVisitFormsPage(): ReactElement {
  return (
    <PageShell title="Ziyaret Formu" subtitle="Cari ziyaretlerini kayit altina al, PDF olustur, mail/WhatsApp ile gonder" action="Yeni Ziyaret Formu">
      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4 text-sm text-slate-300">2 ziyaret formu</section>
      {['efe', 'Delta Yazilim Ltd.'].map((name) => (
        <section key={name} className="flex flex-col gap-4 rounded-xl border border-white/8 bg-slate-900/35 p-5 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-lg font-semibold">{name} <Badge>29.06.2026</Badge></h2><p className="mt-2 text-violet-300">Ziyaret Formu - 29.06.2026</p><p className="text-slate-400">{name === 'efe' ? 'deneme 123' : 'Icerik girilmemis'}</p><p className="mt-2 text-sm text-slate-500">Sistem Yoneticisi</p></div>
          <div className="flex flex-wrap gap-2"><GhostButton icon={<FileText size={15} />} label="PDF" /><GhostButton icon={<Mail size={15} />} label="Mail" /><GhostButton icon={<Bell size={15} />} label="WhatsApp" /><GhostButton icon={<Edit3 size={15} />} label="" /></div>
        </section>
      ))}
    </PageShell>
  );
}

export function SalesDeskAssetsPage(): ReactElement {
  return <ListPage title="Demirbaslar" subtitle="Sirket uzerine kayitli sabit kiymetler ve alim kayitlari" action="Yeni Demirbas Ekle" metrics={[{ label: 'Toplam', value: '6' }, { label: 'Aktif', value: '4', variant: 'green' }, { label: 'Bakimda', value: '1', variant: 'yellow' }, { label: 'Hurda', value: '1', variant: 'red' }]} tableTitle="Demirbas Listesi" columns={['KOD', 'AD', 'KATEGORI', 'ALIS TARIHI', 'DEGER', 'DURUM']} data={assets} />;
}

export function SalesDeskPaymentsPage(): ReactElement {
  return <ListPage title="Standart Odemeler & Gelirler" subtitle="Aylik sabit gider ve gelir kalemlerini planlayin" action="Yeni Kalem Ekle" metrics={[{ label: 'Aylik Giderler', value: '₺29.943,00' }, { label: 'Aylik Gelirler', value: '₺12.500,00', variant: 'green' }, { label: 'Net Aylik', value: '-₺17.443,00', variant: 'red' }, { label: 'Yaklasan Odeme', value: '0' }]} tableTitle="Kalem Listesi" columns={['AD', 'TIP', 'KATEGORI', 'GUN', 'TUTAR', 'CARI']} data={payments} />;
}

export function SalesDeskSoftwareResearchPage(): ReactElement {
  return (
    <PageShell title="Yazilim Arastirma" subtitle="Potansiyel carileri Netsis, J-HR veya Logo kullanimi icin internette tarayin" action="Secili Cariyi Arastir">
      <MetricGrid metrics={[{ label: 'Toplam', value: '6' }, { label: 'Bekleyen', value: '0' }, { label: 'Bulunan', value: '0', variant: 'green' }, { label: 'Supheli', value: '0', variant: 'pink' }, { label: 'Guclu', value: '0', hint: 'Skor 80+', variant: 'yellow' }]} />
      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4">
        <h2 className="text-lg font-semibold">Netsis Arastirmasi</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px_220px]"><input className={fieldClass} placeholder="Anahtar Kelimeler" /><select className={fieldClass}><option>Skor 45+</option></select><select className={fieldClass}><option>Hepsi</option></select></div>
      </section>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4"><h2 className="text-lg font-semibold">Aday Kayitlari</h2><DataTable columns={['KOD', 'FIRMA', 'DURUM', 'SKOR', 'SON']} rows={rows([['POT001', 'Anadolu Lojistik Ltd.', 'Bulunamadi', '0', '30.06.2026'], ['PTC00...', 'deneme', 'Bulunamadi', '0', '30.06.2026']], ['KOD', 'FIRMA', 'DURUM', 'SKOR', 'SON'])} /></section>
        <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4"><h2 className="text-lg font-semibold">Arastirma Sonuclari</h2><DataTable columns={['FIRMA', 'DURUM', 'SKOR', 'HOST', 'KAYNAK']} rows={[]} /></section>
      </div>
    </PageShell>
  );
}

export function SalesDeskErpNewsPage(): ReactElement {
  return (
    <PageShell title="ERP Haber Takibi" subtitle="GIB, Netsis, IK ve ERP gundemi - RSS ve Gmail taramasi" action="Haberleri Yenile">
      <MetricGrid metrics={[{ label: 'Listelenen', value: '0' }, { label: 'Kritik', value: '0', hint: 'Puan 4+', variant: 'pink' }, { label: 'Bugun', value: '0', variant: 'green' }, { label: 'Gmail', value: '6', hint: '2 okunmamis' }, { label: 'Okunmamis', value: '0', hint: 'Haber', variant: 'yellow' }]} />
      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4"><h2 className="text-lg font-semibold">Netsis Haberleri</h2><Toolbar search="Arama Kelimesi" extra={<GhostButton icon={<Search size={15} />} label="Yazilim Arastir" />} /></section>
    </PageShell>
  );
}

export function SalesDeskGmailPage(): ReactElement {
  return (
    <PageShell title="Gmail" subtitle="Bagli Gmail hesabinizdan gelen kutusunu Sales Desk icinde goruntuleyin" action="Gelen Kutusunu Yenile">
      <MetricGrid metrics={[{ label: 'Toplam', value: '30' }, { label: 'Okunmamis', value: '17', variant: 'yellow' }, { label: 'Listelenen', value: '30', hint: 'Toplanti: 9', variant: 'green' }]} />
      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4"><h2 className="text-lg font-semibold">Gelen Kutusu</h2><Toolbar search="Gmail Arama Sorgusu" extra={<GhostButton icon={<Settings size={15} />} label="Gmail Ayarlari" />} /><div className="mt-4 grid gap-4 xl:grid-cols-2"><DataTable columns={['GONDEREN', 'KONU', 'TOPLANTI', 'TARIH', 'ONIZLEME']} rows={rows([['team@newsletter...', 'Gemini Omni...', '', '30.06.2026', 'Meet the...'], ['kayhan.akdog...', 'Davetiye: sql-...', '30.06...', '30.06.2026', 'sql-netsis...']], ['GONDEREN', 'KONU', 'TOPLANTI', 'TARIH', 'ONIZLEME'])} /><div className="rounded-xl border border-white/8 bg-black/20 p-4"><h3 className="font-semibold">E-posta Detayi</h3><p className="mt-4 text-sm text-slate-400">Gemini Omni Flash & Nano Banana 2 Lite are live on Artlist</p></div></div></section>
    </PageShell>
  );
}

export function SalesDeskSettingsPage(): ReactElement {
  return (
    <PageShell title="Sistem Ayarlari" subtitle="Gmail baglantisi ve kullanici yonetimi">
      <MetricGrid metrics={[{ label: 'Toplam Kullanici', value: '2' }, { label: 'Aktif', value: '2', variant: 'green' }, { label: 'Listelenen', value: '2' }, { label: 'Gmail', value: 'Bagli', hint: 'efe.alagoz@v3rii.com', variant: 'yellow' }]} />
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-white/8 bg-slate-900/35 p-5"><h2 className="text-lg font-semibold">Gmail Baglantisi</h2><label className="mt-4 flex gap-2 text-sm"><input type="checkbox" defaultChecked /> Gmail baglantisini etkinlestir</label><input className={`mt-4 w-full ${fieldClass}`} defaultValue="efe.alagoz@v3rii.com" /><input className={`mt-4 w-full ${fieldClass}`} defaultValue="bmbx icef wtub ppio" /><button className="mt-4 rounded-lg bg-violet-500 px-6 py-3 font-semibold">Kaydet</button></section>
        <section className="rounded-xl border border-white/8 bg-slate-900/35 p-5"><h2 className="text-lg font-semibold">Uygulama Bilgileri</h2><div className="mt-4 rounded-lg bg-black/30 p-4 text-sm text-slate-300"><p>Sirket: <b>V3RII TEKNOLOJI</b></p><p>Surum: 1.0.0</p><p>Veritabani: V3RII_SALES_DESK @ localhost</p></div><p className="mt-5 text-sm text-slate-400">Kullanici eklemek icin listedeki Yeni Kullanici butonunu kullanin.</p></section>
      </div>
    </PageShell>
  );
}

export function SalesDeskInvoiceCreatePage(): ReactElement {
  return (
    <PageShell title="Yeni Satis Faturasi" subtitle="FTR2026000009">
      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4"><GhostButton icon={<ChevronLeft size={15} />} label="Geri" /></section>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <section className="rounded-xl border border-white/8 bg-slate-900/35 p-5">
          <h2 className="font-semibold">1 Baslik Bilgileri</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2"><input className={fieldClass} placeholder="Musteri" /><input className={fieldClass} defaultValue="Sistem Yoneticisi" /></div>
          <div className="mt-5 grid gap-4 md:grid-cols-3"><Panel title="Tip & Tarihler" lines={['Fatura No: FTR2026000009', 'Fatura Tarihi: 30.06.2026', 'Vade Tarihi: 30.07.2026', 'Durum: Kesilecek']} /><Panel title="Tekliften Aktar" lines={['Onayli Teklif: -', 'Teklif Kalemlerini Yukle']} /><Panel title="Belge Aciklamasi" lines={['Notlar']} /></div>
        </section>
        <section className="rounded-xl border border-white/8 bg-slate-900/35 p-5"><h2 className="font-semibold">3 Ozet</h2><input className={`mt-4 w-full ${fieldClass}`} defaultValue="0" /><input className={`mt-4 w-full ${fieldClass}`} defaultValue="0" /><div className="mt-8 border-t border-white/10 pt-5 text-sm text-slate-400"><p>Ara Toplam <b className="float-right text-white">₺0,00</b></p><p className="mt-4">Toplam KDV <b className="float-right text-white">₺0,00</b></p><p className="mt-8 text-3xl font-semibold text-blue-300">₺0,00</p></div></section>
      </div>
    </PageShell>
  );
}

function Panel({ title, lines }: { title: string; lines: string[] }): ReactElement {
  return <div className="min-h-48 rounded-xl border border-white/8 bg-black/20 p-4"><h3 className="font-semibold">{title}</h3>{lines.map((line) => <p key={line} className="mt-4 text-sm text-slate-400">{line}</p>)}</div>;
}

export const salesDeskNavItems = [
  { title: 'Dashboard', href: '/', icon: <Home size={22} className="text-violet-300" /> },
  { title: 'Cari & Potansiyel', icon: <UsersRound size={22} className="text-cyan-300" />, defaultExpanded: true, children: [
    { title: 'Cari Yonetimi', href: '/salesdesk/customers' },
    { title: 'Potansiyel Cariler', href: '/salesdesk/potentials' },
  ] },
  { title: 'Stok & Urunler', icon: <ShoppingCart size={22} className="text-emerald-300" />, defaultExpanded: true, children: [
    { title: 'Stok / Urunler', href: '/salesdesk/products' },
    { title: 'Urun Bazli Musteriler', href: '/salesdesk/product-customers' },
  ] },
  { title: 'Satis & Finans', icon: <CreditCard size={22} className="text-pink-300" />, defaultExpanded: true, children: [
    { title: 'Teklifler', href: '/salesdesk/quotes' },
    { title: 'Faturalar', href: '/salesdesk/invoices' },
    { title: 'Yeni Satis Faturasi', href: '/salesdesk/invoices/new' },
    { title: 'Satis Takip', href: '/salesdesk/sales-tracking' },
  ] },
  { title: 'Operasyon', icon: <CalendarDays size={22} className="text-teal-300" />, defaultExpanded: true, children: [
    { title: 'Haftalik Ziyaretler', href: '/salesdesk/weekly-visits' },
    { title: 'Acik Maddeler', href: '/salesdesk/open-items' },
    { title: 'Haftalik Plan', href: '/salesdesk/weekly-plan' },
    { title: 'Ziyaret Formu', href: '/salesdesk/visit-forms' },
    { title: 'Demirbaslar', href: '/salesdesk/assets' },
    { title: 'Standart Odemeler', href: '/salesdesk/recurring-payments' },
  ] },
  { title: 'Araclar', icon: <Search size={22} className="text-yellow-300" />, defaultExpanded: true, children: [
    { title: 'Yazilim Arastirma', href: '/salesdesk/software-research' },
    { title: 'ERP Haber Takibi', href: '/salesdesk/erp-news' },
    { title: 'Gmail', href: '/salesdesk/gmail' },
  ] },
  { title: 'Sistem Ayarlari', href: '/salesdesk/settings', icon: <Settings size={22} className="text-slate-300" /> },
];
