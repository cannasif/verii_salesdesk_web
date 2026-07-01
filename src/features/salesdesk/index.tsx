import {
  CalendarDays,
  CreditCard,
  Home,
  Search,
  Settings,
  ShoppingCart,
  UsersRound,
} from 'lucide-react';

export { SalesDeskCustomersPage } from './components/SalesDeskCustomersPage';
export { SalesDeskPotentialsPage } from './components/SalesDeskPotentialsPage';
export { SalesDeskDashboardPage } from './components/pages/SalesDeskDashboardPage';
export { SalesDeskProductsPage } from './components/pages/SalesDeskProductsPage';
export { SalesDeskProductCustomersPage } from './components/pages/SalesDeskProductCustomersPage';
export { SalesDeskQuotesPage } from './components/pages/SalesDeskQuotesPage';
export { SalesDeskInvoicesPage } from './components/pages/SalesDeskInvoicesPage';
export { SalesDeskInvoiceCreatePage } from './components/pages/SalesDeskInvoiceCreatePage';
export { SalesDeskSalesTrackingPage } from './components/pages/SalesDeskSalesTrackingPage';
export { SalesDeskVisitsPage } from './components/pages/SalesDeskVisitsPage';
export { SalesDeskOpenItemsPage } from './components/pages/SalesDeskOpenItemsPage';
export { SalesDeskWeeklyPlanPage } from './components/pages/SalesDeskWeeklyPlanPage';
export { SalesDeskVisitFormsPage } from './components/pages/SalesDeskVisitFormsPage';
export { SalesDeskAssetsPage } from './components/pages/SalesDeskAssetsPage';
export { SalesDeskPaymentsPage } from './components/pages/SalesDeskPaymentsPage';
export { SalesDeskSoftwareResearchPage } from './components/pages/SalesDeskSoftwareResearchPage';
export { SalesDeskErpNewsPage } from './components/pages/SalesDeskErpNewsPage';
export { SalesDeskGmailPage } from './components/pages/SalesDeskGmailPage';
export { SalesDeskSettingsPage } from './components/pages/SalesDeskSettingsPage';

export const salesDeskNavItems = [
  { title: 'Dashboard', href: '/', icon: <Home size={22} className="text-slate-400" /> },
  {
    title: 'Cari & Potansiyel',
    icon: <UsersRound size={22} className="text-slate-400" />,
    defaultExpanded: true,
    children: [
      { title: 'Cari Yonetimi', href: '/salesdesk/customers' },
      { title: 'Potansiyel Cariler', href: '/salesdesk/potentials' },
    ],
  },
  {
    title: 'Stok & Urunler',
    icon: <ShoppingCart size={22} className="text-emerald-300" />,
    defaultExpanded: true,
    children: [
      { title: 'Stok / Urunler', href: '/salesdesk/products' },
      { title: 'Urun Bazli Musteriler', href: '/salesdesk/product-customers' },
    ],
  },
  {
    title: 'Satis & Finans',
    icon: <CreditCard size={22} className="text-slate-400" />,
    defaultExpanded: true,
    children: [
      { title: 'Teklifler', href: '/salesdesk/quotes' },
      { title: 'Faturalar', href: '/salesdesk/invoices' },
      { title: 'Yeni Satis Faturasi', href: '/salesdesk/invoices/new' },
      { title: 'Satis Takip', href: '/salesdesk/sales-tracking' },
    ],
  },
  {
    title: 'Operasyon',
    icon: <CalendarDays size={22} className="text-slate-400" />,
    defaultExpanded: true,
    children: [
      { title: 'Haftalik Ziyaretler', href: '/salesdesk/weekly-visits' },
      { title: 'Acik Maddeler', href: '/salesdesk/open-items' },
      { title: 'Haftalik Plan', href: '/salesdesk/weekly-plan' },
      { title: 'Ziyaret Formu', href: '/salesdesk/visit-forms' },
      { title: 'Demirbaslar', href: '/salesdesk/assets' },
      { title: 'Standart Odemeler', href: '/salesdesk/recurring-payments' },
    ],
  },
  {
    title: 'Araclar',
    icon: <Search size={22} className="text-yellow-300" />,
    defaultExpanded: true,
    children: [
      { title: 'Yazilim Arastirma', href: '/salesdesk/software-research' },
      { title: 'ERP Haber Takibi', href: '/salesdesk/erp-news' },
      { title: 'Gmail', href: '/salesdesk/gmail' },
    ],
  },
  { title: 'Sistem Ayarlari', href: '/salesdesk/settings', icon: <Settings size={22} className="text-slate-300" /> },
];
