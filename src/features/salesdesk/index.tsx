import {
  Building2,
  CalendarDays,
  CreditCard,
  FolderKanban,
  Home,
  Search,
  Settings,
  ShoppingCart,
  UserCog,
  UsersRound,
} from 'lucide-react';

export { SalesDeskCustomersPage } from './components/SalesDeskCustomersPage';
export { SalesDeskPotentialsPage } from './components/SalesDeskPotentialsPage';
export { SalesDeskDashboardPage } from './components/pages/SalesDeskDashboardPage';
export { SalesDeskProductsPage } from './components/pages/SalesDeskProductsPage';
export { SalesDeskProductCustomersPage } from './components/pages/SalesDeskProductCustomersPage';
export { SalesDeskQuotesPage } from './components/pages/SalesDeskQuotesPage';
export { SalesDeskQuoteCreatePage } from './components/pages/SalesDeskQuoteCreatePage';
export { SalesDeskInvoicesPage } from './components/pages/SalesDeskInvoicesPage';
export {
  SalesDeskInvoiceCreatePage,
  SalesDeskSalesInvoiceCreatePage,
  SalesDeskPurchaseInvoiceCreatePage,
} from './components/pages/SalesDeskInvoiceCreatePage';
export { SalesDeskSalesTrackingPage } from './components/pages/SalesDeskSalesTrackingPage';
export { SalesDeskVisitsPage } from './components/pages/SalesDeskVisitsPage';
export { SalesDeskOpenItemsPage } from './components/pages/SalesDeskOpenItemsPage';
export { SalesDeskActivitiesPage } from './components/pages/SalesDeskActivitiesPage';
export { SalesDeskProjeTakibiPage } from './components/pages/SalesDeskProjeTakibiPage';
export { SalesDeskWeeklyPlanPage } from './components/pages/SalesDeskWeeklyPlanPage';
export { SalesDeskVisitFormsPage } from './components/pages/SalesDeskVisitFormsPage';
export {
  SalesDeskVisitFormCreatePage,
  SalesDeskVisitFormEditPage,
} from './components/pages/SalesDeskVisitFormEditorPage';
export { SalesDeskAssetsPage } from './components/pages/SalesDeskAssetsPage';
export { SalesDeskPaymentsPage } from './components/pages/SalesDeskPaymentsPage';
export { SalesDeskSoftwareResearchPage } from './components/pages/SalesDeskSoftwareResearchPage';
export {
  SalesDeskSoftwareResearchCreatePage,
  SalesDeskSoftwareResearchEditPage,
} from './components/pages/SalesDeskSoftwareResearchEditorPage';
export { SalesDeskErpNewsPage } from './components/pages/SalesDeskErpNewsPage';
export {
  SalesDeskErpNewsCreatePage,
  SalesDeskErpNewsEditPage,
} from './components/pages/SalesDeskErpNewsEditorPage';
export { SalesDeskGmailPage } from './components/pages/SalesDeskGmailPage';
export { SalesDeskSettingsPage } from './components/pages/SalesDeskSettingsPage';
export { SalesDeskGroupsPage } from './components/pages/SalesDeskGroupsPage';
export { SalesDeskCompaniesPage } from './components/pages/SalesDeskCompaniesPage';
export { SalesDeskNotesPage } from './components/pages/SalesDeskNotesPage';

export const salesDeskNavItems = [
  { title: 'Ana Sayfa', href: '/', icon: <Home size={22} className="text-slate-400" /> },
  {
    title: 'Cari & Musteri',
    icon: <UsersRound size={22} className="text-slate-400" />,
    defaultExpanded: true,
    children: [
      { title: 'Cari Yonetimi', href: '/salesdesk/customers' },
      { title: 'Potansiyel Cariler', href: '/salesdesk/potentials' },
      { title: 'Sirket Yonetimi', href: '/salesdesk/companies' },
    ],
  },
  {
    title: 'Urun & Stok',
    icon: <ShoppingCart size={22} className="text-emerald-300" />,
    children: [
      { title: 'Stok / Urunler', href: '/salesdesk/products' },
      { title: 'Urun-Cari Baglantilari', href: '/salesdesk/product-customers' },
    ],
  },
  {
    title: 'Satis & Finans',
    icon: <CreditCard size={22} className="text-slate-400" />,
    defaultExpanded: true,
    children: [
      { title: 'Teklifler', href: '/salesdesk/quotes' },
      { title: 'Faturalar', href: '/salesdesk/invoices' },
      { title: 'Satis Takip', href: '/salesdesk/sales-tracking' },
    ],
  },
  {
    title: 'Operasyon',
    icon: <CalendarDays size={22} className="text-slate-400" />,
    children: [
      { title: 'Haftalik Ziyaretler', href: '/salesdesk/weekly-visits' },
      { title: 'Aktiviteler', href: '/salesdesk/activities' },
      { title: 'Notlar', href: '/salesdesk/notes' },
      { title: 'Haftalik Plan', href: '/salesdesk/weekly-plan' },
      { title: 'Acik Maddeler', href: '/salesdesk/open-items' },
      { title: 'Ziyaret Formlari', href: '/salesdesk/visit-forms' },
    ],
  },
  {
    title: 'Proje Yonetimi',
    icon: <FolderKanban size={22} className="text-violet-300" />,
    children: [{ title: 'Proje Takibi', href: '/salesdesk/proje-takibi' }],
  },
  {
    title: 'Finans & Demirbas',
    icon: <Building2 size={22} className="text-sky-300" />,
    children: [
      { title: 'Demirbaslar', href: '/salesdesk/assets' },
      { title: 'Standart Odemeler', href: '/salesdesk/recurring-payments' },
    ],
  },
  {
    title: 'Araclar',
    icon: <Search size={22} className="text-yellow-300" />,
    children: [
      { title: 'Yazilim Arastirma', href: '/salesdesk/software-research' },
      { title: 'ERP Haber Takibi', href: '/salesdesk/erp-news' },
      { title: 'Gmail', href: '/salesdesk/gmail' },
    ],
  },
  {
    title: 'Ekip & Yetki',
    icon: <UserCog size={22} className="text-violet-300" />,
    children: [
      { title: 'Grup Yonetimi', href: '/salesdesk/groups' },
      { title: 'Kullanici Yonetimi', href: '/user-management' },
      { title: 'Kullanici Yetkileri', href: '/access-control/user-authorization' },
    ],
  },
  { title: 'Sistem Ayarlari', href: '/salesdesk/settings', icon: <Settings size={22} className="text-slate-300" /> },
];
